'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const SWATCHES: { key: string; bg: string; mat: string }[] = [
  { key: 'paper', bg: 'bg-cream', mat: 'bg-white' },
  { key: 'red', bg: 'bg-red-t', mat: 'bg-red-t' },
  { key: 'orange', bg: 'bg-orange-t', mat: 'bg-orange-t' },
  { key: 'yellow', bg: 'bg-yellow-t', mat: 'bg-yellow-t' },
  { key: 'green', bg: 'bg-green-t', mat: 'bg-green-t' },
  { key: 'teal', bg: 'bg-teal-t', mat: 'bg-teal-t' },
  { key: 'blue', bg: 'bg-blue-t', mat: 'bg-blue-t' },
  { key: 'purple', bg: 'bg-purple-t', mat: 'bg-purple-t' },
  { key: 'pink', bg: 'bg-pink-t', mat: 'bg-pink-t' },
];

export default function SwatchPreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const mat = SWATCHES[active].mat;

  return (
    <div className="shadow-pop-lg rounded-[var(--radius-lg)] border-[2.5px] border-ink bg-cream p-6">
      <div className={cn('overflow-hidden rounded-[10px] border border-line p-3 transition-colors', mat)}>
        <div className="relative mx-auto aspect-[210/297] w-full overflow-hidden">
          <Image src={src} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 560px" className="object-contain" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <span className="mr-1 self-center font-display font-semibold text-ink-soft">Try it:</span>
        {SWATCHES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={`Preview on ${s.key} paper`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            className={cn(
              'size-[30px] rounded-full border-[2.5px] border-ink transition-transform hover:scale-110',
              s.bg,
              active === i && 'ring-2 ring-ink ring-offset-2 ring-offset-cream',
            )}
          />
        ))}
      </div>
    </div>
  );
}
