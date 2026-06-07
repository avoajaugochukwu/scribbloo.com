import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getDoc, getDocSlugs } from '@/lib/content/docs';
import { DocArticle } from '@/components/DocLayouts';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getDocSlugs('drawing-ideas')).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DrawingIdeasDetail({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDoc('drawing-ideas', slug);
  if (!doc) notFound();
  return (
    <DocArticle
      doc={doc}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Drawing Ideas', href: '/drawing-ideas' },
        { label: doc.title, href: `/drawing-ideas/${doc.slug}` },
      ]}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc('drawing-ideas', slug);
  if (!doc) return { title: 'Not Found' };
  const url = `${baseUrl}/drawing-ideas/${doc.slug}`;
  return {
    title: `${doc.title} | Scribbloo`,
    description: doc.description ?? undefined,
    alternates: { canonical: url },
  };
}
