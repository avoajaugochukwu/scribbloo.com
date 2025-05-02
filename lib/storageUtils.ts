import { supabase } from '@/lib/supabaseClient';
/* eslint-disable @typescript-eslint/no-explicit-any */
import sharp from 'sharp'; // Make sure sharp is installed (npm install sharp)
import logger from './logger'; // Import the configured logger

// --- Type Definitions for Parameters ---

interface GenerateStoragePathParams {
  originalFileName: string;
  /** If true, generates a path ending in .webp */
  asWebp?: boolean;
}

interface ConvertToWebpParams {
  fileBuffer: ArrayBuffer;
  quality?: number;
}

interface UploadFileParams {
  bucketName: string;
  storagePath: string; // Full path including filename
  file: File;
  contentType: string; // e.g., 'image/jpeg', 'image/png'
  upsert?: boolean;
}

interface UploadBufferParams {
  bucketName: string;
  storagePath: string; // Full path including filename (e.g., 'my-image.webp')
  buffer: Buffer;
  contentType: string; // Should be 'image/webp'
  upsert?: boolean;
}

interface CheckPathExistsParams {
  bucketName: string;
  storagePath: string;
}

interface DeleteFileParams {
    bucketName: string;
    filePath: string;
}

// --- Helper Functions (Single Responsibility) ---

/**
 * Generates a URL-safe slug from text. (Internal helper)
 */
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
 * SRP: Generates a storage-safe path, optionally with a .webp extension.
 * Responsibility: Determine the final filename/path based on the original name.
 */
export function generateStoragePath(params: GenerateStoragePathParams): { storagePath: string } {
  const { originalFileName, asWebp = false } = params;
  const log = logger.child({ function: 'generateStoragePath', originalFileName, asWebp });
  log.debug('Generating storage path');

  const extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
  const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
  const slugifiedBaseName = slugify(baseName);

  // Use original extension unless asWebp is true
  const finalExtension = asWebp ? '.webp' : extension.toLowerCase();
  const finalPath = `${slugifiedBaseName}${finalExtension}`;

  log.info({ resultPath: finalPath }, 'Generated storage path successfully');
  return { storagePath: finalPath };
}

/**
 * SRP: Converts an image buffer to a WebP buffer using Sharp.
 * Responsibility: Image format conversion.
 */
export async function convertImageToWebpBuffer(params: ConvertToWebpParams): Promise<{ webpBuffer?: Buffer; error?: string }> {
  const { fileBuffer, quality = 50 } = params;
  const scaleFactor = 0.25; // ⬅️ Resize to 25% of original

  const log = logger.child({ function: 'convertImageToWebpBuffer', quality, scaleFactor });
  log.debug('Converting image buffer to WebP with percentage resize');

  try {
    const buffer = Buffer.from(fileBuffer);
    const image = sharp(buffer);

    const metadata = await image.metadata();
    const targetWidth = Math.round((metadata.width || 0) * scaleFactor);
    const targetHeight = Math.round((metadata.height || 0) * scaleFactor);

    if (!targetWidth || !targetHeight) {
      throw new Error('Could not determine image dimensions for resizing.');
    }

    const webpBuffer = await image
      .resize(targetWidth, targetHeight)
      .webp({
        quality,
        nearLossless: false,
        smartSubsample: true,
        effort: 6
      })
      .toBuffer();

    log.info(`Converted to WebP, size: ${(webpBuffer.length / 1024).toFixed(2)} KB`);
    return { webpBuffer };
  } catch (error: any) {
    log.error({ error }, 'Error converting image to WebP');
    return { error: `Image conversion failed: ${error.message}` };
  }
}


/**
 * SRP: Uploads a raw File object to Supabase Storage.
 * Responsibility: Interact with Supabase storage API for upload.
 */
export async function uploadOriginalFile(params: UploadFileParams): Promise<{ path?: string; error?: string }> {
    const { bucketName, storagePath, file, contentType, upsert = false } = params;
    const log = logger.child({ function: 'uploadOriginalFile', bucketName, storagePath, contentType, upsert });
    log.info('Attempting to upload original file');

    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, file, {
                contentType: contentType,
                upsert: upsert,
            });

        if (error) {
            log.error({ error, errorMessage: error.message, errorStatus: (error as any).status }, 'Supabase storage upload failed for original file');
            if (!upsert && (error.message.includes('Duplicate') || error.message.includes('already exists'))) {
                return { error: `File "${storagePath}" already exists in bucket "${bucketName}". Choose a different name or enable overwriting.` };
            }
            return { error: `Storage upload failed: ${error.message}` };
        }

        log.info({ path: data?.path }, 'Original file uploaded successfully');
        // Note: Supabase upload might not return the full path, just the key.
        // The storagePath passed in is usually what we need.
        return { path: storagePath };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error during original file upload');
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during upload.';
        return { error: message };
    }
}

