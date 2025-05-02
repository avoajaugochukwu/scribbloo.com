import { Constants } from '@/config/constants';
import logger from '@/lib/logger';
import {
  generateStoragePath,
  convertImageToWebpBuffer,
  uploadBufferToStorage,
  uploadOriginalFile,
  deleteStorageFile
} from '@/lib/storageUtils';

export interface ImageUploadResult {
  originalPath: string | null;
  webpPath: string | null;
  error?: string;
}

export interface ImageProcessingOptions {
  bucket: string;
  upsert?: boolean;
  generateUniqueFilename?: boolean;
  quality?: number;
  webpOnly?: boolean;
}

export class ImageProcessingService {
  private log;

  constructor(context: { action: string, entityId?: string }) {
    this.log = logger.child({ service: 'ImageProcessingService', ...context });
  }

  /**
   * Process and upload an image, with option for WebP-only mode
   */
  async processAndUploadImage(
    file: File,
    options: ImageProcessingOptions
  ): Promise<ImageUploadResult> {
    if (!file || file.size === 0) {
      return { originalPath: null, webpPath: null, error: 'No file provided' };
    }

    if (!file.type.startsWith('image/')) {
      return { originalPath: null, webpPath: null, error: 'Invalid file type. Please upload an image.' };
    }

    this.log.info(
      { fileName: file.name, fileSize: file.size, webpOnly: options.webpOnly },
      options.webpOnly ? 'Processing WebP-only image' : 'Processing image with original and WebP versions'
    );

    try {
      let uploadedOriginalPath: string | null = null;
      
      // Generate paths (we'll always need the WebP path)
      const { storagePath: webpPath } = generateStoragePath({
        originalFileName: file.name,
        asWebp: true,
      });
      
      // Only process original if not in WebP-only mode
      if (!options.webpOnly) {
        const { storagePath: originalPath } = generateStoragePath({
          originalFileName: file.name,
          asWebp: false,
        });
        
        this.log.info({ originalPath, webpPath }, 'Generated storage paths');

        // Upload original file
        const originalUploadResult = await uploadOriginalFile({
          bucketName: options.bucket,
          storagePath: originalPath,
          file: file,
          contentType: file.type,
          upsert: options.upsert ?? false
        });

        if (originalUploadResult.error || !originalUploadResult.path) {
          throw new Error(originalUploadResult.error || 'Failed to upload original file');
        }

        uploadedOriginalPath = originalUploadResult.path;
        this.log.info({ path: uploadedOriginalPath }, 'Original file uploaded');
      } else {
        this.log.info({ webpPath }, 'Generated WebP storage path (WebP-only mode)');
      }

      // Convert to WebP (done in both modes)
      const fileBuffer = await file.arrayBuffer();
      const conversionResult = await convertImageToWebpBuffer({
        fileBuffer,
        quality: options.quality
      });

      if (conversionResult.error || !conversionResult.webpBuffer) {
        throw new Error(conversionResult.error || 'WebP conversion failed');
      }
      
      this.log.info('File converted to WebP');

      // Upload WebP version (done in both modes)
      const webpUploadResult = await uploadBufferToStorage({
        bucketName: options.bucket,
        storagePath: webpPath,
        buffer: conversionResult.webpBuffer,
        contentType: 'image/webp',
        upsert: options.upsert ?? false
      });

      if (webpUploadResult.error || !webpUploadResult.path) {
        throw new Error(webpUploadResult.error || 'WebP upload failed');
      }

      const uploadedWebpPath = webpUploadResult.path;
      this.log.info({ path: uploadedWebpPath }, 'WebP file uploaded');

      return {
        originalPath: uploadedOriginalPath,
        webpPath: uploadedWebpPath
      };
    } catch (error: any) {
      this.log.error({ error }, 'Error processing and uploading image');
      return {
        originalPath: null,
        webpPath: null,
        error: error.message || 'Unknown error processing image'
      };
    }
  }

  /**
   * Replace an existing image with a new one
   */
  async replaceImage(
    file: File,
    oldOriginalPath: string | null,
    oldWebpPath: string | null,
    options: ImageProcessingOptions
  ): Promise<{ result: ImageUploadResult, pathsChanged: boolean }> {
    // Process and upload the new image
    const uploadResult = await this.processAndUploadImage(file, options);
    
    if (uploadResult.error || !uploadResult.originalPath || !uploadResult.webpPath) {
      return { result: uploadResult, pathsChanged: false };
    }

    // Check if paths changed
    const originalPathChanged = uploadResult.originalPath !== oldOriginalPath;
    const webpPathChanged = uploadResult.webpPath !== oldWebpPath;
    const pathsChanged = originalPathChanged || webpPathChanged;

    // If paths changed and uploads succeeded, delete old files
    if (pathsChanged) {
      this.log.info(
        { originalChanged: originalPathChanged, webpChanged: webpPathChanged },
        'Image paths changed, will delete old files'
      );
      
      // Delete old files asynchronously (don't await)
      this.deleteImageFiles(oldOriginalPath, oldWebpPath, options.bucket);
    }

    return { result: uploadResult, pathsChanged };
  }

  /**
   * Delete image files from storage
   */
  async deleteImageFiles(
    originalPath: string | null,
    webpPath: string | null,
    bucket: string
  ): Promise<void> {
    const deletePromises = [];
    
    if (originalPath) {
      this.log.info({ path: originalPath }, 'Deleting original file');
      deletePromises.push(
        deleteStorageFile({ bucketName: bucket, filePath: originalPath })
      );
    }
    
    if (webpPath) {
      this.log.info({ path: webpPath }, 'Deleting WebP file');
      deletePromises.push(
        deleteStorageFile({ bucketName: bucket, filePath: webpPath })
      );
    }

    if (deletePromises.length > 0) {
      try {
        const results = await Promise.allSettled(deletePromises);
        results.forEach((result, index) => {
          const path = index === 0 ? originalPath : webpPath;
          if (result.status === 'rejected') {
            this.log.warn({ path, error: result.reason }, 'Failed to delete file');
          } else {
            this.log.info({ path }, 'File deleted successfully');
          }
        });
      } catch (error) {
        this.log.error({ error }, 'Error deleting image files');
      }
    }
  }
} 