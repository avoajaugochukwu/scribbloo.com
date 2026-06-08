import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { baseUrl } from '@/app/metadata';
import { imageUrl } from '@/lib/images';
import { isRecent } from '@/lib/utils';
import PageBreadcrumb, { type CrumbItem } from '@/components/PageBreadcrumb';
import OtherDetails from '@/components/seo-details/OtherDetails';
import CategoryRail from '@/components/CategoryRail';
import FavoriteButton from '@/components/FavoriteButton';
import { ArrowIcon } from '@/components/icons';

import ColoringPageImage from '../components/ColoringPageImage';
import ColoringGallery from '../components/ColoringGallery';
import SwatchPreview from '../components/SwatchPreview';
import DownloadActions from '../components/DownloadActions';

import {
  resolvePath,
  getAllColoringParams,
  getRootHub,
  PAGE_SIZE,
  type CollectionNode,
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

/* -------------------------------------------------------------------------- */
/* root hub ( /coloring-pages )                                               */
/* -------------------------------------------------------------------------- */
async function RootHub() {
  const { themes, facets, counts } = await getRootHub();
  const crumbs: CrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
  ];
  return (
    <div className="container mx-auto px-4 pb-12 lg:px-7">
      {jsonLd({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Coloring Pages', url: `${baseUrl}/coloring-pages`, breadcrumb: breadcrumbJsonLd(crumbs) })}
      <PageBreadcrumb items={crumbs} />

      <header className="py-6">
        <span className="eyebrow">Coloring pages</span>
        <h1 className="mt-2 font-display text-[clamp(36px,4.2vw,52px)] font-semibold">All Coloring Pages</h1>
        <p className="mt-2.5 text-lg font-semibold text-ink-soft">
          Pick a theme and start coloring — every sheet is free to print and download.
        </p>
      </header>

      <CategoryRail themes={themes} counts={counts} />

      {facets.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 font-display text-[clamp(24px,3vw,34px)] font-semibold">Browse by</h2>
          <div className="flex flex-wrap gap-2.5">
            {facets.map((f) => (
              <Link
                key={f.slug}
                href={`/coloring-pages/${f.slug}`}
                className="pressable shadow-pop-sm inline-flex items-center rounded-full border-2 border-ink bg-cream px-5 py-2.5 font-display font-medium"
              >
                {f.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* collection / facet listing                                                 */
/* -------------------------------------------------------------------------- */
async function CollectionView({
  node, ancestors, children, leaves, page, totalPages,
}: Extract<Resolved, { type: 'collection' }>) {
  const c = node.category;
  const pageLeaves = leaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const crumbs = crumbsFromAncestors(ancestors);
  const pageHref = (p: number) => (p <= 1 ? node.href : `${node.href}/page/${p}`);
  const { themes } = await getRootHub();
  const now = Date.now();

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
    <div className="container mx-auto px-4 pb-12 lg:px-7">
      {jsonLd(collectionJsonLd)}
      {jsonLd(breadcrumbJsonLd(crumbs))}
      <PageBreadcrumb items={crumbs} />

      <header className="py-6">
        <span className="eyebrow">Coloring pages</span>
        <h1 className="mt-2 font-display text-[clamp(36px,4.2vw,52px)] font-semibold">{c.name} Coloring Pages</h1>
        {c.description && <p className="mt-2.5 max-w-3xl text-lg font-semibold text-ink-soft">{c.description}</p>}
      </header>

      {c.heroImage && (
        <div className="mb-8 flex justify-center">
          <div className="retro-frame shadow-pop-lg w-full max-w-lg -rotate-1 rounded-[var(--radius-md)] p-4">
            <div className="relative aspect-[210/297] w-full overflow-hidden">
              <Image src={imageUrl({ kind: 'category-hero', slug: c.slug })} alt={`${c.name} hero image`} fill priority sizes="(max-width: 512px) 100vw, 512px" className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Theme chips — jump across top-level themes */}
      <div className="mb-7 flex flex-wrap gap-2.5">
        <Link
          href="/coloring-pages"
          className="inline-flex items-center rounded-full border-2 border-ink bg-cream px-4 py-2 font-display text-[15px] font-medium transition-colors hover:bg-yellow-t"
        >
          All pages
        </Link>
        {themes.map((t) => {
          const active = t.href === node.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`inline-flex items-center rounded-full border-2 border-ink px-4 py-2 font-display text-[15px] font-medium transition-colors ${
                active ? 'bg-ink text-cream' : 'bg-cream hover:bg-yellow-t'
              }`}
            >
              {t.category.name}
            </Link>
          );
        })}
      </div>

      {/* Subcategories */}
      {children.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-5 font-display text-[clamp(22px,2.6vw,30px)] font-semibold">Subcategories</h2>
          <div className="flex flex-wrap gap-2.5">
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="pressable shadow-pop-sm inline-flex items-center rounded-full border-2 border-ink bg-cream px-5 py-2.5 font-display font-medium"
              >
                {child.category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {pageLeaves.length > 0 ? (
        <ColoringGallery
          items={pageLeaves.map((l) => ({ page: l.page, href: l.href, isNew: isRecent(l.page.createdAt, now) }))}
          contextLabel={c.name}
        />
      ) : (
        leaves.length === 0 && children.length === 0 && (
          <p className="py-16 text-center font-display font-bold text-ink-soft">
            No coloring pages here yet — check back soon!
          </p>
        )
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3 font-display font-semibold" aria-label="Pagination">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="pressable shadow-pop-sm rounded-full border-2 border-ink bg-cream px-5 py-2.5">← Prev</Link>
          )}
          <span className="px-2 text-ink-soft">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={pageHref(page + 1)} className="pressable shadow-pop-sm rounded-full border-2 border-ink bg-cream px-5 py-2.5">Next →</Link>
          )}
        </nav>
      )}

      <OtherDetails details={c.seoDetails} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* leaf detail                                                                */
/* -------------------------------------------------------------------------- */
function LeafView({ leaf, ancestors, related }: Extract<Resolved, { type: 'leaf' }>) {
  const page = leaf.page;
  const fullUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'full' });
  const originalUrl = imageUrl({ kind: 'coloring-page', slug: page.image, variant: 'original' });
  const subjectName = ancestors[ancestors.length - 1]?.category.name ?? 'Coloring';
  const baseFilename = page.title ? page.title.toLowerCase().replace(/\s+/g, '-') : 'coloring-page';
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;
  const crumbs: CrumbItem[] = [...crumbsFromAncestors(ancestors), { label: page.title, href: leaf.href }];
  const nowMs = Date.now();

  const added = (() => {
    const t = Date.parse(page.createdAt);
    return Number.isNaN(t) ? null : new Date(t).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  })();

  const specs: { label: string; value: string }[] = [
    { label: 'Theme', value: subjectName },
    { label: 'Format', value: 'PDF · PNG · A4' },
    { label: 'Best for', value: 'All ages' },
    ...(added ? [{ label: 'Added', value: added }] : []),
  ];

  return (
    <div className="container mx-auto px-4 pb-12 lg:px-7">
      {jsonLd({ '@context': 'https://schema.org', '@type': 'ImageObject', name: `${page.title} Coloring Page`, description: page.description || `${page.title} free printable coloring page.`, contentUrl: `${baseUrl}${fullUrl}`, url: `${baseUrl}${leaf.href}` })}
      {jsonLd(breadcrumbJsonLd(crumbs))}
      <PageBreadcrumb items={crumbs} />

      <div className="grid items-start gap-10 py-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Preview with try-a-color swatches */}
        <div className="lg:sticky lg:top-24">
          <SwatchPreview src={fullUrl} alt={`${page.title} coloring page`} />
        </div>

        {/* Info */}
        <div>
          <span className="eyebrow text-red">{subjectName}</span>
          <h1 className="mt-2 font-display text-[clamp(34px,4vw,48px)] font-semibold">{page.title}</h1>
          <p className="mt-3 text-lg font-semibold text-ink-soft">
            {page.description ||
              `A friendly ${subjectName.toLowerCase()} line drawing with bold, easy-to-color outlines — print it at home or color it right here.`}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3.5">
            {specs.map((s) => (
              <div key={s.label} className="rounded-[var(--radius-sm)] border-2 border-line bg-cream p-4">
                <span className="text-[12.5px] font-extrabold uppercase tracking-wider text-ink-faint">{s.label}</span>
                <b className="mt-0.5 block font-display text-[19px] font-semibold">{s.value}</b>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <DownloadActions imageUrl={originalUrl} filename={downloadFilename} />
            <div className="flex flex-wrap gap-3 [&>*]:flex-1">
              <Link
                href="/tools"
                className="pressable shadow-pop-sm inline-flex items-center justify-center gap-2 rounded-full border-[2.5px] border-ink bg-teal px-5 py-3 font-display text-base font-semibold text-cream"
              >
                Color online
              </Link>
              <FavoriteButton id={leaf.href} variant="button" />
            </div>
          </div>

          {page.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {page.tags.map((t) => (
                <span key={t} className="rounded-full border-2 border-ink bg-cream px-3.5 py-1.5 font-display text-sm font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-7 flex items-end justify-between gap-5">
            <h2 className="font-display text-[clamp(28px,3vw,38px)] font-semibold">More {subjectName} to color</h2>
            {ancestors.length > 0 && (
              <Link href={ancestors[ancestors.length - 1].href} className="link-arrow shrink-0 whitespace-nowrap">
                See all <ArrowIcon className="h-5 w-5" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {related.map((r, i) => (
              <ColoringPageImage key={r.href} coloringPage={r.page} href={r.href} contextLabel={subjectName} tintIndex={i} isNew={isRecent(r.page.createdAt, nowMs)} />
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
