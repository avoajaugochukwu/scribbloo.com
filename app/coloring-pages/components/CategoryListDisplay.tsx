import Link from 'next/link';
import { getAllCategories } from '@/lib/content/coloringPages';
import CategoryThumbnail from './CategoryThumbnail';
import { categoryAccents } from './categoryAccents';
import type { Category } from '@/lib/content/types';

// This is a React Server Component (RSC) as it fetches data
export default async function CategoryListDisplay() {
  const categories = await getAllCategories();

  if (!categories || categories.length === 0) {
    return <p className="text-center text-muted-foreground">No categories found.</p>;
  }

  return (
    // Responsive Grid: 1 col default, 2 cols sm+, 3 cols lg+, 4 cols xl+
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category: Category, index) => {
        const accent = categoryAccents[index % categoryAccents.length];
        return (
          <Link
            href={`/coloring-pages/${category.slug}`}
            key={category.slug}
            className="group pressable shadow-pop block rounded-[var(--radius)] border-2 border-ink bg-card p-3 text-center"
          >
            <CategoryThumbnail category={category} accent={accent} />
          </Link>
        );
      })}
    </div>
  );
}
