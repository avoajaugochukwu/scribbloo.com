'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Remove sharp and path imports if no longer needed elsewhere in this file
// import sharp from 'sharp';
// import path from 'path';

import {
    generateStoragePath,
    uploadOriginalFile,
    convertImageToWebpBuffer,
    uploadBufferToStorage,
    deleteStorageFile
} from '@/lib/storageUtils';
import { findOrCreateTags } from './utils';
import logger from '@/lib/logger'; // Import logger
import { ImageProcessingService } from '@/services/ImageProcessingService';
import { validateImageFiles } from '@/lib/validation';

const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;

/**
 * Creates a new image record, uploads the original file, converts it to WebP,
 * uploads the WebP version, finds/creates tags, and links categories/tags.
 * Accepts previous state for useFormState compatibility.
 */
export async function createColoringPage(
    previousState: { success: boolean; message: string; imageId?: string },
    formData: FormData
): Promise<{ success: boolean; message: string; imageId?: string }> {
    const title = formData.get('title')?.toString().trim() || null;
    const description = formData.get('description')?.toString().trim() || null;
    const imageFile = formData.get('imageFile') as File | null;
    const categoryIds = formData.getAll('categoryIds').map(id => id.toString());
    const tagsInput = formData.get('tagsInput')?.toString() || '';

    const log = logger.child({ action: 'createColoringPage', titleAttempt: title });
    log.info('Attempting to create coloring page');

    // --- File Validation ---
    const fileValidation = validateImageFiles([
        { file: imageFile, fieldName: 'coloring page image', required: true }
    ], log);

    if (!fileValidation.valid) {
        return { success: false, message: fileValidation.message || 'File validation failed' };
    }

    let originalFilePath: string | null = null;
    let webpFilePath: string | null = null;
    let newImageId: string | null = null;
    let finalTagIds: string[] = [];
    const uploadedFilesForRollback: { bucket: string; path: string }[] = [];

    // --- Consolidated Rollback Function ---
    const performRollback = async (step: string, errorDetails: any) => {
        log.error({ step, error: errorDetails }, `Error during ${step}, performing rollback.`);

        // Delete database records first (if created)
        if (newImageId) {
            try {
                await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).delete().eq('coloring_page_id', newImageId);
                await supabase.from(Constants.COLORING_PAGE_CATEGORY_TABLE).delete().eq('coloring_page_id', newImageId);
                await supabase.from(Constants.COLORING_PAGES_TABLE).delete().eq('id', newImageId);
                log.info({ imageId: newImageId }, `Deleted database record during rollback.`);
            } catch (dbDeleteError) {
                log.error({ imageId: newImageId, error: dbDeleteError }, `Error during database rollback.`);
            }
        }

        // Delete uploaded storage files
        if (uploadedFilesForRollback.length > 0) {
            log.warn({ count: uploadedFilesForRollback.length }, 'Attempting storage file rollback');
            const deletePromises = uploadedFilesForRollback.map(file =>
                deleteStorageFile({ bucketName: file.bucket, filePath: file.path })
            );
            await Promise.allSettled(deletePromises);
            // deleteStorageFile logs its own results
        }

        const message = errorDetails instanceof Error ? errorDetails.message : String(errorDetails);
        return { success: false, message: `Failed during ${step}: ${message}` };
    };
    // --- End Rollback Function ---

    try {
        // 1. Generate Paths
        const { storagePath: generatedOriginalPath } = generateStoragePath({ originalFileName: imageFile.name, asWebp: false });
        const { storagePath: generatedWebpPath } = generateStoragePath({ originalFileName: imageFile.name, asWebp: true });
        log.info({ originalPath: generatedOriginalPath, webpPath: generatedWebpPath }, 'Generated storage paths');

        // 2. Upload Original File
        log.info(`Uploading original file to: ${generatedOriginalPath}`);
        const originalUploadResult = await uploadOriginalFile({
            bucketName: BUCKET_NAME,
            storagePath: generatedOriginalPath,
            file: imageFile,
            contentType: imageFile.type,
            upsert: false // Don't overwrite on create
        });

        if (originalUploadResult.error || !originalUploadResult.path) {
            return await performRollback('Original Upload', originalUploadResult.error || 'Unknown upload error');
        }
        originalFilePath = originalUploadResult.path;
        uploadedFilesForRollback.push({ bucket: BUCKET_NAME, path: originalFilePath });
        log.info({ path: originalFilePath }, 'Original file uploaded successfully');

        // 3. Convert to WebP
        log.info('Converting original file to WebP buffer');
        const fileBuffer = await imageFile.arrayBuffer();
        const conversionResult = await convertImageToWebpBuffer({ fileBuffer }); // Use default quality or specify

        if (conversionResult.error || !conversionResult.webpBuffer) {
            return await performRollback('WebP Conversion', conversionResult.error || 'Conversion failed');
        }
        log.info('Conversion to WebP buffer successful');

        // 4. Upload WebP Buffer
        log.info(`Uploading WebP buffer to: ${generatedWebpPath}`);
        const webpUploadResult = await uploadBufferToStorage({
            bucketName: BUCKET_NAME,
            storagePath: generatedWebpPath,
            buffer: conversionResult.webpBuffer,
            contentType: 'image/webp',
            upsert: false // Don't overwrite on create
        });

        if (webpUploadResult.error || !webpUploadResult.path) {
            return await performRollback('WebP Upload', webpUploadResult.error || 'Unknown upload error');
        }
        webpFilePath = webpUploadResult.path;
        uploadedFilesForRollback.push({ bucket: BUCKET_NAME, path: webpFilePath });
        log.info({ path: webpFilePath }, 'WebP file uploaded successfully');

        // 5. Find or Create Tags
        const tagNames = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
        log.info('Finding or creating tags...');
        const tagsResult = await findOrCreateTags(tagNames);
        if (tagsResult.error) {
            return await performRollback('Tag Processing', tagsResult.error);
        }
        finalTagIds = tagsResult.tagIds;
        log.info({ tagIds: finalTagIds }, 'Tags processed successfully');

        // 6. Insert image metadata into the 'coloring_pages' table
        log.info('Inserting image metadata into database...');
        const dbPayload = {
            title: title,
            description: description,
            image_url: originalFilePath, // Store original path
            webp_image_url: webpFilePath   // Store WebP path
        };
        const { data: imageInsertData, error: imageInsertError } = await supabase
          .from(Constants.COLORING_PAGES_TABLE)
          .insert([dbPayload])
          .select('id')
          .single();

        if (imageInsertError || !imageInsertData) {
          return await performRollback('Database Insert', imageInsertError || 'Unknown DB error');
        }
        newImageId = imageInsertData.id;
        log.info({ imageId: newImageId }, `Image metadata inserted successfully`);

        // 7. Link Categories and Tags
        try {
            if (categoryIds.length > 0) {
                log.info({ count: categoryIds.length }, `Linking categories...`);
                const categoryLinks = categoryIds.map(categoryId => ({
                    coloring_page_id: newImageId,
                    category_id: categoryId
                }));
                const { error: categoryLinkError } = await supabase.from(Constants.COLORING_PAGE_CATEGORY_TABLE).insert(categoryLinks);
                if (categoryLinkError) throw categoryLinkError; // Let outer catch handle rollback
                log.info('Categories linked successfully.');
            }

            if (finalTagIds.length > 0) {
                log.info({ count: finalTagIds.length }, `Linking tags...`);
                const tagLinks = finalTagIds.map(tagId => ({
                    coloring_page_id: newImageId,
                    tag_id: tagId
                }));
                const { error: tagLinkError } = await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).insert(tagLinks);
                if (tagLinkError) throw tagLinkError; // Let outer catch handle rollback
                log.info('Tags linked successfully.');
            }
        } catch (linkError: any) {
            return await performRollback('Category/Tag Linking', linkError);
        }

        // 8. Revalidate paths
        log.info('Revalidating paths...');
        revalidatePath('/admin');
        revalidatePath('/admin/coloring-pages/create');
        revalidatePath('/admin/coloring-pages/edit', 'layout');
        revalidatePath('/coloring-pages', 'layout');

        return { success: true, message: 'Coloring Page created successfully!', imageId: newImageId ?? undefined };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error during image creation process');
        return await performRollback('Unexpected Error', err);
    }
} 