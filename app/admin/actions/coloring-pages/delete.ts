'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { deleteStorageFile } from '@/lib/storageUtils';
import { Constants } from '@/config/constants';
import logger from '@/lib/logger';

const COLORING_PAGES_TABLE = Constants.COLORING_PAGES_TABLE;
const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;

/**
 * Deletes a coloring page record and its associated image files from storage.
 */
export async function deleteColoringPage(coloringPageId: string): Promise<{ success: boolean; message: string }> {
    const log = logger.child({ action: 'deleteColoringPage', coloringPageId });

    if (!coloringPageId) {
        log.warn('Validation failed: Coloring page ID is missing.');
        return { success: false, message: 'Coloring page ID is missing.' };
    }

    log.info(`Attempting to delete coloring page`);

    let originalPathToDelete: string | null = null;
    let webpPathToDelete: string | null = null;

    try {
        // 1. Fetch the record to get BOTH image paths
        log.info(`Fetching image paths`);
        const { data: pageData, error: fetchError } = await supabase
            .from(COLORING_PAGES_TABLE)
            .select('image_url, webp_image_url') // Select both paths
            .eq('id', coloringPageId)
            .single();

        if (fetchError) {
            // Handle "Not Found" gracefully - maybe it was already deleted
            if (fetchError.code === 'PGRST116') {
                 log.warn(`Coloring page not found (PGRST116), assuming already deleted.`);
                 // Revalidate just in case, then return success
                 revalidatePath('/admin/coloring-pages', 'layout');
                 revalidatePath('/admin');
                 return { success: true, message: 'Coloring page not found, assumed already deleted.' };
            }
            log.error({ error: fetchError }, `Error fetching coloring page for deletion`);
            return { success: false, message: `Failed to fetch coloring page details: ${fetchError.message}` };
        }

        originalPathToDelete = pageData?.image_url;
        webpPathToDelete = pageData?.webp_image_url;
        log.info({ originalPath: originalPathToDelete, webpPath: webpPathToDelete }, `Found image paths to delete`);

        // 2. Delete the database record
        log.info(`Deleting database record`);
        const { error: deleteDbError } = await supabase
            .from(COLORING_PAGES_TABLE)
            .delete()
            .eq('id', coloringPageId);

        if (deleteDbError) {
            // If DB delete fails, we don't proceed to delete the files
            log.error({ error: deleteDbError }, `Error deleting coloring page record`);
            return { success: false, message: `Database deletion failed: ${deleteDbError.message}` };
        }
        log.info(`Database record deleted successfully.`);

        // 3. Delete BOTH associated image files from storage
        const deletePromises = [];
        if (originalPathToDelete) {
            log.info(`Queueing deletion of original storage file: ${originalPathToDelete}`);
            deletePromises.push(deleteStorageFile({ bucketName: BUCKET_NAME, filePath: originalPathToDelete }));
        } else {
             log.info('No original storage file path associated with the record.');
        }
        if (webpPathToDelete) {
            log.info(`Queueing deletion of WebP storage file: ${webpPathToDelete}`);
            deletePromises.push(deleteStorageFile({ bucketName: BUCKET_NAME, filePath: webpPathToDelete }));
        } else {
             log.info('No WebP storage file path associated with the record.');
        }

        if (deletePromises.length > 0) {
            log.info({ count: deletePromises.length }, 'Attempting deletion of storage files...');
            await Promise.allSettled(deletePromises);
            // deleteStorageFile logs results internally
        }

        // 4. Revalidate relevant paths
        log.info('Revalidating paths after deletion...');
        revalidatePath('/admin/coloring-pages', 'layout');
        revalidatePath('/admin');
        revalidatePath('/coloring-pages', 'layout'); // Revalidate public pages too

        return { success: true, message: 'Coloring page deleted successfully.' };

    } catch (err: any) {
        log.error({ error: err }, `Unexpected error deleting coloring page`);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during deletion.';
        return { success: false, message };
    }
} 