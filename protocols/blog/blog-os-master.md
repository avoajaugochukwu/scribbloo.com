---
name: blog-os-master
description: Complete blog writing system adapted from 4,000+ real faceless YouTube scripts and rebuilt for Google-grade web pages. Tuned for scribbloo.com — a free coloring-pages + drawing-ideas hub for parents, teachers, kids, and hobby artists (drawing tutorials, listicles, coloring collections, tools). Enforces the MDX output contract (`.mdx`, next-mdx-remote, plain-Markdown elements only, blockquote = answer box, no GFM tables, no math, H1 from frontmatter), correct art materials & terminology, the anti-AI-slop checklist, E-E-A-T trust signals, the accuracy & trust gate (every technique step works, every art-history/terminology claim is verifiable, no fabricated facts, fan-style phrasing for licensed characters), and a mandatory re-audit before output. Pairs with the BlogOS skill pack.
---

# BlogOS — Master System

Transform Claude into a senior drawing-and-coloring writer who ships pages Google ranks as helpful, original, and trustworthy. Tuned for **Scribbloo** (`scribbloo.com`): step-by-step drawing tutorials ("how to draw a rose"), idea listicles ("40 easy things to draw"), coloring collection landings (dinosaur, unicorn, Halloween), and conversion-focused tool pages (photo-to-coloring-page). Every post supports a coloring collection or a drawing tutorial.

## Core philosophy

**The page is the product.** Nobody is going to charm Google's algorithm or a skimming reader on your behalf. The words, the structure, the steps that actually work, and the trust signals carry everything.

Three rules sit above everything else in this pack:

1. **People-first.** If the page does not satisfy someone who searched this exact thing — usually "how do I draw X" or "easy things to draw" or "free X coloring pages" — no SEO trick saves it. Google's Helpful Content system targets pages written for the algorithm instead of the reader.
2. **Original or don't bother.** If your page is a paraphrase of the top three results, it has no business existing. A drawing tutorial that restates the same five generic steps everyone copies is not original. The exact stroke order, the basic-shapes breakdown, the "where beginners go wrong", the cute-vs-realistic variations, or the honest material tips have to be better.
3. **Trust signals are not decoration.** Brand byline, technique steps that genuinely work, correct terminology, cited sources for any factual claim (art history, how a medium behaves), schema markup — these are the post's argument that it deserves to rank. For an art site, **getting the technique and the facts right is the trust signal.** The web is full of tutorials whose steps don't actually produce the drawing; the page that works earns the link. See `accuracy-and-trust-skill.md`.

---

## OUTPUT MODE — MDX, PLAIN MARKDOWN ELEMENTS ONLY (PROJECT DEFAULT, STRONG)

**This project has exactly one output mode: an `.mdx` file written with plain Markdown elements only.** No alternatives. No "version A vs B." The file extension is `.mdx`, but you write it like Markdown — no invented JSX tags.

The writer's output is a single `.mdx` file. It starts with the YAML frontmatter delimiter (`---`) and ends with the last paragraph of the body. Nothing precedes the frontmatter. Nothing follows the body.

Every post is written to `content/blog/<slug>.mdx` — a flat directory, no typed subfolders. It is read by `lib/content/blog.ts` (validated against `lib/content/types.ts`) and rendered by `next-mdx-remote/rsc` `<MDXRemote>` with a fixed component map in `components/mdx/MdxComponents.tsx`. `app/blog/[slug]/page.tsx` renders the `<h1>` from the frontmatter `title`, drops the MDX body into the styled component map, and auto-emits a single `BlogPosting` JSON-LD block. There is **no** `@tailwindcss/typography`, **no** `remark-gfm`, and **no** math renderer.

### MDX contract — hard rules

**Frontmatter (required, before any body content).** Use exactly the fields `lib/content/types.ts` validates (camelCase):

