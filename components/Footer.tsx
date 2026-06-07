import Link from 'next/link';
import { Logo } from '@/components/Logo';

const exploreLinks = [
  { href: '/', label: 'Home' },
  { href: '/coloring-pages', label: 'Coloring Pages' },
  { href: '/blog', label: 'Blog' },
];

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-paper-deep">
      {/* Scalloped top edge — like the trim on a paper banner */}
      <div
        aria-hidden="true"
        className="absolute -top-3 left-0 h-3 w-full text-paper-deep"
        style={{
          background: 'currentColor',
          maskImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='12' viewBox='0 0 40 12'%3E%3Cpath d='M0 12 V6 a20 20 0 0 1 40 0 V12 Z' fill='black'/%3E%3C/svg%3E\")",
          maskSize: '40px 12px',
          maskRepeat: 'repeat-x',
          WebkitMaskImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='12' viewBox='0 0 40 12'%3E%3Cpath d='M0 12 V6 a20 20 0 0 1 40 0 V12 Z' fill='black'/%3E%3C/svg%3E\")",
          WebkitMaskSize: '40px 12px',
          WebkitMaskRepeat: 'repeat-x',
        }}
      />

      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 pt-14 pb-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        {/* Brand blurb */}
        <div className="space-y-4">
          <Logo className="h-7 text-ink" />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Hundreds of free, high-quality printable coloring pages for kids,
            teens, and grown-ups. Fresh sheets added every week.
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-mustard px-3 py-1 font-display text-xs font-bold text-ink">
            ✶ 100% free · new pages weekly
          </span>
        </div>

        {/* Explore */}
        <nav className="space-y-4">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-terracotta-deep">
            Explore
          </h2>
          <ul className="space-y-2.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-display font-semibold text-ink/75 transition-colors hover:text-terracotta"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav className="space-y-4">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-teal-deep">
            Legal
          </h2>
          <ul className="space-y-2.5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="font-display font-semibold text-ink/75 transition-colors hover:text-terracotta"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container mx-auto px-4 lg:px-6">
        <hr className="dotted-rule" />
        <p className="py-6 text-center font-display text-sm font-semibold text-muted-foreground">
          &copy; {currentYear} Scribbloo · Made with crayons &amp; coffee.
        </p>
      </div>
    </footer>
  );
}
