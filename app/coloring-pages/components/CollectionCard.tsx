import Link from 'next/link';
import CategoryThumbnail from './CategoryThumbnail';
import { categoryAccents } from './categoryAccents';
import type { Category } from '@/lib/content/types';

interface CollectionCardProps {
  category: Category;
  /** canonical href for this collection (its full tree path) */
  href: string;
  /** index used to rotate the accent palette */
  accentIndex: number;
}

/**
 * A single collection tile linking to its canonical tree path. Used for both
 * top-level themes and nested child subjects/facets in any listing.
 */
export default function CollectionCard({ category, href, accentIndex }: CollectionCardProps) {
  const accent = categoryAccents[accentIndex % categoryAccents.length];
  return (
    <Link
      href={href}
      className="group pressable shadow-pop block rounded-[var(--radius)] border-2 border-ink bg-card p-3 text-center"
    >
      <CategoryThumbnail category={category} accent={accent} />
    </Link>
  );
}
