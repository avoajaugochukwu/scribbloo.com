import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getDoc, getDocSlugs } from '@/lib/content/docs';
import { DocArticle } from '@/components/DocLayouts';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getDocSlugs('tools')).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolDetail({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getDoc('tools', slug);
  if (!doc) notFound();
  return (
    <DocArticle
      doc={doc}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Tools', href: '/tools' },
        { label: doc.title, href: `/tools/${doc.slug}` },
      ]}
    />
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc('tools', slug);
  if (!doc) return { title: 'Tool Not Found' };
  const url = `${baseUrl}/tools/${doc.slug}`;
  return {
    title: `${doc.title} | Scribbloo`,
    description: doc.description ?? undefined,
    alternates: { canonical: url },
  };
}
