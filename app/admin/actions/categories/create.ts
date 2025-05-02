'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { Constants } from '@/config/constants'; // Import constants
import { generateSlug } from '@/lib/utils'; // Assuming slugify is also in utils or import from storageUtils
import logger from '@/lib/logger'; // Import logger
import { ImageProcessingService } from '@/services/ImageProcessingService';
import { validateImageFiles } from '@/lib/validation';
import { RevalidationService } from '@/services/RevalidationService';

// Define bucket names (assuming you might use different buckets or prefixes)
// If using the same bucket, ensure filenames don't clash (slugs help here)
const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME; // e.g., 'category-thumbnails'
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;          // e.g., 'category-hero-images'

const CATEGORIES_TABLE = Constants.CATEGORIES_TABLE;

/**
 * Creates a new category with uploaded images and SEO metadata.
 */
export async function createCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const name = formData.get('categoryName')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  
  // Get SEO fields
  const seoTitle = formData.get('seoTitle')?.toString().trim() || null;
  const seoDescription = formData.get('seoDescription')?.toString().trim() || null;
  const seoMetaDescription = formData.get('seoMetaDescription')?.toString().trim() || null;
  
  // Get image files
  const thumbnailFile = formData.get('thumbnailImageFile') as File | null;
  const heroFile = formData.get('heroImageFile') as File | null;

  const log = logger.child({ action: 'createCategory', categoryNameAttempt: name });
  log.info('Attempting to create category');

  // --- Basic Validation ---
  if (!name) {
    log.warn('Validation failed: Category name is required.');
    return { success: false, message: 'Category name is required.' };
  }
  
  // --- File Validation ---
  const fileValidation = validateImageFiles([
    { file: thumbnailFile, fieldName: 'thumbnail image' },
    { file: heroFile, fieldName: 'hero image', required: true } // Making hero image required based on DB constraints
  ], log);
  
  if (!fileValidation.valid) {
    return { success: false, message: fileValidation.message || 'File validation failed' };
  }

  // Initialize image processing service
  const imageService = new ImageProcessingService({ 
    action: 'createCategory', 
    entityId: name 
  });
  
  let thumbnailPath: string | null = null;
  let heroPath: string | null = null;
  const uploadedFiles: { bucket: string; path: string }[] = [];

  try {
    // 1. Upload Thumbnail (if provided)
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbnailResult = await imageService.processAndUploadImage(thumbnailFile, {
        bucket: THUMBNAIL_BUCKET,
        upsert: false,
        webpOnly: true // Use WebP-only mode
      });
      
      if (thumbnailResult.error) {
        return { success: false, message: `Thumbnail upload failed: ${thumbnailResult.error}` };
      }
      
      thumbnailPath = thumbnailResult.webpPath;
      if (thumbnailPath) uploadedFiles.push({ bucket: THUMBNAIL_BUCKET, path: thumbnailPath });
      log.info({ path: thumbnailPath }, 'Thumbnail uploaded successfully');
    }

    // 2. Upload Hero Image (if provided)
    if (heroFile && heroFile.size > 0) {
      const heroResult = await imageService.processAndUploadImage(heroFile, {
        bucket: HERO_BUCKET,
        upsert: false,
        webpOnly: true // Use WebP-only mode
      });
      
      if (heroResult.error) {
        // Roll back thumbnail upload if it succeeded
        if (thumbnailPath) {
          await imageService.deleteImageFiles(null, thumbnailPath, THUMBNAIL_BUCKET);
        }
        return { success: false, message: `Hero image upload failed: ${heroResult.error}` };
      }
      
      heroPath = heroResult.webpPath;
      if (heroPath) uploadedFiles.push({ bucket: HERO_BUCKET, path: heroPath });
      log.info({ path: heroPath }, 'Hero image uploaded successfully');
    }

    // 3. Generate Slug
    const categorySlug = generateSlug(name);
    log.info({ slug: categorySlug }, 'Generated slug');

    // 4. Insert into Database with SEO fields
    log.info('Inserting category with SEO fields into database...');
    const { data: insertData, error: insertError } = await supabase
      .from(CATEGORIES_TABLE)
      .insert({
        name,
        slug: categorySlug,
        description,
        thumbnail_image: thumbnailPath,
        hero_image: heroPath,
        // Add SEO fields
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_meta_description: seoMetaDescription
      })
      .select('id')
      .single();

    if (insertError || !insertData) {
      // Roll back uploads
      for (const file of uploadedFiles) {
        await imageService.deleteImageFiles(null, file.path, file.bucket);
      }
      return { 
        success: false, 
        message: `Database error: ${insertError?.message || 'Failed to get ID'}` 
      };
    }
    
    log.info({ categoryId: insertData.id }, 'Category inserted successfully');

    RevalidationService.revalidateEntity('category', { 
      action: 'createCategory', 
      entityId: insertData.id 
    });
    
    return { success: true, message: 'Category created successfully.' };

  } catch (err: any) {
    log.error({ error: err }, 'Unexpected error creating category');
    
    // Roll back uploads
    for (const file of uploadedFiles) {
      await imageService.deleteImageFiles(null, file.path, file.bucket);
    }
    
    return { 
      success: false, 
      message: `Unexpected error: ${err.message || 'Unknown error'}` 
    };
  }
} 