# Scribbloo

Free printable coloring pages + drawing tutorials. Next.js 15 (App Router), TypeScript,
Tailwind 4. File-based MDX content (no CMS/DB). Deployed on Railway behind Cloudflare.

## Architecture quick map

- `app/` — App Router routes. Content namespaces: `/coloring-pages`, `/blog` (live);
  `/how-to-draw`, `/drawing-ideas`, `/tools` (planned). SEO via `app/metadata.ts`,
  `app/sitemap.ts`, `app/robots.ts`.
- `content/` — all content as MDX + YAML frontmatter (`categories/`, `coloring-pages/`, `blog/`).
- `lib/content/` — MDX loaders + Zod schemas (`types.ts`).
- `next.config.js` — **active config** (`.mjs`/`.ts` are stale, ignore). Holds redirects (308)
  and cache headers.

## URL structure — READ BEFORE TOUCHING ROUTES OR ADDING CONTENT

The site is being redesigned for scale (50 → 1,000+ pages). The canonical reference is
**[`plan/url-structure-guide.md`](plan/url-structure-guide.md)**. Key rules:

- Category depth is **the content folder tree** (`content/coloring-pages/<a>/<b>/…` mirrors the URL;
  `_category.mdx` = listing, other `*.mdx` = leaf), resolved by one catch-all route
  (`app/coloring-pages/[[...path]]`, logic in `lib/content/collections.ts`). Cross-cutting facets
  live in `content/facets/*.mdx` (tag-driven). Not nested route folders, not a `parent` field.
- **One canonical URL per page.** Keyword synonyms (dino/dinosaur/dinosaurs) = one page + 301
  aliases, never separate pages. (We already hit this cannibalization on the blog and fixed it via
  `redirects()` in `next.config.js` — same pattern applies to collections.)
- Subjects nest in the path; audience/style cuts (adult, kids, cute) are tag-driven facet listings.
- **Pagination**: listings paginate at `PAGE_SIZE` (48) via `/…/page/N` (page 1 = bare URL; `/page/1`→308). Page ≥2 is `noindex, follow` + self-canonical — keep it that way.
- **Content is validated on every build**: `prebuild` runs `npm run validate` (`scripts/validate-content.ts`) and FAILS the build on invalid frontmatter, a folder with leaves but no `_category.mdx`, a file/folder name collision, a missing image folder, or a facet with no `facetTag`. Run `npm run validate` directly while authoring.
- **Image names + alt text are descriptive (SEO).** A leaf's `image` key is the
  folder under `public/images/coloring-pages/<key>/`, so it's part of the served
  image URL — make it the full long-tail phrase ending in `-coloring-page` (e.g.
  `cute-halloween-pumpkin-coloring-page`, not `pumpkin`). Convention: `image` =
  leaf slug + `-coloring-page`, set automatically by `writeColoringPage`. The
  **URL slug (the link) stays short** — this is the image name only. Alt text is
  centralized in `coloringPageAlt()` (`lib/alt.ts`): `Printable hand-drawn <title>
  coloring page[ for <audience>]` — never hand-write alt on coloring images, use
  the helper (card + detail both do). See `plan/image-pipeline.md`.
- **Sitemap (`app/sitemap.ts`) is auto-derived** from the content tree — new collections/leaves/facets/tutorials/listicles/tools/posts appear with no edit. Only a new top-level *namespace* or *static page* needs a one-line edit there. Never hand-add content URLs; never list paginated/alias/non-canonical URLs; never use `new Date()`/`Date.now()` for `lastModified`. Full rules are in that file's header.

## Thin content — READ BEFORE AUTHORING ANY LEAF OR HUB

A coloring page is one image + a download button, which search engines read as **thin / low-value**
unless we add real text and structure. The canonical policy is **[`plan/thin-content-guide.md`](plan/thin-content-guide.md)**. Non-negotiables:

- **Every leaf carries 150–300 words of *unique* body text** (description + coloring tips /
  educational value / artistic style) — in the MDX body, not a one-line `description` and never
  shared boilerplate. The generic fallback sentence is itself thin content.
- **Descriptive images + alt + a visible caption** (image naming/alt already enforced — see image
  rules above; caption under the preview is the remaining gap).
- **Schema markup**: leaves already emit `ImageObject` + `BreadcrumbList`; add `HowTo` to step-by-step
  guides/tutorials; only add `AggregateRating` with *real* ratings — never fabricate.
- **Hubs carry their own depth** via the collection `seoDetails` block (intro, how-to, activities,
  tips, FAQs). Consolidate synonyms into one canonical page + `aliases`; never multiply near-duplicate
  thin pages.
- UGC (comments, completed-art gallery) and on-site interactive tools are the future levers — see the guide.

## Content plan

`plan/plan.md` — 228 pages mapped to keyword demand (collections, tutorials, listicles, tools),
with per-type writing briefs in the other `plan/*.md` files and `plan/00-writing-guide.md`.

## Design system

Playful all-ages "coloring-book" aesthetic (defined in `app/globals.css`). Fredoka (display)
+ Nunito (body). Warm cream paper (`--paper #FFFBF3`), espresso ink outlines (`--ink #2C2A33`),
and an 8-crayon **equal-chroma OKLCH palette** (`--red --orange --yellow --green --teal --blue
--purple --pink`), each with a pale `-t` tint for fills behind line art. All exposed as Tailwind
utilities (`bg-red`, `text-purple`, `bg-yellow-t`, `text-ink-soft`…). Signature primitives:
straight-down solid `shadow-pop`/`-sm`/`-lg`, `.pressable` (lift on hover, press on click),
`.retro-frame` (2.5px ink print mat), `.dotgrid`, `.eyebrow`, `.pips`, `.link-arrow`, `.blob`,
the `floaty` hero animation. Legacy token names (terracotta/mustard/teal/rose/sage/plum) are
aliased onto the new palette so older pages re-skin automatically.

Coloring components live in `app/coloring-pages/components/`: `ColoringPageImage` (the `.pcard`),
`ColoringGallery` (client search/sort/grid-masonry over server-rendered cards), `SwatchPreview`
(detail "try a color" mat tinting). Shared chrome: `components/BrandMark` (logo lockup),
`CategoryRail` (theme tiles), `FavoriteButton` (localStorage heart), `components/icons.tsx`
(`ThemeIcon` keyed by subject slug + a small stroke icon set).
