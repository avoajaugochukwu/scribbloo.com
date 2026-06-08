import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

/**
 * Generic file-based loader for the simple "doc" content types that aren't
 * coloring pages — tutorials (/how-to-draw), listicles (/drawing-ideas), and
 * tools (/tools). Each is a flat MDX file: validated frontmatter + an optional
 * MDX body. One loader, three namespaces (url-structure-guide.md §2).
 */

export const docSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  subtitle: z.string().nullable().default(null),
  /**
   * Hero image filename written by the article-image pipeline
   * (scripts/generate-article-image.ts) to
   * public/images/<namespace>/<slug>/featured.webp. Just "featured.webp" when
   * art exists, else null. Resolve to a URL via imageUrl({ kind: 'doc-featured' }).
   */
  featuredImage: z.string().nullable().default(null),
  /**
   * Optional grouping bucket for the namespace index (e.g. "Animals",
   * "Seasonal"). When set, the index page groups cards under category headings;
   * when absent everywhere, it falls back to a single flat grid.
   */
  category: z.string().nullable().default(null),
  /** ordering within the namespace index (highest-volume first, etc.) */
  order: z.number().default(0),
});
export type DocFrontmatter = z.infer<typeof docSchema>;
export interface Doc extends DocFrontmatter {
  /** the namespace folder this doc lives in (how-to-draw | drawing-ideas | tools) */
  namespace: string;
  /** raw MDX body (may be empty for stub/dummy pages) */
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), 'content');

async function readAll(sub: string): Promise<Doc[]> {
  const dir = path.join(CONTENT_ROOT, sub);
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const docs: Doc[] = [];
  for (const name of names.filter((n) => n.endsWith('.mdx'))) {
    const raw = await fs.readFile(path.join(dir, name), 'utf8');
    const { data, content } = matter(raw);
    const parsed = docSchema.safeParse(data);
    if (!parsed.success) {
      console.error(`[content/docs] Invalid frontmatter in ${sub}/${name}:`, parsed.error.flatten().fieldErrors);
      continue;
    }
    docs.push({ ...parsed.data, namespace: sub, body: content.trim() });
  }
  return docs;
}

export async function getDocs(sub: string): Promise<Doc[]> {
  const docs = await readAll(sub);
  return docs.sort((a, b) => b.order - a.order || a.title.localeCompare(b.title));
}

export async function getDoc(sub: string, slug: string): Promise<Doc | null> {
  const docs = await readAll(sub);
  return docs.find((d) => d.slug === slug) ?? null;
}

export async function getDocSlugs(sub: string): Promise<string[]> {
  const docs = await readAll(sub);
  return docs.map((d) => d.slug);
}
