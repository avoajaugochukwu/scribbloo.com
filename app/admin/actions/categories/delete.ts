'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Deletes a category from the database.
 */
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
    if (!categoryId) {
        return { success: false, message: 'Category ID is missing.' };
    }

    console.log(`Attempting to delete category ID: ${categoryId}`);

    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) {
            console.error(`Error deleting category ${categoryId}:`, error.message);
            if (error.code === '23503') { // Example foreign key violation code
                 return { success: false, message: `Cannot delete category because it is linked to one or more images.` };
            }
            return { success: false, message: `Database error: ${error.message}` };
        }

        console.log(`Category ${categoryId} deleted successfully.`);
        revalidatePath('/admin/categories');
        revalidatePath('/admin');
        revalidatePath('/admin/images/create');
        revalidatePath('/admin/images/edit', 'layout');

        return { success: true, message: 'Category deleted successfully.' };

    } catch (err: any) {
        console.error(`Unexpected error deleting category ${categoryId}:`, err);
        return { success: false, message: `An unexpected error occurred: ${err.message}` };
    }
} 