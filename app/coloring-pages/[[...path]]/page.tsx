import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';

import { baseUrl } from '@/app/metadata';
import { imageUrl } from '@/lib/images';
import PageBreadcrumb, { type CrumbItem } from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import OtherDetails from '@/components/seo-details/OtherDetails';
import type { Category, ColoringPage } from '@/lib/content/types';

import ColoringPageImage from '../components/ColoringPageImage';
import CollectionCard from '../components/CollectionCard';
import DownloadIcon from '../components/DownloadIcon';
import PrintIcon from '../components/PrintIcon';

import {
  resolvePath,
  getAllColoringParams,
  getTopLevelCollections,
  getFacetCollections,
  getChildCollections,
  getLeavesForCollection,
  getLeafCanonicalHref,
  getAncestors,
  type CollectionNode,
} from '@/lib/content/collections';

// Force static rendering. dynamicParams stays at its default (true) so alias and
// non-canonical paths render on demand and 308-redirect to canonical; unknown
// paths fall through to notFound().
export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    // include the index ([]) plus every canonical collection + leaf path
    return [{ path: [] as string[] }, ...(await getAllColoringParams())];
  } catch (error) {
    console.error('[coloring-pages] generateStaticParams failed:', error);
    return [{ path: [] as string[] }];
  }
}

interface PageProps {
  params: Promise<{ path?: string[] }>;
}

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3';
const CARD_GRID =
  'grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4';

function jsonLd(obj: unknown) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
  );
}

function breadcrumbJsonLd(items: CrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
    })),
  };
}

/** Home > Coloring Pages > ...ancestor chain (last = current node). */
function crumbsFromAncestors(ancestors: CollectionNode[]): CrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    ...ancestors.map((a) => ({ label: a.category.name, href: a.href })),
  ];
}

/* -------------------------------------------------------------------------- */
/* Root hub  ( /coloring-pages )                                              */
/* -------------------------------------------------------------------------- */

