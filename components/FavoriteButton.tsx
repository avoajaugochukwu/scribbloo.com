'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { HeartGlyph } from '@/components/icons';

const KEY = 'scribbloo_fav';

function readFavs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

interface FavoriteButtonProps {
  id: string;
  /** 'card' = floating circular heart on a page card; 'button' = labelled Save. */
  variant?: 'card' | 'button';
  className?: string;
}

export default function FavoriteButton({ id, variant = 'card', className }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(readFavs().has(id));
  }, [id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favs = readFavs();
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    localStorage.setItem(KEY, JSON.stringify([...favs]));
    const next = favs.has(id);
    setSaved(next);
    toast(next ? 'Saved to your collection' : 'Removed from collection');
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className={cn(
          'pressable inline-flex items-center justify-center gap-2 rounded-full border-[2.5px] border-ink px-5 py-3 font-display text-base font-semibold shadow-pop-sm transition-colors',
          saved ? 'bg-red text-white' : 'bg-cream text-ink',
          className,
        )}
      >
        <HeartGlyph filled={saved} className={saved ? 'text-white' : 'text-ink'} />
        <span>{mounted && saved ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      aria-pressed={saved}
      className={cn(
        'grid size-[34px] place-items-center rounded-full border-2 border-ink bg-white/90 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100',
        className,
      )}
    >
      <HeartGlyph filled={saved} className={cn('h-[17px] w-[17px]', saved ? 'text-red' : 'text-ink')} />
    </button>
  );
}
