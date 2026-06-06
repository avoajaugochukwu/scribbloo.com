import { getColoringPagesByCategorySlug, getAllCategorySlugs } from '@/lib/content/coloringPages';
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
import Image from 'next/image';
import React from 'react';
import { baseUrl } from '@/app/metadata';
import { imageUrl } from '@/lib/images';
import OtherDetails from '@/components/seo-details/OtherDetails';

// Force static rendering
export const dynamic = 'force-static';

// Generate static paths during build
export async function generateStaticParams() {
  try {
    const slugs = await getAllCategorySlugs();
    return slugs.map((slug) => ({
      categorySlug: slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  const categoryData = await getColoringPagesByCategorySlug(categorySlug);

  if (!categoryData) {
    notFound();
  }

  const coloringPages = categoryData.coloringPages || [];

  const categoryUrl = `${baseUrl}/coloring-pages/${categoryData.slug}`;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    { label: categoryData.name, href: `/coloring-pages/${categoryData.slug}` }, // Current page is last
  ];

  // --- Prepare JSON-LD Structured Data ---
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryData.seoTitle || `${categoryData.name} Coloring Pages`,
    description:
      categoryData.seoMetaDescription || `Explore our collection of ${categoryData.name} coloring pages.`,
    url: categoryUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: coloringPages.map((coloringPage, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}/coloring-pages/${categoryData.slug}/${coloringPage.slug}`,
        item: {
          '@type': 'ImageObject',
          name: coloringPage.title || 'Coloring Page',
          contentUrl: `${baseUrl}${imageUrl({ kind: 'coloring-page', slug: coloringPage.image, variant: 'full' })}`,
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };
  // --- End Structured Data Prep ---

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {/* --- Embed JSON-LD Scripts --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* --- End JSON-LD Scripts --- */}

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

      {categoryData.heroImage && (
        <div className="mb-8 w-full">
          <Image
            src={imageUrl({ kind: 'category-hero', slug: categoryData.slug })}
            alt={`${categoryData.name} category hero image`}
            width={1200}
            height={400}
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="w-full h-auto rounded-lg shadow-md"
            loading="eager"
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
          {coloringPages.map((coloringPage, index) => (
            <ColoringPageImage
              key={coloringPage.slug}
              coloringPage={coloringPage}
              categorySlug={categoryData.slug}
              categoryName={categoryData.name}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted-foreground">
          No coloring pages found in the &quot;{categoryData.name}&quot; category yet. Check back soon!
          We&apos;re still adding {categoryData.name.toLowerCase()} coloring pages!
        </p>
      )}
      <OtherDetails details={categoryData.seoDetails} />
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const categoryData = await getColoringPagesByCategorySlug(categorySlug);

  if (!categoryData) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  // --- SEO Optimization ---
  const title = `${categoryData.name} Coloring Pages - Free Printable Sheets`;

  const description = categoryData.seoMetaDescription || '';

  const canonicalUrl = `${baseUrl}/coloring-pages/${categoryData.slug}`;

  const ogImageUrl = categoryData.heroImage
    ? `${baseUrl}${imageUrl({ kind: 'category-hero', slug: categoryData.slug })}`
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
      url: canonicalUrl,
      siteName: 'Scribbloo',
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              alt: `${categoryData.name} Hero Image`,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
