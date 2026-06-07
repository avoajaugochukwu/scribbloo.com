# Writing Guide — read this first

This guide tells an AI writer **how** to turn any row in [`plan.md`](plan.md) into a publishable MDX file.
Each row is independent → safe to write many in parallel.

> **Content is folder-driven.** The folder a file lives in *is* its URL (see
> [`url-structure-guide.md`](url-structure-guide.md)). The `Path` column in `plan.md` tells you the
> URL; §3 maps that Path to the exact file to create. After writing, run `npm run validate` — the
> build fails on a bad tree.

---

## 1. What Scribbloo is
A free **coloring pages + drawing ideas** site for parents, teachers, kids, and hobby artists.
Two products on every page: *printable coloring sheets* and *learn-to-draw / drawing-inspiration* content.
Tone matches the **"Storybook Retro"** brand (warm, playful, nostalgic 70s-print feel) — friendly and encouraging, never stiff or salesy.

**Voice rules**
- Talk to one reader ("you", "your kids"). Short sentences. Grade-6 reading level.
- Warm + encouraging ("you've got this", "no skill needed"). A little whimsy, no cringe.
- US spelling. No em-dash walls. No "in today's fast-paced world" filler. No fake statistics.
- Never claim official affiliation with a brand/character (see §6 trademark note).

---

## 2. Batch workflow (per page)
1. Take a row from `plan.md`. Note its **Type** icon and its **`Path`** (the live URL).
2. Open its **brief** (linked) for the keyword targets.
3. Map `Path` → file with the table in **§3**, and use the matching **frontmatter schema** in **§4**.
4. Find the matching **template** in §8. Apply **SEO rules** (§5) and **internal links** (§7).
5. Run `npm run validate`, then the **checklist** (§9) before marking the row ✅.

---

## 3. Path → file (this is how the folder model works)

| Type | `Path` in plan.md | File you create |
|---|---|---|
| 📂 Collection (subject) | `/coloring-pages/<a>/<b>` | `content/coloring-pages/<a>/<b>/_category.mdx` |
| 📂 Facet (audience/style) | `/coloring-pages/<facet>` | `content/facets/<facet>.mdx` |
| ✏️ Tutorial | `/how-to-draw/<slug>` | `content/how-to-draw/<slug>.mdx` |
| 📝 Listicle | `/drawing-ideas/<slug>` | `content/drawing-ideas/<slug>.mdx` |
| 🛠️ Tool | `/tools/<slug>` | `content/tools/<slug>.mdx` |
| ✍️ Editorial article | `/blog/<slug>` | `content/blog/<slug>.mdx` |

Rules:
- **The filename (minus `.mdx`) is the URL slug.** A collection folder is named for its slug and holds
  its `_category.mdx`. To create a subcategory, just make the nested folder + its `_category.mdx`.
- **You do NOT hand-write individual coloring-page (leaf) files** — those are produced by the image
  pipeline ([`image-pipeline.md`](image-pipeline.md)) into `content/coloring-pages/<path>/<slug>.mdx`.
  You write the *collection* copy around them (`_category.mdx`) and the blog/tutorial/listicle/tool docs.
- A collection folder **must** contain `_category.mdx` (a folder with leaves but no `_category.mdx`
  fails validation).

---

## 4. Frontmatter schemas (copy exactly, fill the values)

### ✏️ Tutorial / 📝 Listicle / 🛠️ Tool → `content/<namespace>/<slug>.mdx`
Uses the simple **doc** schema; the body below the frontmatter is full MDX (rendered with the same
components as the blog — headings, lists, FAQ, etc. all work).
```yaml
---
slug: how-to-draw-rose          # = filename
title: How to Draw a Rose (Easy Step-by-Step)
description: >-
  1–2 sentence hook with the primary keyword (shown as the lead + meta description).
subtitle: A beginner-friendly, step-by-step rose tutorial.   # optional, shown under the H1
order: 165000                   # sort weight in the namespace index (use the brief's volume)
---
```
Body = Markdown/MDX after the closing `---` (this is where the steps / list / FAQ go — see §8).

### 📂 Collection (subject) → `content/coloring-pages/<path>/_category.mdx`
```yaml
---
slug: dinosaur                  # for metadata; the FOLDER defines the URL path
name: Dinosaur
description: >-
  60–120 word intro. Primary keyword in the first sentence. Who it's for + what's inside.
seoTitle: Dinosaur Coloring Pages - Free Printable Sheets   # ≤60 chars
seoMetaDescription: >-
  150–160 char meta description.
heroImage: hero.webp            # only if art exists; else omit
thumbnailImage: thumb.webp      # only if art exists; else omit
order: 99                       # ordering weight; lower = earlier
aliases: []                     # synonym slugs that 308 to this page (e.g. [dino, dinosaurs])
seoDetails:
  paragraph: >-
    Same as description (the on-page intro).
  howToGuideTitle: "🖨️ How-To Guide: Download & Print Your Dinosaur Coloring Pages"
  howToGuide:
    - { step: 1, title: Browse the collection, description: Pick your favorite sheets. }
    - { step: 2, title: Click download, description: One click for the high-res printable. }
    - { step: 3, title: Print at home or school, description: A4 or US Letter, "fit to page". }
    - { step: 4, title: Start coloring, description: Crayons, markers, or colored pencils! }
  activityIdeasTitle: "🎉 Activity Ideas"
  activityIdeas:
    - { title: ..., description: ... }   # 4–5 ideas
  printableTipsTitle: "📝 Printable Tips"
  printableTips:
    - segments:
        - { text: "Use heavier paper (32 lb / cardstock)", bold: true }
        - { text: " for smoother coloring and less bleed-through." }
---
```
There is **no** `parent`/`kind`/`categories` field — the folder location carries all of that.
Match the existing `content/coloring-pages/fantasy/unicorn/_category.mdx` for structure.

