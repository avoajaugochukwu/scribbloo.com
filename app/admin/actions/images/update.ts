'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Updates an existing image's title and its category/tag associations using a DB function.
 * Does NOT handle image file replacement.
 */
export async function updateImage(formData: FormData): Promise<{ success: boolean; message: string }> {
    const imageId = formData.get('imageId')?.toString();
    const title = formData.get('title')?.toString().trim() || null;
    const description = formData.get('description')?.toString().trim() || null;
    const categoryIds = formData.getAll('categoryIds').map(id => id.toString()); // UUIDs
    const tagIds = formData.getAll('tagIds').map(id => id.toString()); // UUIDs

    if (!imageId) {
        return { success: false, message: 'Image ID is missing.' };
    }

    console.log(`Updating image ${imageId} with title: ${title}, description: ${description}`);
    console.log(`New category IDs: ${categoryIds.join(', ')}`);
    console.log(`New tag IDs: ${tagIds.join(', ')}`);

    try {
        // 1. Update basic image details (title, description)
        const { error: updateError } = await supabase
            .from('images')
            .update({
                title: title,
                description: description
            })
            .eq('id', imageId);

        if (updateError) {
            console.error(`Error updating image details for ${imageId}:`, updateError);
            throw new Error(`Failed to update image details: ${updateError.message}`);
        }
        console.log(`Image details updated for ${imageId}.`);

        // --- Transaction for Link Updates ---
        const { error: transactionError } = await supabase.rpc('update_image_links', {
            p_image_id: imageId,
            p_category_ids: categoryIds,
            p_tag_ids: tagIds
        });

        if (transactionError) {
            console.error(`Error updating links via RPC for image ${imageId}:`, transactionError);
            throw new Error(`Failed to update image links: ${transactionError.message}`);
        }
        console.log(`Image links updated successfully for ${imageId} via RPC.`);
        // --- End Transaction ---

        // Revalidate relevant paths
        revalidatePath('/admin');
        revalidatePath(`/admin/images/edit/${imageId}`);
        revalidatePath('/blog', 'layout');
        revalidatePath('/', 'layout');

        return { success: true, message: 'Image updated successfully.' };

    } catch (error: any) {
        console.error(`General error updating image ${imageId}:`, error);
        return { success: false, message: error.message || 'An unexpected error occurred during update.' };
    }
} 