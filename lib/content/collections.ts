import 'server-only';

import { cache } from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

import { categorySchema, coloringPageSchema, type Category, type ColoringPage } from './types';

/**
 * The collection layer — FOLDER-DRIVEN (url-structure-guide.md §3–§6).
 *
 * The content directory IS the URL tree. No `parent` frontmatter, no tree walk:
 *
 *   content/coloring-pages/<a>/<b>/_category.mdx  -> listing  /coloring-pages/<a>/<b>
 *   content/coloring-pages/<a>/<b>/<slug>.mdx     -> leaf     /coloring-pages/<a>/<b>/<slug>
 *   content/facets/<slug>.mdx                     -> facet    /coloring-pages/<slug>  (tag-driven)
 *
 * Ancestry, breadcrumbs, and depth all come from the path itself. Leaf slugs only
 * need to be unique within their folder. Everything is resolved through a single
 * in-memory index built once per process (O(1) lookups, files parsed once).
 */

const CONTENT = path.join(process.cwd(), 'content');
const CP_DIR = path.join(CONTENT, 'coloring-pages');
const FACET_DIR = path.join(CONTENT, 'facets');
const ROOT = '/coloring-pages';
export const PAGE_SIZE = 24;

export interface CollectionNode {
  category: Category;
  pathSlugs: string[];
  href: string;
}
export interface Leaf {
  page: ColoringPage;
  pathSlugs: string[];
  href: string;
}

interface Index {
  collections: Map<string, CollectionNode>; // "fantasy/unicorn" -> node
  leaves: Map<string, Leaf>; // "fantasy/unicorn/unicorn-01" -> leaf
  childrenOf: Map<string, CollectionNode[]>; // parent key ("" = root) -> child nodes
  leavesOf: Map<string, Leaf[]>; // collection key -> direct leaves
  subtreeCount: Map<string, number>; // collection key -> leaves in its whole subtree
  facets: Category[];
  aliasTo: Map<string, string>; // alias path -> canonical href
  slugCanonical: Map<string, string | null>; // leaf slug -> canonical href (null = ambiguous)
}

const keyOf = (slugs: string[]) => slugs.join('/');
const hrefOf = (slugs: string[]) => (slugs.length ? `${ROOT}/${keyOf(slugs)}` : ROOT);

async function readMdx(file: string) {
  return matter(await fs.readFile(file, 'utf8'));
}

async function walk(absDir: string, rel: string[], idx: Index): Promise<void> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw e;
  }

  // this directory is a collection node if it has _category.mdx (root has none)
  if (rel.length && entries.some((e) => e.isFile() && e.name === '_category.mdx')) {
    const { data } = await readMdx(path.join(absDir, '_category.mdx'));
    const parsed = categorySchema.safeParse({ ...data, slug: data.slug ?? rel[rel.length - 1] });
    if (parsed.success) {
      const node: CollectionNode = { category: parsed.data, pathSlugs: rel, href: hrefOf(rel) };
      idx.collections.set(keyOf(rel), node);
      const parentKey = keyOf(rel.slice(0, -1));
      (idx.childrenOf.get(parentKey) ?? idx.childrenOf.set(parentKey, []).get(parentKey)!).push(node);
    } else {
      console.error(`[collections] invalid _category.mdx at ${rel.join('/')}:`, parsed.error.flatten().fieldErrors);
    }
  }

  for (const e of entries) {
    if (e.isDirectory()) {
      await walk(path.join(absDir, e.name), [...rel, e.name], idx);
    } else if (e.name.endsWith('.mdx') && e.name !== '_category.mdx') {
      const slug = e.name.slice(0, -4);
      const { data } = await readMdx(path.join(absDir, e.name));
      const parsed = coloringPageSchema.safeParse({ ...data, slug: data.slug ?? slug });
      if (!parsed.success) {
        console.error(`[collections] invalid leaf ${[...rel, slug].join('/')}:`, parsed.error.flatten().fieldErrors);
        continue;
      }
      const pathSlugs = [...rel, slug];
      const leaf: Leaf = { page: parsed.data, pathSlugs, href: hrefOf(pathSlugs) };
      idx.leaves.set(keyOf(pathSlugs), leaf);
      const colKey = keyOf(rel);
      (idx.leavesOf.get(colKey) ?? idx.leavesOf.set(colKey, []).get(colKey)!).push(leaf);
    }
  }
}