### 📂 Facet (cross-cutting audience/style) → `content/facets/<slug>.mdx`
```yaml
---
slug: for-kids
name: Coloring Pages for Kids
description: >-
  60–120 word intro for the audience landing.
seoTitle: Coloring Pages for Kids - Free Printable
seoMetaDescription: >-
  150–160 char meta.
facetTag: kids                  # REQUIRED — aggregates every leaf whose tags include this
order: 2
---
```

### ✍️ Editorial blog post → `content/blog/<slug>.mdx`
Full long-form article (rich MDX body). Schema: `slug, title, excerpt, metaDescription, author, tags,
featuredImage, publishedAt, status: Done, relatedCategories, relatedPages`. (Use this only for true
editorial posts — how-to/listicle content goes in its own namespace above.)

---

## 5. SEO rules (all page types)
- **Primary keyword**: in the `title`/`name`, the H1, the first 100 words, and the meta description. Use it once verbatim, then natural variations.
- **Secondary keywords** ("Also target" in the brief): each becomes an H2/H3 or appears naturally — never keyword-stuff.
- `title`/`seoTitle` ≤ 60 chars; meta description 150–160 chars. One H1 only; logical H2/H3 nesting.
- Add an **FAQ (2–4 Q&As)** from real "People Also Ask"-style questions. Front-load value: answer the query in the first paragraph.
- **Synonyms are ONE page, not many.** If the brief's variants are near-duplicates (dino/dinosaur/dinosaurs), they belong on a single canonical page via `aliases` — never separate files. (See `url-structure-guide.md` §5.)

---

## 6. Trademark note (important)
Some high-volume terms are **licensed characters** (Hello Kitty, Pokémon, Sonic, Bluey, Spider-Man, etc.).
- Real demand, but you must **not** imply official/licensed status.
- Use fan-style phrasing ("fan-art style", "inspired by") + a light disclaimer in the intro: _"Not affiliated with or endorsed by the rights holders — original fan-style drawings."_
- Prefer generic equivalents where intent allows ("cute kitty", "dinosaur", "race car"). When in doubt on a character page, flag rather than publish.

---

## 7. Internal linking
The cross-type link mesh is the main ranking lever — follow [`internal-linking.md`](internal-linking.md).
In short: every tutorial ↔ its matching collection; collections ↔ 2–3 sibling collections; listicles →
the tutorials they mention; everything → its cluster pillar. 3–6 links/page, descriptive anchors.
Wire blog cross-links via `relatedCategories` / `relatedPages`.

---

## 8. Per-type templates

### ✏️ Tutorial (`/how-to-draw`, ~900–1300 words, MDX body)
1. **Intro** (60–100 words): hook + primary keyword + "no experience needed".
2. **What you'll need**: short materials list.
3. **Step-by-step**: 5–8 numbered steps, basic shapes → details.
4. **Pro tips / common mistakes** (3–5 bullets).
5. **Variations** (cute / realistic / color ideas).
6. **FAQ** (2–4).
7. **CTA**: link the matching coloring collection.

### 📝 Listicle (`/drawing-ideas`, 1200–1800 words, MDX body)
1. Numbered title ("**40** Easy Things to Draw…") — deliver the number.
2. **Intro** (80–120 words), primary keyword in first 100 words.
3. **The ideas**: each = H3 + 1–3 sentences, grouped into 3–5 themed sections.
4. **Tips** section. 5. **FAQ** (2–4) + CTA to a tutorial or collection.

### 📂 Collection (`_category.mdx`)
- All copy lives in **frontmatter `seoDetails`** (§4); no long body needed.
- `description`/`paragraph`: 60–120 words, primary keyword first sentence.
- Fill `howToGuide` (≈5 steps), `activityIdeas` (4–5), `printableTips` (3–5).
- `seoTitle`: `"<Theme> Coloring Pages - Free Printable Sheets"`.

### 🛠️ Tool (`/tools`, MDX body)
1. Above-the-fold value prop + the tool/CTA. 2. **How it works** (3 steps).
3. **Use cases**. 4. **FAQ** (file types, print quality, is it free). 5. Internal links. Conversion-focused.

---

## 9. Pre-publish checklist
- [ ] File at the **Path→file** location from §3, filename = the brief's `slug`.
- [ ] Correct frontmatter schema for the type; valid YAML; ISO dates.
- [ ] `npm run validate` passes (no missing `_category.mdx`, no bad frontmatter).
- [ ] Primary keyword in title + H1 + first 100 words + meta. Secondary keywords natural; no stuffing.
- [ ] Synonyms folded into one page via `aliases` — not separate files.
- [ ] 3–6 internal links with descriptive anchors (§7).
- [ ] FAQ present. Title ≤60 chars, meta 150–160.
- [ ] Trademark phrasing handled if it's a character page (§6).
- [ ] Warm "Storybook Retro" voice; US spelling; no filler.
