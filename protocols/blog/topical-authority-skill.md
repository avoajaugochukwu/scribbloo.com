---
name: topical-authority
description: The hub-and-spoke (pillar-cluster) content architecture that signals topical authority to Google for scribbloo.com's drawing-tutorial and coloring content. This skill is how a site of 100 pages becomes a recognized authority on a topic rather than 100 disconnected pages. Covers pillar selection (a How-to-Draw pillar, a Coloring-Pages pillar, a Drawing-Ideas pillar), cluster mapping, tutorial⇄collection pairing, inline internal-linking discipline plus the relatedCategories/relatedPages arrays, and when to write a new cluster vs expand an existing post.
---

# Topical Authority — hub-and-spoke

> Google does not just rank individual pages anymore. It ranks sites for *topics*. A site with a well-organized pillar plus 8-15 supporting cluster pages will outrank a site with 50 disconnected pages on the same topic, even if the disconnected pages are individually better written.

---

## The model in one diagram

```
                        Pillar page (head term)
                        e.g. "How to Draw for Beginners"
                              ▲
                              │  internal links
                              │
            ┌────────┬────────┼────────┬────────┐
            │        │        │        │        │
        Cluster 1  Cluster 2  ...   Cluster 4   Cluster 5
        "how to    "how to         "cute things  "Rose
         draw a     draw a cat      to draw"      coloring
         rose"      easy"           (listicle)    pages"
         + rose                                   (collection)
         coloring
         pages

                    (clusters link to each other
                     AND back up to the pillar)
```

The pillar covers the head term comprehensively. Each cluster covers one specific long-tail under it — a drawing tutorial, a "things to draw" listicle, or a paired coloring collection. Clusters link **up** to the pillar and **across** to siblings. The pillar links **down** to every cluster. **Every tutorial links to its paired coloring collection, and every collection links back to its tutorials.** That tutorial ⇄ collection pairing is the spine of the whole graph.

This is the structure Google's notion of "topical authority" was built to recognize.

---

## How linking physically works on this site

Internal links live in **two places**, and you use both:

1. **Inline body links** (the primary topical signal) — standard Markdown in the post body, rendered through the MDX component map:
   - To a coloring collection: `[anchor text](/coloring-pages/slug)` — e.g. `[rose coloring pages](/coloring-pages/rose)`
   - To a sibling post: `[anchor text](/blog/sibling-slug)`
2. **The `relatedCategories` and `relatedPages` frontmatter arrays** (the related-content rails the route renders):
   - `relatedCategories: [<collection-slugs>]` → cross-links to `/coloring-pages/<slug>` landings
   - `relatedPages: [<blog-or-page-slugs>]` → cross-links to sibling posts

Do **both**. Inline links carry the anchor-text signal Google weighs most; the arrays power the on-page "related" UI and make the pairing explicit in data. Relative paths resolve against the site root. Posts live flat under `/blog/<slug>`; coloring collections live under `/coloring-pages/<slug>`.

The real link targets you'll pair posts with:

| Namespace | Routes |
|---|---|
| Coloring collections | `/coloring-pages/<slug>` (e.g. `/coloring-pages/dinosaur`, `/coloring-pages/unicorn`, `/coloring-pages/rose`) |
| Coloring pillar / hub | `/coloring-pages` (the landing) |
| Tutorials & listicles | `/blog/<slug>` (e.g. `/blog/how-to-draw-a-rose`, `/blog/40-easy-things-to-draw`) |
| Drawing-ideas pillar | the drawing-ideas pillar post / landing |
| Tools | `/tools/<slug>` *(e.g. a photo-to-coloring-page tool)* |

---

## Selecting pillars

A pillar is worth writing only when:

1. The head term has meaningful search volume (≥ 500/month is a fine starting bar)
2. You have or can write ≥ 6 cluster pages under it
3. The topic is genuinely within the site's domain (drawing subjects, coloring themes, beginner technique)
4. You can credibly take an angle that beats the existing top 3

scribbloo.com's natural pillars map onto the content-plan clusters in `plan/` (`how-to-draw.md`, `coloring-collections.md`, `drawing-ideas.md`, `tools.md`):

- **PILLAR "How to Draw for Beginners"** — hubs the drawing tutorials plus the how-to/definition spokes ("how to draw a rose", "how to draw a cat easy", "what is shading in drawing", "how to blend colored pencils"). Aligns with `plan/how-to-draw.md`.
- **PILLAR "Coloring Pages"** — hubs `/coloring-pages` and every themed collection (`/coloring-pages/dinosaur`, `/coloring-pages/unicorn`, etc.) plus the tutorials that pair with them. Aligns with `plan/coloring-collections.md`.
- **PILLAR "Drawing Ideas"** — hubs the listicles ("cute things to draw", "40 easy things to draw", "drawing ideas for beginners") and links down to the individual tutorials each idea references. Aligns with `plan/drawing-ideas.md`.
- **CLUSTER "Tools"** — the conversion-focused tool landings (e.g. a photo-to-coloring-page maker) cross-linked with the collections they feed. Aligns with `plan/tools.md`.

