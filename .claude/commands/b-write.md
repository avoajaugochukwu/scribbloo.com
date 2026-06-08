---
description: Research-grounded writer for a Scribbloo tutorial/listicle/collection — produces strong, sourced, illustrated content (never thin).
argument-hint: <keyword or plan row, e.g. "how to draw a cat">
---

# /b-write — grounded content writer

Write ONE publishable page for `$ARGUMENTS`, to the standard of the BlogOS pack in
`protocols/blog/`. **Strong content only — a thin draft does not ship.** Follow this pipeline exactly;
do not skip the grounding or image steps.

## 0. Locate
- Find the row in `plan/plan.md`; open its brief (`plan/how-to-draw.md`, `plan/drawing-ideas.md`,
  `plan/coloring-collections.md`, or `plan/tools.md`) for the primary + secondary keywords and the
  **canonical clean slug** (e.g. `/how-to-draw/cat` → `cat`, NOT `how-to-draw-cat`).
- Read `plan/00-writing-guide.md` §4/§5/§8 (schema, SEO, template) and the matching content-type spec
  in `protocols/blog/page-structures-skill.md`.

## 1. GROUND IT — real sources, never from your head (hard gate)
Run the Perplexity researcher and read the result:
```
npm run research -- "<subject, e.g. how to draw a cat>" --save
```
This returns real, attributable artist tips + short quotes + a common beginner mistake, each with a
source URL (saved to `scripts/research/<slug>.json`). Per `protocols/blog/research-and-citation-skill.md`:
- A **tutorial** needs **2–5 primary citations**; a **listicle/pillar** needs **4–8**.
- Use the **foundation-first** method (light guides → basic shapes → details). A tutorial that skips
  basic shapes is a broken technique → do not ship.
- Quote only **named, real** artists/educators with the source linked (inline attribution:
  the link sits on the source name, e.g. `[Draw Botanical](URL)`). If a quote can't be verified, cut it.
- Licensed character? Fan-style phrasing + the disclaimer (`research-and-citation-skill.md` trademark rule).
- If research surfaces only content-farm aggregators / AI SERP spam → the topic is thin; say so and stop.

## 2. Avoid the "same article, subject swapped" trap (variety)
Read the last entries in `protocols/rotation-log.md` and pick a DIFFERENT intro pattern, context
bridge, and conclusion shape per `protocols/blog/variety-rotation-skill.md`. Append your slot picks to
the log. This is what keeps 60 tutorials from cannibalizing each other on engagement.

## 3. Draft (plain-Markdown MDX)
- Frontmatter per `00-writing-guide.md` §4 (clean slug; `featuredImage: featured.webp`; a `category`
  for the index grouping; `order` = volume).
- Body per the type template (§8). Tutorial = intro → What you'll need → **step-by-step** → grounded
  tips/mistakes → variations → FAQ → CTA. Hit the type's word-count floor; weave secondary keywords as
  H2/H3 naturally.
- **Internal links (3–6, canonical paths, descriptive anchors):** the matching coloring collection
  (bidirectional), the relevant `/drawing-ideas` listicle, 2–3 sibling tutorials. No orphans.
- Voice: warm "Storybook Retro", grade-6, US spelling, no em-dashes, no filler, no fake stats
  (`protocols/site-voice-profile.md`).

## 4. Illustrate (both images)
- **Hero** (colored, → `featured.webp`):
  `npm run generate:article -- --namespace how-to-draw --slug <slug> --prompt "<colored finished subject, cream paper, plenty of space>"`
- **Process strip** (line art, → `steps.webp`) for tutorials, embedded in the step-by-step section via
  `![Step-by-step: how to draw a <subject>...](/images/how-to-draw/<slug>/steps.webp)`:
  `npm run generate:article -- --namespace how-to-draw --slug <slug> --style process --prompt "how to draw a <subject> in 4 stages left to right: stage 1 <guides>, stage 2 <basic shapes>, stage 3 <outline+detail>, stage 4 finished"`
  The strip's stages MUST match the written steps (foundation-first).

## 5. Anti-thin publish gate (refuse to ship if any fail)
- [ ] Every load-bearing tip/fact traces to a real source that's linked; quotes are real + attributed.
- [ ] The steps actually work when walked (basic shapes → details).
- [ ] Meets the citation minimum for its type; FAQ present; primary keyword in title + H1 + first 100 words + meta.
- [ ] 3–6 internal links, canonical paths, ≥1 reciprocal; matching collection linked both ways.
- [ ] Hero + (for tutorials) process image present and embedded.
- [ ] `npm run validate` passes.
Then run `/b-review <slug>` for the adversarial pass before considering it done.
