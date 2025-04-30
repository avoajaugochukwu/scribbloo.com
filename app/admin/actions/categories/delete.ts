'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Import shared helper
import { deleteStorageFile } from '@/lib/storageUtils';
import { Constants } from '@/config/constants';

/**
 * Deletes a category from the database.
 */
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    if (!categoryId) {
        return { success: false, message: 'Category ID is required.' };
    }

    // Define bucket names
    const heroBucket = Constants.SUPABASE_HERO_IMAGES_NAME;
    const thumbnailBucket = Constants.SUPABASE_THUMBNAIL_IMAGES_NAME;
    let heroImagePath: string | null = null;
    let thumbnailImagePath: string | null = null;

    try {
        // 1. Fetch the category to get image paths BEFORE deleting
        console.log(`Fetching category ${categoryId} to get image paths for deletion...`);
        const { data: categoryToDelete, error: fetchError } = await supabase
            .from(Constants.CATEGORIES_TABLE)
            .select('name, hero_image, thumbnail_image') // Renamed fields
            .eq('id', categoryId)
            .single();

        if (fetchError) {
            // Log error but proceed to attempt DB deletion anyway? Or return error?
            // If category not found, maybe it was already deleted.
            if (fetchError.code === 'PGRST116') { // Code for "Resource Not Found"
                console.warn(`Category ${categoryId} not found for fetching paths, likely already deleted.`);
                // Proceed to attempt deletion just in case, or return success? Let's return success.
                return { success: true, message: `Category ${categoryId} likely already deleted.` };
            }
            console.error(`Error fetching category ${categoryId} before delete:`, fetchError.message);
            // Decide if you want to stop or continue. Stopping is safer if you MUST delete files.
            return { success: false, message: `Failed to fetch category details before deletion: ${fetchError.message}` };
        }

        if (!categoryToDelete) {
            console.warn(`Category ${categoryId} not found when fetching for delete.`);
            return { success: true, message: `Category ${categoryId} not found.` };
        }

        // Store the paths
        heroImagePath = categoryToDelete.hero_image; // Use renamed field
        thumbnailImagePath = categoryToDelete.thumbnail_image; // Use renamed field
        const categoryName = categoryToDelete.name; // For logging

        // 2. Delete the category record from the database
        console.log(`Attempting to delete category "${categoryName}" (ID: ${categoryId}) from database...`);
        const { error: deleteDbError } = await supabase
            .from(Constants.CATEGORIES_TABLE)
            .delete()
            .eq('id', categoryId);

        if (deleteDbError) {
            console.error(`Database error deleting category ${categoryId}:`, deleteDbError.message);
            // Handle potential foreign key constraints if images link directly to categories
            return { success: false, message: `Database error deleting category: ${deleteDbError.message}` };
        }

        console.log(`Category "${categoryName}" deleted successfully from database.`);

        // 3. Delete associated images from storage AFTER successful DB deletion
        if (heroImagePath) {
            console.log(`Attempting to delete hero image: ${heroImagePath}`);
            await deleteStorageFile(heroBucket, heroImagePath);
        } else {
            console.log(`No hero image path found for deleted category ${categoryId}.`);
        }

        if (thumbnailImagePath) {
            console.log(`Attempting to delete thumbnail image: ${thumbnailImagePath}`);
            await deleteStorageFile(thumbnailBucket, thumbnailImagePath);
        } else {
            console.log(`No thumbnail image path found for deleted category ${categoryId}.`);
        }

        // 4. Success - Revalidate Paths
        console.log(`Revalidating paths after deleting category ${categoryId}...`);
        revalidatePath('/admin/categories');
        revalidatePath('/admin');
        revalidatePath('/coloring-pages', 'layout'); // Revalidate layout where categories might be listed

        return { success: true, message: `Category "${categoryName}" and associated images deleted successfully.` };

    } catch (err: any) {
        console.error(`Unexpected error deleting category ${categoryId}:`, err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        // Note: We don't have files to clean up here unless the fetch succeeded but DB delete failed *unexpectedly*
        return { success: false, message };
    }
} 