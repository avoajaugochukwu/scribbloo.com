---
name: seo-and-schema
description: On-page SEO and Schema.org JSON-LD discipline for scribbloo.com's drawing tutorials, listicles, and coloring content. Covers the four on-page artifacts, URL slug rules, the canonical tag, and the JSON-LD the blog route auto-emits (BlogPosting only) — plus paste-ready optional schemas (FAQPage, HowTo, ItemList, DefinedTerm, CollectionPage) and exactly how you'd wire them in page.tsx. This is the file that turns a well-written post into a snippet-eligible, indexable, internal-link-discoverable web page.
---

# SEO & Schema — the page Google can rank

> A post can be perfectly written and never rank if Google can't parse it, can't crawl it, or can't trust it. This skill is the layer between the prose and the search index. On scribbloo.com the heavy lifting is automatic: the blog route reads frontmatter and emits metadata + JSON-LD for you. Your job is to feed it clean inputs.

---

## What the page actually emits (read this first)

Posts render through **MDX** — `content/blog/<slug>.mdx`, parsed by `lib/content/blog.ts` (+ `lib/content/types.ts` validation) and rendered by `next-mdx-remote/rsc` `<MDXRemote>` through a fixed component map (`components/mdx/MdxComponents.tsx`) in `app/blog/[slug]/page.tsx`. There are **no custom JSX components** in that map (no `<AnswerBox>`, `<Callout>`, etc.) and **no `schema` frontmatter field.** You do not hand-author JSON-LD. The route generates everything below from the frontmatter and the rendered content.

Auto-emitted, per post, with zero extra work:

- **`metadata.title`** = `post.title`
- **`metadata.description`** = `post.metaDescription`
- **`metadata.alternates.canonical`** = `${baseUrl}/blog/${slug}` (canonical is automatic — you never set it by hand)
- **OpenGraph** (`type: article`, `siteName: "Scribbloo"`, `url`, `publishedTime`, `authors`, and an `images` entry built from `featuredImage`)
- **Twitter** (`summary_large_image`, title, description, image from `featuredImage`)
- **JSON-LD `BlogPosting`** (headline, description, image, datePublished, author Person, publisher Organization "Scribbloo")

The `/coloring-pages` category landings are a **separate route** with their own copy and their own metadata — they're not blog posts and aren't covered by this file beyond cross-linking. (Their copy lives in frontmatter `seoDetails`, not a Markdown body.)

**Not emitted today:** BreadcrumbList, FAQPage, HowTo, ItemList, DefinedTerm, CollectionPage. Treat those as optional future enhancements — see the bottom of this file for how you'd add them. Do **not** assume a breadcrumb rich result ships automatically; it doesn't.

---

## The four artifacts every page has

A blog post is not one artifact. It is four. On this site two of them are **the same frontmatter field reused** (the `title` is both the H1 and the meta title), one is its own field (`metaDescription`), and the canonical is automatic — so the discipline is mostly about not wasting the description and getting the slug right.

| Artifact | Lives in | Max length | Purpose |
|---|---|---|---|
| **H1** | Frontmatter `title:`, rendered as the page `<h1>` | ≤ 60 chars | The heading the human sees on the page |
| **Meta title** | Same `title:` field → `metadata.title` → `<title>` and SERP | ≤ 60 chars | What Google shows in search results |
| **Meta description** | Frontmatter `metaDescription:` → `metadata.description` | 150–160 chars | What Google shows under the title in the SERP |
| **URL slug** | Frontmatter `slug:` + the filename `content/blog/<slug>.mdx` → path `/blog/<slug>` | ≤ 60 chars | Permanent, indexable URL |

**Key consequence of this site's setup:** `title` does double duty as both H1 and meta title, so write a `title` that works in both the SERP and on the page (≤ 60 chars is the binding constraint). The meta description is its **own** `metaDescription` field — distinct from `excerpt`, which is the on-page hook/dek under the headline. There is **no separate `metaTitle` field** — don't invent one; `lib/content/types.ts` ignores unknown keys. So: `title` for the SERP title + H1, `metaDescription` for the SERP snippet, `excerpt` for the on-page hook.

