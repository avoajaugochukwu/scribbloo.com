# Writing Guide — read this first

This guide tells an AI writer **how** to turn any row in [`plan.md`](plan.md) into a publishable MDX file.
Each row is independent → safe to write many in parallel.

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
1. Take a row from `plan.md`. Open its **brief** (linked) for the keyword targets.
2. Find the matching **template** below by the row's type icon (✏️ tutorial · 📝 listicle · 📂 collection/category · 🛠️ tool).
3. Write the MDX file to the **path** in §3 using the **frontmatter schema** in §4.
4. Apply the **SEO rules** (§5) and add **internal links** (§7).
5. Run the **checklist** (§8) before marking the row ✅.

---

## 3. File paths & naming
| Type | Folder | Filename |
|---|---|---|
| ✏️ Tutorial, 📝 Listicle | `content/blog/` | `<slug>.mdx` |
| 📂 Collection / Category landing | `content/categories/` | `<slug>.mdx` |
| 🛠️ Tool landing | `app/<slug>/page.tsx` (or `content/blog/` if written as an article) | — |

`slug` is given in each brief. Keep it; don't invent a new one.
Coloring **collection** pages are *category* pages — the printable images are generated separately; you write the surrounding copy (frontmatter `seoDetails`). Do **not** fabricate image filenames beyond `heroImage: hero.webp` / `thumbnailImage: thumb.webp`.

---

## 4. Frontmatter schemas (copy exactly, fill the values)

### Blog post (tutorials + listicles) → `content/blog/<slug>.mdx`
```yaml
---
slug: how-to-draw-a-rose
title: How to Draw a Rose (Easy Step-by-Step for Beginners)
excerpt: >-
  A short 1–2 sentence hook that includes the primary keyword.
metaDescription: >-
  150–160 char meta. Primary keyword near the front, action + benefit, no clickbait.
author: null
tags:
  - drawing ideas        # 1–4 short topical tags
featuredImage: featured.webp
publishedAt: '2026-06-06T00:00:00.000Z'
status: Done
relatedCategories: []    # slugs of related category pages (see §7)
relatedPages: []         # slugs of related blog posts
---
```
Body = Markdown/MDX after the closing `---`.

### Coloring collection / category → `content/categories/<slug>.mdx`
```yaml
---
slug: dinosaur
name: Dinosaur
description: >-
  60–120 word intro paragraph. Primary keyword in the first sentence. Who it's for + what's inside.
seoTitle: Dinosaur Coloring Pages - Free Printable Sheets   # ≤60 chars
seoDescription: >-
  150–160 char meta description (same value can go in seoMetaDescription).
seoMetaDescription: >-
  Same as seoDescription.
heroImage: hero.webp
thumbnailImage: thumb.webp
order: 99                 # ordering weight; leave 99 unless told otherwise
seoDetails:
  paragraph: >-
    Same as description (the on-page intro).
  howToGuideTitle: "🖨️ How-To Guide: Download & Print Your Dinosaur Coloring Pages"
  howToGuide:
    - { step: 1, title: Browse the collection, description: Pick your favorite sheets. }
    - { step: 2, title: Click the download icon, description: One click for the high-res printable PDF. }
    - { step: 3, title: Open the file, description: Use any standard PDF viewer. }
    - { step: 4, title: Print at home or school, description: A4 or US Letter, "fit to page". }
    - { step: 5, title: Start coloring, description: Grab crayons, markers, or colored pencils! }
  activityIdeasTitle: "🎉 Activity Ideas Using Dinosaur Coloring Pages"
  activityIdeas:
    - { title: ..., description: ... }   # 4–5 ideas (party, quiet time, classroom, storytelling, themed week)
  printableTipsTitle: "📝 Printable Tips for the Best Coloring Experience"
  printableTips:
    - segments:
        - { text: "Use heavier paper (32 lb / cardstock)", bold: true }
        - { text: " for smoother coloring and less bleed-through." }
---
```
Match the existing `content/categories/unicorn.mdx` structure exactly — swap the theme word throughout.

---

