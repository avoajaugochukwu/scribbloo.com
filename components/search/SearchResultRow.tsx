import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { SEARCH_TYPE_META, type SearchType, type SearchResult } from '@/lib/content/search-shared';

/** Per-type badge tint (pale fill + matching ink). Keeps result types scannable. */
const TYPE_TINT: Record<SearchType, string> = {
  collection: 'bg-purple-t text-purple',
  facet: 'bg-pink-t text-pink',
  'coloring-page': 'bg-blue-t text-blue',
  'how-to-draw': 'bg-green-t text-green',
  'drawing-ideas': 'bg-teal-t text-teal',
  tools: 'bg-orange-t text-orange',
  blog: 'bg-yellow-t text-yellow',
};

interface SearchResultRowProps {
  result: SearchResult;
  /** tighter layout for the header dropdown */
  compact?: boolean;
  /** called on click (e.g. to close the dropdown) */
  onSelect?: () => void;
}

export function SearchResultRow({ result, compact = false, onSelect }: SearchResultRowProps) {
  const meta = SEARCH_TYPE_META[result.type];
  const size = compact ? 44 : 64;

  return (
    <Link
      href={result.url}
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border-2 border-transparent transition-colors hover:border-ink hover:bg-cream',
        compact ? 'p-2' : 'p-3',
      )}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-paper"
        style={{ width: size, height: size }}
      >
        {result.image ? (
          <Image
            src={result.image}
            alt=""
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-ink-faint">
            {result.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex shrink-0 rounded-full px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide',
              TYPE_TINT[result.type],
            )}
          >
            {meta.label}
          </span>
        </div>
        <p
          className={cn(
            'mt-1 truncate font-display font-bold text-ink group-hover:text-ink',
            compact ? 'text-[15px]' : 'text-[17px]',
          )}
        >
          {result.title}
        </p>
        {!compact && result.description && (
          <p className="mt-0.5 line-clamp-1 font-sans text-[14px] text-ink-soft">
            {result.description}
          </p>
        )}
      </div>
    </Link>
  );
}
