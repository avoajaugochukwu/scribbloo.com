/**
 * Represents the structure of the 'images' table.
 */
export interface Image {
  id: string; // uuid is represented as string in JS/TS
  title: string;
  description: string | null;
  image_url: string;
  created_at: string; // timestamp with time zone is typically string
}

/**
 * Represents the structure of the 'categories' table.
 */
export type Category = {
  id: string;
  name: string;
  created_at: string;
  description: string;
  seo_title: string;
  seo_description: string;
  hero_image_url: string;
  thumbnail_image_url: string;
  slug: string;
}; 

/**
 * Represents the structure of the 'tags' table.
 */
export interface Tag {
  id: string; // uuid
  name: string;
}

/**
 * Represents the structure of the 'image_categories' join table.
 */
export interface ImageCategory {
  id: string; // uuid
  image_id: string; // uuid
  category_id: string; // uuid
}

/**
 * Represents the structure of the 'image_tags' join table.
 */
export interface ImageTag {
  id: string; // uuid
  image_id: string; // uuid
  tag_id: string; // uuid
}
