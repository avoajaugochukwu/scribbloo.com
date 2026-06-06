import { getColoringPagesByCategorySlug, getAllCategorySlugs } from '@/lib/content/coloringPages';
import ColoringPageImage from './components/ColoringPageImage';
import { notFound } from 'next/navigation';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import { Metadata } from 'next';
import Image from 'next/image';
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

      <PageBreadcrumb items={breadcrumbItems} />

      <PageHeading title={`${categoryData.name} Coloring Pages`} className="mb-6 md:mb-8" />

      {categoryData.heroImage && (
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-lg border-2 border-black bg-white p-4 shadow-xl">
            <div className="relative aspect-[210/297] w-full overflow-hidden">
              <Image
                src={imageUrl({ kind: 'category-hero', slug: categoryData.slug })}
                alt={`${categoryData.name} category hero image`}
                fill
                priority
                sizes="(max-width: 512px) 100vw, 512px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {categoryData.description && (
        <section className="mx-auto max-w-3xl text-center text-lg text-muted-foreground text-pretty">
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
