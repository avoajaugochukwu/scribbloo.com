import type { Metadata } from 'next';
import Link from 'next/link';

import { baseUrl } from '@/app/metadata';
import { groupByType, searchContent, SEARCH_TYPE_META } from '@/lib/content/search';
import { SiteSearch } from '@/components/search/SiteSearch';
import { SearchResultRow } from '@/components/search/SearchResultRow';
import PageHeading from '@/components/PageHeading';

const RESULT_LIMIT = 60;

/**
 * Site-wide search results. Server-rendered from the same index the API uses, so
 * it works with JavaScript disabled and is fully shareable via ?q. Search result
 * pages carry no unique evergreen content, so they are noindex (but follow).
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Scribbloo coloring pages, drawing tutorials, and articles.',
  alternates: { canonical: `${baseUrl}/search` },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const results = query ? await searchContent(query, { limit: RESULT_LIMIT }) : [];
  const groups = groupByType(results);

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <PageHeading
        title="Search"
        subtitle={
          query
            ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`
            : 'Find coloring pages, drawing tutorials, and articles.'
        }
        className="mb-8"
      />

      <div className="mx-auto mb-12 max-w-2xl">
        <SiteSearch variant="page" initialQuery={query} autoFocus={!query} />
      </div>

      {query && results.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display text-xl font-bold text-ink">
            No results for “{query}” ✏️
          </p>
          <p className="mt-2 font-sans text-ink-soft">
            Try a different word, or browse all{' '}
            <Link href="/coloring-pages" className="font-bold text-blue underline">
              coloring pages
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-10">
          {groups.map(({ type, results: group }) => (
            <section key={type}>
              <h2 className="eyebrow mb-3 text-ink-soft">
                {SEARCH_TYPE_META[type].plural}{' '}
                <span className="text-ink-faint">({group.length})</span>
              </h2>
              <div className="space-y-1">
                {group.map((result) => (
                  <SearchResultRow key={result.id} result={result} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
