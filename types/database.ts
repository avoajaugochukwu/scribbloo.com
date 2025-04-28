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
export interface Category {
  id: string; // uuid
  name: string;
  slug: string | null; // Assuming slug can be nullable based on schema, adjust if required
}

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

// --- Application-Specific Combined Types ---

/**
 * Represents a Category object along with its associated images.
 * This is likely derived from a join query or multiple queries.
 */
export interface CategoryWithImages extends Category {
  images: Image[]; // Array of images associated with the category
}

// Reintroduce the ImageType alias
/**
 * Alias for Image interface to avoid naming conflicts (e.g., with next/image).
 */
export type ImageType = Image; 