'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Deletes a tag from the database.
 */
export async function deleteTag(tagId: string): Promise<{ success: boolean; message: string }> {
    if (!tagId) {
        return { success: false, message: 'Tag ID is missing.' };
    }

    console.log(`Attempting to delete tag ID: ${tagId}`);

    try {
        const { error } = await supabase
            .from(Constants.TAGS_TABLE)
            .delete()
            .eq('id', tagId);

        if (error) {
            console.error(`Error deleting tag ${tagId}:`, error.message);
             if (error.code === '23503') { // Example foreign key violation code
                 return { success: false, message: `Cannot delete tag because it is linked to one or more images.` };
            }
            return { success: false, message: `Database error: ${error.message}` };
        }

        console.log(`Tag ${tagId} deleted successfully.`);
        revalidatePath('/admin/tags');
        revalidatePath('/admin');
        revalidatePath('/admin/images/create');
        revalidatePath('/admin/images/edit', 'layout');

        return { success: true, message: 'Tag deleted successfully.' };

    } catch (err: any) {
        console.error(`Unexpected error deleting tag ${tagId}:`, err);
        return { success: false, message: `An unexpected error occurred: ${err.message}` };
    }
} 