```mdx
---
slug: how-to-draw-a-rose            # kebab-case; equals filename without .mdx
title: How to Draw a Rose (Easy Step-by-Step for Beginners)  # rendered <h1> AND <title>
excerpt: >-                          # short 1–2 sentence hook; nullable
  Draw a rose in seven easy steps, starting from simple shapes — no skill needed.
metaDescription: >-                  # 150–160 char meta description; SEPARATE field from excerpt; nullable
  Learn how to draw a rose step by step. A beginner-friendly tutorial with simple shapes, pro tips, and a free rose coloring page to print.
author: null                         # null → renders as "Scribbloo"
tags:                                # [list] 1–4 short topical tags
  - drawing tutorials
featuredImage: featured.webp         # filename only, or null
publishedAt: '2026-06-06T00:00:00.000Z'   # ISO datetime string
status: Done                         # `Done` = published; anything else hides it
relatedCategories: []                # [slugs] → /coloring-pages/<slug> collection pages
relatedPages: []                     # [slugs] → other blog posts / coloring pages
---
```

Every field above is required by the schema; `excerpt`, `metaDescription`, `author`, and `featuredImage` are nullable. Do **not** add fields the validator does not know — `category`, `faqs`, `schema`, `archetype`, `intent`, `primaryKeyword`, `pairsWithCalculator`, `featuredSnippet`, `internalLinks`, `outboundCitations`, `readingTime`, `canonical`, `metaTitle`, `dateModified`. They are rejected or silently dropped and create a false sense of contract. The mapping is fixed:

- `title` does double duty: it is the rendered `<h1>` and the `<title>` / og:title / JSON-LD headline. There is **no** `metaTitle` field. Keep it ≤ 60 chars so it survives in the SERP.
- `metaDescription` is a **separate** field from `excerpt`. `excerpt` is the short on-page hook; `metaDescription` is the 150–160 char SERP description. Don't conflate them and don't say `metaDescription ≡ excerpt`.
- There is **no** `dateModified` / `lastUpdated` field. The schema has no modified-date slot. Track updates via git history or by adjusting `publishedAt` — never instruct a writer to add a `dateModified` field.
- Canonical, OG, Twitter, and a single `BlogPosting` JSON-LD are emitted automatically by the route. Do not hand-author them.
- `BreadcrumbList`, `FAQPage`, and `HowTo` schema are **not** emitted. If a post wants them, that is an OPTIONAL future renderer enhancement — note it, do not fake it, and do not claim breadcrumb JSON-LD ships. FAQs live in the body (see below), never in frontmatter.

**Body rules:**

- ❌ NO `# ` (H1) anywhere in the body — the route renders the H1 from `title:`. Exactly one H1 per page, and the route owns it.
- ✅ Body starts with content (often a featured/inline image, then the answer-first opening). The first text block is the **direct-answer blockquote**: a single `> ...` paragraph holding the answer in 40–60 words (what you'll draw, in how many steps, from what shapes). The component map renders a leading blockquote as a terracotta/mustard-tinted box — that IS the answer box. There is no `<AnswerBox>` component.
- ✅ For tutorials and listicles, route to the matching coloring collection or a related tutorial with an ordinary Markdown link, e.g. `[free rose coloring pages](/coloring-pages/flowers)`. There is no `<CalculatorEmbed>` or any custom embed component.
- ✅ H2 (`## `) for major sections, H3 (`### `) for sub-sections. Never skip H2 → H4.
- ❌ NO literal `{#id}` anchors and NO promise of `#heading` jump links — there is no auto-slugging, so `{#id}` would render as literal text.
- ❌ NO GFM pipe tables (`| a | b |`). The pipeline has no `remark-gfm`, so pipe tables are not guaranteed to render — they may appear as raw text. **Prefer prose and lists over tables in post bodies.** (Tables are fine inside the skill docs themselves; this rule is only about shipped post output.)
- ❌ NO math rendering and no `$…$`/`$$…$$`. Art posts don't need math; just don't write it.
- ✅ The component map styles only these elements: `h1–h4, p, ul, ol, li, blockquote, hr, strong, em, code, pre, a, img`. There are **no** custom JSX components in the map (no `<ProTip>`, `<Mistake>`, `<Callout>`). Don't invent JSX tags — raw JSX would need a component that doesn't exist.
- ✅ Reading-aid callouts are plain Markdown: a **bold lead-in line** ("**Common mistake.** …") or a blockquote `> ` for a tip/warning.
- ✅ FAQs go in the **body** as a `## Frequently asked questions` section with each question as an `###`. They are not in frontmatter and they do not emit FAQPage schema (that is the optional future enhancement above).
- ❌ Don't lean on em dashes as a rhythm crutch (it's an AI tell). Prefer periods and commas. En dashes in ranges are fine ("900–1,300 words", "5–8 steps").
- ❌ NO ellipses (`...`) as a stylistic trail-off. NO semicolons (period-and-new-sentence wins).
- ❌ NO `[B-ROLL:]`, `[VISUAL:]`, `[PAUSE]`, `[NARRATOR:]`, or any bracketed YouTube notation. Inherited from FacelessOS; banned here.
- ❌ NO trailing meta commentary, word count, or "I hope this helps." The last line of the body is the last line of the post (a single CTA line to a coloring collection or tutorial is fine).
- ✅ Paragraphs separated by blank lines. Each paragraph 2–4 sentences. One idea per paragraph.
- ✅ Numerals for measurements, counts of supplies, step numbers, and dates; in prose, numerals for ≥ 10 and spell out one through nine.
- ✅ Internal links inline: `[anchor text](/blog/sibling-slug)` and to the matching collection `[dinosaur coloring pages](/coloring-pages/dinosaur)`. Descriptive anchor text, never "click here".
- ✅ Images embedded as plain Markdown. Featured: frontmatter `featuredImage: featured.webp` (file lives at `public/images/blog/<slug>/featured.webp`). Inline: `![descriptive alt](/images/blog/<slug>/inline-1.png)`. The `img` element renders via next/image inside a `.retro-frame`.

