'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { deleteStorageFile } from '@/lib/storageUtils';
import { Constants } from '@/config/constants';

const COLORING_PAGES_TABLE = Constants.COLORING_PAGES_TABLE;
const COLORING_PAGES_BUCKET = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;

/**
 * Deletes an image record and its associated file from storage.
 */
export async function deleteColoringPage(
    coloringPageId: string
): Promise<{ success: boolean; message: string }> {
    if (!coloringPageId) {
        return { success: false, message: 'Coloring Page ID is required.' };
    }

    console.log(`Attempting to delete coloring page ID: ${coloringPageId}`);

    let originalImagePath: string | null = null;
    let webpImagePath: string | null = null;

    try {
        // 1. Fetch the record to get the file paths BEFORE deleting
        console.log(`Fetching paths for coloring page ID: ${coloringPageId}`);
        const { data: pageData, error: fetchError } = await supabase
            .from(COLORING_PAGES_TABLE)
            .select('image_url, webp_image_url')
            .eq('id', coloringPageId)
            .single();

        if (fetchError) {
            // Handle cases where the page might already be deleted or doesn't exist
            if (fetchError.code === 'PGRST116') { // PostgREST code for "Not Found"
                 console.warn(`Coloring page ${coloringPageId} not found for deletion, possibly already deleted.`);
                 // Optionally revalidate paths anyway and return success
                 revalidatePath('/admin/coloring-pages', 'layout');
                 revalidatePath('/coloring-pages', 'layout');
                 return { success: true, message: 'Coloring page not found, assumed already deleted.' };
            }
            console.error(`Error fetching coloring page ${coloringPageId} for deletion:`, fetchError);
            return { success: false, message: `Failed to fetch coloring page details: ${fetchError.message}` };
        }

        // Store the paths if the record exists
        originalImagePath = pageData?.image_url;
        webpImagePath = pageData?.webp_image_url;
        console.log(`Found paths - Original: ${originalImagePath}, WebP: ${webpImagePath}`);


        // 2. Delete the database record
        // Cascade delete should handle the join table entries (categories, tags)
        console.log(`Deleting database record for ID: ${coloringPageId}`);
        const { error: deleteDbError } = await supabase
            .from(COLORING_PAGES_TABLE)
            .delete()
            .eq('id', coloringPageId);

        if (deleteDbError) {
            console.error(`Error deleting coloring page record ${coloringPageId} from database:`, deleteDbError);
            return { success: false, message: `Database deletion failed: ${deleteDbError.message}` };
        }
        console.log(`Database record deleted successfully.`);


        // 3. Delete associated files from storage AFTER successful DB deletion
        const deletePromises = [];
        if (originalImagePath) {
            console.log(`Queueing deletion of original image: ${originalImagePath}`);
            deletePromises.push(deleteStorageFile(COLORING_PAGES_BUCKET, originalImagePath));
        }
        if (webpImagePath) {
            console.log(`Queueing deletion of WebP image: ${webpImagePath}`);
            deletePromises.push(deleteStorageFile(COLORING_PAGES_BUCKET, webpImagePath));
        }

        if (deletePromises.length > 0) {
            console.log(`Attempting deletion of ${deletePromises.length} storage file(s)...`);
            const results = await Promise.allSettled(deletePromises);
            console.log('Storage file deletion results:', results);
            // Log any failures but don't necessarily fail the whole operation,
            // as the primary goal (DB deletion) succeeded.
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const pathAttempted = index === 0 && originalImagePath ? originalImagePath : webpImagePath;
                    console.warn(`Failed to delete storage file ${pathAttempted}: ${result.reason}`);
                }
            });
        } else {
             console.log('No storage files associated with the record or paths were null.');
        }

        // 4. Revalidate relevant paths
        console.log('Revalidating paths after deletion...');
        revalidatePath('/admin/coloring-pages', 'layout');
        revalidatePath('/admin'); // General admin revalidation
        revalidatePath('/coloring-pages', 'layout'); // Revalidate public listing

        return { success: true, message: 'Coloring page deleted successfully.' };

    } catch (err: any) {
        console.error(`Unexpected error deleting coloring page ${coloringPageId}:`, err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during deletion.';
        return { success: false, message };
    }
} 