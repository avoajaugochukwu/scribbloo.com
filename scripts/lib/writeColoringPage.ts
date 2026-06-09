/**
 * Shared content writers for the fal.ai generation pipeline (and any future
 * programmatic content creation).
 *
 * FOLDER MODEL (url-structure-guide.md): a leaf lives in its collection folder —
 *   content/coloring-pages/<subject path>/<slug>.mdx
 * and a collection is a folder with an `_category.mdx`. There is NO `categories`
 * array and NO `content/categories/` directory anymore. These writers REFUSE to
 * create a leaf outside a real collection (a folder with `_category.mdx`), so an
 * automated run cannot silently resurrect the old flat layout.
 *
 * On-disk image layout (owned here, see lib/images.ts):
 *   public/images/coloring-pages/<slug>-coloring-page/{original.png,full.webp,thumb.webp}
 *   public/images/categories/<slug>/{hero.webp,thumb.webp}
 * (coloring-page original.png is served as the printable; category/article originals
 *  are NOT served, so they're derived in-memory and never persisted.)
 *
 * Frontmatter is always validated by the zod schemas in `lib/content/types.ts`.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import matter from 'gray-matter';

import {
  categorySchema,
  coloringPageSchema,
  type Category,
  type SeoDetails,
} from '@/lib/content/types';

/* -------------------------------------------------------------------------- */
/* Paths                                                                       */
/* -------------------------------------------------------------------------- */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Repo root is two levels up from scripts/lib/. */
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const COLORING_PAGES_CONTENT_DIR = path.join(REPO_ROOT, 'content', 'coloring-pages');
const COLORING_PAGE_IMAGES_DIR = path.join(REPO_ROOT, 'public', 'images', 'coloring-pages');
const CATEGORY_IMAGES_DIR = path.join(REPO_ROOT, 'public', 'images', 'categories');

export const paths = {
  REPO_ROOT,
  COLORING_PAGES_CONTENT_DIR,
  COLORING_PAGE_IMAGES_DIR,
  CATEGORY_IMAGES_DIR,
};

/** Folder path → absolute dir under content/coloring-pages, with traversal guard. */
function collectionDir(subjectPath: string): string {
  const parts = subjectPath.split('/').filter(Boolean);
  if (!parts.length || parts.some((p) => p === '.' || p === '..')) {
    throw new Error(`Invalid subject path "${subjectPath}"`);
  }
  return path.join(COLORING_PAGES_CONTENT_DIR, ...parts);
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Resolve an image input (raw bytes or a local file path) to a Buffer. */
async function resolveImageBuffer(input: Buffer | string): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input;
  return fs.readFile(input);
}

/* -------------------------------------------------------------------------- */
/* Coloring page writer                                                        */
/* -------------------------------------------------------------------------- */

export interface WriteColoringPageInput {
  slug: string;
  title: string;
  description?: string | null;
  /**
   * The collection folder this leaf belongs to, e.g. "animals" or
   * "fantasy/unicorn". The leaf is written to
   * content/coloring-pages/<subject>/<slug>.mdx. That folder MUST already be a
   * collection (contain `_category.mdx`) or this throws — this is the guard that
   * stops an automated run from creating leaves in the wrong place.
   */
  subject: string;
  tags: string[];
  source: 'fal' | 'grok' | 'supabase-migration' | 'manual';
  /** fal request id (fal hosts Grok too, so the Grok request id lives here). */
  falRequestId?: string;
  /** composition the page was framed for — see scripts/lib/frameA4.ts. */
  layout?: 'full' | 'bleed';
  /** the full descriptive prompt used to generate this page (stored for regen). */
  prompt?: string;
  /** the look-version this page was generated at (see STYLE_VERSION in lib/fal.ts). */
  styleVersion?: number;
  relatedPosts?: string[];
  needsRegen?: boolean;
  /** Buffer of the original image bytes OR a local file path. */
  image: Buffer | string;
  createdAt?: string;
  /** Overwrite an existing page instead of skipping it. */
  force?: boolean;
}

export interface WriteColoringPageResult {
  slug: string;
  skipped: boolean;
  /** Long-edge pixel dimension of the source image (for the downscale guard). */
  longEdge: number;
  contentPath: string;
  imageDir: string;
}

