import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getDocs } from '@/lib/content/docs';
import { DocIndex } from '@/components/DocLayouts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Drawing Ideas & Things to Draw | Scribbloo',
  description: 'Hundreds of drawing ideas and things to draw — cool, cute, simple and seasonal prompts for when you need inspiration.',
  alternates: { canonical: `${baseUrl}/drawing-ideas` },
};

export default async function DrawingIdeasIndex() {
  const docs = await getDocs('drawing-ideas');
  return (
    <DocIndex
      title="Drawing Ideas"
      subtitle="Hundreds of things to draw when you need a spark of inspiration."
      basePath="/drawing-ideas"
      docs={docs}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Drawing Ideas', href: '/drawing-ideas' },
      ]}
    />
  );
}
