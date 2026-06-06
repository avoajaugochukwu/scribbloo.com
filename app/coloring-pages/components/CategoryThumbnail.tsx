import Image from 'next/image';
import { imageUrl } from '@/lib/images';
import type { Category } from '@/lib/content/types';
import type { CategoryAccent } from './categoryAccents';

interface CategoryThumbnailProps {
  category: Category;
  accent: CategoryAccent;
}

export default function CategoryThumbnail({ category, accent }: CategoryThumbnailProps) {
  return (
    <>
      {category.thumbnailImage ? (
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src={imageUrl({ kind: 'category-thumb', slug: category.slug })}
            alt={`${category.seoTitle || category.name} thumbnail`}
            width={300}
            height={200}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="h-auto w-full rounded-xl border-2 border-black object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        // Placeholder if no thumbnail image
        <div className={`flex h-24 w-full items-center justify-center rounded-xl text-xs text-muted-foreground ${accent.tint}`}>
          No Image
        </div>
      )}
      {/* Category Name */}
      <div className={`mt-3 rounded-xl py-2 ${accent.tint}`}>
        <span className={`text-lg font-extrabold ${accent.title}`}>
          {category.seoTitle || category.name}
        </span>
      </div>
    </>
  );
}
