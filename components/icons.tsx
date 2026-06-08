/**
 * Small stroke-only icon set, lifted from the Scribbloo design. Each is a
 * 24×24 path group that inherits `currentColor`. Rendered inside a sized <svg>.
 */
import { cn } from '@/lib/utils';

type IconProps = { className?: string };

const base = (className?: string) =>
  cn('h-5 w-5 fill-none stroke-current [stroke-width:2.4] [stroke-linecap:round] [stroke-linejoin:round]', className);

export const ArrowIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </svg>
);

export const DownloadGlyph = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
  </svg>
);

export const PrintGlyph = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M7 14h10v7H7z" />
  </svg>
);

export const HeartGlyph = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn(
      'h-5 w-5 stroke-current [stroke-width:2.2]',
      filled ? 'fill-current' : 'fill-none',
      className,
    )}
    aria-hidden="true"
  >
    <path d="M12 20s-7-4.3-9.3-8.5C1 8 2.5 5 5.5 5 7.5 5 9 6.2 12 9c3-2.8 4.5-4 6.5-4 3 0 4.5 3 2.8 6.5C19 15.7 12 20 12 20z" />
  </svg>
);

export const SparkleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <path d="M12 3v6m0 6v6m9-9h-6M9 12H3m13.5-4.5l-3 3m-3 3l-3 3m12 0l-3-3m-3-3l-3-3" />
  </svg>
);

export const PaletteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2-.5-1.2.3-2 1.5-2H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" />
    <circle cx="8" cy="11" r="1.3" />
    <circle cx="12" cy="8" r="1.3" />
    <circle cx="16" cy="11" r="1.3" />
  </svg>
);

export const BookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={base(className)} aria-hidden="true">
    <path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z" />
  </svg>
);

/* ---- Theme rail icons (32×32 primitives, keyed by subject slug) --------- */

const themeIcons: Record<string, React.ReactNode> = {
  animals: (
    <>
      <circle cx="9" cy="13" r="6" />
      <circle cx="23" cy="13" r="6" />
      <circle cx="16" cy="22" r="8" />
      <circle cx="14" cy="21" r="1.2" className="fill-current" />
      <circle cx="18" cy="21" r="1.2" className="fill-current" />
    </>
  ),
  nature: (
    <>
      <path d="M16 28 V14" />
      <circle cx="16" cy="11" r="7" />
      <path d="M16 18 l-6 4 M16 22 l6 4" />
    </>
  ),
  fantasy: <path d="M16 4 l3.4 7 7.6 1-5.5 5.4 1.3 7.6L16 28l-6.8 4 1.3-7.6L5 19l7.6-1z" />,
  characters: (
    <>
      <circle cx="16" cy="11" r="6" />
      <path d="M6 28 a10 10 0 0 1 20 0" />
    </>
  ),
  girl: (
    <>
      <circle cx="16" cy="11" r="6" />
      <path d="M6 28 a10 10 0 0 1 20 0" />
    </>
  ),
  'for-kids': (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="12" cy="14" r="1.4" className="fill-current" />
      <circle cx="20" cy="14" r="1.4" className="fill-current" />
      <path d="M11 20 q5 5 10 0" />
    </>
  ),
  unicorn: (
    <>
      <path d="M10 26 q-2-10 6-13 l2-5 1 5 q7 3 5 13" />
      <circle cx="13" cy="18" r="1.2" className="fill-current" />
    </>
  ),
  dinosaur: (
    <>
      <path d="M6 24 q2-12 12-12 8 0 8 8" />
      <path d="M6 24 h20" />
      <circle cx="22" cy="16" r="1.2" className="fill-current" />
    </>
  ),
  pokemon: (
    <>
      <circle cx="16" cy="16" r="11" />
      <path d="M5 16 h22" />
      <circle cx="16" cy="16" r="3.5" />
    </>
  ),
  cozy: (
    <>
      <path d="M6 14 L16 6 L26 14" />
      <rect x="9" y="14" width="14" height="11" rx="1.5" />
    </>
  ),
  mandala: (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="5" />
      <path d="M16 5 V27 M5 16 H27" />
    </>
  ),
  holidays: (
    <>
      <path d="M16 4 L26 26 H6 Z" />
      <path d="M6 26 h20" />
      <circle cx="16" cy="30" r="1.4" className="fill-current" />
    </>
  ),
};

const fallbackIcon = (
  <>
    <circle cx="16" cy="16" r="11" />
    <path d="M11 19 q5 4 10 0" />
    <circle cx="12" cy="13" r="1.3" className="fill-current" />
    <circle cx="20" cy="13" r="1.3" className="fill-current" />
  </>
);

export function ThemeIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-[30px] w-[30px] fill-none stroke-current [stroke-width:2.2] [stroke-linecap:round] [stroke-linejoin:round]', className)}
      aria-hidden="true"
    >
      {themeIcons[slug] ?? fallbackIcon}
    </svg>
  );
}
