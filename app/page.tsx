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

  return (
    <div className="pb-8 md:pb-12">

      {/* --- Embed JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- End JSON-LD Script --- */}

      {/* Hero Section — soft brand wash behind the headline + floating examples */}
      <section className="bg-hero-glow">
        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:relative md:min-h-[68vh] md:justify-center md:py-24">

          {/* Central Text Block */}
          <div className="z-10 order-1 mb-8 max-w-3xl md:order-none md:mb-0">
            <span className="mb-4 inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-fuchsia-700 shadow-sm ring-1 ring-pink-200">
              🎨 100% free · new pages weekly
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              <span className="text-gradient-brand">Free Printable Coloring Pages</span>{' '}
              <span className="text-foreground">for All Ages</span>
            </h1>
            <p className="mx-auto w-full text-lg text-muted-foreground text-pretty sm:w-4/5 md:text-xl">
              Download high-quality coloring sheets for kids, teens, and adults. From unicorns to mandalas—new pages added weekly.
            </p>
            <div className="mt-8">
              <Button asChild size="xl" className="shadow-md">
                <Link href="/coloring-pages">Browse Pages →</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Images Component */}
          <div className="order-2 mt-8 w-full md:hidden">
            <MobileHeroImages />
          </div>

          {/* Absolutely Positioned Images (Desktop/Tablet) */}
          {/* Unicorn (Top Left) */}
          <div className="absolute top-[2%] left-[2%] z-0 hidden -rotate-12 md:block">
            <Image
              src="/img/unicorn.png"
              alt="Unicorn coloring page example"
              width={180}
              height={270}
              className="rounded-2xl border-[6px] border-white shadow-xl ring-4 ring-yellow-300"
              priority
            />
          </div>

          {/* Dinosaur (Top Right) */}
          <div className="absolute top-[3%] right-[4%] z-0 hidden rotate-6 md:block">
            <Image
              src="/img/dinosaur.png"
              alt="Dinosaur coloring page example"
              width={180}
              height={270}
              className="rounded-2xl border-[6px] border-white shadow-xl ring-4 ring-emerald-300"
            />
          </div>

          {/* Butterfly (Bottom Left) */}
          <div className="absolute bottom-[8%] left-[8%] z-0 hidden rotate-3 md:block">
            <Image
              src="/img/butterfly.png"
              alt="Butterfly coloring page example"
              width={180}
              height={270}
              className="rounded-2xl border-[6px] border-white shadow-xl ring-4 ring-sky-300"
            />
          </div>

          {/* Fairy (Bottom Right) */}
          <div className="absolute right-[2%] bottom-[4%] z-0 hidden -rotate-6 md:block">
            <Image
              src="/img/fairy-girl.png"
              alt="Fairy coloring page example"
              width={180}
              height={270}
              className="rounded-2xl border-[6px] border-white shadow-xl ring-4 ring-pink-300"
            />
          </div>
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
