---
name: media-and-images
description: Featured-image rules, alt-text craft, captions, file naming, OG card dimensions, local Markdown image embedding, step images for tutorials, coloring-sheet previews, and licensing for Scribbloo. Images carry this site — a drawing tutorial is mostly pictures, and a coloring collection needs preview sheets. One featured image per post for the header and social card, plus per-step inline images for tutorials, with descriptive alt, sized so nothing shifts (no CLS). Covers the discipline of media that signals quality to readers, helps accessibility, and feeds the SEO signals Google rewards.
---

# Media & Images — the visual layer

> Images on a Scribbloo post serve four audiences at once: the skimming parent (visual interest), the kid following along (illustration of the exact next move), the accessibility user (alt text), and Google's crawler (alt text + filename). The same image either serves all four or fails all four. On Scribbloo the house style is **Storybook Retro** (warm, playful, 70s-print feel — see the design system): friendly line art, soft retro colors, clean step pictures. Every post ships with one **featured image** for the header and social card; tutorials lean heavily on **per-step images**, and coloring collections show **preview sheets**.

---

## The featured image

Every post ships with one featured image, declared in frontmatter by **filename only**:

```yaml
featuredImage: featured.webp
```

The file lives at `public/images/blog/<slug>/featured.webp`. This is the field `lib/content/types.ts` validates (filename only — the route resolves the full path). The same file is used for the **post header** (rendered above the body) and the **Open Graph / social card**. There is no separate `heroImage`, `ogImage`, `alt`, or `caption` frontmatter field — those don't exist in this codebase. The featured-image alt text is derived from the post `title`.

### Featured image rules

- **Dimensions: 1200 × 675.** This is the 16:9 Open Graph card the site uses for the header and social previews. Anything else gets cropped weirdly when shared on X, Facebook, Pinterest, iMessage, Slack.
- **Aspect ratio: 16:9 (1.78:1).** Locked by the 1200 × 675 dimensions.
- **Format: WebP.** Filename convention is `featured.webp`. Smaller than JPEG/PNG with no quality loss.
- **File size: under 200 KB.** Page-speed matters; Core Web Vitals affect ranking.
- **On-brand Storybook Retro art > generic stock.** A warm, hand-drawn-feeling illustration in the site's palette beats generic Unsplash stock. Stock photos signal "any blog could have written this."
- **Recognizable subject.** The featured image conveys what the post is about at a glance, even cropped to a small thumbnail — the finished rose for a "how to draw a rose" post, a friendly dinosaur for a dinosaur coloring collection, a tidy grid of doodles for a "40 easy things to draw" listicle.

### When the post has no obvious image

Most Scribbloo posts have an obvious image — the finished drawing or a sample coloring sheet. When a topic resists it:

- A typographic featured image with the post title set in the site's display font on the retro paper background (matches the masthead — see the design system)
- The finished piece shown small in a tidy retro frame, with the title beside it
- A small grid of the subjects covered (great for listicles — six little doodles arranged in a 70s-print layout)
- A single warm symbol tied to the theme (a pencil and rose for a rose tutorial, a crayon and dinosaur for a coloring set)

Never use a generic "person at a desk" stock photo. It's the strongest signal of low-effort content.

---

## Alt text craft

Alt text is the single most powerful image-SEO signal, and a hard accessibility requirement. Most blogs do it badly. The featured image's alt is derived from the post title; **body images carry their own alt in the `![ ]` brackets**, and that's where the craft below applies. For step images especially, the alt text is how a screen-reader user actually follows the tutorial — so write it like the instruction it illustrates.

### Rules

- **Descriptive of the image, not the post.** Alt text is for someone who can't see the image, not for keyword-stuffing.
- **≤ 125 characters.** Screen readers don't truncate gracefully past this.
- **Sentence-case prose, not phrase fragments.** "A pencil sketch of a rose with a small spiral center and two curved petals wrapped around it" beats "how to draw a rose easy rose drawing tutorial petals".
- **Target query naturally if relevant** — don't force it. If the image actually shows what the query is about, the natural description will include the query.
- **No "image of," "picture of," "photo of"** — screen readers already announce these.
- **Decorative images** get `alt=""` (empty), which tells screen readers to skip. But almost no image on a Scribbloo post is truly decorative — a step image is load-bearing instruction.

