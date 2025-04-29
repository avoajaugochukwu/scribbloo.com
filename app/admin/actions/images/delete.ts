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
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'coloring-images';
    const tableName = 'images';

    try {
        // 1. Get the image_url (file path) before deleting the record
        const { data: imageData, error: fetchError } = await supabase
            .from(tableName)
            .select('image_url')
            .eq('id', imageId)
            .single();

        if (fetchError || !imageData) {
            console.warn(`Could not fetch image record (ID: ${imageId}) to get path for deletion:`, fetchError?.message);
            // Decide if you want to proceed with DB deletion attempt anyway or fail here
            // Proceeding might leave an orphan file if the record doesn't exist but the file does
            // Failing here is safer if the record MUST exist.
            // Let's try deleting DB record anyway, but log the issue.
            // return { success: false, message: `Image record not found (ID: ${imageId}). Cannot delete.` };
        } else {
            imagePath = imageData.image_url; // Store the path
            console.log(`Found image path for deletion: ${imagePath}`);
        }


        // 2. Delete the database record
        console.log(`Deleting image record from table "${tableName}" (ID: ${imageId})`);
        const { error: deleteDbError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', imageId);

        // Don't immediately fail on DB error, still try storage cleanup if path exists
        if (deleteDbError) {
            console.error(`Error deleting image record (ID: ${imageId}):`, deleteDbError.message);
            // We'll handle the return message later based on storage cleanup result
        } else {
            console.log(`Image record deleted successfully (ID: ${imageId}).`);
        }

        // 3. Delete the file from storage if a path was found
        if (imagePath) {
            console.log(`Deleting image file "${imagePath}" from bucket "${bucketName}"`);
            const { error: deleteStorageError } = await supabase.storage
                .from(bucketName)
                .remove([imagePath]);

            if (deleteStorageError) {
                console.error(`Error deleting image file from storage (Path: ${imagePath}):`, deleteStorageError.message);
                // If DB delete succeeded but storage failed, return specific error
                if (!deleteDbError) {
                    return { success: false, message: `Image record deleted, but failed to delete file from storage: ${deleteStorageError.message}` };
                } else {
                    // If both failed
                    return { success: false, message: `Failed to delete DB record (${deleteDbError.message}) AND storage file (${deleteStorageError.message}).` };
                }
            } else {
                 console.log(`Image file deleted successfully from storage (Path: ${imagePath}).`);
                 // If DB delete failed earlier but storage succeeded
                 if (deleteDbError) {
                     return { success: false, message: `Storage file deleted, but failed to delete DB record: ${deleteDbError.message}` };
                 }
                 // Both succeeded - fall through to success return
            }
        } else {
             // No image path found
             console.warn(`No image path found for image ID ${imageId}. Skipping storage deletion.`);
             // If DB delete failed and no path found
             if (deleteDbError) {
                 return { success: false, message: `Database deletion failed: ${deleteDbError?.message}. No file path found for storage cleanup.` };
             } else {
                 // If DB delete succeeded but no path found (maybe expected if image_url was null)
                 return { success: true, message: 'Image record deleted (no file path found for storage cleanup).' };
             }
        }

        // 4. Revalidate paths if everything seemed okay (reached only if DB delete succeeded and storage delete succeeded or was skipped appropriately)
        revalidatePath('/admin');
        revalidatePath('/coloring-pages', 'layout'); // Revalidate public pages

        return { success: true, message: 'Image deleted successfully.' };

    } catch (err: any) {
        console.error(`Unexpected error deleting image (ID: ${imageId}):`, err);
        return { success: false, message: `Deletion failed: ${err.message}` };
    }
} 