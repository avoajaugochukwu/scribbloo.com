---
name: scannable-formatting
description: H1/H2/H3 hierarchy rules, paragraph-length discipline, bullets vs prose, callouts, and the core content blocks (the opening blockquote answer, the supply list, the step-by-step) for Scribbloo posts. This is the file that turns prose into a web page Google can index and a human can scan. Calibrated for the MDX renderer — next-mdx-remote/rsc into a fixed component map: only plain Markdown elements, no custom JSX components, no GFM tables (no remark-gfm), no math rendering, no auto heading IDs. Heading hierarchy is non-negotiable.
---

# Scannable Formatting — the layer between prose and page

> A great paragraph that nobody scrolls to is dead writing. This skill is the discipline of structuring content so the skimming parent, the kid following along, the teacher printing it out, the screen reader, and Google's crawler can all find what they came for — within the limits of what this site's renderer actually produces.

---

## What the renderer does (and doesn't do)

Every post is `content/blog/<slug>.mdx` run through **next-mdx-remote/rsc** `<MDXRemote>` into the fixed component map in `components/mdx/MdxComponents.tsx` (`lib/content/blog.ts` → `app/blog/[slug]/page.tsx`). Before any formatting rule, internalize these four facts:

- **No custom JSX components.** `<Callout>`, `<ColoringEmbed>`, `<ProTip>`, `<StepCard>` do not exist in the component map. Don't invent JSX tags — raw JSX with no matching component won't render. Callouts are **blockquotes** or **bold lead-in** sentences. Stick to plain Markdown.
- **No GFM tables.** There's no `remark-gfm` in the pipeline, so a `| col | col |` pipe table is not guaranteed to render — it can print as literal pipes. **Prefer lists or prose** for any side-by-side data. If a grid is genuinely essential, hand-write a small raw HTML `<table>` (or note that `remark-gfm` would have to be added).
- **No math rendering.** Irrelevant for drawing posts — there's nothing to typeset. Don't reach for `$…$`; you'll never need it.
- **No auto heading IDs.** `## Heading {#id}` does not generate an anchor — the `{#id}` would print as text. Do not write `{#id}`. There is no on-page jump-link TOC; rely on clear H2 phrasing instead.

---

## The heading hierarchy (non-negotiable)

This is the most important section in this file. Codify it.

### H1 — exactly one per page, from frontmatter

The H1 is the page title. It lives in the frontmatter as `title:` and is rendered by the blog route (`app/blog/[slug]/page.tsx` emits the `<h1>`). **Never put a `# H1` in the MDX body.**

```
[Frontmatter: title: "How to Draw a Rose (Easy Step-by-Step for Beginners)"]
[The route renders <h1>How to Draw a Rose (Easy Step-by-Step for Beginners)</h1>]

[Body starts here — first content is often the featured/inline image, then the answer blockquote, then H2s. Never an H1.]
```

Why: multiple H1s confuse Google's understanding of what the page is about, harm accessibility, and break the semantic outline.

### H2 — major sections, multiple allowed

Every major section of the post is an H2 (`## `). Rules:

- Start after the opening answer blockquote + the related coloring/tutorial link.
- Use claim or question phrasing: "Why a rose starts with a spiral, not petals", "What you'll need before you sketch".
- Avoid label phrasing: "Background", "Section 1", "Introduction".
- Do **not** write `{#id}` anchors — this renderer doesn't generate them, and the literal text would leak onto the page.
- H2s often capture featured snippets — write them as if they were searchable themselves.

### H3 — sub-sections inside an H2

Use H3 (`### `) only when an H2 has 2+ genuine sub-sections. A single H3 inside an H2 is an orphan — promote it to H2 or fold it into the parent prose.

Rules:
- Always under an H2 (never directly under H1)
- Phrase consistently with the parent H2's style
- Never skip from H2 to H4

### H4 — rare

Use only when an H3 has 2+ further sub-sections. Most posts never need H4. If you reach for H4, your H2 outline might be wrong — that section is probably its own post.

### H5 / H6 — contraband

If you need this depth, the post structure has failed. Restructure. (And the component map only styles `h1–h4` anyway — deeper headings have no styling to land on.)

---

## Heading rules summary

