/**
 * Builds the 7 category content files (content/categories/*.mdx) purely from
 * repo data — no Supabase needed. Slugs match the live sitemap exactly so the
 * already-indexed category URLs are preserved. The rich FAQ/how-to content is
 * ported verbatim from components/seo-details/data via `allDetailsData`.
 *
 * Run:  node --import tsx scripts/build-categories.ts
 * Idempotent: rewrites all 7 files each run.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { allDetailsData } from '@/components/seo-details/data';
import { categorySchema } from '@/lib/content/types';

interface CatMeta {
  name: string;
  seoTitle: string;
  seoMetaDescription: string;
  order: number;
}

// slug -> display + SEO metadata. Slugs are the keys (must match the live sitemap).
const META: Record<string, CatMeta> = {
  unicorn: {
    name: 'Unicorn',
    seoTitle: 'Unicorn Coloring Pages - Free Printable Sheets',
    seoMetaDescription:
      'Free printable unicorn coloring pages for kids and adults. Download magical unicorn, rainbow, and fairy-tale sheets — high-quality PDFs ready to print at home.',
    order: 1,
  },
  fairy: {
    name: 'Fairy',
    seoTitle: 'Fairy Coloring Pages - Free Printable Sheets',
    seoMetaDescription:
      'Free printable fairy coloring pages. Magical fairies, delicate wings, and enchanted gardens to download and color — perfect for kids and relaxing adult coloring.',
    order: 2,
  },
  animals: {
    name: 'Animals',
    seoTitle: 'Animal Coloring Pages - Free Printable Sheets',
    seoMetaDescription:
      'Free printable animal coloring pages. Cute pets, wild animals, and more to download and print — fun, high-quality sheets for all ages.',
    order: 3,
  },
  nature: {
    name: 'Nature',
    seoTitle: 'Nature Coloring Pages - Free Printable Sheets',
    seoMetaDescription:
      'Free printable nature coloring pages — flowers, trees, landscapes and more. High-quality printable sheets for kids and adults to download and color.',
    order: 4,
  },
  fantasy: {
    name: 'Fantasy',
    seoTitle: 'Fantasy Coloring Pages - Free Printable Sheets',
    seoMetaDescription:
      'Free printable fantasy coloring pages — dragons, castles, magical worlds and more. High-quality printable sheets to download for kids and adults.',
    order: 5,
  },
  cozy: {
    name: 'Cozy',
    seoTitle: 'Cozy Coloring Pages - Free Printable Sheets',
    seoMetaDescription:
      'Free printable cozy coloring pages — warm, relaxing scenes to download and color. Perfect for mindful, calming coloring for kids and adults.',
    order: 6,
  },
  girl: {
    name: 'Girls',
    seoTitle: 'Coloring Pages for Girls - Free Printable Sheets',
    seoMetaDescription:
      'Free printable coloring pages for girls — cute, fun designs to download and print. High-quality sheets perfect for kids who love creative coloring.',
    order: 7,
  },
};

async function main() {
  const dir = path.join(process.cwd(), 'content', 'categories');
  await fs.mkdir(dir, { recursive: true });

  for (const [slug, meta] of Object.entries(META)) {
    const seoDetails = allDetailsData[slug];
    const description: string | null =
      (seoDetails && typeof seoDetails.paragraph === 'string' ? seoDetails.paragraph : null) ?? null;

    const frontmatter = categorySchema.parse({
      slug,
      name: meta.name,
      description,
      seoTitle: meta.seoTitle,
      seoDescription: meta.seoMetaDescription,
      seoMetaDescription: meta.seoMetaDescription,
      heroImage: null, // generated later via fal.ai
      thumbnailImage: null,
      order: meta.order,
      seoDetails: seoDetails ?? undefined,
    });

    const file = path.join(dir, `${slug}.mdx`);
    await fs.writeFile(file, matter.stringify('', frontmatter), 'utf8');
    console.log(`✓ wrote ${path.relative(process.cwd(), file)} (seoDetails: ${seoDetails ? 'yes' : 'no'})`);
  }

  console.log(`\nDone. ${Object.keys(META).length} categories written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
