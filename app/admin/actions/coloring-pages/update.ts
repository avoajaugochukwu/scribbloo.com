'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import {
    generateStoragePath,
    uploadOriginalFile,
    convertImageToWebpBuffer,
    uploadBufferToStorage,
    deleteStorageFile
} from '@/lib/storageUtils';
import ColoringPage from '@/types/coloringpage.type';
import { Constants } from '@/config/constants';
import logger from '@/lib/logger';

const COLORING_PAGES_BUCKET = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;
const COLORING_PAGES_TABLE = Constants.COLORING_PAGES_TABLE;

/**
 * Updates an existing coloring page's details, category/tag associations,
 * and optionally replaces the image file (generating a new WebP version).
 * Uses upsert: true for uploads to allow overwriting based on slug.
 */
export async function updateColoringPage(formData: FormData): Promise<{ success: boolean; message: string }> {
    const coloringPageId = formData.get('coloringPageId')?.toString();
    const title = formData.get('title')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const categoryIds = formData.getAll('categoryIds') as string[];
    const tagIds = formData.getAll('tagIds') as string[];
    const newImageFile = formData.get('imageFile') as File | null;

    const log = logger.child({ action: 'updateColoringPage', coloringPageId });
    log.info('Attempting to update coloring page');

    // --- Validation ---
    if (!coloringPageId) {
        log.warn('Validation failed: Coloring page ID is missing.');
        return { success: false, message: 'Coloring page ID is missing.' };
    }
    if (!title) {
        log.warn('Validation failed: Title is required.');
        return { success: false, message: 'Title is required.' };
    }
    if (newImageFile && newImageFile.size > 0 && !newImageFile.type.startsWith('image/')) {
        log.warn({ fileType: newImageFile.type }, 'Validation failed: Invalid file type for new image.');
        return { success: false, message: 'Invalid file type for new image. Please upload an image.' };
    }
    // --- End Validation ---

    let oldOriginalImagePath: string | null = null;
    let oldWebpPath: string | null = null;
    let newOriginalImagePath: string | null = null;
    let newWebpPath: string | null = null;
    let originalPathChanged = false;
    let webpPathChanged = false;
    const uploadedFilesForRollback: { bucket: string; path: string }[] = [];

    // --- Rollback Function for New Files ---
    const rollbackNewFiles = async () => {
        if (uploadedFilesForRollback.length > 0) {
            log.warn({ count: uploadedFilesForRollback.length }, 'Rolling back newly uploaded files...');
            const deletePromises = uploadedFilesForRollback.map(file =>
                deleteStorageFile({ bucketName: file.bucket, filePath: file.path })
            );
            await Promise.allSettled(deletePromises);
        } else {
             log.debug('Skipping new file rollback (no new files uploaded).');
        }
    };
    // --- End Rollback Function ---

    try {
        // 1. Fetch current image data (including both paths)
        log.info(`Fetching current data`);
        const { data: currentImage, error: fetchError } = await supabase
            .from(COLORING_PAGES_TABLE)
            .select('title, description, image_url, webp_image_url') // Fetch both paths
            .eq('id', coloringPageId)
            .single();

        if (fetchError || !currentImage) {
            log.error({ error: fetchError }, `Error fetching current coloring page`);
            return { success: false, message: 'Could not find the coloring page to update.' };
        }
        oldOriginalImagePath = currentImage.image_url;
        oldWebpPath = currentImage.webp_image_url;
        log.info({ oldOriginalPath: oldOriginalImagePath, oldWebpPath: oldWebpPath }, `Old image paths fetched`);

        // Initialize new paths with old ones
        newOriginalImagePath = oldOriginalImagePath;
        newWebpPath = oldWebpPath;

        // 2. Handle NEW Image Upload (if provided)
        if (newImageFile && newImageFile.size > 0) {
            log.info(`New image file "${newImageFile.name}" provided. Processing...`);

            // 2a. Generate new paths
            const { storagePath: generatedOriginalPath } = generateStoragePath({ originalFileName: newImageFile.name, asWebp: false });
            const { storagePath: generatedWebpPath } = generateStoragePath({ originalFileName: newImageFile.name, asWebp: true });
            log.info({ newOriginalPath: generatedOriginalPath, newWebpPath: generatedWebpPath }, 'Generated new storage paths');

            // 2b. Upload new original file (upsert=true)
            const originalUploadResult = await uploadOriginalFile({
                bucketName: COLORING_PAGES_BUCKET,
                storagePath: generatedOriginalPath,
                file: newImageFile,
                contentType: newImageFile.type,
                upsert: true
            });
            if (originalUploadResult.error || !originalUploadResult.path) {
                return { success: false, message: `New original image upload failed: ${originalUploadResult.error}` };
            }
            newOriginalImagePath = originalUploadResult.path;
            uploadedFilesForRollback.push({ bucket: COLORING_PAGES_BUCKET, path: newOriginalImagePath });
            log.info({ path: newOriginalImagePath }, 'New original file uploaded');

            // 2c. Convert new file to WebP
            const fileBuffer = await newImageFile.arrayBuffer();
            const conversionResult = await convertImageToWebpBuffer({ fileBuffer });
            if (conversionResult.error || !conversionResult.webpBuffer) {
                await rollbackNewFiles(); // Rollback original upload
                return { success: false, message: `WebP conversion failed: ${conversionResult.error}` };
            }
            log.info('New file converted to WebP buffer');

            // 2d. Upload new WebP buffer (upsert=true)
            const webpUploadResult = await uploadBufferToStorage({
                bucketName: COLORING_PAGES_BUCKET,
                storagePath: generatedWebpPath,
                buffer: conversionResult.webpBuffer,
                contentType: 'image/webp',
                upsert: true
            });
            if (webpUploadResult.error || !webpUploadResult.path) {
                await rollbackNewFiles(); // Rollback original upload
                return { success: false, message: `New WebP image upload failed: ${webpUploadResult.error}` };
            }
            newWebpPath = webpUploadResult.path;
            uploadedFilesForRollback.push({ bucket: COLORING_PAGES_BUCKET, path: newWebpPath });
            log.info({ path: newWebpPath }, 'New WebP file uploaded');

            // Check if paths actually changed
            originalPathChanged = newOriginalImagePath !== oldOriginalImagePath;
            webpPathChanged = newWebpPath !== oldWebpPath;
            log.info({ originalChanged: originalPathChanged, webpChanged: webpPathChanged }, 'Path change status');

        } else {
            log.info('No new image file provided.');
        }

        // 3. Prepare data for DB update
        const updateData: Partial<ColoringPage> = {
            title: title,
            description: description || null,
            // Only include paths if they actually changed AND are not null
            ...(originalPathChanged && newOriginalImagePath && { image_url: newOriginalImagePath }),
            ...(webpPathChanged && newWebpPath && { webp_image_url: newWebpPath }),
        };

        // Check if there's anything to update besides links
        const hasDataUpdates = (updateData.title !== currentImage.title) ||
                               (updateData.description !== (currentImage.description || null)) ||
                               originalPathChanged || webpPathChanged;

        // 4. Update Image Record in Database (if necessary)
        if (hasDataUpdates) {
            log.info({ data: updateData }, 'Updating coloring page record in database');
            const { error: updateError } = await supabase
                .from(COLORING_PAGES_TABLE)
                .update(updateData)
                .eq('id', coloringPageId);

            if (updateError) {
                log.error({ error: updateError }, 'Error updating coloring page record');
                await rollbackNewFiles(); // Attempt rollback of new files
                return { success: false, message: `Database update error: ${updateError.message}` };
            }
            log.info('Database record updated successfully.');
        } else {
            log.info('No changes to title, description, or image paths. Skipping main record update.');
        }

        // 5. Update Links using RPC
        log.info('Updating coloring page category/tag links via RPC...');
        const { error: rpcError } = await supabase.rpc('update_coloring_page_links', {
            p_coloring_page_id: coloringPageId,
            p_category_ids: categoryIds,
            p_tag_ids: tagIds,
        });

        if (rpcError) {
            log.error({ error: rpcError }, 'Error updating coloring page links via RPC');
            // Don't rollback file changes here. Report the link error.
            return { success: false, message: `Coloring page details updated, but failed to update links: ${rpcError.message}` };
        }
        log.info('Category/tag links updated successfully via RPC.');

        // 6. Delete OLD images from storage ONLY IF their paths changed
        const deleteOldPromises = [];
        if (originalPathChanged && oldOriginalImagePath) {
            log.info({ oldPath: oldOriginalImagePath }, "Original path changed, queueing deletion of old file");
            deleteOldPromises.push(deleteStorageFile({ bucketName: COLORING_PAGES_BUCKET, filePath: oldOriginalImagePath }));
        }
        if (webpPathChanged && oldWebpPath) {
            log.info({ oldPath: oldWebpPath }, "WebP path changed, queueing deletion of old file");
            deleteOldPromises.push(deleteStorageFile({ bucketName: COLORING_PAGES_BUCKET, filePath: oldWebpPath }));
        }

        if (deleteOldPromises.length > 0) {
            log.info({ count: deleteOldPromises.length }, 'Attempting deletion of old storage files...');
            await Promise.allSettled(deleteOldPromises);
            // deleteStorageFile logs results internally
        }

        // 7. Success - Revalidate Paths
        log.info(`Coloring page "${title}" updated successfully.`);
        revalidatePath('/admin');
        revalidatePath(`/admin/coloring-pages/edit/${coloringPageId}`);
        revalidatePath('/admin/coloring-pages', 'layout');
        revalidatePath('/coloring-pages', 'layout');

        return { success: true, message: `Coloring page "${title}" updated successfully.` };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error updating coloring page');
        await rollbackNewFiles(); // Attempt cleanup of NEW files
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return { success: false, message };
    }
}

// ... getColoringPageForEdit function ... 