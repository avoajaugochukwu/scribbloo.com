import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getDoc, getDocSlugs } from '@/lib/content/docs';
import { DocArticle } from '@/components/DocLayouts';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getDocSlugs('how-to-draw')).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HowToDrawDetail({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDoc('how-to-draw', slug);
  if (!doc) notFound();
  return (
    <DocArticle
      doc={doc}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'How to Draw', href: '/how-to-draw' },
        { label: doc.title, href: `/how-to-draw/${doc.slug}` },
      ]}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc('how-to-draw', slug);
  if (!doc) return { title: 'Tutorial Not Found' };
  const url = `${baseUrl}/how-to-draw/${doc.slug}`;
  return {
    title: `${doc.title} | Scribbloo`,
    description: doc.description ?? undefined,
    alternates: { canonical: url },
  };
}
