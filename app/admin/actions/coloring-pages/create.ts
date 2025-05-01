'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Import the utility function
import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';
import { PostgrestError } from '@supabase/supabase-js'; // Import for type checking

// --- Helper Function: Find or Create Tags ---
async function findOrCreateTags(tagNames: string[]): Promise<{ tagIds: string[], error?: string | PostgrestError }> {
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

/**
 * Creates a new image record, uploads the file, finds/creates tags, and links categories/tags.
 * Accepts previous state for useFormState compatibility.
 */
export async function createColoringPage(
    previousState: { success: boolean; message: string; imageId?: string },
    formData: FormData
): Promise<{ success: boolean; message: string; imageId?: string }> {
    console.log('formData for create:', formData);
    const title = formData.get('title')?.toString().trim() || null;
    const description = formData.get('description')?.toString().trim() || null;
    const imageFile = formData.get('imageFile') as File | null;
    const categoryIds = formData.getAll('categoryIds').map(id => id.toString()); // Expecting UUIDs
    // Get comma-separated tags string instead of IDs
    const tagsInput = formData.get('tagsInput')?.toString() || '';

    if (!imageFile || imageFile.size === 0) {
        return { success: false, message: 'Image file is required.' };
    }
    if (!imageFile.type.startsWith('image/')) {
        return { success: false, message: 'Invalid file type. Please upload an image.' };
    }

    const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;
    let filePath: string | null = null;
    let newImageId: string | null = null;
    let finalTagIds: string[] = []; // To store IDs after find/create

    // --- Consolidated Rollback Function ---
    const performRollback = async (step: string, errorDetails: any) => {
        console.error(`Error during ${step}:`, errorDetails);
        console.log(`Attempting rollback. Image ID: ${newImageId}, File Path: ${filePath}`);
        if (newImageId) {
            // Delete links first (optional, cascade delete might handle this)
            await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).delete().eq('coloring_page_id', newImageId);
            await supabase.from(Constants.COLORING_PAGE_CATEGORY_TABLE).delete().eq('coloring_page_id', newImageId);
            // Delete image record
            await supabase.from(Constants.COLORING_PAGES_TABLE).delete().eq('id', newImageId);
            console.log(`Deleted database record for image ID: ${newImageId}`);
        }
        if (filePath) {
            await deleteStorageFile(BUCKET_NAME, filePath);
            console.log(`Deleted storage file: ${filePath}`);
        }
        const message = errorDetails instanceof Error ? errorDetails.message : String(errorDetails);
        return { success: false, message: `Failed during ${step}: ${message}` };
    };
    // --- End Rollback Function ---

    try {
        // 1. Upload file using the utility function
        console.log(`Uploading file "${imageFile.name}" to bucket "${BUCKET_NAME}" using utility...`);
        const uploadResult = await uploadStorageFile(BUCKET_NAME, imageFile);

        // Check if the upload was successful and we got a path
        if (!uploadResult.path) {
            console.error(`Error uploading image via utility: ${uploadResult.error}`);
            // Use the error message from the utility function
            return await performRollback('Storage Upload', uploadResult.error || 'Unknown upload error');
        }

        // Store the path returned by the utility
        filePath = uploadResult.path;
        console.log('File uploaded successfully via utility, path:', filePath);

        // --- Parse Tags Input ---
        const tagNames = tagsInput.split(',')
                             .map(tag => tag.trim())
                             .filter(Boolean); // Remove empty strings resulting from trailing commas etc.
        console.log('Parsed tag names from input:', tagNames);
        // --- End Parse Tags Input ---

        // 2. Find or Create Tags
        console.log('Finding or creating tags...');
        const tagsResult = await findOrCreateTags(tagNames);
        if (tagsResult.error) {
            return await performRollback('Tag Processing', tagsResult.error);
        }
        finalTagIds = tagsResult.tagIds;
        console.log('Tags processed successfully, IDs:', finalTagIds);

        // 3. Insert image metadata into the 'coloring_pages' table
        console.log('Inserting image metadata into database...');
        const { data: imageInsertData, error: imageInsertError } = await supabase
          .from(Constants.COLORING_PAGES_TABLE)
          .insert([{
              title: title,
              description: description,
              image_url: filePath // Use the path from the upload result
          }])
          .select('id')
          .single();

        if (imageInsertError || !imageInsertData) {
          console.error('Error inserting image metadata:', imageInsertError);
          // Use deleteStorageFile for rollback
          console.log(`Rolling back storage upload for path: ${filePath}`);
          await deleteStorageFile(BUCKET_NAME, filePath);
          return await performRollback('Database Insert', imageInsertError || 'Unknown DB error');
        }

        newImageId = imageInsertData.id;
        console.log(`Image metadata inserted successfully, ID: ${newImageId}`);

        // --- Inner Try/Catch for Linking ---
        try {
            // 4. Link categories
            if (categoryIds.length > 0) {
                console.log(`Linking ${categoryIds.length} categories...`);
                const categoryLinks = categoryIds.map(categoryId => ({
                    // Ensure column names match your 'coloring_page_categories' table schema
                    coloring_page_id: newImageId, // Corrected based on schema likely using this name
                    category_id: categoryId
                }));
                const { error: categoryLinkError } = await supabase.from(Constants.COLORING_PAGE_CATEGORY_TABLE).insert(categoryLinks);
                if (categoryLinkError) throw categoryLinkError;
                console.log('Categories linked successfully.');
            }

            // 5. Link tags (using the finalTagIds)
            if (finalTagIds.length > 0) {
                console.log(`Linking ${finalTagIds.length} tags...`);
                const tagLinks = finalTagIds.map(tagId => ({
                    // Ensure column names match your 'coloring_page_tags' table schema
                    coloring_page_id: newImageId, // Corrected based on schema likely using this name
                    tag_id: tagId
                }));
                const { error: tagLinkError } = await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).insert(tagLinks);
                if (tagLinkError) throw tagLinkError;
                console.log('Tags linked successfully.');
            }
        } catch (linkError: any) {
            console.error('Error linking categories/tags:', linkError);
            const imageIdToRollback = newImageId;
            const filePathToRollback = filePath; // Use the path we stored

            console.log(`Attempting non-blocking rollback for image ID: ${imageIdToRollback}, file path: ${filePathToRollback}`);
            Promise.allSettled([
                imageIdToRollback
                    ? supabase.from(Constants.COLORING_PAGES_TABLE).delete().eq('id', imageIdToRollback)
                    : Promise.resolve({ status: 'skipped', reason: 'No image ID' }),
                // Use deleteStorageFile for rollback
                filePathToRollback
                    ? deleteStorageFile(BUCKET_NAME, filePathToRollback)
                    : Promise.resolve({ status: 'skipped', reason: 'No file path' })
            ]).then(results => {
                console.log("Rollback attempt results (linking error):");
                results.forEach((result, index) => {
                    const operation = index === 0 ? `DB delete (ID: ${imageIdToRollback})` : `Storage delete (Path: ${filePathToRollback})`;
                    if (result.status === 'fulfilled') {
                        const opResult = (result as PromiseFulfilledResult<any>).value;
                        // Check result structure from deleteStorageFile if needed
                        if (opResult?.error) {
                           console.error(`Rollback failed for ${operation}: ${opResult.error.message || opResult.error}`);
                        } else if (opResult?.status !== 'skipped') {
                           console.log(`Rollback likely succeeded for ${operation}.`);
                        }
                    } else if (result.status === 'rejected') {
                        console.error(`Rollback failed for ${operation}: ${(result as PromiseRejectedResult).reason}`);
                    }
                });
            });
            return await performRollback('Category/Tag Linking', linkError);
        }
        // --- End Inner Try/Catch ---

        // 6. Revalidate paths (Only reached if upload, insert, and linking succeed)
        console.log('Revalidating paths...');
        revalidatePath('/admin');
        revalidatePath('/admin/coloring-pages/create');
        revalidatePath('/admin/coloring-pages/edit', 'layout');
        revalidatePath('/coloring-pages', 'layout');

        return { success: true, message: 'Coloring Page created successfully!', imageId: newImageId ?? undefined };

    } catch (err: any) {
        console.error('Unexpected error during image creation (upload/insert phase):', err);
        // Use deleteStorageFile for cleanup if filePath was set before the error
        if (filePath) {
            console.log(`Attempting cleanup of storage file due to outer error: ${filePath}`);
            deleteStorageFile(BUCKET_NAME, filePath).catch(cleanupErr => {
                console.error("Storage cleanup failed during outer error handling:", cleanupErr);
            });
        }
        return await performRollback('Unexpected Error', err);
    }
} 