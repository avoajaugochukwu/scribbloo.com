import Link from 'next/link';
import PageBreadcrumb, { type CrumbItem } from '@/components/PageBreadcrumb';
import PageHeading from '@/components/PageHeading';
import type { Doc } from '@/lib/content/docs';

/**
 * Shared index + article layouts for the flat doc namespaces
 * (/how-to-draw, /drawing-ideas, /tools). Kept generic so each route file is a
 * thin wrapper that just supplies data + breadcrumbs.
 */

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
  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={title} subtitle={subtitle} className="mb-8 md:mb-10" />
      {docs.length === 0 ? (
        <p className="text-center text-muted-foreground">Nothing here yet — check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`${basePath}/${doc.slug}`}
              className="group pressable shadow-pop block rounded-[var(--radius)] border-2 border-ink bg-card p-6"
            >
              <h2 className="font-display text-xl font-bold group-hover:text-terracotta">{doc.title}</h2>
              {doc.description && (
                <p className="mt-2 text-muted-foreground text-pretty">{doc.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DocArticle({ doc, crumbs }: { doc: Doc; crumbs: CrumbItem[] }) {
  return (
    <div className="container mx-auto px-4 pb-8 md:pb-12">
      <PageBreadcrumb items={crumbs} />
      <PageHeading title={doc.title} subtitle={doc.subtitle ?? undefined} className="mb-8 md:mb-10" />
      <article className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
        {doc.description && <p className="text-xl text-foreground">{doc.description}</p>}
        {doc.body ? (
          <div className="mt-6 whitespace-pre-line">{doc.body}</div>
        ) : (
          <p className="mt-6 italic">Full content coming soon.</p>
        )}
      </article>
    </div>
  );
}