For each candidate pillar, list 6+ candidate clusters before committing. If you can't list 6, the pillar is too narrow and should be a cluster instead. The master table in `plan/plan.md` is the source for what's planned.

---

## Mapping a cluster

For a chosen pillar, the cluster map enumerates every spoke. Example for the How-to-Draw pillar:

| Cluster slug | Target query | Type | Paired collection | Status |
|---|---|---|---|---|
| `how-to-draw-for-beginners` | "how to draw for beginners" | Pillar | (hub) | Pillar |
| `how-to-draw-a-rose` | "how to draw a rose" | Tutorial | `/coloring-pages/rose` | Published |
| `how-to-draw-a-cat-easy` | "how to draw a cat easy" | Tutorial | `/coloring-pages/cat` | Draft |
| `what-is-shading-in-drawing` | "what is shading in drawing" | Definition | — | Planned |
| `how-to-blend-colored-pencils` | "how to blend colored pencils" | Technique | — | Planned |
| `how-to-draw-a-dinosaur` | "how to draw a dinosaur" | Tutorial | `/coloring-pages/dinosaur` | Planned |

Example for the Coloring-Pages pillar:

| Cluster slug | Target query | Type | Paired tutorial | Status |
|---|---|---|---|---|
| `coloring-pages` | "coloring pages" | Pillar | (hub) | Pillar |
| `dinosaur` | "dinosaur coloring pages" | Collection | `/blog/how-to-draw-a-dinosaur` | Published |
| `unicorn` | "unicorn coloring pages" | Collection | `/blog/how-to-draw-a-unicorn` | Published |
| `rose` | "rose coloring pages" | Collection | `/blog/how-to-draw-a-rose` | Draft |
| `cute-things-to-draw` | "cute things to draw" | Listicle | links to many tutorials | Planned |

This map lives alongside the briefs in `plan/` (per-cluster: `how-to-draw.md`, `coloring-collections.md`, `drawing-ideas.md`, `tools.md`; master table: `plan/plan.md`). It is the source of truth for what clusters exist, what's planned, and which collection/tutorial each spoke pairs with. The writer reads the relevant brief when writing any post in the cluster so the inline body links and the `relatedCategories`/`relatedPages` arrays resolve to the right slugs and routes.

---

## Internal-link discipline

Every post links **up**, **across**, and (for pillars) **down** — via inline body links plus the related arrays.

### Cluster post internal-link rules

- **1 link up to the pillar** — in the introduction or first major section. Anchor text = the pillar's exact target query. ("…this is one piece of our bigger [how to draw for beginners](/blog/how-to-draw-for-beginners) guide…")
- **1 link to the paired coloring collection** — every tutorial links its matching collection, placed where the reader would naturally want to color the thing they just learned to draw. This is non-negotiable, and the collection slug also goes in `relatedCategories`. ("…want to color it instead? Grab the free [rose coloring pages](/coloring-pages/rose).")
- **≥ 3 links across to sibling posts** — placed where the sibling topic genuinely relates. Add those slugs to `relatedPages`. Never dump sibling links as a list in the conclusion.
- **0-2 links to posts outside the cluster**, only when relevant.

Total internal-link minimum per post: pillar (1, where one exists) + paired collection (1) + ≥ 3 siblings — landing around the 3–6 internal links the writing guide calls for. Keep links contextual so they read as editorial, not stuffed.

### Pillar internal-link rules

- **Link down to every cluster post** in the relevant "where to start" or "popular guides" section.
- **Link to each coloring collection the pillar hubs.**
- **Group cluster links by sub-topic** when there are > 8 clusters (animals, flowers, food, characters…).
- **No "see also" appendix** — surface links in the body where they're relevant.

### Anchor text rules

The anchor text on an internal link is the single most powerful internal-SEO signal Google has. Rules:

- Anchor text = the linked page's target query, or very close
- Anchor reads naturally and warmly in the surrounding sentence
- Never "click here," "this article," "learn more"
- Never the exact same anchor text linking to the same page twice on one page

Example body sentence from a tutorial:

> "If you're brand new, start with our [how to draw for beginners](/blog/how-to-draw-for-beginners) guide; for another easy animal try [how to draw a cat easy](/blog/how-to-draw-a-cat-easy), and when you're done, color one in with the free [rose coloring pages](/coloring-pages/rose)."

The anchors are the target queries of the linked pages — natural English that doubles as the SEO signal.

---

## Hub-and-spoke math: what good looks like

For a healthy pillar:

- 1 pillar post (2,500-5,000 words)
- 8-15 cluster pages (tutorials ~900–1,300 words; listicles 1,200–1,800 words; collections carry their copy in `seoDetails`)
- Every cluster links up to the pillar (so the pillar gets 8-15 inbound internal links)
- Each cluster links to ≥ 3 siblings (so each cluster accrues many inbound links from siblings)
- The pillar links down to every cluster (so each cluster gets 1 link from the pillar)
- Every tutorial links its paired coloring collection, and the collection links back

