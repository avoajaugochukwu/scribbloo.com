'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Import shared helper
import { deleteStorageFile } from '@/lib/storageUtils';
import { Constants } from '@/config/constants';

const CATEGORIES_TABLE = Constants.CATEGORIES_TABLE;
const THUMBNAIL_BUCKET = Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_NAME;
const HERO_BUCKET = Constants.SUPABASE_HERO_IMAGES_BUCKET_NAME;

/**
 * Deletes a category from the database.
 */
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    if (!categoryId) {
        return { success: false, message: 'Category ID is required.' };
    }

    console.log(`Attempting to delete category ID: ${categoryId}`);

    let thumbnailPath: string | null = null;
    let heroPath: string | null = null;

    try {
        // 1. Fetch the record to get BOTH file paths BEFORE deleting
        console.log(`Fetching paths for category ID: ${categoryId}`);
        const { data: categoryData, error: fetchError } = await supabase
            .from(CATEGORIES_TABLE)
            .select('thumbnail_image, hero_image') // Select both paths
            .eq('id', categoryId)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                 console.warn(`Category ${categoryId} not found for deletion.`);
                 revalidatePath('/admin/categories', 'layout');
                 return { success: true, message: 'Category not found, assumed already deleted.' };
            }
            console.error(`Error fetching category ${categoryId} for deletion:`, fetchError);
            return { success: false, message: `Failed to fetch category details: ${fetchError.message}` };
        }

        thumbnailPath = categoryData?.thumbnail_image;
        heroPath = categoryData?.hero_image;
        console.log(`Found paths - Thumbnail: ${thumbnailPath}, Hero: ${heroPath}`);

        // 2. Delete the database record
        console.log(`Deleting database record for ID: ${categoryId}`);
        const { error: deleteDbError } = await supabase
            .from(CATEGORIES_TABLE)
            .delete()
            .eq('id', categoryId);

        if (deleteDbError) {
            console.error(`Error deleting category record ${categoryId}:`, deleteDbError);
            return { success: false, message: `Database deletion failed: ${deleteDbError.message}` };
        }
        console.log(`Database record deleted successfully.`);

        // 3. Delete associated files from storage AFTER successful DB deletion
        const deletePromises = [];
        if (thumbnailPath) {
            console.log(`Queueing deletion of thumbnail: ${thumbnailPath}`);
            deletePromises.push(deleteStorageFile(THUMBNAIL_BUCKET, thumbnailPath));
        }
        if (heroPath) {
            console.log(`Queueing deletion of hero image: ${heroPath}`);
            deletePromises.push(deleteStorageFile(HERO_BUCKET, heroPath));
        }

        if (deletePromises.length > 0) {
            console.log(`Attempting deletion of ${deletePromises.length} storage file(s)...`);
            const results = await Promise.allSettled(deletePromises);
            console.log('Storage file deletion results:', results);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const pathAttempted = index === 0 && thumbnailPath ? thumbnailPath : heroPath; // Basic guess
                    console.warn(`Failed to delete storage file ${pathAttempted}: ${result.reason}`);
                }
            });
        } else {
             console.log('No storage files associated with the record.');
        }

        // 4. Revalidate relevant paths
        console.log('Revalidating paths after deletion...');
        revalidatePath('/admin/categories', 'layout');
        revalidatePath('/admin');

        return { success: true, message: 'Category deleted successfully.' };

    } catch (err: any) {
        console.error(`Unexpected error deleting category ${categoryId}:`, err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during deletion.';
        return { success: false, message };
    }
} 