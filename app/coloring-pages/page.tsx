import Link from 'next/link';
import React from 'react'; // Needed for React.Fragment
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"; // Import breadcrumb components
import CategoryListDisplay from './components/CategoryListDisplay'; // Import the new component
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

      <Breadcrumb className="mb-4 md:mb-6">
        <BreadcrumbList>
          <React.Fragment key="home">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-pink-600 hover:text-pink-700">
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="mx-1 text-muted-foreground">&gt;&gt;</span>
            </BreadcrumbSeparator>
          </React.Fragment>
          <BreadcrumbItem key="coloring-pages">
            <BreadcrumbPage className="font-medium text-pink-800">Coloring Pages</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 md:mb-6">
        Coloring Pages
      </h1>
      <section>
        <CategoryListDisplay />
      </section>
    </div>
  );
}