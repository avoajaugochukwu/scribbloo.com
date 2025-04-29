'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Updates an existing category's name.
 */
export async function updateCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
    const categoryId = formData.get('categoryId')?.toString();
    const categoryName = formData.get('categoryName')?.toString().trim();

    if (!categoryId) {
        return { success: false, message: 'Category ID is missing.' };
    }
    if (!categoryName) {
        return { success: false, message: 'Category name cannot be empty.' };
    }

    console.log(`Attempting to update category ID ${categoryId} to name: "${categoryName}"`);

    try {
        const { error } = await supabase
            .from('categories')
            .update({ name: categoryName })
            .eq('id', categoryId);

        if (error) {
            console.error(`Error updating category ${categoryId}:`, error.message);
            if (error.code === '23505') {
                return { success: false, message: `Another category with the name "${categoryName}" already exists.` };
            }
            return { success: false, message: `Database error: ${error.message}` };
        }

        console.log(`Category ${categoryId} updated successfully.`);
        revalidatePath('/admin/categories');
        revalidatePath('/admin');
        revalidatePath('/admin/images/create');
        revalidatePath('/admin/images/edit', 'layout');

        return { success: true, message: 'Category updated successfully.' };

    } catch (err) {
        console.error(`Unexpected error updating category ${categoryId}:`, err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
} 