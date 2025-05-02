'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants
import Category from '@/types/category.type'; // Use your specific Category type path
// Import the new specific functions
import {
    generateStoragePath,
    convertImageToWebpBuffer,
    uploadBufferToStorage,
    deleteStorageFile
} from '@/lib/storageUtils';
import { generateSlug } from '@/lib/utils'; // Assuming slugify is also in utils or import from storageUtils
import logger from '@/lib/logger'; // Import logger

const CATEGORIES_TABLE = Constants.CATEGORIES_TABLE;
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
  const log = logger.child({ action: 'updateCategory', categoryId }); // Add logger context

  try {
    // 1. Fetch current category data (both image paths AND slug)
    log.info(`Fetching current data`);
    const { data: currentCategory, error: fetchError } = await supabase
      .from(CATEGORIES_TABLE)
      .select('name, slug, description, thumbnail_image, hero_image')
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
    log.info({ oldThumbnail: oldThumbnailPath, oldHero: oldHeroPath }, 'Old paths fetched');

    // 2. Upload NEW Thumbnail if provided
    if (thumbnailFile && thumbnailFile.size > 0) {
      log.debug(`Processing thumbnail replacement`);
      // 2a. Generate WebP path
      const { storagePath: thumbWebpPath } = generateStoragePath({ originalFileName: thumbnailFile.name, asWebp: true });
      log.info({ path: thumbWebpPath }, 'Generated thumbnail WebP path');

      // 2b. Convert to WebP buffer
      const thumbBuffer = await thumbnailFile.arrayBuffer();
      const thumbConversionResult = await convertImageToWebpBuffer({ fileBuffer: thumbBuffer });
      if (thumbConversionResult.error || !thumbConversionResult.webpBuffer) {
        log.error({ error: thumbConversionResult.error }, 'Thumbnail WebP conversion failed');
        return { success: false, message: `Thumbnail update failed: ${thumbConversionResult.error || 'Conversion error'}` };
      }
      log.info('Thumbnail converted to WebP buffer');

      // 2c. Upload WebP buffer (upsert=true)
      const thumbUploadResult = await uploadBufferToStorage({
        bucketName: THUMBNAIL_BUCKET,
        storagePath: thumbWebpPath,
        buffer: thumbConversionResult.webpBuffer,
        contentType: 'image/webp',
        upsert: true
      });
      if (thumbUploadResult.error || !thumbUploadResult.path) {
        log.error({ error: thumbUploadResult.error }, 'Thumbnail WebP upload failed');
        // No rollback needed yet as this is the first potential upload
        return { success: false, message: `Thumbnail update failed: ${thumbUploadResult.error || 'Upload error'}` };
      }
      uploadedThumbnailPath = thumbUploadResult.path; // Store the actual path returned/used
      uploadedFilesForRollback.push({ bucket: THUMBNAIL_BUCKET, path: uploadedThumbnailPath });
      newThumbnailPath = uploadedThumbnailPath;
      thumbnailPathChanged = oldThumbnailPath !== newThumbnailPath;
      log.info({ path: newThumbnailPath, changed: thumbnailPathChanged }, 'New thumbnail processed');
    }

    // 3. Upload NEW Hero Image if provided
    if (heroFile && heroFile.size > 0) {
      log.debug(`Processing hero image replacement`);
      // 3a. Generate WebP path
      const { storagePath: heroWebpPath } = generateStoragePath({ originalFileName: heroFile.name, asWebp: true });
      log.info({ path: heroWebpPath }, 'Generated hero WebP path');

      // 3b. Convert to WebP buffer
      const heroBuffer = await heroFile.arrayBuffer();
      const heroConversionResult = await convertImageToWebpBuffer({ fileBuffer: heroBuffer });
      if (heroConversionResult.error || !heroConversionResult.webpBuffer) {
        log.error({ error: heroConversionResult.error }, 'Hero WebP conversion failed');
        await rollbackUploads(uploadedFilesForRollback); // Rollback thumbnail if uploaded
        return { success: false, message: `Hero image update failed: ${heroConversionResult.error || 'Conversion error'}` };
      }
      log.info('Hero converted to WebP buffer');

      // 3c. Upload WebP buffer (upsert=true)
      const heroUploadResult = await uploadBufferToStorage({
        bucketName: HERO_BUCKET,
        storagePath: heroWebpPath,
        buffer: heroConversionResult.webpBuffer,
        contentType: 'image/webp',
        upsert: true
      });
      if (heroUploadResult.error || !heroUploadResult.path) {
        log.error({ error: heroUploadResult.error }, 'Hero WebP upload failed');
        await rollbackUploads(uploadedFilesForRollback); // Rollback thumbnail if uploaded
        return { success: false, message: `Hero image update failed: ${heroUploadResult.error || 'Upload error'}` };
      }
      uploadedHeroPath = heroUploadResult.path;
      uploadedFilesForRollback.push({ bucket: HERO_BUCKET, path: uploadedHeroPath });
      newHeroPath = uploadedHeroPath;
      heroPathChanged = oldHeroPath !== newHeroPath;
      log.info({ path: newHeroPath, changed: heroPathChanged }, 'New hero image processed');
    }

    // 4. Generate Slug (if name changed)
    let newSlug = currentCategory.slug; // Assume slug doesn't change initially
    if (name && name !== currentCategory.name) {
      log.info('Name changed, generating new slug');
      newSlug = generateSlug(name);
    }

    // 5. Prepare DB Update Payload
    const updatePayload: Partial<Category> = {};
    let needsDbUpdate = false;

    if (name && name !== currentCategory.name) {
      updatePayload.name = name;
      updatePayload.slug = newSlug; // Update slug if name changed
      needsDbUpdate = true;
    }
    if (description && description !== currentCategory.description) {
      updatePayload.description = description;
      needsDbUpdate = true;
    }
    if (thumbnailPathChanged && newThumbnailPath) { // Check path is not null
      updatePayload.thumbnail_image = newThumbnailPath;
      needsDbUpdate = true;
    }
    if (heroPathChanged && newHeroPath) { // Check path is not null
      updatePayload.hero_image = newHeroPath;
      needsDbUpdate = true;
    }

    // 6. Update Database if necessary
    if (needsDbUpdate) {
      log.info({ payload: updatePayload }, 'Updating category record in database');
      const { error: updateError } = await supabase
        .from(CATEGORIES_TABLE)
        .update(updatePayload)
        .eq('id', categoryId);

      if (updateError) {
        log.error({ error: updateError }, 'Database update failed');
        await rollbackUploads(uploadedFilesForRollback); // Rollback any new uploads
        return { success: false, message: `Database update failed: ${updateError.message}` };
      }
      log.info('Database record updated successfully.');
    } else {
      log.info('No changes detected for database update.');
    }

    // 7. Delete OLD files AFTER successful DB update
    const deleteOldPromises = [];
    if (thumbnailPathChanged && oldThumbnailPath) {
      log.info(`Queueing deletion of old thumbnail: ${oldThumbnailPath}`);
      deleteOldPromises.push(deleteStorageFile({ bucketName: THUMBNAIL_BUCKET, filePath: oldThumbnailPath }));
    }
    if (heroPathChanged && oldHeroPath) {
      log.info(`Queueing deletion of old hero image: ${oldHeroPath}`);
      deleteOldPromises.push(deleteStorageFile({ bucketName: HERO_BUCKET, filePath: oldHeroPath }));
    }

    if (deleteOldPromises.length > 0) {
      log.info(`Attempting deletion of ${deleteOldPromises.length} old storage file(s)...`);
      await Promise.allSettled(deleteOldPromises);
      // deleteStorageFile logs results internally
    }

    // 8. Revalidate Paths
    log.info('Revalidating paths...');
    revalidatePath('/admin/categories', 'layout');
    revalidatePath('/admin');
    if (newSlug) {
      revalidatePath(`/coloring-pages/${newSlug}`); // Revalidate specific category page if slug exists
    }
    revalidatePath('/coloring-pages', 'layout'); // Revalidate main listing

    return { success: true, message: 'Category updated successfully.' };

  } catch (err: any) {
    log.error({ error: err }, 'Unexpected error updating category');
    await rollbackUploads(uploadedFilesForRollback); // Attempt cleanup on unexpected error
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}

// Helper function for rolling back uploads (keep as is, uses deleteStorageFile)
async function rollbackUploads(files: { bucket: string; path: string }[]) {
  if (files.length === 0) return;
  const log = logger.child({ function: 'rollbackUploads', context: 'updateCategory' });
  log.warn(`Rolling back ${files.length} uploads...`);

  const deletionPromises = files.map(file =>
      deleteStorageFile({ bucketName: file.bucket, filePath: file.path })
  );
  const results = await Promise.allSettled(deletionPromises);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      log.warn({ path: `${files[index].bucket}/${files[index].path}`, reason: result.reason }, `Failed to rollback upload`);
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