/**
 * Rotating accent palette for category cards. Cards cycle through these by
 * index so the grid reads as a bright, printed sticker sheet. Classes are
 * written out in full (no string interpolation) so Tailwind can statically
 * detect them.
 */
export interface CategoryAccent {
  /** Saturated label-pill background. */
  tint: string;
  /** Label text color (paired for contrast against `tint`). */
  title: string;
}

export const categoryAccents: CategoryAccent[] = [
  { tint: 'bg-mustard', title: 'text-ink' },
  { tint: 'bg-teal', title: 'text-cream' },
  { tint: 'bg-rose', title: 'text-ink' },
  { tint: 'bg-terracotta', title: 'text-cream' },
  { tint: 'bg-sage', title: 'text-ink' },
  { tint: 'bg-plum', title: 'text-cream' },
];
