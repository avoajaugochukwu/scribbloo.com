'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Define the type for a category
export type Category = {
  id: number;
  name: string;
  created_at: string; // Or Date if you prefer
};

/**
 * Fetches all categories from the database, ordered by name.
 */
export async function getCategories(): Promise<Category[]> {
  console.log('Fetching all categories...');
  try {
    const { data, error } = await supabase
      .from('categories') // Ensure 'categories' is your table name
      .select('id, name, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error.message);
      throw new Error(`Database error fetching categories: ${error.message}`);
    }

    console.log(`Fetched ${data?.length ?? 0} categories.`);
    // Perform mapping to ensure type consistency
    return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        created_at: cat.created_at
    })) as Category[];

  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    throw new Error('Failed to fetch categories.');
  }
}

/**
 * Creates a new category in the database.
 */
export async function createCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryName = formData.get('categoryName')?.toString().trim(); // Use 'categoryName' from the form

  if (!categoryName) {
    return { success: false, message: 'Category name cannot be empty.' };
  }

  console.log(`Attempting to create category: "${categoryName}"`);

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: categoryName }]) // Ensure 'name' is your column name
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error.message);
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, message: `Category "${categoryName}" already exists.` };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log('Category created successfully:', data);
    revalidatePath('/admin/categories'); // Revalidate this page
    revalidatePath('/admin'); // Revalidate main admin if needed
    return { success: true, message: `Category "${categoryName}" created successfully.` };

  } catch (err) {
    console.error('Unexpected error creating category:', err);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

/**
 * Updates an existing category's name.
 */
export async function updateCategory(categoryId: number, newName: string): Promise<{ success: boolean; message: string }> {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { success: false, message: 'Category name cannot be empty.' };
  }
  if (categoryId <= 0) {
     return { success: false, message: 'Invalid Category ID.' };
  }

  console.log(`Attempting to update category ID ${categoryId} to name: "${trimmedName}"`);

  try {
    const { error } = await supabase
      .from('categories')
      .update({ name: trimmedName })
      .eq('id', categoryId);

    if (error) {
      console.error(`Error updating category ID ${categoryId}:`, error.message);
      if (error.code === '23505') {
        return { success: false, message: `Another category with the name "${trimmedName}" already exists.` };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log(`Category ID ${categoryId} updated successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    return { success: true, message: 'Category updated successfully.' };

  } catch (err) {
    console.error(`Unexpected error updating category ID ${categoryId}:`, err);
    return { success: false, message: 'An unexpected error occurred during update.' };
  }
}

/**
 * Deletes a category from the database.
 * Handles foreign key constraints (e.g., if linked in image_categories).
 */
export async function deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
   if (categoryId <= 0) {
     return { success: false, message: 'Invalid Category ID.' };
  }
  console.log(`Attempting to delete category ID ${categoryId}`);

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error(`Error deleting category ID ${categoryId}:`, error.message);
      if (error.code === '23503') { // Foreign key violation
          return { success: false, message: 'Cannot delete category because it is still linked to images.' };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log(`Category ID ${categoryId} deleted successfully.`);
    revalidatePath('/admin/categories');
    revalidatePath('/admin');
    return { success: true, message: 'Category deleted successfully.' };

  } catch (err) {
    console.error(`Unexpected error deleting category ID ${categoryId}:`, err);
    return { success: false, message: 'An unexpected error occurred during deletion.' };
  }
} 