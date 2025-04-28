'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { type Category } from '../categories/actions'; // Import Category type
import { type Tag } from '../tags/actions'; // Import Tag type

// Type for the data returned by getAdminImages (existing function)
export type AdminImageWithRelations = {
  id: number;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  categories: string[]; // Names of categories
  tags: string[];       // Names of tags
};

// Existing function (ensure it's here or imported)
export async function getAdminImages(page = 1, pageSize = 10): Promise<{ images: AdminImageWithRelations[], totalCount: number }> {
    // ... implementation of getAdminImages ...
    const offset = (page - 1) * pageSize;
    console.log(`Fetching images for admin page ${page}, offset ${offset}, limit ${pageSize}`);

    try {
        // Fetch total count first
        const { count, error: countError } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error fetching image count:', countError.message);
            throw new Error(`Database error fetching image count: ${countError.message}`);
        }

        // Fetch paginated images with related data
        const { data, error } = await supabase
            .from('images')
            .select(`
                id,
                title,
                image_url,
                created_at,
                image_categories (
                    categories ( id, name )
                ),
                image_tags (
                    tags ( id, name )
                )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error('Error fetching images with relations:', error.message);
            throw new Error(`Database error fetching images: ${error.message}`);
        }

        // Process data to match the desired structure
        const processedImages: AdminImageWithRelations[] = (data || []).map((img: any) => ({
            id: img.id,
            title: img.title,
            image_url: img.image_url,
            created_at: img.created_at,
            // Extract category names, handling potential nulls/empty arrays
            categories: img.image_categories?.map((ic: any) => ic.categories?.name).filter(Boolean) ?? [],
            // Extract tag names, handling potential nulls/empty arrays
            tags: img.image_tags?.map((it: any) => it.tags?.name).filter(Boolean) ?? [],
        }));

        console.log(`Fetched ${processedImages.length} images. Total count: ${count ?? 0}`);
        return { images: processedImages, totalCount: count ?? 0 };

    } catch (err) {
        console.error('Unexpected error in getAdminImages:', err);
        // Re-throw or handle as appropriate
        if (err instanceof Error) {
            throw err;
        }
        throw new Error('An unexpected error occurred while fetching admin images.');
    }
}


// --- New Actions for Create Image Page ---

/**
 * Fetches all available categories for selection.
 */
export async function getAvailableCategories(): Promise<Category[]> {
  console.log('Fetching available categories for form...');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, created_at') // id should be UUID here
      .order('name', { ascending: true });

    if (error) throw error;
    // Ensure the mapping handles string ID
    return (data || []).map(cat => ({
        id: cat.id, // Should already be a string UUID from DB
        name: cat.name,
        created_at: cat.created_at
    })) as Category[]; // Make sure Category type expects id: string
  } catch (error: any) {
    console.error('Error fetching available categories:', error.message);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

/**
 * Fetches all available tags for selection.
 */
export async function getAvailableTags(): Promise<Tag[]> {
  console.log('Fetching available tags for form...');
   try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, created_at') // id should be UUID here
      .order('name', { ascending: true });

    if (error) throw error;
     // Ensure the mapping handles string ID
    return (data || []).map(tag => ({
        id: tag.id, // Should already be a string UUID from DB
        name: tag.name,
        created_at: tag.created_at
    })) as Tag[]; // Make sure Tag type expects id: string
  } catch (error: any) {
     console.error('Error fetching available tags:', error.message);
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }
}


/**
 * Creates a new image record, uploads the file, and links categories/tags.
 */
export async function createImage(formData: FormData): Promise<{ success: boolean; message: string; imageId?: string }> {
  console.log('formData', formData);
  const title = formData.get('title')?.toString().trim() || null;
  const imageFile = formData.get('imageFile') as File | null;
  const categoryIds = formData.getAll('categoryIds').map(id => id.toString());
  const tagIds = formData.getAll('tagIds').map(id => id.toString());

  if (!imageFile || imageFile.size === 0) {
    return { success: false, message: 'Image file is required.' };
  }

  // Basic validation (add more as needed: file type, size limit)
  if (!imageFile.type.startsWith('image/')) {
      return { success: false, message: 'Invalid file type. Please upload an image.' };
  }

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'images'; // Ensure bucket name is configured
  if (!bucketName) {
      console.error('Supabase bucket name is not configured in environment variables.');
      return { success: false, message: 'Server configuration error: Bucket name missing.' };
  }

  // Generate a unique file path (e.g., using timestamp and original name)
  const filePath = `${Date.now()}-${imageFile.name}`; // Sanitize name

  console.log(`Attempting to upload image to bucket: ${bucketName}, path: ${filePath}`);

  try {
    // 1. Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image to storage:', uploadError);
      return { success: false, message: `Storage upload failed: ${uploadError.message}` };
    }
    console.log('Image uploaded successfully:', uploadData);

    // The `uploadData.path` contains the path within the bucket (e.g., 'public/1678886400000-my_image.jpg')
    const imageUrl = uploadData.path; // Store this path in the database

    // 2. Insert image metadata into the 'images' table
    const { data: imageData, error: imageInsertError } = await supabase
      .from('images')
      .insert([{ title: title, image_url: imageUrl }]) // Store the path, not the full URL initially
      .select('id') // Select the ID (UUID) of the newly created image
      .single();

    if (imageInsertError) {
      console.error('Error inserting image metadata:', imageInsertError);
      // Attempt to delete the uploaded file if DB insert fails
      await supabase.storage.from(bucketName).remove([filePath]);
      console.log(`Rolled back storage upload for path: ${filePath}`);
      return { success: false, message: `Database insert failed: ${imageInsertError.message}` };
    }

    const newImageId = imageData.id;
    console.log(`Image metadata inserted successfully. New Image ID: ${newImageId}`);
    console.log(`Type of newImageId: ${typeof newImageId}`);

    // 3. Link categories (if any selected)
    if (categoryIds.length > 0) {
      console.log('Category IDs (UUIDs) to link:', categoryIds);
      const imageCategoryLinks = categoryIds.map(categoryId => ({
        image_id: newImageId,
        category_id: categoryId,
      }));
      console.log('Data being sent to image_categories insert:', imageCategoryLinks);
      const { error: categoryLinkError } = await supabase
        .from('image_categories') // Your join table name
        .insert(imageCategoryLinks);

      if (categoryLinkError) {
        console.error('Error linking categories:', categoryLinkError);
        // Consider more robust rollback (delete image record, delete file)
        return { success: false, message: `Failed to link categories: ${categoryLinkError.message}` };
      }
      console.log(`Linked ${categoryIds.length} categories to image ID ${newImageId}`);
    }

    // 4. Link tags (if any selected)
    if (tagIds.length > 0) {
      console.log('Tag IDs (UUIDs) to link:', tagIds);
      const imageTagLinks = tagIds.map(tagId => ({
        image_id: newImageId,
        tag_id: tagId,
      }));
       console.log('Data being sent to image_tags insert:', imageTagLinks);
      const { error: tagLinkError } = await supabase
        .from('image_tags') // Your join table name
        .insert(imageTagLinks);

      if (tagLinkError) {
        console.error('Error linking tags:', tagLinkError);
         // Consider more robust rollback
        return { success: false, message: `Failed to link tags: ${tagLinkError.message}` };
      }
       console.log(`Linked ${tagIds.length} tags to image ID ${newImageId}`);
    }

    // 5. Revalidate paths
    revalidatePath('/admin'); // Revalidate the main admin image list
    revalidatePath('/admin/images/create'); // Revalidate this page? Maybe not needed.
    // Potentially revalidate public gallery pages if applicable

    return { success: true, message: 'Image created successfully!', imageId: newImageId };

  } catch (err: any) {
    console.error('Unexpected error during image creation:', err);
    return { success: false, message: `An unexpected error occurred: ${err.message}` };
  }
} 