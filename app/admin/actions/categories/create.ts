'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { Constants } from '@/config/constants'; // Import constants

// Simple slugification utility
function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars except -
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Helper function for file upload with rollback path tracking
async function uploadFile(
    bucketName: string,
    file: File,
): Promise<{ path: string | null; error: string | null }> {
    if (!file || file.size === 0) {
        return { path: null, error: 'File is empty or missing.' };
    }
    if (!file.type.startsWith('image/')) {
        return { path: null, error: 'Invalid file type. Only images are allowed.' };
    }

    console.log(`Uploading file "${file.name}" as "${file.name}" to bucket "${bucketName}"`);

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(file.name, file, {
            cacheControl: '3600',
            upsert: false, // Don't overwrite existing files with the same name
        });

    if (error) {
        console.error(`Storage upload error (${bucketName}):`, error);
        return { path: null, error: `Storage upload failed: ${error.message}` };
    }

    console.log(`File uploaded successfully to ${bucketName}:`, data.path);
    return { path: data.path, error: null }; // Return the path (filename)
}


/**
 * Creates a new category with uploaded images.
 */
export async function createCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryName = formData.get('categoryName')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const seoTitle = formData.get('seoTitle')?.toString().trim();
  const seoDescription = formData.get('seoDescription')?.toString().trim();
  // --- Get Files ---
  const heroImageFile = formData.get('heroImageFile') as File | null;
  const thumbnailImageFile = formData.get('thumbnailImageFile') as File | null;
  // --- End Get Files ---

  // --- Basic Validation ---
  if (!categoryName || !description || !seoTitle || !seoDescription) {
    return { success: false, message: 'Missing required text fields.' };
  }
  if (!heroImageFile) {
    return { success: false, message: 'Hero image file is required.' };
  }
   if (!thumbnailImageFile) {
    return { success: false, message: 'Thumbnail image file is required.' };
  }
  // --- End Basic Validation ---

  // Generate slug
  const slug = slugify(categoryName);
  if (!slug) {
    return { success: false, message: 'Category name must contain valid characters for slug.' };
  }

  let heroImagePath: string | null = null;
  let thumbnailImagePath: string | null = null;
  const heroBucket = Constants.SUPABASE_HERO_IMAGES_BUCKET;
  const thumbnailBucket = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET;

  try {
    // 1. Upload Hero Image
    const heroUploadResult = await uploadFile(heroBucket, heroImageFile);
    if (heroUploadResult.error || !heroUploadResult.path) {
      return { success: false, message: `Hero image upload failed: ${heroUploadResult.error}` };
    }
    heroImagePath = heroUploadResult.path;

    // 2. Upload Thumbnail Image
    const thumbnailUploadResult = await uploadFile(thumbnailBucket, thumbnailImageFile);
    if (thumbnailUploadResult.error || !thumbnailUploadResult.path) {
      // Rollback: Delete hero image if thumbnail upload fails
      if (heroImagePath) {
        console.log(`Rolling back hero image upload: ${heroImagePath}`);
        await supabase.storage.from(heroBucket).remove([heroImagePath]);
      }
      return { success: false, message: `Thumbnail image upload failed: ${thumbnailUploadResult.error}` };
    }
    thumbnailImagePath = thumbnailUploadResult.path;

    // 3. Insert Category Metadata into Database
    console.log(`Inserting category "${categoryName}" into database...`);
    const { error: insertError } = await supabase
      .from('categories')
      .insert([{
        name: categoryName,
        slug: slug,
        description: description,
        seo_title: seoTitle,
        seo_description: seoDescription,
        hero_image_url: heroImagePath, // Store the path/filename
        thumbnail_image_url: thumbnailImagePath, // Store the path/filename
      }])
      .select() // Keep select if needed, otherwise remove
      .single();

    if (insertError) {
      console.error('Error inserting category:', insertError.message);
      // Rollback: Delete both uploaded images if DB insert fails
      if (heroImagePath) await supabase.storage.from(heroBucket).remove([heroImagePath]);
      if (thumbnailImagePath) await supabase.storage.from(thumbnailBucket).remove([thumbnailImagePath]);
      console.log('Rolled back storage uploads due to DB error.');

      // Handle specific DB errors (like unique constraints)
      if (insertError.code === '23505') {
        if (insertError.message.includes('categories_name_key')) {
          return { success: false, message: `Category name "${categoryName}" already exists.` };
        }
        if (insertError.message.includes('categories_slug_key')) {
          return { success: false, message: `Generated slug "${slug}" already exists. Try a different name.` };
        }
      }
      return { success: false, message: `Database error: ${insertError.message}` };
    }

    // 4. Success - Revalidate Paths
    console.log(`Category "${categoryName}" created successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/categories/create');
    revalidatePath('/admin');
    revalidatePath('/admin/images/create');
    revalidatePath('/admin/images/edit', 'layout');
    revalidatePath('/coloring-pages', 'layout');

    return { success: true, message: `Category "${categoryName}" created successfully.` };

  } catch (err: any) {
    console.error('Unexpected error creating category:', err);
    // Attempt cleanup in case of unexpected errors (might leave orphans if paths not set)
    if (heroImagePath) await supabase.storage.from(heroBucket).remove([heroImagePath]).catch(e => console.error("Cleanup failed (hero):", e));
    if (thumbnailImagePath) await supabase.storage.from(thumbnailBucket).remove([thumbnailImagePath]).catch(e => console.error("Cleanup failed (thumb):", e));

    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
} 