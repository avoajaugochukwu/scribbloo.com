import 'server-only';

import { searchIndex } from './runtime-index';
import {
  SEARCH_TYPE_META,
  type SearchDoc,
  type SearchResult,
  type SearchType,
} from './search-shared';

/**
 * Site-wide search — ranks the unified index over EVERY content type (server side).
 *
 * The site has no DB. The index is a flat list of SearchDocs built at build time
 * from the file-based loaders (search-sources.ts -> runtime-index), then scanned
 * and ranked per query. ~1k docs is a trivial linear scan, so there is no external
 * search service and nothing ships to the client — querying happens server-side
 * (API route + /search page). Client-safe types/config live in `search-shared.ts`.
 * To add a content type, see search-sources.ts and plan/search.md.
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

  const hits: SearchResult[] = [];
  for (const doc of searchIndex) {
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
