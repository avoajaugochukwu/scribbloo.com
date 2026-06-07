import { cn } from '@/lib/utils';

interface PageHeadingProps {
  /** Main heading text, rendered with the bold brand gradient. */
  title: React.ReactNode;
  /** Optional supporting line under the title. */
  subtitle?: React.ReactNode;
  /** Heading level — defaults to h1. Use h2 for in-page section headings. */
  as?: 'h1' | 'h2';
  className?: string;
}

/**
 * Big, bold, gradient page/section heading used across the site.
 * Centralizes the previously-duplicated `<h1 className="text-3xl…font-extrabold…">`
 * markup so the bold look lives in one place.
 */
export default function PageHeading({
  title,
  subtitle,
  as: Tag = 'h1',
  className,
}: PageHeadingProps) {
  const sizing =
    Tag === 'h1'
      ? 'text-4xl sm:text-5xl lg:text-6xl'
      : 'text-3xl sm:text-4xl';

  return (
    <div className={cn('text-center', className)}>
      <Tag
        className={cn(
          'text-retro font-display font-extrabold tracking-tight text-balance',
          sizing,
        )}
      >
        {title}
      </Tag>
      {/* Hand-drawn underline flourish under the title */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className="mx-auto mt-3 h-2.5 w-40 text-terracotta"
      >
        <path
          d="M2 8 Q 50 0 100 6 T 198 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  );
}
