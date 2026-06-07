import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getDocs } from '@/lib/content/docs';
import { DocIndex } from '@/components/DocLayouts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Free Coloring & Drawing Tools | Scribbloo',
  description: 'Free tools to turn photos into coloring pages, generate drawing ideas, and make your own coloring books.',
  alternates: { canonical: `${baseUrl}/tools` },
};

export default async function ToolsIndex() {
  const docs = await getDocs('tools');
  return (
    <DocIndex
      title="Tools"
      subtitle="Turn photos into coloring pages and spark new ideas — all free."
      basePath="/tools"
      docs={docs}
      crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Tools', href: '/tools' },
      ]}
    />
  );
}
