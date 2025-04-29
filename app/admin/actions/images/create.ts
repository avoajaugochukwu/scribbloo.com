'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new image record, uploads the file, and links categories/tags.
 */
export async function createImage(formData: FormData): Promise<{ success: boolean; message: string; imageId?: string }> {
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

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'images';
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`; // Adjust if using folders

  let newImageId: string | null = null; // Define here to be accessible in outer catch

  try { // Outer try: Covers Upload and Insert primarily
    // 1. Upload file to Supabase Storage
    console.log(`Uploading file to storage: ${filePath}`);
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageFile);

    if (storageError) {
      console.error('Error uploading image to storage:', storageError);
      // No need to delete file here as upload failed
      return { success: false, message: `Storage upload failed: ${storageError.message}` };
    }
    console.log('File uploaded successfully:', storageData);


    // 2. Insert image metadata into the 'images' table
    console.log('Inserting image metadata into database...');
    const { data: imageInsertData, error: imageInsertError } = await supabase
      .from('images')
      .insert([{
          title: title,
          description: description,
          image_url: filePath
      }])
      .select('id')
      .single();

    if (imageInsertError || !imageInsertData) {
      console.error('Error inserting image metadata:', imageInsertError);
      // Attempt to delete the uploaded file if DB insert fails
      await supabase.storage.from(bucketName).remove([filePath]);
      console.log(`Rolled back storage upload for path: ${filePath}`);
      return { success: false, message: `Database insert failed: ${imageInsertError?.message || 'Unknown DB error'}` };
    }

    newImageId = imageInsertData.id; // Assign the ID
    console.log(`Image metadata inserted successfully, ID: ${newImageId}`);

    // --- Inner Try/Catch for Linking ---
    try {
        // 3. Link categories
        if (categoryIds.length > 0) {
            console.log(`Linking ${categoryIds.length} categories...`);
            const categoryLinks = categoryIds.map(categoryId => ({
                image_id: newImageId, // Use the obtained ID
                category_id: categoryId
            }));
            const { error: categoryLinkError } = await supabase.from('image_categories').insert(categoryLinks);
            if (categoryLinkError) throw categoryLinkError; // Throw to be caught by inner catch
            console.log('Categories linked successfully.');
        }

        // 4. Link tags
        if (tagIds.length > 0) {
            console.log(`Linking ${tagIds.length} tags...`);
            const tagLinks = tagIds.map(tagId => ({
                image_id: newImageId, // Use the obtained ID
                tag_id: tagId
            }));
            const { error: tagLinkError } = await supabase.from('image_tags').insert(tagLinks);
            if (tagLinkError) throw tagLinkError; // Throw to be caught by inner catch
            console.log('Tags linked successfully.');
        }
    } catch (linkError: any) {
        // Catch errors specifically from linking categories/tags
        console.error('Error linking categories/tags:', linkError);
        const imageIdToRollback = newImageId; // ID is known here

        // --- Attempt Rollback Asynchronously (DB Record + Storage File) ---
        console.log(`Attempting non-blocking rollback for image ID: ${imageIdToRollback}, file path: ${filePath}`);
        Promise.allSettled([
            imageIdToRollback
                ? supabase.from('images').delete().eq('id', imageIdToRollback)
                : Promise.resolve({ status: 'skipped', reason: 'No image ID' }),
            filePath
                ? supabase.storage.from(bucketName).remove([filePath])
                : Promise.resolve({ status: 'skipped', reason: 'No file path' })
        ]).then(results => {
            console.log("Rollback attempt results (linking error):");
            results.forEach((result, index) => {
                const operation = index === 0 ? `DB delete (ID: ${imageIdToRollback})` : `Storage delete (Path: ${filePath})`;
                if (result.status === 'fulfilled') {
                    const supabaseResult = (result as PromiseFulfilledResult<any>).value;
                    // Check Supabase client's response structure for errors
                    if (supabaseResult?.error) {
                       console.error(`Rollback failed for ${operation}: ${supabaseResult.error.message}`);
                    } else if (supabaseResult?.status !== 'skipped') {
                       console.log(`Rollback likely succeeded for ${operation}.`);
                    }
                } else if (result.status === 'rejected') {
                    console.error(`Rollback failed for ${operation}: ${(result as PromiseRejectedResult).reason}`);
                }
                // Ignore 'skipped' status logging if desired
            });
        });
        // --- End Rollback Attempt ---

        const errorMessage = typeof linkError?.message === 'string' ? linkError.message : 'Unknown linking error';
        // Return failure directly from linking error
        return { success: false, message: `Failed to link categories/tags: ${errorMessage}` };
    }
    // --- End Inner Try/Catch ---


    // 5. Revalidate paths (Only reached if upload, insert, and linking succeed)
    console.log('Revalidating paths...');
    revalidatePath('/admin');
    revalidatePath('/admin/images/create');
    revalidatePath('/admin/images/edit', 'layout');

    return { success: true, message: 'Image created successfully!', imageId: newImageId ?? undefined };

  } catch (err: any) {
    // This outer catch now handles errors from upload, insert, or other unexpected issues *before* linking
    console.error('Unexpected error during image creation (upload/insert phase):', err);
    // Attempt cleanup: only delete storage file if path exists (DB record might not exist or ID unknown)
    if (filePath) {
        console.log(`Attempting cleanup of storage file due to outer error: ${filePath}`);
        // Don't await, just fire and forget cleanup
        supabase.storage.from(bucketName).remove([filePath]).catch(cleanupErr => {
            console.error("Storage cleanup failed during outer error handling:", cleanupErr);
        });
    }
    // This code is now reachable
    return { success: false, message: `An unexpected error occurred: ${err.message}` };
  }
} 