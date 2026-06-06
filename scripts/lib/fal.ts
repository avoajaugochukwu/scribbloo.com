/**
 * Thin wrapper around the fal.ai client for generating coloring-book line art.
 *
 * Model: fal-ai/flux/dev (text-to-image). Every user prompt is wrapped in a
 * coloring-book style template so the output is clean black-and-white line art
 * suitable for printing and coloring.
 */

import { fal } from '@fal-ai/client';

/** Supported fal `image_size` presets (plus explicit width/height). */
export type FalImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9'
  | { width: number; height: number };

export const FAL_MODEL = 'fal-ai/flux/dev' as const;

/**
 * Prepended to every prompt to coerce flux into clean coloring-book line art.
 */
export const COLORING_BOOK_STYLE_PREFIX =
  'black and white coloring book line art, clean bold outlines, no shading, ' +
  'no color, no grayscale fill, pure white background, ';

export interface GenerateColoringImageInput {
  prompt: string;
  imageSize?: FalImageSize;
}

export interface GenerateColoringImageResult {
  imageUrl: string;
  requestId: string;
}

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  const credentials = process.env.FAL_API_KEY;
  if (!credentials) {
    throw new Error(
      'Missing FAL_API_KEY env var (expected format "id:secret"). ' +
        "Load it with process.loadEnvFile('.env').",
    );
  }
  fal.config({ credentials });
  configured = true;
}

/** Wrap a raw user prompt in the coloring-book style template. */
export function buildColoringPrompt(prompt: string): string {
  return COLORING_BOOK_STYLE_PREFIX + prompt;
}

export async function generateColoringImage(
  input: GenerateColoringImageInput,
): Promise<GenerateColoringImageResult> {
  ensureConfigured();

  const result = await fal.subscribe(FAL_MODEL, {
    input: {
      prompt: buildColoringPrompt(input.prompt),
      image_size: input.imageSize ?? 'square_hd',
    },
  });

  // flux/dev returns { images: [{ url, ... }], ... } in `result.data`.
  const data = result.data as { images?: Array<{ url?: string }> } | undefined;
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error('fal.ai returned no image URL');
  }

  return { imageUrl, requestId: result.requestId };
}

/** Download a remote URL to a Buffer (used to feed writeColoringPage). */
export async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
