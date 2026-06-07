/**
 * Generate a single coloring page with fal.ai and write it into the file-based
 * content layer.
 *
 *   npm run generate -- --title "Friendly Dragon" --categories fantasy,dragons \
 *     --tags dragon,cute --prompt "a friendly cartoon dragon"
 *
 * Steps:
 *   1. slugify(title) and check idempotency (skip if the page already exists,
 *      unless --force).
 *   2. Unless --dry-run, call fal.ai, download the image, and write the page
 *      (original.png + full.webp + thumb.webp + frontmatter MDX).
 *
 * DO NOT run for real without intent — every generation costs money.
 */

import path from 'node:path';
import { slugify } from '@/lib/slug';
import { generateColoringImage, downloadToBuffer, buildColoringPrompt } from './lib/fal';
import { writeColoringPage, paths } from './lib/writeColoringPage';

process.loadEnvFile?.('.env');

/* -------------------------------------------------------------------------- */
/* Arg parsing                                                                 */
/* -------------------------------------------------------------------------- */

interface ParsedArgs {
  title?: string;
  subject?: string;
  tags: string[];
  prompt?: string;
  force: boolean;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = {
    tags: [],
    force: false,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const takeValue = (): string => {
      const eq = arg.indexOf('=');
      if (eq !== -1) return arg.slice(eq + 1);
      return argv[++i] ?? '';
    };
    const name = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg;

    switch (name) {
      case '--title':
        out.title = takeValue();
        break;
      case '--subject':
        out.subject = takeValue();
        break;
      case '--tags':
        out.tags = splitList(takeValue());
        break;
      case '--prompt':
        out.prompt = takeValue();
        break;
      case '--force':
        out.force = true;
        break;
      case '--dry-run':
        out.dryRun = true;
        break;
      case '--help':
      case '-h':
        out.help = true;
        break;
      default:
        // ignore unknown args
        break;
    }
  }

  return out;
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const USAGE = `
generate-coloring-page — create a coloring page via fal.ai

Usage:
  npm run generate -- --title "<title>" --subject <folder/path> --tags <t1,t2> [options]

Required:
  --title "<text>"          Page title (also used as the slug + default prompt).
  --subject <folder/path>   Collection folder this leaf belongs to (e.g. "animals"
                            or "fantasy/unicorn"). Must already have _category.mdx.
  --tags <t1,t2,...>        Comma-separated tag names (drive facet listings).

Options:
  --prompt "<text>"         Override the generation prompt (defaults to --title).
  --force                   Overwrite an existing page with the same slug.
  --dry-run                 Validate + print the plan WITHOUT calling fal or writing files.
  --help, -h                Show this help.

Notes:
  - Real generation costs money. Use --dry-run to preview.
  - Requires FAL_API_KEY (format "id:secret") in .env.
`.trim();

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(USAGE);
    return;
  }

  const missing: string[] = [];
  if (!args.title) missing.push('--title');
  if (!args.subject) missing.push('--subject');
  if (args.tags.length === 0) missing.push('--tags');

  if (missing.length > 0) {
    console.error(`Error: missing required argument(s): ${missing.join(', ')}\n`);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  const title = args.title!;
  const subject = args.subject!;
  const slug = slugify(title);
  const prompt = args.prompt ?? title;

  const contentPath = path.join(paths.COLORING_PAGES_CONTENT_DIR, ...subject.split('/'), `${slug}.mdx`);
  const imageDir = path.join(paths.COLORING_PAGE_IMAGES_DIR, slug);

  console.log('Plan:');
  console.log(`  title       : ${title}`);
  console.log(`  slug        : ${slug}`);
  console.log(`  subject     : ${subject}`);
  console.log(`  tags        : ${args.tags.join(', ')}`);
  console.log(`  prompt      : ${prompt}`);
  console.log(`  full prompt : ${buildColoringPrompt(prompt)}`);
  console.log(`  content     : ${contentPath}`);
  console.log(`  images      : ${imageDir}/{original.png,full.webp,thumb.webp}`);
  console.log(`  force       : ${args.force}`);

  if (args.dryRun) {
    console.log('\n[dry-run] No fal call, no files written.');
    return;
  }

  // Idempotency pre-check (writeColoringPage also enforces this).
  const { promises: fs } = await import('node:fs');
  const exists = await fs
    .access(contentPath)
    .then(() => true)
    .catch(() => false);
  if (exists && !args.force) {
    console.log(`\nSkip: ${contentPath} already exists (use --force to overwrite).`);
    return;
  }

  console.log('\nCalling fal.ai…');
  const { imageUrl, requestId } = await generateColoringImage({ prompt });
  console.log(`  fal requestId: ${requestId}`);
  console.log(`  image url    : ${imageUrl}`);

  const buffer = await downloadToBuffer(imageUrl);

  const result = await writeColoringPage({
    slug,
    title,
    description: null,
    subject,
    tags: args.tags,
    source: 'fal',
    falRequestId: requestId,
    image: buffer,
    force: args.force,
  });

  if (result.skipped) {
    console.log(`\nSkipped (already existed): ${result.contentPath}`);
  } else {
    console.log(`\nWrote ${result.contentPath} (long edge: ${result.longEdge}px)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