```
H1 — frontmatter only, exactly one (no # H1 in body)
H2 — major sections, claim/question phrasing, NO {#id}
H3 — sub-sections, only when 2+ exist under one H2
H4 — rare, only when 2+ exist under one H3
H5/H6 — never
```

The semantic outline of every post is H1 → H2s → optional H3s, with no skips and no orphans.

---

## Paragraph length

The default paragraph length on the web is shorter than print. Real readers scan first; long paragraphs intimidate — and a Scribbloo reader is often a parent skimming on a phone while a kid waits to start drawing.

### Rules

- **2-4 sentences per paragraph** for most prose
- **Single-sentence paragraphs** are allowed for emphasis, transition, or beat. Use sparingly — three in a row is an AI tell.
- **5-6 sentence paragraphs** are allowed in pillar pieces or longer drawing-guide intros, when the reader is committed and the prose earns it.
- **8+ sentence paragraphs** are wallpaper. The skimmer scrolls past.

### Visual rhythm test

Preview the post. Look at the *shape* of the paragraphs on the page. Healthy posts have varied paragraph shapes — some 2 lines, some 5, some 1, some 4. Posts that are all 4-line paragraphs read as templated.

---

## First-sentence discipline

The skimming reader reads the first sentence of every paragraph. So:

- The first sentence carries the paragraph's claim
- Don't bury the point in sentence 3
- "There are several reasons kids love drawing animals. First, …" — wastes the first sentence. Start with "First, …" directly.
- Topic sentences that don't say anything ("Let's now turn to the next step") are contraband

If you delete every sentence except the first in each paragraph, can a reader follow along? That's the skim test.

---

## Lists vs prose — when to use each

### Use lists when:
- 3+ items share the same shape (parallel)
- Order doesn't matter much (use bullets) or matters a lot — drawing steps (use numbered)
- The reader needs to *count* or *scan* the items (a supply list, a set of ideas)
- The content is genuinely parallel — not narrative dressed up as a list

### Use prose when:
- The items have varied shape or depth
- The connections between items matter (this petal sits behind that one, this color builds on the last)
- One item flows into the next
- The argument needs sentences

### List anti-patterns

- 2-item lists — write it as prose
- Lists where each item is a paragraph — reformat as H3s or as prose
- Lists of mixed-grammar items — "Sketch the head circle. You'll also want a soft pencil first. Coloring comes last." — three different shapes, this should be prose or a clean numbered procedure
- Nested lists deeper than 2 levels — restructure

### List item phrasing

- **Numbered list items:** start with a verb if procedural ("Sketch a light oval for the cat's head")
- **Bulleted list items:** use parallel grammar across all items
- **Short items:** under 12 words ideally
- **Long items:** if an item needs 30+ words, it might want to be an H3 instead

---

## Tabular data — lists and prose, not GFM tables

A table would be scannability dynamite for 2-dimensional data — but **GFM pipe tables are not guaranteed to render on this site** (no `remark-gfm`). A `| --- |` table can print as literal pipes in the body. So:

### Default: turn the table into a list or prose

Most "tables" on a drawing blog are really a short reference set, and they read fine as a list. A pencil-grade quick reference, for instance:

- 2H–HB → light construction lines you'll erase later
- 2B → general sketching and outlines
- 4B–6B → dark shadows and bold contrast

Or as definition-style prose: "Rough in the shape with a hard pencil (2H or HB), do your main lines with a 2B, then push the deepest shadows with a soft 4B or 6B."

### If a grid is genuinely essential: raw HTML

When the data is truly 2-D and a list distorts it, hand-write a small raw HTML `<table>` in the MDX body:

```html
<table>
  <thead><tr><th>Pencil</th><th>Best for</th></tr></thead>
  <tbody>
    <tr><td>2H</td><td>Light guidelines</td></tr>
    <tr><td>2B</td><td>Outlines and sketching</td></tr>
    <tr><td>6B</td><td>Dark shadows</td></tr>
  </tbody>
</table>
```

Keep raw tables small (≤ 4 columns, short cells). The alternative is to add `remark-gfm` to the pipeline — treat that as a deliberate infra change, don't assume it's there. Default to lists.

---

## Callouts — blockquotes and bold lead-ins

