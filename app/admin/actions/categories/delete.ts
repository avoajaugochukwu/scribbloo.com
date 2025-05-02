'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { Constants } from '@/config/constants';
import logger from '@/lib/logger';
import { ImageProcessingService } from '@/services/ImageProcessingService';
import { RevalidationService } from '@/services/RevalidationService';

const CATEGORIES_TABLE = Constants.CATEGORIES_TABLE;
const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME;
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;

/**
 * Deletes a category from the database and its images from storage.
 */
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    if (!categoryId) {
        return { success: false, message: 'Category ID is required.' };
    }

    const log = logger.child({ action: 'deleteCategory', categoryId });
    log.info('Attempting to delete category');

    let thumbnailPath: string | null = null;
    let heroPath: string | null = null;

    try {
        // 1. Fetch the record to get file paths BEFORE deleting
        log.info('Fetching paths for category');
        const { data: categoryData, error: fetchError } = await supabase
            .from(CATEGORIES_TABLE)
            .select('thumbnail_image, hero_image, name')
            .eq('id', categoryId)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                log.warn('Category not found, assuming already deleted.');
                return { success: true, message: 'Category not found, assumed already deleted.' };
            }
            log.error({ error: fetchError }, 'Error fetching category for deletion');
            return { success: false, message: `Failed to fetch category details: ${fetchError.message}` };
        }

        thumbnailPath = categoryData?.thumbnail_image;
        heroPath = categoryData?.hero_image;
        const categoryName = categoryData?.name;

        log.info({ thumbnailPath, heroPath }, 'Found category file paths');

        // 2. Initialize image service
        const imageService = new ImageProcessingService({ 
            action: 'deleteCategory', 
            entityId: categoryId 
        });

        // 3. Delete from database
        log.info('Deleting category from database');
        const { error: deleteDbError } = await supabase
            .from(CATEGORIES_TABLE)
            .delete()
            .eq('id', categoryId);

        if (deleteDbError) {
            log.error({ error: deleteDbError }, 'Error deleting category record');
            return { success: false, message: `Database deletion failed: ${deleteDbError.message}` };
        }
        log.info('Database record deleted successfully');

        // 4. Delete associated files from storage
        if (thumbnailPath || heroPath) {
            log.info('Deleting associated image files');
            // Delete thumbnail
            if (thumbnailPath) {
                await imageService.deleteImageFiles(null, thumbnailPath, THUMBNAIL_BUCKET);
            }
            
            // Delete hero image
            if (heroPath) {
                await imageService.deleteImageFiles(null, heroPath, HERO_BUCKET);
            }
            
            log.info('Associated images deleted');
        }

        RevalidationService.revalidateEntity('category', { 
            action: 'deleteCategory', 
            entityId: categoryId 
        });

        return { 
            success: true, 
            message: `Category "${categoryName || ''}" deleted successfully.` 
        };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error deleting category');
        return { 
            success: false, 
            message: err instanceof Error ? err.message : 'An unexpected error occurred' 
        };
    }
} 