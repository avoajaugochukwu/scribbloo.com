'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center">
          <Image src="/img/logo.svg" alt="Scribbloo Logo" width={150} height={100} priority />
        </Link>

        {/* Nav + CTA */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-pink-100 text-fuchsia-700'
                      : 'text-foreground/70 hover:bg-pink-50 hover:text-fuchsia-700',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Button
            asChild
            size="sm"
            className="ml-1 hidden rounded-full font-bold shadow-sm sm:inline-flex"
          >
            <Link href="/coloring-pages">Browse pages</Link>
          </Button>
        </div>
      </div>

      {/* Bold brand gradient underline */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400" />
    </header>
  );
}
