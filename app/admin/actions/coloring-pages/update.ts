'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { Constants } from '@/config/constants';
import logger from '@/lib/logger';
import { ImageProcessingService } from '@/services/ImageProcessingService';
import { validateImageFiles } from '@/lib/validation';
import { RevalidationService } from '@/services/RevalidationService';

const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;

/**
 * Updates an existing coloring page
 */
export async function updateColoringPage(
    pageId: string,
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    // Extract form data
    const title = formData.get('title')?.toString().trim();
    const description = formData.get('description')?.toString().trim() || null;
    const imageFile = formData.get('imageFile') as File | null;
    const keepImage = formData.get('keepImage') === 'true';
    
    // Get category and tag information
    const categoryIds = formData.getAll('categoryIds').map(id => id.toString());
    const tagIds = formData.getAll('tagIds').map(id => id.toString());
    const finalTagIds = tagIds;

    const log = logger.child({ action: 'updateColoringPage', pageId, titleAttempt: title });
    log.info('Attempting to update coloring page');

    // --- Basic Validation ---
    if (!pageId) {
        log.warn('Validation failed: Coloring page ID is required.');
        return { success: false, message: 'Coloring page ID is required.' };
    }
    
    if (!title) {
        log.warn('Validation failed: Title is required.');
        return { success: false, message: 'Title is required.' };
    }
    
    // --- File Validation ---
    const fileValidation = validateImageFiles([
        { file: imageFile, fieldName: 'coloring page image' }
    ], log);
    
    if (!fileValidation.valid) {
        return { success: false, message: fileValidation.message || 'File validation failed' };
    }

    // --- Fetch Current Page Data ---
    const { data: currentPage, error: fetchError } = await supabase
        .from(Constants.COLORING_PAGES_TABLE)
        .select('image_url, webp_image_url')
        .eq('id', pageId)
        .single();

    if (fetchError) {
        log.error({ error: fetchError }, 'Error fetching coloring page');
        return { success: false, message: `Failed to fetch current coloring page: ${fetchError.message}` };
    }

    // Initialize image service
    const imageService = new ImageProcessingService({ 
        action: 'updateColoringPage', 
        entityId: pageId 
    });
    
    let originalFilePath: string | null = currentPage.image_url;
    let webpFilePath: string | null = currentPage.webp_image_url;
    const newUploadedFiles: { path: string }[] = [];

    try {
        // 1. Handle Image Files
        if (imageFile && imageFile.size > 0) {
            // Log file details before upload
            log.info({
                fileName: imageFile.name,
                fileSize: imageFile.size,
                fileType: imageFile.type,
                currentOriginalPath: originalFilePath,
                currentWebpPath: webpFilePath
            }, 'Attempting to upload new image file');

            // Upload new image files
            const imageResult = await imageService.processAndUploadImage(imageFile, {
                bucket: BUCKET_NAME,
                upsert: true,
                webpOnly: false // We want both original and WebP versions
            });
            
            // Log the complete result
            log.info({
                result: imageResult,
                error: imageResult.error || 'none'
            }, 'Image processing result');
            
            if (imageResult.error) {
                return { success: false, message: `Image upload failed: ${imageResult.error}` };
            }
            
            // Store new paths and mark old ones for deletion
            const oldOriginalPath = originalFilePath;
            const oldWebpPath = webpFilePath;
            
            // Log path changes
            log.info({
                oldOriginalPath,
                oldWebpPath,
                newOriginalPath: imageResult.originalPath,
                newWebpPath: imageResult.webpPath
            }, 'Image paths before/after');
            
            originalFilePath = imageResult.originalPath;
            webpFilePath = imageResult.webpPath;
            
            if (originalFilePath) newUploadedFiles.push({ path: originalFilePath });
            if (webpFilePath) newUploadedFiles.push({ path: webpFilePath });
            
            // IMPORTANT: Only delete old files if they're different from new ones
            if (!keepImage && 
                (oldOriginalPath && oldOriginalPath !== originalFilePath) || 
                (oldWebpPath && oldWebpPath !== webpFilePath)) {
                log.info({
                    keepImage,
                    oldOriginalPath,
                    oldWebpPath,
                    condition: 'Deleting old files'
                }, 'About to delete old files');
                await imageService.deleteImageFiles(oldOriginalPath, oldWebpPath, BUCKET_NAME);
                log.info('Old image files deleted');
            }
        } else if (!keepImage && (!originalFilePath && !webpFilePath)) {
            // Only throw error if we're both:
            // 1. Not keeping the current image (keepImage is false) AND
            // 2. There's no existing image paths
            return { success: false, message: 'Coloring page must have an image' };
        }

        // 2. Update Database Record
        log.info('Updating coloring page in database...');
            const { error: updateError } = await supabase
            .from(Constants.COLORING_PAGES_TABLE)
            .update({
                title,
                description,
                image_url: originalFilePath,
                webp_image_url: webpFilePath
            })
            .eq('id', pageId);

            if (updateError) {
            // Roll back new uploads
            for (const file of newUploadedFiles) {
                await imageService.deleteImageFiles(
                    file.path === originalFilePath ? file.path : null, 
                    file.path === webpFilePath ? file.path : null, 
                    BUCKET_NAME
                );
            }
            
            return { 
                success: false, 
                message: `Database error: ${updateError.message}` 
            };
        }
        
        // 3. Update Categories (delete and reinsert approach)
        if (categoryIds.length > 0) {
            // First delete existing category links
            await supabase
                .from(Constants.COLORING_PAGE_CATEGORY_TABLE)
                .delete()
                .eq('coloring_page_id', pageId);
                
            // Then insert new category links
            const categoryLinks = categoryIds.map(categoryId => ({
                coloring_page_id: pageId,
                category_id: categoryId
            }));
            
            const { error: categoryLinkError } = await supabase
                .from(Constants.COLORING_PAGE_CATEGORY_TABLE)
                .insert(categoryLinks);
                
            if (categoryLinkError) {
                log.error({ error: categoryLinkError }, 'Error updating category links');
                // We don't roll back the main update for this secondary operation
            }
        }
        
        // 4. Update Tags (delete and reinsert approach)
        // Delete existing tag links
        await supabase
            .from(Constants.COLORING_PAGE_TAG_TABLE)
            .delete()
            .eq('coloring_page_id', pageId);
            
        // Insert new tag links if we have tags
        if (finalTagIds.length > 0) {
            const tagLinks = finalTagIds.map(tagId => ({
                coloring_page_id: pageId,
                tag_id: tagId
            }));
            
            const { error: tagLinkError } = await supabase
                .from(Constants.COLORING_PAGE_TAG_TABLE)
                .insert(tagLinks);
                
            if (tagLinkError) {
                log.error({ error: tagLinkError }, 'Error updating tag links');
                // We don't roll back the main update for this secondary operation
            }
        }
        
        // 5. Revalidate paths
        RevalidationService.revalidateEntity('coloringPage', { 
            action: 'updateColoringPage', 
            entityId: pageId 
        });
        
        log.info('Coloring page updated successfully');
        return { success: true, message: 'Coloring page updated successfully' };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error updating coloring page');
        
        // Roll back new uploads
        for (const file of newUploadedFiles) {
            await imageService.deleteImageFiles(
                file.path === originalFilePath ? file.path : null, 
                file.path === webpFilePath ? file.path : null, 
                BUCKET_NAME
            );
        }
        
        return { 
            success: false, 
            message: `Unexpected error: ${err.message || 'Unknown error'}` 
        };
    }
}

