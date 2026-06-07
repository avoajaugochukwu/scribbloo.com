---
name: featured-snippet
description: Win position-zero. The 40-60 word direct-answer paragraph, definition snippets, list snippets, and People Also Ask capture for scribbloo.com's drawing tutorials, listicles, and explainer content. This skill teaches the writer to structure paragraphs and lists that Google's snippet bot can directly lift and display above the regular search results — using only the plain-Markdown tools this site renders.
---

# Featured Snippet — winning position zero

> Position zero is the box at the top of Google search results that lifts a paragraph or list from a single page and shows it as the direct answer. Pages that win the snippet typically see a ~20-30% lift in click-through, plus voice-assistant inclusion. For a how-to-draw site this is high-leverage SEO — the parent who reads "start a rose with a small spiral, then add petals around it" in the box still clicks through for the full step-by-step and the free coloring page.

---

## What renders here (constraints before tactics)

Posts are MDX (`content/blog/<slug>.mdx`) rendered by `next-mdx-remote/rsc` through a fixed component map (`components/mdx/MdxComponents.tsx`). That shapes everything below:

- **No AnswerBox component and no `featuredSnippet` frontmatter field.** The snippet target is just text in the body — specifically the **top blockquote** of the post. There is nothing to declare in frontmatter; what's on the page *is* the source of truth. Don't invent JSX tags — only the mapped Markdown elements render.
- **No GFM tables.** The pipeline has no `remark-gfm`, so a pipe table renders as raw text, not a `<table>`. **Prefer prose and lists over tables in post bodies** — they're what the renderer styles cleanly and what wins paragraph/list snippets anyway.
- **No auto heading IDs.** Don't rely on `#anchor` fragments for snippet structure.

So the two workable snippet shapes on this site are: **paragraph** and **list**. (Tables are a non-goal here — see the table note.)

---

## The snippet shapes Google awards

| Snippet shape | What it looks like in SERP | Source on page | Trigger queries |
|---|---|---|---|
| **Paragraph** | 1-2 sentence answer in a card | The top blockquote (40-60 words) | "how do you draw a rose", "what is shading in drawing", "are dinosaurs hard to draw" |
| **List** | Numbered or bulleted list of 6-8 items | An H2-titled markdown list | "steps to draw a cat", "easy things to draw", "how to draw a rose step by step" |
| **Table** | A small 2-3 column table | (not available — no GFM tables) | Reframe as a tight list or prose instead |
| **Video** | A YouTube thumbnail | A YouTube video, not a blog post | Out of scope for blog SEO |

---

## The paragraph snippet (most common, and the default here)

This is the default shape and the natural target for **definition explainers** ("what is shading"), **yes/no or one-line how-to** queries ("how do you draw a rose"), and any "what is X" search. Google lifts a single paragraph and shows it.

### Where the paragraph lives — the top blockquote

Put the direct answer in a **blockquote at the very top of the body**, before the first H2. The component map styles blockquotes as a terracotta/mustard tinted "answer box" with a serif feel, so the answer reads as a deliberate callout *and* is the first prose Google sees. This is the closest thing the site has to an AnswerBox — and it's just Markdown.

There is no `# H1` in the body (the H1 comes from frontmatter `title`), so the blockquote really is the first prose after the title/hook (you may place a featured or inline image above it).

### Anatomy of a winning paragraph snippet

