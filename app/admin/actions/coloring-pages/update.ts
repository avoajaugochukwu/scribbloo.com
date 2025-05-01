'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp'; // Import sharp
import path from 'path'; // Import path

// Import shared helpers
import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';
import ColoringPage from '@/types/coloringpage.type';
import { Constants } from '@/config/constants';

// Define the bucket name for coloring images
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

    // --- Validation ---
    if (!coloringPageId) return { success: false, message: 'Coloring page ID is missing.' };
    if (!title) return { success: false, message: 'Title is required.' };
    if (newImageFile && newImageFile.size > 0 && !newImageFile.type.startsWith('image/')) {
        return { success: false, message: 'Invalid file type for new image. Please upload an image.' };
    }
    // --- End Validation ---

    console.log(`Attempting to update coloring page ID: ${coloringPageId}`);

    let oldOriginalImagePath: string | null = null;
    let oldWebpPath: string | null = null;
    let newOriginalImagePath: string | null = null;
    let newWebpPath: string | null = null;
    let pathsChanged = false; // Flag to track if file paths will change

    // --- Rollback Function for New Files ---
    // Note: Rollback might be less critical if upserting, but still good for unexpected errors
    const rollbackNewFiles = async () => {
        // Only attempt rollback if paths actually changed, otherwise upsert might have overwritten anyway
        if (pathsChanged) {
            console.log('Rolling back newly uploaded files (paths changed)...');
            const deletePromises = [];
            if (newOriginalImagePath) {
                deletePromises.push(deleteStorageFile(COLORING_PAGES_BUCKET, newOriginalImagePath));
            }
            if (newWebpPath) {
                deletePromises.push(deleteStorageFile(COLORING_PAGES_BUCKET, newWebpPath));
            }
            if (deletePromises.length > 0) {
                await Promise.allSettled(deletePromises);
                console.log('Finished attempting rollback of new files.');
            }
        } else {
             console.log('Skipping new file rollback as paths did not change (upsert used).');
        }
    };
    // --- End Rollback Function ---

    try {
        // 1. Fetch current image data to get old image paths AND other fields for comparison
        console.log(`Fetching current data for coloring page ID: ${coloringPageId}`);
        const { data: currentImage, error: fetchError } = await supabase
            .from(COLORING_PAGES_TABLE)
            // Select title and description along with the paths
            .select('title, description, image_url, webp_image_url')
            .eq('id', coloringPageId)
            .single();

        if (fetchError || !currentImage) {
            console.error(`Error fetching current coloring page ${coloringPageId}:`, fetchError);
            return { success: false, message: 'Could not find the coloring page to update.' };
        }
        oldOriginalImagePath = currentImage.image_url;
        oldWebpPath = currentImage.webp_image_url;
        console.log(`Old paths - Original: ${oldOriginalImagePath}, WebP: ${oldWebpPath}`);

        // 2. Handle NEW Image Upload (if provided)
        if (newImageFile && newImageFile.size > 0) {
            console.log(`New image file "${newImageFile.name}" provided. Processing...`);

            // --- Determine Target Paths based on title/slug ---
            // You'll need your slug generation logic here. Assuming a simple example:
            // const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            // For simplicity, we'll use the existing uploadStorageFile which generates UUID paths.
            // If you want slug-based paths, you'll need to modify uploadStorageFile or handle path generation here.
            // For now, we proceed assuming uploadStorageFile handles path generation.

            // 2a. Upload new original image with upsert: true
            // Pass true as the third argument to enable upsert
            const uploadResult = await uploadStorageFile(COLORING_PAGES_BUCKET, newImageFile, true);
            if (uploadResult.error || !uploadResult.path) {
                console.error('Error uploading new original image:', uploadResult.error);
                return { success: false, message: `New image upload failed: ${uploadResult.error}` };
            }
            newOriginalImagePath = uploadResult.path;
            console.log(`New original image uploaded to: ${newOriginalImagePath} (upsert=true)`);

            // Check if the path changed compared to the old one
            if (newOriginalImagePath !== oldOriginalImagePath) {
                pathsChanged = true;
            }

            // 2b. Convert and upload new WebP image with upsert: true
            try {
                const imageBuffer = Buffer.from(await newImageFile.arrayBuffer());
                const webpBuffer = await sharp(imageBuffer).webp().toBuffer();

                const parsedPath = path.parse(newOriginalImagePath);
                const dir = parsedPath.dir.startsWith('/') ? parsedPath.dir.substring(1) : parsedPath.dir;
                newWebpPath = path.join(dir, `${parsedPath.name}.webp`).replace(/\\/g, '/');

                console.log(`Uploading new WebP version to: ${newWebpPath} (upsert=true)`);
                const { error: webpUploadError } = await supabase.storage
                    .from(COLORING_PAGES_BUCKET)
                    .upload(newWebpPath, webpBuffer, {
                        contentType: 'image/webp',
                        upsert: true, // Use upsert: true here as well
                    });

                if (webpUploadError) {
                    console.error('Error uploading new WebP image:', webpUploadError);
                    // Attempt rollback only if original path changed
                    if (pathsChanged) {
                         await deleteStorageFile(COLORING_PAGES_BUCKET, newOriginalImagePath);
                    }
                    return { success: false, message: `Failed to upload WebP version: ${webpUploadError.message}` };
                }
                console.log('New WebP image uploaded successfully.');

                // Check if the webp path changed
                if (newWebpPath !== oldWebpPath) {
                    pathsChanged = true; // Set flag if either path changed
                }

            } catch (conversionError: any) {
                console.error('Error during image conversion or WebP upload:', conversionError);
                 // Attempt rollback only if original path changed
                 if (pathsChanged) {
                      await deleteStorageFile(COLORING_PAGES_BUCKET, newOriginalImagePath);
                 }
                return { success: false, message: `Image conversion/WebP upload failed: ${conversionError.message}` };
            }
        } else {
            console.log('No new image file provided.');
        }

        // 3. Prepare data for DB update
        const updateData: Partial<ColoringPage> = {
            title: title,
            description: description || null,
            // Conditionally add image URLs ONLY if a new image was successfully processed
            ...(newOriginalImagePath && { image_url: newOriginalImagePath }),
            ...(newWebpPath && { webp_image_url: newWebpPath }),
        };

        // Check if there's anything to update besides links
        // Only include fields that actually changed from the fetched `currentImage` data
        // (This prevents unnecessary DB updates if only links changed) - Optional optimization
        const hasDataUpdates = (updateData.title !== currentImage.title) ||
                               (updateData.description !== (currentImage.description || null)) || // Handle null description
                               (newOriginalImagePath && newOriginalImagePath !== oldOriginalImagePath) ||
                               (newWebpPath && newWebpPath !== oldWebpPath);


        // 4. Update Image Record in Database (if necessary)
        if (hasDataUpdates) {
            console.log('Updating coloring page record in database with data:', updateData);
            const { error: updateError } = await supabase
                .from(COLORING_PAGES_TABLE)
                .update(updateData)
                .eq('id', coloringPageId);

            if (updateError) {
                console.error('Error updating coloring page record:', updateError.message);
                // Rollback new files only if paths actually changed
                await rollbackNewFiles();
                return { success: false, message: `Database update error: ${updateError.message}` };
            }
            console.log('Database record updated successfully.');
        } else {
            console.log('No changes to title, description, or image path. Skipping main record update.');
        }


        // 5. Update Links using RPC (always run if categories/tags might have changed)
        console.log('Updating coloring page category/tag links via RPC...');
        const { error: rpcError } = await supabase.rpc('update_coloring_page_links', {
            p_coloring_page_id: coloringPageId,
            p_category_ids: categoryIds,
            p_tag_ids: tagIds,
        });

        if (rpcError) {
            console.error('Error updating coloring page links via RPC:', rpcError);
            // If links fail, the main data (and potentially new files) are already updated/upserted.
            // Don't rollback file changes here. Report the link error.
            return { success: false, message: `Coloring page details updated, but failed to update links: ${rpcError.message}` };
        }
        console.log('Category/tag links updated successfully via RPC.');

        // 6. Delete OLD images from storage ONLY IF their paths changed
        if (pathsChanged) { // Only delete if paths are different
            console.log("Paths changed, attempting to delete old files...");
            const deleteOldPromises = [];
            // Check oldOriginalImagePath before attempting delete
            if (oldOriginalImagePath && oldOriginalImagePath !== newOriginalImagePath) {
                console.log(`Attempting to delete old original image: ${oldOriginalImagePath}`);
                deleteOldPromises.push(deleteStorageFile(COLORING_PAGES_BUCKET, oldOriginalImagePath));
            }
             // Check oldWebpPath before attempting delete
            if (oldWebpPath && oldWebpPath !== newWebpPath) {
                console.log(`Attempting to delete old WebP image: ${oldWebpPath}`);
                deleteOldPromises.push(deleteStorageFile(COLORING_PAGES_BUCKET, oldWebpPath));
            }

            if (deleteOldPromises.length > 0) {
                const results = await Promise.allSettled(deleteOldPromises);
                console.log('Old file deletion results:', results);
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        // Determine which path failed based on the promises pushed
                        let failedPath = 'unknown';
                        if (index === 0 && oldOriginalImagePath && oldOriginalImagePath !== newOriginalImagePath) failedPath = oldOriginalImagePath;
                        else if (oldWebpPath && oldWebpPath !== newWebpPath) failedPath = oldWebpPath; // This assumes webp is second if original exists

                        console.warn(`Failed to delete old storage file ${failedPath}:`, result.reason);
                    }
                });
            } else {
                 console.log("No old files needed deletion (paths matched or old paths were null).");
            }
        } else if (newImageFile && newImageFile.size > 0) {
             console.log("Paths did not change, old files were overwritten by upsert.");
        }

        // 7. Success - Revalidate Paths
        console.log(`Coloring page "${title}" (ID: ${coloringPageId}) updated successfully.`);
        revalidatePath('/admin');
        revalidatePath(`/admin/coloring-pages/edit/${coloringPageId}`);
        revalidatePath('/admin/coloring-pages', 'layout'); // Revalidate list page
        revalidatePath('/coloring-pages', 'layout'); // Revalidate public pages

        return { success: true, message: `Coloring page "${title}" updated successfully.` };

    } catch (err: any) {
        console.error('Unexpected error updating coloring page:', err);
        // Attempt cleanup of NEW files only if paths changed
        await rollbackNewFiles();
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return { success: false, message };
    }
}

// ... getColoringPageForEdit function ... 