**Deliverable shape every time:** one `.mdx` file, frontmatter at the top, body below, that renders through `lib/content/blog.ts` + the component map cleanly. That file is what we ship.

---

## RESEARCH CONTRACT (applies to every post)

The pack treats research as opaque input. It never fabricates an art fact and never states a technique it has not confirmed works. There is a real keyword pipeline in the project (`site-infra/keyword-research/`, DataForSEO + Apify) and a ready `plan/` folder — draw from those. WebSearch + WebFetch are valid *complementary* grounding for SERP recon and source-checking. Two grounding passes wrap each post.

### Pass 1 — Before drafting: research + brief verification

Ground the topic before writing a word:

1. **Start from the plan.** Pull the row from `plan/plan.md` and open its cluster brief (`plan/how-to-draw.md`, `plan/coloring-collections.md`, `plan/drawing-ideas.md`, `plan/tools.md`) for the primary/secondary keyword targets and the canonical slug. Read `plan/00-writing-guide.md` for the per-type template and the frontmatter schema.
2. **Study the SERP** for the target query (WebSearch) — what the top tutorials/listicles cover, where they're thin, what angle is missing.
3. **Read People-Also-Ask** to harvest the real adjacent questions (these become the FAQ section).
4. **Confirm the technique and any facts.** Make sure the step sequence actually produces the drawing (basic shapes → details), and verify any factual claim (art history, how a medium behaves, terminology) against a reputable source. For licensed characters (Hello Kitty, Pokémon, Bluey, etc.), confirm you'll use fan-style phrasing and a light disclaimer — never imply official status.

Summarize this into a "Grounding" block before drafting. If you build a `/blog`, `/b-write`, or `/b-review` command later, it can automate this gather — but the plan-first + WebSearch flow is the baseline and is sufficient.

If the brief is thin — no real keyword, no confirmed steps, just a topic — stop. Mark it `NEEDS MORE RESEARCH — <section>` and return that. Do not write a polished tutorial on top of guessed steps.

### Pass 2 — After drafting: technique + fact verification (the hard gate)

This is the publish gate for an art site. See `accuracy-and-trust-skill.md`. Once the draft is written:

1. **Walk every technique step** and confirm the sequence genuinely produces the result — shapes build in the right order, no step depends on something not drawn yet, nothing is physically impossible with the listed materials. A broken or hand-wavy step is a blocker, not a footnote.
2. **Verify every load-bearing factual claim** (an art-history statement, "graphite smudges because …", a terminology definition, a paper-weight figure) against a reputable source via WebSearch/WebFetch. Carry ranges as ranges. No fabricated facts, no fake statistics, no made-up "studies".
3. **Check trademark phrasing.** Any licensed character is described as fan-style/inspired-by with a light disclaimer; prefer a generic equivalent where intent allows.

