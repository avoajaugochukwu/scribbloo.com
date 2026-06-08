import { cn } from '@/lib/utils';

/**
 * The Scribbloo lockup: a rounded-square smiley "mark" + the wordmark with a
 * red "oo". Inherits `currentColor` for the ink, so it reads on cream or paper.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-ink', className)}>
      <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="11"
          fill="var(--yellow)"
          stroke="var(--ink)"
          strokeWidth="2.5"
        />
        <path
          d="M11 25 q4 -10 8 0 t8 0"
          stroke="var(--red)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="14" cy="14" r="2.4" fill="var(--ink)" />
        <circle cx="26" cy="14" r="2.4" fill="var(--ink)" />
      </svg>
      <span className="font-display text-[27px] font-bold leading-none tracking-tight">
        Scribbl<span className="text-red">oo</span>
      </span>
    </span>
  );
}

export default BrandMark;
