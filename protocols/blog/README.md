# BlogOS — Human-Quality Drawing & Coloring Posts at Scale

A skill pack adapted from FacelessOS (YouTube scriptwriting) for writing blog posts that Google rates as helpful, original, and trustworthy — and specifically tuned for `scribbloo.com`: step-by-step drawing tutorials ("how to draw a rose"), idea listicles ("40 easy things to draw"), coloring collection landings (dinosaur, unicorn, Halloween), and conversion-focused tool pages (photo-to-coloring-page) that support the printable coloring sheets and learn-to-draw content on every page.

## How the system maps to the project

- **Content** lives at `content/blog/<slug>.mdx` — a flat directory, one `.mdx` file per post (no typed subfolders). Coloring collection landings are a *separate* route at `content/categories/<slug>.mdx`, where the copy lives in frontmatter `seoDetails` rather than a body.
- **Rendering** is a single blog route: `app/blog/[slug]/page.tsx` reads the frontmatter via `lib/content/blog.ts` (validated against `lib/content/types.ts`), renders the H1 from `title`, and runs the body through `next-mdx-remote/rsc` `<MDXRemote>` with a fixed component map in `components/mdx/MdxComponents.tsx`. It auto-emits a single `BlogPosting` JSON-LD block (headline, description, image, datePublished, author Person, publisher Organization = "Scribbloo"). No `BreadcrumbList`, no FAQ/HowTo schema (optional future).
- **Frontmatter schema** is exactly the set of fields `lib/content/types.ts` validates — see the contract below. `title` is also the meta title; `metaDescription` is a **separate** field from `excerpt`.
- **MDX, but plain Markdown elements only.** The component map styles `h1–h4, p, ul, ol, li, blockquote, hr, strong, em, code, pre, a, img` — there are **no** custom JSX components (no `AnswerBox`, `Callout`, `ProTip`, `Table`). Don't invent JSX tags. Use a top **blockquote** as the answer box (it renders as a terracotta/mustard-tinted box) and plain Markdown links for CTAs.
- **No `@tailwindcss/typography`** (every element styled in the map). **No `remark-gfm`** → GFM pipe tables aren't guaranteed to render, so prefer prose/lists in post bodies. **No math rendering** → don't write `$…$`. **No auto heading IDs.**
- **This pack** at `protocols/blog/` — the writing craft + SEO discipline + research alignment + the accuracy & trust gate that produces MDX that fits the route.

The pack does NOT define React templates. Scribbloo renders every blog post through one route. A post's "shape" is carried by the content type the writer chooses from `page-structures-skill.md` and the body skeleton it implies.

### Frontmatter contract (exactly what `lib/content/types.ts` validates)

```yaml
slug:               # kebab-case; equals filename without .mdx
title:              # also the meta title and the rendered H1
excerpt:            # short 1–2 sentence hook; nullable
metaDescription:    # 150–160 char meta description; SEPARATE from excerpt; nullable
author:             # null → renders as "Scribbloo"
tags:               # [list] 1–4 short topical tags
featuredImage:      # featured.webp (filename only) or null
publishedAt:        # ISO datetime string, e.g. '2026-06-06T00:00:00.000Z'
status:             # 'Done' = published (anything else hides it)
relatedCategories:  # [slugs] → cross-link to /coloring-pages/<slug> collections
relatedPages:       # [slugs] → cross-link to other blog posts / coloring pages
```

Do NOT use `metaTitle`, `dateModified`, `category`, `faqs`, `schema`, `archetype`, `intent`, `primaryKeyword`, `pairsWithCalculator`, `featuredSnippet`, `internalLinks`, `outboundCitations`, `readingTime`, or `canonical`. There is **no `dateModified`/`lastUpdated` field** — track updates via git or `publishedAt`. FAQs live in the body, not the frontmatter. No `# H1` in the body — the H1 comes from `title`.

## How it differs from FacelessOS

| | FacelessOS (YouTube) | BlogOS (web) |
|---|---|---|
| Output | TTS-ready prose | MDX, plain Markdown elements (`.mdx`) |
| Retention model | Watch time, rehook every 60-90s | Scroll depth, scannability every 200-300 words |
| Quality gate | YouTube monetization policy | Google HCU + E-E-A-T + spam policy + **technique that works, facts that verify** |
| Output target | Baserow row (`script` field) | MDX file in `content/blog/` |
| Per-channel personality | Voice profile per channel | Voice profile per site / per section |
| Brief origin | Operator-provided | From the `plan/` briefs + SERP research |

## Files in this pack (21 skills + README + USAGE)

