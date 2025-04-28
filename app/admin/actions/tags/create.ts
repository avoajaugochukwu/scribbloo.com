'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import { type Tag } from './types'; // Import type

/**
 * Creates a new tag in the database.
 */
export async function createTag(formData: FormData): Promise<{ success: boolean; message: string }> {
  const tagName = formData.get('tagName')?.toString().trim();

  if (!tagName) {
    return { success: false, message: 'Tag name cannot be empty.' };
  }

  console.log(`Attempting to create tag: "${tagName}"`);

  try {
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name: tagName }])
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error.message);
      if (error.code === '23505') {
        return { success: false, message: `Tag "${tagName}" already exists.` };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log('Tag created successfully:', data);
    revalidatePath('/admin/tags');
    revalidatePath('/admin');
    revalidatePath('/admin/images/create');
    revalidatePath('/admin/images/edit', 'layout');

    return { success: true, message: `Tag "${tagName}" created successfully.` };

  } catch (err) {
    console.error('Unexpected error creating tag:', err);
    return { success: false, message: 'An unexpected error occurred.' };
  }
} 