There are no callout components in the map. A callout is one of two things on this renderer:

### 1. A blockquote

The component map styles `>` blocks as a distinct **terracotta/mustard-tinted box** — this is the visual lift, and it's the closest thing the site has to an "answer box." Use it for:

- **The answer** — the opening blockquote is the answer box (see below)
- **A genuine quote** from a named, cited source (with attribution after an em-dash)
- **A key tip or warning** with a bold label inside

```
> **Beginner tip:** draw every guideline lightly first. Press hard only once you're happy with the shape — light lines are easy to erase, dark ones smudge.
```

### 2. A bold lead-in sentence

For tips and definitions inside the flow, a bold lead-in is cleaner than a blockquote:

**Tip.** Get the basic shapes right before any details — a cat is just a circle, an oval, and two triangles until you say otherwise.

**Hue vs. value.** Hue is the color itself (red, blue); value is how light or dark it is. You can color a whole rose in one hue and still make it pop by changing the value.

### Frequency

- 1-3 blockquote/lead-in callouts per post is healthy (beyond the opening answer blockquote)
- 5+ becomes noise
- Match the callout to the moment — don't dress every aside as a warning

Reserve `>` blockquotes for the answer, genuine source quotes, and the occasional flagged tip/warning. Don't use a blockquote for ordinary emphasis (use bold) or for a tip that reads fine as a bold lead-in. And remember the tinted box stands out — one beside another looks like clutter.

---

## The core content blocks (answer, supply list, step-by-step)

The load-bearing content of a Scribbloo post is the **opening blockquote answer**, the **related coloring/tutorial link**, the **supply list**, and the **step-by-step**. These are the scannability events that carry the page.

### The opening blockquote answer

Lead with the answer. The very first text in the body (often right after the featured/inline image) is a blockquote — this *is* the answer box, the featured-snippet target, and the orienting beat:

```
> To draw a rose, start with a small spiral for the center, wrap a few curved petals around it, then add bigger petals and a stem with leaves. It takes about five steps, and you only need a pencil and paper. No skill needed — you've got this.
```

40-60 words. Warm and encouraging. Use real materials and terms (pencil grades, hue/value) correctly — see `materials-and-terminology-skill.md`. Any factual claim must hold up — see `accuracy-and-trust-skill.md`.

### The related coloring / tutorial link

Immediately under the answer blockquote, a normal Markdown link to the matching coloring collection or a related tutorial:

```
Want to color one in instead? Try our [Rose Coloring Pages](/coloring-pages/roses).
```

Use a live route. Link to a `relatedCategories` collection (`/coloring-pages/<slug>`) or a `relatedPages` post that actually exists. If there's no good target yet, omit the link rather than point at a 404.

### The supply list

Tell the reader what they need before they start. A short bulleted list is the strongest, most scannable opening beat for a tutorial:

```
- A pencil (an HB is perfect to start)
- An eraser
- A sheet of plain paper
- Colored pencils or markers (optional, for the finished rose)
```

Keep it honest and beginner-friendly — no specialty supplies a parent doesn't already have in a drawer.

### The step-by-step

Walk through the drawing one numbered step at a time — this is the single most scannable beat for a how-to reader, and most steps want their own image (see `media-and-images-skill.md`). Numbered steps:

```
1. Draw a small spiral in the middle — this is the heart of the rose.
2. Wrap two or three curved petals snugly around the spiral.
3. Add a layer of larger petals behind those, like a teardrop fanning out.
4. Draw a stem coming down, then two pointed leaves on the sides.
5. Go over your final lines, erase the guidelines, and color it in.
```

Each step should be doable on its own and match its step image exactly — if the prose says "two petals" the image should show two.

