/**
 * Generates a URL-safe slug from arbitrary text.
 *
 * Extracted verbatim from the old `lib/storageUtils.ts` slugify so that the
 * migration scripts, the generation pipeline, and the content loaders all
 * produce identical slugs — this is what guarantees URL continuity with the
 * previously-indexed Supabase slugs.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accented characters into base + diacritics
    .replace(/[̀-ͯ]/g, '') // Remove diacritics
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
    .replace(/--+/g, '-') // Collapse multiple - into one
    .replace(/^-+/, '') // Trim leading -
    .replace(/-+$/, ''); // Trim trailing -
}
