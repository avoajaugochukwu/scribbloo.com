# BlogOS — Usage

One default workflow (manual, plan-driven) and three optional commands you can create.

## The workflow at a glance

The default is a manual pipeline you drive yourself. There's no orchestrator. The project already has a keyword pipeline and a content plan — start from those. For each post:

1. **Pick a row** from `plan/plan.md` (or a keyword with clear intent, e.g. "how to draw a rose").
2. **Open the cluster brief** it links — `plan/how-to-draw.md`, `plan/coloring-collections.md`, `plan/drawing-ideas.md`, or `plan/tools.md` — for the primary/secondary keyword targets and the canonical slug.
3. **Research the SERP with WebSearch** — read the top tutorials/listicles and the People-Also-Ask box, then WebFetch the top pages and any source you need to confirm a fact (art history, how a medium behaves, terminology).
4. **Assemble a brief** — the confirmed step sequence (basic shapes → details), the facts to cite, the H2s the SERP rewards, the matching coloring collection to link.
5. **Draft as plain-Markdown MDX** per the content type's spec in `page-structures-skill.md` and `plan/00-writing-guide.md` §8 — frontmatter first, body starts (often after an image) with a blockquote answer box.
6. **Walk every technique step** to confirm the sequence actually produces the drawing.
7. **Verify factual claims** against reputable sources and cite them; handle any licensed character with fan-style phrasing + a disclaimer.
8. **Run the re-audit** (`google-trust-audit-skill.md` + the gate in `accuracy-and-trust-skill.md`).
9. **Write the file** to `content/blog/<slug>.mdx` (or `content/categories/<slug>.mdx` for a coloring collection).

## Optional commands (do not exist yet)

If you want shortcuts, create these as plain markdown files in `.claude/commands/<name>.md`. They are optional conveniences that wrap the manual workflow above — nothing depends on them.

```
/blog                                           # load pack into chat
/b-write <keyword>                              # research + draft from a keyword → content/blog/<slug>.mdx
/b-review <slug-or-path>                         # audit + fix an existing post
```

A `/b-write` command would: take the plan row, derive the slug, infer the content type, research via WebSearch, assemble the brief, draft as plain-Markdown MDX per `page-structures-skill.md`, walk every step, verify facts, run the re-audit, and write `content/blog/<slug>.mdx`. A `/b-review` would resolve `content/blog/<slug>.mdx`, audit against the full pack, re-walk the steps, re-verify facts, and write back — refusing to ship if a broken step or an unverifiable claim remains. `/blog` would just load the pack for brainstorming or manual edits.

---

## The 4 content types (defined in page-structures-skill.md)

| Type | Use for |
|---|---|
| ✏️ Drawing tutorial | "How to draw X" → step-by-step, route to the collection ("how to draw a rose", "how to draw a cat easy") — the core type |
| 📝 Listicle | A numbered set of ideas grouped by theme ("40 easy things to draw", "cute drawing ideas for beginners") |
| 📂 Coloring collection / category | A themed printable landing; copy lives in frontmatter `seoDetails` ("dinosaur coloring pages", "unicorn coloring pages") |
| 🛠️ Tool landing | Conversion-focused tool page ("photo to coloring page") |

Infer the content type from the plan row's icon or the keyword's intent, or ask if ambiguous.

---

## The hard rules

1. **MDX output, plain Markdown elements only.** Frontmatter first, body second, no preamble, no closer. H1 in frontmatter `title:` only — body starts (often after an image) with a top blockquote answer box. No `# H1` in the body, no invented JSX components, no GFM tables in bodies, no `$…$` math, no manual heading anchors.
2. **Correct materials & terminology.** Pencil grades (HB, 2B, 6B), paper weight (lb / GSM, both shown), color terms (hue/value/saturation), medium names, and printing terms (A4 / US Letter, "fit to page", cardstock) used precisely and consistently.
3. **Accuracy & trust is a publish gate.** Every technique step is walked and confirmed to actually produce the drawing — the established drawing method is the source of truth. Every load-bearing factual claim (art history, terminology, how a medium behaves) is verified against a reputable source and cited; use ranges where the truth varies; no fabricated facts or fake statistics. Licensed characters (Hello Kitty, Pokémon, Bluey, etc.) are described fan-style with a light disclaimer, never implying official status. A broken step or an unverifiable claim → the post does not ship.
4. **Content-type skeletons guide structure.** Read `page-structures-skill.md` and `plan/00-writing-guide.md` §8. Each type has a frontmatter shape, a body skeleton, and a word-count band. Adapt to what the SERP rewards.
5. **No fake briefs, no invented facts.** The brief comes from the `plan/` briefs + WebSearch research, not assumptions. If the brief lacks confirmed steps or a sourced fact, don't write one.

