---
name: title-meta-slug
description: The title artifacts every Scribbloo post has and how each one is different. In this project the `title` frontmatter field is BOTH the on-page H1 AND the meta title (one field), `metaDescription` is the SERP snippet (150–160), and `excerpt` is the on-page hook — they are SEPARATE fields. The slug is permanent. Lazy writers paste the same string everywhere; real writers tune the title for the SERP, write a distinct metaDescription that earns the click, and a warm excerpt that hooks the reader.
---

# Title, Meta, Slug — the artifacts

> On most sites the H1 and the meta title are separate fields. On **Scribbloo they collapse**: `title` does double duty as the H1 *and* the meta title. But the description does NOT collapse — `metaDescription` (the SERP snippet, 150–160 chars) and `excerpt` (the on-page hook) are **separate fields**. Treat each piece with its own rules, knowing the `title` is doing two jobs at once.

---

## The artifacts at a glance

| Artifact | Lives in | Doubles as | Max length | Purpose |
|---|---|---|---|---|
| **Title** | Frontmatter `title:` | On-page H1 **and** SERP/`<title>` meta title | ≤ 60 chars | The heading the reader sees AND what Google shows in results |
| **Meta description** | Frontmatter `metaDescription:` | SERP snippet only | 150–160 chars | The snippet under the title in search results |
| **Excerpt** | Frontmatter `excerpt:` | On-page hook / dek only | ~1–2 sentences | The warm orienting line on the page (not the SERP) |
| **URL slug** | Frontmatter `slug:` | — | ≤ 60 chars | The permanent URL |

There is **no separate `metaTitle` or `ogTitle` field** — `lib/content/types.ts` does not validate them, and the route derives the canonical, Open Graph, and Twitter tags automatically from `title` + `metaDescription`. Do not add those fields; they are silently ignored. The image field is `featuredImage` (a filename like `featured.webp`), not `heroImage`. There is also **no `dateModified`/`lastUpdated` field** — track updates via git, not frontmatter.

---

## The title (H1 + meta title in one)

Because one field is both surfaces, the title has to satisfy two readers at once: the searcher scanning the SERP, and the kid or parent who just landed on the page.

### Rules

- **≤ 60 chars** — longer wraps badly on mobile and Google truncates the SERP title around 60. This is the binding constraint since the field is also the H1.
- **Front-load the target query** — the keyword goes near the start (good for the SERP) while still reading naturally and warmly (good for the lander).
- **No brand suffix** — do **not** append `| Scribbloo`. The route handles site naming; the H1 should not carry it, and there is no separate meta title to brand.
- **Title Case or sentence case** — pick one for the site and stay consistent.
- **A modifier that signals what's inside** is welcome when it fits in 60 chars — `(Easy)`, `Step by Step`, `For Beginners`, `Free Printables`.
- **Match the slug and metaDescription** — all three describe the same page and share the query.
- **Stay warm.** This is Storybook-Retro voice. "How to Draw a Rose (Easy Step by Step)" reads friendlier than "Rose Drawing Tutorial: A Methodology".

### Title patterns by content type

#### Pattern A — Drawing tutorial ("how to draw X")
```
How to Draw a Rose (Easy Step by Step)
How to Draw a Cat Easy: Beginner Guide
```

#### Pattern B — Listicle / "things to draw"
```
40 Easy Things to Draw When You're Bored
Cute Things to Draw: 30 Ideas for Beginners
```

#### Pattern C — Concept / definition explainer
```
What Is Shading in Drawing? Beginner Guide
Hue vs Value: What's the Difference?
```

#### Pattern D — Technique how-to
```
How to Blend Colored Pencils (Easy Tips)
How to Shade With a Pencil Step by Step
```

#### Pattern E — Comparison
```
Marker vs Colored Pencil: Which to Use?
Sketch vs Drawing: What's the Difference?
```

#### Pattern F — Pillar (topic hub)
```
How to Draw for Beginners: The Full Guide
```

