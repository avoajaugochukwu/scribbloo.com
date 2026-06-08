'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/BrandMark';
import { SearchIcon } from '@/components/icons';

const navLinks = [
  { href: '/coloring-pages', label: 'Coloring Pages' },
  { href: '/drawing-ideas', label: 'Drawing Ideas' },
  { href: '/tools', label: 'Tools' },
  { href: '/blog', label: 'Blog' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [q, setQ] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/coloring-pages?q=${encodeURIComponent(term)}` : '/coloring-pages');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-ink bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="container mx-auto flex h-[74px] items-center gap-6 px-4 lg:px-7">
        <Link href="/" aria-label="Scribbloo home" className="shrink-0">
          <BrandMark />
        </Link>

        <nav className="ml-1 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-3.5 py-2 font-display text-[16.5px] font-medium transition-colors',
                  active
                    ? 'bg-ink text-cream'
                    : 'text-ink hover:bg-ink/[0.06]',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <form
            onSubmit={submitSearch}
            className="hidden w-[230px] items-center gap-2.5 rounded-full border-2 border-ink bg-cream px-4 py-2 lg:flex"
          >
            <SearchIcon className="h-[18px] w-[18px] shrink-0 text-ink-faint" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pages…"
              aria-label="Search coloring pages"
              className="w-full bg-transparent font-sans text-[15px] font-semibold text-ink outline-none placeholder:text-ink-faint"
            />
          </form>

          <Link
            href="/coloring-pages"
            className="pressable shadow-pop-sm inline-flex items-center rounded-full border-[2.5px] border-ink bg-red px-4 py-2 font-display text-[15px] font-semibold text-white"
          >
            Start coloring
          </Link>
        </div>
      </div>
    </header>
  );
}
