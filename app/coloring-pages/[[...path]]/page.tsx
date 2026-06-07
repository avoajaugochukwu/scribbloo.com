import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { baseUrl } from '@/app/metadata';
import { imageUrl } from '@/lib/images';
import PageBreadcrumb, { type CrumbItem } from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import OtherDetails from '@/components/seo-details/OtherDetails';

import ColoringPageImage from '../components/ColoringPageImage';
import CollectionCard from '../components/CollectionCard';
import DownloadIcon from '../components/DownloadIcon';
import PrintIcon from '../components/PrintIcon';

import {
  resolvePath,
  getAllColoringParams,
  getRootHub,
  PAGE_SIZE,
  type CollectionNode,
  type Leaf,
  type Resolved,
} from '@/lib/content/collections';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
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
const CARD_GRID = 'grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4';

function jsonLd(obj: unknown) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />;
}
function breadcrumbJsonLd(items: CrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
    })),
  };
}
function crumbsFromAncestors(ancestors: CollectionNode[]): CrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    ...ancestors.map((a) => ({ label: a.category.name, href: a.href })),
  ];
}

/* root hub ( /coloring-pages ) */
async function RootHub() {
  const { themes, facets } = await getRootHub();
  const crumbs: CrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
  ];
  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {jsonLd({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Coloring Pages', url: `${baseUrl}/coloring-pages`, breadcrumb: breadcrumbJsonLd(crumbs) })}
      <PageBreadcrumb items={crumbs} />
      <PageHeading title="Coloring Pages" subtitle="Pick a theme and start coloring — every sheet is free to print and download." className="mb-8 md:mb-10" />
      <div className={CARD_GRID}>
        {themes.map((t, i) => (
          <CollectionCard key={t.href} category={t.category} href={t.href} accentIndex={i} />
        ))}
      </div>
      {facets.length > 0 && (
        <section className="mt-14">
          <PageHeading as="h2" title="Browse by" className="mb-8" />
          <div className={CARD_GRID}>
            {facets.map((f, i) => (
              <CollectionCard key={f.slug} category={f} href={`/coloring-pages/${f.slug}`} accentIndex={i + themes.length} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* collection / facet listing */
function CollectionView({
  node, ancestors, children, leaves, page, totalPages,
}: Extract<Resolved, { type: 'collection' }>) {
  const c = node.category;
  const pageLeaves = leaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const crumbs = crumbsFromAncestors(ancestors);
  const pageHref = (p: number) => (p <= 1 ? node.href : `${node.href}/page/${p}`);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.seoTitle || `${c.name} Coloring Pages`,
    description: c.seoMetaDescription || `Explore our collection of ${c.name} coloring pages.`,
    url: `${baseUrl}${node.href}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: pageLeaves.map((l, i) => ({
        '@type': 'ListItem',
        position: (page - 1) * PAGE_SIZE + i + 1,
        url: `${baseUrl}${l.href}`,
        item: { '@type': 'ImageObject', name: l.page.title, contentUrl: `${baseUrl}${imageUrl({ kind: 'coloring-page', slug: l.page.image, variant: 'full' })}` },
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {jsonLd(collectionJsonLd)}
      {jsonLd(breadcrumbJsonLd(crumbs))}
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={`${c.name} Coloring Pages`} className="mb-6 md:mb-8" />

      {c.heroImage && (
        <div className="mb-8 flex justify-center">
          <div className="retro-frame shadow-pop-lg w-full max-w-lg -rotate-1 p-4">
            <div className="relative aspect-[210/297] w-full overflow-hidden">
              <Image src={imageUrl({ kind: 'category-hero', slug: c.slug })} alt={`${c.name} hero image`} fill priority sizes="(max-width: 512px) 100vw, 512px" className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {c.description && (
        <section className="mx-auto max-w-3xl text-center text-lg text-muted-foreground text-pretty">
          <p>{c.description}</p>
        </section>
      )}

      {children.length > 0 && (
        <section className="mt-12">
          <PageHeading as="h2" title="Browse subcategories" className="mb-8" />
          <div className={CARD_GRID}>
            {children.map((child, i) => (
              <CollectionCard key={child.href} category={child.category} href={child.href} accentIndex={i} />
            ))}
          </div>
        </section>
      )}

      {pageLeaves.length > 0 ? (
        <div className={`mt-12 ${GRID}`}>
          {pageLeaves.map((l, i) => (
            <ColoringPageImage key={l.href} coloringPage={l.page} href={l.href} contextLabel={c.name} priority={i < 2} />
          ))}
        </div>
      ) : (
        leaves.length === 0 && children.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No coloring pages here yet — check back soon!</p>
        )
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3 font-display font-bold" aria-label="Pagination">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="pressable shadow-pop rounded-[var(--radius)] border-2 border-ink bg-card px-4 py-2">← Prev</Link>
          )}
          <span className="px-2 text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="pressable shadow-pop rounded-[var(--radius)] border-2 border-ink bg-card px-4 py-2">Next →</Link>
          )}
        </nav>
      )}

      <OtherDetails details={c.seoDetails} />
    </div>
  );
}

/* leaf detail */
function LeafView({ leaf, ancestors, related }: Extract<Resolved, { type: 'leaf' }>) {
  const page = leaf.page;
  const fullUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' });
  const originalUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'original' });
  const subjectName = ancestors[ancestors.length - 1]?.category.name ?? 'Coloring';
  const baseFilename = page.title ? page.title.toLowerCase().replace(/\s+/g, '-') : 'coloring-page';
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;
  const crumbs: CrumbItem[] = [...crumbsFromAncestors(ancestors), { label: page.title, href: leaf.href }];

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      {jsonLd({ '@context': 'https://schema.org', '@type': 'ImageObject', name: `${page.title} Coloring Page`, description: page.description || `${page.title} free printable coloring page.`, contentUrl: `${baseUrl}${fullUrl}`, url: `${baseUrl}${leaf.href}` })}
      {jsonLd(breadcrumbJsonLd(crumbs))}
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={`${page.title} Coloring Page`} className="mb-6 md:mb-8" />

      <div className="mx-auto max-w-2xl">
        <div className="retro-frame shadow-pop-lg mx-auto max-w-md -rotate-1 p-4">
          <div className="relative aspect-[210/297] w-full overflow-hidden">
            <Image src={fullUrl} alt={`${page.title} coloring page`} fill priority sizes="(max-width: 480px) 100vw, 448px" className="object-contain" />
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
          <PageHeading as="h2" title={`More ${subjectName} Coloring Pages`} className="mb-8" />
          <div className={GRID}>
            {related.map((r) => (
              <ColoringPageImage key={r.href} coloringPage={r.page} href={r.href} contextLabel={subjectName} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function ColoringPagesCatchAll({ params }: PageProps) {
  const parts = (await params).path ?? [];
  if (parts.length === 0) return <RootHub />;

  const r = await resolvePath(parts);
  switch (r.type) {
    case 'collection':
      return <CollectionView {...r} />;
    case 'leaf':
      return <LeafView {...r} />;
    case 'redirect':
      permanentRedirect(r.to); // 308 -> canonical
      break;
    default:
      notFound();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parts = (await params).path ?? [];
  if (parts.length === 0) {
    return {
      title: 'Browse Coloring Pages by Theme | Scribbloo',
      description: 'Browse every coloring page theme — animals, characters, holidays, fantasy and more. Free, high-quality printables for kids and adults.',
      alternates: { canonical: `${baseUrl}/coloring-pages` },
    };
  }

  const r = await resolvePath(parts);

  if (r.type === 'collection') {
    const c = r.node.category;
    const url = `${baseUrl}${r.node.href}${r.page > 1 ? `/page/${r.page}` : ''}`;
    const title = r.page > 1 ? `${c.name} Coloring Pages - Page ${r.page}` : `${c.name} Coloring Pages - Free Printable Sheets`;
    const description = c.seoMetaDescription || c.description || '';
    const ogImageUrl = c.heroImage ? `${baseUrl}${imageUrl({ kind: 'category-hero', slug: c.slug })}` : undefined;
    return {
      title, description,
      alternates: { canonical: url },
      // Deep pagination pages are thin — keep them out of the index but let
      // Google follow through to the leaf URLs. Page 1 stays indexable.
      robots: r.page > 1 ? { index: false, follow: true } : undefined,
      openGraph: { title, description, url, siteName: 'Scribbloo', images: ogImageUrl ? [{ url: ogImageUrl, alt: `${c.name} Hero Image` }] : [], type: 'website' },
      twitter: { card: 'summary_large_image', title, description, images: ogImageUrl ? [ogImageUrl] : [] },
    };
  }

  if (r.type === 'leaf') {
    const page = r.leaf.page;
    const canonical = `${baseUrl}${r.leaf.href}`;
    const title = `${page.title} Coloring Page - Free Printable`;
    const description = page.description || `Download and print the free ${page.title} coloring page.`;
    const ogImageUrl = `${baseUrl}${imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' })}`;
    return {
      title, description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, siteName: 'Scribbloo', images: [{ url: ogImageUrl, alt: `${page.title} Coloring Page` }], type: 'website' },
      twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl] },
    };
  }

  return { title: 'Coloring Pages' };
}