---

## Day-to-day flow

### Writing one post

Worked example: **"how to draw a rose"**, paired with the `/coloring-pages/flowers` collection.

1. Take the row from `plan/plan.md`, open `plan/how-to-draw.md` for the keyword targets and the canonical slug `how-to-draw-a-rose`; infer type ✏️ drawing tutorial.
2. WebSearch the keyword → read the top 10 results, the PAA, and the snippet currently winning.
3. WebFetch the top 3 tutorials → note their step counts, their H2s, and where they're thin; confirm the basic-shapes sequence actually produces a rose.
4. Synthesize the brief → the 5–8 step sequence (start with the center spiral, wrap petals, add stem and leaves), the materials list, the FAQ from PAA, the H2 outline, the matching collection to link.
5. Draft as plain-Markdown MDX, body opening with a blockquote answer box, the CTA as a Markdown link to `/coloring-pages/flowers`.
6. Walk every step in order to confirm it builds correctly; verify any factual aside against the cited source; patch any problem.
7. Run the re-audit, then write to `content/blog/how-to-draw-a-rose.mdx`. Drop the step images at `public/images/blog/how-to-draw-a-rose/` (`featured.webp`, `inline-1.png`, …).

Review at `/blog/how-to-draw-a-rose` after `npm run dev`.

### Writing a batch

Do one row at a time. Each post needs its own research pass and its own step walk-through — don't fan out N keywords at once.

### Updating an existing post

Manual edit → save → re-audit (or `/b-review <slug>` if you've created the command) → re-walk the steps, re-verify facts, correct what manual edits missed. (There is no `dateModified` field — track the update via git or by adjusting `publishedAt`.)

---

## Path conventions

| Artifact | Location |
|---|---|
| Blog MDX output | `content/blog/<slug>.mdx` (flat — never a typed subfolder) |
| Coloring collection MDX | `content/categories/<slug>.mdx` (separate route; copy in `seoDetails`) |
| Featured image | `public/images/blog/<slug>/featured.webp` (frontmatter `featuredImage: featured.webp`) |
| Inline / step images | `public/images/blog/<slug>/inline-N.<ext>` → `![alt](/images/blog/<slug>/inline-1.png)` |
| Content plan + briefs | `plan/plan.md`, `plan/how-to-draw.md`, `plan/coloring-collections.md`, `plan/drawing-ideas.md`, `plan/tools.md` |
| Writing guide (canonical templates) | `plan/00-writing-guide.md` |
| Keyword pipeline | `site-infra/keyword-research/` (`fanout.py → analyze.py → report.py → build_plan.py`, `MASTER_keywords.csv`) |
| Site voice profile | `protocols/site-voice-profile.md` |
| Rotation log | `protocols/rotation-log.md` |
| Renderer | `app/blog/[slug]/page.tsx`, `lib/content/blog.ts`, `lib/content/types.ts`, `components/mdx/MdxComponents.tsx` |

---

## What's NOT needed

- **No new research API.** The project already has a DataForSEO + Apify keyword pipeline (`site-infra/keyword-research/`, creds in repo `.env`: `DATAFORSEO_LOGIN`/`DATAFORSEO_PASSWORD`, `APIFY_TOKEN`) and a ready `plan/`. Day-to-day drafting just reads the briefs; WebSearch / WebFetch cover SERP recon and fact-checking. You only re-run the pipeline to refresh the plan.
- **No manual orchestrator.** You drive the pipeline; the pack supplies the discipline.
- **No install.** The pack is markdown files in `protocols/blog/`. The optional slash commands would be markdown files in `.claude/commands/`. Both load via `@` references.
- **No React templates.** Every blog post renders through the single `app/blog/[slug]` route via `lib/content/blog.ts` + the MDX component map. The content type carries the shape; the CTA is a plain Markdown link to the matching coloring collection or a related tutorial.

---

## Pack file map

See `protocols/blog/README.md` for the full file list. The pack covers writing craft, SEO, E-E-A-T, scannability, the art materials & terminology guide, the accuracy & trust gate, keyword research aligned to the project pipeline, and the 4 content types.
