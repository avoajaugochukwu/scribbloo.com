import { getColoringPagesByCategorySlug } from '@/lib/coloringPages';
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
import ColoringPage from '@/types/coloringpage.type';
import Image from 'next/image';
import React from 'react';
import { Constants } from '@/config/constants';
import { baseUrl } from '@/app/metadata';
import CategoryWithColoringPages from '@/types/categorywithcoloringpages.type';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  const categoryData = await getColoringPagesByCategorySlug(categorySlug) as CategoryWithColoringPages | null;

  if (!categoryData) {
    notFound();
  }

  const coloringPages = categoryData.coloringPages || [];

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
      itemListElement: coloringPages.map((coloringPage, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'ImageObject',
          name: coloringPage.title || 'Coloring Page',
          contentUrl: `${Constants.SUPABASE_COLORING_PAGES_BUCKET_URL}${coloringPage.image_url}`,
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
        <div className="mb-8 w-full">
          <Image
            src={`${Constants.SUPABASE_HERO_IMAGES_BUCKET_URL}${categoryData.hero_image}`}
            alt={`${categoryData.name} category hero image`}
            width={1200}
            height={400}
            priority
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}

      {categoryData.description && (
        <section className="max-w-3xl mx-auto text-center text-muted-foreground">
          <p>{categoryData.description}</p>
        </section>
      )}

      {coloringPages.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {coloringPages.map((coloringPage: ColoringPage, index) => (
            <ColoringPageImage
              key={coloringPage.id}
              coloringPage={coloringPage}
              categoryName={categoryData.name}
              priority={index < 2}
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

export async function generateMetadata(
  { params }: CategoryPageProps,
): Promise<Metadata> {
  const { categorySlug } = await params;
  const categoryData = await getColoringPagesByCategorySlug(categorySlug) as CategoryWithColoringPages | null;

  if (!categoryData) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  // --- SEO Optimization ---
  const title = `${categoryData.name} Coloring Pages - Free Printable Sheets`;

  const description = categoryData.seo_meta_description || "";

  const canonicalUrl = `${baseUrl}/coloring-pages/${categoryData.slug}`;

  const ogImageUrl = categoryData.hero_image
    ? `${Constants.SUPABASE_HERO_IMAGES_BUCKET_URL}${categoryData.hero_image}`
    : undefined;

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
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
