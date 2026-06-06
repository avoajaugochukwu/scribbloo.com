/**
 * One-time migration: pull the blog out of Notion into local MDX files.
 *
 * For each page in the Notion blog database with Status == 'Done':
 *   - read properties (defensively),
 *   - convert the body to Markdown via notion-to-md,
 *   - download the featured image + any inline Notion-hosted images BEFORE the
 *     S3 URLs expire, rewriting markdown image URLs to local paths,
 *   - write content/blog/<slug>.mdx with validated frontmatter.
 *
 * Idempotent: skips existing posts unless --force is passed.
 *
 * Run: node --import tsx scripts/migrate-from-notion.ts [--force]
 *
 * NOTE: plain Node ESM script — do NOT import server-only.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';

import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  GetPageResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import matter from 'gray-matter';
import sharp from 'sharp';

import { slugify } from '../lib/slug';
import { blogPostFrontmatterSchema } from '../lib/content/types';

// Built-in env loader (Node 22+). Secrets live in .env (gitignored).
process.loadEnvFile('.env');

/* -------------------------------------------------------------------------- */
/* Config + paths                                                             */
/* -------------------------------------------------------------------------- */

const FORCE = process.argv.includes('--force');

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const BLOG_CONTENT_DIR = path.join(REPO_ROOT, 'content', 'blog');
const BLOG_IMAGES_DIR = path.join(REPO_ROOT, 'public', 'images', 'blog');
const REPORT_PATH = path.join(REPO_ROOT, 'notion-migration-report.json');

const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) throw new Error('Missing NOTION_API_KEY in .env');
if (!DATABASE_ID) throw new Error('Missing NOTION_DATABASE_ID in .env');

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

/** Hosts whose URLs are time-limited and therefore must be downloaded locally. */
const EXPIRING_HOST_RE =
  /(prod-files-secure\.s3|s3\.[a-z0-9-]+\.amazonaws\.com|amazonaws\.com|secure\.notion-static\.com|file\.notion\.so|notion\.so\/.*\.amazonaws)/i;

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

interface ImageResult {
  url: string;
  localPath: string | null;
  ok: boolean;
  error?: string;
}

interface PostReport {
  slug: string;
  title: string;
  pageId: string;
  status: 'migrated' | 'skipped-exists' | 'failed';
  featuredImage: ImageResult | null;
  inlineImages: ImageResult[];
  unconvertedBlockTypes: string[];
  error?: string;
}

interface MigrationReport {
  generatedAt: string;
  force: boolean;
  databaseId: string;
  counts: {
    pagesFound: number;
    migrated: number;
    skipped: number;
    failed: number;
    featuredImagesDownloaded: number;
    inlineImagesDownloaded: number;
    imageFailures: number;
  };
  posts: PostReport[];
}

/* -------------------------------------------------------------------------- */
/* Notion property helpers (all defensive)                                    */
/* -------------------------------------------------------------------------- */

type Props = PageObjectResponse['properties'];

function richTextToPlain(rt: Array<{ plain_text?: string }> | undefined): string {
  if (!rt || !Array.isArray(rt)) return '';
  return rt.map((t) => t.plain_text ?? '').join('').trim();
}

function getProp(props: Props, name: string): Props[string] | undefined {
  return props[name];
}

function readTitle(props: Props): string {
  for (const value of Object.values(props)) {
    if (value?.type === 'title') return richTextToPlain(value.title);
  }
  return '';
}

function readRichText(props: Props, name: string): string {
  const p = getProp(props, name);
  if (p?.type === 'rich_text') return richTextToPlain(p.rich_text);
  if (p?.type === 'title') return richTextToPlain(p.title);
  return '';
}

function readMultiSelect(props: Props, name: string): string[] {
  const p = getProp(props, name);
  if (p?.type === 'multi_select') {
    return p.multi_select.map((o) => o.name).filter(Boolean);
  }
  return [];
}

