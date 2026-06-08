import Image from 'next/image';
import Link from 'next/link';
import type { ColoringPage } from '@/lib/content/types';
import { imageUrl } from '@/lib/images';
import { coloringPageAlt } from '@/lib/alt';
import { cn } from '@/lib/utils';
import FavoriteButton from '@/components/FavoriteButton';
import DownloadIcon from './DownloadIcon';
import PrintIcon from './PrintIcon';

interface ColoringPageImageProps {
  coloringPage: ColoringPage;
  /** The page's ONE canonical detail URL (precomputed by the tree layer). */
  href: string;
  /** @deprecated alt text now comes from `coloringPageAlt()` (lib/alt.ts); kept for caller compat */
  contextLabel?: string;
  priority?: boolean;
  /** rotates the soft tint behind the line art so a grid reads like a sticker sheet */
  tintIndex?: number;
  /** show the "NEW" corner badge (computed server-side for stable hydration) */
  isNew?: boolean;
}

// soft tints behind the line art, cycled per card
const TINTS = [
  'bg-purple-t',
  'bg-green-t',
  'bg-orange-t',
  'bg-yellow-t',
  'bg-teal-t',
  'bg-pink-t',
  'bg-blue-t',
  'bg-red-t',
];

export default function ColoringPageImage({
  coloringPage,
  href: detailHref,
  priority = false,
  tintIndex = 0,
  isNew = false,
}: ColoringPageImageProps) {
  const thumbUrl = imageUrl({ kind: 'coloring-page', slug: coloringPage.image, variant: 'thumb' });
  const originalUrl = imageUrl({ kind: 'coloring-page', slug: coloringPage.image, variant: 'original' });
  const tint = TINTS[tintIndex % TINTS.length];

  const baseFilename = coloringPage.title
    ? coloringPage.title.toLowerCase().replace(/\s+/g, '-')
    : 'coloring-page';
  const downloadFilename = `${baseFilename}-scribbloo.com.png`;

  const tags = coloringPage.tags.slice(0, 2);

  return (
    <article className="group pressable shadow-pop-sm flex flex-col overflow-hidden rounded-[var(--radius-md)] border-[2.5px] border-ink bg-cream">
      {/* Art — tinted mat with the A4 line drawing centered */}
      <div className={cn('relative border-b-[2.5px] border-ink', tint)}>
        <Link href={detailHref} className="block p-3" aria-label={coloringPage.title || 'Coloring page'}>
          <div className="relative aspect-[210/297] w-full overflow-hidden">
            <Image
              src={thumbUrl}
              alt={coloringPageAlt(coloringPage)}
              fill
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        {isNew && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-red px-2.5 py-0.5 font-sans text-[12.5px] font-bold text-white">
            NEW
          </span>
        )}

        {/* Always-visible action icons (top-right) — tap targets for mobile */}
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          <DownloadIcon imageUrl={originalUrl} filename={downloadFilename} variant="overlay" />
          <PrintIcon imageUrl={originalUrl} filename={downloadFilename} variant="overlay" />
          <FavoriteButton id={detailHref} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-3.5">
        <h3 className="truncate font-display text-lg font-semibold" title={coloringPage.title || 'Untitled'}>
          <Link href={detailHref} className="transition-colors hover:text-red">
            {coloringPage.title || 'Untitled'}
          </Link>
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-cream-2 px-2.5 py-0.5 font-sans text-[12.5px] font-bold text-ink-soft"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
