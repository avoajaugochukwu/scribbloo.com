// --- Helper Function: Find or Create Tags ---
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { Constants } from '@/config/constants';
import { PostgrestError } from '@supabase/supabase-js';

export async function findOrCreateTags(tagNames: string[]): Promise<{ tagIds: string[], error?: string | PostgrestError }> {
  if (tagNames.length === 0) {
      return { tagIds: [] };
  }

  const uniqueTagNames = [...new Set(tagNames.map(name => name.trim().toLowerCase()))].filter(Boolean);
  if (uniqueTagNames.length === 0) {
      return { tagIds: [] };
  }

  console.log('Processing unique tag names:', uniqueTagNames);

  try {
      // 1. Find existing tags (case-insensitive search if possible, otherwise handle in code)
      //    Using ilike for case-insensitive search (requires enabling pg_trgm extension or careful indexing)
      //    A simpler approach is to query lowercase names if you store them lowercase.
      //    Let's assume names are stored as entered, and we handle case here.
      const { data: existingTags, error: findError } = await supabase
          .from(Constants.TAGS_TABLE)
          .select('id, name')
          .in('name', uniqueTagNames); // Supabase `in` might be case-sensitive depending on DB collation

      if (findError) {
          console.error('Error finding existing tags:', findError);
          return { tagIds: [], error: findError };
      }

      const existingTagMap = new Map(existingTags?.map(tag => [tag.name.toLowerCase(), tag.id]));
      const foundTagIds = existingTags?.map(tag => tag.id) || [];
      console.log('Found existing tags:', existingTags);

      // 2. Identify tags to create
      const tagsToCreate = uniqueTagNames.filter(name => !existingTagMap.has(name));
      console.log('Tags to create:', tagsToCreate);

      let newTagIds: string[] = [];
      if (tagsToCreate.length > 0) {
          const newTagObjects = tagsToCreate.map(name => ({
              name: name // Store the original (trimmed) name or the lowercase one? Let's use original trimmed.
                         // Find the original casing from the input array for better display later.
                         // For simplicity here, we'll use the lowercase unique name.
                         // A better approach might store both original and lowercase.
          }));

          // 3. Insert new tags
          const { data: insertedTags, error: insertError } = await supabase
              .from(Constants.TAGS_TABLE)
              .insert(newTagObjects)
              .select('id');

          if (insertError) {
              // Handle potential unique constraint violation if tags were created concurrently
              if (insertError.code === '23505') { // Unique violation code
                  console.warn('Unique constraint violation during tag insert, likely concurrent creation. Re-fetching tags.');
                  // Re-fetch all tags for the input names to get IDs created by other requests
                  const { data: refetchedTags, error: refetchError } = await supabase
                      .from(Constants.TAGS_TABLE)
                      .select('id, name')
                      .in('name', uniqueTagNames); // Use the original list of unique names

                  if (refetchError) {
                       console.error('Error re-fetching tags after unique violation:', refetchError);
                       return { tagIds: [], error: `Failed to re-fetch tags after conflict: ${refetchError.message}` };
                  }
                  // Return all found IDs (original + concurrently created ones)
                  return { tagIds: refetchedTags?.map(tag => tag.id) || [] };

              } else {
                  console.error('Error inserting new tags:', insertError);
                  return { tagIds: [], error: insertError };
              }
          }
          newTagIds = insertedTags?.map(tag => tag.id) || [];
          console.log('Successfully inserted new tags, IDs:', newTagIds);
      }

      // 4. Combine existing and new tag IDs
      const allTagIds = [...new Set([...foundTagIds, ...newTagIds])];
      console.log('Final combined tag IDs:', allTagIds);
      return { tagIds: allTagIds };

  } catch (err: any) {
      console.error('Unexpected error in findOrCreateTags:', err);
      return { tagIds: [], error: err.message || 'Unknown error processing tags' };
  }
}