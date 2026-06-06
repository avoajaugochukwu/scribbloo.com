import {
  getAllColoringPages,
  getColoringPageBySlug,
  getColoringPagesByCategorySlug,
  getCategoryBySlug,
} from '@/lib/content/coloringPages';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import { baseUrl } from '@/app/metadata';
import { imageUrl } from '@/lib/images';
import ColoringPageImage from '../components/ColoringPageImage';
import DownloadIcon from '../components/DownloadIcon';
import PrintIcon from '../components/PrintIcon';

// Force static rendering
export const dynamic = 'force-static';

// Generate static paths during build — one param per (category, page) pair.
export async function generateStaticParams() {
  try {
    const pages = await getAllColoringPages();
    return pages.flatMap((page) =>
      page.categories.map((categorySlug) => ({
        categorySlug,
        pageSlug: page.slug,
      })),
    );
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ categorySlug: string; pageSlug: string }>;
}

export default async function ColoringPageDetail({ params }: PageProps) {
  const { categorySlug, pageSlug } = await params;

  const page = await getColoringPageBySlug(pageSlug);
  if (!page) {
    notFound();
  }

  const category = await getCategoryBySlug(categorySlug);
  const categoryName = category?.name ?? categorySlug;

  const fullUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' });
  const originalUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'original' });

  const baseFilename = page.title
    ? page.title.toLowerCase().replace(/\s+/g, '-')
    : 'coloring-page';
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;

  const pageUrl = `${baseUrl}/coloring-pages/${categorySlug}/${page.slug}`;

  // Related pages — other pages in the same category.
  const categoryData = await getColoringPagesByCategorySlug(categorySlug);
  const relatedPages = (categoryData?.coloringPages || [])
    .filter((p) => p.slug !== page.slug)
    .slice(0, 6);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    { label: categoryName, href: `/coloring-pages/${categorySlug}` },
    { label: page.title, href: pageUrl },
  ];

  // --- JSON-LD Structured Data ---
  const imageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: `${page.title} Coloring Page`,
    description: page.description || `${page.title} free printable coloring page.`,
    contentUrl: `${baseUrl}${fullUrl}`,
    url: pageUrl,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
    })),
  };
  // --- End Structured Data Prep ---

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageBreadcrumb items={breadcrumbItems} />

      <PageHeading title={`${page.title} Coloring Page`} className="mb-6 md:mb-8" />

      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl ring-2 ring-pink-200">
          <Image
            src={fullUrl}
            alt={`${page.title} coloring page`}
            width={800}
            height={800}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto"
          />
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrintIcon imageUrl={originalUrl} filename={downloadFilename} variant="button" />
          <DownloadIcon imageUrl={originalUrl} filename={downloadFilename} variant="button" />
        </div>

        {page.description && (
          <section className="mt-8 max-w-3xl mx-auto text-center text-lg text-muted-foreground text-pretty">
            <p>{page.description}</p>
          </section>
        )}
      </div>

      {relatedPages.length > 0 && (
        <section className="mt-16">
          <PageHeading
            as="h2"
            title={`More ${categoryName} Coloring Pages`}
            className="mb-8"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {relatedPages.map((related) => (
              <ColoringPageImage
                key={related.slug}
                coloringPage={related}
                categorySlug={categorySlug}
                categoryName={categoryName}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, pageSlug } = await params;

  const page = await getColoringPageBySlug(pageSlug);
  if (!page) {
    return {
      title: 'Coloring Page Not Found',
      description: 'The requested coloring page could not be found.',
    };
  }

  const title = `${page.title} Coloring Page - Free Printable`;
  const description = page.description || `Download and print the free ${page.title} coloring page.`;
  // A page can appear under multiple categories. Canonicalize every variant to a
  // single primary-category URL so we don't split ranking signal / create dupes.
  const primaryCategory = page.categories[0] ?? categorySlug;
  const canonicalUrl = `${baseUrl}/coloring-pages/${primaryCategory}/${pageSlug}`;
  const ogImageUrl = `${baseUrl}${imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' })}`;

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
      images: [
        {
          url: ogImageUrl,
          alt: `${page.title} Coloring Page`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
