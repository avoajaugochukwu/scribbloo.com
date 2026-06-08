/**
 * THE COLORING-PAGE CATALOG — single source of truth for what pages exist and
 * how each one is generated.
 *
 * The data lives as split JSON files in ./data/*.json (one per theme/collection)
 * so it can be broken down and grown easily. This module globs them, validates
 * every entry, guards against duplicate slugs, and exposes the merged CATALOG.
 *
 * Why a bespoke `prompt` per page: a one-line title wrapped in a fixed style
 * template makes every Grok generation converge on the same generic look. Each
 * entry carries its OWN full-sentence prompt (the subject only — the coloring-book
 * style + composition boilerplate is added by buildColoringPrompt()).
 *
 * To add pages: drop entries into an existing ./data/<theme>.json or add a new
 * file there. See plan/coloring-catalog-guide.md.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { slugify } from '@/lib/slug';

export const catalogEntrySchema = z.object({
  /** short, search-friendly display name — becomes the page title + (slugified) the slug */
  name: z.string().min(1),
  /** collection folder under content/coloring-pages/, e.g. "animals" or "fantasy/unicorn" */
  subject: z.string().min(1),
  /** facet tags (drive cross-cutting listings + related links) */
  tags: z.array(z.string()).default([]),
  /** 'full' = whole subject inside the page; 'bleed' = cropped close-up that runs off an edge */
  layout: z.enum(['full', 'bleed']).default('full'),
  /** the full descriptive sentence(s) for THIS image — keep each one distinct */
  prompt: z.string().min(1),
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');

function loadCatalog(): CatalogEntry[] {
  const files = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const entries: CatalogEntry[] = [];
  const slugs = new Map<string, string>(); // slug -> source file (dup guard)

  for (const file of files) {
    const raw = readFileSync(path.join(DATA_DIR, file), 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`catalog/data/${file}: invalid JSON — ${(e as Error).message}`);
    }
    const arr = z.array(catalogEntrySchema).safeParse(parsed);
    if (!arr.success) {
      throw new Error(`catalog/data/${file}: ${arr.error.issues[0].path.join('.')} — ${arr.error.issues[0].message}`);
    }
    for (const entry of arr.data) {
      const slug = slugify(entry.name);
      const clash = slugs.get(slug);
      if (clash) {
        throw new Error(`catalog: duplicate slug "${slug}" ("${entry.name}") in ${file} and ${clash}`);
      }
      slugs.set(slug, file);
      entries.push(entry);
    }
  }
  return entries;
}

export const CATALOG: CatalogEntry[] = loadCatalog();
