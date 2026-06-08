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
  'black and white coloring book page, clean even medium-weight black outline ' +
  'lines, thin confident linework of consistent thickness, simple closed shapes ' +
  'that are easy to color inside, plain white background, flat 2D, ' +
  // hard negatives — Grok revises prompts, so state these forcefully
  'no color, no shading, no grayscale fill, no gradients, no hatching or ' +
  'cross-hatching, no stippling, no thick heavy brush strokes, no sketchy or ' +
  'broken lines, no text, no watermark, no frame, no page border (any border is ' +
  'added by the user at download time), ';

export interface GenerateColoringImageInput {
  prompt: string;
  /** drives the composition clause (full vs bleed). Default 'full'. */
  layout?: ColoringLayout;
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

export type ColoringLayout = 'full' | 'bleed';

/**
 * Composition clause appended per layout — this is how bleed/no-bleed is decided
 * (it's a property of the generated image, not the frame). See scripts/lib/frameA4.ts.
 */
const COMPOSITION: Record<ColoringLayout, string> = {
  full:
    '. full-picture composition: the entire subject shown completely inside the ' +
    'frame, nothing cropped, with generous empty white space around it so it does ' +
    'not touch the page edges',
  bleed:
    '. close-up cropped composition like a passport photo: the subject fills the ' +
    'frame and is cropped by the page edge, extending off the bottom edge',
};

/** Wrap a raw user prompt in the coloring-book style template + layout composition. */
export function buildColoringPrompt(prompt: string, layout: ColoringLayout = 'full'): string {
  return `${COLORING_BOOK_STYLE_PREFIX}${prompt}${COMPOSITION[layout]}`;
}

export async function generateColoringImage(
  input: GenerateColoringImageInput,
): Promise<GenerateColoringImageResult> {
  ensureConfigured();

  const result = await fal.subscribe(FAL_MODEL, {
    input: {
      prompt: buildColoringPrompt(input.prompt, input.layout ?? 'full'),
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

/* -------------------------------------------------------------------------- */
/* Grok (xAI grok-imagine-image, hosted on fal)                                */
/* -------------------------------------------------------------------------- */

/** fal-hosted xAI Grok image model — reuses the same FAL_API_KEY. */
export const GROK_MODEL = 'xai/grok-imagine-image' as const;

/** fal-Grok aspect ratios (subset we use). 2:3 is the closest fetch to A4 (0.707). */
export type GrokAspectRatio = '2:3' | '3:4' | '1:1';

export interface GenerateGrokColoringInput {
  prompt: string;
  /** drives the composition clause (full vs bleed). Default 'full'. */
  layout?: ColoringLayout;
  /** defaults to '2:3' (closest portrait ratio to A4 — sharp crops to exact A4 later) */
  aspectRatio?: GrokAspectRatio;
}

export interface GenerateGrokColoringResult {
  imageUrl: string;
  requestId: string;
  /** Grok rewrites prompts server-side — captured for traceability/tuning. */
  revisedPrompt?: string;
}

/**
 * Generate coloring-book line art via fal-hosted Grok. Note: Grok revises the
 * prompt internally, so the style contract in COLORING_BOOK_STYLE_PREFIX has to
 * be assertive ("no thin faint lines", "no border" — the A4 frame is added by
 * sharp, not the model).
 */
export async function generateGrokColoringImage(
  input: GenerateGrokColoringInput,
): Promise<GenerateGrokColoringResult> {
  ensureConfigured();

  const result = await fal.subscribe(GROK_MODEL, {
    input: {
      prompt: buildColoringPrompt(input.prompt, input.layout ?? 'full'),
      aspect_ratio: input.aspectRatio ?? '2:3',
      resolution: '2k',
      output_format: 'png',
      num_images: 1,
    },
  });

  const data = result.data as
    | { images?: Array<{ url?: string }>; revised_prompt?: string }
    | undefined;
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error('fal/Grok returned no image URL');
  }

  return { imageUrl, requestId: result.requestId, revisedPrompt: data?.revised_prompt };
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
