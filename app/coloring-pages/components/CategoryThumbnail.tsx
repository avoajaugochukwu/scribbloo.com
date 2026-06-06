import Image from 'next/image';
import { imageUrl } from '@/lib/images';
import type { Category } from '@/lib/content/types';

interface CategoryThumbnailProps {
  category: Category;
}

export default function CategoryThumbnail({ category }: CategoryThumbnailProps) {
  return (
    <>
      {category.thumbnailImage ? (
        <div className="mb-2 relative w-full overflow-hidden rounded">
          <Image
            src={imageUrl({ kind: 'category-thumb', slug: category.slug })}
            alt={`${category.seoTitle || category.name} thumbnail`}
            width={300}
            height={200}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="w-full h-auto object-cover rounded-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        // Placeholder if no thumbnail image
        <div className="mb-2 h-24 w-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
          No Image
        </div>
      )}
      {/* Category Name */}
      <span className="text-xl text-pink-600 hover:text-pink-800">
        {category.seoTitle || category.name}
      </span>
    </>
  );
}
