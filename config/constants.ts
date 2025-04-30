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

const SUPABASE_COLORING_IMAGES_NAME: string = 'coloring-images';
const SUPABASE_COLORING_IMAGES_BUCKET_URL: string = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_COLORING_IMAGES_NAME}/`;
const SUPABASE_HERO_IMAGES_NAME: string = 'hero-images';
const SUPABASE_HERO_IMAGES_BUCKET_URL: string = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_HERO_IMAGES_NAME}/`;
const SUPABASE_THUMBNAIL_IMAGES_NAME: string = 'thumbnail-images';
const SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL: string = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_THUMBNAIL_IMAGES_NAME}/`;  

export const Constants = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_COLORING_IMAGES_NAME,
  SUPABASE_COLORING_IMAGES_BUCKET_URL,
  SUPABASE_HERO_IMAGES_NAME,
  SUPABASE_HERO_IMAGES_BUCKET_URL,
  SUPABASE_THUMBNAIL_IMAGES_NAME,
  SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL,
};

// You can add other constants here as your application grows
// export const SITE_NAME = "My Coloring Pages"; 