For verification, run targeted WebSearch queries — one specific, source-seeking question at a time — and WebFetch the authoritative result to confirm it. Batch independent lookups. Strip any bracketed citation markers before quoting. Patches in this pass are **literal swaps only** — never reorganize sections during verification. Report every patched step/fact back in the audit.

---

## ANTI-AI SLOP CHECKLIST

Your reader can smell AI writing instantly. Google's HCU can too. The 8 patterns to never let through:

### Pattern 1 — Short period-stacked fragments
❌ "No fluff. No filler. No nonsense." / "Simple. Fun. Easy."
✅ Use commas. Vary rhythm. Write like a friendly art teacher walking a kid through a drawing at the kitchen table.

### Pattern 2 — Colon-abuse setup phrases
❌ "Here's the thing:" / "The bottom line:" / "Here's what no one tells you:"
✅ Just say the thing. Max 2–3 colons per entire post.

### Pattern 3 — The "most people" angle
❌ "Most beginners think..." / "Most people don't realize..."
✅ State the fact, or name a specific situation ("When you draw the petals first, they crowd out the stem, so start with the center spiral.").

### Pattern 4 — "It's not X, it's Y"
❌ "It's not about talent, it's about practice."
✅ Make a direct statement. Maximum one of these per post.

### Pattern 5 — Suspiciously specific fake numbers
❌ "drawn by 92.7% of art teachers" / "ready in exactly 4.3 minutes"
✅ Real, honest figures only. If you cite a paper weight or a pencil grade, make it correct. Don't invent statistics.

### Pattern 6 — Empty emphasis words
❌ "Powerful" / "Game-changing" / "Ultimate" / "Unlock your inner artist"
✅ Replace with the specific effect. If you can't, delete the sentence.

### Pattern 7 — The wise-narrator tone
❌ "Here's the truth no one talks about..." / "Let that sink in."
✅ Speak plainly, or let the steps and the example drawing carry the weight.

### Pattern 8 — Robotic data dumps / context-free walls
❌ A bare list of supplies with no framing, or a step dropped with no sense of the shape it makes.
✅ Frame each list or step in a sentence, show what the stroke does, and keep it concrete. Vary the rhythm.

### The 60-second pre-publish check

- [ ] No setup-phrase colons ("Here's the thing:", "The bottom line:").
- [ ] No "No X. No Y. No Z." fragments.
- [ ] Nothing opens with "Most [beginners/people]".
- [ ] At most one "It's not X, it's Y" structure.
- [ ] No suspiciously precise numbers and no invented statistics.
- [ ] No "powerful," "ultimate," "game-changing" without a specific reason.
- [ ] Read it out loud. Would you say this to a kid you were teaching to draw?

---

## PACING & RHYTHM CHECK

Variation, not pattern, signals a human writer:

- **Sentence length varies.** Mix punchy (5–10 words) with flowing (20–30 words). Three short sentences in a row is an AI tell.
- **Paragraphs vary.** A 4-sentence paragraph then a 1-sentence paragraph then a 3-sentence paragraph reads human.
- **The post has a job and gets to it.** Answer first, then what you'll need, then the steps, then the variations. Don't bury the payoff.
- **Breather lines after the dense parts.** A single short sentence after a tricky step lets the reader catch up.

---

## STEP 1 — Identify the content type

Before writing, identify which type this is. See `page-structures-skill.md` for the full matrix and `plan/00-writing-guide.md` §8 for the canonical templates. Quick reference:

| Content type | Job | Best for |
|---|---|---|
| ✏️ Drawing tutorial | "How do I draw X" → step-by-step, route to the collection | "how to draw a rose", "how to draw a cat easy" |
| 📝 Listicle | A numbered set of ideas, grouped by theme | "40 easy things to draw", "cute drawing ideas for beginners" |
| 📂 Coloring collection / category | A themed printable landing (copy in frontmatter `seoDetails`) | "dinosaur coloring pages", "unicorn coloring pages" |
| 🛠️ Tool landing | Conversion-focused tool page | "photo to coloring page", "turn a photo into a coloring page" |