### Examples

| Image | Good alt | Bad alt |
|---|---|---|
| Step 1 of a rose tutorial | "A pencil sketch showing step one: a small spiral drawn in the center of the page for the rose's heart." | "how to draw a rose step 1 easy rose drawing" |
| A cat tutorial step | "A light pencil drawing of a circle for the cat's head with two triangle ears added on top." | "cat drawing tutorial beginner cats" |
| A dinosaur coloring sheet preview | "A black-and-white printable coloring page of a smiling cartoon stegosaurus standing in grass." | "dinosaur coloring pages free printable" |
| A finished, colored rose | "A finished rose colored with red petals and a green stem, drawn in a soft storybook style." | "rose drawing colored" |

### When the image has text or shows the exact move

For a step image, the alt text should describe *what changed in this step* so a non-sighted reader can still follow along:

> Alt: "Step three of the rose: a layer of larger petals added behind the first two, fanning out like a teardrop."

The alt text is now the only way a screen reader user gets the step. Don't bury it, and don't reuse the same alt for every step — each step's alt should describe its own new move.

---

## Captions

Captions are visible under body images, optional but recommended. There is no caption frontmatter field — a caption is a line of italic Markdown placed directly under the image in the body.

### When to caption

- **Always for step images** — a one-line "Step N: …" that names the move
- **Sometimes for finished pieces** — only if the caption adds something the image doesn't show
- **Always for sourced or historical images** — name the source, year, context
- **Always for a coloring-sheet preview that links to the printable** — point to where to grab it

### Caption format

- Sentence-case prose, complete sentence preferred
- ≤ 200 chars
- Includes source / attribution where applicable
- Italicized in Markdown (`*...*`), which the component map renders as a caption

### Examples

> *Step 1: a small spiral becomes the heart of the rose. Everything else wraps around this.*

> *The finished stegosaurus, ready to print and color. Grab it on our [Dinosaur Coloring Pages](/coloring-pages/dinosaurs).*

> *Keep your guidelines light — you'll erase them all before you color.*

---

## File naming

The folder name is the SEO signal here — every post's images live in a slug-named folder. Within it, names are simple and consistent.

### Rules

- **Folder is the slug:** `public/images/blog/how-to-draw-a-rose/`
- **Featured image is always `featured.webp`** — the route and frontmatter expect that exact name.
- **Inline images are `inline-N.<ext>`:** `inline-1.png`, `inline-2.webp`, numbered in the order they appear. Steps map naturally to numbers (step 1 → `inline-1`).
- **No spaces, no special chars, lowercase only** — hyphens in the slug, plain numbers in the inline names.
- **Pick one extension per image** and reference it exactly — `.png`, `.webp`, or `.jpg`. The Markdown path must match the file on disk.

### File path convention

The featured image lives in the post's slug folder under that exact name:

```
public/images/blog/<slug>/featured.webp   → frontmatter: featuredImage: featured.webp
```

Inline (body) images live in the same folder and are referenced with a root-relative path (the `public` prefix is dropped in the URL):

```
public/images/blog/<slug>/inline-1.png → referenced in the body as /images/blog/<slug>/inline-1.png
```

Example for a rose tutorial (slug `how-to-draw-a-rose`):

```
public/images/blog/how-to-draw-a-rose/featured.webp    (featured image, 1200×675)
public/images/blog/how-to-draw-a-rose/inline-1.png     (step 1)
public/images/blog/how-to-draw-a-rose/inline-2.png     (step 2)
public/images/blog/how-to-draw-a-rose/inline-3.png     (step 3, etc.)
```

Keeping each post's media in its own slug folder keeps `public/images/blog/` legible as the corpus grows.

---

## Embedding images in the body (local Markdown only)

In the body, embedded images use plain Markdown image syntax with a local, root-relative path. The renderer maps `img` to **next/image inside a `.retro-frame`**, so a plain `![alt](...)` is exactly right — there's no `<Image>` or `<Figure>` component to call, and any custom JSX would not render. No remote URLs either:

