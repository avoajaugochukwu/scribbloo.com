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
import ColoringPage from '@/types/coloringpage.type';
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
    name: categoryData.seo_title || `${categoryData.name} Coloring Pages`,
    description: categoryData.seo_meta_description || `Explore our collection of ${categoryData.name} coloring pages.`,
    url: `${baseUrl}/coloring-pages/${categoryData.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: images.map((image, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'ImageObject',
          name: image.title || 'Coloring Page',
          contentUrl: `${Constants.SUPABASE_COLORING_PAGES_BUCKET_URL}${image.image_url}`,
          // Add description if available
          // description: image.description,
        }
      }))
    }
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
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage className="font-medium text-pink-800">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="text-pink-600 hover:text-pink-700">
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator>
                  <span className="mx-1 text-muted-foreground">&gt;&gt;</span>
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 md:mb-6">
        {categoryData.name} Coloring Pages
      </h1>

      {categoryData.hero_image && (
        <section className="mb-8 md:mb-12 bg-red-900 py-10 md:py-16 rounded-lg">
          <div className="flex justify-center items-center">
            <Image
              src={Constants.SUPABASE_HERO_IMAGES_BUCKET_URL + categoryData.hero_image}
              alt={`${categoryData.name} category hero image`}
              width={500}
              height={750}
              className="rounded-md shadow-xl transform -rotate-3"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </section>
      )}

      {categoryData.description && (
        <section className="max-w-3xl mx-auto text-center text-muted-foreground">
          <p>{categoryData.description}</p>
        </section>
      )}

      {images.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {images.map((image: ColoringPage) => (
            <ColoringPageImage
              key={image.id}
              image={image}
              categoryName={categoryData.name}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          No coloring pages found in the &quot;{categoryData.name}&quot; category yet. Check back soon!
        </p>
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
  const title = categoryData.seo_title
    ? categoryData.seo_title
    : `${categoryData.name} Coloring Pages - Free Printables | Scribbloo`; // Add your site name

  const description = categoryData.seo_meta_description
    ? categoryData.seo_meta_description
    : `Explore our collection of ${categoryData.name} coloring pages. Download and print free images for kids and adults on Scribbloo.`; // Add site name/context

  const canonicalUrl = `${baseUrl}/coloring-pages/${categoryData.slug}`;

  const ogImageUrl = categoryData.hero_image
    ? `${Constants.SUPABASE_HERO_IMAGES_BUCKET_URL}${categoryData.hero_image}`
    : undefined; // Use undefined if no hero image

  return {
    title,
    description,
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl, // Use canonical URL for OG
      siteName: 'Scribbloo', // Add your site name
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          alt: `${categoryData.name} Hero Image`,
        }
      ] : [], // Empty array if no image
      type: 'website', // Or 'article' depending on how you view the page
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
