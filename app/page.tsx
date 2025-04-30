import Image from 'next/image';
import CategoryListDisplay from './coloring-pages/components/CategoryListDisplay';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
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
    // Removed top padding to bring breadcrumb up
    <div className="container mx-auto px-4 pb-8 md:pb-12">

      {/* --- Embed JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- End JSON-LD Script --- */}

      {/* New Hero Section - Reduced min-height */}
      <section className="relative flex items-center justify-center text-center min-h-[50vh] md:min-h-[60vh] mb-16">

        {/* Central Text Block */}
        {/* z-10 ensures text is layered above the images (which will be z-0) */}
        <div className="z-10 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-5xl lg:text-6xl mb-6 text-pink-600">
            Free Printable Coloring Pages for All Ages
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground w-4/5 mx-auto">
            Download high-quality coloring sheets for kids, teens, and adults. From unicorns to mandalas—new pages added weekly.
          </p>
          {/* Optional: Add a Call to Action Button here */}
          {/* <div className="mt-8">
            <Link href="/coloring-pages" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90">
              Browse Pages
            </Link>
          </div> */}
        </div>

        {/* Absolutely Positioned Images */}
        {/* These are hidden on small screens (below md) using 'hidden md:block' */}
        {/* z-0 layers them below the text block */}

        {/* Unicorn (Top Left) - Moved higher */}
        <div className="absolute top-[0%] left-[2%] transform -rotate-12 hidden md:block z-0">
          <Image
            src="/img/unicorn.png" // Ensure this path is correct
            alt="Unicorn coloring page example"
            width={180} // Adjust size
            height={270} // Adjust size maintaining aspect ratio
            className="rounded-xl shadow-lg border-4 border-yellow-200" // Added border like screenshot
            priority // Prioritize loading for LCP if it's a key visual element
          />
        </div>

        {/* Dinosaur (Top Right) - Moved higher */}
        <div className="absolute top-[1%] right-[4%] transform rotate-6 hidden md:block z-0">
          <Image
            src="/img/dinosaur.png" // Ensure this path is correct
            alt="Dinosaur coloring page example"
            width={180} // Adjust size
            height={270} // Adjust size
            className="rounded-xl shadow-lg border-4 border-green-200" // Added border
          />
        </div>

        {/* Butterfly (Bottom Left) - Moved further down and left */}
        <div className="absolute bottom-[10%] left-[8%] transform rotate-3 hidden md:block z-0">
          <Image
            src="/img/butterfly.png" // Ensure this path is correct
            alt="Butterfly coloring page example"
            width={180} // Adjust size
            height={270} // Adjust size
            className="rounded-xl shadow-lg border-4 border-blue-200" // Added border
          />
        </div>

        {/* Fairy (Bottom Right) - Moved further down and right */}
        <div className="absolute bottom-[5%] right-[2%] transform -rotate-6 hidden md:block z-0">
          <Image
            src="/img/fairy-girl.png" // Ensure this path is correct
            alt="Fairy coloring page example"
            width={180} // Adjust size
            height={270} // Adjust size
            className="rounded-xl shadow-lg border-4 border-pink-200" // Added border
          />
        </div>
      </section>

      {/* You can add other sections back below here if needed */}
      {/* Example: */}
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
