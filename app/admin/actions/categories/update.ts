'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { Constants } from '@/config/constants';
import { generateSlug } from '@/lib/utils';
import logger from '@/lib/logger';
import { ImageProcessingService } from '@/services/ImageProcessingService';
import { validateImageFiles } from '@/lib/validation';
import { RevalidationService } from '@/services/RevalidationService';
import Category from '@/types/category.type';

// Define bucket names
const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME;
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;
const CATEGORIES_TABLE = Constants.CATEGORIES_TABLE;

/**
 * Updates an existing category with images and SEO metadata.
 */
export async function updateCategory(
  categoryId: string,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  // Extract form data
  const name = formData.get('categoryName')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  
  // Get SEO fields
  const seoTitle = formData.get('seoTitle')?.toString().trim() || null;
  const seoDescription = formData.get('seoDescription')?.toString().trim() || null;
  const seoMetaDescription = formData.get('seoMetaDescription')?.toString().trim() || null;
  
  // Get image files and retention flags
  const thumbnailFile = formData.get('thumbnailFile') as File | null;
  const heroFile = formData.get('heroFile') as File | null;
  const keepThumbnail = formData.get('keepThumbnail') === 'true';
  const keepHero = formData.get('keepHero') === 'true';

  const log = logger.child({ action: 'updateCategory', categoryId, nameAttempt: name });
  log.info('Attempting to update category');

  // --- Basic Validation ---
  if (!categoryId) {
    log.warn('Validation failed: Category ID is required.');
    return { success: false, message: 'Category ID is required.' };
  }
  
  if (!name) {
    log.warn('Validation failed: Category name is required.');
    return { success: false, message: 'Category name is required.' };
  }
  
  // --- File Validation ---
  const fileValidation = validateImageFiles([
    { file: thumbnailFile, fieldName: 'thumbnail image' },
    { file: heroFile, fieldName: 'hero image' }
  ], log);
  
  if (!fileValidation.valid) {
    return { success: false, message: fileValidation.message || 'File validation failed' };
  }

  // --- Fetch Current Category Data ---
  const { data: currentCategory, error: fetchError } = await supabase
    .from(CATEGORIES_TABLE)
    .select('thumbnail_image, hero_image, slug')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    log.error({ error: fetchError }, 'Error fetching category');
    return { success: false, message: `Failed to fetch current category: ${fetchError.message}` };
  }

  // Initialize image service
  const imageService = new ImageProcessingService({ 
    action: 'updateCategory', 
    entityId: categoryId 
  });
  
  let thumbnailPath: string | null = currentCategory.thumbnail_image;
  let heroPath: string | null = currentCategory.hero_image;
  const newUploadedFiles: { bucket: string; path: string }[] = [];

  try {
    // 1. Handle Thumbnail Image
    if (thumbnailFile && thumbnailFile.size > 0) {
      // Upload new thumbnail
      const thumbnailResult = await imageService.processAndUploadImage(thumbnailFile, {
        bucket: THUMBNAIL_BUCKET,
        upsert: false,
        webpOnly: true
      });
      
      if (thumbnailResult.error) {
        return { success: false, message: `Thumbnail upload failed: ${thumbnailResult.error}` };
      }
      
      // Store new path and mark old one for deletion
      const oldThumbnailPath = thumbnailPath;
      thumbnailPath = thumbnailResult.webpPath;
      
      if (thumbnailPath) {
        newUploadedFiles.push({ bucket: THUMBNAIL_BUCKET, path: thumbnailPath });
        log.info({ path: thumbnailPath }, 'New thumbnail uploaded successfully');
      }
      
      // Delete old thumbnail if we had one and if we're not keeping it
      if (oldThumbnailPath && oldThumbnailPath !== thumbnailPath && !keepThumbnail) {
        await imageService.deleteImageFiles(null, oldThumbnailPath, THUMBNAIL_BUCKET);
        log.info({ path: oldThumbnailPath }, 'Old thumbnail deleted');
      }
    } else if (!keepThumbnail) {
      // If no new thumbnail and not keeping existing, set to null
      if (thumbnailPath) {
        await imageService.deleteImageFiles(null, thumbnailPath, THUMBNAIL_BUCKET);
        log.info({ path: thumbnailPath }, 'Thumbnail deleted without replacement');
      }
      thumbnailPath = null;
    }

    // 2. Handle Hero Image
    if (heroFile && heroFile.size > 0) {
      // Upload new hero image
      const heroResult = await imageService.processAndUploadImage(heroFile, {
        bucket: HERO_BUCKET,
        upsert: false,
        webpOnly: true
      });
      
      if (heroResult.error) {
        // Roll back any new uploads
        for (const file of newUploadedFiles) {
          await imageService.deleteImageFiles(null, file.path, file.bucket);
        }
        return { success: false, message: `Hero image upload failed: ${heroResult.error}` };
      }
      
      // Store new path and mark old one for deletion
      const oldHeroPath = heroPath;
      heroPath = heroResult.webpPath;
      
      if (heroPath) {
        newUploadedFiles.push({ bucket: HERO_BUCKET, path: heroPath });
        log.info({ path: heroPath }, 'New hero image uploaded successfully');
      }
      
      // Delete old hero if we had one and if we're not keeping it
      if (oldHeroPath && oldHeroPath !== heroPath && !keepHero) {
        await imageService.deleteImageFiles(null, oldHeroPath, HERO_BUCKET);
        log.info({ path: oldHeroPath }, 'Old hero image deleted');
      }
    } else if (!keepHero && heroPath) {
      // Don't allow hero image to be null if a replacement isn't provided
      return { 
        success: false, 
        message: 'Hero image is required. Please upload a hero image.' 
      };
    }

    // 3. Generate slug (if name changed)
    let categorySlug = currentCategory.slug;
    if (!categorySlug || (name && name.toLowerCase() !== categorySlug.toLowerCase())) {
      categorySlug = generateSlug(name);
      log.info({ slug: categorySlug }, 'Generated new slug based on updated name');
    }

    // 4. Update Category in Database
    log.info('Updating category in database...');
    const { error: updateError } = await supabase
      .from(CATEGORIES_TABLE)
      .update({
        name,
        slug: categorySlug,
        description,
        thumbnail_image: thumbnailPath,
        hero_image: heroPath,
        // SEO fields
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_meta_description: seoMetaDescription
      })
      .eq('id', categoryId);

    if (updateError) {
      // Roll back new uploads
      for (const file of newUploadedFiles) {
        await imageService.deleteImageFiles(null, file.path, file.bucket);
      }
      
      return { 
        success: false, 
        message: `Database error: ${updateError.message}` 
      };
    }
    
    log.info('Category updated successfully');

    // 5. Revalidate paths
    RevalidationService.revalidateEntity('category', { 
      action: 'updateCategory', 
      entityId: categoryId 
    });
    
    return { success: true, message: 'Category updated successfully.' };

  } catch (err: any) {
    log.error({ error: err }, 'Unexpected error updating category');
    
    // Roll back new uploads
    for (const file of newUploadedFiles) {
      await imageService.deleteImageFiles(null, file.path, file.bucket);
    }
    
    return { 
      success: false, 
      message: `Unexpected error: ${err.message || 'Unknown error'}` 
    };
  }
}

/**
 * Fetches a single category for editing.
 */
export async function getCategoryForEdit(categoryId: string): Promise<Category | null> {
    const log = logger.child({ action: 'getCategoryForEdit', categoryId });
    
    if (!categoryId) {
        log.warn('Called with no categoryId');
        return null;
    }

    log.info('Fetching category data');

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
            log.error({ error }, 'Error fetching category data');
            return null;
        }

        if (!data) {
            log.warn('No data found for category');
            return null;
        }

        log.info('Successfully fetched category data');
        return data;

    } catch (err) {
        log.error({ error: err }, 'Unexpected error fetching category');
        return null;
    }
}