import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import PageBreadcrumb, { type CrumbItem } from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import { mdxComponents } from '@/components/mdx/MdxComponents';
import { imageUrl } from '@/lib/images';
import type { Doc } from '@/lib/content/docs';

/**
 * Shared index + article layouts for the flat doc namespaces
 * (/how-to-draw, /drawing-ideas, /tools). Kept generic so each route file is a
 * thin wrapper that just supplies data + breadcrumbs.
 */

function DocCard({ doc, basePath }: { doc: Doc; basePath: string }) {
  const thumb = doc.featuredImage
    ? imageUrl({ kind: 'doc-featured', namespace: doc.namespace, slug: doc.slug })
    : null;
  return (
    <Link
      href={`${basePath}/${doc.slug}`}
      className="group pressable shadow-pop block overflow-hidden rounded-[var(--radius)] border-2 border-ink bg-card"
    >
      {thumb && (
        <div className="aspect-[3/2] overflow-hidden border-b-2 border-ink bg-paper">
          <Image
            src={thumb}
            alt={`Illustration for ${doc.title}`}
            width={600}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-snug group-hover:text-terracotta">
          {doc.title}
        </h3>
        {doc.description && (
          <p className="mt-2 text-sm text-muted-foreground text-pretty">{doc.description}</p>
        )}
      </div>
    </Link>
  );
}

export function DocIndex({
  title,
  subtitle,
  basePath,
  docs,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  basePath: string; // e.g. "/how-to-draw"
  docs: Doc[];
  crumbs: CrumbItem[];
}) {
  // Group by category when any doc declares one; order groups by the strongest
  // (highest-order) member so the biggest cluster leads. `docs` arrive already
  // sorted by order desc, so within a group the order is preserved.
  const grouped = docs.some((d) => d.category);
  const groups: Array<{ name: string | null; items: Doc[] }> = [];
  if (grouped) {
    const map = new Map<string, Doc[]>();
    for (const doc of docs) {
      const key = doc.category ?? 'More';
      (map.get(key) ?? map.set(key, []).get(key)!).push(doc);
    }
    const ordered = [...map.entries()].sort(
      (a, b) => Math.max(...b[1].map((d) => d.order)) - Math.max(...a[1].map((d) => d.order)),
    );
    for (const [name, items] of ordered) groups.push({ name, items });
  } else {
    groups.push({ name: null, items: docs });
  }

  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={title} subtitle={subtitle} className="mb-8 md:mb-10" />
      {docs.length === 0 ? (
        <p className="text-center text-muted-foreground">Nothing here yet — check back soon!</p>
      ) : (
        groups.map((group) => (
          <section key={group.name ?? 'all'} className="mb-12">
            {group.name && (
              <h2 className="eyebrow mb-5 text-lg font-bold tracking-wide text-ink-soft">
                {group.name}
              </h2>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((doc) => (
                <DocCard key={doc.slug} doc={doc} basePath={basePath} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export function DocArticle({ doc, crumbs }: { doc: Doc; crumbs: CrumbItem[] }) {
  const heroUrl = doc.featuredImage
    ? imageUrl({ kind: 'doc-featured', namespace: doc.namespace, slug: doc.slug })
    : null;
  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={doc.title} subtitle={doc.subtitle ?? undefined} className="mb-8 md:mb-10" />
      {heroUrl && (
        <div className="retro-frame shadow-pop-lg mx-auto mb-10 max-w-3xl overflow-hidden p-2">
          <Image
            src={heroUrl}
            alt={`Illustration for ${doc.title}`}
            width={1200}
            height={675}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full object-cover"
          />
        </div>
      )}
      <article className="prose prose-lg mx-auto max-w-2xl text-pretty">
        {doc.description && <p className="lead text-xl text-foreground">{doc.description}</p>}
        {doc.body ? (
          <MDXRemote source={doc.body} components={mdxComponents} />
        ) : (
          <p className="mt-6 italic text-muted-foreground">Full content coming soon.</p>
        )}
      </article>
    </div>
  );
}
