import 'server-only';

import { cache } from 'react';

import { imageUrl } from '@/lib/images';
import {
  getAllCollectionNodes,
  getAllLeaves,
  getRootHub,
} from './collections';
import { getAllPosts } from './blog';
import { getDocs } from './docs';
import {
  SEARCH_TYPE_META,
  type SearchDoc,
  type SearchResult,
  type SearchType,
} from './search-shared';

/**
 * Site-wide search — the unified index over EVERY content type (server side).
 *
 * The site has no DB. Search is a flat in-memory index built once per process
 * (React.cache) from the same file-based loaders the pages use, then scanned and
 * ranked per query. ~1k docs is a trivial linear scan, so there is no external
 * search service and nothing ships to the client — querying happens server-side
 * (API route + /search page). Client-safe types/config live in `search-shared.ts`.
 *
 * ── Extending as the site grows ──────────────────────────────────────────────
 * Every searchable thing becomes a `SearchDoc`. To add a new content type:
 *   1. add its key to `SearchType` + an entry to `SEARCH_TYPE_META` (search-shared.ts), and
 *   2. add a source function to the `SOURCES` array below.
 * Nothing else changes — the API, the /search page, and the header dropdown all
 * read the index generically. See plan/search.md.
 */

// Re-export the client-safe primitives so server callers can import everything
// from one place.
export {
  SEARCH_TYPE_META,
  SEARCH_TYPE_ORDER,
  groupByType,
  type SearchType,
  type SearchTypeMeta,
  type SearchDoc,
  type SearchResult,
} from './search-shared';

/* -------------------------------------------------------------------------- */
/* Sources — one function per content type, each emitting SearchDocs          */
/* -------------------------------------------------------------------------- */

async function coloringPageDocs(): Promise<SearchDoc[]> {
  const leaves = await getAllLeaves();
  return leaves.map((leaf) => ({
    id: `coloring-page:${leaf.href}`,
    type: 'coloring-page' as const,
    title: leaf.page.title,
    description: leaf.page.description,
    url: leaf.href,
    image: imageUrl({ kind: 'coloring-page', slug: leaf.page.image, variant: 'thumb' }),
    keywords: [...leaf.page.tags, ...leaf.pathSlugs.slice(0, -1)],
    date: leaf.page.createdAt,
  }));
}

async function collectionDocs(): Promise<SearchDoc[]> {
  const nodes = await getAllCollectionNodes();
  return nodes.map((node) => ({
    id: `collection:${node.href}`,
    type: 'collection' as const,
    title: node.category.name,
    description: node.category.seoDescription ?? node.category.description,
    url: node.href,
    image: node.category.thumbnailImage
      ? imageUrl({ kind: 'category-thumb', slug: node.category.slug })
      : node.category.heroImage
        ? imageUrl({ kind: 'category-hero', slug: node.category.slug })
        : null,
    keywords: [...node.category.aliases, ...node.pathSlugs],
    date: null,
  }));
}

async function facetDocs(): Promise<SearchDoc[]> {
  const { facets } = await getRootHub();
  return facets.map((facet) => ({
    id: `facet:/coloring-pages/${facet.slug}`,
    type: 'facet' as const,
    title: facet.name,
    description: facet.seoDescription ?? facet.description,
    url: `/coloring-pages/${facet.slug}`,
    image: facet.thumbnailImage ? imageUrl({ kind: 'category-thumb', slug: facet.slug }) : null,
    keywords: [...facet.aliases, facet.facetTag ?? ''].filter(Boolean),
    date: null,
  }));
}

async function blogDocs(): Promise<SearchDoc[]> {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: `blog:/blog/${post.slug}`,
    type: 'blog' as const,
    title: post.title,
    description: post.excerpt ?? post.metaDescription,
    url: `/blog/${post.slug}`,
    image: post.featuredImage ? imageUrl({ kind: 'blog-featured', slug: post.slug }) : null,
    keywords: post.tags,
    date: post.publishedAt,
  }));
}

