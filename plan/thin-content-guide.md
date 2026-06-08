# Thin-Content Guide

**The problem.** A coloring page is, at its core, one image + a download button. Search engines
lean on *text* to understand a page's context and value, so a bare image page reads as **"thin
content" / low value** and gets suppressed or de-indexed. At scale (50 → 1,000+ pages) this is the
single biggest quality risk to the site. This doc is the canonical policy for keeping every page
above the thin-content line.

**The mindset.** Shift every page from *"an automated directory entry for an image"* to *"a helpful
resource for a parent, teacher, or hobbyist."* Text must read as genuinely useful to a human, not
stuffed for the algorithm. If a paragraph wouldn't help a visitor, it doesn't belong.

---

## 1. Contextual text on every leaf — REQUIRED

Each printable leaf page carries **150–300 words** of unique, relevant text. Never the same
boilerplate across pages — duplicated text is its own thin-content signal. Draw from these angles
(pick what fits the subject; don't pad):

- **Description** — what the page depicts. *"This page features a Tyrannosaurus Rex standing beside
  an erupting volcano, with bold outlines and plenty of open space…"*
- **Coloring tips & inspiration** — palette suggestions, shading techniques, medium recommendations
  (watercolor vs. colored pencil vs. marker).
- **Educational context** — what a child gains: fine-motor skills, color recognition, or real
  subject knowledge (history, animals, biology) for older kids and adults.
- **Artistic detail** — the drawing's style: *"intricate mandala linework,"* *"simple bold outlines
  for toddlers,"* *"realistic shading guide."*

**How it's stored — DONE.** Each leaf carries a structured **`seoDetails`** block in frontmatter
(same schema as collections, `seoDetailsSchema` in `lib/content/types.ts`): an intro `paragraph`
(the 150–300 words), `printableTips` (coloring tips), and a short `faqs` list. It renders via
`components/seo-details/OtherDetails` at the bottom of the leaf detail page
(`app/coloring-pages/[[...path]]/page.tsx`) and is surfaced as `FAQPage` JSON-LD. We chose the
structured block over a free-form MDX body because it renders consistently, extracts to schema
(FAQ/HowTo) for free, and is reliable for the LLM generator to emit at 1,000+ pages.

The `description` frontmatter field stays — it's the one-line lead (meta description + `ImageObject`
schema + the lead paragraph on the page). `description`-**only** (no `seoDetails`) is still thin.

**Backfill + remaining gap.** The 21 pages that shipped with `description: null` were backfilled by
`scripts/seed-leaf-seo.ts` (a one-off; copy carried as data, merged via `gray-matter`). **Still
open:** the generator (`scripts/generate-coloring-page.ts`) does not yet emit `seoDetails` — when it
moves onto the folder model, have it author a unique `paragraph` + tips + FAQs per page so new pages
never ship thin.

## 2. Descriptive images — DONE, keep it that way

This is already enforced and documented in [`image-pipeline.md`](image-pipeline.md) and `CLAUDE.md`:

- **File / folder names** are the full long-tail phrase ending in `-coloring-page`
  (`cute-halloween-pumpkin-coloring-page`, never `pumpkin` or `IMG_0041`). The `image` key is the
  served folder name, so it's part of the image URL.
- **Alt text** is centralized in `coloringPageAlt()` (`lib/alt.ts`):
  `Printable hand-drawn <title> coloring page[ for <audience>]`. Never hand-write alt on a coloring
  image — both the card and the detail page call the helper.
- **Add a visible caption** below the image preview on the detail page. *(GAP — not yet rendered.)*
  A short human caption ("Free printable T-Rex coloring page — bold outlines, US Letter / A4") adds
  on-page text and reinforces the keyword for a visitor, not just a crawler.

## 3. Schema markup (structured data)

- **`ImageObject`** on every leaf — DONE (`page.tsx` emits it with `name`, `description`,
  `contentUrl`, `url`).
- **`BreadcrumbList`** on leaves and collections — DONE.
- **`CollectionPage`** on the top listing — DONE.
- **`HowTo`** — when a page (or tutorial) gives step-by-step instructions for coloring or drawing,
  emit `HowTo`. The collection `seoDetails.howToGuide` blocks are the natural source. *(GAP on
  coloring leaves; `/how-to-draw` tutorials are the prime candidate — wire it there.)*
- **`AggregateRating`** — only if/when real ratings exist (see §5). Never fabricate ratings; fake
  structured data is a manual-action risk.

## 4. Hub / collection pages carry their own depth — largely DONE

Don't ship a thin page per trivial variation. Group logically and make the **hub** substantial:

- Collection pages (`_category.mdx`) already support a rich `seoDetails` block — intro `paragraph`,
  `howToGuide`, `activityIdeas`, `printableTips`, and `faqs`. **Use them.** A category listing with
  no `seoDetails` and no `description` is a thin hub.
- Consolidate keyword synonyms into one canonical page + 301 aliases (the `aliases` field) rather
  than spinning up near-duplicate pages — see [`url-structure-guide.md`](url-structure-guide.md).
  Multiplying near-identical thin pages is worse than one strong page.
- Bundle related printables into a "pack"/"set" page where it makes sense, instead of ten separate
  one-image pages.

## 5. User-generated content (UGC) — FUTURE

Genuinely unique text/images that compound over time:

- **Comments / reviews** — let parents, teachers, artists describe how they used a page.
- **Completed-art gallery** — let visitors upload photos of their colored-in pages. Highly unique,
  on-topic images + captions, and a strong engagement signal.
- Feeds `AggregateRating` schema (§3) once real ratings exist.

Not built yet (no CMS/DB — site is file-based MDX). Revisit when there's a backend for it.

## 6. Interactive utility — FUTURE (`/tools`)

Google rewards utility beyond static images, and dwell time is a positive signal:

- **On-site coloring tool** — color the page in the browser (planned `/tools`, see
  [`tools.md`](tools.md)).
- **Multiple download formats** — high-res PDF, PNG, print-from-browser. (Print + border toggle
  already shipped; broaden formats over time.)

---

## Checklist — before publishing a coloring leaf

- [ ] 150–300 words of **unique** body text (description + tips/education/style), not boilerplate.
- [ ] Image folder + key is the full `…-coloring-page` long-tail phrase.
- [ ] Alt text comes from `coloringPageAlt()` (don't hand-write).
- [ ] Visible caption under the preview *(once §2 caption ships)*.
- [ ] `ImageObject` + `BreadcrumbList` JSON-LD present (automatic via the route).
- [ ] Lives at one canonical URL; synonyms are `aliases`, not new pages.
- [ ] Its hub/collection has a populated `seoDetails` block.
