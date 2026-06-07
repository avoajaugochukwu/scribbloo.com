---
name: update-discipline
description: When to update an existing post vs publish a new one. When to redirect. How to track updates when there's no modified-date field. When to sunset stale posts. This is the skill that prevents content rot, link decay, technique/terminology drift, and accidental duplicate-intent posts from accumulating across Scribbloo's coloring-pages and drawing-ideas corpus.
---

# Update Discipline — the long maintenance game

> Most blog content rots. A "40 easy things to draw" listicle that ranked in year one drifts out of relevance, cited sources move, a tutorial's steps fall out of sync with its step images, last season's holiday coloring set sits stale, and the site quietly loses traffic without anyone noticing why. This skill is the maintenance discipline that prevents that.

---

## The three lifecycle decisions

For any post that has been published for ≥ 6 months, you face one of three decisions:

1. **Leave alone** — post is still ranking, still accurate, still serving readers
2. **Update in place** — post needs refreshing but the intent and angle are still valid
3. **Replace** — post is fundamentally outdated, off-strategy, or the angle has changed

The wrong decision rots the corpus. The right decision compounds.

---

## What triggers a re-check

A drawing/coloring site refreshes on a mix of **the calendar** (some content is seasonal) and **events**. Re-check a post when any of these happens:

- **A season or holiday comes around** — a "Halloween coloring pages" collection or a "things to draw in fall" listicle wants a yearly pass before its season so it's fresh when search demand spikes
- **A technique or material claim needs correcting** — a step that doesn't quite work, a stated material behavior that's wrong (graphite, watercolor, marker), an outdated tool recommendation
- **A new collection or tutorial ships that this post should link to** — when a new coloring collection or sibling tutorial lands, re-link the relevant posts to it via `relatedCategories` / `relatedPages`
- **A tutorial drifts from its step images** — the prose says "two petals" but the image shows three, or steps were reordered without updating the pictures
- **A better source appears** — a clearer reference for an art-history or terminology claim supersedes a weaker citation
- **A trademark/licensing issue surfaces** — a post leans on a licensed character (Hello Kitty, Pokémon, Bluey) in a way that implies official status; fix it to fan-style framing

When any trigger fires, run the post through the update / replace / merge / sunset decision below.

---

## Tracking updates without a modified-date field

**Important:** Scribbloo's frontmatter has **no `dateModified` or `lastUpdated` field** — `lib/content/types.ts` doesn't validate one, so there is nowhere to stamp a "last updated" date in the post itself. Do **not** add a `dateModified` field; it won't render and it isn't in the schema. Instead, track update history through:

- **Git history** — the commit log is the real record of when and what changed. Write clear commit messages (see below); `git log content/blog/<slug>.mdx` is your update trail.
- **`publishedAt`** — this is the one date field that exists (ISO string). For a *replacement* you publish at a new slug with a fresh `publishedAt`. For a substantial in-place refresh you *may* bump `publishedAt` to reflect the meaningful republish — but treat that as a deliberate "this is materially a new version" call, not a routine date-bump, since it changes the displayed date and the sort order.
- **A visible correction note in the body** — when an update *corrects* a previous claim, say so in the post (see below). That's the reader-facing freshness signal, since there's no auto "last updated" stamp.

Freshness on Scribbloo is therefore communicated by *the content actually being current and seasonally relevant*, plus honest correction notes — not by a frontmatter date you flip.

---

## When to UPDATE in place

Update the existing post (do not publish a new one) when:

- The target query and intent are unchanged
- The structural skeleton is still sound
- Specific ideas, steps, or sources need refreshing (e.g. swapping a few stale listicle entries for fresher ones)
- A seasonal post needs its yearly pass before its season
- A tutorial's steps need re-syncing to its step images
- A new collection or sibling tutorial should now be linked from the post
- The post predates the current frontmatter shape and needs the new fields (`relatedCategories`, `relatedPages`, `metaDescription`)
- New internal links should be added (because new sibling guides / collections / hubs have been published)

### How to update in place

1. Open the existing MDX file at `content/blog/<slug>.mdx`
2. Make the changes
3. Add or update inline citations where you've touched a factual claim (links to a reputable, real source)
4. If the update *corrects* a previous claim — a wrong step, a bad material claim, an implied-official licensed character — add a plain-Markdown correction note (see below)
5. Refresh internal links (`relatedCategories` / `relatedPages`) to point at any newly-shipped collections or tutorials
6. Run `/b-review` to audit the updated post
7. Commit with a clear message — the commit *is* your update record, since there's no `dateModified` field: `Refresh "40 easy things to draw": swap 6 stale ideas, add 2025 step images, link unicorn collection`

### What counts as a "substantive" update

(These are the changes worth doing — and, if you choose to bump `publishedAt`, the kind that justify it.)

- New section or new ideas added (e.g. 10 fresh entries in a listicle)
- A tutorial step corrected or re-synced to its images
- A technique or material claim corrected or re-sourced
- A licensed-character reference fixed to fan-style framing
- A newly-shipped collection or tutorial linked in
- Seasonal refresh for the upcoming season
- New internal links added (3+)

