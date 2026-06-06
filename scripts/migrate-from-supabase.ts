/**
 * Migrate coloring pages + categories from the legacy Supabase database into the
 * file-based content layer (content/*.mdx + public/images/**).
 *
 *   npm run migrate:supabase           # full migration
 *   npm run migrate:supabase -- --force          # overwrite existing files
 *   npm run migrate:supabase -- --regen-flagged  # (stub) regen downscaled pages
 *
 * DO NOT RUN while the Supabase project is paused.
 *
 * Schema assumptions (verified against app/admin/actions/* + lib/coloringPages.ts):
 *   - categories:    id, name, slug, description, seo_title, seo_description,
 *                    seo_meta_description, hero_image, thumbnail_image, created_at.
 *                    (No `order` column — ordering was `.order('name')`.)
 *   - coloring_pages: id, title, description?, image_url, webp_image_url, created_at.
 *                    NO slug column — slug is derived via slugify(title).
 *   - coloring_page_categories: coloring_page_id, category_id.
 *   - coloring_page_tags:       coloring_page_id, tag_id.
 *   - tags: id, name.
 *   - image_url / webp_image_url are object PATHS inside the coloring-pages bucket.
 *   - hero_image / thumbnail_image are object PATHS inside the hero/thumbnail buckets.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

process.loadEnvFile?.('.env');

import { supabase, Constants } from './lib/supabase';
import { slugify } from '@/lib/slug';
import { allDetailsData } from '@/components/seo-details/data';
import type { SeoDetails } from '@/lib/content/types';
import {
  writeColoringPage,
  writeCategory,
  paths,
} from './lib/writeColoringPage';
import { downloadToBuffer, generateColoringImage } from './lib/fal';

/* -------------------------------------------------------------------------- */
/* Config                                                                      */
/* -------------------------------------------------------------------------- */

/** Below this long-edge dimension we assume the only image was a downscaled webp. */
const DOWNSCALE_THRESHOLD_PX = 1000;

interface Flags {
  force: boolean;
  regenFlagged: boolean;
}

function parseFlags(argv: string[]): Flags {
  return {
    force: argv.includes('--force'),
    regenFlagged: argv.includes('--regen-flagged'),
  };
}

/* -------------------------------------------------------------------------- */
/* DB row shapes (loose — the legacy DB is untyped)                            */
/* -------------------------------------------------------------------------- */

interface CategoryRow {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_meta_description: string | null;
  hero_image: string | null;
  thumbnail_image: string | null;
  created_at?: string | null;
}

interface ColoringPageRow {
  id: string | number;
  title: string;
  slug?: string | null;
  description?: string | null;
  image_url: string | null;
  webp_image_url: string | null;
  created_at?: string | null;
}

interface JoinRow {
  coloring_page_id: string | number;
  category_id?: string | number;
  tag_id?: string | number;
}

interface TagRow {
  id: string | number;
  name: string;
}

interface MigrationReport {
  startedAt: string;
  finishedAt: string;
  counts: {
    categories: number;
    categoriesWritten: number;
    categoriesSkipped: number;
    coloringPages: number;
    coloringPagesWritten: number;
    coloringPagesSkipped: number;
  };
  flaggedPages: Array<{ slug: string; title: string; longEdge: number }>;
  downloadFailures: Array<{ slug: string; title: string; url: string; error: string }>;
}

/* -------------------------------------------------------------------------- */
/* Fetch helpers                                                               */
/* -------------------------------------------------------------------------- */