/** Factory for the three flat doc namespaces (how-to-draw, drawing-ideas, tools). */
function docNamespaceSource(namespace: Extract<SearchType, 'how-to-draw' | 'drawing-ideas' | 'tools'>) {
  return async (): Promise<SearchDoc[]> => {
    const docs = await getDocs(namespace);
    return docs.map((doc) => ({
      id: `${namespace}:/${namespace}/${doc.slug}`,
      type: namespace,
      title: doc.title,
      description: doc.description ?? doc.subtitle,
      url: `/${namespace}/${doc.slug}`,
      image: doc.featuredImage ? imageUrl({ kind: 'doc-featured', slug: doc.slug, namespace }) : null,
      keywords: [doc.category ?? '', doc.slug].filter(Boolean),
      date: null,
    }));
  };
}

/** The registry. Add a content type here and it becomes searchable everywhere. */
const SOURCES: Array<() => Promise<SearchDoc[]>> = [
  coloringPageDocs,
  collectionDocs,
  facetDocs,
  blogDocs,
  docNamespaceSource('how-to-draw'),
  docNamespaceSource('drawing-ideas'),
  docNamespaceSource('tools'),
];

/** The full search index, built once per process. */
export const getSearchIndex = cache(async (): Promise<SearchDoc[]> => {
  const batches = await Promise.all(SOURCES.map((source) => source()));
  return batches.flat();
});

/* -------------------------------------------------------------------------- */
/* Scoring                                                                    */
/* -------------------------------------------------------------------------- */

/** Lowercase, strip punctuation to spaces, split into unique non-trivial terms. */
function tokenize(input: string): string[] {
  const tokens = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return [...new Set(tokens)];
}

interface Haystack {
  title: string;
  titleTokens: Set<string>;
  keywords: string;
  description: string;
}

function haystackOf(doc: SearchDoc): Haystack {
  const title = doc.title.toLowerCase();
  return {
    title,
    titleTokens: new Set(tokenize(doc.title)),
    keywords: doc.keywords.join(' ').toLowerCase(),
    description: (doc.description ?? '').toLowerCase(),
  };
}

/**
 * Score a single doc against the query terms. Every term must match somewhere
 * (AND semantics) or the doc scores 0 and is dropped. Within that, matches are
 * weighted by field: title >> keywords/tags > description, with bonuses for an
 * exact title hit and for whole-word title matches.
 */
function scoreDoc(doc: SearchDoc, hay: Haystack, terms: string[], fullQuery: string): number {
  let score = 0;

  // big bonus for an exact / prefix title match against the whole query
  if (hay.title === fullQuery) score += 100;
  else if (hay.title.startsWith(fullQuery)) score += 40;
  else if (hay.title.includes(fullQuery)) score += 18;

  for (const term of terms) {
    let termScore = 0;
    if (hay.titleTokens.has(term)) termScore += 12; // whole word in title
    else if (hay.title.includes(term)) termScore += 7; // substring of title
    if (hay.keywords.includes(term)) termScore += 4;
    if (hay.description.includes(term)) termScore += 2;

    if (termScore === 0) return 0; // a required term matched nothing → drop
    score += termScore;
  }

  return score + SEARCH_TYPE_META[doc.type].weight;
}

export interface SearchOptions {
  /** max results to return (default 20) */
  limit?: number;
  /** restrict to these content types (default: all) */
  types?: SearchType[];
}

/**
 * Rank the index against a query. Returns [] for an empty/blank query. Results
 * are sorted by score, then recency (newer first), then title.
 */
export async function searchContent(
  query: string,
  { limit = 20, types }: SearchOptions = {},
): Promise<SearchResult[]> {
  const fullQuery = query.trim().toLowerCase();
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const typeFilter = types && types.length ? new Set(types) : null;
  const index = await getSearchIndex();

  const hits: SearchResult[] = [];
  for (const doc of index) {
    if (typeFilter && !typeFilter.has(doc.type)) continue;
    const score = scoreDoc(doc, haystackOf(doc), terms, fullQuery);
    if (score > 0) hits.push({ ...doc, score });
  }

  hits.sort(
    (a, b) =>
      b.score - a.score ||
      (b.date ?? '').localeCompare(a.date ?? '') ||
      a.title.localeCompare(b.title),
  );

  return hits.slice(0, limit);
}