What does NOT count as substantive (and never justifies bumping `publishedAt`):
- Typo fix
- Formatting tweak
- Single-link replacement (without changing a claim)
- Image swap with no content change

Never fake freshness by republishing without changing the substance — readers and Google both notice over time.

### How to write a correction (plain Markdown — no component)

This renderer maps plain Markdown to a fixed component map; there is no `<CorrectionNote>` component. Write the correction as plain Markdown — either a blockquote (which renders as the tinted box) at the relevant spot, or a bold "Correction:" line. Add it when the update *changes a previous claim*. Examples:

- "The original steps had you draw the ears before the head circle. The head comes first — corrected, and the step images now match."
- "The post previously linked our old dinosaur set, which has moved. Updated to the current [Dinosaur Coloring Pages](/coloring-pages/dinosaurs)."
- "The post previously described a Hello Kitty page as 'official.' It's fan-art-style, inspired by the character — corrected, with a note added."

Format — blockquote form:

```md
> **Correction:** This tutorial previously told you to color before
> outlining, which smudged the lines. The steps below now outline first,
> then color — the step images have been updated to match.
```

Or the bold-line form, inline where the correction applies:

```md
**Correction:** the earlier version said a 2B pencil makes the darkest
shadows; for the deepest darks reach for a 4B–6B, used throughout below.
```

Because there's no auto "last updated" stamp, a visible, honestly-worded correction is *the* trust signal. Sites that log corrections are taken more seriously than sites that quietly edit — and a parent or teacher relying on your steps deserves to know what changed.

---

## When to REPLACE (publish a new post + redirect the old)

Replace when:

- The target query has *shifted* (e.g. a dated "easy drawings 2021" post now competes against a 2026-intent query)
- The angle has *changed* (the new post takes a substantially different approach — say, from a thin list to a real tutorial)
- The post architecture is wrong (e.g. it was a one-paragraph idea dump and you need a full step-by-step pillar)
- The post would require >50% rewrite to update

### How to replace

1. Write the new post at a new slug (do not reuse the old slug — the URL is stamped on history). Path is `content/blog/<new-slug>.mdx`, with its own `slug`, fresh `publishedAt`
2. Set `status: Done` on the new post once it's ready (anything other than `Done` hides it from listings)
3. Publish the new post
4. Set up a 301 redirect from the old slug to the new slug
5. Update any internal links pointing to the old slug — including `relatedPages` arrays in other posts (use `Grep` or repo-wide search)
6. Delete the old MDX file from the repo (the 301 keeps the URL alive)
7. Keep the old post's permanent record somewhere outside `content/blog/` if anyone needs to reference it (git history already preserves it)

### The 301 redirect

Redirects live in `next.config.js` via `redirects()`. The convention:

```js
async redirects() {
  return [
    {
      source: '/blog/old-slug',
      destination: '/blog/new-slug',
      permanent: true,
    },
  ]
}
```

301 (permanent) signals to Google that the old URL is gone and the new URL inherits its SEO equity. 302 (temporary) does not transfer equity. Always 301 for retirements.

### When NOT to replace

- The old post still ranks #1 — leave it alone, even if you'd write it differently today
- The old post is the canonical reference for inbound links you don't control (round-ups, teacher resource lists, Pinterest pins) — leave the URL alive

---

## When to MERGE two posts

If two posts target overlapping intents (e.g. two near-identical "easy things to draw" listicles, or two "how to draw a cat" tutorials):

1. Pick the stronger of the two as the survivor
2. Move the unique, verified material (an extra set of ideas, a clearer step, a better finished example) from the weaker into the survivor
3. Expand the survivor's keyword brief entry, run `/b-review`
4. 301-redirect the weaker's slug to the survivor's slug
5. Update any `relatedPages` references that pointed at the weaker slug
6. Delete the weaker's MDX file

### Detecting overlap

Run a periodic audit:

- For each post in the corpus, list its primary target query (from the `plan/` brief)
- Group posts by that query
- Any group with > 1 post is a merge candidate

The keyword brief in `plan/` should reveal these conflicts before they're written.

---

## When to SUNSET (delete and 410)

Sunset when:

- The topic is genuinely irrelevant to the site's current direction
- The post is harming the site's quality profile (thin, off-topic, or built around a licensed character in a way you can't make compliant)
- The URL has no inbound links worth preserving

### How to sunset