There is **no `# H1` in the body** — the H1 comes from `title`. Start your body with content (often a featured/inline image, then the answer blockquote — see `featured-snippet-skill.md`).

See `title-meta-slug-skill.md` for the full title/metaDescription/excerpt/slug rules. This skill assumes those are set and focuses on schema.

---

## URL slug discipline

The slug is permanent — it's both the frontmatter `slug:` and the `.mdx` filename, and it becomes `/blog/<slug>`. Changing it later breaks every inbound link and shuffles your SEO equity. Get it right the first time.

### Rules

- **Kebab-case.** `how-to-draw-a-rose` not `How_To_Draw` or `howToDraw`.
- **Front-load the keyword.** `how-to-draw-a-rose` beats `the-easy-way-to-sketch-a-rose`.
- **Drop stop words unless load-bearing.** `cute-things-to-draw` beats `some-of-the-cutest-things-that-you-can-draw`.
- **No dates in the slug.** `2026-cute-things-to-draw` ages out and forces a yearly redirect. There is no modified-date frontmatter field — track freshness with git / `publishedAt`, not a slug year.
- **No numbers in the slug unless they're the point.** `40-easy-things-to-draw` is fine only if `40` is genuinely the count. If you later change it to 50, the slug lies.
- **No filler.** No "the", "a", "an" unless the title doesn't parse without it.
- **No trailing words.** Don't end with `-guide`, `-article`, or `-post`. Self-referential filler.
- **No special characters.** Hyphens only. No underscores, no en-dashes, no emoji.
- **Match the target query.** If the target query is "how to draw a cat easy", the slug is `how-to-draw-a-cat-easy`, not `drawing-cats-made-simple-for-everyone`.

### Slug examples

| Target query | Good slug | Bad slug |
|---|---|---|
| "how to draw a rose" | `how-to-draw-a-rose` | `the-complete-guide-to-drawing-beautiful-roses` |
| "how to draw a cat easy" | `how-to-draw-a-cat-easy` | `everything-you-need-to-know-about-drawing-cats-2026` |
| "cute things to draw" | `cute-things-to-draw` | `adorable-drawing-ideas-that-anyone-can-do` |
| "easy things to draw for beginners" | `easy-things-to-draw-for-beginners` | `beginner-drawing-tips-and-tricks-finally-made-simple` |
| "how to blend colored pencils" | `how-to-blend-colored-pencils` | `colored-pencil-blending-explained-the-easy-way` |

---

## Meta title rules (the `title` field)

`title` is both your H1 and your `<title>`/SERP title, so it has to earn its place in search results while still reading well as a page heading.

- ≤ 60 chars (Google truncates at ~580 pixels, ~60 chars in most fonts)
- Target query front-loaded
- A modifier that signals depth or freshness: `Step by Step`, `Easy`, `For Beginners`, `(Free Printables)`, `+ Tips`
- Title case
- No clickbait the post can't deliver
- No brand suffix needed — OpenGraph already carries `siteName: "Scribbloo"`, and a `| Scribbloo` suffix eats your 60-char budget. Skip it.

Examples:

- `How to Draw a Rose (Easy Step by Step)`
- `How to Draw a Cat Easy: Beginner Guide`
- `40 Cute Things to Draw When You're Bored`

---

## Meta description rules (the `metaDescription` field)

`metaDescription` becomes the `<meta name="description">`. It doesn't directly influence ranking — but it drives click-through, which does. (The visible hook/dek under the headline is the separate `excerpt` field; keep them distinct so the page doesn't read the same line twice.)

- **150–160 chars** (the sweet spot — shorter wastes the SERP real estate, longer gets truncated)
- Active verb in the first half
- Target query somewhere in it
- Ends on an implicit "what they'll get if they click"
- Never starts with "In this article, we will…"
- Never duplicates the `title` verbatim — they sit one above the other in the SERP

Example for "how to draw a rose":

> "Learn how to draw a rose step by step, starting from simple shapes. A beginner-friendly guide with easy strokes, shading tips, and a free rose coloring page to color in."

