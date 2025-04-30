'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
// Import the utility function
import { uploadStorageFile, deleteStorageFile } from '@/lib/storageUtils';

/**
 * Creates a new image record, uploads the file using the utility, and links categories/tags.
 */
export async function createColoringPage(formData: FormData): Promise<{ success: boolean; message: string; imageId?: string }> {
  console.log('formData for create:', formData);
  const title = formData.get('title')?.toString().trim() || null;
  const description = formData.get('description')?.toString().trim() || null;
  const imageFile = formData.get('imageFile') as File | null;
  const categoryIds = formData.getAll('categoryIds').map(id => id.toString()); // Expecting UUIDs
  const tagIds = formData.getAll('tagIds').map(id => id.toString()); // Expecting UUIDs

  if (!imageFile || imageFile.size === 0) {
    return { success: false, message: 'Image file is required.' };
  }
  if (!imageFile.type.startsWith('image/')) {
      return { success: false, message: 'Invalid file type. Please upload an image.' };
  }

  const BUCKET_NAME = Constants.SUPABASE_COLORING_PAGES_BUCKET_NAME;
  let filePath: string | null = null; // Will be set by the utility function
  let newImageId: string | null = null;

  try {
    // 1. Upload file using the utility function
    console.log(`Uploading file "${imageFile.name}" to bucket "${BUCKET_NAME}" using utility...`);
    const uploadResult = await uploadStorageFile(BUCKET_NAME, imageFile);

    // Check if the upload was successful and we got a path
    if (!uploadResult.path) {
        console.error(`Error uploading image via utility: ${uploadResult.error}`);
        // Use the error message from the utility function
        return { success: false, message: `Storage upload failed: ${uploadResult.error || 'Unknown upload error'}` };
    }

    // Store the path returned by the utility
    filePath = uploadResult.path;
    console.log('File uploaded successfully via utility, path:', filePath);


    // 2. Insert image metadata into the 'coloring_pages' table
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
      return { success: false, message: `Database insert failed: ${imageInsertError?.message || 'Unknown DB error'}` };
    }

    newImageId = imageInsertData.id;
    console.log(`Image metadata inserted successfully, ID: ${newImageId}`);

    // --- Inner Try/Catch for Linking ---
    try {
        // 3. Link categories
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

        // 4. Link tags
        if (tagIds.length > 0) {
            console.log(`Linking ${tagIds.length} tags...`);
            const tagLinks = tagIds.map(tagId => ({
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
        return { success: false, message: `Image metadata saved, but failed to link categories/tags: ${linkError.message}` };
    }
    // --- End Inner Try/Catch ---


    // 5. Revalidate paths (Only reached if upload, insert, and linking succeed)
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
    return { success: false, message: `An unexpected error occurred: ${err.message}` };
  }
} 