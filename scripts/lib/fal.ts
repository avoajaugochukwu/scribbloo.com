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
 * Bump this whenever the look changes — the base style prompt below OR the A4
 * framing pipeline (scripts/lib/frameA4.ts). It's stamped onto each generated
 * page's frontmatter so `generate:catalog` knows which pages predate the current
 * look and re-generates only those (resumable across fal top-ups, no --force).
 *
 *   v1 — initial fal/grok pipeline
 *   v2 — solid #000000 lines (threshold-last) + "all lines solid black" base prompt
 */
export const STYLE_VERSION = 2;

/**
 * Prepended to every prompt to coerce the model into clean coloring-book line art.
 */
export const COLORING_BOOK_STYLE_PREFIX =
  'black and white coloring book page, every outline drawn in solid pure black ' +
  '#000000, all lines equally dark crisp and opaque with consistent medium-thin ' +
  'weight, the background elements drawn with the SAME solid-black lines as the ' +
  'main subject, simple closed shapes that are easy to color inside, plain pure ' +
  'white background, flat 2D, ' +
  // hard negatives — Grok revises prompts, so state these forcefully
  'no color, no shading, no grayscale, no gray lines, no faint lines, no pale or ' +
  'light or washed-out lines, no gradients, no hatching or cross-hatching, no ' +
  'stippling, no thick heavy brush strokes, no sketchy or broken lines, no text, ' +
  'no watermark, no frame, no page border (any border is added by the user at download time), ';

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

/* -------------------------------------------------------------------------- */
/* Article hero images (colorful on-brand illustration, NOT line art)          */
/* -------------------------------------------------------------------------- */

/**
 * Style contract for article/doc hero images (how-to-draw, drawing-ideas, blog).
 * Unlike COLORING_BOOK_STYLE_PREFIX (black-and-white printable line art), these
 * are warm, fully-colored "Storybook Retro" illustrations that sit at the top of
 * an article. Grok rewrites prompts server-side, so the look is stated firmly.
 */
export const ARTICLE_STYLE_PREFIX =
  'warm friendly storybook illustration in a nostalgic 1970s childrens-book print ' +
  'style, hand-drawn look with soft rounded shapes and bold confident ink outlines, ' +
  'cheerful cozy palette of warm cream paper, terracotta, mustard yellow, sage green, ' +
  'soft teal and dusty rose, flat 2D with gentle paper-grain texture and a few playful ' +
  'doodle accents, clean simple composition with generous breathing room, ' +
  // hard negatives
  'no text, no lettering, no words, no watermark, no logo, no photorealism, no 3D render, ' +
  'no harsh neon colors, no busy cluttered background, no frame or border, ';

/** fal-Grok aspect ratios for hero images. 3:2 landscape reads best as a banner. */
export type ArticleAspectRatio = '3:2' | '4:3' | '16:9' | '1:1';

export interface GenerateArticleImageInput {
  /** the subject clause, e.g. "a single red rose with a few green leaves" */
  prompt: string;
  /** defaults to '3:2' (a friendly landscape banner) */
  aspectRatio?: ArticleAspectRatio;
}

export interface GenerateArticleImageResult {
  imageUrl: string;
  requestId: string;
  revisedPrompt?: string;
}

/** Wrap a raw subject prompt in the article illustration style template. */
export function buildArticlePrompt(prompt: string): string {
  return `${ARTICLE_STYLE_PREFIX}${prompt}`;
}

/**
 * Generate a colorful article hero illustration via fal-hosted Grok. Reuses the
 * same FAL_API_KEY. Costs money per call — drive it from generate-article-image.ts.
 */
export async function generateArticleImage(
  input: GenerateArticleImageInput,
): Promise<GenerateArticleImageResult> {
  ensureConfigured();

  const result = await fal.subscribe(GROK_MODEL, {
    input: {
      prompt: buildArticlePrompt(input.prompt),
      aspect_ratio: input.aspectRatio ?? '3:2',
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
