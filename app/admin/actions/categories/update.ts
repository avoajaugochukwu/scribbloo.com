'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import Category from '@/types/category.type';
// Import shared helpers
import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';

/**
 * Updates an existing category, handling optional image replacements.
 */
export async function updateCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryId = formData.get('categoryId')?.toString();
  const categoryName = formData.get('categoryName')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const seoTitle = formData.get('seoTitle')?.toString().trim();
  const seoDescription = formData.get('seoDescription')?.toString().trim();
  // --- Get NEW Files (if provided) ---
  const newHeroImageFile = formData.get('heroImageFile') as File | null;
  const newThumbnailImageFile = formData.get('thumbnailImageFile') as File | null;
  // --- End Get Files ---

  // --- Validation ---
  if (!categoryId) return { success: false, message: 'Category ID is missing.' };
  if (!categoryName || !description || !seoTitle || !seoDescription) {
    return { success: false, message: 'Missing required text fields.' };
  }
  // Note: File inputs are optional for update
  // --- End Validation ---

  console.log(`Attempting to update category ID: ${categoryId}`);

  const heroBucket = 'hero-images';
  const thumbnailBucket = 'thumbnail-images';
  let newHeroPath: string | null = null;
  let newThumbnailPath: string | null = null;
  let oldHeroPath: string | null = null;
  let oldThumbnailPath: string | null = null;

  try {
    // 1. Fetch current category data to get old image paths
    const { data: currentCategory, error: fetchError } = await supabase
      .from('categories')
      .select('hero_image_url, thumbnail_image_url, slug') // Select slug for filename prefix
      .eq('id', categoryId)
      .single();

    if (fetchError || !currentCategory) {
      console.error(`Error fetching current category ${categoryId}:`, fetchError);
      return { success: false, message: 'Could not find the category to update.' };
    }
    oldHeroPath = currentCategory.hero_image_url;
    oldThumbnailPath = currentCategory.thumbnail_image_url;

    // 2. Upload NEW Hero Image (if provided)
    if (newHeroImageFile && newHeroImageFile.size > 0) {
      const heroUploadResult = await uploadStorageFile(heroBucket, newHeroImageFile);
      if (heroUploadResult.error || !heroUploadResult.path) {
        return { success: false, message: `New hero image upload failed: ${heroUploadResult.error}` };
      }
      newHeroPath = heroUploadResult.path; // Store path for DB update
    }

    // 3. Upload NEW Thumbnail Image (if provided)
    if (newThumbnailImageFile && newThumbnailImageFile.size > 0) {
      const thumbUploadResult = await uploadStorageFile(thumbnailBucket, newThumbnailImageFile);
      if (thumbUploadResult.error || !thumbUploadResult.path) {
        // Rollback: Delete newly uploaded hero image if thumbnail fails
        if (newHeroPath) await deleteStorageFile(heroBucket, newHeroPath);
        return { success: false, message: `New thumbnail image upload failed: ${thumbUploadResult.error}` };
      }
      newThumbnailPath = thumbUploadResult.path; // Store path for DB update
    }

    // 4. Prepare data for DB update
    const updateData: Partial<Category> = {
      name: categoryName,
      description: description,
      seo_title: seoTitle,
      seo_description: seoDescription,
      // Only include image paths if they were successfully uploaded
      ...(newHeroPath && { hero_image_url: newHeroPath }),
      ...(newThumbnailPath && { thumbnail_image_url: newThumbnailPath }),
    };

    // 5. Update Database Record
    console.log('Updating category record in database...');
    const { error: updateError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId);

    if (updateError) {
      console.error('Error updating category record:', updateError.message);
      // Rollback: Delete NEWLY uploaded files if DB update fails
      if (newHeroPath) await deleteStorageFile(heroBucket, newHeroPath);
      if (newThumbnailPath) await deleteStorageFile(thumbnailBucket, newThumbnailPath);
      console.log('Rolled back NEW storage uploads due to DB update error.');

      // Handle specific DB errors
      if (updateError.code === '23505' && updateError.message.includes('categories_name_key')) {
        return { success: false, message: `Category name "${categoryName}" already exists.` };
      }
      return { success: false, message: `Database update error: ${updateError.message}` };
    }

    // 6. Delete OLD images from storage (only after successful DB update)
    if (newHeroPath && oldHeroPath) {
        await deleteStorageFile(heroBucket, oldHeroPath);
    }
    if (newThumbnailPath && oldThumbnailPath) {
        await deleteStorageFile(thumbnailBucket, oldThumbnailPath);
    }

    // 7. Success - Revalidate Paths
    console.log(`Category "${categoryName}" (ID: ${categoryId}) updated successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath(`/admin/categories/edit/${categoryId}`);
    revalidatePath('/admin');
    revalidatePath('/admin/images/create');
    revalidatePath('/admin/images/edit', 'layout');
    revalidatePath('/coloring-pages', 'layout');

    return { success: true, message: `Category "${categoryName}" updated successfully.` };

  } catch (err: any) {
    console.error('Unexpected error updating category:', err);
     // Attempt cleanup of NEW files in case of unexpected errors
    if (newHeroPath) await deleteStorageFile(heroBucket, newHeroPath).catch(e => console.error("Cleanup failed (hero):", e));
    if (newThumbnailPath) await deleteStorageFile(thumbnailBucket, newThumbnailPath).catch(e => console.error("Cleanup failed (thumb):", e));

    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}

/**
 * Fetches a single category for editing.
 */
export async function getCategoryForEdit(categoryId: string): Promise<Category | null> {
    if (!categoryId) return null;

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();

        if (error) {
            console.error(`Error fetching category ${categoryId} for edit:`, error);
            return null;
        }
        return data;
    } catch (err) {
        console.error(`Unexpected error fetching category ${categoryId}:`, err);
        return null;
    }
}