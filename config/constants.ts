// config/constants.ts

// Validate that environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const Constants = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_COLORING_IMAGES_BUCKET: 'coloring-images',
  SUPABASE_HERO_IMAGES_BUCKET: 'hero-images',
  SUPABASE_THUMBNAIL_IMAGES_BUCKET: 'thumbnail-images',
};

// You can add other constants here as your application grows
// export const SITE_NAME = "My Coloring Pages"; 