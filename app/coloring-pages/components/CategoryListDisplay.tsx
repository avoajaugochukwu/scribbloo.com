import { getRootHub } from '@/lib/content/collections';
import CollectionCard from './CollectionCard';

/**
 * Grid of the top-level coloring themes (used on the homepage). Themes are the
 * top-level folders under content/coloring-pages; deeper nesting is resolved by
 * the catch-all route.
 */
export default async function CategoryListDisplay() {
  const { themes } = await getRootHub();

  if (themes.length === 0) {
    return <p className="text-center text-muted-foreground">No categories found.</p>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {themes.map((t, index) => (
        <CollectionCard key={t.href} category={t.category} href={t.href} accentIndex={index} />
      ))}
    </div>
  );
}
