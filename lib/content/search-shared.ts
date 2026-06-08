/**
 * Client-safe search primitives — types, per-type display/ranking config, and
 * pure helpers. This file has NO `server-only` and NO content loaders, so it can
 * be imported from client components (the header dropdown, result rows) as well
 * as the server-side index in `search.ts`. Keep all fs/index logic out of here.
 */

export type SearchType =
  | 'coloring-page'
  | 'collection'
  | 'facet'
  | 'blog'
  | 'how-to-draw'
  | 'drawing-ideas'
  | 'tools';

export interface SearchTypeMeta {
  /** singular human label for a single result */
  label: string;
  /** heading used when grouping results of this type */
  plural: string;
  /** small relevance nudge so e.g. a matching collection outranks a single leaf */
  weight: number;
}

/**
 * Per-type display + ranking config. Order here is the order result groups are
 * shown on the /search page.
 */
export const SEARCH_TYPE_META: Record<SearchType, SearchTypeMeta> = {
  collection: { label: 'Category', plural: 'Categories', weight: 6 },
  facet: { label: 'Collection', plural: 'Collections', weight: 5 },
  'coloring-page': { label: 'Coloring page', plural: 'Coloring pages', weight: 2 },
  'how-to-draw': { label: 'Drawing tutorial', plural: 'How to draw', weight: 4 },
  'drawing-ideas': { label: 'Drawing ideas', plural: 'Drawing ideas', weight: 4 },
  tools: { label: 'Tool', plural: 'Tools', weight: 4 },
  blog: { label: 'Article', plural: 'From the blog', weight: 3 },
};

export const SEARCH_TYPE_ORDER = Object.keys(SEARCH_TYPE_META) as SearchType[];

export interface SearchDoc {
  /** stable unique id (`<type>:<url>`) */
  id: string;
  type: SearchType;
  title: string;
  description: string | null;
  /** canonical, ready-to-link href */
  url: string;
  /** thumbnail URL, or null when the content type/instance has no art */
  image: string | null;
  /** extra match tokens (tags, synonyms, url segments) — never shown */
  keywords: string[];
  /** ISO date for recency tie-breaks, or null */
  date: string | null;
}

/** A scored search hit (the doc plus why it ranked where it did). */
export interface SearchResult extends SearchDoc {
  score: number;
}

/** Group ranked results by type, preserving SEARCH_TYPE_ORDER. */
export function groupByType(
  results: SearchResult[],
): Array<{ type: SearchType; results: SearchResult[] }> {
  const buckets = new Map<SearchType, SearchResult[]>();
  for (const r of results) (buckets.get(r.type) ?? buckets.set(r.type, []).get(r.type)!).push(r);
  return SEARCH_TYPE_ORDER.filter((t) => buckets.has(t)).map((type) => ({
    type,
    results: buckets.get(type)!,
  }));
}
