'use client';

import Image from 'next/image';
import { ImageType } from '@/types/database'; // Adjust path if needed: ../../../types/database
import { Constants } from '@/config/constants';
import DownloadIcon from './DownloadIcon'; // Renamed import
import PrintIcon from './PrintIcon'; // <-- Import the new PrintIcon

interface ColoringPageImageProps {
  image: ImageType;
  categoryName: string;
  // Add imageUrlStub if you are constructing the URL here, otherwise remove
  // imageUrlStub: string;
}

const imageUrlStub = Constants.SUPABASE_URL + '/storage/v1/object/public/images/'

export default function ColoringPageImage({ image, categoryName }: ColoringPageImageProps) {
  const fullImageUrl = image.image_url ? imageUrlStub + image.image_url : null;

  // Generate the base filename (e.g., "fairy-girl" or "coloring-page")
  const baseFilename = image.title
    ? image.title.toLowerCase().replace(/\s+/g, '-')
    : 'coloring-page';

  // Append "-scribbloo.com.png" to the base filename
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;

  return (
    <div key={image.id} className="border rounded-lg overflow-hidden shadow-sm group relative flex flex-col">
      {/* Image Section */}
      <div className="relative">
        {fullImageUrl ? (
          <Image
            src={fullImageUrl}
            alt={image.title || `Coloring page in ${categoryName}`}
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
      <div className="p-4 flex flex-col flex-grow">
        {/* Title and Icons Container */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-lg truncate flex-grow mr-2" title={image.title || 'Untitled'}>
            {image.title || 'Untitled'}
          </h3>
          {/* Container for multiple icons */}
          <div className="flex items-center space-x-1"> {/* Add space between icons */}
            <PrintIcon
                imageUrl={fullImageUrl}
                imageTitle={image.title || 'Coloring Page'}
                filename={downloadFilename}
            />
            <DownloadIcon imageUrl={fullImageUrl} filename={downloadFilename} />
          </div>
        </div>

        {/* Description */}
        {image.description && (
          <p className="text-gray-600 text-sm truncate mb-2 flex-grow" title={image.description}> {/* Added flex-grow */}
            {image.description}
          </p>
        )}
      </div>
    </div>
  );
} 