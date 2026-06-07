# URL Structure Guide

**Status:** Plan / not yet implemented. This is the canonical reference for how URLs are
designed as Scribbloo scales from ~50 pages to 1,000+. Read this before adding routes,
content types, or collections.

**Context for the redesign:** Nothing in `/coloring-pages/*` ranks yet, so we are free to
change the shape now with no SEO cost. We will not carry a backward-compatible dual system —
see [Legacy pages](#9-legacy-pages-current-21).

---

## 1. Principles

1. **Depth is data, not route files.** The category hierarchy lives in the **content folder tree**
   (`content/coloring-pages/<a>/<b>/…`), which mirrors the URL 1:1, not in nested `[a]/[b]/[c]`
   route folders. One catch-all route maps URL path → file path. Adding a subcategory is a content
   folder edit, never a routing change. *(IMPLEMENTED — folder-driven; see `lib/content/collections.ts`.)*
2. **One canonical URL per thing.** Every leaf page resolves to exactly one path. No page is
   reachable at two indexable URLs. This is the rule that keeps us out of duplicate-content
   and cannibalization trouble.
3. **Consolidate keyword synonyms, don't multiply pages.** Near-duplicate intent
   (dino / dinosaur / dinosaurs) = **one** page + 301 redirects from the variants. We already
   proved this on the blog (see [§5](#5-collections-the-synonym-problem)).
4. **Subject = tree; audience/style = facet.** Taxonomic subjects nest in the path. Cross-cutting
   cuts (adult, kids, cute, easy) are tag-driven listing pages, not tree nodes.
5. **The breadcrumb is the URL.** Path segments map 1:1 to the breadcrumb trail and to
   `BreadcrumbList` JSON-LD. If a path can't produce a clean breadcrumb, the path is wrong.

Reference for the target shape: large coloring sites use variable-depth, category-in-path URLs,
e.g. `coloringonline.com/coloring-page/fantasy/unicorns/unicorn-08` (theme → subject → item) and
`…/coloring-page/alphabet/letter-a` (theme → item). We match that pattern.

---

## 2. Top-level URL namespaces

The content plan (235 pages) has four content types (~120 collections + 13 facets · 80 tutorials · 20 listicles · 3 tools; see generated [`collections-map.md`](collections-map.md)).
Each gets its own top-level namespace:

| Namespace | Content type | Example URL |
|---|---|---|
| `/coloring-pages/…` | 📂 collections + 🖼️ printable leaf pages | `/coloring-pages/animals/dinosaurs/t-rex-01` |
| `/how-to-draw/[subject]` | ✏️ tutorials | `/how-to-draw/rose` |
| `/drawing-ideas/[slug]` | 📝 listicles ("things to draw") | `/drawing-ideas/cool` |
| `/tools/[tool]` | 🛠️ interactive tools | `/tools/coloring-book-maker` |
| `/blog/[slug]` | editorial posts (existing) | `/blog/how-to-blend-colored-pencils` |
| `/` , `/privacy-policy`, `/terms-of-service` | static | — |

Keep types in separate namespaces so each can have its own template, sitemap priority, and
internal-linking strategy without colliding.

---

## 3. The `/coloring-pages` tree (the core)

This is where scale lives. It is a **variable-depth tree** with a listing page at every node and
a printable detail page at every leaf.

```
/coloring-pages                                  → root hub (all themes)
/coloring-pages/animals                          → theme listing
/coloring-pages/animals/dinosaurs                → subject listing
/coloring-pages/animals/dinosaurs/t-rex-01       → leaf (printable page)
/coloring-pages/holidays/christmas               → subject listing (2 deep)
/coloring-pages/holidays/christmas/santa-sleigh  → leaf
```

- **Listing nodes** render a grid of child collections and/or leaf pages + the SEO copy block
  (the `seoDetails` we already author per category).
- **Leaf nodes** render the image, download/print, related pages, and `ImageObject` JSON-LD.
- **Depth is unbounded** but keep it ≤ 3 category levels in practice (theme → subject →
  sub-subject). Most collections are 2 deep.

### Slug scoping
A leaf slug only needs to be unique **within its parent**. The **full path is the unique key**.
So `animals/dinosaurs/t-rex-01` and `characters/mascots/t-rex-01` could coexist — but prefer
globally meaningful slugs anyway.

### Canonical path
Each leaf has exactly one canonical path = its ancestor chain + its slug. A leaf belongs to **one**
subject (its tree home). It can still be *surfaced* in many facet/tag listings (§6) without
creating a second URL.

> Replaces the old model where a page's canonical was "first item in the `categories` array."
> Canonical is now an explicit, stable tree position — never order-dependent.

---

## 4. Routing implementation

One catch-all route under the namespace:

```
app/coloring-pages/[[...path]]/page.tsx
```

The content folder tree mirrors the URL, so the index is built by **walking the folders** once per
process (memoized) — `_category.mdx` = a listing node, any other `*.mdx` = a leaf. Resolution
algorithm (`path` = array of segments):

1. `path` empty → render root hub (top-level folders + facets).
2. `content/coloring-pages/<path>/_category.mdx` exists → render listing (children folders + leaves).
3. `<path>` ends in `page/N` and the base is a listing → render that page (`page/1` → 308 to bare).
4. `content/coloring-pages/<path>.mdx` exists → render leaf detail.
5. last segment is a known unique leaf slug at a different path (legacy/secondary) → 308 to canonical.
6. `<path>` matches a collection/facet **alias** → 308 to canonical.
7. Else `notFound()`.

`generateStaticParams()` walks the tree: every folder path + every leaf path + extra `page/N`. All
static (`force-static`). Build cost is linear in (folders + leaves). Ancestry/breadcrumbs come free
from the path — no `parent` field, and leaf slugs only need to be unique **within their folder**.

**Pagination** for large listings is path-based, not query-string:
`/coloring-pages/animals/dinosaur/page/2`. (`?page=` is weaker for crawl/canonical.) `PAGE_SIZE`=48
(one constant in `collections.ts`); page 1 is the bare URL and `/page/1` 308s to it. It's a pure
render-time slice of the leaves in the folder — no page files. **Page ≥2 is `noindex, follow`** and
self-canonical (thin pages stay out of the index; leaves still get crawled). *(IMPLEMENTED.)*

**Validation gate** (`scripts/validate-content.ts`, wired as `prebuild`): the build FAILS on invalid
frontmatter, a folder with leaves but no `_category.mdx`, a file/folder name collision, a missing
image folder, or a facet with no `facetTag`. *(IMPLEMENTED.)*

---

## 5. Collections: the synonym problem

The plan lists many near-duplicate collections targeting keyword variants:
`dino` / `dinosaur` / `dinosaurs`, `summer` / `summertime`, `winter` / `wintertime`,
`auto` / `automotive` / `automobile`, `spider` / `spider-man`, `kitty` / `kitten`.

**These must NOT become separate indexable pages.** That is exactly what cannibalized the blog
pillar and produced "Crawled – currently not indexed" in Search Console — already fixed in
`next.config.js` by 301-ing the variants into one canonical post.

**Rule (DECIDED):** build **one** canonical collection per intent. **Do not create the variant
pages at all** — one page ranks for all the synonyms because Google reads them as the same intent.
Splitting them splits link equity and cannibalizes (exactly what flagged the blog pillar).

```yaml
# content/collections/dinosaurs.mdx
slug: dinosaurs                 # cleanest noun + highest volume wins the slug
parent: animals
aliases: [dino, dinosaur]      # OPTIONAL insurance: 308 if ever hit (old link / typo / future rename)
```

How to capture the variant keywords: weave `dino` / `dinosaur` / `dinosaurs` into the **title, H2s,
and body** of the single page — not into separate URLs.

Aliases are not required (nothing links to the variants yet), but cost nothing as data and prevent
future 404s. Redirects become load-bearing only for the **legacy 21 pages** (§9) and renames.

> **Reconcile `plan/plan.md`:** its synonym rows (dino/dinosaur/dinosaurs, summer/summertime,
> auto/automotive/automobile, etc.) must be demoted from separate pages to "keyword targets covered
> on the canonical page." Pick the canonical per group by highest volume in the plan.

---

## 6. Subject tree vs. facet collections

Not every collection is a subject. Two distinct kinds:

**Top-level themes (DECIDED — Standard 8):** every subject nests under one of:
`animals` · `characters` · `holidays` · `fantasy` · `nature` · `vehicles` · `education` · `patterns`.
These are the `parent` roots for the ~126 collections.

**Subject collections (taxonomy)** — *what is drawn.* Nest in the path. A leaf has one.
`animals/dinosaurs`, `fantasy/unicorns`, `holidays/christmas`, `vehicles/cars`, `nature/flowers`,
`characters/pokemon`.

**Facet collections (cross-cut)** — *who/how/what style.* Span the whole library.
`adult`, `for-kids`, `cute`, `easy`, `hard`, `mandala`, seasonal cuts.

Facets are **tag queries**, not tree parents. A facet listing aggregates every leaf carrying the
tag, wherever it lives in the subject tree. The facet page is canonical to itself; each listed leaf
stays canonical to its subject path. No duplicate leaf URLs.

```
/coloring-pages/for-adults     → lists all leaves tagged `audience:adult`
/coloring-pages/cute           → lists all leaves tagged `style:cute`
```

This is how we satisfy high-volume audience keywords ("adult coloring pages", "coloring pages for
kids", "cute coloring pages") without forcing every printable into an artificial single bucket.

---

## 7. Data model (folder-driven — IMPLEMENTED)

The folder **path** carries the hierarchy, so there is no `parent`/`subject`/`categories` field.
A collection's metadata lives in `_category.mdx` inside its folder; a leaf is any other `*.mdx`.

```
content/coloring-pages/
  animals/
    _category.mdx              → /coloring-pages/animals (listing)
    baby-elephant.mdx          → /coloring-pages/animals/baby-elephant (leaf)
    dinosaur/
      _category.mdx            → /coloring-pages/animals/dinosaur
      t-rex.mdx                → /coloring-pages/animals/dinosaur/t-rex
content/facets/
  for-kids.mdx                 → /coloring-pages/for-kids (tag-driven, flat)
```

```yaml
# content/coloring-pages/animals/dinosaur/_category.mdx
slug: dinosaur                 # for metadata; the FOLDER defines the path
name: Dinosaur
aliases: [dino, dinosaurs]     # 308 to this folder's canonical path
order: 12
# existing: seoTitle, seoMetaDescription, heroImage, thumbnailImage, seoDetails…
```

```yaml
# content/coloring-pages/animals/dinosaur/t-rex.mdx  (filename = URL slug)
slug: t-rex
title: T-Rex
image: t-rex
tags: [kids, dinosaur]         # drives facet listings + related; NO subject/categories needed
# existing: description, createdAt, source, …
```

```yaml
# content/facets/for-kids.mdx
slug: for-kids
name: For Kids
facetTag: kids                 # aggregates every leaf whose tags include this
```

> Migration from the old flat-file + `parent` model was a one-shot script
> (`scripts/migrate-to-folders.mjs`). Re-homing a page now = moving its file (git-tracked).

`subject` → canonical path (resolved through the collection `parent` chain). `tags` → facet pages,
related links, and internal linking. Order no longer affects URLs.

---

## 8. SEO mechanics

- **Canonical tag:** every page emits `<link rel=canonical>` to its one path. Facet/paginated
  listings self-canonicalize; leaves canonical to their subject path.
- **Breadcrumb JSON-LD:** generated from the path/ancestor chain on every node and leaf.
- **Sitemap (`app/sitemap.ts`):** emit each node path, each leaf path (canonical only), facet pages,
  and the other namespaces. Never emit alias paths (they 301).
- **Redirects:** all aliases + any legacy paths go through `next.config.js redirects()` (308) or the
  catch-all step 4. This layer is now load-bearing — keep it in sync with the alias data.
- **Pagination:** `rel=canonical` on `page/N` points to itself; ensure unique `<title>` per page.

---

## 9. Legacy pages (current 21)

Nothing ranks, so **do not build a compatibility layer.** Approach:

1. Re-slot the existing 21 leaves into the new tree by assigning each a `subject`.
2. 308-redirect each old `/coloring-pages/[categorySlug]/[pageSlug]` path to its new canonical path
   via `next.config.js redirects()` (one-time list, same shape as the blog block).
3. Anything that doesn't fit a real subject yet → park under a generic subject (e.g.
   `animals` / `misc`) without breadcrumbs polish; clean up later. Not a blocker for scaling.

No dual rendering, no "old vs new" branching in the route.

---

## 10. Open decisions

- [x] **Synonym collapse** — DONE in the generator (`build_plan.py` `SYNONYM`/`AUDIENCE` maps); folded variants show as "also targets". One canonical page per intent. (§5)
- [x] **Theme set** — DECIDED: Standard 8 (animals, characters, holidays, fantasy, nature, vehicles, education, patterns). (§6)
- [x] **Map all collections to theme + subject** — DONE: `build_plan.py` `THEME` map emits the path for all 120 collections + 13 facets into the generated [`collections-map.md`](collections-map.md). (§6)
- [ ] **Theme gaps** — `collections-map.md` "Review" flags **food** (food/ice-cream/strawberry/apple), **sports** (football), **religion** (jesus/bible), and loose subjects (ballerina, house). Promote to themes (→ Standard 10/11) or fold/drop.
- [ ] **Facet namespace** — facets at `/coloring-pages/<facet>` (flat) vs `/coloring-pages/collections/<facet>`? (Flat recommended for keyword match — currently flat.)
- [ ] **Tutorials/listicles depth** — flat (`/how-to-draw/rose`) confirmed, or grouped (`/how-to-draw/flowers/rose`)?
- [ ] **Config cleanup** — three configs exist (`next.config.js` active, `.mjs`/`.ts` stale). Delete the stale two.

---

## 11. Implementation status — DONE (folder model)

All shipped:
1. ✅ Content is the **folder tree** (`content/coloring-pages/<path>/_category.mdx` + leaves; facets in `content/facets/`). Migrated from the old flat `content/categories/` + `categories[]`.
2. ✅ Folder-walking loader + resolver in `lib/content/collections.ts`.
3. ✅ Catch-all `app/coloring-pages/[[...path]]/page.tsx` (listing / leaf / 308 / 404).
4. ✅ Alias + legacy 308s in `next.config.js redirects()` (generated from `_category.mdx` aliases) + in-route.
5. ✅ `app/sitemap.ts` derived from the tree + facets + namespaces (no paginated/alias/noindex URLs).
6. ✅ Path-based pagination (`/…/page/N`, `PAGE_SIZE`=48, page ≥2 `noindex,follow`) + breadcrumb JSON-LD.
7. ✅ `/how-to-draw`, `/drawing-ideas`, `/tools` namespaces (rich MDX via `DocArticle`).
8. ✅ Validation gate (`scripts/validate-content.ts`, `prebuild`) + content writers refuse old-model output.

Remaining open: [§10](#10-open-decisions) theme gaps; ISR vs force-static threshold; sitemap split at 50k.
