// Import the Supabase client and necessary types
import { supabase } from './supabaseClient'; // Adjust path if needed
import { CategoryWithImages, Category, ImageType } from '@/types/database'; // Adjust path if needed

/**
 * Fetches a category by its slug, including its associated images, using multiple queries.
 *
 * @param categorySlug The slug of the category to fetch.
 * @returns A promise that resolves to the CategoryWithImages object or null if not found.
 */
export async function getImagesByCategorySlug(categorySlug: string): Promise<CategoryWithImages | null> {
  // Validate the slug
  if (!categorySlug) {
    console.error('Error: categorySlug is required.');
    return null;
  }

  try {
    // 1 & 2: Query categories table for the category ID and details
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug') // <-- Removed description
      .eq('slug', categorySlug)
      .maybeSingle(); // Expect 0 or 1 category

    if (categoryError) {
      console.error('Error fetching category:', categoryError.message);
      throw categoryError;
    }

    // If category not found, return null
    if (!categoryData) {
      return null;
    }

    const categoryId = categoryData.id;

    // 3: Query image_categories table for image IDs
    const { data: imageCategoryLinks, error: linksError } = await supabase
      .from('image_categories')
      .select('image_id') // Select only the image_id column
      .eq('category_id', categoryId);

    if (linksError) {
      console.error('Error fetching image_categories links:', linksError.message);
      throw linksError;
    }

    // 4: Get all image_ids
    const imageIds = imageCategoryLinks?.map(link => link.image_id) || [];

    // If no images are linked, return category data with empty images array
    if (imageIds.length === 0) {
      // Explicitly construct the object
      const result: CategoryWithImages = {
        id: categoryData.id,
        name: categoryData.name,
        slug: categoryData.slug,
        images: [],
      };
      return result;
    }

    // 5: Query images table for image details
    const { data: imagesData, error: imagesError } = await supabase
      .from('images')
      .select('id, title, description, image_url, created_at') // Select desired image fields
      .in('id', imageIds); // Find images where ID is in the list of imageIds

    if (imagesError) {
      console.error('Error fetching images:', imagesError.message);
      throw imagesError;
    }

    // 6: Combine category data and images data and return
    // Explicitly construct the object
    const result: CategoryWithImages = {
      id: categoryData.id,
      name: categoryData.name,
      slug: categoryData.slug,
      images: (imagesData || []) as ImageType[],
    };

    return result;

  } catch (err) {
    // Log the error caught by the try...catch block
    if (err instanceof Error) {
        console.error('An unexpected error occurred in getImagesByCategorySlug:', err.message);
    } else {
        console.error('An unexpected error occurred in getImagesByCategorySlug:', err);
    }
    return null; // Return null on unexpected errors
  }
}

// You might add other functions here related to fetching coloring page data,
// like fetching all categories, fetching images by tag, etc.

/**
 * Fetches all categories.
 *
 * @returns A promise that resolves to an array of Category objects.
 */
export async function getAllCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug')
            .order('name', { ascending: true }); // Optional: order categories by name

        if (error) {
            console.error('Error fetching all categories:', error.message);
            throw error;
        }

        // Ensure data is not null and cast to the expected type
        return (data || []) as Category[];

    } catch (err) {
        console.error('An unexpected error occurred in getAllCategories:', err);
        return []; // Return empty array on error
    }
}