1. Confirm no internal links point to the slug (including `relatedPages` arrays)
2. Delete the MDX file
3. Either:
   - Return HTTP 410 Gone (preferred for content that should be deindexed quickly)
   - Or 301 to the closest topical landing page — usually a relevant coloring collection (preferred if there's a natural successor)

Sunsetting is rare. Most "old" posts should be updated, replaced, or merged — not sunset.

An interim option short of deletion: set `status` to anything other than `Done` (the schema treats only `Done` as published) to pull a post out of listings while you decide. That hides it from the site without removing the file — useful when a post is wrong but a fix is pending.

---

## The freshness model

Different content has different freshness expectations. On a drawing/coloring site the cadence is seasonal-and-event-driven:

| Content type | Re-check trigger | Calendar backstop |
|---|---|---|
| Drawing tutorial (step-by-step) | Steps drift from images; a clearer method emerges | Every 18-24 months |
| Listicle ("N things to draw") | Entries feel stale or a trend moved on | Every 12 months (refresh entries) |
| Coloring collection / category landing | Its season approaches; new sheets ship | Yearly, ahead of season |
| Seasonal/holiday post | Its holiday is coming up | Yearly, 4-6 weeks before |
| "What is / how does" explainer | A terminology or technique claim changes | Every 18-24 months |
| Pillar / topic hub | A new sibling tutorial or collection ships under it | Every 12-18 months |

When a post is due, the orchestrator can flag it via a maintenance run that checks `publishedAt` (and git's last-touched date) against this model and the event/season triggers above — since there's no `dateModified` field to read.

---

## The maintenance run

Periodically (monthly is fine, plus a pre-season sweep), the site runs a maintenance audit:

```
For each MDX file in content/blog/:
  - Check publishedAt + git last-modified against the freshness model
    and season/event triggers (no dateModified field exists to read)
  - Flag seasonal posts whose season is within 6 weeks
  - Check every outbound URL for 200 status (no 404s)
  - Check every internal link, including relatedCategories / relatedPages,
    for resolution
  - Confirm status is Done (or intentionally hidden)
  - Confirm tutorial steps still match their step images
  - Re-verify headline facts (art history, material behavior, terminology)
    against current reputable sources
  - Confirm no licensed character is implied as official
  - Confirm posts link to any newly-shipped relevant collection / tutorial
  - Flag posts ranking below position 20 for the target query
  - Flag posts with declining traffic in Search Console
```

The output is a triage list. Each post gets one of the three decisions (leave / update / replace) and the corresponding action. Any post whose steps no longer match its images, whose factual claim can't be sourced, or that implies an unlicensed character is official, is escalated immediately.

---

## Tracking versions without a date field (advanced)

Because there's no `dateModified` field, for a handful of high-traffic posts where updates happen often you may want an in-body, visible change log near the bottom — plain Markdown, reader-facing, honest:

```md
## What's changed

- Refreshed for 2026: swapped 8 stale ideas, added new step images for the dragon.
- Added a "for younger kids" simpler variant.
- First published.
```

This is optional and reader-facing — not a frontmatter field. The git log remains the authoritative, machine-readable history; this in-body note is for readers who want to know the post is maintained. Reserve it for posts that get cited externally or drive significant traffic.

---

## Redirect hygiene

Over time the redirects pile up. Rules:

- Never redirect a redirect (A → B → C). Update the A redirect to point directly to C.
- Audit redirects quarterly. Remove redirects for slugs that have been gone for > 2 years and have zero referrer traffic.
- Never repurpose a slug. If `/blog/easy-things-to-draw` was once a listicle and is now a tutorial, that's a bait-and-switch and Google notices.

---

## What kills update discipline

- **Faking freshness by republishing without changing content** — Google and readers notice the dishonesty over time (and there's no date field to hide behind anyway)
- **Leaving 404s on outbound links** — reference sites move; the maintenance run catches them
- **Letting a broken step or wrong material claim sit** — the moment a tutorial's steps stop matching its images, or a claim can't be sourced, fix it; a beginner following bad steps loses trust in the whole site
- **Missing the seasonal window** — a Halloween collection refreshed in November is wasted; do the pass before the season
- **Not re-linking to new collections/tutorials** — when a collection ships, the posts that should point to it are orphaned value
- **Sunsetting posts without redirects** — every dead URL is wasted SEO equity
- **Duplicate intent across posts** — kills both, since neither concentrates ranking signals
- **Never updating anything** — the corpus rots quietly

---

## Pre-update checklist

- [ ] Decision (update / replace / merge / sunset) is correct for this post
- [ ] If updating, all changes are substantive (not cosmetic)
- [ ] No `dateModified` field added (it doesn't exist in the schema) — update tracked via clear git commit
- [ ] `status` is correct (`Done` to show, anything else to hide)
- [ ] If a seasonal post, refreshed ahead of its season
- [ ] Tutorial steps match their step images
- [ ] Any newly-cited facts verified against a reputable source
- [ ] No licensed character implied as official (fan-style framing + light disclaimer)
- [ ] Correction note (plain Markdown blockquote or bold "Correction:" line) added if a previous claim — a step, a material fact, a licensing implication — was corrected
- [ ] New citations added as inline Markdown links
- [ ] `relatedCategories` / `relatedPages` updated to any newly-shipped collection or tutorial
- [ ] If replacing, new slug differs from old slug, with its own fresh `publishedAt`
- [ ] If replacing, 301 redirect configured
- [ ] If replacing/merging, internal links (incl. `relatedPages`) to old slug have been updated
- [ ] `/b-review` run on the updated post

---

**blogOS** — content compounds when you maintain it.
