'use client'; // Mark this as a Client Component

import Image from 'next/image';

interface CategoryThumbnailProps {
  thumbnailUrl: string | null;
  categoryName: string;
  seoTitle: string;
}

export default function CategoryThumbnail({ thumbnailUrl, categoryName, seoTitle }: CategoryThumbnailProps) {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Log the error or implement fallback logic
    console.warn(`Failed to load thumbnail: ${thumbnailUrl}`, event);
    // Optional: You could try setting a fallback image source here if needed
    // event.currentTarget.src = '/path/to/fallback-image.png';
  };

  return (
    <>
      {thumbnailUrl ? (
        <div className="mb-2 relative w-full overflow-hidden rounded"> {/* Container for image */}
          <Image
            src={thumbnailUrl}
            alt={`${categoryName} thumbnail`}
            width={300}
            height={300}
            className="w-full transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError} // Use the event handler defined in this Client Component
          />
        </div>
      ) : (
        // Placeholder if no thumbnail URL
        <div className="mb-2 h-24 w-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          No Image
        </div>
      )}
      {/* Category Name */}
      <span className="text-2xl text-blue-600 hover:text-blue-800">
        {seoTitle}
      </span>
    </>
  );
} 