### Don't use blockquotes for:
- Emphasis (use bold)
- Ordinary tips (use a bold lead-in)
- General commentary (it's not a quote)

### Sourcing rule

Every technique step must actually work, and every factual claim (art history, "graphite smudges because…", a material's behavior) must be correct and verifiable. Steps are confirmed by following them yourself; facts are cited to a real, reputable source. Never fabricate a fact or a statistic, and never imply that a licensed character (Hello Kitty, Pokémon, Bluey) is official — use fan-style phrasing. See `accuracy-and-trust-skill.md` for the trust gate every post must pass before publishing.

---

## Code / formula blocks

A drawing blog almost never needs program code or fenced blocks — there's no math to step through. The rare legitimate uses:

- A short reference set that reads better fenced than as prose (e.g. a tiny pencil-grade key)
- An exact field/route name, file path, or color hex you want set off in inline code (`#C76B4A`, `featuredImage: featured.webp`)

Otherwise, prefer prose, lists, and images. Use inline code (`backticks`) only for: route/field names, file paths, and exact technical tokens — not for ordinary emphasis.

---

## Images in flow

See `media-and-images-skill.md` for the full image discipline. Quick scannability points:

- Featured image declared in frontmatter as `featuredImage: featured.webp` and rendered by the route above the body
- Step and supporting images embedded as local Markdown: `![alt](/images/blog/<slug>/inline-1.png)`
- Step-by-step tutorials lean heavily on images — ideally one image per step
- Listicles/collections want a preview image every 600-1,000 words
- Every image has real alt text
- No decorative-only images — every image earns its presence

---

## Bold and italic

Bold and italic are emphasis types with different jobs:

- **Bold** for the load-bearing phrase in a paragraph — what the skimmer needs to see; also the lead-in label for an inline callout
- *Italic* for a term on first use (*value*, *gesture drawing*) or a light, deliberate emphasis

### Rules

- Bold one phrase per paragraph maximum (more dilutes)
- Italic 2-3 times per page maximum (more is precious)
- Never both at once (***bold italic*** is shouting)
- Never an entire sentence bolded — break it or rewrite

### What NOT to bold

- Keywords for SEO — Google notices the artificial pattern
- Random words for "visual interest"
- Every sentence in a paragraph
- Headings (they're already styled)

---

## Table of contents

There is **no on-page TOC** and **no auto heading IDs** on this renderer. Don't write a manual jump-link list (the anchors won't resolve), and don't add a `toc` frontmatter field (`lib/content/types.ts` doesn't validate one). Your job is to make the H2 phrasing so clear that the H2 list *is* the visual outline. For pillar posts that want a contents overview, write a short prose "what this covers" paragraph near the top instead of a linked TOC.

---

## The visual rhythm budget

For every 250-300 words of body, there should be a scannability event. On this renderer the events are:

- A new H2 or H3
- A bulleted or numbered list (a supply list, a set of ideas, the steps)
- A step image (or any image that earns its place)
- A blockquote (the answer, a source quote, or a flagged tip/warning)
- A short worked beat — e.g. "first the circle, then the ears" set on its own line

**Not** events here: GFM pipe tables (may render as pipes) and JSX callout components (don't exist in the map).

A 1,500-word post should have 6-9 scannability events distributed across the body — not clustered at the top, not absent for a 600-word stretch.

The audit catches: any 300-word run with zero scannability events.

---

## Pre-publish formatting checklist

- [ ] Exactly one H1 (from frontmatter, no `# H1` in body)
- [ ] No heading skips (H2 → H4 forbidden)
- [ ] No `{#id}` anchors written (renderer doesn't support them)
- [ ] H2s use claim/question phrasing, not labels
- [ ] No orphan H3s (a single H3 under an H2)
- [ ] No paragraph > 6 sentences (unless a pillar piece)
- [ ] No 3+ short paragraphs in a row
- [ ] First sentence of every paragraph is load-bearing
- [ ] Lists are genuinely parallel (3+ items, parallel grammar)
- [ ] No GFM pipe tables (use lists/prose; small raw HTML `<table>` only if essential)
- [ ] No invented JSX components — plain Markdown only
- [ ] Callouts are blockquotes or bold lead-ins, 1-3 per post beyond the answer
- [ ] Opening blockquote is the direct, encouraging answer
- [ ] Related coloring/tutorial link sits right under the answer (live route, no 404)
- [ ] Supply list present for tutorials; step-by-step is clean numbered steps
- [ ] Each step matches its step image
- [ ] Bold used for load-bearing phrases, not keywords
- [ ] Every technique/fact verified per `accuracy-and-trust-skill.md`
- [ ] Scannability event every 200-300 words

---

**BlogOS** — structure is content.