### Title anti-patterns

- Stuffing: "Draw Rose Flower Drawing Easy Sketch Tutorial Beginner"
- All caps: "STOP STRUGGLING — DRAW A PERFECT ROSE NOW"
- Vague: "Some Thoughts on Drawing Flowers"
- Brand-first or brand-suffixed: "Scribbloo: How to Draw a Rose" or "… | Scribbloo" — no brand in the title at all.
- Over 60 chars (the audit catches this — and it would truncate the SERP title and bloat the H1).
- A second `# H1` in the body — the title field already renders the H1.

### When to iterate the title

If a post ranks but doesn't get clicked, the title is the lever (it is your only SERP title). Try: adding a modifier (`Easy`, `Step by Step`), restating a question as a claim or vice versa, or front-loading the query harder. Track CTR in Search Console.

---

## The meta description (the `metaDescription` field)

`metaDescription` is emitted as the meta description and shown as the SERP snippet under the title. It doesn't directly rank, but it drives click-through — so it has to sell the click in 150–160 characters.

### Rules

- **150–160 chars** — Google truncates around 155 on desktop; aim for the upper band to use the space, but don't blow past 160.
- **Active verb in the first half** — "Learn how to draw a rose from simple shapes…" not "This article covers…".
- **Target query appears once**, naturally.
- **Specific, not abstract** — name the payoff: the steps, the shapes you start from, the free printable, the skill level.
- **No HTML, no Markdown** — plain text only.
- **Stands alone** — it should make sense in the SERP without the title above it.
- **Distinct from `excerpt`** — these are different fields shown in different places; don't paste the same string into both.

### Meta description patterns

#### Pattern A — Drawing tutorial
```
Learn how to draw a rose step by step, starting from simple shapes. A beginner-friendly guide with easy strokes, shading tips, and a free rose page to color.
```

#### Pattern B — Listicle
```
Bored? Here are 40 easy things to draw for beginners, from animals to food to doodles. Each idea is simple, fun, and needs nothing but a pencil and paper.
```

#### Pattern C — Concept explainer
```
Shading is how you add light and shadow to make a drawing look 3D. Learn what shading is, the main techniques, and how to practice it as a total beginner.
```

#### Pattern D — Comparison
```
Markers and colored pencils both add color, but they behave very differently. See when to reach for each, with simple tips for blending, layering, and clean lines.
```

### Meta description anti-patterns

- Starts with "In this article, we will…".
- Duplicates the title verbatim (wastes the snippet).
- Generic: "Learn everything about drawing."
- Promises something the post doesn't deliver.
- Under 150 or over 160 chars.

---

## The excerpt (on-page hook)

The `excerpt` is the warm 1–2 sentence hook shown on the page (and in post listings), *not* the SERP snippet. It's where the Storybook-Retro voice gets to shine — encouraging, a little whimsical, never salesy.

### Rules

- **1–2 sentences**, friendly and inviting.
- **Talk to the reader** ("you", "your kids"). "No skill needed" energy.
- **Include the primary keyword once**, naturally.
- **Don't just repeat the metaDescription** — this one can be warmer and more playful since it's read on-page, not in a results list.
- **Nullable** — it can be empty, but a good hook lifts on-page engagement, so write one.

Example for "how to draw a rose":

> "Roses look fancy, but they start with a simple spiral. Follow along and you'll have a pretty rose on the page in minutes — no experience needed."

---

## The URL slug

The slug is **permanent**. Changing it after publish requires a 301 redirect and loses some SEO equity. Get it right the first time.

### Rules