## 5. SEO rules (all page types)
- **Primary keyword**: in the `title`/`name`, the H1, the first 100 words, and the meta description. Use it once verbatim, then use natural variations.
- **Secondary keywords** ("Also target" in the brief): each becomes an H2/H3 or appears naturally in body copy — don't keyword-stuff.
- `title`/`seoTitle` ≤ 60 chars; meta description 150–160 chars.
- One H1 only. Logical H2/H3 nesting. Add an **FAQ (2–4 Q&As)** using real "People Also Ask"-style questions from the brief's keywords (great for rich results).
- Front-load value: answer the query in the first paragraph.

---

## 6. Trademark note (important)
Some high-volume terms are **licensed characters** (Hello Kitty, Pokémon, Sonic, Bluey, Spider-Man, KPop Demon Hunters, etc.).
- These are real search demand, but you must **not** imply official/licensed status.
- Use descriptive, fan-style phrasing ("fan-art style", "inspired by") and a light disclaimer in the intro: _"Not affiliated with or endorsed by the rights holders — these are original fan-style drawings."_
- Prefer generic equivalents where intent allows (e.g. "cute kitty", "dinosaur", "race car"). When in doubt on a character page, flag it rather than publish.

---

## 7. Internal linking (do this every time)
- **Tutorial → Collection**: a "How to Draw a Dragon" post links to the **Dragon coloring pages** collection, and vice-versa. Add the partner slug to `relatedCategories` / `relatedPages`.
- **Collection → 2–3 sibling collections** in the same cluster (dinosaur ↔ animals ↔ dragon).
- **Listicle → relevant tutorials** it mentions ("…learn the steps in our [How to Draw a Rose] guide").
- Every new page should link to **the cluster's pillar page** (e.g. `coloring-pages` landing, `drawing-ideas` pillar).
- 3–6 internal links per page. Descriptive anchor text (the target keyword), never "click here".

---

## 8. Per-type templates

### ✏️ Tutorial (blog, ~900–1300 words)
1. **Intro** (60–100 words): the hook + primary keyword + "no experience needed".
2. **What you'll need**: short materials list (pencil, eraser, paper, optional markers).
3. **Step-by-step**: 5–8 numbered steps, each 1–3 sentences describing the strokes/shapes. Start from basic shapes → details.
4. **Pro tips / common mistakes** box (3–5 bullets).
5. **Variations** (e.g. cute version, realistic version, color ideas).
6. **FAQ** (2–4).
7. **CTA**: "Want to color it instead? Grab the free [X coloring pages]." → link the matching collection.

### 📝 Listicle (blog, 1200–1800 words)
1. Numbered title ("**40** Easy Things to Draw…"). Deliver the number you promise.
2. **Intro** (80–120 words) with primary keyword in first 100 words.
3. **The ideas**: each = H3 name + 1–3 sentences (what it is, why it's easy/fun, a quick tip). Group into 3–5 themed sections (Animals, Nature, Food…).
4. **How to get started / tips** section.
5. **FAQ** (2–4) + CTA to a relevant tutorial or coloring collection.

### 📂 Coloring collection / category (category MDX)
- All copy lives in **frontmatter `seoDetails`** (§4). No long body needed.
- `description`/`paragraph`: 60–120 words, primary keyword first sentence, who-it's-for + what's-inside + use cases (party, classroom, quiet time).
- Fill `howToGuide` (5 steps, swap theme word), `activityIdeas` (4–5), `printableTips` (3–5).
- `seoTitle` pattern: `"<Theme> Coloring Pages - Free Printable Sheets"`.

### 🛠️ Tool landing page
1. Above-the-fold: one-line value prop with the keyword + the tool/CTA (e.g. upload-photo widget).
2. **How it works** (3 steps).
3. **Use cases** (gifts, classroom, party favors, custom pet portraits).
4. **FAQ** (file types, print quality, is it free).
5. Internal links to popular collections. Conversion-focused, lighter on prose.

---

## 9. Pre-publish checklist
- [ ] File at the correct path with the exact `slug` from the brief.
- [ ] Frontmatter valid YAML, all required fields filled, dates ISO format.
- [ ] Primary keyword in title + H1 + first 100 words + meta.
- [ ] Secondary keywords used naturally; no stuffing.
- [ ] 3–6 internal links with descriptive anchors; `relatedCategories`/`relatedPages` set.
- [ ] FAQ present. Title ≤60 chars, meta 150–160.
- [ ] Trademark phrasing handled if it's a character page (§6).
- [ ] Reads in Scribbloo's warm "Storybook Retro" voice; US spelling; no filler.
