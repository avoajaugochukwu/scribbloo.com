import Link from 'next/link';
import { ThemeIcon } from '@/components/icons';
import type { CollectionNode } from '@/lib/content/collections';

/** crayon color cycled per tile: [tint background, icon stroke] */
const ACCENTS: [string, string][] = [
  ['bg-orange-t', 'text-orange'],
  ['bg-purple-t', 'text-purple'],
  ['bg-pink-t', 'text-pink'],
  ['bg-green-t', 'text-green'],
  ['bg-blue-t', 'text-blue'],
  ['bg-red-t', 'text-red'],
  ['bg-yellow-t', 'text-yellow'],
  ['bg-teal-t', 'text-teal'],
];

interface CategoryRailProps {
  themes: CollectionNode[];
  /** subtree leaf counts keyed by collection key (pathSlugs.join('/')) */
  counts: Map<string, number>;
}

export default function CategoryRail({ themes, counts }: CategoryRailProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {themes.map((t, i) => {
        const [tint, stroke] = ACCENTS[i % ACCENTS.length];
        const count = counts.get(t.pathSlugs.join('/')) ?? 0;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`pressable shadow-pop-sm flex items-center gap-3.5 rounded-[var(--radius-md)] border-[2.5px] border-ink p-4 ${tint}`}
          >
            <span className="grid size-[50px] shrink-0 place-items-center rounded-[14px] border-[2.5px] border-ink bg-white">
              <ThemeIcon slug={t.category.slug} className={stroke} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg font-semibold">
                {t.category.name}
              </span>
              <span className="text-[13.5px] font-bold text-ink-soft">
                {count > 0 ? `${count} page${count === 1 ? '' : 's'}` : 'New'}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
