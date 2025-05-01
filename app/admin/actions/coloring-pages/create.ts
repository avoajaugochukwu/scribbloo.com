'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp'; // Import sharp
import path from 'path'; // Import path for filename manipulation

import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';
import { findOrCreateTags } from './utils';

/**
 * Creates a new image record, uploads the original file, converts it to WebP,
 * uploads the WebP version, finds/creates tags, and links categories/tags.
 * Accepts previous state for useFormState compatibility.
 */
export async function createColoringPage(
    previousState: { success: boolean; message: string; imageId?: string },
    formData: FormData
): Promise<{ success: boolean; message: string; imageId?: string }> {
    console.log('formData for create:', formData);
    const title = formData.get('title')?.toString().trim() || null;
    const description = formData.get('description')?.toString().trim() || null;
    const imageFile = formData.get('imageFile') as File | null;
    const categoryIds = formData.getAll('categoryIds').map(id => id.toString()); // Expecting UUIDs
    // Get comma-separated tags string instead of IDs
    const tagsInput = formData.get('tagsInput')?.toString() || '';

    if (!imageFile || imageFile.size === 0) {
        return { success: false, message: 'Image file is required.' };
    }
    if (!imageFile.type.startsWith('image/')) {
        return { success: false, message: 'Invalid file type. Please upload an image.' };
    }

    const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;
    let originalFilePath: string | null = null; // Path for the original uploaded file
    let webpFilePath: string | null = null; // Path for the generated WebP file
    let newImageId: string | null = null;
    let finalTagIds: string[] = []; // To store IDs after find/create

    // --- Consolidated Rollback Function ---
    const performRollback = async (step: string, errorDetails: any) => {
        console.error(`Error during ${step}:`, errorDetails);
        console.log(`Attempting rollback. Image ID: ${newImageId}, Original Path: ${originalFilePath}, WebP Path: ${webpFilePath}`);

        // Delete database records first
        if (newImageId) {
            try {
                // Delete links first (optional, cascade delete might handle this)
                await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).delete().eq('coloring_page_id', newImageId);
                await supabase.from(Constants.COLORING_PAGE_CATEGORY_TABLE).delete().eq('coloring_page_id', newImageId);
                // Delete image record
                await supabase.from(Constants.COLORING_PAGES_TABLE).delete().eq('id', newImageId);
                console.log(`Deleted database record for image ID: ${newImageId}`);
            } catch (dbDeleteError) {
                console.error(`Error during database rollback for ID ${newImageId}:`, dbDeleteError);
            }
        }

        // Delete storage files
        const deletePromises = [];
        if (originalFilePath) {
            deletePromises.push(deleteStorageFile(BUCKET_NAME, originalFilePath));
        }
        if (webpFilePath) {
            deletePromises.push(deleteStorageFile(BUCKET_NAME, webpFilePath));
        }

        if (deletePromises.length > 0) {
            const results = await Promise.allSettled(deletePromises);
            results.forEach((result, index) => {
                const filePath = index === 0 && originalFilePath ? originalFilePath : webpFilePath;
                if (result.status === 'fulfilled') {
                    console.log(`Deleted storage file: ${filePath}`);
                } else {
                    console.error(`Failed to delete storage file ${filePath}:`, result.reason);
                }
            });
        }

        const message = errorDetails instanceof Error ? errorDetails.message : String(errorDetails);
        return { success: false, message: `Failed during ${step}: ${message}` };
    };
    // --- End Rollback Function ---

    try {
        // 1. Upload original file using the utility function
        console.log(`Uploading original file "${imageFile.name}" to bucket "${BUCKET_NAME}"...`);
        const uploadResult = await uploadStorageFile(BUCKET_NAME, imageFile);

        if (!uploadResult.path || uploadResult.error) {
            console.error(`Error uploading original image: ${uploadResult.error}`);
            // No files uploaded yet, so no storage rollback needed here
            return { success: false, message: `Failed during Original Storage Upload: ${uploadResult.error || 'Unknown upload error'}` };
        }
        originalFilePath = uploadResult.path;
        console.log('Original file uploaded successfully, path:', originalFilePath);

        // 2. Convert to WebP and Upload
        console.log('Converting image to WebP...');
        try {
            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
            const webpBuffer = await sharp(imageBuffer).webp().toBuffer();

            // Generate WebP filename based on the original uploaded path
            const parsedPath = path.parse(originalFilePath);
            // Ensure the path is treated correctly (remove leading slash if present for join)
            const dir = parsedPath.dir.startsWith('/') ? parsedPath.dir.substring(1) : parsedPath.dir;
            webpFilePath = path.join(dir, `${parsedPath.name}.webp`).replace(/\\/g, '/'); // Use forward slashes for storage path

            console.log(`Uploading WebP version to: ${webpFilePath}`);
            const { error: webpUploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(webpFilePath, webpBuffer, {
                    contentType: 'image/webp',
                    upsert: false, // Don't overwrite if somehow exists
                });

            if (webpUploadError) {
                console.error('Error uploading WebP image:', webpUploadError);
                // Rollback only the original file upload
                return await performRollback('WebP Storage Upload', webpUploadError);
            }
            console.log('WebP file uploaded successfully.');

        } catch (conversionError: any) {
            console.error('Error during image conversion or WebP upload:', conversionError);
            // Rollback the original file upload
            return await performRollback('Image Conversion/WebP Upload', conversionError);
        }

        // --- Parse Tags Input ---
        const tagNames = tagsInput.split(',')
                             .map(tag => tag.trim())
                             .filter(Boolean); // Remove empty strings resulting from trailing commas etc.
        console.log('Parsed tag names from input:', tagNames);
        // --- End Parse Tags Input ---

        // 3. Find or Create Tags
        console.log('Finding or creating tags...');
        const tagsResult = await findOrCreateTags(tagNames);
        if (tagsResult.error) {
            // Rollback both original and WebP uploads
            return await performRollback('Tag Processing', tagsResult.error);
        }
        finalTagIds = tagsResult.tagIds;
        console.log('Tags processed successfully, IDs:', finalTagIds);

        // 4. Insert image metadata into the 'coloring_pages' table
        console.log('Inserting image metadata into database...');
        const { data: imageInsertData, error: imageInsertError } = await supabase
          .from(Constants.COLORING_PAGES_TABLE)
          .insert([{
              title: title,
              description: description,
              image_url: originalFilePath, // Use the path from the original upload result
              webp_image_url: webpFilePath // Add the WebP path
          }])
          .select('id')
          .single();

        if (imageInsertError || !imageInsertData) {
          console.error('Error inserting image metadata:', imageInsertError);
          // Rollback both original and WebP uploads
          return await performRollback('Database Insert', imageInsertError || 'Unknown DB error');
        }

        newImageId = imageInsertData.id;
        console.log(`Image metadata inserted successfully, ID: ${newImageId}`);

        // --- Inner Try/Catch for Linking ---
        try {
            // 5. Link categories
            if (categoryIds.length > 0) {
                console.log(`Linking ${categoryIds.length} categories...`);
                const categoryLinks = categoryIds.map(categoryId => ({
                    coloring_page_id: newImageId,
                    category_id: categoryId
                }));
                const { error: categoryLinkError } = await supabase.from(Constants.COLORING_PAGE_CATEGORY_TABLE).insert(categoryLinks);
                if (categoryLinkError) throw categoryLinkError; // Let outer catch handle rollback
                console.log('Categories linked successfully.');
            }

            // 6. Link tags (using the finalTagIds)
            if (finalTagIds.length > 0) {
                console.log(`Linking ${finalTagIds.length} tags...`);
                const tagLinks = finalTagIds.map(tagId => ({
                    coloring_page_id: newImageId,
                    tag_id: tagId
                }));
                const { error: tagLinkError } = await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).insert(tagLinks);
                if (tagLinkError) throw tagLinkError; // Let outer catch handle rollback
                console.log('Tags linked successfully.');
            }
        } catch (linkError: any) {
            console.error('Error linking categories/tags:', linkError);
            // Rollback database insert and both file uploads
            // The performRollback function now handles all necessary cleanup
            return await performRollback('Category/Tag Linking', linkError);
        }
        // --- End Inner Try/Catch ---

        // 7. Revalidate paths (Only reached if all steps succeed)
        console.log('Revalidating paths...');
        revalidatePath('/admin');
        revalidatePath('/admin/coloring-pages/create');
        revalidatePath('/admin/coloring-pages/edit', 'layout');
        revalidatePath('/coloring-pages', 'layout');

        return { success: true, message: 'Coloring Page created successfully!', imageId: newImageId ?? undefined };

    } catch (err: any) {
        // Catch unexpected errors from phases before linking (e.g., tag processing, DB insert)
        console.error('Unexpected error during image creation process:', err);
        // Rollback based on what might have succeeded (files uploaded, potentially DB record)
        return await performRollback('Unexpected Error', err);
    }
} 