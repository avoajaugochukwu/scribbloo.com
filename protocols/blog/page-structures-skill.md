---
name: page-structures
description: The content types Scribbloo ships. Blog posts (✏️ tutorials, 📝 listicles) render through the single route app/blog/[slug]/page.tsx; coloring collections (📂) render through a separate category route; tool pages (🛠️) are conversion-focused landings. Each type has a frontmatter shape, a body skeleton, and a word-count band. Pick the type from the keyword's intent before writing. Blog posts are plain-Markdown MDX (content/blog/<slug>.mdx) rendered by next-mdx-remote with a fixed component map — no custom JSX components, no GFM tables in bodies, no math rendering.
---

# Page Structures — The Scribbloo Content Types

> Scribbloo renders every blog post through **one** route: `app/blog/[slug]/page.tsx` reads `content/blog/<slug>.mdx`, validates frontmatter via `lib/content/blog.ts` + `lib/content/types.ts`, renders the H1 from the `title` field, then runs the MDX body through **`next-mdx-remote/rsc` `<MDXRemote>`** with a fixed component map in `components/mdx/MdxComponents.tsx`. That is the whole pipeline. The map styles only `h1–h4, p, ul, ol, li, blockquote, hr, strong, em, code, pre, a, img` — there are **no custom JSX components** (`AnswerBox`, `Callout`, `ProTip` do not exist), **no GFM tables** (no `remark-gfm`), **no auto heading IDs**, and **no math rendering** (`$…$` is not supported). The "shape" of a post is carried entirely by the Markdown body skeleton you choose. (Coloring collections and tool pages use different routes — see Types 3 and 4.)

Pick the type from the keyword's search intent. The value drives word count and snippet strategy. Every technique step is confirmed to actually produce the drawing (`accuracy-and-trust-skill.md`) and every factual claim is cited to a reputable source. Materials and vocabulary are used precisely — pencil grades, paper weight (lb / GSM), color terms, mediums, printing terms (`materials-and-terminology-skill.md`). These shapes mirror `plan/00-writing-guide.md` §8 — read it for the canonical templates.

---

## What replaces the missing JSX components

Because the body is plain Markdown (in an `.mdx` file), the two non-negotiable structural elements are built from Markdown primitives:

- **Answer box** → a **blockquote** near the top of the body (often right after a featured/inline image). The component map renders a `>` block as a terracotta/mustard-tinted box. This is the featured-snippet target and the orienting answer.
- **CTA / cross-link** → a normal **Markdown link** to the matching coloring collection or a related tutorial, placed immediately under the answer blockquote. Use the live route, e.g. `[free rose coloring pages](/coloring-pages/flowers)`.

Everything else is `##` / `###` headings, paragraphs, ordered/unordered lists, inline `code`, and Markdown images. **Don't invent JSX tags** — raw JSX needs a component in the map, which doesn't exist. If a comparison feels tabular, write it as a definition-style list, not a GFM table.

---

## Type index

| Type | Intent | Word count | Snippet play |
|---|---|---|---|
| ✏️ Drawing tutorial | "How to draw X" → step-by-step, route to the collection | 900-1,300 | Blockquote answer + numbered steps |
| 📝 Listicle | "N easy/cute things to draw" → grouped ideas | 1,200-1,800 | Blockquote answer + numbered list |
| 📂 Coloring collection / category | "X coloring pages" → themed printable landing | copy in `seoDetails` | Collection intro + how-to-print |
| 🛠️ Tool landing | "photo to coloring page" → conversion tool | lighter prose | Value prop + how-it-works |

Tutorials and listicles output to `content/blog/<slug>.mdx`. Coloring collections output to `content/categories/<slug>.mdx`. Tool pages are typically `app/<slug>/page.tsx` (or a blog article). All blog posts share the universal rules at the bottom.

---

## Frontmatter contract (blog posts: tutorials + listicles)

`lib/content/types.ts` validates **only** these fields. Anything else is rejected or ignored — do not invent fields.

```yaml
---
slug: how-to-draw-a-rose
title: How to Draw a Rose (Easy Step-by-Step for Beginners)
excerpt: >-
  Draw a rose in seven easy steps, starting from simple shapes — no skill needed.
metaDescription: >-
  Learn how to draw a rose step by step. A beginner-friendly tutorial with simple shapes, pro tips, and a free rose coloring page to print.
author: null
tags:
  - drawing tutorials
featuredImage: featured.webp
publishedAt: '2026-06-06T00:00:00.000Z'
status: Done
relatedCategories:
  - flowers
relatedPages: []
---
```

