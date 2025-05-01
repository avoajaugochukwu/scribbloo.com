import { supabase } from '@/lib/supabaseClient';
// Remove unused imports if uuidv4 and path are no longer needed here
// import { v4 as uuidv4 } from 'uuid';
// import path from 'path';

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
 * Uploads a file to a specified Supabase Storage bucket using an SEO-friendly name
 * derived from the original filename.
 *
 * @param bucketName The name of the Supabase Storage bucket.
 * @param file The file object to upload.
 * @param upsert Optional. If true, overwrites the file if it already exists. Defaults to false.
 * @returns An object containing the path (the generated filename) or an error.
 */
export async function uploadStorageFile(
    bucketName: string,
    file: File,
    upsert: boolean = false // Keep upsert parameter
): Promise<{ path?: string; error?: string | null }> {
    try {
        if (!file || file.size === 0) {
             console.warn('Upload skipped: File is empty or missing.');
             return { error: 'File is empty or missing.' };
        }
        // Basic image type check (can be expanded)
        if (!file.type.startsWith('image/')) {
             console.warn(`Upload skipped: Invalid file type "${file.type}". Only images are allowed.`);
             return { error: 'Invalid file type. Only images are allowed.' };
        }

        // --- Generate SEO-friendly filename ---
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension) {
            console.error('Upload failed: Could not determine file extension.');
            return { error: 'Could not determine file extension.' };
        }
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const slugifiedBaseName = slugify(baseName);

        // Filename is now just the slugified base name + extension
        const seoFileName = `${slugifiedBaseName}.${fileExtension}`;
        // --- End filename generation ---


        console.log(`Uploading file "${file.name}" as "${seoFileName}" to bucket "${bucketName}" with upsert: ${upsert}`);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(seoFileName, file, { // Use seoFileName as the path
                cacheControl: '3600', // Optional: Example cache control
                upsert: upsert, // Use the upsert parameter here
            });

        if (error) {
            // If upsert is false, duplicate errors are possible. If upsert is true, other errors might occur.
            console.error(`Storage upload error (${bucketName}, ${seoFileName}):`, error);
             // Check specifically for the duplicate file error if upsert was false
             if (!upsert && (error.message.includes('Duplicate') || error.message.includes('already exists'))) {
                  console.warn(`Storage upload error (${bucketName}): Filename "${seoFileName}" already exists (upsert was false).`);
                  // Return a specific error message for duplicates when not upserting
                  return { error: `Filename "${seoFileName}" already exists. Please rename the file or enable overwriting.` };
             }
            return { error: `Storage upload failed: ${error.message}` };
        }

        // Supabase upload returns the key (path) used for the upload in data.path
        if (!data?.path) {
             console.error('Upload successful but no path returned from Supabase.');
             return { error: 'Upload successful but no path returned from Supabase.' };
        }

        console.log(`File uploaded successfully. Path: ${data.path}`);
        // Return the actual path used by Supabase (should match seoFileName)
        return { path: data.path };

    } catch (err: any) {
        console.error('Unexpected error during file upload:', err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during upload.';
        return { error: message };
    }
}

/**
 * Deletes a file from a specified Supabase Storage bucket.
 *
 * @param bucketName The name of the Supabase Storage bucket.
 * @param filePath The path (filename) of the file to delete within the bucket.
 * @returns An object indicating success or containing an error.
 */
export async function deleteStorageFile(
    bucketName: string,
    filePath: string
): Promise<{ success: boolean; error?: string | null }> {
    try {
        // Ensure filePath is not empty or just whitespace
        if (!filePath || filePath.trim() === '') {
            console.warn('Attempted to delete file with empty path. Skipping.');
            return { success: true }; // Consider this success as there's nothing to delete
        }

        console.log(`Attempting to delete file: ${bucketName}/${filePath}`);
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]); // remove expects an array of paths

        if (error) {
            // It's common to get a "Not Found" error if the file was already deleted or never existed.
            // We might not want to treat this as a critical failure in rollback scenarios.
            if (error.message.includes('Not Found')) { // Adjust based on actual Supabase error message
                 console.warn(`File not found during deletion (might be expected): ${filePath}`);
                 return { success: true }; // Treat "Not Found" as success for cleanup purposes
            }
            console.error(`Error deleting file ${filePath}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`Successfully deleted file: ${filePath}`);
        return { success: true };
    } catch (err: any) {
        console.error(`Unexpected error during file deletion for path ${filePath}:`, err);
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during deletion.';
        return { success: false, error: message };
    }
} 