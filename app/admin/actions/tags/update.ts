'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { type Tag } from './types'; // Import type

/**
 * Updates an existing tag's name.
 */
export async function updateTag(formData: FormData): Promise<{ success: boolean; message: string }> {
    const tagId = formData.get('tagId')?.toString();
    const tagName = formData.get('tagName')?.toString().trim();

    if (!tagId) {
        return { success: false, message: 'Tag ID is missing.' };
    }
    if (!tagName) {
        return { success: false, message: 'Tag name cannot be empty.' };
    }

    console.log(`Attempting to update tag ID ${tagId} to name: "${tagName}"`);

    try {
        const { error } = await supabase
            .from('tags')
            .update({ name: tagName })
            .eq('id', tagId);

        if (error) {
            console.error(`Error updating tag ${tagId}:`, error.message);
            if (error.code === '23505') {
                return { success: false, message: `Another tag with the name "${tagName}" already exists.` };
            }
            return { success: false, message: `Database error: ${error.message}` };
        }

        console.log(`Tag ${tagId} updated successfully.`);
        revalidatePath('/admin/tags');
        revalidatePath('/admin');
        revalidatePath('/admin/images/create');
        revalidatePath('/admin/images/edit', 'layout');

        return { success: true, message: 'Tag updated successfully.' };

    } catch (err) {
        console.error(`Unexpected error updating tag ${tagId}:`, err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
} 