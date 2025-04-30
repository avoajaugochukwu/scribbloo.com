'use server';
import { Constants } from '@/config/constants';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new image record, uploads the file, and links categories/tags.
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
  const filePath = imageFile.name;

  let newImageId: string | null = null;

  try {
    // 1. Upload file to Supabase Storage
    console.log(`Uploading file "${filePath}" to bucket "${BUCKET_NAME}"`);
    const { data: storageData, error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
      });

    if (storageError) {
      console.error(`Error uploading image to storage bucket "${BUCKET_NAME}":`, storageError);
      if (storageError.message.includes('Bucket not found')) {
          return { success: false, message: `Storage Error: Bucket "${BUCKET_NAME}" not found. Please check configuration.` };
      }
      return { success: false, message: `Storage upload failed: ${storageError.message}` };
    }
    console.log('File uploaded successfully:', storageData);


    // 2. Insert image metadata into the 'coloring_pages' table
    console.log('Inserting image metadata into database...');
    const { data: imageInsertData, error: imageInsertError } = await supabase
      .from(Constants.COLORING_PAGES_TABLE)
      .insert([{
          title: title,
          description: description,
          image_url: filePath
      }])
      .select('id')
      .single();

    if (imageInsertError || !imageInsertData) {
      console.error('Error inserting image metadata:', imageInsertError);
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      console.log(`Rolled back storage upload for path: ${filePath}`);
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
                image_id: newImageId,
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
                image_id: newImageId,
                tag_id: tagId
            }));
            const { error: tagLinkError } = await supabase.from(Constants.COLORING_PAGE_TAG_TABLE).insert(tagLinks);
            if (tagLinkError) throw tagLinkError;
            console.log('Tags linked successfully.');
        }
    } catch (linkError: any) {
        console.error('Error linking categories/tags:', linkError);
        const imageIdToRollback = newImageId;

        console.log(`Attempting non-blocking rollback for image ID: ${imageIdToRollback}, file path: ${filePath}`);
        Promise.allSettled([
            imageIdToRollback
                ? supabase.from(Constants.COLORING_PAGES_TABLE).delete().eq('id', imageIdToRollback)
                : Promise.resolve({ status: 'skipped', reason: 'No image ID' }),
            filePath
                ? supabase.storage.from(BUCKET_NAME).remove([filePath])
                : Promise.resolve({ status: 'skipped', reason: 'No file path' })
        ]).then(results => {
            console.log("Rollback attempt results (linking error):");
            results.forEach((result, index) => {
                const operation = index === 0 ? `DB delete (ID: ${imageIdToRollback})` : `Storage delete (Path: ${filePath})`;
                if (result.status === 'fulfilled') {
                    const supabaseResult = (result as PromiseFulfilledResult<any>).value;
                    if (supabaseResult?.error) {
                       console.error(`Rollback failed for ${operation}: ${supabaseResult.error.message}`);
                    } else if (supabaseResult?.status !== 'skipped') {
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

    return { success: true, message: 'Image created successfully!', imageId: newImageId ?? undefined };

  } catch (err: any) {
    console.error('Unexpected error during image creation (upload/insert phase):', err);
    if (filePath) {
        console.log(`Attempting cleanup of storage file due to outer error: ${filePath}`);
        supabase.storage.from(BUCKET_NAME).remove([filePath]).catch(cleanupErr => {
            console.error("Storage cleanup failed during outer error handling:", cleanupErr);
        });
    }
    return { success: false, message: `An unexpected error occurred: ${err.message}` };
  }
} 