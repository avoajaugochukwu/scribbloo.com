import Image from 'next/image';
import CategoryListDisplay from './coloring-pages/components/CategoryListDisplay';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import MobileHeroImages from '@/components/MobileHeroImages';
// Keep Link if you plan to add other sections with links later
// import Link from 'next/link';

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

export const revalidate = 3600;

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
    // Removed top padding to bring breadcrumb up
    <div className="container mx-auto px-4 pb-8 md:pb-12">

      {/* --- Embed JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- End JSON-LD Script --- */}

      {/* Updated Hero Section */}
      {/* Using flex column for mobile, centering items */}
      {/* On md+, using relative positioning for the desktop image layout */}
      <section className="flex flex-col items-center text-center mb-16 md:relative md:justify-center md:min-h-[60vh]">

        {/* Central Text Block */}
        {/* Order 1 on flex, z-10 for desktop absolute layout */}
        <div className="z-10 max-w-3xl order-1 md:order-none mb-8 md:mb-0"> {/* Added margin-bottom for mobile spacing */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-5xl lg:text-6xl mb-6 text-pink-600">
            Free Printable Coloring Pages for All Ages
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground w-full sm:w-4/5 mx-auto"> {/* Adjusted width */}
            Download high-quality coloring sheets for kids, teens, and adults. From unicorns to mandalas—new pages added weekly.
          </p>
          {/* Optional: Add a Call to Action Button here */}
          {/* <div className="mt-8">
            <Link href="/coloring-pages" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90">
              Browse Pages
            </Link>
          </div> */}
        </div>

        {/* Mobile Images Component */}
        {/* Order 2 on flex (below text), hidden on md+ */}
        <div className="order-2 md:hidden w-full mt-6"> {/* Added margin-top for spacing */}
           <MobileHeroImages />
        </div>


        {/* Absolutely Positioned Images (Desktop/Tablet) */}
        {/* These remain hidden on small screens (below md) using 'hidden md:block' */}
        {/* z-0 layers them below the text block */}

        {/* Unicorn (Top Left) */}
        <div className="absolute top-[0%] left-[2%] transform -rotate-12 hidden md:block z-0">
          <Image
            src="/img/unicorn.png"
            alt="Unicorn coloring page example"
            width={180}
            height={270}
            className="rounded-xl shadow-lg border-4 border-yellow-200"
            priority
          />
        </div>

        {/* Dinosaur (Top Right) */}
        <div className="absolute top-[1%] right-[4%] transform rotate-6 hidden md:block z-0">
          <Image
            src="/img/dinosaur.png"
            alt="Dinosaur coloring page example"
            width={180}
            height={270}
            className="rounded-xl shadow-lg border-4 border-green-200"
          />
        </div>

        {/* Butterfly (Bottom Left) */}
        <div className="absolute bottom-[10%] left-[8%] transform rotate-3 hidden md:block z-0">
          <Image
            src="/img/butterfly.png"
            alt="Butterfly coloring page example"
            width={180}
            height={270}
            className="rounded-xl shadow-lg border-4 border-blue-200"
          />
        </div>

        {/* Fairy (Bottom Right) */}
        <div className="absolute bottom-[5%] right-[2%] transform -rotate-6 hidden md:block z-0">
          <Image
            src="/img/fairy-girl.png"
            alt="Fairy coloring page example"
            width={180}
            height={270}
            className="rounded-xl shadow-lg border-4 border-pink-200"
          />
        </div>
      </section>

      {/* Coloring Pages Section */}
      <section className="my-16">
        <h2 className="text-3xl font-bold text-center mb-10">Coloring Pages</h2>
        {/* Added flex wrapper to center the CategoryListDisplay component */}
        <div className="flex justify-center">
          <CategoryListDisplay />
        </div>
      </section>
     

    </div>
  );
}