In the 150–160 band, leads with the action, names the steps, ends on a value promise.

---

## Canonical tag — automatic

You do **not** set the canonical. `generateMetadata` in `app/blog/[slug]/page.tsx` sets `alternates.canonical` to `${baseUrl}/blog/${slug}` for every post. The host is **scribbloo.com**, so a post at `content/blog/how-to-draw-a-rose.mdx` canonicalizes to:

```
https://scribbloo.com/blog/how-to-draw-a-rose
```

There is no frontmatter `canonical` field and no need for one. If you ever syndicate a post elsewhere, the canonical already points at your version — nothing to configure.

---

## The auto-emitted JSON-LD

This block ships on every post automatically. You don't author it; you feed the frontmatter that fills it. It's reproduced here so you know what Google sees and can sanity-check it in Search Console / the Rich Results Test.

### BlogPosting (every post)

Built in `app/blog/[slug]/page.tsx` from the post object. Shape (host `scribbloo.com`):

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "<post.title>",
  "description": "<post.metaDescription>",
  "datePublished": "<publishedAt, ISO>",
  "url": "https://scribbloo.com/blog/<slug>",
  "author": { "@type": "Person", "name": "<author or 'Scribbloo'>" },
  "publisher": {
    "@type": "Organization",
    "name": "Scribbloo",
    "url": "https://scribbloo.com",
    "logo": { "@type": "ImageObject", "url": "https://scribbloo.com/logo.png" }
  },
  "image": { "@type": "ImageObject", "url": "<featuredImage, absolutized>" }
}
```

What this means for your frontmatter:

- `datePublished` comes from **`publishedAt`** (ISO datetime string). There is **no `dateModified` field** in the schema — you can't stamp a modified date in frontmatter. Track real content updates via git history / `publishedAt`; do not add a phantom `dateModified` field expecting it to render.
- `description` comes from **`metaDescription`** — set it (150–160 chars). If unset, the snippet falls back to whatever the route defaults to, which is rarely what you want.
- `image` is only present if `featuredImage` is set, and the relative `featured.webp` is auto-prefixed with the host + the post's image path. Set `featuredImage` to get the rich-result image.
- `author` renders as a Person; when `author` is `null` the byline and schema fall back to **"Scribbloo"** (the brand). The brand byline is the default — only set a person if there genuinely is a named author.

### BreadcrumbList — NOT emitted

The route does **not** emit a `BreadcrumbList` today. Breadcrumbs are one of the most underrated rich results (they render under the title in the SERP and lift CTR), so they're a strong future add — see the OPTIONAL section. But until that's wired, do not claim or assume breadcrumb structured data ships. It doesn't.

---

## OPTIONAL schemas — not currently wired

The following schema types are **not emitted today**. They are real opportunities, but adding any of them means editing `app/blog/[slug]/page.tsx` (and usually adding a frontmatter field that `lib/content/types.ts` validates). Do **not** put a `schema:`, `faqs:`, or `howToSteps:` block in frontmatter expecting it to render — `lib/content/types.ts` validates a fixed set of fields (`slug, title, excerpt, metaDescription, author, tags, featuredImage, publishedAt, status, relatedCategories, relatedPages`) and ignores the rest.

For each, here's the target shape and the wiring sketch.

### BreadcrumbList (cheapest high-value add)

Home → Blog → this post. Pure derived data — no new frontmatter needed.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://scribbloo.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://scribbloo.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "<post.title>", "item": "https://scribbloo.com/blog/<slug>" }
  ]
}
```

How you'd wire it: emit a second `<script type="application/ld+json">` in `page.tsx` built from the slug + title. No frontmatter change required, which is what makes it the cheapest win.

### FAQPage (highest-value content add)

Best paired with a body `## Frequently asked questions` section (plain `###` question + answer paragraph — see `featured-snippet-skill.md`). To emit it, the answer text in the JSON-LD must match the visible answer word-for-word.

