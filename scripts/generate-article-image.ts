/**
 * Generate colorful "Storybook Retro" hero images for article/doc pages
 * (how-to-draw, drawing-ideas, blog) with fal-hosted Grok and write them to
 * public/images/<namespace>/<slug>/{featured-original.png,featured.webp}.
 *
 * The MDX is authored by hand (with `featuredImage: featured.webp` in
 * frontmatter); this script only produces the image files.
 *
 *   # one image
 *   npm run generate:article -- --namespace how-to-draw --slug how-to-draw-rose \
 *     --prompt "a single blooming red rose with a couple of green leaves, centered"
 *
 *   # a batch (JSON array of { namespace, slug, prompt, aspectRatio? })
 *   npm run generate:article -- --manifest scripts/article-images.batch.json
 *
 * Flags: --aspect 3:2|4:3|16:9|1:1 (default 3:2) · --force · --dry-run
 *
 * DO NOT run for real without intent — every generation costs fal money.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  generateArticleImage,
  downloadToBuffer,
  buildArticlePrompt,
  type ArticleAspectRatio,
} from './lib/fal';
import { writeArticleImage } from './lib/writeColoringPage';

process.loadEnvFile?.('.env');

interface Job {
  namespace: string;
  slug: string;
  prompt: string;
  aspectRatio?: ArticleAspectRatio;
}

interface ParsedArgs {
  manifest?: string;
  namespace?: string;
  slug?: string;
  prompt?: string;
  aspect: ArticleAspectRatio;
  force: boolean;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { aspect: '3:2', force: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const val = () => {
      const eq = arg.indexOf('=');
      return eq !== -1 ? arg.slice(eq + 1) : argv[++i];
    };
    if (arg === '--manifest' || arg.startsWith('--manifest=')) out.manifest = val();
    else if (arg === '--namespace' || arg.startsWith('--namespace=')) out.namespace = val();
    else if (arg === '--slug' || arg.startsWith('--slug=')) out.slug = val();
    else if (arg === '--prompt' || arg.startsWith('--prompt=')) out.prompt = val();
    else if (arg === '--aspect' || arg.startsWith('--aspect=')) out.aspect = val() as ArticleAspectRatio;
    else if (arg === '--force') out.force = true;
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
  }
  return out;
}

async function loadJobs(args: ParsedArgs): Promise<Job[]> {
  if (args.manifest) {
    const raw = await fs.readFile(path.resolve(args.manifest), 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Manifest must be a JSON array of jobs.');
    return parsed as Job[];
  }
  if (args.namespace && args.slug && args.prompt) {
    return [{ namespace: args.namespace, slug: args.slug, prompt: args.prompt, aspectRatio: args.aspect }];
  }
  throw new Error('Provide --manifest <file> OR --namespace --slug --prompt.');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: npm run generate:article -- --manifest <file> | --namespace <ns> --slug <slug> --prompt <text> [--aspect 3:2] [--force] [--dry-run]');
    return;
  }

  const jobs = await loadJobs(args);
  console.log(`${jobs.length} job(s)${args.dryRun ? ' (dry run)' : ''}`);

  let made = 0;
  let skipped = 0;
  let failed = 0;

  for (const job of jobs) {
    const tag = `${job.namespace}/${job.slug}`;
    if (args.dryRun) {
      console.log(`• [dry] ${tag}\n    ${buildArticlePrompt(job.prompt).slice(0, 140)}…`);
      continue;
    }
    try {
      const { imageUrl, revisedPrompt } = await generateArticleImage({
        prompt: job.prompt,
        aspectRatio: job.aspectRatio ?? args.aspect,
      });
      const buffer = await downloadToBuffer(imageUrl);
      const res = await writeArticleImage({
        namespace: job.namespace,
        slug: job.slug,
        image: buffer,
        force: args.force,
      });
      if (res.skipped) {
        skipped++;
        console.log(`↷ skip (exists) ${tag}`);
      } else {
        made++;
        console.log(`✓ ${tag}${revisedPrompt ? `  (grok revised prompt)` : ''}`);
      }
    } catch (err) {
      failed++;
      console.error(`✗ ${tag}: ${(err as Error).message}`);
    }
  }

  console.log(`\nDone — ${made} made, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