export async function writeColoringPage(
  input: WriteColoringPageInput,
): Promise<WriteColoringPageResult> {
  const {
    slug,
    title,
    description = null,
    subject,
    tags,
    source,
    falRequestId,
    layout,
    prompt,
    styleVersion,
    relatedPosts = [],
    needsRegen = false,
    image,
    createdAt,
    force = false,
  } = input;

  // GUARD: the target folder must be a real collection (have _category.mdx).
  const dir = collectionDir(subject);
  if (!(await fileExists(path.join(dir, '_category.mdx')))) {
    throw new Error(
      `Refusing to write leaf "${slug}": content/coloring-pages/${subject}/ is not a collection ` +
        `(no _category.mdx). Create the collection first (folder model — see url-structure-guide.md).`,
    );
  }

  const contentPath = path.join(dir, `${slug}.mdx`);
  // Image folder/key is the DESCRIPTIVE form (slug + "-coloring-page") so the
  // served file path carries the full long-tail keyword (better image SEO). The
  // URL slug (the link) stays clean — see plan/image-pipeline.md.
  const imageKey = `${slug}-coloring-page`;
  const imageDir = path.join(COLORING_PAGE_IMAGES_DIR, imageKey);

  // Idempotency: skip an already-written page unless force is set. We still
  // probe the source image so callers always get a real longEdge back.
  const alreadyExists = await fileExists(contentPath);
  if (alreadyExists && !force) {
    let longEdge = 0;
    try {
      const buf = await resolveImageBuffer(image);
      const meta = await sharp(buf).metadata();
      longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    } catch {
      /* image source may be unavailable on a pure idempotency re-run */
    }
    return { slug, skipped: true, longEdge, contentPath, imageDir };
  }

  const sourceBuffer = await resolveImageBuffer(image);

  // Probe the source so we know its format + long-edge dimension.
  const meta = await sharp(sourceBuffer).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const isPng = meta.format === 'png';

  await fs.mkdir(imageDir, { recursive: true });

  // original.png — keep verbatim if already PNG, otherwise convert.
  const originalPng = isPng ? sourceBuffer : await sharp(sourceBuffer).png().toBuffer();
  await fs.writeFile(path.join(imageDir, 'original.png'), originalPng);

  // full.webp — lossless-ish, no resize.
  const fullWebp = await sharp(originalPng).webp({ quality: 92, effort: 6 }).toBuffer();
  await fs.writeFile(path.join(imageDir, 'full.webp'), fullWebp);

  // thumb.webp — capped to 600px wide.
  const thumbWebp = await sharp(originalPng)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
  await fs.writeFile(path.join(imageDir, 'thumb.webp'), thumbWebp);

  // Build + validate frontmatter. No `categories`/`subject` field — the folder is
  // the home. image folder name = slug + "-coloring-page" (descriptive, for SEO).
  const frontmatter = coloringPageSchema.parse({
    slug,
    title,
    description,
    image: imageKey,
    tags,
    createdAt: createdAt ?? new Date().toISOString(),
    source,
    ...(falRequestId ? { falRequestId } : {}),
    ...(layout ? { layout } : {}),
    ...(prompt ? { prompt } : {}),
    ...(styleVersion !== undefined ? { styleVersion } : {}),
    relatedPosts,
    needsRegen,
  });

  const fileContents = matter.stringify('', frontmatter);
  await fs.writeFile(contentPath, fileContents, 'utf8');

  return { slug, skipped: false, longEdge, contentPath, imageDir };
}

/* -------------------------------------------------------------------------- */
/* Category writer                                                             */
/* -------------------------------------------------------------------------- */

export interface WriteCategoryInput {
  slug: string;
  name: string;
  /**
   * Folder path for this collection under content/coloring-pages, e.g. "animals"
   * or "fantasy/unicorn". Defaults to the slug (a top-level theme). Writes
   * <path>/_category.mdx.
   */
  path?: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoMetaDescription?: string | null;
  order?: number;
  aliases?: string[];
  seoDetails?: SeoDetails;
  /** Hero image source — raw bytes or a local file path. Null/undefined => no hero. */
  hero?: Buffer | string | null;
  /** Thumbnail image source — raw bytes or a local file path. Null/undefined => no thumb. */
  thumbnail?: Buffer | string | null;
  /** Overwrite an existing category file instead of skipping it. */
  force?: boolean;
}

export interface WriteCategoryResult {
  slug: string;
  skipped: boolean;
  contentPath: string;
  imageDir: string;
  wroteHero: boolean;
  wroteThumb: boolean;
}