const buildIndex = cache(async (): Promise<Index> => {
  const idx: Index = {
    collections: new Map(), leaves: new Map(), childrenOf: new Map(),
    leavesOf: new Map(), subtreeCount: new Map(), facets: [], aliasTo: new Map(), slugCanonical: new Map(),
  };
  await walk(CP_DIR, [], idx);

  // subtree leaf counts — every leaf increments each of its collection ancestors
  for (const leaf of idx.leaves.values()) {
    for (let i = 1; i < leaf.pathSlugs.length; i++) {
      const k = keyOf(leaf.pathSlugs.slice(0, i));
      idx.subtreeCount.set(k, (idx.subtreeCount.get(k) ?? 0) + 1);
    }
  }

  // facets
  try {
    for (const f of (await fs.readdir(FACET_DIR)).filter((n) => n.endsWith('.mdx'))) {
      const { data } = await readMdx(path.join(FACET_DIR, f));
      const parsed = categorySchema.safeParse({ ...data, slug: data.slug ?? f.slice(0, -4) });
      if (parsed.success) idx.facets.push(parsed.data);
      else console.error(`[collections] invalid facet ${f}:`, parsed.error.flatten().fieldErrors);
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }

  // sort children (order, name) and leaves (newest first)
  for (const list of idx.childrenOf.values())
    list.sort((a, b) => a.category.order - b.category.order || a.category.name.localeCompare(b.category.name));
  for (const list of idx.leavesOf.values())
    list.sort((a, b) => b.page.createdAt.localeCompare(a.page.createdAt));
  idx.facets.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  // aliases -> canonical href
  for (const node of idx.collections.values()) {
    const parentKey = keyOf(node.pathSlugs.slice(0, -1));
    for (const alias of node.category.aliases) {
      idx.aliasTo.set(parentKey ? `${parentKey}/${alias}` : alias, node.href);
    }
  }
  for (const f of idx.facets) for (const alias of f.aliases) idx.aliasTo.set(alias, `${ROOT}/${f.slug}`);

  // slug -> canonical (for legacy/non-canonical redirects); ambiguous slugs => null
  for (const leaf of idx.leaves.values()) {
    idx.slugCanonical.set(leaf.page.slug, idx.slugCanonical.has(leaf.page.slug) ? null : leaf.href);
  }

  return idx;
});

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export async function getRootHub(): Promise<{
  themes: CollectionNode[];
  facets: Category[];
  counts: Map<string, number>;
}> {
  const idx = await buildIndex();
  return { themes: idx.childrenOf.get('') ?? [], facets: idx.facets, counts: idx.subtreeCount };
}

/** Total number of leaves anywhere beneath a collection (its whole subtree). */
export async function getSubtreeCount(pathSlugs: string[]): Promise<number> {
  return (await buildIndex()).subtreeCount.get(keyOf(pathSlugs)) ?? 0;
}

/** The N most recently-added leaves across the entire site (newest first). */
export async function getRecentLeaves(limit = 8): Promise<Leaf[]> {
  const idx = await buildIndex();
  return [...idx.leaves.values()]
    .sort((a, b) => b.page.createdAt.localeCompare(a.page.createdAt))
    .slice(0, limit);
}

export async function getAllCollectionNodes(): Promise<CollectionNode[]> {
  return [...(await buildIndex()).collections.values()];
}

export async function getAllLeaves(): Promise<Leaf[]> {
  return [...(await buildIndex()).leaves.values()];
}

function ancestorsFor(slugs: string[], idx: Index): CollectionNode[] {
  const out: CollectionNode[] = [];
  for (let i = 1; i <= slugs.length; i++) {
    const node = idx.collections.get(keyOf(slugs.slice(0, i)));
    if (node) out.push(node);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Resolver                                                                   */
/* -------------------------------------------------------------------------- */

export type Resolved =
  | {
      type: 'collection';
      node: CollectionNode;
      ancestors: CollectionNode[];
      children: CollectionNode[];
      leaves: Leaf[];
      page: number;
      totalPages: number;
    }
  | { type: 'leaf'; leaf: Leaf; ancestors: CollectionNode[]; related: Leaf[] }
  | { type: 'redirect'; to: string }
  | { type: 'notFound' };

export async function resolvePath(parts: string[]): Promise<Resolved> {
  const idx = await buildIndex();

  // pagination suffix ".../page/N"
  let pageNo = 1;
  let base = parts;
  const n = parts.length;
  if (n >= 2 && parts[n - 2] === 'page' && /^[0-9]+$/.test(parts[n - 1])) {
    pageNo = parseInt(parts[n - 1], 10);
    base = parts.slice(0, n - 2);
  }
  const key = keyOf(base);
  const paginated = base !== parts;

  const paginate = (node: CollectionNode, allLeaves: Leaf[], children: CollectionNode[]): Resolved => {
    const totalPages = Math.max(1, Math.ceil(allLeaves.length / PAGE_SIZE));
    if (paginated && pageNo === 1) return { type: 'redirect', to: node.href };
    if (pageNo < 1 || pageNo > totalPages) return { type: 'notFound' };
    return { type: 'collection', node, ancestors: ancestorsFor(node.pathSlugs, idx), children, leaves: allLeaves, page: pageNo, totalPages };
  };

  // 1) collection
  const node = idx.collections.get(key);
  if (node) return paginate(node, idx.leavesOf.get(key) ?? [], idx.childrenOf.get(key) ?? []);

  // 2) facet (single-segment, tag-driven)
  if (base.length === 1) {
    const facet = idx.facets.find((f) => f.slug === base[0]);
    if (facet) {
      const fNode: CollectionNode = { category: facet, pathSlugs: base, href: `${ROOT}/${facet.slug}` };
      const tagged = facet.facetTag
        ? [...idx.leaves.values()].filter((l) => l.page.tags.includes(facet.facetTag!))
        : [];
      return paginate(fNode, tagged, []);
    }
  }

  // a page suffix on a non-listing is invalid
  if (paginated) return { type: 'notFound' };

  // 3) leaf at exact canonical path
  const leaf = idx.leaves.get(key);
  if (leaf) {
    const parentKey = keyOf(leaf.pathSlugs.slice(0, -1));
    const related = (idx.leavesOf.get(parentKey) ?? []).filter((l) => l.page.slug !== leaf.page.slug).slice(0, 6);
    return { type: 'leaf', leaf, ancestors: ancestorsFor(leaf.pathSlugs.slice(0, -1), idx), related };
  }

  // 4) legacy / non-canonical path whose last segment is a known unique slug
  const canonical = idx.slugCanonical.get(parts[parts.length - 1]);
  if (canonical && canonical !== hrefOf(parts)) return { type: 'redirect', to: canonical };

  // 5) alias
  const aliasTo = idx.aliasTo.get(key);
  if (aliasTo) return { type: 'redirect', to: aliasTo };

  return { type: 'notFound' };
}

/* -------------------------------------------------------------------------- */
/* Static params                                                              */
/* -------------------------------------------------------------------------- */

export async function getAllColoringParams(): Promise<{ path: string[] }[]> {
  const idx = await buildIndex();
  const out: { path: string[] }[] = [];

  for (const node of idx.collections.values()) {
    out.push({ path: node.pathSlugs });
    const total = Math.ceil((idx.leavesOf.get(keyOf(node.pathSlugs))?.length ?? 0) / PAGE_SIZE);
    for (let p = 2; p <= total; p++) out.push({ path: [...node.pathSlugs, 'page', String(p)] });
  }
  for (const leaf of idx.leaves.values()) out.push({ path: leaf.pathSlugs });
  for (const f of idx.facets) {
    out.push({ path: [f.slug] });
    const tagged = f.facetTag ? [...idx.leaves.values()].filter((l) => l.page.tags.includes(f.facetTag!)).length : 0;
    for (let p = 2; p <= Math.ceil(tagged / PAGE_SIZE); p++) out.push({ path: [f.slug, 'page', String(p)] });
  }
  return out;
}
