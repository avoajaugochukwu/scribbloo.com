'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { SearchIcon } from '@/components/icons';
import type { SearchResult } from '@/lib/content/search-shared';
import { SearchResultRow } from './SearchResultRow';

interface SiteSearchProps {
  /** 'header' shows a live dropdown; 'page' is a larger box that submits to /search */
  variant?: 'header' | 'page';
  initialQuery?: string;
  autoFocus?: boolean;
  className?: string;
}

const DROPDOWN_LIMIT = 8;
const DEBOUNCE_MS = 150;

export function SiteSearch({
  variant = 'header',
  initialQuery = '',
  autoFocus = false,
  className,
}: SiteSearchProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const showDropdown = variant === 'header';

  // Debounced live query for the header dropdown.
  useEffect(() => {
    if (!showDropdown) return;
    const term = q.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&limit=${DROPDOWN_LIMIT}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [q, showDropdown]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!showDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showDropdown]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    setOpen(false);
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  const dropdownOpen = showDropdown && open && q.trim().length > 0;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <form
        onSubmit={submit}
        role="search"
        className={cn(
          'flex items-center gap-2.5 rounded-full border-2 border-ink bg-cream',
          variant === 'page' ? 'px-5 py-3 shadow-pop-sm' : 'px-4 py-2',
        )}
      >
        <SearchIcon
          className={cn('shrink-0 text-ink-faint', variant === 'page' ? 'h-5 w-5' : 'h-[18px] w-[18px]')}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder={variant === 'page' ? 'Search coloring pages, tutorials, articles…' : 'Search…'}
          aria-label="Search Scribbloo"
          className={cn(
            'w-full bg-transparent font-sans font-semibold text-ink outline-none placeholder:text-ink-faint',
            variant === 'page' ? 'text-[17px]' : 'text-[15px]',
          )}
        />
      </form>

      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-3xl border-2 border-ink bg-paper p-2 shadow-pop-lg">
          {loading && results.length === 0 ? (
            <p className="px-3 py-6 text-center font-display font-semibold text-ink-soft">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center font-display font-semibold text-ink-soft">
              No matches for “{q.trim()}” ✏️
            </p>
          ) : (
            <>
              {results.map((r) => (
                <SearchResultRow key={r.id} result={r} compact onSelect={() => setOpen(false)} />
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(q.trim())}`}
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-2xl px-3 py-2.5 text-center font-display text-[15px] font-bold text-ink hover:bg-cream"
              >
                See all results for “{q.trim()}” →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
