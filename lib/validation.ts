import { Logger } from 'pino';

/**
 * Validates that a file is an image if present
 */
export function validateImageFile(
  file: File | null,
  fieldName: string,
  log: Logger
): { valid: boolean; message?: string } {
  if (!file || file.size === 0) {
    return { valid: true }; // Optional file is valid if not present
  }
  
  if (!file.type.startsWith('image/')) {
    log.warn(
      { fieldName, fileType: file.type },
      `Validation failed: Invalid ${fieldName} file type.`
    );
    return {
      valid: false,
      message: `Invalid file type for ${fieldName}. Please upload an image.`
    };
  }
  
  return { valid: true };
}

/**
 * Validates multiple image files at once, returning on first invalid file
 */
export function validateImageFiles(
  files: { file: File | null, fieldName: string, required?: boolean }[],
  log: Logger
): { valid: boolean; message?: string } {
  // First check required files
  for (const { file, fieldName, required } of files) {
    if (required && (!file || file.size === 0)) {
      log.warn(
        { fieldName },
        `Validation failed: ${fieldName} is required.`
      );
      return {
        valid: false,
        message: `${fieldName} is required.`
      };
    }
  }
  
  // Then validate file types
  for (const { file, fieldName } of files) {
    const result = validateImageFile(file, fieldName, log);
    if (!result.valid) return result;
  }
  
  return { valid: true };
} 