'use server'; // Mark this module's exports as Server Actions/server-only functions

import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed
// Remove unused ImageType import if not needed elsewhere in this file
// import { ImageType } from '@/types/database';

// Type for the final assembled image data
export type AdminImageWithRelations = {
  id: number;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  categories: string[]; // Array of category names
  tags: string[];       // Array of tag names
};

// Type for the overall result including pagination info
export type GetAdminImagesResult = {
  images: AdminImageWithRelations[];
  totalCount: number;
};

const PAGE_SIZE = 10; // Step 1: Initialize Page State (pageSize)

/**
 * Fetches paginated images and manually joins category and tag names
 * using intermediate tables.
 */
export async function getAdminImages(
  page: number = 1 // Use 1-based page for easier UI mapping
): Promise<GetAdminImagesResult> {
  // Step 1: Initialize Page State (pageNumber derived from page)
  const pageNumber = Math.max(0, page - 1); // Convert 1-based page to 0-based index
  const from = pageNumber * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  try {
    // Step 2: Fetch 'images' records for the current page
    const { data: imagesData, error: imagesError } = await supabase
      .from('images')
      .select('id, title, image_url, created_at')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (imagesError) {
      console.error('Error fetching images:', imagesError.message);
      throw new Error(`Database error fetching images: ${imagesError.message}`);
    }

    // Fetch total count separately
    const { count: totalCount, error: countError } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true });

     if (countError) {
       // Log error but potentially continue if images were fetched
       console.error('Error fetching image count:', countError.message);
       // Decide if this is a fatal error or if you can proceed without total count
       // throw new Error(`Database error fetching count: ${countError.message}`);
     }

    if (!imagesData || imagesData.length === 0) {
      return { images: [], totalCount: totalCount ?? 0 }; // Return early if no images on this page
    }

    const imageIds = imagesData.map((img) => img.id);

    // Step 3 & 4: Fetch Categories
    let categoryMap: Map<number, string> = new Map(); // imageId -> categoryName[] (will be built later)
    const { data: imageCategoriesData, error: imageCategoriesError } = await supabase
      .from('image_categories') // JOIN TABLE 1
      .select('image_id, category_id')
      .in('image_id', imageIds);

    if (imageCategoriesError) throw new Error(`DB error fetching image_categories: ${imageCategoriesError.message}`);

    if (imageCategoriesData && imageCategoriesData.length > 0) {
        const categoryIds = [...new Set(imageCategoriesData.map(ic => ic.category_id))]; // Unique category IDs
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories') // ACTUAL CATEGORIES TABLE
            .select('id, name')
            .in('id', categoryIds);

        if (categoriesError) throw new Error(`DB error fetching categories: ${categoriesError.message}`);

        // Create a map for quick lookup: categoryId -> categoryName
        if (categoriesData) {
            categoryMap = new Map(categoriesData.map(cat => [cat.id, cat.name]));
        }
    }

    // Step 5 & 6: Fetch Tags
    let tagMap: Map<number, string> = new Map(); // tagId -> tagName
    const { data: imageTagsData, error: imageTagsError } = await supabase
        .from('image_tags') // JOIN TABLE 2
        .select('image_id, tag_id')
        .in('image_id', imageIds);

    if (imageTagsError) throw new Error(`DB error fetching image_tags: ${imageTagsError.message}`);

    if (imageTagsData && imageTagsData.length > 0) {
        const tagIds = [...new Set(imageTagsData.map(it => it.tag_id))]; // Unique tag IDs
        const { data: tagsData, error: tagsError } = await supabase
            .from('tags') // ACTUAL TAGS TABLE
            .select('id, name')
            .in('id', tagIds);

        if (tagsError) throw new Error(`DB error fetching tags: ${tagsError.message}`);

        // Create a map for quick lookup: tagId -> tagName
        if (tagsData) {
            tagMap = new Map(tagsData.map(tag => [tag.id, tag.name]));
        }
    }


    // Step 7: Assemble Data
    const assembledImages: AdminImageWithRelations[] = imagesData.map((image) => {
      // Find relevant category relations for this image
      const relatedCategoryIds = imageCategoriesData
        ?.filter(ic => ic.image_id === image.id)
        .map(ic => ic.category_id) || [];
      // Map IDs to names using the categoryMap
      const categoryNames = relatedCategoryIds
        .map(id => categoryMap.get(id))
        .filter((name): name is string => name !== undefined); // Filter out undefined/missing names

      // Find relevant tag relations for this image
      const relatedTagIds = imageTagsData
        ?.filter(it => it.image_id === image.id)
        .map(it => it.tag_id) || [];
      // Map IDs to names using the tagMap
      const tagNames = relatedTagIds
        .map(id => tagMap.get(id))
        .filter((name): name is string => name !== undefined); // Filter out undefined/missing names

      return {
        id: image.id,
        title: image.title,
        image_url: image.image_url,
        created_at: image.created_at,
        categories: categoryNames,
        tags: tagNames,
      };
    });

    // Step 8: Return Assembled Data
    return {
      images: assembledImages,
      totalCount: totalCount ?? 0,
    };

  } catch (err) {
    console.error('Unexpected error in getAdminImages:', err);
    if (err instanceof Error) {
        // Re-throw specific database errors or a generic one
         throw new Error(err.message.startsWith('DB error') ? err.message : 'Failed to fetch admin images.');
    }
    throw new Error('An unknown error occurred while fetching admin images.');
  }
} 