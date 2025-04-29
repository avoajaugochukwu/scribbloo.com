'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new category in the database.
 */
export async function createCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryName = formData.get('categoryName')?.toString().trim();

  if (!categoryName) {
    return { success: false, message: 'Category name cannot be empty.' };
  }

  console.log(`Attempting to create category: "${categoryName}"`);

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: categoryName }])
      .select()
      .single(); // Assuming you want the created record back

    if (error) {
      console.error('Error creating category:', error.message);
      // Handle potential unique constraint violation (duplicate name)
      if (error.code === '23505') { // Check Supabase error codes for uniqueness violation
        return { success: false, message: `Category "${categoryName}" already exists.` };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log('Category created successfully:', data);
    revalidatePath('/admin/categories'); // Revalidate the page showing the list
    revalidatePath('/admin'); // Revalidate admin dashboard if it shows categories
    // Also revalidate image create/edit pages if they fetch categories
    revalidatePath('/admin/images/create');
    revalidatePath('/admin/images/edit', 'layout'); // Revalidate all edit pages

    return { success: true, message: `Category "${categoryName}" created successfully.` };

  } catch (err) {
    console.error('Unexpected error creating category:', err);
    return { success: false, message: 'An unexpected error occurred.' };
  }
} 