/** Author can be `people` or `rich_text`; fall back to plain text / name. */
function readAuthor(props: Props, name: string): string | null {
  const p = getProp(props, name);
  if (!p) return null;
  if (p.type === 'people') {
    const names = p.people
      .map((person) => ('name' in person ? person.name : undefined))
      .filter((x): x is string => Boolean(x));
    return names.length ? names.join(', ') : null;
  }
  if (p.type === 'rich_text') {
    const text = richTextToPlain(p.rich_text);
    return text || null;
  }
  if (p.type === 'created_by' && 'name' in p.created_by) {
    return p.created_by.name ?? null;
  }
  return null;
}

/** Featured Image: `files` property → first file's url (file or external). */
function readFeaturedImageUrl(props: Props, name: string): string | null {
  const p = getProp(props, name);
  if (p?.type === 'files' && p.files.length) {
    const first = p.files[0];
    if (first.type === 'file') return first.file.url;
    if (first.type === 'external') return first.external.url;
  }
  return null;
}

/** publishedAt: prefer a `Created` date property, else the page's created_time. */
function readPublishedAt(props: Props, page: PageObjectResponse): string | null {
  const p = getProp(props, 'Created');
  if (p?.type === 'date' && p.date?.start) return new Date(p.date.start).toISOString();
  if (p?.type === 'created_time') return new Date(p.created_time).toISOString();
  // try any date/created_time property as a fallback
  for (const value of Object.values(props)) {
    if (value?.type === 'created_time') return new Date(value.created_time).toISOString();
    if (value?.type === 'date' && value.date?.start)
      return new Date(value.date.start).toISOString();
  }
  if (page.created_time) return new Date(page.created_time).toISOString();
  return null;
}

function readStatus(props: Props): string {
  for (const value of Object.values(props)) {
    if (value?.type === 'status') return value.status?.name ?? 'Done';
    if (value?.type === 'select' && /status/i.test('')) return value.select?.name ?? 'Done';
  }
  return 'Done';
}

/* -------------------------------------------------------------------------- */
/* Image download + processing                                                */
/* -------------------------------------------------------------------------- */