export async function writeCategory(cat: WriteCategoryInput): Promise<WriteCategoryResult> {
  const {
    slug,
    name,
    path: folderPath,
    description = null,
    seoTitle = null,
    seoDescription = null,
    seoMetaDescription = null,
    order = 0,
    aliases = [],
    seoDetails,
    hero,
    thumbnail,
    force = false,
  } = cat;

  const dir = collectionDir(folderPath ?? slug);
  await fs.mkdir(dir, { recursive: true });
  const contentPath = path.join(dir, '_category.mdx');
  const imageDir = path.join(CATEGORY_IMAGES_DIR, slug);

  if ((await fileExists(contentPath)) && !force) {
    return {
      slug,
      skipped: true,
      contentPath,
      imageDir,
      wroteHero: false,
      wroteThumb: false,
    };
  }

  let wroteHero = false;
  let wroteThumb = false;

  if (hero != null) {
    await fs.mkdir(imageDir, { recursive: true });
    const heroBuffer = await resolveImageBuffer(hero);
    const heroMeta = await sharp(heroBuffer).metadata();
    const heroOriginalPng =
      heroMeta.format === 'png' ? heroBuffer : await sharp(heroBuffer).png().toBuffer();
    // Only hero.webp/thumb.webp are served — derive in-memory, don't keep the
    // unserved hero-original.png (and clear any stale one).
    const heroWebp = await sharp(heroOriginalPng)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 })
      .toBuffer();
    await fs.writeFile(path.join(imageDir, 'hero.webp'), heroWebp);
    await fs.rm(path.join(imageDir, 'hero-original.png'), { force: true });
    wroteHero = true;
  }

  if (thumbnail != null) {
    await fs.mkdir(imageDir, { recursive: true });
    const thumbBuffer = await resolveImageBuffer(thumbnail);
    const thumbWebp = await sharp(thumbBuffer)
      .resize({ width: 600, withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();
    await fs.writeFile(path.join(imageDir, 'thumb.webp'), thumbWebp);
    wroteThumb = true;
  }

  const frontmatter: Category = categorySchema.parse({
    slug,
    name,
    description,
    seoTitle,
    seoDescription,
    seoMetaDescription,
    heroImage: wroteHero ? 'hero.webp' : null,
    thumbnailImage: wroteThumb ? 'thumb.webp' : null,
    order,
    aliases,
    ...(seoDetails ? { seoDetails } : {}),
  });

  const fileContents = matter.stringify('', frontmatter);
  await fs.writeFile(contentPath, fileContents, 'utf8');

  return { slug, skipped: false, contentPath, imageDir, wroteHero, wroteThumb };
}

/* -------------------------------------------------------------------------- */
/* Article / doc hero image writer                                             */
/* -------------------------------------------------------------------------- */

const PUBLIC_IMAGES_DIR = path.join(REPO_ROOT, 'public', 'images');

export interface WriteArticleImageInput {
  /** doc namespace folder: how-to-draw | drawing-ideas | tools | blog */
  namespace: string;
  /** doc slug — image lands at public/images/<namespace>/<slug>/<file> */
  slug: string;
  /** Buffer of the original image bytes OR a local file path. */
  image: Buffer | string;
  /** Output webp filename. Default 'featured.webp' (the hero). Use 'steps.webp' for the process strip. */
  file?: string;
  /** Overwrite an existing file instead of skipping it. */
  force?: boolean;
}

export interface WriteArticleImageResult {
  slug: string;
  skipped: boolean;
  imageDir: string;
}

/**
 * Write an article image into public/images/<namespace>/<slug>/ as <name>.webp
 * (capped at 1600px wide). The MDX references the file by hand (`featuredImage:
 * featured.webp` in frontmatter, or a markdown
 * `![](/images/<namespace>/<slug>/steps.webp)` in the body) — this writer only
 * produces the image files.
 *
 * Only the served .webp is persisted: the high-res original is used in-memory to
 * derive the webp and then dropped, since nothing serves a `<name>-original.png`
 * for article namespaces. (Coloring-page `original.png` IS served — that's a
 * different writer and is kept.) Keeping unserved originals on disk bloats the
 * repo by ~50x; don't reintroduce them.
 */
export async function writeArticleImage(
  input: WriteArticleImageInput,
): Promise<WriteArticleImageResult> {
  const { namespace, slug, image, file = 'featured.webp', force = false } = input;
  const parts = namespace.split('/').filter(Boolean);
  if (!parts.length || parts.some((p) => p === '.' || p === '..')) {
    throw new Error(`Invalid namespace "${namespace}"`);
  }
  if (file.includes('/') || file.includes('..') || !file.endsWith('.webp')) {
    throw new Error(`Invalid image file name "${file}" (expected a *.webp basename)`);
  }
  const base = file.slice(0, -'.webp'.length);
  const imageDir = path.join(PUBLIC_IMAGES_DIR, ...parts, slug);
  const webpPath = path.join(imageDir, file);

  if ((await fileExists(webpPath)) && !force) {
    return { slug, skipped: true, imageDir };
  }

  const sourceBuffer = await resolveImageBuffer(image);
  const meta = await sharp(sourceBuffer).metadata();
  const isPng = meta.format === 'png';

  await fs.mkdir(imageDir, { recursive: true });

  // Derive the served webp straight from the source bytes in memory. We do NOT
  // persist a `${base}-original.png` — nothing serves it for article namespaces,
  // and keeping it bloats the repo ~50x (see fn doc).
  const originalPng = isPng ? sourceBuffer : await sharp(sourceBuffer).png().toBuffer();
  const webp = await sharp(originalPng)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toBuffer();
  await fs.writeFile(webpPath, webp);

  // Belt-and-suspenders: if a stale original is lying around (older runs, manual
  // download), remove it now that the webp exists.
  await fs.rm(path.join(imageDir, `${base}-original.png`), { force: true });

  return { slug, skipped: false, imageDir };
}
