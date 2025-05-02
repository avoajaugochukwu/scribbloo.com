'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants
import { uploadAndConvertToWebp, deleteStorageFile } from '@/lib/storageUtils'; // Import shared helpers
import { generateSlug } from '@/lib/utils'; // Assuming slugify is also in utils or import from storageUtils

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

  // --- Validation ---
  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }
  // Validate thumbnail file type if present
  if (thumbnailFile && thumbnailFile.size > 0 && !thumbnailFile.type.startsWith('image/')) {
    return { success: false, message: 'Invalid file type for thumbnail. Please upload an image.' };
  }
  // Validate hero file type if present
  if (heroFile && heroFile.size > 0 && !heroFile.type.startsWith('image/')) {
    return { success: false, message: 'Invalid file type for hero image. Please upload an image.' };
  }
  // --- End Validation ---

  const categorySlug = generateSlug(name);
  let thumbnailPath: string | null = null;
  let heroPath: string | null = null;
  const uploadedFiles: { bucket: string; path: string }[] = []; // Track uploads for rollback

  try {
    // 1. Upload Thumbnail Image (if provided)
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log(`Processing thumbnail upload for new category: ${name}`);
      const uploadResult = await uploadAndConvertToWebp(
        THUMBNAIL_BUCKET,
        thumbnailFile,
        false // upsert = false for create
      );
      if (uploadResult.error) {
        return { success: false, message: `Thumbnail upload failed: ${uploadResult.error}` };
      }
      thumbnailPath = uploadResult.path!;
      uploadedFiles.push({ bucket: THUMBNAIL_BUCKET, path: thumbnailPath });
      console.log(`Thumbnail uploaded successfully, path: ${thumbnailPath}`);
    }

    // 2. Upload Hero Image (if provided)
    if (heroFile && heroFile.size > 0) {
      console.log(`Processing hero image upload for new category: ${name}`);
      const uploadResult = await uploadAndConvertToWebp(
        HERO_BUCKET,
        heroFile,
        false // upsert = false for create
      );
      if (uploadResult.error) {
        // Rollback thumbnail if it was uploaded
        await rollbackUploads(uploadedFiles);
        return { success: false, message: `Hero image upload failed: ${uploadResult.error}` };
      }
      heroPath = uploadResult.path!;
      uploadedFiles.push({ bucket: HERO_BUCKET, path: heroPath });
      console.log(`Hero image uploaded successfully, path: ${heroPath}`);
    }

    // 3. Create category record in database with separate paths
    console.log(`Creating category "${name}" with Thumbnail: ${thumbnailPath}, Hero: ${heroPath}`);
    const { error: insertError } = await supabase
      .from(Constants.CATEGORIES_TABLE)
      .insert({
        name: name,
        slug: categorySlug,
        description: description,
        thumbnail_image: thumbnailPath, // Save specific thumbnail path
        hero_image: heroPath,          // Save specific hero path
        // Add other fields as necessary
      });

    if (insertError) {
      console.error('Error inserting category:', insertError);
      // Rollback both uploads if they happened
      await rollbackUploads(uploadedFiles);
      return { success: false, message: `Database error: ${insertError.message}` };
    }

    // 4. Revalidate paths
    console.log(`Category "${name}" created successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return { success: true, message: `Category "${name}" created successfully.` };

  } catch (err: any) {
    console.error('Unexpected error creating category:', err);
    // Attempt rollback for any files uploaded before the error
    await rollbackUploads(uploadedFiles);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}

// Helper function for rolling back uploads
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