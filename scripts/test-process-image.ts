/** Throwaway: probe Grok's ability to make a step-by-step "how to draw" sheet. */
import fs from 'node:fs';
import { fal } from '@fal-ai/client';

process.loadEnvFile?.('.env');
fal.config({ credentials: process.env.FAL_API_KEY! });

const variants: Array<{ name: string; prompt: string; aspect: string }> = [
  {
    name: 'grid6',
    aspect: '1:1',
    prompt:
      'a clean step-by-step how-to-draw tutorial sheet showing how to draw a simple rose in 6 numbered stages arranged in a 2x3 grid, each stage adds a little more, starting from a small circle and spiral guide, then petals, then leaves, ending in a finished clean outline rose, simple bold black line art on a plain white background, light gray guide lines, minimal and instructional, no shading, no color',
  },
  {
    name: 'row4',
    aspect: '16:9',
    prompt:
      'a how-to-draw tutorial strip showing four stages of drawing a cute cartoon cat left to right, stage 1 a circle and guide lines, stage 2 ears and face shapes, stage 3 body outline, stage 4 finished cat, simple black line art on white, each stage clearly separated, instructional, no color, no shading',
  },
];

async function one(v: (typeof variants)[number]) {
  const result = await fal.subscribe('xai/grok-imagine-image', {
    input: { prompt: v.prompt, aspect_ratio: v.aspect, resolution: '2k', output_format: 'png', num_images: 1 },
  });
  const url = (result.data as { images?: Array<{ url?: string }> }).images?.[0]?.url;
  if (!url) throw new Error('no image');
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const out = `/tmp/process-${v.name}.png`;
  fs.writeFileSync(out, buf);
  console.log(`✓ ${v.name} → ${out}`);
}

Promise.all(variants.map(one)).catch((e) => {
  console.error(e);
  process.exit(1);
});
