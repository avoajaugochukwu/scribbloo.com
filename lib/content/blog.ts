import 'server-only';

import { cache } from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

import { blogPostFrontmatterSchema, type BlogPost } from './types';

/**
 * File-based content access layer for blog posts.
 *
 * Posts live on disk as MDX files:
 *
 *   content/blog/<slug>.mdx   -> frontmatter validated by blogPostFrontmatterSchema
 *                                 body = raw MDX post content
 *
 * Unlike categories/coloring-pages, the blog body is the actual post content. We do
 * NOT render MDX here — that is the page's job (`<MDXRemote source={content} />`).
 * We only return the raw `content` string alongside the validated frontmatter.
 *
 * Notes:
 *   - The directory may not exist yet; readers tolerate absence by returning [].
 *   - Files whose frontmatter fails validation are logged and skipped.
 *   - The directory read is memoized with React.cache (once per render pass).
 */

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Lists the `.mdx` files in the blog directory, returning their absolute paths.
 * Returns an empty array if the directory does not exist (ENOENT).
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

/**
 * Reads + validates every blog post (frontmatter + raw MDX body).
 * Invalid files are logged and skipped. Memoized once per render pass.
 */
const readAllPosts = cache(async (): Promise<BlogPost[]> => {
  const files = await listMdxFiles(BLOG_DIR);
  const posts: BlogPost[] = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const { data, content } = matter(raw);
    const parsed = blogPostFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      console.error(
        `[content/blog] Invalid blog frontmatter in ${path.basename(file)}:`,
        parsed.error.flatten().fieldErrors,
      );
      continue;
    }
    posts.push({ ...parsed.data, content });
  }

  return posts;
});

/**
 * All published posts (`status === 'Done'`), sorted by `publishedAt` descending.
 * Posts with a null `publishedAt` sort last.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await readAllPosts();
  return posts
    .filter((post) => post.status === 'Done')
    .sort((a, b) => {
      if (a.publishedAt === b.publishedAt) return 0;
      if (a.publishedAt === null) return 1; // nulls last
      if (b.publishedAt === null) return -1;
      return b.publishedAt.localeCompare(a.publishedAt);
    });
}

/** A single post by slug (regardless of status), or `null` if it does not exist. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await readAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

/** All blog post slugs (drives `generateStaticParams`). */
export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await readAllPosts();
  return posts.map((post) => post.slug);
}

/**
 * Resolves a list of slugs to posts for internal-linking blocks, preserving the
 * given order and skipping any slug that does not resolve to a post.
 */
export async function getRelatedPosts(slugs: string[]): Promise<BlogPost[]> {
  const posts = await readAllPosts();
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((post): post is BlogPost => post !== undefined);
}
