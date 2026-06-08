import { NextResponse } from 'next/server';

import { SEARCH_TYPE_ORDER, searchContent, type SearchType } from '@/lib/content/search';

/**
 * GET /api/search?q=<query>&limit=<n>&types=<a,b>
 *
 * Powers the header instant-search dropdown (and any future client search). The
 * index lives server-side, so only the ranked hits cross the wire. Cacheable at
 * the edge (Cloudflare) since results are a pure function of the content build.
 */

const MAX_LIMIT = 50;
const VALID_TYPES = new Set<SearchType>(SEARCH_TYPE_ORDER);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (!q) {
    return NextResponse.json({ query: '', results: [], total: 0 });
  }

  const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : 8;

  const types = (searchParams.get('types') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t): t is SearchType => VALID_TYPES.has(t as SearchType));

  const results = await searchContent(q, { limit, types });

  return NextResponse.json(
    { query: q, results, total: results.length },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=3600' } },
  );
}
