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
        <div className="retro-frame overflow-hidden rounded-md p-2">
          <div className="relative aspect-[210/297] w-full overflow-hidden">
            <Image
              src={imageUrl({ kind: 'category-thumb', slug: category.slug })}
              alt={`${category.seoTitle || category.name} thumbnail`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      ) : (
        // Placeholder if no thumbnail image
        <div className="retro-frame flex aspect-[210/297] w-full items-center justify-center rounded-md text-xs text-muted-foreground">
          No Image
        </div>
      )}
      {/* Category Name — saturated retro label pill */}
      <div className={`mt-3 rounded-full border-2 border-ink py-1.5 ${accent.tint}`}>
        <span className={`font-display text-base font-bold ${accent.title}`}>
          {category.seoTitle || category.name}
        </span>
      </div>
    </>
  );
}
