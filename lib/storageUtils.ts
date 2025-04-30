import { supabase } from '@/lib/supabaseClient';

// Helper function to create a URL-safe slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accented characters into base characters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Uploads a file to a specified Supabase Storage bucket with an SEO-friendly name
 * based on the original filename. WARNING: High risk of filename collisions.
 *
 * @param bucketName The name of the bucket.
 * @param file The file object to upload.
 * @returns Promise resolving to the path (filename) of the uploaded file or an error message.
 */
export async function uploadStorageFile(
    bucketName: string,
    file: File,
): Promise<{ path: string | null; error: string | null }> {
     if (!file || file.size === 0) return { path: null, error: 'File is empty or missing.' };
     if (!file.type.startsWith('image/')) return { path: null, error: 'Invalid file type. Only images are allowed.' };

     // --- Generate SEO-friendly filename (NO unique prefix) ---
     const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png';
     const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
     const slugifiedBaseName = slugify(baseName);

     // Filename is now just the slugified base name + extension
     const seoFileName = `${slugifiedBaseName}.${fileExtension}`;
     // --- End filename generation ---


     console.log(`Uploading file "${file.name}" as "${seoFileName}" to bucket "${bucketName}"`);
     const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(seoFileName, file, { // Use seoFileName
            cacheControl: '3600',
            upsert: false, // VERY IMPORTANT: Keep false to prevent overwrites on collision
        });

     if (error) {
        // Check specifically for the duplicate file error (adjust message check if needed)
        if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
             console.warn(`Storage upload error (${bucketName}): Filename "${seoFileName}" already exists.`);
             return { path: null, error: `Filename "${seoFileName}" already exists. Please rename the file or use a different one.` };
        }
        console.error(`Storage upload error (${bucketName}):`, error);
        return { path: null, error: `Storage upload failed: ${error.message}` };
     }

     console.log(`File uploaded successfully to ${bucketName}:`, data.path);
     return { path: data.path, error: null };
}

/**
 * Deletes a file from a specified Supabase Storage bucket.
 * Ignores "Not found" errors, logs others.
 *
 * @param bucketName The name of the bucket.
 * @param filePath The path (filename) of the file to delete.
 */
export async function deleteStorageFile(bucketName: string, filePath: string | null | undefined): Promise<void> {
    if (!filePath) return;
    console.log(`Attempting to delete file "${filePath}" from bucket "${bucketName}"`);
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error && !error.message.includes('Not found')) { // Log errors other than "file not found"
        console.error(`Storage delete error (${bucketName}, ${filePath}):`, error.message);
    } else if (error) {
        console.log(`File "${filePath}" not found in bucket "${bucketName}" (already deleted?).`);
    } else {
        console.log(`File "${filePath}" deleted successfully from bucket "${bucketName}".`);
    }
} 