/**
 * Deterministic A4 framing for coloring-page line art.
 *
 * No image model gives a consistent A4 fit across pages — it improvises every
 * time (the same disease as faint-vs-bold lines). So the model generates ONLY
 * the subject line art, and this step fits it onto a true A4 canvas. Every page
 * comes out pixel-identical in sizing, regardless of which model made the art.
 *
 * Bleed vs no-bleed is a property of the GENERATED COMPOSITION, not the frame
 * (think "full picture" vs "passport photo"):
 *   'full'  — the whole subject is visible with space around it; it does NOT
 *             touch the page edges. Fitted CONTAINED with a small margin.
 *   'bleed' — a cropped/close-up subject (e.g. a head) that can't be cut cleanly,
 *             so it runs off a page edge. Fitted to COVER the page, anchored to
 *             the top so the focal point (a face) is preserved and the crop
 *             bleeds off the bottom.
 *
 * No border is drawn here — a border is an optional, user-chosen step added at
 * download time, not baked into the page.
 *
 * Output is always a PNG Buffer at exact A4 @ 300 DPI, ready to hand to
 * writeColoringPage as the source image (it becomes original.png; full/thumb
 * derive from it).
 */

import sharp from 'sharp';

/** A4 @ 300 DPI, print-ready. */
export const A4_WIDTH = 2480;
export const A4_HEIGHT = 3508;

export type A4Layout = 'full' | 'bleed';

export interface ComposeA4Options {
  layout?: A4Layout;
  /**
   * Line thinning. Image models draw coloring-book outlines too heavy; trimming
   * the anti-aliased fringe isn't enough because the stroke has a SOLID black
   * core. So we erode it: blur softens the core's edges, then a low threshold
   * keeps only a narrower core => visibly thinner, even lines.
   *
   * `lineBlur` = erosion radius (px, at the model's native ~1.6k width).
   * `lineThreshold` = gray cut point; LOWER = thinner. Set lineThreshold to 0 to
   * disable erosion (falls back to grayscale + contrast normalise).
   * Defaults thin aggressively (the "C" setting we tuned on real output).
   */
  lineBlur?: number;
  lineThreshold?: number;
}

/** White safe-zone around the art in 'full' mode (px). ~12mm — guarantees the
 * subject never touches the page edge even if the model drew it tight. */
const FULL_MARGIN = 140;

/** Erode the black strokes to a thinner, even weight (blur the solid core, then
 * re-threshold to a narrower core). lineThreshold=0 disables (just normalise). */
function processLines(buf: Buffer, lineBlur: number, lineThreshold: number): sharp.Sharp {
  const p = sharp(buf).flatten({ background: '#ffffff' }).grayscale();
  return lineThreshold > 0 ? p.blur(lineBlur).threshold(lineThreshold) : p.normalise();
}

export async function composeA4Page(
  lineArt: Buffer,
  opts: ComposeA4Options = {},
): Promise<Buffer> {
  const { layout = 'full', lineBlur = 2.6, lineThreshold = 72 } = opts;

  const prep = (buf: Buffer): sharp.Sharp => processLines(buf, lineBlur, lineThreshold);

  if (layout === 'bleed') {
    // Cover the whole page — the cropped subject runs off an edge. Anchor to the
    // top so a face/head stays intact and the bottom bleeds off. No trim (the
    // bleed is intentional).
    return prep(lineArt)
      .resize(A4_WIDTH, A4_HEIGHT, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();
  }

  // full: trim the model's surrounding whitespace, then fit the whole subject
  // inside a content box with a margin so it never touches the edge, centered on
  // a white A4 canvas.
  const contentW = A4_WIDTH - FULL_MARGIN * 2;
  const contentH = A4_HEIGHT - FULL_MARGIN * 2;

  const artBuf = await prep(lineArt)
    .trim({ background: '#ffffff', threshold: 10 })
    .resize(contentW, contentH, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();

  const artMeta = await sharp(artBuf).metadata();
  const artW = artMeta.width ?? contentW;
  const artH = artMeta.height ?? contentH;
  const left = Math.round((A4_WIDTH - artW) / 2);
  const top = Math.round((A4_HEIGHT - artH) / 2);

  return sharp({
    create: {
      width: A4_WIDTH,
      height: A4_HEIGHT,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite([{ input: artBuf, top, left }])
    .png()
    .toBuffer();
}