Target shape:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "<question, exact visible text>",
      "acceptedAnswer": { "@type": "Answer", "text": "<answer, plain text, 40-60 words>" }
    }
  ]
}
```

How you'd wire it: add a `faqs:` array to the validated frontmatter schema (`{ question, answer }[]`), have `lib/content/blog.ts` parse it onto the post object, render a visible FAQ section through the MDX component map, and emit a JSON-LD script built from the same array so visible and structured stay in sync. Because the component map adds **no auto heading IDs**, don't point any schema `url`/anchor at `#frequently-asked-questions` — those fragments won't resolve.

### HowTo (drawing tutorials)

For "how to draw X" posts with discrete steps.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "<post.title>",
  "description": "<post.metaDescription>",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "<Step 1 name>", "text": "<Step 1 text>" },
    { "@type": "HowToStep", "position": 2, "name": "<Step 2 name>", "text": "<Step 2 text>" }
  ]
}
```

How you'd wire it: add a `howToSteps:` frontmatter array, validate it in `lib/content/types.ts`, emit another JSON-LD script. **Omit per-step `url` anchors** — there are no auto heading IDs to point them at. If you want step-level deep links later, you'd first add a slugifying rehype/remark step to generate IDs.

### ItemList (listicle posts)

For "40 easy things to draw" or "cute drawing ideas" listicles where you want a list rich result.

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "numberOfItems": "<N>",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "<Item 1 label>" },
    { "@type": "ListItem", "position": 2, "name": "<Item 2 label>" }
  ]
}
```

Same wiring pattern: a validated `listItems:` frontmatter array + a JSON-LD script in `page.tsx`.

### DefinedTerm (definition explainers)

For single-concept posts like "What is shading?" or "What is the difference between hue and value?".

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "<term>",
  "description": "<the 40-60 word definition>",
  "inDefinedTermSet": { "@type": "DefinedTermSet", "name": "Scribbloo Drawing Glossary" }
}
```

Wiring: a `definedTerm:` frontmatter object, validated and emitted alongside the BlogPosting.

### CollectionPage (per-post topic hub)

If you build a pillar post that hubs a cluster (see `topical-authority-skill.md`), you might emit a per-post `CollectionPage` listing the linked coloring collections and spoke posts via `hasPart`. This would need the same kind of frontmatter + `page.tsx` addition.

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "<Hub name>",
  "description": "<post.metaDescription>",
  "url": "https://scribbloo.com/blog/<slug>",
  "hasPart": [
    { "@type": "BlogPosting", "headline": "<spoke title>", "url": "https://scribbloo.com/blog/<spoke-slug>" }
  ]
}
```

### If you add several

