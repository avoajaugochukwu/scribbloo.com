'use server';

import { supabase } from '@/lib/supabaseClient';
import Tag from '@/types/tag.type';

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
    // Ensure the returned data matches the Tag type
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