- **Kebab-case:** `how-to-draw-a-rose`, never `How_To_Draw_A_Rose` or `howToDrawARose`.
- **Front-load the keyword:** `how-to-draw-a-rose` not `the-easy-way-to-sketch-a-rose`.
- **Drop stop words unless load-bearing:** `cute-things-to-draw` beats `some-of-the-cutest-things-you-can-draw`. Keep words that change meaning or are part of the query.
- **No dates** — there is no modified-date field to lean on; just keep the slug evergreen and update the body over time.
- **No numbers** unless the number is core (`40-easy-things-to-draw` — the count *is* the query).
- **No filler suffixes** in general (`-article`, `-post`) — but a short disambiguating tail (`-easy`, `-for-beginners`) is fine and is used on this site where it separates a how-to from a bare term.
- **No leading/trailing hyphens. All lowercase. Under 60 chars** ideally, under 80 max.

### Slug patterns by content type

| Content type | Slug pattern | Example |
|---|---|---|
| Drawing tutorial | `how-to-draw-a-<thing>` | `how-to-draw-a-rose` |
| Drawing tutorial (skill tail) | `how-to-draw-a-<thing>-<skill>` | `how-to-draw-a-cat-easy` |
| Listicle | `<count>-<adjective>-things-to-draw` | `40-easy-things-to-draw` |
| Listicle (bare) | `<adjective>-things-to-draw` | `cute-things-to-draw` |
| Concept / definition | `what-is-<thing>-in-drawing` | `what-is-shading-in-drawing` |
| Technique how-to | `how-to-<task>` | `how-to-blend-colored-pencils` |
| Comparison | `<x>-vs-<y>` | `marker-vs-colored-pencil` |
| Pillar (hub) | `<topic>` (root term) | `how-to-draw-for-beginners` |

### When to change a slug

Almost never. If you must:

1. Add a 301 redirect from old to new in `next.config.js`.
2. Update all internal links from old slug to new slug (grep the repo), and any `relatedPages`/`relatedCategories` references.
3. Update the sitemap.

Cost of a slug change: 1-3 months of partial ranking dilution. Don't do it casually.

---

## Target query placement

The target query should appear in:

1. **Title** (verbatim or close, front-loaded — covers both the H1 and the meta title).
2. **Meta description** (once, naturally — the SERP snippet).
3. **Slug** (verbatim, front-loaded).
4. **First paragraph** of the body — i.e. the answer **blockquote** (within the first ~100 words).
5. **At least one `##`** (verbatim or close).
6. **`featuredImage` alt / surrounding text** (naturally, if it fits).

Do this naturally; don't stuff. If the query is "how to draw a rose" and an `##` reads "How to draw a rose step by step," that repetition is fine.

---

## Brand placement

- **Site name** in `title`: no — the route brands the page and there is no separate meta title to carry it.
- **Site name** in `slug`: no.
- **Site name** in `metaDescription`/`excerpt`: only if it genuinely adds warmth or credibility ("free printables from Scribbloo"). Usually skip it.

---

## Reuse and consistency

Across the site:

- **Capitalization consistency** — pick title case or sentence case for titles and stick to it.
- **Slug pattern consistency** — within a content type, slugs follow the same pattern (see the table).
- **Query consistency** — the title, metaDescription, and slug all describe the same page and share the target query.
- **Voice consistency** — warm, encouraging, plain "Storybook Retro"; no stiff or salesy language (see `protocols/site-voice-profile.md` if present).

---

## The audit

The pre-publish audit checks the four artifacts:

- [ ] `title` set, ≤ 60 chars, includes the target query, no brand suffix, no `# H1` duplicated in the body.
- [ ] `metaDescription` set, 150–160 chars, includes the target query, no "in this article" preamble, not a verbatim copy of the title.
- [ ] `excerpt` set as a warm on-page hook, distinct from `metaDescription`.
- [ ] `slug` kebab-case, ≤ 60 chars, no dates, front-loaded query.
- [ ] All artifacts include the target query (verbatim or close paraphrase) and describe the same page.
- [ ] No forbidden fields present (`metaTitle`, `ogTitle`, `heroImage`, `dateModified`, `category`) — use `title`, `metaDescription`, `excerpt`, `featuredImage`, `publishedAt`.

---

**BlogOS** — get the artifacts right, earn the click.