```md
![A pencil sketch showing step one: a small spiral in the center of the page for the rose's heart.](/images/blog/how-to-draw-a-rose/inline-1.png)
```

### Rules

- **Markdown only:** `![alt](/images/blog/<slug>/inline-N.ext)`. Never a JSX component, never a remote URL.
- **Local path only:** the image must already live in `public/images/blog/<slug>/`. Don't hotlink to external images.
- **Alt text is mandatory** and goes in the `![ ]` brackets. Apply the full alt-text discipline above — descriptive, ≤ 125 chars, no keyword stuffing, no "image of."
- **Caption** (where needed) goes in a line of italic text directly under the image:

```md
![A layer of larger petals added behind the first two, fanning out like a teardrop.](/images/blog/how-to-draw-a-rose/inline-3.png)

*Step 3: bigger petals fan out behind the first ones. Match this exactly before moving on.*
```

Because the next/image wrapper renders inside a fixed `.retro-frame`, do the optimization work yourself before committing: export to WebP/PNG, resize to the rendered width, and keep file sizes within the budgets below.

### The featured image

The featured image is declared in frontmatter as `featuredImage: featured.webp` (see above) and rendered by the route in the header. Don't also embed it in the body.

---

## Aesthetic: Storybook Retro

The visual brand is the site's design system: warm, playful, nostalgic 70s-print. Images must live inside it, not fight it:

- **The retro frame is the site's, not yours.** `img` already renders inside a `.retro-frame` (the soft border / pop-shadow). Don't bake a second border, drop shadow, or rounded card into the image file itself — you'll get a frame inside a frame.
- **Warm, limited palette.** Step art reads best as clean line work, optionally with the site's soft retro fills (terracotta, mustard, muted teal). Don't drift into harsh neon or clinical pure-white-on-black.
- **Restraint and clarity.** For a tutorial, each step image should show *only what's new in that step* plus the lighter lines from before — so the kid can see exactly what to add. A busy image defeats the lesson.
- **Light and dark.** The site supports a dark theme. Line art on a transparent or warm-paper background survives the theme toggle; art baked onto pure white can look harsh in dark mode.

---

## Image density by archetype

How many images a post needs. Scribbloo skews **image-heavy** — drawing is a visual craft. The biggest single rule: **a step-by-step tutorial wants one image per step.**

| Content type | Featured | Body images | Notes |
|---|---|---|---|
| Drawing tutorial (step-by-step) | 1 | 1 per step (plus a finished-piece shot) | The images *are* the tutorial — don't skimp |
| Listicle ("40 easy things to draw") | 1 | 1 every 600-1,000 words, or a sample per cluster | Show examples of the ideas, not just describe them |
| Coloring collection / category landing | 1 | Preview thumbnails of the sheets | Readers want to see the pages before printing |
| Pillar / topic hub | 1 | 2-4 | Images break the long body |
| "What is / how does" explainer | 1 | 0-2 | A simple illustration where it clarifies a term |
| Comparison ("markers vs colored pencils") | 1 | 1-2 | A side-by-side sample of each result |

### Step images are load-bearing — don't skip them to save time

A drawing tutorial without per-step images is a recipe with no pictures: technically complete, practically useless to a beginner. Each step image earns its place by showing the exact next move. Conversely, don't pad a short explainer with generic art just to hit a number — a clean step sequence or a clear preview sheet is the real visual payload.

---

## Image licensing

Every image on the site needs a clear license source. Options:

### Tier 1 — Owned by the site
- Original drawings, step art, and coloring sheets created for Scribbloo
- Finished pieces drawn by the author/illustrator
- Photos of the actual drawing in progress

**No license file needed; the site owns the image.**

### Tier 2 — Licensed
- Stock illustration from a paid source (Adobe Stock, Shutterstock)
- Commissioned illustration with usage license
- Public domain (clearly marked)

**Keep license proof in `/private/licenses/<image-slug>.txt` (not in the public repo if confidentiality matters).**

### Tier 3 — Free with attribution
- Unsplash / Pexels photos (free with attribution recommended)
- Wikimedia Commons (varies by image)
- Public-domain reference art