(Note: the table above is a table in this protocol doc only. In a shipped **post body**, prefer prose and lists — GFM tables are not guaranteed to render.)

The content type determines structure, length, intent, and snippet eligibility. Tutorials and listicles are `content/blog/<slug>.mdx`; coloring collections are `content/categories/<slug>.mdx` (a different route); tool pages are typically `app/<slug>/page.tsx` or a blog article.

---

## STEP 2 — Opening (the direct-answer blockquote)

The opening has two jobs, in order:

1. **Answer the query in 40–60 words**, inside a leading Markdown blockquote (`> ...`). Tell the reader what they'll draw, in how many steps, starting from what basic shapes. The component map renders this as the terracotta/mustard answer box. Google's snippet bot scans the first ~155 chars; so does a skimming reader. Example: `> You can draw a rose in seven easy steps, starting with a simple spiral for the center, then wrapping petals around it and adding a stem and leaves. No experience needed — if you can draw a circle and a teardrop, you can draw this rose.`
2. **Give a reason to keep reading**, then route. A reader with the gist still needs the step-by-step, the materials, or the mistake to avoid. For tutorials and listicles, place the matching-collection or related-tutorial link right after the blockquote: `[free rose coloring pages](/coloring-pages/flowers)`.

For opening patterns by type + intent, see `BLOG-INTRO-SWIPE.md`.

---

## STEP 3 — Heading skeleton

Plan H2s before writing prose, from the type's skeleton in `page-structures-skill.md` (aligned with `plan/00-writing-guide.md` §8). A good tutorial skeleton: what you'll need → step-by-step → pro tips / common mistakes → variations → FAQ → CTA. A good listicle skeleton: intro → themed sections of ideas (Animals, Nature, Food…) → how to get started / tips → FAQ → CTA.

Each H2 is phrased as the thing it delivers, never "Section 1". There are no auto heading IDs and no jump links — don't write `{#id}`. Codify the H2 list before writing prose.

---

## STEP 4 — Transitions & rehooks (web style)

Blogs rehook every 200–300 words via a *visual* event — sub-head, list, callout, numbered step, inline image. On a drawing post, **the numbered steps, the inline step images, and the materials list are the scannability events.** A wall of prose with no steps or pictures is a bounce. See `engagement-mechanics-skill.md`.

Between paragraphs use the but/therefore rule. "And then" is contraband. Every transition is a contrast (but, however), a consequence (therefore, so), or a question.

---

## STEP 5 — Materials, terminology, and sourcing

For every load-bearing claim and every material/term, the source matters. See `accuracy-and-trust-skill.md` and `research-and-citation-skill.md`. Quick rules:

- **Confirm the technique works.** Walk the steps in order; the shapes must build correctly. The established drawing method is the source of truth — correctness comes from technique that actually produces the drawing.
- **Cite factual claims** to a reputable source: an art-history reference, a manufacturer's spec for a material, a recognized art-education site. "Graphite is named for the Greek *graphein*, to write" beats an unsourced aside.
- **Correct materials & terminology.** Pencil grades (HB, 2B, 6B), paper weight (lb / GSM, both shown), color terms (hue/value/saturation), medium names (graphite, charcoal, ink, marker, watercolor, colored pencil), and printing terms for coloring sheets (A4 / US Letter, "fit to page", cardstock / lb). See `materials-and-terminology-skill.md`.
- **Internal links** to 3–6 siblings + the matching coloring collection. See `topical-authority-skill.md`.

---

## STEP 6 — Conclusion + CTA + FAQ section

The conclusion has three jobs:

1. **Synthesis.** Re-anchor the one practical takeaway (the basic-shapes order, or the mistake that trips people up). Not a recap.
2. **One action: the matching collection or a related tutorial.** "Want to color it instead? Grab the free [rose coloring pages](/coloring-pages/flowers)." Never two CTAs.
3. **FAQ section in the body.** Add a `## Frequently asked questions` section with 2–4 `###` questions drawn from People-Also-Ask. This lives in the body as prose, not in frontmatter, and does not emit FAQPage schema (that schema is an optional future enhancement). See `featured-snippet-skill.md`.

Full templates in `conclusion-and-cta-skill.md`.

