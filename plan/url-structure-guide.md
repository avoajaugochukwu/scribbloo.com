# URL Structure Guide

**Status:** Plan / not yet implemented. This is the canonical reference for how URLs are
designed as Scribbloo scales from ~50 pages to 1,000+. Read this before adding routes,
content types, or collections.

**Context for the redesign:** Nothing in `/coloring-pages/*` ranks yet, so we are free to
change the shape now with no SEO cost. We will not carry a backward-compatible dual system —
see [Legacy pages](#9-legacy-pages-current-21).

---

## 1. Principles

1. **Depth is data, not route files.** The category hierarchy lives in content frontmatter
   (a `parent` chain), not in nested `[a]/[b]/[c]` folders. One catch-all route resolves any
   depth. Adding a subcategory never touches routing code.
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

Resolution algorithm (`path` = array of segments):

1. `path` empty → render root hub.
2. Look up `path` in the **collection tree** → if it's a node, render listing.
3. Else treat last segment as a leaf slug whose parent path is `path[:-1]` → if found, render detail.
4. Else check the **redirect/alias map** (§5) → 301 if matched.
5. Else `notFound()`.

`generateStaticParams()` walks the tree: emit every node path + every leaf path. All static, as today
(`force-static`). Build cost is linear in (nodes + leaves), not the old category×page cross-product.

**Pagination** for large listings is path-based, not query-string:
`/coloring-pages/animals/dinosaurs/page/2`. (`?page=` is weaker for crawl/canonical.) Paginate any
listing above ~48 items; `page/1` 301s to the bare listing.

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

## 7. Data model changes

### Collections — `content/collections/*.mdx`
(Rename/migrate from `content/categories/`. Add:)

```yaml
slug: dinosaurs
name: Dinosaurs
kind: subject            # subject | facet
parent: animals          # subject only; omit/null = top-level theme
aliases: [dino, dinosaur]
order: 12
# existing: seoTitle, seoDescription, heroImage, thumbnailImage, seoDetails…
```

### Leaf pages — `content/coloring-pages/*.mdx`
Replace the `categories: []` array (whose order silently drove the canonical) with:

```yaml
slug: t-rex-01
subject: dinosaurs       # the ONE canonical tree home (was: categories[0])
tags:                    # drives facet listings + related
  - audience:kids
  - style:cute
  - dinosaurs
# existing: title, description, image, source, …
```

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

## 11. Implementation checklist (when we leave planning)

1. Resolve [§10](#10-open-decisions).
2. Migrate `content/categories/` → `content/collections/` with `kind`/`parent`/`aliases`.
3. Add `subject` + `tags` to leaf MDX; drop `categories[]`.
4. Build tree loader + path resolver in `lib/content/`.
5. Replace `app/coloring-pages/[categorySlug]/...` with `app/coloring-pages/[[...path]]/page.tsx`.
6. Generate alias + legacy 308s into `next.config.js redirects()`.
7. Rewrite `app/sitemap.ts` for the tree + facets + namespaces.
8. Add path-based pagination + breadcrumb JSON-LD helper.
9. Stand up `/how-to-draw`, `/drawing-ideas`, `/tools` namespaces.
