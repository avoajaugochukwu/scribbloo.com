import Link from 'next/link';
import Image from 'next/image';

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
    <footer className="mt-auto border-t-4 border-pink-200 bg-gradient-to-b from-pink-50 to-amber-50">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        {/* Brand blurb */}
        <div className="space-y-3">
          <Image src="/img/logo.svg" alt="Scribbloo Logo" width={150} height={100} />
          <p className="max-w-xs text-sm text-muted-foreground">
            Hundreds of free, high-quality printable coloring pages for kids, teens, and
            adults. New pages added weekly!
          </p>
        </div>

        {/* Explore */}
        <nav className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-fuchsia-700">
            Explore
          </h2>
          <ul className="space-y-2">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-fuchsia-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-fuchsia-700">
            Legal
          </h2>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="text-sm text-muted-foreground transition-colors hover:text-fuchsia-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-pink-200/70">
        <div className="container mx-auto px-4 py-5 lg:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} Scribbloo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
