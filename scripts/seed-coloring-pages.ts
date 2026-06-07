/**
 * Seeds the 7 categories with fresh, full-quality coloring pages via fal.ai.
 *
 * ~3 pages per category (21 total). Idempotent: a page whose content file
 * already exists is skipped. After generation, each category's hero/thumbnail
 * is set by reusing one of its generated pages (no extra fal spend).
 *
 *   node --import tsx scripts/seed-coloring-pages.ts            # generate all
 *   node --import tsx scripts/seed-coloring-pages.ts --limit 1  # just the first (preview)
 *   node --import tsx scripts/seed-coloring-pages.ts --dry-run  # print plan, spend nothing
 *   node --import tsx scripts/seed-coloring-pages.ts --force    # overwrite existing
 *   node --import tsx scripts/seed-coloring-pages.ts --skip-category-art
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import matter from 'gray-matter';

process.loadEnvFile?.('.env');

import { slugify } from '@/lib/slug';
import { generateColoringImage, downloadToBuffer } from './lib/fal';
import { writeColoringPage, paths } from './lib/writeColoringPage';

interface Seed {
  cat: string;
  title: string;
  tags: string[];
  prompt: string;
}

const SEED: Seed[] = [
  // unicorn
  { cat: 'unicorn', title: 'Rainbow Unicorn', tags: ['unicorn', 'rainbow'], prompt: 'a cute unicorn with a flowing mane standing under a rainbow, large simple shapes for kids' },
  { cat: 'unicorn', title: 'Baby Unicorn with Stars', tags: ['unicorn', 'baby', 'stars'], prompt: 'an adorable baby unicorn surrounded by stars and little clouds, big simple outlines' },
  { cat: 'unicorn', title: 'Unicorn Castle', tags: ['unicorn', 'castle'], prompt: 'a unicorn in front of a magical fairy-tale castle with tall turrets' },
  // fairy
  { cat: 'fairy', title: 'Garden Fairy with Flowers', tags: ['fairy', 'flowers', 'garden'], prompt: 'a sweet fairy with butterfly wings sitting among large flowers in a garden' },
  { cat: 'fairy', title: 'Fairy on a Mushroom', tags: ['fairy', 'mushroom'], prompt: 'a little fairy sitting on a big toadstool mushroom, whimsical and cute' },
  { cat: 'fairy', title: 'Flying Fairy with Wand', tags: ['fairy', 'wand', 'magic'], prompt: 'a fairy flying and holding a magic wand with sparkles around her' },
  // animals
  { cat: 'animals', title: 'Cute Puppy', tags: ['animals', 'dog', 'puppy'], prompt: 'an adorable fluffy puppy sitting with big friendly eyes, simple bold outlines' },
  { cat: 'animals', title: 'Baby Elephant', tags: ['animals', 'elephant'], prompt: 'a cute baby elephant with big ears in a playful pose' },
  { cat: 'animals', title: 'Friendly Lion', tags: ['animals', 'lion'], prompt: 'a friendly smiling lion with a fluffy mane, cartoon style for kids' },
  // nature
  { cat: 'nature', title: 'Flower Bouquet', tags: ['nature', 'flowers'], prompt: 'a bouquet of assorted blooming flowers in a vase, bold clean outlines' },
  { cat: 'nature', title: 'Tree with Birds', tags: ['nature', 'tree', 'birds'], prompt: 'a big leafy tree with a couple of cute birds perched on its branches' },
  { cat: 'nature', title: 'Mountain Landscape', tags: ['nature', 'mountains', 'landscape'], prompt: 'a simple scenic landscape with mountains, a sun and fluffy clouds' },
  // fantasy
  { cat: 'fantasy', title: 'Friendly Dragon', tags: ['fantasy', 'dragon'], prompt: 'a cute friendly cartoon dragon with small wings, smiling' },
  { cat: 'fantasy', title: 'Magic Castle', tags: ['fantasy', 'castle'], prompt: 'a grand magical castle with many towers and flags on a hill' },
  { cat: 'fantasy', title: 'Wizard with Wand', tags: ['fantasy', 'wizard', 'magic'], prompt: 'a friendly wizard with a tall pointed hat holding a magic wand and a star' },
  // cozy
  { cat: 'cozy', title: 'Cozy Cat by the Window', tags: ['cozy', 'cat'], prompt: 'a content cat curled up on a windowsill with a plant and a warm cup, cozy scene' },
  { cat: 'cozy', title: 'Hot Cocoa and Blanket', tags: ['cozy', 'cocoa', 'winter'], prompt: 'a steaming mug of hot cocoa with marshmallows next to a folded blanket and a book' },
  { cat: 'cozy', title: 'Cozy Reading Nook', tags: ['cozy', 'books', 'reading'], prompt: 'a cozy reading nook with a comfy armchair, a stack of books, a lamp and a plant' },
  // girl
  { cat: 'girl', title: 'Girl with Balloons', tags: ['girl', 'balloons'], prompt: 'a happy girl holding a bunch of balloons, simple cheerful style' },
  { cat: 'girl', title: 'Princess Dress', tags: ['girl', 'princess'], prompt: 'a girl wearing a beautiful princess dress and a small crown, twirling happily' },
  { cat: 'girl', title: 'Girl and Her Kitten', tags: ['girl', 'kitten', 'cat'], prompt: 'a girl gently hugging a cute kitten, warm friendly scene' },
];

const args = process.argv.slice(2);
const hasFlag = (f: string) => args.includes(f);
const getOpt = (f: string) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const DRY = hasFlag('--dry-run');
const FORCE = hasFlag('--force');
const SKIP_ART = hasFlag('--skip-category-art');
const LIMIT = getOpt('--limit') ? Number(getOpt('--limit')) : Infinity;

/** Reuse a generated page's original.png as the category hero + thumbnail. */
async function setCategoryArt(catSlug: string, pageSlug: string): Promise<boolean> {
  const src = path.join(paths.COLORING_PAGE_IMAGES_DIR, pageSlug, 'original.png');
  try {
    await fs.access(src);
  } catch {
    return false;
  }
  const imageDir = path.join(paths.CATEGORY_IMAGES_DIR, catSlug);
  await fs.mkdir(imageDir, { recursive: true });
  const png = await fs.readFile(src);
  await fs.writeFile(path.join(imageDir, 'hero-original.png'), png);
  await fs.writeFile(
    path.join(imageDir, 'hero.webp'),
    await sharp(png).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 90, effort: 6 }).toBuffer(),
  );
  await fs.writeFile(
    path.join(imageDir, 'thumb.webp'),
    await sharp(png).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 85, effort: 6 }).toBuffer(),
  );

  // Patch ONLY the image fields in the existing category mdx (preserve seoDetails).
  const mdxPath = path.join(paths.CATEGORIES_CONTENT_DIR, `${catSlug}.mdx`);
  try {
    const raw = await fs.readFile(mdxPath, 'utf8');
    const parsed = matter(raw);
    parsed.data.heroImage = 'hero.webp';
    parsed.data.thumbnailImage = 'thumb.webp';
    await fs.writeFile(mdxPath, matter.stringify(parsed.content, parsed.data), 'utf8');
  } catch {
    console.warn(`  (no category mdx to patch for ${catSlug})`);
  }
  return true;
}

