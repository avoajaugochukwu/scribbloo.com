'use client';

import { Constants } from '@/config/constants';
import Category from '@/types/category.type';
import Image from 'next/image';

interface CategoryThumbnailProps {
  category: Category;
}

export default function CategoryThumbnail({ category }: CategoryThumbnailProps) {
  const imageUrl = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL + category.thumbnail_image_url;

  return (
    <>
      {category.thumbnail_image_url ? (
        <div className="mb-2 relative w-full overflow-hidden rounded">
          <Image
            src={imageUrl}
            alt={`${category.name} thumbnail`}
            width={300}
            height={300}
            className="w-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        // Placeholder if no thumbnail URL
        <div className="mb-2 h-24 w-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          No Image
        </div>
      )}
      {/* Category Name - Changed text color to pink */}
      <span className="text-2xl text-pink-600 hover:text-pink-800">
        {category.seo_title}
      </span>
    </>
  );
} 