function extFromUrl(url: string, fallback = 'png'): string {
  try {
    const clean = new URL(url).pathname;
    const ext = path.extname(clean).replace('.', '').toLowerCase();
    if (ext && /^[a-z0-9]{2,5}$/.test(ext)) return ext;
  } catch {
    /* ignore */
  }
  return fallback;
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

/**
 * Download the featured image to featured-original.<ext>, then produce
 * featured.webp (resize width 1600 withoutEnlargement, webp quality 90).
 */
async function downloadFeatured(url: string, slug: string): Promise<ImageResult> {
  const dir = path.join(BLOG_IMAGES_DIR, slug);
  try {
    await fs.mkdir(dir, { recursive: true });
    const ext = extFromUrl(url, 'png');
    const buf = await downloadBuffer(url);
    const originalPath = path.join(dir, `featured-original.${ext}`);
    await fs.writeFile(originalPath, buf);

    const webpPath = path.join(dir, 'featured.webp');
    await sharp(buf)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(webpPath);

    return { url, localPath: '/images/blog/' + slug + '/featured.webp', ok: true };
  } catch (err) {
    return { url, localPath: null, ok: false, error: String(err instanceof Error ? err.message : err) };
  }
}

/** Download an inline image to inline-<n>.<ext>; returns the public path on success. */
async function downloadInline(url: string, slug: string, n: number): Promise<ImageResult> {
  const dir = path.join(BLOG_IMAGES_DIR, slug);
  try {
    await fs.mkdir(dir, { recursive: true });
    const ext = extFromUrl(url, 'png');
    const buf = await downloadBuffer(url);
    const filename = `inline-${n}.${ext}`;
    await fs.writeFile(path.join(dir, filename), buf);
    return { url, localPath: `/images/blog/${slug}/${filename}`, ok: true };
  } catch (err) {
    return { url, localPath: null, ok: false, error: String(err instanceof Error ? err.message : err) };
  }
}

/* -------------------------------------------------------------------------- */
/* Markdown image rewriting                                                   */
/* -------------------------------------------------------------------------- */

// Matches markdown images: ![alt](url "title")
const MD_IMAGE_RE = /!\[([^\]]*)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
// Matches bare URLs inside markdown links / bookmarks: [text](url)
const MD_LINK_RE = /\[([^\]]*)\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;

function stripAngle(u: string): string {
  return u.startsWith('<') && u.endsWith('>') ? u.slice(1, -1) : u;
}

/**
 * Find every Notion-hosted (expiring) image URL in markdown, download it, and
 * rewrite the markdown to point at the local path. Also handles expiring URLs
 * inside plain markdown links (e.g. notion-to-md bookmark/file blocks).
 */
async function rewriteExpiringImages(
  markdown: string,
  slug: string,
): Promise<{ markdown: string; results: ImageResult[] }> {
  const results: ImageResult[] = [];
  const replacements = new Map<string, string>(); // original url -> local path
  let counter = 0;

  // 1) markdown images
  const imageUrls = new Set<string>();
  for (const m of markdown.matchAll(MD_IMAGE_RE)) {
    const url = stripAngle(m[2]);
    if (EXPIRING_HOST_RE.test(url)) imageUrls.add(url);
  }
  // 2) link-style file/bookmark URLs that are Notion-hosted + look like assets
  for (const m of markdown.matchAll(MD_LINK_RE)) {
    const url = stripAngle(m[2]);
    if (EXPIRING_HOST_RE.test(url)) imageUrls.add(url);
  }

  for (const url of imageUrls) {
    counter += 1;
    const res = await downloadInline(url, slug, counter);
    results.push(res);
    if (res.ok && res.localPath) replacements.set(url, res.localPath);
  }

  // Rewrite all occurrences of each downloaded URL with its local path.
  let out = markdown;
  for (const [orig, local] of replacements) {
    // Replace both <url> and url forms; escape regex special chars.
    const escaped = orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp('<' + escaped + '>', 'g'), local);
    out = out.replace(new RegExp(escaped, 'g'), local);
  }

  return { markdown: out, results };
}

/* -------------------------------------------------------------------------- */
/* Notion fetch (paginated)                                                    */
/* -------------------------------------------------------------------------- */

async function fetchAllDonePages(): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;
  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      filter: { property: 'Status', status: { equals: 'Done' } },
      start_cursor: cursor,
    });
    for (const r of response.results) {
      if ('properties' in r) pages.push(r as PageObjectResponse);
    }
    cursor = response.next_cursor ?? undefined;
  } while (cursor);
  return pages;
}

function isFullPage(p: GetPageResponse): p is PageObjectResponse {
  return 'properties' in p;
}

/* -------------------------------------------------------------------------- */
/* Per-page migration                                                          */
/* -------------------------------------------------------------------------- */