async function main() {
  if (!process.argv.includes('--i-understand-legacy')) {
    throw new Error(
      'DEPRECATED: seed-coloring-pages.ts was the original 21-page seed (done) and spends fal credits. ' +
        'Its category mapping predates the folder model. Use `npm run generate -- --subject <path>` instead.',
    );
  }
  const items = SEED.slice(0, LIMIT === Infinity ? SEED.length : LIMIT);
  console.log(`Seeding ${items.length} coloring page(s)${DRY ? ' [DRY RUN]' : ''}…\n`);

  const generatedByCat = new Map<string, string>(); // cat -> first page slug
  let made = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const seed of items) {
    const slug = slugify(seed.title);
    if (!generatedByCat.has(seed.cat)) generatedByCat.set(seed.cat, slug);

    if (DRY) {
      console.log(`would generate: [${seed.cat}] "${seed.title}" -> ${slug}`);
      continue;
    }

    try {
      const { imageUrl, requestId } = await generateColoringImage({ prompt: seed.prompt });
      const buffer = await downloadToBuffer(imageUrl);
      const res = await writeColoringPage({
        slug,
        title: seed.title,
        description: `${seed.title} — free printable ${seed.cat} coloring page for kids and adults.`,
        subject: seed.cat,
        tags: seed.tags,
        source: 'fal',
        falRequestId: requestId,
        image: buffer,
        force: FORCE,
      });
      if (res.skipped) {
        skipped++;
        console.log(`• skipped (exists): ${slug}`);
      } else {
        made++;
        console.log(`✓ generated: [${seed.cat}] ${slug} (${res.longEdge}px)`);
      }
    } catch (err) {
      failures.push(`${slug}: ${(err as Error).message}`);
      console.error(`✗ FAILED: ${slug} — ${(err as Error).message}`);
    }
  }

  if (!DRY && !SKIP_ART) {
    console.log('\nSetting category hero/thumbnail from a generated page…');
    for (const [cat, pageSlug] of generatedByCat) {
      const ok = await setCategoryArt(cat, pageSlug);
      console.log(`  ${ok ? '✓' : '–'} ${cat} ${ok ? `← ${pageSlug}` : '(no source image)'}`);
    }
  }

  console.log(`\nDone. generated=${made} skipped=${skipped} failed=${failures.length}`);
  if (failures.length) {
    console.log('Failures:\n' + failures.map((f) => '  - ' + f).join('\n'));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
