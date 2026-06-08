'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ColoringPage } from '@/lib/content/types';
import { cn } from '@/lib/utils';
import ColoringPageImage from './ColoringPageImage';

export interface GalleryItem {
  page: ColoringPage;
  href: string;
  isNew?: boolean;
}

type SortKey = 'newest' | 'az';

interface ColoringGalleryProps {
  items: GalleryItem[];
  contextLabel: string;
  /** show the search + sort + view controls (off for short related strips) */
  withControls?: boolean;
}

const GridIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current [stroke-width:2.2]">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const ColsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current [stroke-width:2.2]">
    <rect x="3" y="3" width="5" height="18" />
    <rect x="10" y="3" width="5" height="12" />
    <rect x="17" y="3" width="5" height="15" />
  </svg>
);

export default function ColoringGallery({
  items,
  contextLabel,
  withControls = true,
}: ColoringGalleryProps) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<'grid' | 'masonry'>('grid');

  // Seed the search box from a ?q= passed by the global header search.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQ(initial);
  }, []);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = items;
    if (term) {
      list = items.filter(({ page }) =>
        `${page.title} ${page.tags.join(' ')}`.toLowerCase().includes(term),
      );
    }
    const sorted = [...list];
    if (sort === 'newest') sorted.sort((a, b) => b.page.createdAt.localeCompare(a.page.createdAt));
    if (sort === 'az') sorted.sort((a, b) => a.page.title.localeCompare(b.page.title));
    return sorted;
  }, [items, q, sort]);

  return (
    <div>
      {withControls && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full items-center gap-2.5 rounded-full border-2 border-ink bg-cream px-4 py-2 sm:max-w-xs">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-ink-faint [stroke-width:2.4]">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search these pages…"
              className="w-full bg-transparent font-sans text-[15px] font-semibold text-ink outline-none placeholder:text-ink-faint"
            />
          </label>

          <div className="flex items-center gap-4">
            <span className="font-display text-base font-semibold text-ink-soft">
              {visible.length} page{visible.length === 1 ? '' : 's'}
            </span>
            <label className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2 font-display text-[15px] font-medium">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-transparent font-display font-semibold outline-none"
              >
                <option value="newest">Newest</option>
                <option value="az">A → Z</option>
              </select>
            </label>
            <div className="inline-flex overflow-hidden rounded-full border-2 border-ink">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                className={cn('grid place-items-center px-3 py-2', view === 'grid' ? 'bg-ink text-cream' : 'text-ink')}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                aria-label="Masonry view"
                aria-pressed={view === 'masonry'}
                onClick={() => setView('masonry')}
                className={cn('grid place-items-center px-3 py-2', view === 'masonry' ? 'bg-ink text-cream' : 'text-ink')}
              >
                <ColsIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-16 text-center font-display font-bold text-ink-soft">
          No pages match that search — try clearing it. ✏️
        </p>
      ) : view === 'masonry' ? (
        <div className="gap-5 [column-count:2] sm:[column-count:3] lg:[column-count:4]">
          {visible.map((it, i) => (
            <div key={it.href} className="mb-5 break-inside-avoid">
              <ColoringPageImage
                coloringPage={it.page}
                href={it.href}
                contextLabel={contextLabel}
                tintIndex={i}
                isNew={it.isNew}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((it, i) => (
            <ColoringPageImage
              key={it.href}
              coloringPage={it.page}
              href={it.href}
              contextLabel={contextLabel}
              priority={i < 4}
              tintIndex={i}
              isNew={it.isNew}
            />
          ))}
        </div>
      )}
    </div>
  );
}
