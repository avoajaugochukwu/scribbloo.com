/**
 * The single source of truth for turning a stored image reference into a URL.
 *
 * Today images live under `public/images/...` and are served as plain static
 * files (BASE = ''). To move to a CDN/object store later, set
 * NEXT_PUBLIC_IMAGE_BASE_URL (e.g. "https://cdn.scribbloo.com") and add that
 * host to `images.remotePatterns` in next.config.js — no page/component edits.
 *
 * On-disk layout this maps to:
 *   public/images/coloring-pages/<slug>/{original.png,full.webp,thumb.webp}
 *   public/images/categories/<slug>/{hero.webp,thumb.webp,hero-original.png}
 *   public/images/blog/<slug>/{featured.webp,featured-original.<ext>}
 *   public/images/<namespace>/<slug>/{featured.webp,featured-original.png}  (doc namespaces)
 */

export type ImageKind =
  | 'coloring-page'
  | 'category-hero'
  | 'category-thumb'
  | 'blog-featured'
  | 'doc-featured';
export type ColoringPageVariant = 'original' | 'full' | 'thumb';

export interface ImageRef {
  kind: ImageKind;
  /** page slug, category slug, or blog slug (the folder name under public/images/<kind>/) */
  slug: string;
  /** only meaningful for kind 'coloring-page'; defaults to 'full' */
  variant?: ColoringPageVariant;
  /**
   * Required for kind 'doc-featured' — the doc namespace folder
   * (how-to-draw | drawing-ideas | tools). Image lives at
   * public/images/<namespace>/<slug>/featured.webp.
   */
  namespace?: string;
}

const BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';

export function imageUrl({ kind, slug, variant, namespace }: ImageRef): string {
  switch (kind) {
    case 'coloring-page': {
      const v = variant ?? 'full';
      const file = v === 'original' ? 'original.png' : v === 'thumb' ? 'thumb.webp' : 'full.webp';
      return `${BASE}/images/coloring-pages/${slug}/${file}`;
    }
    case 'category-hero':
      return `${BASE}/images/categories/${slug}/hero.webp`;
    case 'category-thumb':
      return `${BASE}/images/categories/${slug}/thumb.webp`;
    case 'blog-featured':
      return `${BASE}/images/blog/${slug}/featured.webp`;
    case 'doc-featured':
      if (!namespace) throw new Error("imageUrl: kind 'doc-featured' requires a namespace");
      return `${BASE}/images/${namespace}/${slug}/featured.webp`;
  }
}
