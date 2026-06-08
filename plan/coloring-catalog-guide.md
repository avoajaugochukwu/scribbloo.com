# Coloring-page catalog & generation workflow

How coloring pages are named, prompted, and generated. The catalog is the
**single source of truth**; everything else derives from it. It lives as split
JSON files in [`scripts/catalog/data/*.json`](../scripts/catalog/data) (one per
theme/collection, so it breaks down as it grows), merged + validated by
[`scripts/catalog/catalog.ts`](../scripts/catalog/catalog.ts).

## Pipeline at a glance

```
catalog.ts entry ──► Grok (xai/grok-imagine-image on fal, 2:3, 2k, png)
                 ──► composeA4Page() : erode lines thin + fit to A4 2480×3508
                 ──► writeColoringPage() : original.png + full.webp + thumb.webp + .mdx
```

- **Model:** fal-hosted Grok. Reuses `FAL_API_KEY` (no separate xAI key).
- **Line weight is fixed in post**, not left to the model: `composeA4Page`
  (`scripts/lib/frameA4.ts`) erodes the strokes to a thin, even weight
  (`lineBlur` / `lineThreshold`). Lower `lineThreshold` = thinner.
- **No border is baked in.** A border is an optional user choice at *download*
  time (the detail page "Add a border" toggle → `pdf.worker.js`).

## The two rules that matter

### 1. Short, search-friendly NAMES
The `name` becomes the page title and (slugified) the URL slug, so it doubles as
the keyword. Keep them short and concrete:

> Cute Unicorn · Unicorn in Garden · Unicorn in Rainbow · Baby Elephant · Cozy Reading Nook

Avoid long sentences, punctuation, and synonym duplicates (one canonical name per
page — see `plan/url-structure-guide.md`).

### 2. A bespoke full-sentence PROMPT per page
A one-line title wrapped in a fixed template makes **every generation converge on
the same generic look**. So each entry carries its own full-sentence `prompt`
describing the subject, pose, setting, and details. Write the *subject only* — the
coloring-book style + composition boilerplate is added automatically by
`buildColoringPrompt()` (`scripts/lib/fal.ts`). Keep every prompt distinct.

```json
{
  "name": "Unicorn in Garden",
  "subject": "fantasy/unicorn",
  "tags": ["unicorn", "garden"],
  "layout": "full",
  "prompt": "a gentle unicorn standing in a flower garden, lowering its head to sniff a big blossom, a flowing mane and spiral horn, tall flowers and butterflies around it"
}
```

**Layout:** `full` = the whole subject sits inside the page and doesn't touch the
edges (most pages). `bleed` = a cropped close-up (e.g. a head/"passport") that
runs off an edge; framed to cover the page, anchored to the top.

## Batch workflow — fanning out to new types

This is the repeatable loop for growing the catalog. You give a direction; I do
the fan-out:

1. **You** name a theme or instruction (e.g. "more unicorns", "ocean animals",
   "things for a winter set").
2. **I fan out** to multiple *new* page types we don't already have — checking the
   catalog so we don't duplicate — and invent a short name for each.
3. **I author a distinct full-sentence prompt** for every new name.
4. **I append** the entries to the matching `scripts/catalog/data/<theme>.json`
   (or a new file there), under the right `subject` — create the collection first
   if it's new (see below).
5. **Generate**: `npm run generate:catalog` pushes the new entries to Grok.

Because names + prompts live in the catalog, the set is reviewable *before* we
spend anything, and reproducible after.

## Running it

> Scripts need **Node ≥ 20** (the repo's nvm Node, e.g.
> `~/.nvm/versions/node/v22.22.0/bin/node`). The system Node 18.17 is too old for
> `node --import tsx`.

```bash
# preview the whole plan, no API calls, no writes
npm run generate:catalog -- --dry-run

# generate everything that isn't already migrated to Grok (resumable)
npm run generate:catalog

# scope it
npm run generate:catalog -- --subject fantasy/unicorn
npm run generate:catalog -- --only cute-unicorn,unicorn-in-garden
npm run generate:catalog -- --limit 3        # quick test batch
npm run generate:catalog -- --force          # redo even already-grok pages
```

- **Resumable:** pages already on `source: grok` are skipped (unless `--force`),
  so if fal balance runs out mid-run, top up and re-run — no double spend.
- **Cost:** every generation hits the paid fal API. Use `--dry-run` / `--limit`
  first.

## Adding a NEW collection

`writeColoringPage` refuses to create a leaf in a folder that isn't a collection
(no `_category.mdx`) — this guard stops the old flat layout from creeping back.
Before adding catalog entries under a brand-new `subject`, create the collection:

```bash
# either author content/coloring-pages/<path>/_category.mdx by hand,
# or use the category writer in scripts/lib/writeColoringPage.ts (writeCategory).
npm run validate    # confirms the tree is well-formed
```

The sitemap and routing pick up new collections/leaves automatically (see
`CLAUDE.md` → URL structure).
