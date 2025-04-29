'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Deletes an image record and its associated file from storage.
 */
export async function deleteImage(imageId: string): Promise<{ success: boolean; message: string }> {
    if (!imageId) {
        return { success: false, message: 'Image ID is missing.' };
    }
    console.log(`Attempting to delete image ID: ${imageId}`);

    let imagePath: string | null = null; // To store the file path

    try {
        // 1. Get the image_url (file path) before deleting the record
        const { data: imageData, error: fetchError } = await supabase
            .from('images')
            .select('image_url')
            .eq('id', imageId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'not found' error for now
            console.error(`Error fetching image path for deletion (ID: ${imageId}):`, fetchError.message);
            return { success: false, message: `Failed to retrieve image details for deletion: ${fetchError.message}` };
        }
        if (imageData) {
            imagePath = imageData.image_url;
        } else {
             console.warn(`Image record not found (ID: ${imageId}). Proceeding with potential storage cleanup if path known.`);
             // If you stored the path elsewhere or can derive it, set imagePath here.
             // Otherwise, storage deletion might be skipped or fail.
        }


        // 2. Delete the database record
        // Ensure ON DELETE CASCADE is set for foreign keys in image_categories and image_tags referencing images.id
        const { error: deleteDbError } = await supabase
            .from('images')
            .delete()
            .eq('id', imageId);

        // Don't fail immediately if DB delete fails (e.g., record already gone), but log it.
        if (deleteDbError && deleteDbError.code !== 'PGRST116') { // PGRST116 means 0 rows deleted (already gone)
            console.error(`Error deleting image record (ID: ${imageId}):`, deleteDbError.message);
            // Decide if this is a hard failure or if storage deletion should still be attempted
            // return { success: false, message: `Database deletion failed: ${deleteDbError.message}` };
        } else if (!deleteDbError) {
             console.log(`Image record deleted successfully or was already gone (ID: ${imageId})`);
        }


        // 3. Delete the file from storage if path exists
        if (imagePath) {
            const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'images';
            const { error: deleteStorageError } = await supabase.storage
                .from(bucketName)
                .remove([imagePath]);

            if (deleteStorageError) {
                // Log the error but consider the operation successful if DB record is gone.
                console.warn(`Failed to delete image file from storage (Path: ${imagePath}):`, deleteStorageError.message);
                // Return success but mention the storage issue
                revalidatePath('/admin');
                return { success: true, message: `Image record deleted, but failed to remove file from storage: ${deleteStorageError.message}` };
            } else {
                console.log(`Image file deleted from storage (Path: ${imagePath})`);
            }
        } else {
             console.warn(`No image file path found or retrieved for image ID ${imageId}. Skipping storage deletion.`);
             // If DB delete was successful, still count as success overall
             if (!deleteDbError || deleteDbError.code === 'PGRST116') {
                 revalidatePath('/admin');
                 return { success: true, message: 'Image record deleted (no file path found for storage cleanup).' };
             } else {
                 // If DB delete also failed earlier
                 return { success: false, message: `Database deletion failed: ${deleteDbError?.message}. No file path for storage cleanup.` };
             }
        }

        // 4. Revalidate paths if everything seemed okay
        revalidatePath('/admin');

        return { success: true, message: 'Image deleted successfully.' };

    } catch (err: any) {
        console.error(`Unexpected error deleting image (ID: ${imageId}):`, err);
        return { success: false, message: `Deletion failed: ${err.message}` };
    }
} 