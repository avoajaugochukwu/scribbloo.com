import Image from 'next/image';
import Link from 'next/link';
import type { ColoringPage } from '@/lib/content/types';
import { imageUrl } from '@/lib/images';
import DownloadIcon from './DownloadIcon';
import PrintIcon from './PrintIcon';

interface ColoringPageImageProps {
  coloringPage: ColoringPage;
  categorySlug: string;
  categoryName: string;
  priority?: boolean;
}

export default function ColoringPageImage({
  coloringPage,
  categorySlug,
  categoryName,
  priority = false,
}: ColoringPageImageProps) {
  const thumbUrl = imageUrl({ kind: 'coloring-page', slug: coloringPage.image, variant: 'thumb' });
  const originalUrl = imageUrl({ kind: 'coloring-page', slug: coloringPage.image, variant: 'original' });

  const baseFilename = coloringPage.title
    ? coloringPage.title.toLowerCase().replace(/\s+/g, '-')
    : 'coloring-page';

  // Append "-scribbloo.com.png" to the base filename for download
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;

  const detailHref = `/coloring-pages/${categorySlug}/${coloringPage.slug}`;

  return (
    <div className="group pressable shadow-pop relative flex flex-col overflow-hidden rounded-[var(--radius)] border-2 border-ink bg-card">
      {/* Image Section — A4 portrait frame (matches download/print), matted with padding */}
      <Link
        href={detailHref}
        className="block border-b-2 border-ink bg-white p-3"
      >
        <div className="relative aspect-[210/297] w-full overflow-hidden">
          <Image
            src={thumbUrl}
            alt={`${coloringPage.description || coloringPage.title} coloring page in ${categoryName}`}
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Info Section */}
      <div className="flex flex-grow flex-col p-4 px-6">
        {/* Title and Icons Container */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-display font-bold text-xl truncate flex-grow mr-2" title={coloringPage.title || 'Untitled'}>
            <Link href={detailHref} className="transition-colors hover:text-terracotta">
              {coloringPage.title || 'Untitled'}
            </Link>
          </h3>
          {/* Container for multiple icons */}
          <div className="flex items-center space-x-4">
            <PrintIcon imageUrl={originalUrl} filename={downloadFilename} />
            <DownloadIcon imageUrl={originalUrl} filename={downloadFilename} />
          </div>
        </div>

        {/* Description */}
        {coloringPage.description && (
          <p className="text-muted-foreground text-md truncate mb-2 flex-grow" title={coloringPage.description}>
            {coloringPage.description}
          </p>
        )}
      </div>
    </div>
  );
}