| File | Purpose |
|---|---|
| `blog-os-master.md` | Core philosophy, the MDX output contract, accuracy & trust gate, anti-AI-slop checklist, mandatory re-audit |
| `page-structures-skill.md` | The Scribbloo content types (✏️ tutorial, 📝 listicle, 📂 collection, 🛠️ tool) — frontmatter shape, body skeleton, word counts |
| `materials-and-terminology-skill.md` | **Art materials, tools & vocabulary guide.** Pencil grades (HB, 2B, 6B), paper weight (lb / GSM, both shown), color terms (hue/value/saturation), mediums, and printing terms (A4 / US Letter, "fit to page", cardstock) |
| `accuracy-and-trust-skill.md` | **Hard gate.** Every technique step actually produces the drawing; every art-history/terminology/factual claim is correct and cited; no fabricated facts or fake statistics; licensed characters handled fan-style |
| `keyword-research-skill.md` | The research alignment: the project's DataForSEO + Apify pipeline (`site-infra/keyword-research/`) + the `plan/` briefs, with WebSearch SERP/PAA recon as a complement |
| `engagement-mechanics-skill.md` | Scroll-depth psychology, scannability cadence, dwell-time mechanics |
| `BLOG-INTRO-SWIPE.md` | Answer-first opening patterns by intent |
| `variety-rotation-skill.md` | Rotation system to prevent same-y posts |
| `narrative-arc-skill.md` | Arc for longform (big listicles / pillar hubs) |
| `conclusion-and-cta-skill.md` | Conclusion shapes, single-CTA discipline (to the matching coloring collection or related tutorial), FAQ block |
| `title-meta-slug-skill.md` | H1 / meta title / meta description / URL slug rules |
| `seo-and-schema-skill.md` | Schema.org JSON-LD (`BlogPosting` auto-emitted; FAQ/HowTo/breadcrumb not wired), canonical |
| `research-and-citation-skill.md` | Source rules, sourcing discipline, trademark/licensing discipline |
| `eeat-signals-skill.md` | Brand byline, verified technique, update discipline (no `dateModified` field) |
| `featured-snippet-skill.md` | 40-60 word answer paragraph, PAA capture, list snippets |
| `media-and-images-skill.md` | Step images, featured/inline image paths, alt text, retro-frame discipline |
| `scannable-formatting-skill.md` | H2/H3 cadence, paragraph length, lists vs prose |
| `topical-authority-skill.md` | Pillar-cluster architecture, internal linking, hub-and-spoke (post ⇄ collection) |
| `update-discipline-skill.md` | Update vs replace vs merge vs sunset; periodic re-check |
| `google-trust-audit-skill.md` | HCU + E-E-A-T + spam-policy pre-publish audit |
| `analytics-coaching-skill.md` | Read analytics + GSC, diagnose post problems |
| `README.md` | This file |
| `USAGE.md` | The day-to-day operator guide |

Plus two adjacent files (referenced if present):

- `protocols/site-voice-profile.md` — canonical structure for per-site / per-section voice locks, and the scribbloo "Storybook Retro" voice lock
- `plan/00-writing-guide.md` — the project's canonical voice rules, frontmatter schemas, and per-type templates

## Optional slash commands

The pack runs fine as a manual workflow. If you want command shortcuts, you can create them in `.claude/commands/` — they don't exist yet:

```
/blog                         # load pack into chat
/b-write <keyword>            # research + draft from a keyword → content/blog/<slug>.mdx
/b-review <slug-or-path>      # audit + fix an existing post
```

Each would be a plain markdown file in `.claude/commands/<name>.md` — no installation, no build step. Until then, follow the manual workflow in `USAGE.md`.

## The non-negotiable defaults

Enforced by `blog-os-master.md`, `page-structures-skill.md`, and `materials-and-terminology-skill.md`:

1. **MDX output, plain Markdown elements only.** Frontmatter first, body second, no preamble, no closer. No invented JSX components, no GFM tables in bodies, no `$…$` math.
2. **H1 in frontmatter only.** Body starts with content then a top blockquote answer box. The route renders the H1 from `title`. No `# H1` in the body; no manual heading anchors (there are no auto IDs to target).
3. **Correct materials & terminology.** Pencil grades, paper weight (lb / GSM, both shown), color theory terms, medium names, and printing terms used precisely and consistently.
4. **Accuracy & trust as a publish gate** — every technique step is walked and confirmed to actually produce the drawing; every load-bearing factual claim (art history, terminology, how a medium behaves) is correct and verifiable against a real source. No fabricated facts, no fake statistics. Licensed characters are described fan-style with a light disclaimer. A broken step or an unverifiable claim means the post does not ship.
5. **Anti-AI slop checklist.** No "let that sink in", no fake-specific numbers, no hype words without a reason.
6. **Research contract.** Start from the `plan/` briefs; use the project's DataForSEO + Apify pipeline and/or WebSearch SERP/PAA recon; verify steps and facts after drafting.
7. **Content-type skeletons** match `page-structures-skill.md` and `plan/00-writing-guide.md` §8.
8. **Variety rotation log** appended to every audit; next run avoids the same slot picks.

## Provenance

Forked from FacelessOS (extracted from 4,000+ real faceless YouTube scripts), re-tuned for blog mechanics, and originally ported through an earlier BlogOS build for a calculator site before being retargeted for scribbloo.com's coloring-pages + drawing-ideas content, MDX rendering contract, and accuracy & trust discipline.