- **40-60 words.** Under 40 looks incomplete in the card; over 60 gets truncated.
- **First sentence is the answer.** Pattern: `<Direct answer / one-line method / definition>.`
- **Sentences 2-3 add the non-obvious.** The starting shape, a beginner-friendly qualification, or the next-most-relevant tip.
- **No "in this article" preamble.** Google strips the paragraph from context — it must stand alone.
- **Plain prose.** No links, no bold, no nested lists inside the answer. (It's a blockquote, which is fine — a blockquote is still a single liftable paragraph.)
- **Warm but precise.** Storybook-Retro voice, but the technique has to be right (verify per `accuracy-and-trust-skill.md`).

### Example (one-line how-to answer)

Frontmatter sets `title: "How to Draw a Rose (Easy Step by Step)"`. Body opens with a featured image, then:

```markdown
> To draw a rose, start with a small spiral in the center, then wrap soft, curved petals around it in widening layers. Add a stem and a couple of leaves, then go over your best lines and erase the guides. Beginners can keep it simple — five or six petals is plenty.

## How to draw a rose step by step
```

That blockquote is the snippet target. It's ~55 words, leads with the method, names the starting shape (the spiral), and reassures the beginner. Every technique step must actually work when followed — verify per `accuracy-and-trust-skill.md`.

### Example (definition answer)

Frontmatter `title: "What Is Shading in Drawing? Beginner Guide"`. Body opens:

```markdown
> Shading is adding light and shadow to a drawing so it looks three-dimensional instead of flat. You build it up gradually, pressing harder for dark areas and lighter for highlights. The main techniques are hatching, cross-hatching, and blending. Where the light hits stays white; the side facing away goes darkest.

## How to shade a drawing step by step
```

Leads with the definition, names the techniques, adds the light-direction rule. Any factual claim about technique or terminology must be correct and verifiable per `accuracy-and-trust-skill.md`.

### Common paragraph-snippet patterns

**"How do you draw X" (method summary):**
> `To draw <X>, start with <the basic shape>, then <the next two moves>. <A beginner-friendly simplification or the most common mistake to avoid>.`

**"What is X" (definition):**
> `<X> is <one-sentence definition>. <How you do it / its defining property>. <How it differs from the thing it's confused with, or a key beginner tip>.`

**"Is X hard to draw" (reassurance answer):**
> `No — <X> is easier than it looks once you break it into simple shapes. <The shapes you start from>. <The one part beginners find tricky, and the fix>.`

---

## The list snippet

Google lifts a numbered or bulleted list. This is the core shape for **ordered procedures** — the steps to draw a cat, the steps to blend colored pencils — and for "easy things to draw" listicles. Markdown lists render cleanly here (no GFM needed), so this shape is fully available and is the workhorse for tutorials and listicles.

### Anatomy of a winning list snippet

- **6-8 items.** Fewer looks thin; more gets truncated.
- **List title is an H2 phrased as the query.**
- **Each item is short** — under ~12 words. The step plus a tight cue.
- **Parallel grammar** — if item 1 is an imperative, all items are.
- **No deep formatting inside items** — Google's snippet view drops nested lists, bold, links, and most inline structure. Keep each item short plain text.

### Example (how-to list snippet target)

```markdown
## How to Draw a Cat Step by Step

1. Draw a circle for the head and a soft oval for the body.
2. Add two triangle ears on top of the head.
3. Sketch two round eyes, a small nose, and a smile.
4. Add a few whiskers on each side of the nose.
5. Draw four short legs and little rounded paws.
6. Curve a tail out from the back of the body.
7. Go over your best lines and erase the guide shapes.
8. Add fur lines, stripes, or color to finish.
```

Each item is short, parallel, and complete in itself. Any technique here must actually produce a recognizable cat when followed — verify the steps per `accuracy-and-trust-skill.md`; a method that doesn't work in the snippet is a credibility hit and a publish blocker.

### List snippet pitfalls

- **Items too long.** If each item is a paragraph of commentary it won't get pulled. Keep the step tight; save commentary for prose between items.
- **Inconsistent grammar.** Mixed imperatives and noun phrases make Google skip.
- **Wrong H2.** "Section 2: A Few More Tips" doesn't match the query; "How to Draw a Cat Step by Step" does.

### Numbered vs bulleted

- **Numbered** for ordered procedures (steps to draw a cat; steps to blend colored pencils).
- **Bulleted** for parallel, unordered items (a set of easy things to draw; a list of beginner mistakes to avoid).

Google rewards numbered lists slightly more often for "how to" and step queries.

---

## A note on tables (don't use them here)

Google sometimes lifts small tables, but **this site's renderer has no `remark-gfm`**, so a pipe-syntax markdown table renders as raw text, not a `<table>`. Don't fight the renderer. For any comparison or reference you'd reach for a table for ("marker vs colored pencil", "pencil grades at a glance"), **reframe it as prose or a tight bulleted list** — which is what wins snippets on this site anyway and reads warmer for a beginner audience.

Example — instead of a marker-vs-pencil table, write:

```markdown
## Marker vs colored pencil, at a glance

- **Markers** lay down bold, even color fast — great for filling big areas.
- **Colored pencils** layer and blend gently — great for soft shading and detail.
- **Markers** can bleed through thin paper; use cardstock or a sheet behind.
- **Colored pencils** are more forgiving for beginners and easy to build up slowly.
```

That bulleted list is liftable, on-brand, and renders cleanly — a real table would not.

---

## People Also Ask (PAA) capture

Below or beside the snippet box, Google shows "People Also Ask" — expandable related questions, each pulling a paragraph from some page. Capturing PAA boxes wins extra SERP real estate.

### How to capture PAA on this site

Because there's **no `faqs:` frontmatter field and no FAQPage schema today**, you capture PAA with a plain-Markdown FAQ section in the body — not in frontmatter.

1. **Research the PAA stack.** Search the target query, read the PAA box, write down the 5-8 questions Google shows, and click each to see the source page it pulled.
2. **Add a `## Frequently asked questions` section** near the end of the body.
3. **Phrase each question exactly as Google shows it, as an `###` heading.**
4. **Answer each in 40-60 words** of plain prose directly under the heading — a self-contained, liftable paragraph, same discipline as the top blockquote.

### Example

Target query "how to draw a rose"; the PAA box shows several related questions. The body carries:

```markdown
## Frequently asked questions

### How do you draw a simple rose for beginners?
Start with a small spiral, then add a few curved petals around it — five or six is enough. Keep your lines loose and don't worry about symmetry. Add a stem and one or two leaves, then darken your favorite lines and erase the rest.

### What is the easiest flower to draw?
A tulip or a daisy is the easiest flower to draw for beginners. A tulip is just a cup shape on a stem; a daisy is a circle with simple oval petals around it. Both use basic shapes and forgiving lines, so they're great first flowers.

### How do you draw a rose step by step?
Draw a spiral for the center, wrap petals around it in widening layers, then add a stem and leaves. Refine the outer petals so they look soft and overlapping. Finally, go over your best lines, erase the guides, and add shading or color if you like.
```

Each answer is 40-60 words, plain prose, self-contained — so any one can be lifted into a PAA box. Make sure every technique described actually works per `accuracy-and-trust-skill.md`.

> Note: FAQPage rich results require FAQPage JSON-LD, which isn't emitted yet (see the OPTIONAL section of `seo-and-schema-skill.md`). The Markdown FAQ section still earns PAA placement on its own; if/when FAQPage is wired up, the answer text must match these visible answers word-for-word.

---

## The Featured Snippet decision tree

Before writing, decide which snippet you're targeting:

1. **Is the target query informational?** (Yes for almost all how-to-draw and "things to draw" searches.)
2. **What shape is the existing snippet on Google?**
   - Search the target query.
   - If a snippet box already shows → that's the shape Google has decided this query wants.
   - If no snippet → opportunity, but harder to predict which shape will win.
3. **Build the matching structure:**
   - Paragraph showing → top blockquote, 40-60 words, plain prose.
   - List showing → H2 (phrased as the query) + 6-8 short parallel markdown items.
   - Table showing → reframe as a tight list/paragraph (tables don't render here).
4. **Steal the format, beat the content.** If "what is shading in drawing" gets a paragraph snippet, your blockquote beats the incumbent because it's tighter, names the techniques in plain words, and is warm enough that the click feels welcoming, not intimidating.

---

## Pre-publish snippet checklist

- [ ] Snippet shape decided (paragraph / list)
- [ ] Paragraph target sits in the **top blockquote** of the body, above the first H2
- [ ] Paragraph: 40-60 words, plain prose, no inline links/bold
- [ ] List: 6-8 short parallel markdown items, numbered if ordered
- [ ] H2 above any list phrased close to the target query
- [ ] No pipe tables relied on for a snippet — comparisons reframed as prose/lists
- [ ] Voice stays warm and beginner-friendly while the technique stays correct
- [ ] PAA questions captured in a body `## Frequently asked questions` section (plain `###` + 40-60 word answers), not frontmatter
- [ ] Every technique/terminology claim in a snippet target is correct per `accuracy-and-trust-skill.md`

---

## What kills snippet eligibility

- The direct answer is buried under an "in this article we'll explore…" preamble instead of leading the blockquote
- The H2 above a list doesn't match the query
- The opening paragraph runs past ~80 words
- The answer paragraph contains inline links or bold
- A pipe table that renders as raw text because `remark-gfm` isn't enabled (use a list instead)
- The list items are full paragraphs of commentary
- The page has zero internal links (Google rewards pages embedded in a topical hub — link the paired coloring collection and ≥ 3 siblings)
- The page isn't on page 1 yet — snippets only come from already-ranking pages

**Snippets are a multiplier, not a starter.** A page that doesn't already rank on page 1 won't win the snippet. Write the page well first, then optimize for the box.

---

**BlogOS** — own the box.