/**
 * SRP: Uploads a Buffer (expected to be WebP) to Supabase Storage.
 * Responsibility: Interact with Supabase storage API for upload.
 */
export async function uploadBufferToStorage(params: UploadBufferParams): Promise<{ path?: string; error?: string }> {
  const { bucketName, storagePath, buffer, contentType, upsert = false } = params;
  const log = logger.child({ function: 'uploadBufferToStorage', bucketName, storagePath, contentType, upsert });
  log.info('Attempting to upload buffer');

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: contentType, // Should be 'image/webp'
        upsert: upsert,
      });

    if (error) {
      log.error({ error, errorMessage: error.message, errorStatus: (error as any).status }, 'Supabase storage buffer upload failed');
      if (!upsert && (error.message.includes('Duplicate') || error.message.includes('already exists'))) {
         return { error: `File "${storagePath}" already exists in bucket "${bucketName}". Choose a different name or enable overwriting.` };
      }
      return { error: `Storage upload failed: ${error.message}` };
    }

    log.info({ path: data?.path }, 'Buffer uploaded successfully');
    return { path: storagePath }; // Return the intended path

  } catch (err: any) {
    log.error({ error: err }, 'Unexpected error during buffer upload');
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during buffer upload.';
    return { error: message };
  }
}

/**
 * SRP: Checks if a specific path exists in a Supabase Storage bucket.
 * Responsibility: Interact with Supabase storage API to check for file existence.
 */
export async function checkIfPathExistsInStorage(params: CheckPathExistsParams): Promise<{ exists: boolean; error?: string }> {
    const { bucketName, storagePath } = params;
    const log = logger.child({ function: 'checkIfPathExistsInStorage', bucketName, storagePath });
    log.debug('Checking if path exists in storage');

    // Extract directory and filename for Supabase list options
    const lastSlashIndex = storagePath.lastIndexOf('/');
    const pathPrefix = lastSlashIndex > -1 ? storagePath.substring(0, lastSlashIndex) : undefined; // List files in this directory
    const fileName = storagePath.substring(lastSlashIndex + 1); // Search for this specific file

    try {
        // Use list with search to find the specific file efficiently
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list(pathPrefix, { // pathPrefix can be undefined for root
                limit: 1,
                search: fileName,
            });

        if (error) {
            log.error({ error }, 'Failed to list storage bucket contents');
            return { exists: false, error: `Failed to check storage: ${error.message}` };
        }

        // If data is not null and contains an item with the exact name, it exists
        const exists = data?.some(item => item.name === fileName) ?? false;
        log.info({ exists }, 'Path existence check complete');
        return { exists };

    } catch (error: any) {
        log.error({ error }, 'Unexpected error checking path existence');
        return { exists: false, error: `Unexpected error checking storage: ${error.message}` };
    }
}

// --- Delete Function (Updated Logging) ---

/**
 * Deletes a file from a specified Supabase Storage bucket.
 */
export async function deleteStorageFile(params: DeleteFileParams): Promise<{ success: boolean; error?: string | null }> {
    const { bucketName, filePath } = params;
    const log = logger.child({ function: 'deleteStorageFile', bucketName, filePath });

    try {
        if (!filePath || filePath.trim() === '') {
            log.warn('Attempted to delete file with empty path. Skipping.');
            return { success: true };
        }

        log.info('Attempting to delete file from storage');
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]); // remove expects an array of paths

        if (error) {
            // Check for "Not Found" which might not be a true error in cleanup scenarios
            if (error.message.includes('Not Found')) {
                 log.warn({ error }, 'File not found during deletion (might be expected). Treating as success.');
                 return { success: true }; // Treat "Not Found" as success for cleanup
            }
            // Log error details - remove error.code
            log.error({ error, errorMessage: error.message }, 'Error deleting file from storage');
            return { success: false, error: error.message };
        }

        log.info('Successfully deleted file from storage');
        return { success: true };

    } catch (err: any) {
        log.error({ error: err }, 'Unexpected error during file deletion');
        const message = err instanceof Error ? err.message : 'An unexpected error occurred during deletion.';
        return { success: false, error: message };
    }
} 