async function RootHub() {
  const [themes, facets] = await Promise.all([getTopLevelCollections(), getFacetCollections()]);
  const crumbs: CrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
  ];

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {jsonLd({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Coloring Pages',
        url: `${baseUrl}/coloring-pages`,
        breadcrumb: breadcrumbJsonLd(crumbs),
      })}
      <PageBreadcrumb items={crumbs} />
      <PageHeading
        title="Coloring Pages"
        subtitle="Pick a theme and start coloring — every sheet is free to print and download."
        className="mb-8 md:mb-10"
      />

      <div className={CARD_GRID}>
        {themes.map((c, i) => (
          <CollectionCard key={c.slug} category={c} href={`/coloring-pages/${c.slug}`} accentIndex={i} />
        ))}
      </div>

      {facets.length > 0 && (
        <section className="mt-14">
          <PageHeading as="h2" title="Browse by" className="mb-8" />
          <div className={CARD_GRID}>
            {facets.map((c, i) => (
              <CollectionCard
                key={c.slug}
                category={c}
                href={`/coloring-pages/${c.slug}`}
                accentIndex={i + themes.length}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Collection listing                                                         */
/* -------------------------------------------------------------------------- */

async function CollectionView({
  category,
  ancestors,
}: {
  category: Category;
  ancestors: CollectionNode[];
}) {
  const [children, leaves] = await Promise.all([
    getChildCollections(category.slug),
    getLeavesForCollection(category),
  ]);
  const childHrefs = await Promise.all(children.map((c) => getCollectionHref(c.slug)));
  const leafHrefs = await Promise.all(leaves.map((p) => getLeafCanonicalHref(p)));

  const crumbs = crumbsFromAncestors(ancestors);
  const self = ancestors[ancestors.length - 1];

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.seoTitle || `${category.name} Coloring Pages`,
    description:
      category.seoMetaDescription || `Explore our collection of ${category.name} coloring pages.`,
    url: `${baseUrl}${self.href}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: leaves.map((leaf, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}${leafHrefs[index] ?? ''}`,
        item: {
          '@type': 'ImageObject',
          name: leaf.title || 'Coloring Page',
          contentUrl: `${baseUrl}${imageUrl({ kind: 'coloring-page', slug: leaf.image, variant: 'full' })}`,
        },
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {jsonLd(collectionJsonLd)}
      {jsonLd(breadcrumbJsonLd(crumbs))}
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={`${category.name} Coloring Pages`} className="mb-6 md:mb-8" />

      {category.heroImage && (
        <div className="mb-8 flex justify-center">
          <div className="retro-frame shadow-pop-lg w-full max-w-lg -rotate-1 p-4">
            <div className="relative aspect-[210/297] w-full overflow-hidden">
              <Image
                src={imageUrl({ kind: 'category-hero', slug: category.slug })}
                alt={`${category.name} category hero image`}
                fill
                priority
                sizes="(max-width: 512px) 100vw, 512px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {category.description && (
        <section className="mx-auto max-w-3xl text-center text-lg text-muted-foreground text-pretty">
          <p>{category.description}</p>
        </section>
      )}

      {children.length > 0 && (
        <section className="mt-12">
          <PageHeading as="h2" title="Browse subcategories" className="mb-8" />
          <div className={CARD_GRID}>
            {children.map((c, i) => (
              <CollectionCard key={c.slug} category={c} href={childHrefs[i] ?? '#'} accentIndex={i} />
            ))}
          </div>
        </section>
      )}

      {leaves.length > 0 ? (
        <div className={`mt-12 ${GRID}`}>
          {leaves.map((leaf, index) => (
            <ColoringPageImage
              key={leaf.slug}
              coloringPage={leaf}
              href={leafHrefs[index] ?? '#'}
              contextLabel={category.name}
              priority={index < 2}
            />
          ))}
        </div>
      ) : (
        children.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            No coloring pages here yet — check back soon!
          </p>
        )
      )}

      <OtherDetails details={category.seoDetails} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Leaf detail                                                                */
/* -------------------------------------------------------------------------- */

async function LeafView({
  page,
  subject,
  ancestors,
}: {
  page: ColoringPage;
  subject: Category;
  ancestors: CollectionNode[];
}) {
  const fullUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' });
  const originalUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'original' });
  const canonical = (await getLeafCanonicalHref(page))!;

  const baseFilename = page.title ? page.title.toLowerCase().replace(/\s+/g, '-') : 'coloring-page';
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;

  const related = (await getLeavesForCollection(subject)).filter((p) => p.slug !== page.slug).slice(0, 6);
  const relatedHrefs = await Promise.all(related.map((p) => getLeafCanonicalHref(p)));

  const crumbs: CrumbItem[] = [
    ...crumbsFromAncestors(ancestors),
    { label: page.title, href: canonical },
  ];

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {jsonLd({
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: `${page.title} Coloring Page`,
        description: page.description || `${page.title} free printable coloring page.`,
        contentUrl: `${baseUrl}${fullUrl}`,
        url: `${baseUrl}${canonical}`,
      })}
      {jsonLd(breadcrumbJsonLd(crumbs))}
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={`${page.title} Coloring Page`} className="mb-6 md:mb-8" />

      <div className="mx-auto max-w-2xl">
        <div className="retro-frame shadow-pop-lg mx-auto max-w-md -rotate-1 p-4">
          <div className="relative aspect-[210/297] w-full overflow-hidden">
            <Image
              src={fullUrl}
              alt={`${page.title} coloring page`}
              fill
              priority
              sizes="(max-width: 480px) 100vw, 448px"
              className="object-contain"
            />
          </div>
        </div>

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

      {related.length > 0 && (
        <section className="mt-16">
          <PageHeading as="h2" title={`More ${subject.name} Coloring Pages`} className="mb-8" />
          <div className={GRID}>
            {related.map((r, i) => (
              <ColoringPageImage
                key={r.slug}
                coloringPage={r}
                href={relatedHrefs[i] ?? '#'}
                contextLabel={subject.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* small helper local to the route (avoids importing the whole tree builder) */
async function getCollectionHref(slug: string): Promise<string> {
  const a = await getAncestors(slug);
  return a[a.length - 1]?.href ?? `/coloring-pages/${slug}`;
}

/* -------------------------------------------------------------------------- */
/* Route entry                                                                */
/* -------------------------------------------------------------------------- */

export default async function ColoringPagesCatchAll({ params }: PageProps) {
  const parts = (await params).path ?? [];
  if (parts.length === 0) return <RootHub />;

  const r = await resolvePath(parts);
  switch (r.type) {
    case 'collection':
      return <CollectionView category={r.category} ancestors={r.ancestors} />;
    case 'leaf':
      return <LeafView page={r.page} subject={r.subject} ancestors={r.ancestors} />;
    case 'redirect':
      permanentRedirect(r.to); // 308 — alias / non-canonical path -> canonical
      break;
    default:
      notFound();
  }
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parts = (await params).path ?? [];

  if (parts.length === 0) {
    return {
      title: 'Browse Coloring Pages by Theme | Scribbloo',
      description:
        'Browse every coloring page theme — animals, characters, holidays, fantasy and more. Free, high-quality printables for kids and adults.',
      alternates: { canonical: `${baseUrl}/coloring-pages` },
    };
  }

  const r = await resolvePath(parts);

  if (r.type === 'collection') {
    const c = r.category;
    const url = `${baseUrl}${r.ancestors[r.ancestors.length - 1].href}`;
    const title = `${c.name} Coloring Pages - Free Printable Sheets`;
    const description = c.seoMetaDescription || c.description || '';
    const ogImageUrl = c.heroImage
      ? `${baseUrl}${imageUrl({ kind: 'category-hero', slug: c.slug })}`
      : undefined;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: 'Scribbloo',
        images: ogImageUrl ? [{ url: ogImageUrl, alt: `${c.name} Hero Image` }] : [],
        type: 'website',
      },
      twitter: { card: 'summary_large_image', title, description, images: ogImageUrl ? [ogImageUrl] : [] },
    };
  }

  if (r.type === 'leaf') {
    const page = r.page;
    const canonical = `${baseUrl}${(await getLeafCanonicalHref(page))!}`;
    const title = `${page.title} Coloring Page - Free Printable`;
    const description = page.description || `Download and print the free ${page.title} coloring page.`;
    const ogImageUrl = `${baseUrl}${imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' })}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Scribbloo',
        images: [{ url: ogImageUrl, alt: `${page.title} Coloring Page` }],
        type: 'website',
      },
      twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl] },
    };
  }

  return { title: 'Coloring Pages' };
}
