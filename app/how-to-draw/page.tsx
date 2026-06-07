import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getDocs } from '@/lib/content/docs';
import { DocIndex } from '@/components/DocLayouts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'How to Draw — Step-by-Step Tutorials | Scribbloo',
  description: 'Free step-by-step drawing tutorials — learn to draw animals, characters, flowers and more, one simple step at a time.',
  alternates: { canonical: `${baseUrl}/how-to-draw` },
};

export default async function HowToDrawIndex() {
  const docs = await getDocs('how-to-draw');
  return (
    <DocIndex
      title="How to Draw"
      subtitle="Step-by-step drawing tutorials for every skill level."
      basePath="/how-to-draw"
      docs={docs}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'How to Draw', href: '/how-to-draw' },
      ]}
    />
  );
}
