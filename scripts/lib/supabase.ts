/**
 * Self-contained Supabase client + constants for the one-time migration script.
 *
 * The app no longer talks to Supabase at runtime (content is file-based now), so
 * the old `lib/supabaseClient` and `config/constants` were deleted. This keeps
 * the migration script runnable on its own: `npm run migrate:supabase` (after
 * unpausing the project). Env is loaded defensively here so it's set before the
 * client is constructed, regardless of module import order.
 */
import { createClient } from '@supabase/supabase-js';

try {
  process.loadEnvFile('.env');
} catch {
  // .env already loaded or absent — rely on the ambient environment.
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env — cannot run the Supabase migration.',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const Constants = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_COLORING_PAGES_BUCKET_NAME: 'coloring-pages',
  SUPABASE_COLORING_PAGES_BUCKET_URL: `${SUPABASE_URL}/storage/v1/object/public/coloring-pages/`,
  SUPABASE_HERO_IMAGES_BUCKET_NAME: 'hero-images',
  SUPABASE_HERO_IMAGES_BUCKET_URL: `${SUPABASE_URL}/storage/v1/object/public/hero-images/`,
  SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME: 'thumbnail-images',
  SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL: `${SUPABASE_URL}/storage/v1/object/public/thumbnail-images/`,
  COLORING_PAGES_TABLE: 'coloring_pages',
  CATEGORIES_TABLE: 'categories',
  TAGS_TABLE: 'tags',
  COLORING_PAGE_CATEGORY_TABLE: 'coloring_page_categories',
  COLORING_PAGE_TAG_TABLE: 'coloring_page_tags',
};
