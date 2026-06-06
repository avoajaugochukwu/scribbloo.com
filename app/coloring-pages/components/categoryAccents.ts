/**
 * Rotating accent palette for category cards. Cards cycle through these by
 * index so the grid reads as bold and colorful. Classes are written out in
 * full (no string interpolation) so Tailwind can statically detect them.
 */
export interface CategoryAccent {
  /** Card border (idle + hover). */
  border: string;
  /** Soft tinted strip behind the title. */
  tint: string;
  /** Title color. */
  title: string;
}

export const categoryAccents: CategoryAccent[] = [
  { border: 'border-pink-200 hover:border-pink-400', tint: 'bg-pink-50', title: 'text-pink-700' },
  { border: 'border-purple-200 hover:border-purple-400', tint: 'bg-purple-50', title: 'text-purple-700' },
  { border: 'border-sky-200 hover:border-sky-400', tint: 'bg-sky-50', title: 'text-sky-700' },
  { border: 'border-teal-200 hover:border-teal-400', tint: 'bg-teal-50', title: 'text-teal-700' },
  { border: 'border-amber-200 hover:border-amber-400', tint: 'bg-amber-50', title: 'text-amber-700' },
  { border: 'border-orange-200 hover:border-orange-400', tint: 'bg-orange-50', title: 'text-orange-700' },
];
