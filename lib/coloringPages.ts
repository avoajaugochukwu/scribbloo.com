// Import the Supabase client and necessary types

import { supabase } from './supabaseClient'; // Adjust path if needed
import ColoringPage from '@/types/coloringpage.type';
import Category from '@/types/category.type';
import { Constants } from '@/config/constants';
import CategoryWithColoringPages from '@/types/categorywithcoloringpages.type';

/**
 * Fetches a category by its slug, including its associated images, using multiple queries.
 *
 * @param categorySlug The slug of the category to fetch.
 * @returns A promise that resolves to the CategoryWithImages object or null if not found.
 */
export async function getColoringPagesByCategorySlug(categorySlug: string): Promise<CategoryWithColoringPages | null> {
  // Validate the slug
  if (!categorySlug) {
    console.error('Error: categorySlug is required.');
    return null;
  }

  try {
    // 1 & 2: Query categories table for the category ID and details
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug, created_at, description, seo_title, seo_description, seo_meta_description, hero_image, thumbnail_image') // Renamed fields
      .eq('slug', categorySlug)
      .maybeSingle();

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
    const { data: coloringPageCategoryLinks, error: linksError } = await supabase
      .from(Constants.COLORING_PAGE_CATEGORY_TABLE)
      .select('coloring_page_id')
      .eq('category_id', categoryId);

    if (linksError) {
      console.error('Error fetching coloring page tag links:', linksError.message);
      throw linksError;
    }

    // 4: Get all image_ids
    const coloringPageIds = coloringPageCategoryLinks?.map(link => link.coloring_page_id) || [];

    // If no images are linked, return category data with empty images array
    if (coloringPageIds.length === 0) {
      // Explicitly construct the object
      const result: CategoryWithColoringPages = {
        id: categoryData.id,
        name: categoryData.name,
        slug: categoryData.slug,
        created_at: categoryData.created_at,
        description: categoryData.description,
        seo_title: categoryData.seo_title,
        seo_description: categoryData.seo_description,
        seo_meta_description: categoryData.seo_meta_description,
        hero_image: categoryData.hero_image, // Renamed field
        thumbnail_image: categoryData.thumbnail_image, // Renamed field
        coloringPages: [],
      };
      return result;
    }

    // 5: Query coloring_pages table for image details
    const { data: coloringPagesData, error: coloringPagesError } = await supabase
      .from(Constants.COLORING_PAGES_TABLE) // <-- Use constant
      .select('id, title, description, image_url, created_at, webp_image_url')
      .in('id', coloringPageIds);

    if (coloringPagesError) {
      console.error('Error fetching coloring pages:', coloringPagesError.message);
      throw coloringPagesError;
    }

    // 6: Combine category data and images data and return
    // Explicitly construct the object
    const result: CategoryWithColoringPages = {
      id: categoryData.id,
      name: categoryData.name,
      slug: categoryData.slug,
      created_at: categoryData.created_at,
      description: categoryData.description,
      seo_title: categoryData.seo_title,
      seo_description: categoryData.seo_description,
      seo_meta_description: categoryData.seo_meta_description,
      hero_image: categoryData.hero_image, // Renamed field
      thumbnail_image: categoryData.thumbnail_image, // Renamed field
      coloringPages: (coloringPagesData || []) as ColoringPage[],
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

/**
 * Fetches all categories.
 *
 * @returns A promise that resolves to an array of Category objects.
 */
export async function getAllCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, seo_title, thumbnail_image') // Example: Added thumbnail_image
            .order('name', { ascending: true });

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