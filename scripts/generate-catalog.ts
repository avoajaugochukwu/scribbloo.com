/**
 * Batch-generate the coloring-page catalog (scripts/catalog/catalog.ts) via
 * fal-hosted Grok, framing each onto A4.
 *
 *   npm run generate:catalog -- [--subject <path>] [--only <slug,slug>]
 *                                [--force] [--dry-run] [--limit N]
 *
 * RESUMABLE BY DEFAULT: a page already generated at the current STYLE_VERSION is
 * skipped, so if you run out of fal balance mid-run you can top up and re-run
 * without paying for pages already done. Pages that are missing or predate the
 * current look (older styleVersion / old `source: fal`) are (re)generated. Bumping
 * STYLE_VERSION after a style change re-does only the outdated pages. --force redoes
 * everything.
 *
 * DO NOT run for real without intent — every generation costs money.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { slugify } from '@/lib/slug';
import { generateGrokColoringImage, downloadToBuffer, buildColoringPrompt, STYLE_VERSION } from './lib/fal';
import { composeA4Page } from './lib/frameA4';
import { writeColoringPage, paths } from './lib/writeColoringPage';
import { CATALOG, type CatalogEntry } from './catalog/catalog';

process.loadEnvFile?.('.env');

/* -------------------------------------------------------------------------- */
/* Args                                                                        */
/* -------------------------------------------------------------------------- */

interface Args {
  subject?: string;
  only: string[];
  force: boolean;
  dryRun: boolean;
  limit?: number;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const out: Args = { only: [], force: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const val = () => (arg.includes('=') ? arg.slice(arg.indexOf('=') + 1) : argv[++i] ?? '');
    const name = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg;
    switch (name) {
      case '--subject': out.subject = val(); break;
      case '--only': out.only = val().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--force': out.force = true; break;
      case '--dry-run': out.dryRun = true; break;
      case '--limit': out.limit = Number(val()) || undefined; break;
      case '--help': case '-h': out.help = true; break;
      default: break;
    }
  }
  return out;
}

const USAGE = `
generate-catalog — batch-generate coloring pages from scripts/catalog/catalog.ts

Usage:
  npm run generate:catalog -- [options]

Options:
  --subject <path>     Only this collection (e.g. "fantasy/unicorn").
  --only <slug,slug>   Only these page slugs (slugified names).
  --force              Regenerate even pages already migrated to Grok.
  --dry-run            Print the plan; no fal calls, no writes.
  --limit N            Stop after N generations (useful for a quick test batch).
  --help, -h           Show this help.

Notes:
  - Resumable: pages already generated at the current STYLE_VERSION are skipped
    (unless --force). Bumping STYLE_VERSION re-generates only the outdated ones.
  - Real generation costs money. Requires FAL_API_KEY in .env.
`.trim();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

interface Plan extends CatalogEntry {
  slug: string;
  contentPath: string;
}

interface ExistingMeta {
  source: string | null;
  styleVersion: number | null;
}

/** Existing frontmatter source + styleVersion, or nulls if the page is new. */
async function existingMeta(contentPath: string): Promise<ExistingMeta> {
  try {
    const data = matter(await fs.readFile(contentPath, 'utf8')).data;
    return {
      source: (data.source as string) ?? null,
      styleVersion: (data.styleVersion as number) ?? null,
    };
  } catch {
    return { source: null, styleVersion: null };
  }
}

function isBalanceError(err: unknown): boolean {
  const e = err as { status?: number; body?: { detail?: string }; message?: string };
  const msg = `${e?.body?.detail ?? ''} ${e?.message ?? ''}`.toLowerCase();
  return e?.status === 403 || msg.includes('locked') || msg.includes('balance') || msg.includes('forbidden');
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(USAGE); return; }

  // Build the work list (apply --subject / --only filters).
  let entries = CATALOG;
  if (args.subject) entries = entries.filter((e) => e.subject === args.subject);
  if (args.only.length) entries = entries.filter((e) => args.only.includes(slugify(e.name)));

  const plans: Plan[] = entries.map((e) => {
    const slug = slugify(e.name);
    return {
      ...e,
      slug,
      contentPath: path.join(paths.COLORING_PAGES_CONTENT_DIR, ...e.subject.split('/'), `${slug}.mdx`),
    };
  });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Catalog: ${CATALOG.length} pages, ${plans.length} selected${args.force ? ' (--force)' : ''}.\n`);

  for (const p of plans) {
    if (args.limit !== undefined && generated >= args.limit) {
      console.log(`\nReached --limit ${args.limit}; stopping.`);
      break;
    }

    const meta = await existingMeta(p.contentPath);
    // Resumable: skip pages already generated at the current look. A style/pipeline
    // change bumps STYLE_VERSION, which invalidates older pages so they re-generate
    // (and only those) — no --force, survives fal top-ups mid-rebuild.
    if (meta.source === 'grok' && meta.styleVersion === STYLE_VERSION && !args.force) {
      console.log(`skip  ${p.subject}/${p.slug} (already v${STYLE_VERSION})`);
      skipped++;
      continue;
    }

    const action =
      meta.source === null
        ? 'new'
        : `restyle v${meta.styleVersion ?? '?'}→v${STYLE_VERSION}`;
    if (args.dryRun) {
      console.log(`PLAN  ${p.subject}/${p.slug} [${p.layout}] (${action})`);
      console.log(`        ${buildColoringPrompt(p.prompt, p.layout)}`);
      continue;
    }

    process.stdout.write(`gen   ${p.subject}/${p.slug} [${p.layout}] (${action})… `);
    try {
      const { imageUrl, requestId, revisedPrompt } = await generateGrokColoringImage({
        prompt: p.prompt,
        layout: p.layout,
      });
      const raw = await downloadToBuffer(imageUrl);
      const framed = await composeA4Page(raw, { layout: p.layout });
      await writeColoringPage({
        slug: p.slug,
        title: p.name,
        subject: p.subject,
        tags: p.tags,
        source: 'grok',
        falRequestId: requestId,
        layout: p.layout,
        prompt: p.prompt,
        styleVersion: STYLE_VERSION,
        image: framed,
        force: true, // overwrite the old page during the rebuild
      });
      generated++;
      console.log(`ok${revisedPrompt ? ' (revised)' : ''}`);
    } catch (err) {
      failed++;
      console.log('FAILED');
      if (isBalanceError(err)) {
        console.error(
          `\nfal balance exhausted / account locked. Top up at ` +
            `https://fal.ai/dashboard/billing, then re-run — already-done pages are skipped.`,
        );
        break;
      }
      console.error(`  ${(err as Error).message ?? err}`);
    }
  }

  console.log(`\nDone. generated=${generated} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
