import 'server-only';

import { cache } from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

import {
  categorySchema,
  coloringPageSchema,
  type Category,
  type ColoringPage,
  type CategoryWithColoringPages,
} from './types';

/**
 * File-based content access layer for categories and coloring pages.
 *
 * Replaces the old Supabase + Notion data fetching. All content lives on disk as
 * MDX files with validated frontmatter:
 *
 *   content/categories/<slug>.mdx       -> categorySchema
 *   content/coloring-pages/<slug>.mdx   -> coloringPageSchema
 *
 * The body of each file is normally empty; only the frontmatter is consumed here.
 *
 * Notes:
 *   - These directories may not exist yet (coloring-page content is migrated later
 *     from a paused Supabase). Every reader tolerates a missing directory / zero
 *     files by returning an empty array — it must never throw on absence.
 *   - Files whose frontmatter fails schema validation are logged and skipped rather
 *     than crashing the whole build.
 *   - Directory reads are memoized with React.cache so the filesystem is read once
 *     per render pass.
 */

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const CATEGORIES_DIR = path.join(CONTENT_ROOT, 'categories');
const COLORING_PAGES_DIR = path.join(CONTENT_ROOT, 'coloring-pages');

/* -------------------------------------------------------------------------- */
/* Low-level helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Lists the `.mdx` files in a directory, returning their absolute paths.
 * Returns an empty array if the directory does not exist (ENOENT) — this is the
 * expected state before the content migration has run.
 */
async function listMdxFiles(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  return entries.filter((name) => name.endsWith('.mdx')).map((name) => path.join(dir, name));
}

/* -------------------------------------------------------------------------- */
/* Memoized directory reads                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Reads + validates every category file. Invalid files are logged and skipped.
 * Memoized: the filesystem is read at most once per render pass.
 */
const readAllCategories = cache(async (): Promise<Category[]> => {
  const files = await listMdxFiles(CATEGORIES_DIR);
  const categories: Category[] = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const { data } = matter(raw);
    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      console.error(
        `[content/coloringPages] Invalid category frontmatter in ${path.basename(file)}:`,
        parsed.error.flatten().fieldErrors,
      );
      continue;
    }
    categories.push(parsed.data);
  }

  return categories;
});

/**
 * Reads + validates every coloring-page file. Invalid files are logged and skipped.
 * Memoized: the filesystem is read at most once per render pass.
 */
const readAllColoringPages = cache(async (): Promise<ColoringPage[]> => {
  const files = await listMdxFiles(COLORING_PAGES_DIR);
  const pages: ColoringPage[] = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const { data } = matter(raw);
    const parsed = coloringPageSchema.safeParse(data);
    if (!parsed.success) {
      console.error(
        `[content/coloringPages] Invalid coloring-page frontmatter in ${path.basename(file)}:`,
        parsed.error.flatten().fieldErrors,
      );
      continue;
    }
    pages.push(parsed.data);
  }

  return pages;
});

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

/** All categories, sorted by `order` ascending then `name` ascending. */
export async function getAllCategories(): Promise<Category[]> {
  const categories = await readAllCategories();
  return [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

/** All category slugs (drives `generateStaticParams`). */
export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await readAllCategories();
  return categories.map((category) => category.slug);
}

/** A single category by slug, or `null` if it does not exist. */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await readAllCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Coloring pages                                                             */
/* -------------------------------------------------------------------------- */

/** All coloring pages, sorted by `createdAt` descending (newest first). */
export async function getAllColoringPages(): Promise<ColoringPage[]> {
  const pages = await readAllColoringPages();
  return [...pages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** A single coloring page by slug, or `null` if it does not exist. */
export async function getColoringPageBySlug(slug: string): Promise<ColoringPage | null> {
  const pages = await readAllColoringPages();
  return pages.find((page) => page.slug === slug) ?? null;
}

/** All coloring-page slugs (drives `generateStaticParams`). */
export async function getAllColoringPageSlugs(): Promise<string[]> {
  const pages = await readAllColoringPages();
  return pages.map((page) => page.slug);
}

/**
 * A category together with the coloring pages that belong to it.
 * Returns `null` if the category does not exist. The nested pages are filtered by
 * `page.categories.includes(categorySlug)` and sorted by `createdAt` descending.
 */
export async function getColoringPagesByCategorySlug(
  categorySlug: string,
): Promise<CategoryWithColoringPages | null> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const pages = await readAllColoringPages();
  const coloringPages = pages
    .filter((page) => page.categories.includes(categorySlug))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { ...category, coloringPages };
}

/* -------------------------------------------------------------------------- */
/* Tags (derived)                                                             */
/* -------------------------------------------------------------------------- */

/** The deduped, sorted union of every coloring page's `tags`. */
export async function getAllTags(): Promise<string[]> {
  const pages = await readAllColoringPages();
  const tags = new Set<string>();
  for (const page of pages) {
    for (const tag of page.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** All coloring pages whose `tags` include the given tag. */
export async function getColoringPagesByTag(tag: string): Promise<ColoringPage[]> {
  const pages = await getAllColoringPages();
  return pages.filter((page) => page.tags.includes(tag));
}
