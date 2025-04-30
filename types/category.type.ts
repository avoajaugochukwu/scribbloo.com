export default interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_image_url: string | null;
  hero_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_meta_description: string | null;
  created_at: string;
}