async function fetchAll<T>(table: string, columns = '*'): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 1000;
  let from = 0;
  // Page through to defeat Supabase's default 1000-row cap.
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Failed to read ${table}: ${error.message}`);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

/** Build a bucket public URL from a stored object path. */
function bucketUrl(base: string, objectPath: string): string {
  // base ends with '/'; object paths may or may not have a leading slash.
  return base + objectPath.replace(/^\/+/, '');
}

async function tryDownload(url: string): Promise<{ buffer?: Buffer; error?: string }> {
  try {
    return { buffer: await downloadToBuffer(url) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));

  const report: MigrationReport = {
    startedAt: new Date().toISOString(),
    finishedAt: '',
    counts: {
      categories: 0,
      categoriesWritten: 0,
      categoriesSkipped: 0,
      coloringPages: 0,
      coloringPagesWritten: 0,
      coloringPagesSkipped: 0,
    },
    flaggedPages: [],
    downloadFailures: [],
  };

  console.log('Reading rows from Supabase…');
  const [categories, pages, pageCategories, pageTags, tags] = await Promise.all([
    fetchAll<CategoryRow>(Constants.CATEGORIES_TABLE),
    fetchAll<ColoringPageRow>(Constants.COLORING_PAGES_TABLE),
    fetchAll<JoinRow>(Constants.COLORING_PAGE_CATEGORY_TABLE),
    fetchAll<JoinRow>(Constants.COLORING_PAGE_TAG_TABLE),
    fetchAll<TagRow>(Constants.TAGS_TABLE),
  ]);

  report.counts.categories = categories.length;
  report.counts.coloringPages = pages.length;

  // Lookups.
  const categoryById = new Map<string, CategoryRow>();
  for (const c of categories) categoryById.set(String(c.id), c);

  const tagById = new Map<string, TagRow>();
  for (const t of tags) tagById.set(String(t.id), t);

  const categoryIdsByPage = new Map<string, Set<string>>();
  for (const j of pageCategories) {
    if (j.category_id == null) continue;
    const key = String(j.coloring_page_id);
    if (!categoryIdsByPage.has(key)) categoryIdsByPage.set(key, new Set());
    categoryIdsByPage.get(key)!.add(String(j.category_id));
  }

  const tagIdsByPage = new Map<string, Set<string>>();
  for (const j of pageTags) {
    if (j.tag_id == null) continue;
    const key = String(j.coloring_page_id);
    if (!tagIdsByPage.has(key)) tagIdsByPage.set(key, new Set());
    tagIdsByPage.get(key)!.add(String(j.tag_id));
  }

  const categorySlugs = new Set<string>();
  const pageSlugs = new Set<string>();

  /* ---------------------------- Categories ------------------------------- */

  console.log(`\nMigrating ${categories.length} categories…`);
  // Sort by name for a deterministic `order` (the legacy site used .order('name')).
  const sortedCategories = [...categories].sort((a, b) =>
    (a.name ?? '').localeCompare(b.name ?? ''),
  );

  for (let i = 0; i < sortedCategories.length; i++) {
    const cat = sortedCategories[i];
    const slug = cat.slug || slugify(cat.name);
    categorySlugs.add(slug);

    const seoDetails: SeoDetails | undefined = allDetailsData[slug] as SeoDetails | undefined;

    let hero: Buffer | undefined;
    if (cat.hero_image) {
      const url = bucketUrl(Constants.SUPABASE_HERO_IMAGES_BUCKET_URL, cat.hero_image);
      const dl = await tryDownload(url);
      if (dl.buffer) hero = dl.buffer;
      else report.downloadFailures.push({ slug, title: cat.name, url, error: dl.error! });
    }

    let thumbnail: Buffer | undefined;
    if (cat.thumbnail_image) {
      const url = bucketUrl(Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL, cat.thumbnail_image);
      const dl = await tryDownload(url);
      if (dl.buffer) thumbnail = dl.buffer;
      else report.downloadFailures.push({ slug, title: cat.name, url, error: dl.error! });
    }

    const result = await writeCategory({
      slug,
      name: cat.name,
      description: cat.description ?? null,
      seoTitle: cat.seo_title ?? null,
      seoDescription: cat.seo_description ?? null,
      seoMetaDescription: cat.seo_meta_description ?? null,
      order: i,
      seoDetails,
      hero,
      thumbnail,
      force: flags.force,
    });

    if (result.skipped) report.counts.categoriesSkipped++;
    else report.counts.categoriesWritten++;
  }

  /* -------------------------- Coloring pages ------------------------------ */

  console.log(`\nMigrating ${pages.length} coloring pages…`);
  for (const page of pages) {
    // The legacy table has no slug column; derive from title (or use slug if present).
    const slug = page.slug ? page.slug : slugify(page.title);
    pageSlugs.add(slug);

    // Resolve category slugs (verbatim from the DB) + tag names.
    const catIds = categoryIdsByPage.get(String(page.id)) ?? new Set<string>();
    const pageCategorySlugs = [...catIds]
      .map((id) => categoryById.get(id))
      .filter((c): c is CategoryRow => Boolean(c))
      .map((c) => c.slug || slugify(c.name));

    const tIds = tagIdsByPage.get(String(page.id)) ?? new Set<string>();
    const pageTagNames = [...tIds]
      .map((id) => tagById.get(id))
      .filter((t): t is TagRow => Boolean(t))
      .map((t) => t.name);

    // Prefer the original (image_url) over the downscaled webp (webp_image_url).
    const objectPath = page.image_url ?? page.webp_image_url;
    if (!objectPath) {
      report.downloadFailures.push({
        slug,
        title: page.title,
        url: '(none)',
        error: 'Row has neither image_url nor webp_image_url',
      });
      continue;
    }
    const url = bucketUrl(Constants.SUPABASE_COLORING_PAGES_BUCKET_URL, objectPath);
    const dl = await tryDownload(url);
    if (!dl.buffer) {
      report.downloadFailures.push({ slug, title: page.title, url, error: dl.error! });
      continue;
    }

    const result = await writeColoringPage({
      slug,
      title: page.title,
      description: page.description ?? null,
      categories: pageCategorySlugs,
      tags: pageTagNames,
      source: 'supabase-migration',
      createdAt: page.created_at ?? undefined,
      image: dl.buffer,
      force: flags.force,
    });

    if (result.skipped) report.counts.coloringPagesSkipped++;
    else report.counts.coloringPagesWritten++;

    // Downscale guard: flag pages whose only available image looks too small.
    if (result.longEdge > 0 && result.longEdge < DOWNSCALE_THRESHOLD_PX) {
      report.flaggedPages.push({ slug, title: page.title, longEdge: result.longEdge });
      // Re-write frontmatter with needsRegen=true (force so it overwrites).
      await writeColoringPage({
        slug,
        title: page.title,
        description: page.description ?? null,
        categories: pageCategorySlugs,
        tags: pageTagNames,
        source: 'supabase-migration',
        createdAt: page.created_at ?? undefined,
        image: dl.buffer,
        needsRegen: true,
        force: true,
      });

      if (flags.regenFlagged) {
        // TODO: regenerate the flagged page with fal.ai. Wired here so the
        // import is real; not executed during normal migration runs.
        await regenerateFlaggedPage(slug, page.title);
      }
    }
  }

  /* ----------------------------- Snapshots -------------------------------- */

  report.finishedAt = new Date().toISOString();

  const reportPath = path.join(paths.REPO_ROOT, 'migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const snapshotPath = path.join(paths.REPO_ROOT, 'content', '.slug-snapshot.json');
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
  await fs.writeFile(
    snapshotPath,
    JSON.stringify(
      {
        generatedAt: report.finishedAt,
        categories: [...categorySlugs].sort(),
        coloringPages: [...pageSlugs].sort(),
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log('\nMigration complete.');
  console.log(JSON.stringify(report.counts, null, 2));
  console.log(`Flagged (needsRegen): ${report.flaggedPages.length}`);
  console.log(`Download failures:    ${report.downloadFailures.length}`);
  console.log(`Report:   ${reportPath}`);
  console.log(`Snapshot: ${snapshotPath}`);
}

/**
 * TODO stub: regenerate a downscaled page with fal.ai. Intentionally imports
 * the real generator so wiring is verified, but is only reachable behind
 * --regen-flagged.
 */
async function regenerateFlaggedPage(slug: string, title: string): Promise<void> {
  console.log(`[regen-flagged] (stub) would regenerate "${title}" (${slug})`);
  // Example of the intended call (left unexecuted to avoid cost):
  // const { imageUrl, requestId } = await generateColoringImage({ prompt: title });
  // const buffer = await downloadToBuffer(imageUrl);
  // await writeColoringPage({ slug, title, source: 'fal', falRequestId: requestId,
  //   image: buffer, force: true, categories: [], tags: [] });
  void generateColoringImage; // keep the import live for the TODO
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
