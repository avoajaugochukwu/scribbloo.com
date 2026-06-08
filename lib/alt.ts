/**
 * Single source of truth for coloring-page image ALT text.
 *
 * Alt text is a real SEO + accessibility signal, so it should be descriptive —
 * the full long-tail phrase, e.g. "Printable hand-drawn unicorn coloring page
 * for kids", not just "unicorn". Both the grid card and the detail page go
 * through this so the wording stays consistent.
 *
 * Shape: `Printable hand-drawn <title> coloring page[ for <audience>]`, where the
 * audience suffix is derived from the leaf's tags (kids / adults) and omitted
 * when no audience tag is present.
 */
import type { ColoringPage } from '@/lib/content/types';

const AUDIENCE: Record<string, string> = {
  kids: 'for kids',
  kid: 'for kids',
  adults: 'for adults',
  adult: 'for adults',
};

export function coloringPageAlt(page: Pick<ColoringPage, 'title' | 'tags'>): string {
  const audience = page.tags.map((t) => AUDIENCE[t.toLowerCase()]).find(Boolean);
  return `Printable hand-drawn ${page.title} coloring page${audience ? ` ${audience}` : ''}`;
}
