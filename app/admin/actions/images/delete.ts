'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Import shared helper
import { deleteStorageFile } from '@/lib/storageUtils';

/**
 * Deletes an image record and its associated file from storage.
 */
export async function deleteImage(imageId: string): Promise<{ success: boolean; message: string }> {
    if (!imageId) {
        return { success: false, message: 'Image ID is required.' };
    }

    let imagePath: string | null = null;
    let imageTitle: string | null = 'Unknown'; // For logging

    try {
        // 1. Fetch the image to get its path BEFORE deleting
        console.log(`Fetching image ${imageId} to get path for deletion...`);
        const { data: imageToDelete, error: fetchError } = await supabase
            .from('images')
            .select('title, image_url') // Select path and title for logging
            .eq('id', imageId)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                 console.warn(`Image ${imageId} not found for fetching path, likely already deleted.`);
                 return { success: true, message: `Image ${imageId} likely already deleted.` };
            }
            console.error(`Error fetching image ${imageId} before delete:`, fetchError.message);
            return { success: false, message: `Failed to fetch image details before deletion: ${fetchError.message}` };
        }

        if (!imageToDelete) {
             console.warn(`Image ${imageId} not found when fetching for delete.`);
             return { success: true, message: `Image ${imageId} not found.` };
        }

        // Store the path and title
        imagePath = imageToDelete.image_url;
        imageTitle = imageToDelete.title;

        // 2. Delete the image record from the database
        // Note: Related entries in image_categories/image_tags should cascade delete
        // if foreign keys are set up with ON DELETE CASCADE. Otherwise, handle manually or via RPC.
        console.log(`Attempting to delete image "${imageTitle}" (ID: ${imageId}) from database...`);
        const { error: deleteDbError } = await supabase
            .from('images')
            .delete()
            .eq('id', imageId);

        if (deleteDbError) {
            console.error(`Database error deleting image ${imageId}:`, deleteDbError.message);
            return { success: false, message: `Database error deleting image: ${deleteDbError.message}` };
        }

        console.log(`Image "${imageTitle}" deleted successfully from database.`);

        // 3. Delete associated image file from storage AFTER successful DB deletion
        if (imagePath) {
            console.log(`Attempting to delete image file: ${imagePath}`);
            await deleteStorageFile('coloring-images', imagePath);
        } else {
            console.log(`No image path found for deleted image ${imageId}.`);
        }

        // 4. Success - Revalidate Paths
        console.log(`Revalidating paths after deleting image ${imageId}...`);
        revalidatePath('/admin');
        revalidatePath('/coloring-pages', 'layout'); // Revalidate public pages

        return { success: true, message: `Image "${imageTitle}" and associated file deleted successfully.` };

    } catch (err: any) {
        console.error(`Unexpected error deleting image ${imageId}:`, err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return { success: false, message };
    }
} 