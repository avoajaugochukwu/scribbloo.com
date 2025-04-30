'use client';

import Image from 'next/image';
import ColoringPage from '@/types/coloringpage.type';
import { Constants } from '@/config/constants';
import DownloadIcon from './DownloadIcon';
import PrintIcon from './PrintIcon';

interface ColoringPageImageProps {
  coloringPage: ColoringPage;
  categoryName: string;
}

export default function ColoringPageImage({ coloringPage, categoryName }: ColoringPageImageProps) {
  const imageUrl = Constants.SUPABASE_COLORING_PAGES_BUCKET_URL + coloringPage.image_url;
  const baseFilename = coloringPage.title
    ? coloringPage.title.toLowerCase().replace(/\s+/g, '-')
    : 'coloring-page';

  // Append "-scribbloo.com.png" to the base filename for download
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;

  return (
    <div key={coloringPage.id} className="border rounded-lg overflow-hidden shadow-sm group relative flex flex-col">
      {/* Image Section */}
      <div className="relative">
        {coloringPage.image_url ? (
          <Image
            src={imageUrl}
            alt={`${coloringPage.description} coloring page in ${categoryName}`}
            width={300}
            height={300}
            className="w-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow px-6">
        {/* Title and Icons Container */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-xl truncate flex-grow mr-2" title={coloringPage.title || 'Untitled'}>
            {coloringPage.title || 'Untitled'}
          </h3>
          {/* Container for multiple icons */}
          <div className="flex items-center space-x-4"> {/* Add space between icons */}
            <PrintIcon
                imageUrl={imageUrl}
                filename={downloadFilename}
            />
            <DownloadIcon imageUrl={imageUrl} filename={downloadFilename} />
          </div>
        </div>

        {/* Description */}
        {coloringPage.description && (
          <p className="text-gray-600 text-md truncate mb-2 flex-grow" title={coloringPage.description}> {/* Added flex-grow */}
            {coloringPage.description}
          </p>
        )}
      </div>
    </div>
  );
} 