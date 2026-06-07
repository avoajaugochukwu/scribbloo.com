import { getTopLevelCollections } from '@/lib/content/collections';
import CollectionCard from './CollectionCard';

/**
 * Grid of the top-level coloring themes. Used on the homepage. Top-level
 * collections are flat (`/coloring-pages/<slug>`); deeper nesting is resolved by
 * the catch-all route.
 */
export default async function CategoryListDisplay() {
  const themes = await getTopLevelCollections();

  if (themes.length === 0) {
    return <p className="text-center text-muted-foreground">No categories found.</p>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {themes.map((category, index) => (
        <CollectionCard
          key={category.slug}
          category={category}
          href={`/coloring-pages/${category.slug}`}
          accentIndex={index}
        />
      ))}
    </div>
  );
}
