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

- Category depth is **data** (`parent` chain in frontmatter), resolved by one catch-all route —
  not nested route folders.
- **One canonical URL per page.** Keyword synonyms (dino/dinosaur/dinosaurs) = one page + 301
  aliases, never separate pages. (We already hit this cannibalization on the blog and fixed it via
  `redirects()` in `next.config.js` — same pattern applies to collections.)
- Subjects nest in the path; audience/style cuts (adult, kids, cute) are tag-driven facet listings.

## Content plan

`plan/plan.md` — 228 pages mapped to keyword demand (collections, tutorials, listicles, tools),
with per-type writing briefs in the other `plan/*.md` files and `plan/00-writing-guide.md`.

## Design system

"Storybook Retro" (70s print) aesthetic — fonts, OKLCH palette, pop-shadow/retro-frame utilities.