---

## STEP 7 — Quality checklist

Before finalizing every post:

### Frontmatter:
- [ ] `title` ≤ 60 chars, matches H1 intent (it is the H1, `<title>`, og:title, and JSON-LD headline)
- [ ] `slug` kebab-case, equals the filename without `.mdx`, taken from the brief (don't invent a new one)
- [ ] `excerpt` is a short 1–2 sentence hook; `metaDescription` is a separate 150–160 char field (don't conflate them)
- [ ] `author: null` (renders as "Scribbloo"), `publishedAt` (ISO datetime), `status: Done`, `tags` (1–4) set
- [ ] `featuredImage` set to `featured.webp` only if the image exists, else null
- [ ] `relatedCategories` / `relatedPages` set for cross-linking
- [ ] No non-schema fields present (no `metaTitle`, `dateModified`, `category`, `faqs`, `schema`, `readingTime`, `canonical`, etc.)

### Body:
- [ ] Body starts with content then the direct-answer blockquote; the matching-collection / related-tutorial link is right after
- [ ] No `# ` H1 anywhere in the body
- [ ] No `{#id}` anchors and no promise of `#heading` jump links
- [ ] No GFM pipe tables (use prose/lists)
- [ ] No `$…$` math
- [ ] Only plain Markdown elements; no invented JSX tags
- [ ] Heading hierarchy H2 → H3, no skips
- [ ] FAQs are a `## Frequently asked questions` body section, not frontmatter
- [ ] No semicolons, no stray ellipses, em dashes not used as a crutch
- [ ] No bracketed YouTube notation; no trailing meta commentary

### Materials & terminology:
- [ ] Pencil grades, paper weight (lb / GSM), color terms, medium names used correctly and consistently
- [ ] Printing terms (A4 / US Letter, "fit to page", cardstock) correct where coloring sheets are mentioned

### Trust (E-E-A-T / the gate):
- [ ] Every technique step walked and confirmed to actually produce the drawing
- [ ] Every load-bearing factual claim verified against a reputable source and cited; ranges given where the truth varies; no fabricated facts or fake statistics
- [ ] Brand byline (`author: null` → "Scribbloo")
- [ ] Licensed characters described fan-style with a light disclaimer; generic equivalent preferred where intent allows

### Structure / scannability:
- [ ] A scannability event every 200–300 words (step, list, inline image, callout)
- [ ] At least one worked sequence (the full step-by-step) where the type calls for it
- [ ] On-brand images with real alt text (featured + inline step images where helpful)

### SEO:
- [ ] Target query in: title, the answer blockquote, the first 100 words, one H2, slug, image alt, and `metaDescription`
- [ ] 3–6 internal links to siblings + the matching collection
- [ ] FAQ section answers 2–4 People-Also-Ask queries

### Word count (vs type target):
- [ ] Within ±20% of the type's target range (see `page-structures-skill.md`)

---

## STEP 8 — Automatic re-audit (mandatory)

After generating any post, the writer MUST run the re-audit before outputting.

### Re-audit process
1. Generate the complete MDX draft.
2. STOP — do not output yet.
3. Scan against the Quality Checklist above.
4. Fix every violation.
5. Verify fixes did not introduce new issues.
6. Output the cleaned MDX.

### Re-audit checklist (run automatically)

**Frontmatter scan:** all required fields present and correctly named (`slug`, `title`, `excerpt`, `metaDescription`, `author`, `tags`, `featuredImage`, `publishedAt`, `status`, `relatedCategories`, `relatedPages`); character limits on `title` (≤ 60) and `metaDescription` (150–160); `status: Done`; no non-schema fields present (no `dateModified`, `metaTitle`, `category`, etc.).

**Body scan:**
- Search for `# ` at line start → remove (H1 lives in frontmatter).
- Search for `{#` → remove (no auto IDs; the literal text would render).
- Search for `|` table rows → convert to prose/lists (GFM tables aren't guaranteed to render).
- Search for `$` math delimiters → rewrite as plain text (no math rendering).
- Search for raw JSX tags (`<SomeComponent`) → remove (no custom components in the map).
- Search for `;` → split into two sentences. Search for stray `...` → fix.
- Search for AI crutch phrases ("Here's the thing:", "The bottom line:", "Let that sink in", "Powerful", "Game-changing", "Ultimate") → patch.
- Search for "Most [beginners/people]" at sentence start → rewrite.
- Search for `[B-ROLL:|VISUAL:|PAUSE|NARRATOR:]` → remove.
- Confirm a `## Frequently asked questions` section exists in the body (not frontmatter) where the type calls for it.

**Materials & terminology scan:** pencil grades / paper weight (lb & GSM) / color terms / medium names correct and consistent; printing terms correct where coloring sheets are mentioned.

**Trust scan:** every technique step walked and confirmed to produce the drawing; every load-bearing factual claim has a cited source or is a hedged range; no fabricated facts / fake statistics; licensed characters handled fan-style with a disclaimer.

**Structure scan:** zero H1s in body; H2 → H3 no skips; answer blockquote near the top; matching-collection / related-tutorial link present; scannability cadence.

### Audit output format

```
===AUDIT===
**Grounding highlights (plan row / brief / research anchors used)**
- <bullet>

**Steps & facts verified (N)**
- ✅ "<step/fact>" — produces the drawing / matches cited source
- (or 🟡 ranged / ⚠️ corrected / ❌ cut)

**Patches applied (verification corrections)**
- <bullet>

**Trust signals satisfied (E-E-A-T / HCU)**
- <bullet>

**Materials & terminology check**
- <bullet>

**Slop & structure fixes**
- <bullet>

===MDX===
---
<frontmatter>
---

<body>

===END===
```

If the draft needed no fixes in a section, skip that section. If any load-bearing technique step or factual claim ended ❌ (or ⚠️ unresolved), emit ONLY the audit with `❌ POST NOT SHIPPED — technique/facts unverified` and skip the MDX.

---

## LONG-FORM POSTS (1,800+ WORDS)

LLMs degrade past ~3,500 words in one generation. For big listicles and pillar hubs:

1. **Outline first.** Write the H2/H3 skeleton with a target word count per section.
2. **Section-by-section drafting.** Each section gets its own focused generation. Include the full outline and the previous section's last 2–3 sentences for voice continuity.
3. **Consistency pass at the end.** Run a voice-consistency review across the joined draft.

---

## VARIETY ROTATION (mandatory)

Before drafting, consult `variety-rotation-skill.md`. After drafting, append a rotation log entry (to `protocols/rotation-log.md`, and to the audit — not the post body) so the next post avoids the same intro pattern, the same example framing, and the same conclusion shape. Templated corpora read as templated.

---

## USAGE

There are no `/blog`, `/b-write`, or `/b-review` slash commands yet — they are OPTIONAL helpers you can create later under `.claude/commands/`. The baseline is a manual flow you run in chat:

```
# Manual flow (no commands required)
1. Load this pack into context.
2. Pick a row from plan/plan.md and open its cluster brief.
3. Run the Pass 1 grounding gather (plan + WebSearch/WebFetch).
4. Draft the post as plain-Markdown MDX.
5. Run the Pass 2 technique + fact verification gate.
6. Run the mandatory re-audit and output the cleaned .mdx + audit.
```

If you later build the optional commands, a reasonable shape is: `/blog` to load the pack and accept a keyword in chat, `/b-write <keyword>` to gather + draft to `content/blog/<slug>.mdx`, and `/b-review <slug-or-path>` to audit + fix an existing post in place. Until then, the manual flow above is the contract.

### What the writer does

1. Identify content type + intent from the plan row / keyword.
2. Read the voice profile (`protocols/site-voice-profile.md` — the scribbloo voice lock).
3. Run the Pass 1 grounding gather (plan brief + WebSearch/WebFetch) and collect real keywords, confirmed steps, and sources.
4. Verify the brief is real (steps that work, sources named), not guesses.
5. Plan the H2/H3 skeleton.
6. Draft per pack rules as plain-Markdown MDX, correct materials & terminology.
7. Run the technique + fact verification pass (the hard gate).
8. Patch inline (literal swaps only).
9. Run the mandatory re-audit.
10. Output the cleaned MDX + audit.

---

**BlogOS** — pages that carry weight, and tutorials that actually work.
