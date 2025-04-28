'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export type Tag = {
  id: string;
  name: string;
  created_at: string;
};

/**
 * Fetches all tags from the database, ordered by name.
 */
export async function getTags(): Promise<Tag[]> {
  console.log('Fetching all tags...');
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error.message);
      throw new Error(`Database error fetching tags: ${error.message}`);
    }

    console.log(`Fetched ${data?.length ?? 0} tags.`);
    return (data || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        created_at: tag.created_at
    })) as Tag[];

  } catch (err) {
    console.error('Unexpected error fetching tags:', err);
    throw new Error('Failed to fetch tags.');
  }
}

/**
 * Creates a new tag in the database.
 */
export async function createTag(formData: FormData): Promise<{ success: boolean; message: string }> {
  // ... (createTag function remains the same) ...
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
    return { success: true, message: `Tag "${tagName}" created successfully.` };

  } catch (err) {
    console.error('Unexpected error creating tag:', err);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

/**
 * Updates an existing tag's name.
 */
export async function updateTag(tagId: number, newName: string): Promise<{ success: boolean; message: string }> {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { success: false, message: 'Tag name cannot be empty.' };
  }
  if (tagId <= 0) {
     return { success: false, message: 'Invalid Tag ID.' };
  }

  console.log(`Attempting to update tag ID ${tagId} to name: "${trimmedName}"`);

  try {
    const { error } = await supabase
      .from('tags')
      .update({ name: trimmedName })
      .eq('id', tagId);

    if (error) {
      console.error(`Error updating tag ID ${tagId}:`, error.message);
      if (error.code === '23505') { // Handle potential duplicate name error on update
        return { success: false, message: `Another tag with the name "${trimmedName}" already exists.` };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log(`Tag ID ${tagId} updated successfully.`);
    revalidatePath('/admin/tags'); // Revalidate the list page
    revalidatePath('/admin'); // Revalidate main admin if needed
    return { success: true, message: 'Tag updated successfully.' };

  } catch (err) {
    console.error(`Unexpected error updating tag ID ${tagId}:`, err);
    return { success: false, message: 'An unexpected error occurred during update.' };
  }
}

/**
 * Deletes a tag from the database.
 * Note: This might fail if the tag is referenced by foreign keys (e.g., in image_tags)
 * unless cascading delete is set up in the database.
 */
export async function deleteTag(tagId: number): Promise<{ success: boolean; message: string }> {
   if (tagId <= 0) {
     return { success: false, message: 'Invalid Tag ID.' };
  }
  console.log(`Attempting to delete tag ID ${tagId}`);

  try {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error(`Error deleting tag ID ${tagId}:`, error.message);
      // Handle foreign key constraint errors (e.g., code '23503')
      if (error.code === '23503') {
          return { success: false, message: 'Cannot delete tag because it is still linked to images.' };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log(`Tag ID ${tagId} deleted successfully.`);
    revalidatePath('/admin/tags'); // Revalidate the list page
    revalidatePath('/admin'); // Revalidate main admin if needed
    return { success: true, message: 'Tag deleted successfully.' };

  } catch (err) {
    console.error(`Unexpected error deleting tag ID ${tagId}:`, err);
    return { success: false, message: 'An unexpected error occurred during deletion.' };
  }
} 