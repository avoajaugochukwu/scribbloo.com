import { getImagesByCategorySlug } from '@/lib/coloringPages';
import Link from 'next/link';
import ColoringPageImage from './components/ColoringPageImage';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Metadata } from 'next';
import CategoryWithImages from '@/types/categorywithimages.type';
import ImageType from '@/types/image.type';
import Image from 'next/image';
import React from 'react';
import { Constants } from '@/config/constants';
import { baseUrl } from '@/app/metadata';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  if (!categoryData) {
    notFound();
  }

  const images = categoryData.images || [];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    { label: categoryData.name, href: `/coloring-pages/${categoryData.slug}` }, // Current page is last
  ];

  // --- Prepare JSON-LD Structured Data ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage', // Type of page
    name: categoryData.seo_title || `${categoryData.name} Coloring Pages`, // Use SEO title or generate
    description: categoryData.seo_description || `Explore our collection of ${categoryData.name} coloring pages.`, // Use SEO description or generate
    url: `${baseUrl}/coloring-pages/${categoryData.slug}`, // Canonical URL
    // Optional: Define the main content of the page (the list of images)
    // This can get complex; start simple or expand later if needed.
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: images.map((image, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'ImageObject',
          name: image.title || 'Coloring Page',
          contentUrl: `${Constants.SUPABASE_COLORING_IMAGES_BUCKET}${image.image_url}`,
          // Add description if available
          // description: image.description,
        }
      }))
    }
  };
  // --- End Structured Data Prep ---

  return (
    <div className="container mx-auto px-4 mb-20">
      {/* --- Embed JSON-LD Script --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* --- End JSON-LD Script --- */}

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {index === breadcrumbItems.length - 1 ? (
                  // Render last item as BreadcrumbPage (not a link)
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  // Render other items as links
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                // Add separator if not the last item
                <BreadcrumbSeparator />
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6 mt-4"> {/* Added mt-4 for spacing */}
        {categoryData.name} Coloring Pages
      </h1>

      <section className="w-4/6">
        <Image 
          src={Constants.SUPABASE_HERO_IMAGES_BUCKET + categoryData.hero_image_url} 
          alt={categoryData.name} 
          width={1000} 
          height={1000} 
          className="w-full h-auto"
        />
        {/* Remove or comment out this section as categoryData.description doesn't exist */}
        {categoryData.description && (
          <p className="text-lg text-gray-600 my-6"
            dangerouslySetInnerHTML={
              { __html: categoryData.description.replace(/"/g, '&quot;').replace(/'/g, '&apos;') }
            } />
        )}
      </section>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Map over images and render the component */}
          {images.map((image: ImageType) => (
            <ColoringPageImage
              key={image.id}
              image={image}
              categoryName={categoryData.name}
            />
          ))}
        </div>
      ) : (
        <p>No coloring pages found in the &quot;{categoryData.name}&quot; category yet. Check back soon!</p>
      )}
    </div>
  );
}

// Optional: Generate metadata dynamically
export async function generateMetadata(
  { params }: CategoryPageProps,
): Promise<Metadata> {
  const { categorySlug } = await params;
  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  if (!categoryData) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  // --- SEO Optimization ---
  // Use specific SEO title/description from DB if available, otherwise generate
  const title = categoryData.seo_title
    ? categoryData.seo_title
    : `${categoryData.name} Coloring Pages - Free Printables | Scribbloo`; // Add your site name

  const description = categoryData.seo_description
    ? categoryData.seo_description
    : `Explore our collection of ${categoryData.name} coloring pages. Download and print free images for kids and adults on Scribbloo.`; // Add site name/context

  // Construct the canonical URL for this specific category page
  const canonicalUrl = `${baseUrl}/coloring-pages/${categoryData.slug}`;

  // Construct hero image URL for Open Graph (if it exists)
  const ogImageUrl = categoryData.hero_image_url
    ? `${Constants.SUPABASE_HERO_IMAGES_BUCKET}${categoryData.hero_image_url}`
    : undefined; // Use undefined if no hero image

  return {
    title,
    description,
    // Add canonical URL
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl, // Use canonical URL for OG
      siteName: 'Scribbloo', // Add your site name
      // Add OG image if available
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          // Optionally add width/height if known, helps FB crawler
          // width: 800,
          // height: 600,
          alt: `${categoryData.name} Hero Image`,
        }
      ] : [], // Empty array if no image
      type: 'website', // Or 'article' depending on how you view the page
    },
    // Optional: Add Twitter card metadata
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
