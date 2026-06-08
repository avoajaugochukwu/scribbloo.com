import { z } from 'zod';

/**
 * Zod schemas + inferred TypeScript types for the file-based content layer.
 *
 * These are THE contract shared by:
 *   - the migration scripts (which WRITE frontmatter), and
 *   - the content loaders in lib/content/* (which READ + validate frontmatter).
 *
 * Frontmatter uses camelCase. The on-disk image layout is derived from slugs by
 * `lib/images.ts` (imageUrl), so image fields below store a filename-or-null
 * presence flag rather than a full URL.
 */

/* -------------------------------------------------------------------------- */
/* Per-category SEO detail blocks (ported 1:1 from components/seo-details/data) */
/* -------------------------------------------------------------------------- */

export const faqItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  question: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
});
export type FaqItem = z.infer<typeof faqItemSchema>;

export const seoDetailsSchema = z.object({
  paragraph: z.string().optional(),
  howToGuideTitle: z.string().optional(),
  howToGuide: z
    .array(z.object({ step: z.number(), title: z.string(), description: z.string() }))
    .optional(),
  activityIdeasTitle: z.string().optional(),
  activityIdeas: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
  printableTipsTitle: z.string().optional(),
  printableTips: z
    .array(z.object({ segments: z.array(z.object({ text: z.string(), bold: z.boolean().optional() })) }))
    .optional(),
  faqs: z.array(faqItemSchema).optional(),
});
export type SeoDetails = z.infer<typeof seoDetailsSchema>;

/* -------------------------------------------------------------------------- */
/* Collection — content/coloring-pages/<path>/_category.mdx (facets: content/facets/<slug>.mdx) */
/* -------------------------------------------------------------------------- */

export const categorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().default(null),
  seoTitle: z.string().nullable().default(null),
  seoDescription: z.string().nullable().default(null),
  seoMetaDescription: z.string().nullable().default(null),
  /** filename present under public/images/categories/<slug>/ (hero.webp), or null if none */
  heroImage: z.string().nullable().default(null),
  thumbnailImage: z.string().nullable().default(null),
  /** controls ordering in category grids (replaces the old `.order('name')`) */
  order: z.number().default(0),
  seoDetails: seoDetailsSchema.optional(),

  /* --- tree / scale fields (url-structure-guide.md) ---
   * Hierarchy is folder-driven (the path IS the tree), so there is no `parent`/
   * `kind` field — a folder with `_category.mdx` is a subject node; a file under
   * content/facets/ is a facet. These two fields remain: */
  /** synonym slugs that 308-redirect into this collection's canonical path. */
  aliases: z.array(z.string()).default([]),
  /** facets only (content/facets/*.mdx): the leaf tag this landing aggregates (e.g. 'kids'). */
  facetTag: z.string().nullable().default(null),
});
export type Category = z.infer<typeof categorySchema>;

/* -------------------------------------------------------------------------- */
/* Coloring page (leaf) — content/coloring-pages/<path>/<slug>.mdx             */
/* -------------------------------------------------------------------------- */

export const coloringPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  /** folder name under public/images/coloring-pages/<image>/ — normally equals slug */
  image: z.string(),
  // No `subject`/`categories`: a leaf's ONE canonical home is the folder it lives
  // in (the file path). `tags` drive facet listings + related links.
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  source: z.enum(['fal', 'grok', 'supabase-migration', 'manual']).default('manual'),
  /** fal.ai request id — idempotency/traceability for generated pages */
  falRequestId: z.string().optional(),
  /**
   * Composition the page was generated + framed for (see scripts/lib/frameA4.ts):
   *   'full'  — whole subject inside the frame, doesn't touch the edges
   *   'bleed' — cropped/close-up subject that runs off a page edge ("passport")
   * No border is baked in; a border is an optional user choice at download time.
   */
  layout: z.enum(['full', 'bleed']).default('full'),
  /**
   * The full descriptive sentence(s) used to generate this page. Each page should
   * have its OWN bespoke prompt (not just the title) — a one-line template makes
   * every generation converge on the same look. Recorded for variety + regen.
   */
  prompt: z.string().optional(),
  /** the look-version this page was generated at (see STYLE_VERSION in scripts/lib/fal.ts) */
  styleVersion: z.number().optional(),
  /** blog slugs to cross-link from this page (internal linking) */
  relatedPosts: z.array(z.string()).default([]),
  /** set by the Supabase migration when the only available image looked downscaled */
  needsRegen: z.boolean().default(false),
  /**
   * Per-leaf SEO body (anti-thin-content — see plan/thin-content-guide.md).
   * Reuses the same block as collections: an intro `paragraph` plus optional
   * coloring tips (`printableTips`) and a short `faqs` list. Rendered by
   * components/seo-details/OtherDetails and surfaced as FAQPage JSON-LD.
   * Every published leaf SHOULD have this — `description`-only is thin.
   */
  seoDetails: seoDetailsSchema.optional(),
});
export type ColoringPage = z.infer<typeof coloringPageSchema>;

/** Shape returned by getColoringPagesByCategorySlug — a category plus its pages. */
export interface CategoryWithColoringPages extends Category {
  coloringPages: ColoringPage[];
}

/* -------------------------------------------------------------------------- */
/* Blog post — content/blog/<slug>.mdx (body is MDX, not frontmatter)          */
/* -------------------------------------------------------------------------- */

export const blogPostFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable().default(null),
  metaDescription: z.string().nullable().default(null),
  author: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  /** filename present under public/images/blog/<slug>/ (featured.webp), or null */
  featuredImage: z.string().nullable().default(null),
  publishedAt: z.string().nullable().default(null),
  status: z.string().default('Done'),
  /** category slugs to cross-link to (internal linking) */
  relatedCategories: z.array(z.string()).default([]),
  /** coloring-page slugs to cross-link to (internal linking) */
  relatedPages: z.array(z.string()).default([]),
});
export type BlogPostFrontmatter = z.infer<typeof blogPostFrontmatterSchema>;

/** A fully-loaded blog post: validated frontmatter + the raw MDX body. */
export interface BlogPost extends BlogPostFrontmatter {
  /** raw MDX body, compiled at render time */
  content: string;
}
