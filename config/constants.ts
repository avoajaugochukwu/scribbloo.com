// config/constants.ts

// Validate that environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SUPABASE_COLORING_PAGES_BUCKET_NAME: string = 'coloring-pages';
const SUPABASE_COLORING_PAGES_BUCKET_URL: string = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_COLORING_PAGES_BUCKET_NAME}/`;
const SUPABASE_HERO_IMAGES_BUCKET_NAME: string = 'hero-images';
const SUPABASE_HERO_IMAGES_BUCKET_URL: string = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_HERO_IMAGES_BUCKET_NAME}/`;
const SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME: string = 'thumbnail-images';
const SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL: string = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME}/`;

const COLORING_PAGES_TABLE: string = 'coloring_pages';
const CATEGORIES_TABLE: string = 'categories';
const TAGS_TABLE: string = 'tags';
const COLORING_PAGE_CATEGORY_TABLE: string = 'coloring_page_categories';
const COLORING_PAGE_TAG_TABLE: string = 'coloring_page_tags';

export const Constants = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_COLORING_PAGES_BUCKET_NAME,
  SUPABASE_COLORING_PAGES_BUCKET_URL,
  SUPABASE_HERO_IMAGES_BUCKET_NAME,
  SUPABASE_HERO_IMAGES_BUCKET_URL,
  SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME,
  SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL,
  COLORING_PAGES_TABLE,
  CATEGORIES_TABLE,
  TAGS_TABLE,
  COLORING_PAGE_CATEGORY_TABLE,
  COLORING_PAGE_TAG_TABLE,
};

// You can add other constants here as your application grows
// export const SITE_NAME = "My Coloring Pages"; 