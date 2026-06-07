import CategoryListDisplay from './components/CategoryListDisplay'; // Import the new component
import PageBreadcrumb from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';

export const metadata: Metadata = {
  title: 'Free Printable Coloring Pages for All Ages ',
  description: 'Browse categories and find free printable coloring pages for kids and adults. Download unicorns, animals, mandalas, and more!',
  alternates: {
    canonical: `${baseUrl}/coloring-pages`,
  },
  openGraph: {
    title: 'Free Printable Coloring Pages for All Ages',
    description: 'Browse categories and find free printable coloring pages for kids and adults.',
    url: `${baseUrl}/coloring-pages`,
    siteName: 'Scribbloo',
    type: 'website',
  },
  twitter: {
    card: 'summary', // or summary_large_image if you add an image
    title: 'Free Printable Coloring Pages for All Ages',
    description: 'Browse categories and find free printable coloring pages for kids and adults.',
    // images: [`${baseUrl}/img/og-image-coloring-index.png`], // Add if you have a specific image
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ColoringPages() {
  // --- JSON-LD Structured Data ---
  const pageUrl = `${baseUrl}/coloring-pages`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage', // This page lists a collection of categories/items
    name: metadata.title, // Use title from metadata
    description: metadata.description, // Use description from metadata
    url: pageUrl,
    // Add BreadcrumbList schema
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl // URL for Home
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Coloring Pages', // Name of the current page
          item: pageUrl // URL for the current page
        }
      ]
    }
    // Optional: If you list categories directly here, you could add mainEntity: { @type: ItemList ... }
  };
  // --- End Structured Data Prep ---

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">

      {/* --- Embed JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- End JSON-LD Script --- */}

      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Coloring Pages', href: '/coloring-pages' },
        ]}
      />
      <PageHeading
        title="Coloring Pages"
        subtitle="Pick a category and start coloring — every sheet is free to print and download."
        className="mb-8 md:mb-10"
      />
      <section>
        <CategoryListDisplay />
      </section>
    </div>
  );
}