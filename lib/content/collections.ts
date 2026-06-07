import 'server-only';

import { getAllCategories, getAllColoringPages } from './coloringPages';
import type { Category, ColoringPage } from './types';

/**
 * The collection TREE layer (url-structure-guide.md §3–§6).
 *
 * Collections form a variable-depth tree via the `parent` slug chain. A single
 * catch-all route (`app/coloring-pages/[[...path]]`) resolves any path against
 * this layer to either a listing node (a `subject`/`facet` collection) or a leaf
 * (a coloring page). Depth is DATA, not route files — adding a subcategory is a
 * content edit, never a routing change.
 *
 * Canonical rules:
 *   - A collection's URL = /coloring-pages/<ancestor slugs…>/<slug>.
 *   - A `facet` collection is flat: /coloring-pages/<slug> (no parent nesting).
 *   - A leaf's canonical URL = its ONE `subject` collection's path + /<slug>.
 *     `subject` falls back to categories[0] so legacy pages keep their URLs.
 */

const ROOT = '/coloring-pages';
const MAX_DEPTH = 8; // cycle / runaway guard

/* -------------------------------------------------------------------------- */
/* Path math                                                                  */
/* -------------------------------------------------------------------------- */

/** Ancestor-inclusive slug chain for a collection, root-first. Facets are flat. */
function pathSlugsFor(slug: string, bySlug: Map<string, Category>): string[] | null {
  const chain: string[] = [];
  let cur = bySlug.get(slug);
  if (!cur) return null;
  for (let i = 0; i < MAX_DEPTH && cur; i++) {
    chain.unshift(cur.slug);
    if (cur.kind === 'facet' || !cur.parent) return chain; // facets never nest
    cur = bySlug.get(cur.parent);
  }
  return chain; // depth-capped; returns best effort
}

/** The canonical home subject of a leaf (explicit `subject`, else categories[0]). */
export function leafSubjectSlug(page: ColoringPage): string | null {
  return page.subject ?? page.categories[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Public tree queries                                                        */
/* -------------------------------------------------------------------------- */

export interface CollectionNode {
  category: Category;
  /** root-first slug chain including this collection */
  pathSlugs: string[];
  /** absolute canonical URL */
  href: string;
}

/** Top-level subject themes (parent == null), ordered. */
export async function getTopLevelCollections(): Promise<Category[]> {
  const cats = await getAllCategories();
  return cats.filter((c) => c.kind === 'subject' && !c.parent);
}

/** All facet (cross-cutting) collections, ordered. */
export async function getFacetCollections(): Promise<Category[]> {
  const cats = await getAllCategories();
  return cats.filter((c) => c.kind === 'facet');
}

/** Direct child subject collections of a given collection slug, ordered. */
export async function getChildCollections(parentSlug: string): Promise<Category[]> {
  const cats = await getAllCategories();
  return cats.filter((c) => c.kind === 'subject' && c.parent === parentSlug);
}

/** The leaves that belong to a collection: by subject (subjects) or tag (facets). */
export async function getLeavesForCollection(category: Category): Promise<ColoringPage[]> {
  const pages = await getAllColoringPages();
  if (category.kind === 'facet') {
    const tag = category.facetTag;
    return tag ? pages.filter((p) => p.tags.includes(tag)) : [];
  }
  return pages.filter((p) => leafSubjectSlug(p) === category.slug);
}

/** Ancestor breadcrumb chain (root-first) of collection nodes for a slug. */
export async function getAncestors(slug: string): Promise<CollectionNode[]> {
  const cats = await getAllCategories();
  const bySlug = new Map(cats.map((c) => [c.slug, c]));
  const slugs = pathSlugsFor(slug, bySlug);
  if (!slugs) return [];
  return slugs.map((s, i) => {
    const pathSlugs = slugs.slice(0, i + 1);
    return { category: bySlug.get(s)!, pathSlugs, href: `${ROOT}/${pathSlugs.join('/')}` };
  });
}

/** Canonical URL for a leaf coloring page (its subject path + slug), or null. */
export async function getLeafCanonicalHref(page: ColoringPage): Promise<string | null> {
  const subject = leafSubjectSlug(page);
  if (!subject) return null;
  const cats = await getAllCategories();
  const bySlug = new Map(cats.map((c) => [c.slug, c]));
  const slugs = pathSlugsFor(subject, bySlug);
  if (!slugs) return null;
  return `${ROOT}/${[...slugs, page.slug].join('/')}`;
}

/* -------------------------------------------------------------------------- */
/* Resolver — the heart of the catch-all route                                */
/* -------------------------------------------------------------------------- */

export type Resolved =
  | { type: 'collection'; category: Category; ancestors: CollectionNode[] }
  | { type: 'leaf'; page: ColoringPage; subject: Category; ancestors: CollectionNode[] }
  | { type: 'redirect'; to: string }
  | { type: 'notFound' };

/**
 * Resolve a URL path (segments after /coloring-pages) to a collection, a leaf,
 * a redirect (alias or non-canonical leaf path), or notFound.
 */
export async function resolvePath(parts: string[]): Promise<Resolved> {
  const cats = await getAllCategories();
  const pages = await getAllColoringPages();
  const bySlug = new Map(cats.map((c) => [c.slug, c]));
  const target = parts.join('/');

  // 1) collection node whose full path matches
  for (const c of cats) {
    const slugs = pathSlugsFor(c.slug, bySlug);
    if (slugs && slugs.join('/') === target) {
      return { type: 'collection', category: c, ancestors: await getAncestors(c.slug) };
    }
  }

  // 2) leaf: last segment is a page slug
  const slug = parts[parts.length - 1];
  const page = pages.find((p) => p.slug === slug);
  if (page) {
    const canonical = await getLeafCanonicalHref(page);
    if (canonical === `${ROOT}/${target}`) {
      const subjectSlug = leafSubjectSlug(page)!;
      return {
        type: 'leaf',
        page,
        subject: bySlug.get(subjectSlug)!,
        ancestors: await getAncestors(subjectSlug),
      };
    }
    // requested via a non-canonical path (e.g. a secondary category) -> redirect
    if (canonical) return { type: 'redirect', to: canonical };
  }

  // 3) alias: <parent path>/<alias> -> the aliased collection's canonical path
  for (const c of cats) {
    if (!c.aliases.length) continue;
    const slugs = pathSlugsFor(c.slug, bySlug);
    if (!slugs) continue;
    const parentPath = slugs.slice(0, -1).join('/');
    for (const alias of c.aliases) {
      const aliasPath = parentPath ? `${parentPath}/${alias}` : alias;
      if (aliasPath === target) return { type: 'redirect', to: `${ROOT}/${slugs.join('/')}` };
    }
  }

  return { type: 'notFound' };
}

/* -------------------------------------------------------------------------- */
/* Static params                                                              */
/* -------------------------------------------------------------------------- */

/** Every collection path + every leaf canonical path, as catch-all params. */
export async function getAllColoringParams(): Promise<{ path: string[] }[]> {
  const cats = await getAllCategories();
  const pages = await getAllColoringPages();
  const bySlug = new Map(cats.map((c) => [c.slug, c]));

  const out: { path: string[] }[] = [];
  for (const c of cats) {
    const slugs = pathSlugsFor(c.slug, bySlug);
    if (slugs) out.push({ path: slugs });
  }
  for (const p of pages) {
    const subject = leafSubjectSlug(p);
    if (!subject) continue;
    const slugs = pathSlugsFor(subject, bySlug);
    if (slugs) out.push({ path: [...slugs, p.slug] });
  }
  return out;
}
