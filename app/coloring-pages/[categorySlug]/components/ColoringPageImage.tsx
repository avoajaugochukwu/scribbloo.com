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
    <div className="border rounded-lg overflow-hidden shadow-sm group relative flex flex-col">
      {/* Image Section */}
      <Link href={detailHref} className="relative block">
        <Image
          src={thumbUrl}
          alt={`${coloringPage.description || coloringPage.title} coloring page in ${categoryName}`}
          width={300}
          height={300}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow px-6">
        {/* Title and Icons Container */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-xl truncate flex-grow mr-2" title={coloringPage.title || 'Untitled'}>
            <Link href={detailHref} className="hover:text-pink-600">
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
          <p className="text-gray-600 text-md truncate mb-2 flex-grow" title={coloringPage.description}>
            {coloringPage.description}
          </p>
        )}
      </div>
    </div>
  );
}
