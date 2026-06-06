/**
 * Shared content writers used by BOTH the Supabase migration and the fal.ai
 * generation pipeline.
 *
 * These functions own the on-disk layout described in `lib/images.ts`:
 *   public/images/coloring-pages/<slug>/{original.png,full.webp,thumb.webp}
 *   public/images/categories/<slug>/{hero.webp,thumb.webp,hero-original.png}
 *
 * They always emit frontmatter validated by the zod schemas in
 * `lib/content/types.ts` so the readers and writers can never drift.
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
const CATEGORIES_CONTENT_DIR = path.join(REPO_ROOT, 'content', 'categories');
const COLORING_PAGE_IMAGES_DIR = path.join(REPO_ROOT, 'public', 'images', 'coloring-pages');
const CATEGORY_IMAGES_DIR = path.join(REPO_ROOT, 'public', 'images', 'categories');

export const paths = {
  REPO_ROOT,
  COLORING_PAGES_CONTENT_DIR,
  CATEGORIES_CONTENT_DIR,
  COLORING_PAGE_IMAGES_DIR,
  CATEGORY_IMAGES_DIR,
};

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
  categories: string[];
  tags: string[];
  source: 'fal' | 'supabase-migration' | 'manual';
  falRequestId?: string;
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
    categories,
    tags,
    source,
    falRequestId,
    relatedPosts = [],
    needsRegen = false,
    image,
    createdAt,
    force = false,
  } = input;

  const contentPath = path.join(COLORING_PAGES_CONTENT_DIR, `${slug}.mdx`);
  const imageDir = path.join(COLORING_PAGE_IMAGES_DIR, slug);

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

  // Build + validate frontmatter. image folder name equals slug by convention.
  const frontmatter = coloringPageSchema.parse({
    slug,
    title,
    description,
    image: slug,
    categories,
    tags,
    createdAt: createdAt ?? new Date().toISOString(),
    source,
    ...(falRequestId ? { falRequestId } : {}),
    relatedPosts,
    needsRegen,
  });

  await fs.mkdir(COLORING_PAGES_CONTENT_DIR, { recursive: true });
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
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoMetaDescription?: string | null;
  order?: number;
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
    description = null,
    seoTitle = null,
    seoDescription = null,
    seoMetaDescription = null,
    order = 0,
    seoDetails,
    hero,
    thumbnail,
    force = false,
  } = cat;

  const contentPath = path.join(CATEGORIES_CONTENT_DIR, `${slug}.mdx`);
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
    await fs.writeFile(path.join(imageDir, 'hero-original.png'), heroOriginalPng);
    const heroWebp = await sharp(heroOriginalPng)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 })
      .toBuffer();
    await fs.writeFile(path.join(imageDir, 'hero.webp'), heroWebp);
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
    ...(seoDetails ? { seoDetails } : {}),
  });

  await fs.mkdir(CATEGORIES_CONTENT_DIR, { recursive: true });
  const fileContents = matter.stringify('', frontmatter);
  await fs.writeFile(contentPath, fileContents, 'utf8');

  return { slug, skipped: false, contentPath, imageDir, wroteHero, wroteThumb };
}