Field notes:

- `slug` — kebab-case, equals the filename without `.mdx`. Taken from the brief; don't invent a new one.
- `title` — serves as **both** the H1 and the `<title>` / meta title. There is one title field; there is no separate `metaTitle`. ≤ 60 chars. Do **not** repeat it as a `# H1` in the body.
- `excerpt` — a short 1–2 sentence on-page hook. Nullable.
- `metaDescription` — a **separate** 150–160 char SERP description. Don't conflate it with `excerpt`. Nullable.
- `author` — `null`, which renders as **"Scribbloo"** (the brand).
- `tags` — 1–4 short topical tags.
- `featuredImage` — filename only (`featured.webp`); the file lives at `public/images/blog/<slug>/featured.webp`. Nullable.
- `publishedAt` — ISO datetime string. There is **no** `dateModified` field; track updates via git or by adjusting this.
- `status` — `Done` publishes; anything else hides the post from listings.
- `relatedCategories` / `relatedPages` — slug arrays for cross-linking to coloring collections and sibling posts.

A single `BlogPosting` JSON-LD block is emitted **automatically** by the route. `BreadcrumbList`, FAQ, and HowTo schema are **not** emitted (optional future work) — so any FAQ content lives in the body as prose, not as a frontmatter field. See `seo-and-schema-skill.md`.

---

## Type 1 — ✏️ Drawing tutorial ("How to draw X")

**The core type.** One per drawing subject. Rank the "how to draw …" query, route to the matching coloring collection.
**Word count:** 900-1,300

### Body skeleton (no H1 — rendered from `title`)

```
![A finished pencil drawing of a rose](/images/blog/how-to-draw-a-rose/featured.webp)

> You can draw a rose in seven easy steps, starting with a simple spiral for the
> center, then wrapping petals around it and adding a stem and leaves. No
> experience needed — if you can draw a circle and a teardrop, you can draw this rose.

[Grab the free rose coloring pages](/coloring-pages/flowers)

## What you'll need
[A short materials list: pencil (HB or 2B), eraser, paper, optional fine-liner and markers.]

## How to draw a rose, step by step
[5–8 numbered steps. Each 1–3 sentences describing the shapes/strokes, building from
basic shapes → details. Add an inline step image where it helps: ![Step 2: petals
wrapping the spiral](/images/blog/how-to-draw-a-rose/inline-2.png).]

## Pro tips and common mistakes
[3–5 bullets: e.g. keep early lines light so you can erase, vary petal sizes, don't
make the spiral too tight.]

## Fun variations
[Cute version, realistic version, color ideas with colored pencils or markers.]

## Frequently asked questions
### [A real PAA question]
...

[One-line CTA back to the matching coloring collection.]
```

Every step must genuinely build the drawing in order — walk the sequence and confirm it (`accuracy-and-trust-skill.md`). The blockquote answer + the collection link are non-negotiable for this type.

---

## Type 2 — 📝 Listicle ("N things to draw")

**Numbered idea posts.** "40 easy things to draw", "cute drawing ideas for beginners". Deliver the number you promise. These win the round-up SERP and feed lots of internal links to tutorials.
**Word count:** 1,200-1,800. `tags` includes the theme.

### Body skeleton

```
![A grid of simple beginner drawings](/images/blog/easy-things-to-draw/featured.webp)

> Looking for easy things to draw? Here are 40 beginner-friendly ideas, grouped by
> theme — animals, nature, food, and more. Each one starts from simple shapes, so
> you can pick any and start sketching today. No skill needed.

[Browse all our drawing tutorials](/drawing-ideas)

## How to use this list
[80–120 words. Primary keyword in the first 100 words. Encourage picking one and starting.]

## Easy animals to draw
### A round cat
[1–3 sentences: what it is, why it's easy, a quick shape tip.]
### A simple fish
...

## Easy nature things to draw
### A puffy cloud
...

## Easy food to draw
### A scoop of ice cream
...

## Tips to get started
[A few encouraging, practical tips.]

## Frequently asked questions
### [A real PAA question]
...

[CTA to a relevant tutorial or a coloring collection.]
```

Group the ideas into 3–5 themed `##` sections, each idea an `###` with a one-line shape tip. Link out to the matching tutorials where you have them.

