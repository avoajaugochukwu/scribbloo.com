'use server';

import { Constants } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new tag in the database.
 */
export async function createTag(formData: FormData): Promise<{ success: boolean; message: string }> {
  const tagName = formData.get('tagName')?.toString().trim();

  if (!tagName) {
    return { success: false, message: 'Tag name cannot be empty.' };
  }

  try {
    const { error } = await supabase
      .from(Constants.TAGS_TABLE)
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