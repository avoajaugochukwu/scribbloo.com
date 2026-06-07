import Image from 'next/image';
import Link from 'next/link';
import CategoryListDisplay from './coloring-pages/components/CategoryListDisplay';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import MobileHeroImages from '@/components/MobileHeroImages';
import PageHeading from '@/components/PageHeading';
import { Button } from '@/components/ui/button';

// --- SEO Metadata ---
export const metadata: Metadata = {
  title: 'Free Printable Coloring Pages for All Ages | Scribbloo',
  description: 'Download hundreds of free, high-quality printable coloring pages for kids, teens, and adults. New unicorns, animals, mandalas, and more added weekly!',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'Free Printable Coloring Pages for All Ages | Scribbloo',
    description: 'Download hundreds of free, high-quality printable coloring pages for kids, teens, and adults.',
    url: baseUrl,
    siteName: 'Scribbloo',
    images: [
      {
        url: `${baseUrl}/img/og-image-home.png`,
        width: 1200,
        height: 630,
        alt: 'Scribbloo Coloring Pages Collection',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Printable Coloring Pages for All Ages | Scribbloo',
    description: 'Download hundreds of free, high-quality printable coloring pages for kids, teens, and adults.',
  },
  robots: {
    index: true,
    follow: true,
  },
};
// --- End SEO Metadata ---

export default function Home() {
  // Remove previous Notion fetching and post mapping logic

  // --- JSON-LD Structured Data ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Scribbloo',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  // --- End Structured Data Prep ---

  const floaters = [
    { src: '/img/unicorn.png', alt: 'Unicorn coloring page example', pos: 'top-[4%] left-[1%] -rotate-12', delay: '0ms', priority: true },
    { src: '/img/dinosaur.png', alt: 'Dinosaur coloring page example', pos: 'top-[6%] right-[2%] rotate-6', delay: '120ms', priority: false },
    { src: '/img/butterfly.png', alt: 'Butterfly coloring page example', pos: 'bottom-[8%] left-[5%] rotate-3', delay: '240ms', priority: false },
    { src: '/img/fairy-girl.png', alt: 'Fairy coloring page example', pos: 'bottom-[6%] right-[3%] -rotate-6', delay: '360ms', priority: false },
  ];

  return (
    <div className="pb-8 md:pb-12">

      {/* --- Embed JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- End JSON-LD Script --- */}

      {/* Hero Section — sunburst backdrop + floating framed examples */}
      <section className="relative overflow-hidden border-b-2 border-ink bg-paper-deep">
        {/* Sunburst rays radiating from behind the headline */}
        <div
          aria-hidden="true"
          className="sunburst animate-spin-slow pointer-events-none absolute top-1/2 left-1/2 h-[160vw] w-[160vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.18] md:h-[120vh] md:w-[120vh]"
        />
        {/* Warm radial glow to soften ray edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 45%, var(--paper-deep) 30%, transparent 100%)',
          }}
        />

        <div className="relative container mx-auto flex flex-col items-center px-4 py-16 text-center md:min-h-[72vh] md:justify-center md:py-24">

          {/* Central Text Block */}
          <div className="z-10 order-1 mb-8 max-w-3xl md:order-none md:mb-0">
            <span className="animate-rise mb-5 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-1.5 font-display text-sm font-bold text-terracotta-deep shadow-pop-sm">
              ✶ 100% free · new pages weekly
            </span>
            <h1 className="animate-rise mb-6 font-display text-5xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl" style={{ animationDelay: '80ms' }}>
              <span className="text-retro">Free Printable Coloring Pages</span>{' '}
              <span className="text-ink">for All Ages</span>
            </h1>
            <p className="animate-rise mx-auto w-full text-lg text-ink/75 text-pretty sm:w-4/5 md:text-xl" style={{ animationDelay: '160ms' }}>
              Download high-quality coloring sheets for kids, teens, and grown-ups. From unicorns to mandalas — fresh pages added every week.
            </p>
            <div className="animate-rise mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '240ms' }}>
              <Button asChild size="xl">
                <Link href="/coloring-pages">Browse Pages →</Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/blog">Read the Blog</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Images Component */}
          <div className="order-2 mt-10 w-full md:hidden">
            <MobileHeroImages />
          </div>

          {/* Absolutely Positioned Images (Desktop/Tablet) */}
          {floaters.map((f) => (
            <div
              key={f.src}
              className={`animate-pop-in absolute z-0 hidden w-40 lg:w-44 ${f.pos} md:block`}
              style={{ animationDelay: f.delay }}
            >
              <div className="animate-float-y" style={{ animationDelay: f.delay }}>
                <div className="retro-frame shadow-pop-lg p-2.5">
                  <div className="relative aspect-[210/297] w-full overflow-hidden">
                    <Image
                      src={f.src}
                      alt={f.alt}
                      fill
                      sizes="176px"
                      className="object-contain"
                      priority={f.priority}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coloring Pages Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <PageHeading as="h2" title="Browse by Category" className="mb-10" />
        <div className="flex justify-center">
          <CategoryListDisplay />
        </div>
      </section>

    </div>
  );
}