/**
 * Gets a coloring page for editing
 */
export async function getColoringPageForEdit(pageId: string) {
    const log = logger.child({ action: 'getColoringPageForEdit', pageId });
    
    if (!pageId) {
        log.warn('Called with no pageId');
        return null;
    }

    log.info('Fetching coloring page data for editing');

    try {
        // Fetch the coloring page with its categories and tags
        const { data: pageData, error: pageError } = await supabase
            .from(Constants.COLORING_PAGES_TABLE)
            .select(`
                id,
                title,
                description,
                image_url,
                webp_image_url,
                created_at
            `)
            .eq('id', pageId)
            .single();

        if (pageError || !pageData) {
            log.error({ error: pageError }, 'Error fetching coloring page data');
            return null;
        }
        
        // Fetch categories for this page
        const { data: categoriesData } = await supabase
            .from(Constants.COLORING_PAGE_CATEGORY_TABLE)
            .select('category_id')
            .eq('coloring_page_id', pageId);
            
        const categoryIds = categoriesData?.map(item => item.category_id) || [];
        
        // Fetch tags for this page
        const { data: tagsData } = await supabase
            .from(Constants.COLORING_PAGE_TAG_TABLE)
            .select('tags(id, name)')
            .eq('coloring_page_id', pageId);
            
        const tags = tagsData?.map(item => item.tags) || [];
        
        log.info('Successfully fetched coloring page data for editing');
        
        return {
            ...pageData,
            categoryIds,
            tags
        };

    } catch (err) {
        log.error({ error: err }, 'Unexpected error fetching coloring page');
        return null;
    }
}