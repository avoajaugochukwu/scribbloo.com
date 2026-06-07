# Internal-Linking Guide

The URL structure organizes content; **internal links are what make it rank.** Scribbloo wins on
*topical authority* — Google sees a dense, well-linked cluster around a subject and trusts the whole
cluster. A page with no inbound internal links is nearly invisible. Treat linking as part of writing,
not an afterthought.

Read alongside [`00-writing-guide.md`](00-writing-guide.md) §7 and [`url-structure-guide.md`](url-structure-guide.md).

---

## 1. The mesh (the core idea)

Every **subject** (e.g. "dragon") usually exists across three content types. Link them to each other:

```
/coloring-pages/fantasy/dragon   ⇄   /how-to-draw/dragon   ⇄   /drawing-ideas (dragon section)
        (collection)                     (tutorial)                  (listicle)
```

- **Tutorial ⇄ Collection** (the highest-value pair): "How to Draw a Dragon" links to the **Dragon
  coloring pages**, and the collection's copy links back to the tutorial. Bidirectional, always.
- **Listicle → Tutorials/Collections** it names: "…learn it in our [How to Draw a Rose] guide" and
  "…or color one with our [Rose coloring pages]".
- **Tool → relevant collections/listicles**: the photo→coloring tool links to popular collections.

## 2. Hierarchy links (free, but do them)

- Each page links **up** to its cluster pillar: collections → `/coloring-pages` (or their theme hub);
  tutorials → `/how-to-draw`; listicles → `/drawing-ideas`. (Breadcrumbs do this automatically —
  don't duplicate breadcrumb links in body copy.)
- Each collection links **sideways** to 2–3 **sibling** collections in the same parent
  (`animals/dinosaur` ↔ `animals/cat` ↔ `animals/dog`) and **down** to notable subcategories.
- A leaf detail page links to **siblings in its folder** (handled automatically by the "More …"
  related grid) — author copy doesn't need to.

## 3. Facets

Facet pages (`/coloring-pages/for-kids`, `/cute`) are reached two ways: a "Browse by" block on the
`/coloring-pages` hub, and a tag on the leaf. To make a leaf appear in a facet, **tag it** (e.g.
`tags: [kids]`) — that's the only wiring needed; the facet aggregates by tag. Don't hand-link every
leaf into a facet.

## 4. Rules of thumb

- **3–6 internal links per page.** Fewer = orphaned; more = diluted.
- **Descriptive anchor text = the target's keyword** ("Dragon coloring pages"), never "click here" / a bare URL.
- **Link to the canonical path only.** Never link a leaf via a facet or alias URL — always its folder
  path (the components already emit canonical hrefs; in hand-written MDX, use the canonical path).
- **No links to `page/N`, aliases, or noindex URLs** from body copy.
- **Every new page needs ≥1 inbound link** from an existing page, or it's an orphan. When you publish a
  tutorial, add the reciprocal link on its collection (and vice-versa) in the same batch.

## 5. How it's wired per type

| From | Mechanism |
|---|---|
| Blog / editorial | `relatedCategories` + `relatedPages` frontmatter, plus in-body MDX links |
| Tutorial / Listicle / Tool (MDX body) | in-body MDX links (canonical paths) |
| Collection (`_category.mdx`) | in-body links inside `seoDetails.paragraph`; siblings via the theme listing (automatic) |
| Leaf → siblings | automatic ("More … Coloring Pages" related grid) |
| Leaf → facet | by `tags` (the facet aggregates) |

## 6. Pre-publish link check
- [ ] Tutorial and its collection link to each other.
- [ ] 2–3 sibling/cluster links added.
- [ ] 3–6 total internal links, descriptive anchors, canonical paths only.
- [ ] The page has at least one inbound link from existing content.
- [ ] Leaf carries the right `tags` for any facet it should appear in.
