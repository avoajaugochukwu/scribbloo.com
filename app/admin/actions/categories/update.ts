'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants
import Category from '@/types/category.type'; // Use your specific Category type path
// Import shared helpers
import { uploadAndConvertToWebp, deleteStorageFile } from '@/lib/storageUtils';
import { generateSlug } from '@/lib/utils'; // Assuming slugify is also in utils or import from storageUtils

const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME;
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;

/**
 * Updates an existing category, handling optional image replacements and slug changes.
 */
export async function updateCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryId = formData.get('categoryId')?.toString();
  const name = formData.get('name')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  // Expect two separate potential new files
  const thumbnailFile = formData.get('thumbnailFile') as File | null;
  const heroFile = formData.get('heroFile') as File | null;

  // --- Validation ---
  if (!categoryId) {
    return { success: false, message: 'Category ID is missing.' };
  }
  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }
  if (thumbnailFile && thumbnailFile.size > 0 && !thumbnailFile.type.startsWith('image/')) {
    return { success: false, message: 'Invalid file type for thumbnail.' };
  }
  if (heroFile && heroFile.size > 0 && !heroFile.type.startsWith('image/')) {
    return { success: false, message: 'Invalid file type for hero image.' };
  }
  // --- End Validation ---

  let oldThumbnailPath: string | null = null;
  let oldHeroPath: string | null = null;
  let newThumbnailPath: string | null = null;
  let newHeroPath: string | null = null;
  let uploadedThumbnailPath: string | null = null; // For rollback
  let uploadedHeroPath: string | null = null;     // For rollback
  let thumbnailPathChanged = false;
  let heroPathChanged = false;
  const uploadedFilesForRollback: { bucket: string; path: string }[] = [];

  try {
    // 1. Fetch current category data (both image paths)
    console.log(`Fetching current data for category ID: ${categoryId}`);
    const { data: currentCategory, error: fetchError } = await supabase
      .from(Constants.CATEGORIES_TABLE)
      .select('name, description, thumbnail_image, hero_image')
      .eq('id', categoryId)
      .single();

    if (fetchError || !currentCategory) {
      console.error(`Error fetching category ${categoryId}:`, fetchError);
      return { success: false, message: 'Could not find the category to update.' };
    }
    oldThumbnailPath = currentCategory.thumbnail_image;
    oldHeroPath = currentCategory.hero_image;
    newThumbnailPath = oldThumbnailPath; // Initialize with old paths
    newHeroPath = oldHeroPath;
    console.log(`Old paths - Thumbnail: ${oldThumbnailPath}, Hero: ${oldHeroPath}`);

    // 2. Upload NEW Thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log(`Processing thumbnail replacement for category: ${name}`);
      const uploadResult = await uploadAndConvertToWebp(THUMBNAIL_BUCKET, thumbnailFile, true); // upsert = true
      if (uploadResult.error) {
        return { success: false, message: `Thumbnail upload failed: ${uploadResult.error}` };
      }
      uploadedThumbnailPath = uploadResult.path!;
      uploadedFilesForRollback.push({ bucket: THUMBNAIL_BUCKET, path: uploadedThumbnailPath });
      newThumbnailPath = uploadedThumbnailPath;
      thumbnailPathChanged = oldThumbnailPath !== newThumbnailPath;
      console.log(`New thumbnail uploaded: ${newThumbnailPath}. Path changed: ${thumbnailPathChanged}`);
    }

    // 3. Upload NEW Hero Image if provided
    if (heroFile && heroFile.size > 0) {
      console.log(`Processing hero image replacement for category: ${name}`);
      const uploadResult = await uploadAndConvertToWebp(HERO_BUCKET, heroFile, true); // upsert = true
      if (uploadResult.error) {
        await rollbackUploads(uploadedFilesForRollback); // Rollback thumbnail if it was uploaded
        return { success: false, message: `Hero image upload failed: ${uploadResult.error}` };
      }
      uploadedHeroPath = uploadResult.path!;
      uploadedFilesForRollback.push({ bucket: HERO_BUCKET, path: uploadedHeroPath });
      newHeroPath = uploadedHeroPath;
      heroPathChanged = oldHeroPath !== newHeroPath;
      console.log(`New hero image uploaded: ${newHeroPath}. Path changed: ${heroPathChanged}`);
    }

    // 4. Update category record in database
    const categorySlug = generateSlug(name);
    const updateData = {
      name: name,
      slug: categorySlug,
      description: description,
      thumbnail_image: newThumbnailPath, // Use potentially new thumbnail path
      hero_image: newHeroPath,          // Use potentially new hero path
      // Add other fields as necessary
    };

    // Only update if something actually changed (metadata or images)
    const hasChanges = name !== currentCategory.name ||
                       description !== currentCategory.description ||
                       thumbnailPathChanged ||
                       heroPathChanged;

    if (hasChanges) { // Optional: Check if any data actually changed before updating DB
      console.log(`Updating category ${categoryId} with data:`, updateData);
      const { error: updateError } = await supabase
        .from(Constants.CATEGORIES_TABLE)
        .update(updateData)
        .eq('id', categoryId);

      if (updateError) {
        console.error('Error updating category record:', updateError);
        await rollbackUploads(uploadedFilesForRollback); // Rollback any new uploads
        return { success: false, message: `Database update error: ${updateError.message}` };
      }
      console.log('Database record updated successfully.');
    } else {
       console.log("No changes detected in category data or images. Skipping database update.");
    }

    // 5. Delete OLD images from storage ONLY IF their paths changed
    const deletePromises = [];
    if (thumbnailPathChanged && oldThumbnailPath) {
      console.log(`Queueing deletion of old thumbnail: ${oldThumbnailPath}`);
      deletePromises.push(deleteStorageFile(THUMBNAIL_BUCKET, oldThumbnailPath));
    }
    if (heroPathChanged && oldHeroPath) {
      console.log(`Queueing deletion of old hero image: ${oldHeroPath}`);
      deletePromises.push(deleteStorageFile(HERO_BUCKET, oldHeroPath));
    }

    if (deletePromises.length > 0) {
      const results = await Promise.allSettled(deletePromises);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const pathAttempted = (index === 0 && thumbnailPathChanged && oldThumbnailPath) ? oldThumbnailPath : oldHeroPath;
          console.warn(`Failed to delete old storage file ${pathAttempted}: ${result.reason}`);
        }
      });
    }

    // 6. Revalidate paths
    console.log(`Category "${name}" (ID: ${categoryId}) processed successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath(`/admin/categories/edit/${categoryId}`);
    revalidatePath('/admin');

    return { success: true, message: `Category "${name}" updated successfully.` };

  } catch (err: any) {
    console.error(`Unexpected error updating category ${categoryId}:`, err);
    await rollbackUploads(uploadedFilesForRollback); // Attempt rollback on unexpected errors
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}

// Helper function for rolling back uploads (can be shared or duplicated)
async function rollbackUploads(files: { bucket: string; path: string }[]) {
  if (files.length === 0) return;
  console.log(`Rolling back ${files.length} uploads...`);
  const deletionPromises = files.map(file => deleteStorageFile(file.bucket, file.path));
  const results = await Promise.allSettled(deletionPromises);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`Failed to rollback upload for ${files[index].bucket}/${files[index].path}:`, result.reason);
    }
  });
}

/**
 * Fetches a single category for editing.
 */
export async function getCategoryForEdit(categoryId: string): Promise<Category | null> {
    if (!categoryId) {
        console.log("getCategoryForEdit called with no categoryId.");
        return null;
    }

    console.log(`getCategoryForEdit: Fetching category with ID: ${categoryId}`);

    try {
        const { data, error } = await supabase
            .from(Constants.CATEGORIES_TABLE)
            .select(`
                id,
                name,
                slug,
                description,
                seo_title,
                seo_description,
                seo_meta_description,
                hero_image,
                thumbnail_image,
                created_at
            `)
            .eq('id', categoryId)
            .single();

        if (error) {
            console.error(`Error fetching category ${categoryId} for edit:`, error.message);
            return null;
        }

        if (!data) {
             console.log(`getCategoryForEdit: No data found for category ID: ${categoryId}`);
             return null;
        }

        console.log(`getCategoryForEdit: Successfully fetched data for category ID: ${categoryId}`);
        return data;

    } catch (err) {
        console.error(`Unexpected error fetching category ${categoryId}:`, err);
        return null;
    }
}