async function migratePage(page: PageObjectResponse): Promise<PostReport> {
  const props = page.properties;
  const title = readTitle(props) || 'Untitled';
  const slugProp = readRichText(props, 'Slug');
  const slug = slugProp ? slugProp : slugify(title);

  const report: PostReport = {
    slug,
    title,
    pageId: page.id,
    status: 'migrated',
    featuredImage: null,
    inlineImages: [],
    unconvertedBlockTypes: [],
  };

  const outFile = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);

  // Idempotency
  if (!FORCE) {
    try {
      await fs.access(outFile);
      report.status = 'skipped-exists';
      return report;
    } catch {
      /* does not exist — proceed */
    }
  }

  try {
    // 1) Convert body to markdown
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    report.unconvertedBlockTypes = collectUnsupported(mdBlocks);
    const mdString = n2m.toMarkdownString(mdBlocks);
    let body = (mdString?.parent ?? '').trim();

    // 2) Download inline images + rewrite markdown
    const { markdown: rewritten, results } = await rewriteExpiringImages(body, slug);
    body = rewritten;
    report.inlineImages = results;

    // 3) Featured image
    let featuredImage: string | null = null;
    const featuredUrl = readFeaturedImageUrl(props, 'Featured Image');
    if (featuredUrl) {
      const fr = await downloadFeatured(featuredUrl, slug);
      report.featuredImage = fr;
      if (fr.ok) featuredImage = 'featured.webp';
    }

    // 4) Frontmatter (validated)
    const excerpt = readRichText(props, 'Excerpt') || null;
    const metaDescription = readRichText(props, 'Meta Description') || null;
    const author = readAuthor(props, 'Author');
    const tags = readMultiSelect(props, 'Tags');
    const publishedAt = readPublishedAt(props, page);
    const status = readStatus(props) || 'Done';

    const frontmatter = blogPostFrontmatterSchema.parse({
      slug,
      title,
      excerpt,
      metaDescription,
      author,
      tags,
      featuredImage,
      publishedAt,
      status,
      relatedCategories: [],
      relatedPages: [],
    });

    // 5) Write MDX
    await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true });
    const fileContents = matter.stringify(body ? body + '\n' : '', frontmatter);
    await fs.writeFile(outFile, fileContents, 'utf8');

    report.status = 'migrated';
    return report;
  } catch (err) {
    report.status = 'failed';
    report.error = String(err instanceof Error ? err.stack ?? err.message : err);
    return report;
  }
}

/**
 * Block types that notion-to-md converts to markdown text/structure and whose
 * output is legitimately allowed to be empty (e.g. an empty paragraph is just a
 * blank line). These should NOT be reported as needing manual review.
 */
const KNOWN_TEXTUAL_BLOCKS = new Set([
  'paragraph',
  'heading_1',
  'heading_2',
  'heading_3',
  'bulleted_list_item',
  'numbered_list_item',
  'to_do',
  'quote',
  'callout',
  'code',
  'divider',
  'toggle',
  'table',
  'table_row',
  'column_list',
  'column',
  'image',
  'video',
  'file',
  'pdf',
  'bookmark',
  'embed',
  'equation',
  'link_to_page',
  'synced_block',
  'table_of_contents',
  'breadcrumb',
  'child_page',
  'child_database',
  'link_preview',
  'audio',
]);

/**
 * Walk notion-to-md's block tree and collect block types that notion-to-md
 * could not convert: the explicit `unsupported` type, or any type not in the
 * known-handled set (which would silently produce empty markdown). Empty but
 * known-textual blocks (e.g. blank paragraphs) are NOT flagged.
 */
function collectUnsupported(blocks: MdBlockLike[]): string[] {
  const unsupported = new Set<string>();
  const walk = (list: MdBlockLike[]) => {
    for (const b of list) {
      if (b.type === 'unsupported') {
        unsupported.add('unsupported');
      } else if (b.type && !KNOWN_TEXTUAL_BLOCKS.has(b.type)) {
        unsupported.add(b.type);
      }
      if (Array.isArray(b.children) && b.children.length > 0) {
        walk(b.children as MdBlockLike[]);
      }
    }
  };
  walk(blocks);
  return [...unsupported];
}

interface MdBlockLike {
  type?: string;
  parent?: string;
  children?: unknown[];
}

/* -------------------------------------------------------------------------- */
/* gitignore                                                                   */
/* -------------------------------------------------------------------------- */

