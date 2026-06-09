import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { getRootHub } from '@/lib/content/collections';

const exploreLinks = [
  { href: '/coloring-pages', label: 'Coloring Pages' },
  { href: '/how-to-draw', label: 'How to Draw' },
  { href: '/drawing-ideas', label: 'Drawing Ideas' },
  { href: '/tools', label: 'Tools' },
  { href: '/blog', label: 'Blog' },
];

const helloLinks = [
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/terms-of-service', label: 'Terms' },
];

export async function Footer() {
  const { themes } = await getRootHub();
  const year = new Date().getFullYear();
  const themeLinks = themes.slice(0, 6);

  return (
    <footer className="mt-10 border-t-2 border-ink">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 pt-12 pb-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] lg:px-7">
        <div>
          <Link href="/" aria-label="Scribbloo home">
            <BrandMark />
          </Link>
          <p className="mt-3.5 max-w-[34ch] font-semibold text-ink-soft">
            Free coloring pages, drawing ideas and tools that make creativity easy for every age.
          </p>
        </div>

        <FooterCol title="Explore" links={exploreLinks} />

        <nav>
          <h4 className="mb-3.5 font-display text-base font-semibold">Themes</h4>
          <ul className="grid gap-2.5">
            {themeLinks.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  {t.category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <FooterCol title="Hello" links={helloLinks} />
      </div>

      <div className="container mx-auto px-4 lg:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-line py-5 text-sm font-bold text-ink-soft">
          <span>© {year} Scribbloo. Made for messy, joyful coloring.</span>
          <span>Privacy · Terms · Print responsibly 🖍️</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav>
      <h4 className="mb-3.5 font-display text-base font-semibold">{title}</h4>
      <ul className="grid gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              prefetch={false}
              className="font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
