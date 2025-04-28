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
    const categoryIds = formData.getAll('categoryIds').map(id => id.toString()); // UUIDs
    const tagIds = formData.getAll('tagIds').map(id => id.toString()); // UUIDs

    if (!imageId) {
        return { success: false, message: 'Image ID is missing.' };
    }

    console.log(`Attempting to update image ID: ${imageId}`);
    console.log(`New Title: ${title}`);
    console.log(`New Category IDs: ${categoryIds}`);
    console.log(`New Tag IDs: ${tagIds}`);

    try {
        // Use the existing database function 'update_image_with_relations'
        const { error: transactionError } = await supabase.rpc('update_image_with_relations', {
            p_image_id: imageId,
            p_title: title,
            p_category_ids: categoryIds,
            p_tag_ids: tagIds
        });

        if (transactionError) {
             console.error(`Error during image update transaction (ID: ${imageId}):`, transactionError);
             throw new Error(`Database transaction failed: ${transactionError.message}`);
        }

        console.log(`Image ID ${imageId} updated successfully.`);

        // Revalidate relevant paths
        revalidatePath('/admin');
        revalidatePath(`/admin/images/edit/${imageId}`);

        return { success: true, message: 'Image updated successfully!' };

    } catch (err: any) {
        console.error(`Unexpected error updating image (ID: ${imageId}):`, err);
        return { success: false, message: `Update failed: ${err.message}` };
    }
} 