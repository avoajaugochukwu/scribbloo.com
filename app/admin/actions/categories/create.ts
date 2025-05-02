'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants
import {
    generateStoragePath,
    convertImageToWebpBuffer,
    uploadBufferToStorage,
    deleteStorageFile
} from '@/lib/storageUtils'; // Import shared helpers
import { generateSlug } from '@/lib/utils'; // Assuming slugify is also in utils or import from storageUtils
import logger from '@/lib/logger'; // Import logger

// Define bucket names (assuming you might use different buckets or prefixes)
// If using the same bucket, ensure filenames don't clash (slugs help here)
const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME; // e.g., 'category-thumbnails'
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;          // e.g., 'category-hero-images'

const CATEGORIES_TABLE = Constants.CATEGORIES_TABLE;

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

  let thumbnailPath: string | null = null;
  let heroPath: string | null = null;
  const uploadedFiles: { bucket: string; path: string }[] = []; // Track uploads for rollback

  // --- Rollback Function ---
  const performRollback = async (step: string, errorDetails: any) => {
    log.error({ step, error: errorDetails }, `Error during ${step}, performing rollback.`);
    if (uploadedFiles.length > 0) {
      log.warn({ count: uploadedFiles.length }, 'Attempting storage file rollback');
      const deletePromises = uploadedFiles.map(file =>
        deleteStorageFile({ bucketName: file.bucket, filePath: file.path })
      );
      await Promise.allSettled(deletePromises);
    }
    const message = errorDetails instanceof Error ? errorDetails.message : String(errorDetails);
    return { success: false, message: `Failed during ${step}: ${message}` };
  };
  // --- End Rollback Function ---

  try {
    // 1. Upload Thumbnail (if provided)
    if (thumbnailFile && thumbnailFile.size > 0) {
      log.debug('Processing thumbnail');
      // 1a. Generate Path
      const { storagePath: thumbWebpPath } = generateStoragePath({ originalFileName: thumbnailFile.name, asWebp: true });
      log.info({ path: thumbWebpPath }, 'Generated thumbnail WebP path');
      // 1b. Convert
      const thumbBuffer = await thumbnailFile.arrayBuffer();
      const thumbConversionResult = await convertImageToWebpBuffer({ fileBuffer: thumbBuffer });
      if (thumbConversionResult.error || !thumbConversionResult.webpBuffer) {
        return await performRollback('Thumbnail Conversion', thumbConversionResult.error || 'Conversion failed');
      }
      log.info('Thumbnail converted to WebP buffer');
      // 1c. Upload (upsert=false for create)
      const thumbUploadResult = await uploadBufferToStorage({
        bucketName: THUMBNAIL_BUCKET,
        storagePath: thumbWebpPath,
        buffer: thumbConversionResult.webpBuffer,
        contentType: 'image/webp',
        upsert: false
      });
      if (thumbUploadResult.error || !thumbUploadResult.path) {
        return await performRollback('Thumbnail Upload', thumbUploadResult.error || 'Upload error');
      }
      thumbnailPath = thumbUploadResult.path;
      uploadedFiles.push({ bucket: THUMBNAIL_BUCKET, path: thumbnailPath });
      log.info({ path: thumbnailPath }, 'Thumbnail uploaded successfully');
    }

    // 2. Upload Hero Image (if provided)
    if (heroFile && heroFile.size > 0) {
      log.debug('Processing hero image');
      // 2a. Generate Path
      const { storagePath: heroWebpPath } = generateStoragePath({ originalFileName: heroFile.name, asWebp: true });
      log.info({ path: heroWebpPath }, 'Generated hero WebP path');
      // 2b. Convert
      const heroBuffer = await heroFile.arrayBuffer();
      const heroConversionResult = await convertImageToWebpBuffer({ fileBuffer: heroBuffer });
      if (heroConversionResult.error || !heroConversionResult.webpBuffer) {
        return await performRollback('Hero Conversion', heroConversionResult.error || 'Conversion failed');
      }
      log.info('Hero converted to WebP buffer');
      // 2c. Upload (upsert=false for create)
      const heroUploadResult = await uploadBufferToStorage({
        bucketName: HERO_BUCKET,
        storagePath: heroWebpPath,
        buffer: heroConversionResult.webpBuffer,
        contentType: 'image/webp',
        upsert: false
      });
      if (heroUploadResult.error || !heroUploadResult.path) {
        return await performRollback('Hero Upload', heroUploadResult.error || 'Upload error');
      }
      heroPath = heroUploadResult.path;
      uploadedFiles.push({ bucket: HERO_BUCKET, path: heroPath });
      log.info({ path: heroPath }, 'Hero image uploaded successfully');
    }

    // 3. Generate Slug
    const categorySlug = generateSlug(name);
    log.info({ slug: categorySlug }, 'Generated slug');

    // 4. Insert into Database
    log.info('Inserting category into database...');
    const { data: insertData, error: insertError } = await supabase
      .from(CATEGORIES_TABLE)
      .insert({
        name,
        slug: categorySlug,
        description,
        thumbnail_image: thumbnailPath, // Use the path from upload step
        hero_image: heroPath,         // Use the path from upload step
        // Add other fields like seo_title etc. if needed, ensure they are handled in the form
      })
      .select('id') // Select the ID of the newly created record
      .single();

    if (insertError || !insertData) {
      return await performRollback('Database Insert', insertError || 'Failed to get ID');
    }
    log.info({ categoryId: insertData.id }, 'Category inserted successfully');

    // 5. Revalidate Paths
    log.info('Revalidating paths...');
    revalidatePath('/admin/categories', 'layout');
    revalidatePath('/admin');
    revalidatePath('/coloring-pages', 'layout');

    return { success: true, message: 'Category created successfully.' };

  } catch (err: any) {
    log.error({ error: err }, 'Unexpected error creating category');
    return await performRollback('Unexpected Error', err);
  }
} 