async function ensureGitignored(entry: string): Promise<void> {
  const gitignorePath = path.join(REPO_ROOT, '.gitignore');
  let contents = '';
  try {
    contents = await fs.readFile(gitignorePath, 'utf8');
  } catch {
    /* no .gitignore yet */
  }
  const lines = contents.split('\n').map((l) => l.trim());
  if (lines.includes(entry)) return;
  const suffix = contents.endsWith('\n') || contents === '' ? '' : '\n';
  await fs.writeFile(
    gitignorePath,
    contents + suffix + `\n# notion migration report\n${entry}\n`,
    'utf8',
  );
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  console.log(`\n[migrate-from-notion] force=${FORCE} db=${DATABASE_ID}`);
  await fs.mkdir(BLOG_CONTENT_DIR, { recursive: true });
  await fs.mkdir(BLOG_IMAGES_DIR, { recursive: true });
  await ensureGitignored('/notion-migration-report.json');

  const pages = await fetchAllDonePages();
  console.log(`[migrate-from-notion] found ${pages.length} 'Done' pages`);

  const posts: PostReport[] = [];
  for (const page of pages) {
    if (!isFullPage(page)) continue;
    const r = await migratePage(page);
    posts.push(r);
    const featuredNote = r.featuredImage
      ? r.featuredImage.ok
        ? ' +featured'
        : ' featured:FAILED'
      : '';
    const inlineOk = r.inlineImages.filter((i) => i.ok).length;
    const inlineFail = r.inlineImages.length - inlineOk;
    console.log(
      `  [${r.status}] ${r.slug}${featuredNote} inline:${inlineOk}` +
        (inlineFail ? `/FAILED:${inlineFail}` : '') +
        (r.unconvertedBlockTypes.length ? ` unsupported:[${r.unconvertedBlockTypes.join(',')}]` : '') +
        (r.error ? `\n      ERROR: ${r.error.split('\n')[0]}` : ''),
    );
  }

  const featuredImagesDownloaded = posts.filter((p) => p.featuredImage?.ok).length;
  const inlineImagesDownloaded = posts.reduce(
    (acc, p) => acc + p.inlineImages.filter((i) => i.ok).length,
    0,
  );
  const imageFailures =
    posts.filter((p) => p.featuredImage && !p.featuredImage.ok).length +
    posts.reduce((acc, p) => acc + p.inlineImages.filter((i) => !i.ok).length, 0);

  const report: MigrationReport = {
    generatedAt: new Date().toISOString(),
    force: FORCE,
    databaseId: DATABASE_ID!,
    counts: {
      pagesFound: pages.length,
      migrated: posts.filter((p) => p.status === 'migrated').length,
      skipped: posts.filter((p) => p.status === 'skipped-exists').length,
      failed: posts.filter((p) => p.status === 'failed').length,
      featuredImagesDownloaded,
      inlineImagesDownloaded,
      imageFailures,
    },
    posts,
  };

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n[migrate-from-notion] SUMMARY');
  console.log(`  pages found:      ${report.counts.pagesFound}`);
  console.log(`  migrated:         ${report.counts.migrated}`);
  console.log(`  skipped (exists): ${report.counts.skipped}`);
  console.log(`  failed:           ${report.counts.failed}`);
  console.log(`  featured images:  ${report.counts.featuredImagesDownloaded}`);
  console.log(`  inline images:    ${report.counts.inlineImagesDownloaded}`);
  console.log(`  image failures:   ${report.counts.imageFailures}`);
  console.log(`  report:           ${REPORT_PATH}\n`);

  const needsReview = posts.filter(
    (p) => p.status === 'failed' || p.unconvertedBlockTypes.length > 0,
  );
  if (needsReview.length) {
    console.log('[migrate-from-notion] NEEDS MANUAL REVIEW:');
    for (const p of needsReview) {
      console.log(
        `  - ${p.slug}: ${p.status}` +
          (p.unconvertedBlockTypes.length
            ? ` unsupported=[${p.unconvertedBlockTypes.join(',')}]`
            : ''),
      );
    }
  }
}

main().catch((err) => {
  console.error('[migrate-from-notion] FATAL', err);
  process.exit(1);
});
