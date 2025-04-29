'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { type Category } from './types'; // Assuming Category type is defined here

/**
 * Updates an existing category in the database.
 * Note: Does not update the slug automatically.
 */
export async function updateCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
    const categoryId = formData.get('categoryId')?.toString();
    const categoryName = formData.get('categoryName')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const seoTitle = formData.get('seoTitle')?.toString().trim();
    const seoDescription = formData.get('seoDescription')?.toString().trim();
    const heroImageUrl = formData.get('heroImageUrl')?.toString().trim();
    const thumbnailImageUrl = formData.get('thumbnailImageUrl')?.toString().trim();

    // --- Server-side Validation ---
    if (!categoryId) {
        return { success: false, message: 'Category ID is missing.' };
    }
    if (!categoryName) {
        return { success: false, message: 'Category name is required.' };
    }
    if (!description) {
        return { success: false, message: 'Description is required.' };
    }
    if (!seoTitle) {
        return { success: false, message: 'SEO Title is required.' };
    }
    if (!seoDescription) {
        return { success: false, message: 'SEO Description is required.' };
    }
    if (!heroImageUrl) {
        return { success: false, message: 'Hero Image URL is required.' };
    }
    if (!thumbnailImageUrl) {
        return { success: false, message: 'Thumbnail Image URL is required.' };
    }
    // --- End Validation ---

    console.log(`Attempting to update category ID: ${categoryId}`);

    try {
        const { error } = await supabase
            .from('categories')
            .update({
                name: categoryName,
                description: description,
                seo_title: seoTitle,
                seo_description: seoDescription,
                hero_image_url: heroImageUrl,
                thumbnail_image_url: thumbnailImageUrl,
                // slug is intentionally NOT updated here
            })
            .eq('id', categoryId); // Ensure we only update the specific category

        if (error) {
            console.error('Error updating category:', error.message);
            // Handle potential unique constraint violations (duplicate name)
            if (error.code === '23505' && error.message.includes('categories_name_key')) {
                return { success: false, message: `Category name "${categoryName}" already exists.` };
            }
            return { success: false, message: `Database error: ${error.message}` };
        }

        console.log(`Category "${categoryName}" (ID: ${categoryId}) updated successfully.`);

        // Revalidate paths
        revalidatePath('/admin/categories'); // List page
        revalidatePath(`/admin/categories/edit/${categoryId}`); // This edit page
        revalidatePath('/admin');
        revalidatePath('/admin/images/create');
        revalidatePath('/admin/images/edit', 'layout');
        revalidatePath('/coloring-pages', 'layout'); // Public pages

        return { success: true, message: `Category "${categoryName}" updated successfully.` };

    } catch (err) {
        console.error('Unexpected error updating category:', err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        return { success: false, message };
    }
}

/**
 * Fetches a single category for editing.
 */
export async function getCategoryForEdit(categoryId: string): Promise<Category | null> {
    if (!categoryId) return null;

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();

        if (error) {
            console.error(`Error fetching category ${categoryId} for edit:`, error);
            return null;
        }
        return data;
    } catch (err) {
        console.error(`Unexpected error fetching category ${categoryId}:`, err);
        return null;
    }
} 