**Caption must include attribution per the license's requirements.**

### Tier 4 — Contraband
- Any image found via image search with no clear license
- **Art of licensed/trademarked characters** (Hello Kitty, Pokémon, Sonic, Bluey, etc.) presented as official — only original fan-style art clearly framed as "fan-art style / inspired by," and never implying it's official
- Screenshots of copyrighted material beyond fair use
- AI-generated images using a service whose ToS doesn't allow commercial use

**Don't ship.**

---

## AI-generated images

A nuanced area. Many sites use Midjourney, DALL-E, or Stable Diffusion for illustrations. For a teaching tutorial, AI is risky for the *steps* — AI image tools don't reliably produce a clean, consistent step sequence where each frame adds exactly one move, and a wrong step image teaches the wrong thing.

### Rules

- Check the generator's terms of service for commercial use
- Disclose AI generation in the caption when material — "Illustration generated with an AI tool, refined by the author."
- **Never use AI for a load-bearing step image** unless you've verified the sequence is consistent and each step adds only what the prose says — otherwise draw it (or trace your own steps) so the lesson is right
- Never use AI to generate licensed characters and pass them off as official
- Never use AI-generated images of real people (consent issues)
- Quality bar: if the image has the AI-art "tells" (six fingers, garbled lines, melted edges), don't ship

---

## Featured image and Open Graph

The featured image is also the social-share image. When the post is shared on Pinterest, X, Facebook, iMessage, Slack — the OG image is what shows up. On Scribbloo these are the same file. (Pinterest matters a lot for this niche — a clean, readable card earns repins.)

### Render conditions

- 1200 × 675 (16:9 aspect)
- Looks good at thumbnail size (~600 × 338 in most previews)
- Recognizable subject at a glance
- Any title text readable at small sizes
- No watermarks, no logos in the corner (those crop)

Because the renderer uses a single `featuredImage` filename for both the header and OG, there's nothing to override — make the one file work in both contexts.

---

## Decorative graphics, icons, dividers

A clean blog doesn't need extra decorative clutter. Sections are separated by H2s and the retro-frame rhythm of the real images, not by horizontal-rule images or fancy dividers. The site's own Storybook-Retro chrome (pop-shadows, retro frames) supplies the warmth — don't add competing decoration inside the post body. Keep any inline marks minimal.

---

## Image performance

Images are usually the largest assets on a page — and an image-heavy tutorial can stack a dozen of them. Performance discipline matters here:

- WebP for the featured image; WebP or optimized PNG for line-art steps (PNG keeps crisp edges on simple line work)
- File size under 200 KB for the featured image, under 100 KB for body/step images (clean line art should be tiny)
- Width sized to the actual rendered width (don't ship a 4000px image to render at 800px) — do it before committing
- A long tutorial with many steps especially needs light per-step files so the page doesn't crawl

The audit catches: images over 500 KB, body images with no alt text, images with a missing local file, and a `featuredImage` that doesn't resolve at `public/images/blog/<slug>/featured.webp`.

---

## Pre-publish media checklist

- [ ] `featuredImage: featured.webp` present in frontmatter (filename only)
- [ ] Featured file exists at `public/images/blog/<slug>/featured.webp`
- [ ] Featured image is 1200 × 675 (16:9)
- [ ] Featured image file size < 200 KB
- [ ] Featured image reads on both light and dark themes
- [ ] All body images use local Markdown `![alt](/images/blog/<slug>/inline-N.ext)` — no component, no remote URL
- [ ] Inline image paths match files on disk (correct numbers and extensions)
- [ ] Tutorial has one image per step; each step's alt describes its own new move
- [ ] Coloring collection shows preview sheets of the actual pages
- [ ] All body images have descriptive alt text in the brackets
- [ ] All body images sized to their rendered width
- [ ] All body images < 100 KB (or < 200 KB if essential)
- [ ] No alt text is keyword-stuffed
- [ ] No second frame/shadow baked into an image (the `.retro-frame` is the site's)
- [ ] License source clear for every image; no licensed character implied as official
- [ ] If AI-generated, disclosed in caption (and not used for a load-bearing step image)

---

**BlogOS** — images that earn their bytes.
