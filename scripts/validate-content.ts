/**
 * Content validation gate. Runs as `prebuild`, so a bad content tree FAILS the
 * build instead of silently shipping broken pages.
 *
 *   npm run validate           # standalone
 *   npm run build              # runs this first (prebuild)
 *
 * ERRORS (exit 1): invalid frontmatter, a folder with leaves but no _category.mdx,
 * a file/folder name collision (ambiguous URL), a missing image folder (local mode),
 * a facet with no facetTag.
 * WARNINGS (exit 0): slug≠filename, a facet whose tag matches no leaves, a missing
 * image variant.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { categorySchema, coloringPageSchema } from '../lib/content/types';

const ROOT = process.cwd();
const CP = path.join(ROOT, 'content', 'coloring-pages');
const FAC = path.join(ROOT, 'content', 'facets');
const IMG = path.join(ROOT, 'public', 'images', 'coloring-pages');
const CDN = !!process.env.NEXT_PUBLIC_IMAGE_BASE_URL; // images checked locally only when no CDN
const VARIANTS = ['thumb.webp', 'full.webp', 'original.png'];

const errors: string[] = [];
const warnings: string[] = [];
const E = (m: string) => errors.push(m);
const W = (m: string) => warnings.push(m);

const allTags = new Set<string>();

function walk(absDir: string, rel: string[]) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const dirNames = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
  const leafFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.mdx') && e.name !== '_category.mdx');
  const hasCategory = entries.some((e) => e.isFile() && e.name === '_category.mdx');
  const here = rel.join('/') || '(root)';

  // a folder that holds leaves must be a listing node (root may not hold leaves)
  if (leafFiles.length && !hasCategory) {
    E(`${here}: ${leafFiles.length} leaf file(s) but no _category.mdx (listing would 404 / leaves orphaned)`);
  }

  // collection frontmatter
  if (hasCategory && rel.length) {
    const { data } = matter(fs.readFileSync(path.join(absDir, '_category.mdx'), 'utf8'));
    const parsed = categorySchema.safeParse({ ...data, slug: data.slug ?? rel[rel.length - 1] });
    if (!parsed.success) E(`${here}/_category.mdx: invalid frontmatter — ${fmtZod(parsed.error)}`);
    for (const k of ['parent', 'kind']) {
      if (k in data) W(`${here}/_category.mdx: old-model field "${k}:" present — the folder defines the tree now; remove it`);
    }
  }

  for (const e of leafFiles) {
    const slug = e.name.slice(0, -4);
    if (dirNames.has(slug)) E(`${here}/${e.name}: collides with folder "${slug}/" (ambiguous URL ${here}/${slug})`);
    const { data } = matter(fs.readFileSync(path.join(absDir, e.name), 'utf8'));
    const parsed = coloringPageSchema.safeParse({ ...data, slug: data.slug ?? slug });
    if (!parsed.success) {
      E(`${here}/${e.name}: invalid frontmatter — ${fmtZod(parsed.error)}`);
      continue;
    }
    const leaf = parsed.data;
    if (leaf.slug !== slug) W(`${here}/${e.name}: frontmatter slug "${leaf.slug}" ≠ filename "${slug}" (filename wins for the URL)`);
    for (const k of ['categories', 'subject', 'parent']) {
      if (k in data) W(`${here}/${e.name}: old-model field "${k}:" present — the folder is the home now; remove it`);
    }
    leaf.tags.forEach((t) => allTags.add(t));
    if (!CDN) checkImage(leaf.image, `${here}/${e.name}`);
  }

  for (const name of dirNames) walk(path.join(absDir, name), [...rel, name]);
}

function checkImage(image: string, where: string) {
  const dir = path.join(IMG, image);
  if (!fs.existsSync(dir)) {
    E(`${where}: image folder public/images/coloring-pages/${image}/ does not exist`);
    return;
  }
  for (const v of VARIANTS) if (!fs.existsSync(path.join(dir, v))) W(`${where}: missing image variant ${image}/${v}`);
}

function fmtZod(err: { issues: { path: (string | number)[]; message: string }[] }) {
  return err.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

// --- run ---
if (!fs.existsSync(CP)) {
  console.error('content/coloring-pages not found');
  process.exit(1);
}
// Tripwire: the old flat model's dir must never reappear (a legacy script ran).
if (fs.existsSync(path.join(ROOT, 'content', 'categories'))) {
  E('content/categories/ exists — that is the OLD model. Collections are now content/coloring-pages/<path>/_category.mdx. A legacy script (build-categories / migrate-*) likely ran.');
}
walk(CP, []);

// facets
if (fs.existsSync(FAC)) {
  for (const f of fs.readdirSync(FAC).filter((n) => n.endsWith('.mdx'))) {
    const { data } = matter(fs.readFileSync(path.join(FAC, f), 'utf8'));
    const parsed = categorySchema.safeParse({ ...data, slug: data.slug ?? f.slice(0, -4) });
    if (!parsed.success) {
      E(`facets/${f}: invalid frontmatter — ${fmtZod(parsed.error)}`);
      continue;
    }
    const facet = parsed.data;
    if (!facet.facetTag) E(`facets/${f}: a facet must set facetTag (the leaf tag it aggregates)`);
    else if (!allTags.has(facet.facetTag)) W(`facets/${f}: facetTag "${facet.facetTag}" matches no leaf tags yet`);
  }
}

for (const w of warnings) console.warn(`  ⚠ ${w}`);
for (const e of errors) console.error(`  ✖ ${e}`);
console.log(`\ncontent validation: ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length) process.exit(1);
