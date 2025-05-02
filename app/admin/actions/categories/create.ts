'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants
import { processAndUploadImage, deleteStorageFile } from '@/lib/storageUtils'; // Import shared helpers
import { generateSlug } from '@/lib/utils'; // Assuming slugify is also in utils or import from storageUtils
import logger from '@/lib/logger'; // Import logger

// Define bucket names (assuming you might use different buckets or prefixes)
// If using the same bucket, ensure filenames don't clash (slugs help here)
const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME; // e.g., 'category-thumbnails'
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;          // e.g., 'category-hero-images'

/**
 * Creates a new category with uploaded images using shared helpers.
 */
export async function createCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const name = formData.get('name')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  // Expect two separate files
  const thumbnailFile = formData.get('thumbnailFile') as File | null;
  const heroFile = formData.get('heroFile') as File | null;

  const log = logger.child({ action: 'createCategory', categoryNameAttempt: name });
  log.info('Attempting to create category');

  // --- Validation ---
  if (!name) {
    log.warn('Validation failed: Category name is required.');
    return { success: false, message: 'Category name is required.' };
  }
  // Validate thumbnail file type if present
  if (thumbnailFile && thumbnailFile.size > 0 && !thumbnailFile.type.startsWith('image/')) {
    log.warn({ fileType: thumbnailFile.type }, 'Validation failed: Invalid thumbnail file type.');
    return { success: false, message: 'Invalid file type for thumbnail. Please upload an image.' };
  }
  // Validate hero file type if present
  if (heroFile && heroFile.size > 0 && !heroFile.type.startsWith('image/')) {
    log.warn({ fileType: heroFile.type }, 'Validation failed: Invalid hero file type.');
    return { success: false, message: 'Invalid file type for hero image. Please upload an image.' };
  }
  // --- End Validation ---

  const categorySlug = generateSlug(name);
  let thumbnailPath: string | null = null;
  let heroPath: string | null = null;
  const uploadedFiles: { bucket: string; path: string }[] = []; // Track uploads for rollback

  try {
    // 1. Process and Upload Thumbnail Image (if provided)
    if (thumbnailFile && thumbnailFile.size > 0) {
      log.debug('Processing thumbnail file');
      const uploadResult = await processAndUploadImage({
        bucketName: THUMBNAIL_BUCKET,
        file: thumbnailFile,
        upsert: false // Don't overwrite on create
      });
      if (uploadResult.error || !uploadResult.path) {
        log.error({ error: uploadResult.error }, 'Thumbnail processing/upload failed');
        return { success: false, message: `Thumbnail upload failed: ${uploadResult.error || 'Unknown upload error'}` };
      }
      thumbnailPath = uploadResult.path;
      uploadedFiles.push({ bucket: THUMBNAIL_BUCKET, path: thumbnailPath });
      log.info({ path: thumbnailPath }, 'Thumbnail uploaded successfully');
    }

    // 2. Process and Upload Hero Image (if provided)
    if (heroFile && heroFile.size > 0) {
      log.debug('Processing hero file');
      const uploadResult = await processAndUploadImage({
        bucketName: HERO_BUCKET,
        file: heroFile,
        upsert: false
      });
      if (uploadResult.error || !uploadResult.path) {
        log.error({ error: uploadResult.error }, 'Hero image processing/upload failed');
        await rollbackUploads(uploadedFiles); // Rollback thumbnail
        return { success: false, message: `Hero image upload failed: ${uploadResult.error || 'Unknown upload error'}` };
      }
      heroPath = uploadResult.path;
      uploadedFiles.push({ bucket: HERO_BUCKET, path: heroPath });
      log.info({ path: heroPath }, 'Hero image uploaded successfully');
    }

    // 3. Create category record in database with separate paths
    const dbPayload = {
      name: name,
      slug: categorySlug,
      description: description,
      thumbnail_image: thumbnailPath, // Save specific thumbnail path
      hero_image: heroPath,          // Save specific hero path
      // Add other fields as necessary
    };
    log.info({ payload: dbPayload }, 'Inserting category into database');
    const { error: insertError } = await supabase
      .from(Constants.CATEGORIES_TABLE)
      .insert(dbPayload);

    if (insertError) {
      log.error({ error: insertError }, 'Database insert failed');
      await rollbackUploads(uploadedFiles); // Rollback both uploads
      // Check for specific DB errors like unique constraints if needed
      if (insertError.code === '23505') { // Example: unique constraint violation
        return { success: false, message: `Category with slug "${categorySlug}" might already exist.` };
      }
      return { success: false, message: `Database error: ${insertError.message}` };
    }

    // 4. Revalidate paths
    log.info('Category created successfully, revalidating paths');
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return { success: true, message: `Category "${name}" created successfully.` };

  } catch (err: any) {
    log.error({ error: err }, 'Unexpected error during category creation');
    await rollbackUploads(uploadedFiles); // Attempt rollback
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}

// Helper function for rolling back uploads
async function rollbackUploads(files: { bucket: string; path: string }[]) {
  if (files.length === 0) return;
  const log = logger.child({ function: 'rollbackUploads' });
  log.warn(`Rolling back ${files.length} uploads...`);

  const deletionPromises = files.map(file =>
    deleteStorageFile({ bucketName: file.bucket, filePath: file.path }) // Use object param
  );

  const results = await Promise.allSettled(deletionPromises);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      // The error is already logged within deleteStorageFile, but we can add context here
      log.warn({ file: files[index], reason: (result as PromiseRejectedResult).reason }, `Failed to rollback upload`);
    } else if (result.status === 'fulfilled' && !result.value.success) {
      // Log if deleteStorageFile returned success: false but didn't throw
      log.warn({ file: files[index], error: result.value.error }, `Rollback attempt for file failed`);
    }
  });
} 