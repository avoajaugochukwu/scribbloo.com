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
   * Final line pass, applied LAST (after all resizing) by solidify(): blur the
   * strokes then threshold. This does two jobs at once — erodes the lines thinner
   * AND forces every ink pixel to pure #000000 (paper to pure white). Run last so
   * the threshold isn't re-greyed by a later resize.
   *
   * `lineBlur`  = erosion radius in px at the A4 (2480px) scale; higher = thinner.
   * `lineThreshold` = gray cut point; LOWER = thinner. Set to 0 to disable
   * (ships the grayscale art as-is, with soft anti-aliased edges).
   */
  lineBlur?: number;
  lineThreshold?: number;
}

/** White safe-zone around the art in 'full' mode (px). ~12mm — guarantees the
 * subject never touches the page edge even if the model drew it tight. */
const FULL_MARGIN = 140;

/** Tone-prep only: flatten onto white + grayscale, keeping the model's tones.
 * Thinning/solidifying happens LAST (see solidify), after all geometry. */
function toned(buf: Buffer): sharp.Sharp {
  return sharp(buf).flatten({ background: '#ffffff' }).grayscale();
}

/**
 * FINAL pass — runs after all resizing/compositing so its result is what ships.
 * blur softens stroke edges then threshold cuts a narrow core, which both erodes
 * the lines thinner AND forces every ink pixel to pure #000000 (and paper to pure
 * white). Doing this last is what guarantees solid black — a threshold before a
 * resize gets re-greyed by the interpolation. lineThreshold=0 → no-op.
 */
async function solidify(buf: Buffer, lineBlur: number, lineThreshold: number): Promise<Buffer> {
  if (lineThreshold <= 0) return buf;
  // Two passes on purpose: sharp applies blur/threshold in a fixed INTERNAL order
  // (not call order), so chaining .blur().threshold() lets the blur run last and
  // re-grey the edges. Materialising the blur to a buffer first forces threshold
  // to truly be the final op → pure #000000 ink + pure white paper.
  const blurred = lineBlur > 0
    ? await sharp(buf).grayscale().blur(lineBlur).png().toBuffer()
    : buf;
  return sharp(blurred).grayscale().threshold(lineThreshold).png().toBuffer();
}

export async function composeA4Page(
  lineArt: Buffer,
  opts: ComposeA4Options = {},
): Promise<Buffer> {
  // Blur radius is in px at the A4 (2480px) scale where solidify now runs.
  const { layout = 'full', lineBlur = 3.4, lineThreshold = 96 } = opts;

  if (layout === 'bleed') {
    // Cover the whole page — the cropped subject runs off an edge. Anchor to the
    // top so a face/head stays intact and the bottom bleeds off. No trim (the
    // bleed is intentional).
    const covered = await toned(lineArt)
      .resize(A4_WIDTH, A4_HEIGHT, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();
    return solidify(covered, lineBlur, lineThreshold);
  }

  // full: trim the model's surrounding whitespace, then fit the whole subject
  // inside a content box with a margin so it never touches the edge, centered on
  // a white A4 canvas.
  const contentW = A4_WIDTH - FULL_MARGIN * 2;
  const contentH = A4_HEIGHT - FULL_MARGIN * 2;

  const artBuf = await toned(lineArt)
    .trim({ background: '#ffffff', threshold: 10 })
    .resize(contentW, contentH, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();

  const artMeta = await sharp(artBuf).metadata();
  const artW = artMeta.width ?? contentW;
  const artH = artMeta.height ?? contentH;
  const left = Math.round((A4_WIDTH - artW) / 2);
  const top = Math.round((A4_HEIGHT - artH) / 2);

  const composed = await sharp({
    create: { width: A4_WIDTH, height: A4_HEIGHT, channels: 3, background: '#ffffff' },
  })
    .composite([{ input: artBuf, top, left }])
    .png()
    .toBuffer();

  return solidify(composed, lineBlur, lineThreshold);
}
