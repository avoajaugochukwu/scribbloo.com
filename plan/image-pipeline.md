# Image Pipeline

How coloring-page (leaf) images get made and where they live. Writers don't hand-create leaf images
or leaf MDX — this pipeline does. Collection/blog authors only reference `hero.webp` / `thumb.webp`.

---

## 1. On-disk layout (the contract)

Every leaf has a folder of three variants under `public/`, keyed by the leaf's `image` field:

```
public/images/coloring-pages/<image>/
  original.png   # full-res printable (download/print)
  full.webp      # large display image (detail page)
  thumb.webp     # grid thumbnail (listings)
```

Categories use `public/images/categories/<slug>/hero.webp` + `thumb.webp`.
The single source of truth for turning these into URLs is `lib/images.ts` (`imageUrl()`), so **never
hardcode `/images/...` paths** in components or MDX — go through `imageUrl()`.

## 2. CDN switch (scale)

Locally, images are served from `public/`. To move to a CDN/object store, set
`NEXT_PUBLIC_IMAGE_BASE_URL` (e.g. `https://cdn.scribbloo.com`) — `imageUrl()` prefixes it and
`next.config.js` whitelists the host automatically. No component/MDX edits. At thousands of pages,
flip this so the repo/deploy doesn't carry thousands of image files. (The content-validation gate
skips the local image-existence check when this env is set.)

## 3. Generation

`npm run generate` (`scripts/generate-coloring-page.ts`) calls fal.ai, downloads the image, writes the
three variants, and writes the leaf MDX. Costs money per run — use intentionally (`--dry-run` to test).

> ⚠️ **DRIFT — update before real use:** `generate-coloring-page.ts` + `scripts/lib/writeColoringPage.ts`
> still target the OLD flat model (a `--categories` arg, writing `content/coloring-pages/<slug>.mdx`
> with a `categories[]` array). Under the folder model a leaf must be written to
> `content/coloring-pages/<theme>/<subject>/<slug>.mdx` (no `categories`/`subject` fields — the folder
> is the home), so the generator needs a `--subject <folder-path>` (or `--path`) argument and must
> drop `categories`. Until that's fixed, a generated page will land at the wrong place and fail
> `npm run validate` (leaf at the content root with no `_category.mdx`). See url-structure-guide.md §7.

## 4. Validation

`npm run validate` (runs on `prebuild`) checks every leaf's `image` folder exists (local mode) and
warns on a missing variant. A leaf pointing at a non-existent image folder fails the build.