Net per cluster: a handful of outbound contextual links, many inbound from siblings + pillar + its paired collection. This density is what Google reads as "this page is a recognized part of a topic the site covers seriously."

---

## When to write a new cluster vs expand an existing post

A common mistake: writing 20 short posts on adjacent sub-questions when one comprehensive post would serve users better and rank harder. (Synonym intents like "dino / dinosaur / dinosaurs" should be **one** canonical page targeting the variants on-page, not separate posts — see `plan/url-structure-guide.md`.)

### Write a NEW cluster when:
- The query has a meaningfully different intent (tutorial vs listicle vs definition)
- The query targets a different long-tail subject
- Combining would push the post past ~2,500 words and dilute focus
- The existing post is already optimized and ranking well — don't disturb it

### EXPAND an existing post when:
- The new question shares the existing post's intent
- The existing post is short (< 1,500 words) and would benefit from depth
- The new question is a natural sub-section of the existing post
- The existing post isn't ranking well yet — expansion is cheaper than a new post

When expanding, the workflow is:

1. Open the existing MDX at `content/blog/<slug>.mdx`
2. Add the new H2 + content
3. Note the update in the body if it corrects a previous claim. (There is **no `dateModified` frontmatter field** — track the change via git history; `publishedAt` is the only date the schema carries.)
4. Add any new source citations inline where a factual claim is made (art history, materials behavior)
5. Add any new sibling/collection slugs to `relatedPages` / `relatedCategories`
6. Re-verify any technique or terminology claim per `accuracy-and-trust-skill.md`
7. Re-audit the expanded post

---

## Topical map maintenance

The cluster briefs in `plan/` (and the master `plan/plan.md`) are updated:

- When a new post in the cluster is planned
- When a post is published (status → Done)
- When a post is retired (status → Archived)
- When a post is consolidated into another (status → Merged into <slug>)

The writer reads these to know which siblings and which paired collection/tutorial to link to when writing a new post. Keeping them current is what makes the inline internal linking and the related arrays reliable.

---

## When the cluster is multi-pillar

Some topics genuinely sit between two pillars — e.g. "how to draw a dinosaur" belongs to the broader How-to-Draw pillar but also feeds the Coloring-Pages pillar through its paired dinosaur collection. The post links up to both, with anchor text that differentiates which aspect goes where:

> "New to sketching? Start with [how to draw for beginners](/blog/how-to-draw-for-beginners). Already comfortable and just want to color? Jump to the [dinosaur coloring pages](/coloring-pages/dinosaur)."

Multi-pillar links are the exception. If half a cluster's posts link to two pillars, the pillars probably need consolidating or the cluster splitting.

---

## The semantic neighborhood

Beyond explicit linking, posts in a cluster share *semantic* signals — the same subjects, questions, materials vocabulary, and sources. Google's modern understanding picks up on this.

To strengthen it:

- Reuse the same canonical technique descriptions and terminology across cluster posts (the same way you describe starting from basic shapes, the same names for shading techniques, the same materials terms — see `materials-and-terminology-skill.md`)
- Use consistent terminology and consistent advice — don't say roses start with a spiral in one post and "just sketch the petals" in another; pick the method and reuse it
- Cross-reference the same verified techniques and worked examples across posts where they genuinely apply

This makes the cluster read as one warm, coherent voice across the set (Scribbloo's Storybook-Retro voice), not a content farm's scattered coverage.

---

## What kills topical authority

- **Orphan posts** — posts with zero inbound internal links and empty related arrays. They signal the site doesn't recognize the post as part of any topic.
- **Tag-only architecture** — relying on `tags` for navigation instead of explicit body links + related arrays. Tags are weak signals.
- **Duplicate-intent posts** — two posts targeting the same query (or unmerged synonym variants). Pick one canonical page, redirect the rest.
- **Pillar without clusters** — a 5,000-word pillar with no supporting spokes reads as a one-off, not a hub.
- **Clusters without a pillar** — 10 related posts with no central pillar to anchor them.
- **Tutorial with no collection (or collection with no tutorial)** — every tutorial must link its paired coloring collection and vice-versa. A broken pairing is an orphan in disguise.

---

## Pre-publish topical authority checklist

- [ ] Post's cluster and paired collection/tutorial are identified in the relevant `plan/` brief
- [ ] Inline body link UP to the pillar present (for clusters)
- [ ] Inline body link to the paired coloring collection present (and the collection links back); slug in `relatedCategories`
- [ ] ≥ 3 inline body links across to sibling posts (for clusters); slugs in `relatedPages`
- [ ] Anchor text = the target query of each linked page
- [ ] No "click here" / "learn more" anchors
- [ ] Contextual internal links kept to a readable density (~3-6)
- [ ] All links use real routes (`/blog/<slug>` for posts, `/coloring-pages/<slug>` for collections)
- [ ] `relatedCategories` / `relatedPages` arrays populated to match the inline links
- [ ] Cluster brief status updated to Done when the post ships

---

**BlogOS** — sites that rank cover topics, not pages.
