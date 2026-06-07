'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/coloring-pages', label: 'Coloring Pages' },
  { href: '/blog', label: 'Blog' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-ink bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4 lg:px-6">
        {/* Logo with a little spinning sun mark */}
        <Link
          href="/"
          className="group mr-auto flex items-center gap-2 text-ink"
          aria-label="Scribbloo home"
        >
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-mustard text-ink transition-transform duration-500 group-hover:rotate-90"
          >
            <SunMark className="size-4" />
          </span>
          <Logo className="h-6 sm:h-7" />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 sm:gap-1.5">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full border-2 px-2.5 py-1.5 font-display text-sm font-bold transition-colors sm:px-3.5',
                  active
                    ? 'border-ink bg-mustard text-ink'
                    : 'border-transparent text-ink/70 hover:border-ink/20 hover:bg-cream hover:text-ink',
                )}
              >
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">
                  {link.label === 'Coloring Pages' ? 'Pages' : link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
          <Link href="/coloring-pages">Browse →</Link>
        </Button>
      </div>

      {/* Retro printed accent stripe */}
      <div className="flex h-1.5 w-full">
        <span className="h-full flex-1 bg-terracotta" />
        <span className="h-full flex-1 bg-mustard" />
        <span className="h-full flex-1 bg-teal" />
        <span className="h-full flex-1 bg-rose" />
      </div>
    </header>
  );
}

function SunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="12"
          y1="1.5"
          x2="12"
          y2="4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
    </svg>
  );
}
