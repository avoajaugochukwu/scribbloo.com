'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants
import Category from '@/types/category.type'; // Use your specific Category type path
// Import shared helpers
import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';
import { generateSlug } from '@/lib/utils'; // Assuming generateSlug is here

/**
 * Updates an existing category, handling optional image replacements and slug changes.
 */
export async function updateCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryId = formData.get('categoryId')?.toString();
  const categoryName = formData.get('categoryName')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const seoTitle = formData.get('seoTitle')?.toString().trim();
  const seoDescription = formData.get('seoDescription')?.toString().trim();
  const seoMetaDescription = formData.get('seoMetaDescription')?.toString().trim(); // <-- Get the new field
  // --- Get NEW Files (if provided) ---
  const newHeroImageFile = formData.get('heroImageFile') as File | null;
  const newThumbnailImageFile = formData.get('thumbnailImageFile') as File | null;
  // --- End Get Files ---

  // --- Validation ---
  if (!categoryId) return { success: false, message: 'Category ID is missing.' };
  // Add seoMetaDescription to validation if needed
  if (!categoryName || !description || !seoTitle || !seoDescription /* || !seoMetaDescription */) {
    return { success: false, message: 'Missing required text fields.' };
  }
  // Note: File inputs are optional for update
  // --- End Validation ---

  console.log(`Attempting to update category ID: ${categoryId}`);

  const heroBucket = Constants.SUPABASE_HERO_IMAGES_NAME; // <-- Use Constant
  const thumbnailBucket = Constants.SUPABASE_THUMBNAIL_IMAGES_NAME; // <-- Use Constant
  let newHeroPath: string | null = null;
  let newThumbnailPath: string | null = null;
  let oldHeroPath: string | null = null;
  let oldThumbnailPath: string | null = null;
  let oldSlug: string | null = null;

  try {
    // 1. Fetch current category data (including slug)
    console.log(`Fetching current data for category ID: ${categoryId}`);
    const { data: currentCategory, error: fetchError } = await supabase
      .from('categories')
      .select('slug, hero_image_url, thumbnail_image_url') // Select fields needed
      .eq('id', categoryId)
      .single();

    if (fetchError || !currentCategory) {
      console.error(`Error fetching category ${categoryId}:`, fetchError?.message);
      return { success: false, message: `Could not find the category (ID: ${categoryId}) to update.` };
    }
    oldHeroPath = currentCategory.hero_image_url;
    oldThumbnailPath = currentCategory.thumbnail_image_url;
    oldSlug = currentCategory.slug;
    console.log(`Current data fetched: Slug=${oldSlug}, Hero=${oldHeroPath}, Thumb=${oldThumbnailPath}`);

    // 2. Handle NEW File Uploads (if any)
    if (newHeroImageFile && newHeroImageFile.size > 0) {
      console.log('New hero image provided, attempting upload...');
      const heroUploadResult = await uploadStorageFile(heroBucket, newHeroImageFile);
      if (heroUploadResult.error || !heroUploadResult.path) {
        return { success: false, message: `New hero image upload failed: ${heroUploadResult.error}` };
      }
      newHeroPath = heroUploadResult.path;
      console.log(`New hero image uploaded: ${newHeroPath}`);
    }

    if (newThumbnailImageFile && newThumbnailImageFile.size > 0) {
      console.log('New thumbnail image provided, attempting upload...');
      const thumbnailUploadResult = await uploadStorageFile(thumbnailBucket, newThumbnailImageFile);
      if (thumbnailUploadResult.error || !thumbnailUploadResult.path) {
        // Rollback: Delete newly uploaded hero image if thumbnail fails
        if (newHeroPath) {
           console.log(`Rolling back new hero image upload: ${newHeroPath}`);
           await deleteStorageFile(heroBucket, newHeroPath);
        }
        return { success: false, message: `New thumbnail image upload failed: ${thumbnailUploadResult.error}` };
      }
      newThumbnailPath = thumbnailUploadResult.path;
      console.log(`New thumbnail image uploaded: ${newThumbnailPath}`);
    }

    // 3. Prepare data for DB update
    const updateData: Partial<Category> = {
      name: categoryName,
      description: description || null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      seo_meta_description: seoMetaDescription || null, // <-- Add the new field
    };

    // --- Handle Slug Update ---
    const newSlug = generateSlug(categoryName);
    if (newSlug && newSlug !== oldSlug) {
        console.log(`Slug changed from "${oldSlug}" to "${newSlug}". Updating slug.`);
        updateData.slug = newSlug;
    } else {
        console.log(`Slug "${oldSlug}" remains unchanged.`);
    }
    // --- End Slug Update ---


    // Only include image paths if they were successfully uploaded (i.e., are not null)
    if (newHeroPath) {
      updateData.hero_image_url = newHeroPath;
    }
    if (newThumbnailPath) {
      updateData.thumbnail_image_url = newThumbnailPath;
    }

    // 4. Update Database Record
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
      if (updateError.code === '23505') { // Unique violation
         if (updateError.message.includes('categories_name_key')) {
            return { success: false, message: `Category name "${categoryName}" already exists.` };
         }
         if (updateError.message.includes('categories_slug_key')) {
            return { success: false, message: `Generated slug "${updateData.slug}" already exists. Try a different name.` };
         }
         // Add check for seo_meta_description unique constraint if you add one
      }
      return { success: false, message: `Database update error: ${updateError.message}` };
    }

    // 5. Delete OLD images from storage (only after successful DB update AND if new image was uploaded)
    if (newHeroPath && oldHeroPath) {
        console.log(`Deleting old hero image: ${oldHeroPath}`);
        await deleteStorageFile(heroBucket, oldHeroPath);
    }
    if (newThumbnailPath && oldThumbnailPath) {
        console.log(`Deleting old thumbnail image: ${oldThumbnailPath}`);
        await deleteStorageFile(thumbnailBucket, oldThumbnailPath);
    }

    // 6. Success - Revalidate Paths
    console.log(`Category "${categoryName}" (ID: ${categoryId}) updated successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath(`/admin/categories/edit/${categoryId}`); // Revalidate the edit page itself
    revalidatePath('/admin');
    revalidatePath('/coloring-pages', 'layout'); // Revalidate public pages

    // Revalidate the specific category page if the slug changed
    if (updateData.slug && updateData.slug !== oldSlug) {
        revalidatePath(`/coloring-pages/${oldSlug}`); // Revalidate old slug path
        revalidatePath(`/coloring-pages/${updateData.slug}`); // Revalidate new slug path
    } else {
        revalidatePath(`/coloring-pages/${oldSlug}`); // Revalidate current slug path
    }


    return { success: true, message: `Category "${categoryName}" updated successfully.` };

  } catch (err: any) {
    console.error(`Unexpected error updating category ${categoryId}:`, err);
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
            .select(`
                id,
                name,
                slug,
                description,
                seo_title,
                seo_description,
                seo_meta_description,
                hero_image_url,
                thumbnail_image_url,
                created_at
            `)
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