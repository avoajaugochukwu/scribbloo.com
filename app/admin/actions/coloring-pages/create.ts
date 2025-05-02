'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { findOrCreateTags } from './utils';
import logger from '@/lib/logger';
import { ImageProcessingService } from '@/services/ImageProcessingService';
import { validateImageFiles } from '@/lib/validation';
import { RevalidationService } from '@/services/RevalidationService';

const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;

/**
 * Creates a new coloring page with image upload
 */
export async function createColoringPage(
    previousState: { success: boolean; message: string; imageId?: string },
    formData: FormData
): Promise<{ success: boolean; message: string; imageId?: string }> {
    const title = formData.get('title')?.toString().trim() || '';
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

    // Initialize image processing service
    const imageService = new ImageProcessingService({ 
        action: 'createColoringPage', 
        entityId: title 
    });
    
    let originalFilePath: string | null = null;
    let webpFilePath: string | null = null;
    let newImageId: string | null = null;
    let finalTagIds: string[] = [];

    try {
        // 1. Process and Upload Image (Original + WebP)
        const imageResult = await imageService.processAndUploadImage(imageFile!, {
            bucket: BUCKET_NAME,
            upsert: false,
            webpOnly: false  // We want both original and WebP versions
        });
        
        if (imageResult.error) {
            return { success: false, message: `Image upload failed: ${imageResult.error}` };
        }
        
        originalFilePath = imageResult.originalPath;
        webpFilePath = imageResult.webpPath;
        
        if (!originalFilePath || !webpFilePath) {
            return { success: false, message: 'Image upload failed to produce file paths' };
        }
        
        log.info({ originalPath: originalFilePath, webpPath: webpFilePath }, 'Image uploaded successfully');

        // 2. Create Tags if needed
        if (tagsInput) {
            const tagsResult = await findOrCreateTags(tagsInput.split(','));
            if (tagsResult.error) {
                // Roll back image uploads
                await imageService.deleteImageFiles(originalFilePath, webpFilePath, BUCKET_NAME);
                return { success: false, message: `Tag creation failed: ${tagsResult.error}` };
            }
            finalTagIds = tagsResult.tagIds;
            log.info({ tagIds: finalTagIds }, 'Tags processed successfully');
        }

        // 3. Insert Database Record
        log.info('Inserting coloring page record into database');
        const { data: insertData, error: insertError } = await supabase
            .from(Constants.COLORING_PAGES_TABLE)
            .insert({
                title,
                description,
                image_url: originalFilePath,
                webp_image_url: webpFilePath
            })
            .select('id')
            .single();

        if (insertError || !insertData) {
            // Roll back image uploads
            await imageService.deleteImageFiles(originalFilePath, webpFilePath, BUCKET_NAME);
            
            return { 
                success: false, 
                message: `Database error: ${insertError?.message || 'Failed to insert record'}` 
            };
        }
        
        newImageId = insertData.id;
        log.info({ imageId: newImageId }, 'Coloring page record inserted successfully');

        // 4. Link Categories and Tags
        if (categoryIds.length > 0) {
            log.info({ categoryIds }, 'Linking categories to coloring page');
            const categoryLinks = categoryIds.map(categoryId => ({
                coloring_page_id: newImageId,
                category_id: categoryId
            }));

            const { error: linkError } = await supabase
                .from(Constants.COLORING_PAGE_CATEGORY_TABLE)
                .insert(categoryLinks);

            if (linkError) {
                log.error({ error: linkError }, 'Error linking categories');
                // Note: We don't rollback the whole operation for this secondary error
            }
        }

        if (finalTagIds.length > 0) {
            log.info({ tagIds: finalTagIds }, 'Linking tags to coloring page');
            const tagLinks = finalTagIds.map(tagId => ({
                coloring_page_id: newImageId,
                tag_id: tagId
            }));

            const { error: tagLinkError } = await supabase
                .from(Constants.COLORING_PAGE_TAG_TABLE)
                .insert(tagLinks);

            if (tagLinkError) {
                log.error({ error: tagLinkError }, 'Error linking tags');
                // Note: We don't rollback for this secondary error
            }
        }

        // 5. Revalidate Paths
        RevalidationService.revalidateEntity('coloringPage', { 
            action: 'createColoringPage', 
            entityId: newImageId || '' 
        });
        
        return { 
            success: true, 
            message: 'Coloring page created successfully!',
            imageId: newImageId || ''
        };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error creating coloring page');
        
        // Rollback uploads if they exist
        if (originalFilePath || webpFilePath) {
            await imageService.deleteImageFiles(originalFilePath, webpFilePath, BUCKET_NAME);
        }
        
        return { 
            success: false, 
            message: `Unexpected error: ${err.message || 'Unknown error'}` 
        };
    }
} 