---

## Type 3 — 📂 Coloring collection / category

**Themed printable landing.** "Dinosaur coloring pages", "unicorn coloring pages". This is a **different route** (`content/categories/<slug>.mdx`) — the printable images are generated separately; you write the surrounding copy, which lives in **frontmatter `seoDetails`**, not a long body. Match the existing `content/categories/unicorn.mdx` structure exactly, swapping the theme word throughout.
**Word count:** copy lives in `seoDetails` (no long body needed).

### Frontmatter shape (category route)

```yaml
---
slug: dinosaur
name: Dinosaur
description: >-
  60–120 word intro. Primary keyword in the first sentence. Who it's for + what's inside.
seoTitle: Dinosaur Coloring Pages - Free Printable Sheets   # ≤60 chars
seoDescription: >-
  150–160 char meta description.
seoMetaDescription: >-
  Same as seoDescription.
heroImage: hero.webp
thumbnailImage: thumb.webp
order: 99
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
    - { title: ..., description: ... }   # 4–5 ideas (party, quiet time, classroom, storytelling)
  printableTipsTitle: "📝 Printable Tips for the Best Coloring Experience"
  printableTips:
    - segments:
        - { text: "Use heavier paper (32 lb / cardstock)", bold: true }
        - { text: " for smoother coloring and less bleed-through." }
---
```

`seoTitle` pattern: `"<Theme> Coloring Pages - Free Printable Sheets"`. Don't fabricate image filenames beyond `heroImage: hero.webp` / `thumbnailImage: thumb.webp`. Cross-link to 2–3 sibling collections in the same cluster and to a matching tutorial.

---

## Type 4 — 🛠️ Tool landing page

**Conversion-focused tool.** "Photo to coloring page", "turn a photo into a coloring page". Usually an `app/<slug>/page.tsx` route (or a blog article if written as one). Lighter on prose, heavier on the value prop and the CTA.
**Word count:** lighter prose.

### Skeleton

```
[Above the fold: one-line value prop with the keyword + the tool / CTA (e.g. an upload-photo widget).]

## How it works
[3 steps: upload a photo → we turn it into line art → download and print.]

## What you can use it for
[Gifts, classroom activities, party favors, custom pet portraits.]

## Frequently asked questions
### What file types can I upload?
### Will it print well?
### Is it free?

[Internal links to popular coloring collections.]
```

Keep it conversion-focused. Confirm any claim about output quality or file handling is true (`accuracy-and-trust-skill.md`).

---

## Choosing the type

1. **Read the keyword's intent.** "how to draw a rose" → ✏️ tutorial. "40 easy things to draw" → 📝 listicle. "dinosaur coloring pages" → 📂 collection. "photo to coloring page" → 🛠️ tool. The plan row's icon usually tells you outright.
2. **Check the SERP.** If the top results are step-by-step tutorials, write a tutorial. If they're round-up lists, write a listicle. If they're printable-gallery pages, it's a collection. Match the dominant format, then beat it on clearer steps, better grouping, and on-brand warmth.
3. **When ambiguous, ask the operator.**

---

## Heading hierarchy (universal, non-negotiable)

- H1 lives in frontmatter `title:` only. **Never in the body.** The route renders the H1. A stray `# Heading` in the body produces a second, duplicate H1.
- Body starts with content (often a featured/inline image), then the **answer blockquote** (`>`), then the **collection / tutorial Markdown link**, then `##` headings.
- **No `{#id}` anchors and no auto heading IDs** — the renderer does not slugify headings. Don't write anchor syntax; it prints literally.
- `##` → `###`, no skips to `####`.

See `scannable-formatting-skill.md` for the full discipline.

---

## Voice (universal)

All types share:

- Warm, plain, encouraging prose. "If you can draw a circle and a teardrop, you can draw this rose" beats "unlock your inner artist."
- Correct materials and terminology, every time (`materials-and-terminology-skill.md`).
- Technique that works and facts that verify, always (`accuracy-and-trust-skill.md`).
- One CTA per post, to the matching coloring collection or a sibling tutorial.
- No hype, no "ultimate / powerful / game-changing" without a reason.
- Licensed characters described fan-style with a light disclaimer.

See `protocols/site-voice-profile.md` for the Scribbloo "Storybook Retro" voice lock.

---

**BlogOS** — content types that feed the coloring collections, tutorials that actually work.
