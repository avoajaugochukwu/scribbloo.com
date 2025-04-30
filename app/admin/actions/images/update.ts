'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Import shared helpers
import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';
import ImageType from '@/types/image.type';
import { Constants } from '@/config/constants';

// Define the bucket name for coloring images
const IMAGE_BUCKET = Constants.SUPABASE_COLORING_IMAGES_NAME;

/**
 * Updates an existing image's title and its category/tag associations using a DB function.
 * Does NOT handle image file replacement.
 */
export async function updateImage(formData: FormData): Promise<{ success: boolean; message: string }> {
    const imageId = formData.get('imageId')?.toString();
    const title = formData.get('title')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const categoryIds = formData.getAll('categoryIds') as string[];
    const tagIds = formData.getAll('tagIds') as string[];
    // Get the NEW image file (if provided)
    const newImageFile = formData.get('imageFile') as File | null;

    // --- Validation ---
    if (!imageId) return { success: false, message: 'Image ID is missing.' };
    if (!title) return { success: false, message: 'Title is required.' };
    // File is optional for update
    // --- End Validation ---

    console.log(`Attempting to update image ID: ${imageId}`);

    let oldImagePath: string | null = null;
    let newImagePath: string | null = null;

    try {
        // 1. Fetch current image data to get old image path
        const { data: currentImage, error: fetchError } = await supabase
            .from('images')
            .select('image_url') // Select only the path
            .eq('id', imageId)
            .single();

        if (fetchError || !currentImage) {
            console.error(`Error fetching current image ${imageId}:`, fetchError);
            return { success: false, message: 'Could not find the image to update.' };
        }
        oldImagePath = currentImage.image_url;

        // 2. Upload NEW Image (if provided)
        if (newImageFile && newImageFile.size > 0) {
            const uploadResult = await uploadStorageFile(IMAGE_BUCKET, newImageFile);
            if (uploadResult.error || !uploadResult.path) {
                return { success: false, message: `New image upload failed: ${uploadResult.error}` };
            }
            newImagePath = uploadResult.path; // Store path for DB update
        }

        // 3. Prepare data for DB update (only text fields initially)
        // We handle image_url update separately if needed
        const updateData: Partial<ImageType> = { // Use your ImageType here
            title: title,
            description: description || null,
            // Conditionally add image_url ONLY if a new one was uploaded
            ...(newImagePath && { image_url: newImagePath }),
        };

        // 4. Update Image Record (text fields and potentially image_url)
        console.log('Updating image record in database...');
        const { error: updateError } = await supabase
            .from('images')
            .update(updateData)
            .eq('id', imageId);

        if (updateError) {
            console.error('Error updating image record:', updateError.message);
            // Rollback: Delete NEWLY uploaded file if DB update fails
            if (newImagePath) await deleteStorageFile(IMAGE_BUCKET, newImagePath);
            console.log('Rolled back NEW storage upload due to DB update error.');
            return { success: false, message: `Database update error: ${updateError.message}` };
        }

        // 5. Update Links using RPC (after main record update succeeds)
        console.log('Updating image category/tag links via RPC...');
        const { error: rpcError } = await supabase.rpc('update_image_links', {
            p_image_id: imageId,
            p_category_ids: categoryIds,
            p_tag_ids: tagIds,
        });

        if (rpcError) {
            console.error('Error updating image links via RPC:', rpcError);
            // This is tricky. The main record updated, but links failed.
            // Should we try to rollback the main update? Or just report the link error?
            // Reporting the error is usually sufficient. The core data is updated.
            // We also don't rollback the file upload/delete here as the main record IS updated.
            return { success: false, message: `Image details updated, but failed to update links: ${rpcError.message}` };
        }

        // 6. Delete OLD image from storage (only after successful DB update AND if a new image was uploaded)
        if (newImagePath && oldImagePath) {
            console.log(`DB updated with new image, attempting to delete old image: ${oldImagePath}`);
            await deleteStorageFile(IMAGE_BUCKET, oldImagePath);
        }

        // 7. Success - Revalidate Paths
        console.log(`Image "${title}" (ID: ${imageId}) updated successfully.`);
        revalidatePath('/admin');
        revalidatePath(`/admin/images/edit/${imageId}`);
        // Revalidate relevant public pages if necessary
        // revalidatePath('/coloring-pages', 'layout');

        return { success: true, message: `Image "${title}" updated successfully.` };

    } catch (err: any) {
        console.error('Unexpected error updating image:', err);
        // Attempt cleanup of NEW file in case of unexpected errors before DB update attempt
        if (newImagePath) await deleteStorageFile(IMAGE_BUCKET, newImagePath).catch(e => console.error("Unexpected error cleanup failed (image):", e));
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return { success: false, message };
    }
}

// ... getImageForEdit function ... 