Render each as its own `<script type="application/ld+json">` block (that's already how `BlogPosting` is emitted). Do not merge multiple `@type`s into one object — validators get confused. Keep `BlogPosting` always-on; layer the optional types on top per content type.

---

## Open Graph + Twitter Card — automatic

`generateMetadata` sets these from frontmatter. You don't write tags. What it produces:

- `og:type = article`, `og:site_name = Scribbloo`, `og:title = title`, `og:description = metaDescription`, `og:url = canonical`, plus `publishedTime` / `authors`
- `og:image` from `featuredImage` with `alt = title`
- `twitter:card = summary_large_image` with title, description, and the same image

**Featured image:** `featuredImage: featured.webp` (filename only), with the asset at `public/images/blog/<slug>/featured.webp`. Supply it at a 16:9 ratio (e.g. 1200 × 675) so social crops cleanly. A missing `featuredImage` means no OG image and no `image` in the BlogPosting — set it.

---

## Robots, sitemap, indexing

- `robots.ts` and `sitemap.ts` in `app/` handle site-level discoverability.
- New posts are picked up automatically — the loader reads `content/blog/` at build time and only returns posts with `status: Done`.
- **Drafts are excluded by status, not a meta tag:** any `status` other than `Done` hides the post from listings and the build, so a work-in-progress slug simply won't be linked or rendered. There is no `draft: true → <meta robots noindex>` mechanism here — keep work-in-progress at a non-`Done` status and it stays out of the index.

---

## Internal linking architecture

See `topical-authority-skill.md` for the full hub-and-spoke discipline. The SEO essentials:

- Links live **in the body** as inline markdown: `[anchor text](/coloring-pages/slug)` for coloring collections and `[anchor text](/blog/sibling-slug)` for posts. The MDX component map styles `a`, so standard markdown links work; relative paths resolve against the site root.
- The frontmatter `relatedCategories` and `relatedPages` arrays are **also** populated — they drive the route's "related" UI — but they don't replace inline body links. Do both: inline links for the topical signal, the arrays for the related-content rails.
- Every post links to its **paired coloring collection** (e.g. a "how to draw a rose" tutorial links `/coloring-pages/rose`) and to **≥ 3 sibling posts**.
- Anchor text should *be* the target query of the linked page — the strongest internal-link signal Google has. Anchor "rose coloring pages" on the link to `/coloring-pages/rose`; anchor "how to draw a cat easy" on the link to that sibling post.
- Link to the home page only via global nav, not the body.

Real routes to link to: `/coloring-pages/<slug>` (collection landings, e.g. `/coloring-pages/dinosaur`, `/coloring-pages/unicorn`, `/coloring-pages/rose`), `/blog/<slug>` (tutorials + listicles), and pillar landings like `/coloring-pages` and the drawing-ideas pillar.

---

## Common SEO mistakes the audit catches

The `google-trust-audit-skill.md` checks for these. Recap:

- A `# H1` inside the body (the H1 comes from `title` — body must not repeat it)
- Missing `metaDescription` (no meta description in the SERP)
- `metaDescription` outside the 150–160 band (too short wastes space; too long truncates)
- `title` > 60 chars (truncated SERP title)
- Slug contains stop words, dates, or special characters
- Wrong frontmatter keys: a phantom `metaTitle`/`dateModified`/`canonical`/`schema`/`faqs`/`category` field that the validator silently drops, or `heroImage` instead of `featuredImage`
- No body links to siblings or to the paired coloring collection; empty `relatedCategories`/`relatedPages`
- No outbound source citations where a factual claim is made (art history, materials behavior)
- Missing `featuredImage` (no OG image, no BlogPosting image)
- An art/technique/history/terminology claim that wasn't verified (see the trust gate in `accuracy-and-trust-skill.md`)
- A character page that implies official/licensed status (see the trademark rule in `accuracy-and-trust-skill.md`)

---

## Pre-publish SEO checklist

- [ ] `title` ≤ 60 chars, target query front-loaded (it's both H1 and SERP title)
- [ ] `metaDescription` 150–160 chars, reads as a SERP snippet, distinct from `excerpt`
- [ ] `excerpt` set as the on-page hook (distinct from `metaDescription`)
- [ ] `slug` kebab-case, no stop words, no dates, no special chars; matches the `.mdx` filename
- [ ] No `# H1` in the body — body opens with content + the answer blockquote
- [ ] Target query in: title, metaDescription, slug, first paragraph, ≥ 1 H2, featured-image alt
- [ ] Frontmatter uses the real keys: `publishedAt`, `featuredImage`, `author`, `status`, `tags`, `relatedCategories`, `relatedPages`
- [ ] `featuredImage: featured.webp` set, asset supplied at `public/images/blog/<slug>/featured.webp` (16:9)
- [ ] `author: null` for the brand byline ("Scribbloo"), or a real person if there is one
- [ ] ≥ 1 inline body link to the paired coloring collection + ≥ 3 inline body links to sibling posts; `relatedCategories`/`relatedPages` populated
- [ ] Anchor text = the target query of each linked page; no "click here"
- [ ] Outbound links to credible sources for any factual claim (art-history / technique / materials)
- [ ] Every art / technique / terminology claim verified per `accuracy-and-trust-skill.md`
- [ ] (Optional) If a FAQ section is present, plan the FAQPage wiring per the OPTIONAL section above

Canonical, OpenGraph, Twitter, and BlogPosting are emitted automatically — there's nothing to check on those beyond feeding clean frontmatter. BreadcrumbList and the other rich-result types are **not** emitted yet; don't rely on them.

---

**BlogOS** — the page Google can rank.
