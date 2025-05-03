'use client';

import { Constants } from '@/config/constants';
import Category from '@/types/category.type';
import Image from 'next/image';

interface CategoryThumbnailProps {
  category: Category;
}

export default function CategoryThumbnail({ category }: CategoryThumbnailProps) {
  const imageUrl = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL + category.thumbnail_image;
  const cdnUrl = `https://imagecdn.app/v1/images/${encodeURIComponent(imageUrl)}?width=600`;

  return (
    <>
      {category.thumbnail_image ? (
        <div className="mb-2 relative w-full overflow-hidden rounded">
          <Image
            src={cdnUrl}
            alt={`${category.seo_title || category.name} thumbnail`}
            width={300}
            height={200}
            className="w-full h-auto object-cover rounded-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        // Placeholder if no thumbnail URL
        <div className="mb-2 h-24 w-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          No Image
        </div>
      )}
      {/* Category Name - Changed text color to pink */}
      <span className="text-xl text-pink-600 hover:text-pink-800">
        {category.seo_title}
      </span>
    </>
  );
} 