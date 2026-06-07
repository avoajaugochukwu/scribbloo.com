---
name: eeat-signals
description: Experience, Expertise, Authoritativeness, Trustworthiness — the four signals Google uses to judge whether a page deserves to rank. This skill codifies the concrete on-page elements that demonstrate E-E-A-T for a coloring-pages and drawing-ideas site: the Scribbloo brand byline, the publisher signal, techniques that actually work (tested by hand), art facts traced to museums/reputable references/manufacturer specs, first-person experience markers, keeping content current (tracked via git/publishedAt — there is no dateModified field), named source citations, and proper licensed-character handling.
---

# E-E-A-T Signals — the trust layer

> E-E-A-T is not a ranking algorithm. It is the framework Google's human Quality Raters use to evaluate pages, and the algorithm tries to approximate their judgment. So E-E-A-T is real, even though it is not a number.

Every post on this site has to prove four things before it deserves to rank:

1. **Experience** — has the author actually done the thing they are writing about (drawn the rose, colored the page, printed the sheet)?
2. **Expertise** — does the author know the field (the technique, the materials, the vocabulary)?
3. **Authoritativeness** — is the site a recognized voice in this space?
4. **Trustworthiness** — is the page honest, current, and accurate?

This skill is the checklist of on-page elements that make those four claims visible. Without them, the post is a faceless wall of text and Google has no reason to rank it over the thousand other walls of text on the same topic.

For a coloring-and-drawing site, the single highest-leverage trust signal is **techniques that actually work and art facts that are true**: the internet is full of "how to draw X" pages that botch the method — they start with fine detail instead of basic shapes, skip the light-guideline step, or repeat invented "color rules" and made-up art history. A page whose steps a beginner can actually follow to a good result — and whose facts (a medium's behavior, a movement's date, a material's spec) trace to a museum, a reputable art-instruction reference, or a manufacturer's spec sheet — is doing something most competitors don't bother to.

---

## YMYL — when E-E-A-T matters most

Google holds "your money or your life" topics to a higher bar. YMYL topics include:

- Financial advice
- Medical information
- Legal information
- News and current events
- Civic information (voting, government)

**A coloring-and-drawing site is NOT YMYL.** Drawing tutorials, coloring collections, and art-idea listicles are low-stakes, feel-good content. The trust bar is met by **techniques that work + true art facts cited to a reputable reference/museum/manufacturer + the brand byline + content kept current** — not by medical-style reviewer sign-off.

**The one real-stakes corner — kids' safety and licensed characters.** Two situations raise the care bar:

- **Materials around young kids** — if a post recommends supplies for toddlers or classrooms, prefer non-toxic, age-appropriate materials and say so honestly (e.g. "washable, non-toxic markers for little ones"). Don't recommend small parts or sharp tools for toddlers.
- **Licensed characters** — any post about a trademarked character (Hello Kitty, Pokémon, Sonic, Bluey…) must use fan-style phrasing and a light disclaimer, never implying official/licensed status. (See `research-and-citation-skill.md` — the trademark rule.)

Everything else skates by on the ordinary trust signals.

---

## The on-page signals (mandatory)

### Signal 1 — Author byline (the Scribbloo brand)

Every post displays an author in the post header. The blog route (`app/blog/[slug]/page.tsx`) renders a visible byline alongside the published date, and emits the author into the `BlogPosting` JSON-LD.

On Scribbloo the byline defaults to the **brand, not a person.** The frontmatter `author` field is set to `null`, which the route renders as **"Scribbloo"**:

```yaml
author: null   # renders as "Scribbloo"
```

Two surfaces must match: the visible byline and the `BlogPosting` schema's author block. Both resolve to **Scribbloo** when `author` is null. The publisher Organization in the JSON-LD is also **Scribbloo** — so the brand carries both the author and publisher signal.

**Rule:** never publish under "Admin" or "Staff" or a random handle. The brand byline ("Scribbloo") is the default and is fine for this site — Scribbloo is a recognized publisher of coloring and drawing content, and the trust comes from the consistent, tested-technique editorial standard behind the brand. If a specific named contributor ever writes a post, name them in `author`; otherwise leave it null for the brand.

### Signal 2 — Brand/editorial standard at footer

At the bottom of every post, the brand's editorial standard should be visible (a short "About Scribbloo" / editorial-note block):

- The Scribbloo brand name
- A 60–120 word note on what Scribbloo is and how its content is made
- One link: to the About page
- Social links if applicable

Editorial-note rule: the note should make the *specific* claim that makes Scribbloo qualified to publish *this* kind of content. Generic notes ("Scribbloo makes coloring pages") are inert. Specific notes ("Every Scribbloo tutorial is drawn and tested by hand before it ships, and every art fact is checked against a museum or a recognized art reference") carry weight.

### Signal 3 — About / publisher page

The site has an About page (treat this as the site convention) that backs the brand byline. It is a high-E-E-A-T artifact in its own right and contains:

- What Scribbloo is and who it's for (parents, teachers, kids, hobby artists)
- The editorial standard: tutorials drawn and tested by hand, facts checked against reputable references, licensed characters handled as fan-art
- Links to the main hubs (coloring-pages landing, drawing-ideas pillar)
- Contact info
- Social profiles
- A clear statement of scope ("Scribbloo teaches drawing and provides free printables for fun and learning; for art-supply safety around very young children, follow the manufacturer's age guidance")

Schema for the publisher (emitted as the `publisher` Organization in each post's `BlogPosting` JSON-LD):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Scribbloo",
  "url": "https://scribbloo.com",
  "logo": "<logo URL>",
  "sameAs": ["<social URL>", "<social URL>"]
}
```

### Signal 4 — Working techniques & true art facts (the trust spine for this site)

This is the heaviest E-E-A-T signal for a coloring-and-drawing site. **Every technique in a post must actually work, and every art fact must be true and traceable** before publish. The verification chain is:

- **The technique** — every drawing step, coloring tip, and print instruction must produce the result the post promises when a beginner follows it. Tutorials build foundation-first: basic shapes and light guidelines before details and shading. If the steps don't work when walked in order, the post is wrong — fix the steps. There is no calculator or data file to check against; the test is doing it.
- **The facts** — material properties (HB vs 2B graphite, paper weight in lb/GSM, marker vs watercolor behavior), color-theory terms (hue, value, saturation, complementary colors), and any art-history note (a movement, a date, a named work) must trace to a **museum, a reputable art-instruction reference, an art-supply manufacturer's spec, or a recognized art educator** — not a content-farm "art hacks" blog.
- **A reputable reference** confirming it — the museum page, the manufacturer's grade chart, or the technique book the fact came from.

See `accuracy-and-trust-skill.md` for the full **accuracy & trust gate**. In short: every technique is tested by hand, every art fact is checked against an authoritative source, every licensed character is handled as fan-art — and a broken technique, a fabricated fact, or an implied license is a **publish blocker**. The post does not ship until the steps work, the fact is corrected or given as an honest range where practice genuinely varies, or the claim is removed.

When an approach genuinely varies (cute vs realistic style, markers vs colored pencils, hot-press vs cold-press paper), say so rather than asserting one universal "right way":

> A rose looks very different depending on the style you want. For a cute, beginner version, simplify it to a spiral center and a few rounded petals. For a realistic version, build up petal layers and add soft shading with a 2B or 4B pencil. Pick the look you're going for — there's no single correct rose.

Honest "this depends on the style, here are both" framing is itself a trust signal, and it is exactly what AI-slop drawing sites never do.

### Signal 5 — Keeping content current (no `dateModified` field on this site)

Every post carries `publishedAt` (an ISO datetime), and the route renders the published date in the header. **Scribbloo's frontmatter schema has no `dateModified` / `lastUpdated` field** — so you cannot stamp a "modified" date in frontmatter, and you must not instruct writers to add one.

Track currency instead by:

- **Git history** — substantive edits (re-testing a technique, correcting an art fact, adding internal links) are captured in the commit log, which is the real record of when a post changed.
- **`publishedAt`** — set it correctly at first publish. For a major rewrite of a stale post (refreshing an existing ✅ page from the plan), you may bump `publishedAt` to reflect the substantive refresh, since there's no separate modified field; do this only for genuine substantive updates, not typo fixes.

```yaml
publishedAt: '2026-06-06T00:00:00.000Z'   # ISO; the only date the schema carries
```

Rule: a *substantive* change is re-testing/correcting a technique, fixing an art fact, reworking a section, or adding internal links — not fixing a typo. Record substantive changes in git; reflect a major refresh by updating `publishedAt`. Do **not** add a `dateModified` field — the schema doesn't have one.

### Signal 6 — First-person experience markers

This is the "Experience" letter in E-E-A-T, added in Google's December 2022 update specifically to push back against AI-generated theoretical content.

Where it applies, mark first-person experience in the prose:

- "I drew this rose with a 2B pencil and a cheap sketchpad — starting from the spiral center kept the petals even, where my earlier attempts went lopsided."
- "When I colored this dinosaur sheet with washable markers, the lines held up; with watercolor it buckled, so I switched to cardstock."
- "I printed the page on US Letter at 'fit to page' and it filled the sheet cleanly — at 100% scale it clipped the edges."
- "I tested both: cold-press paper held the wash better than the copy paper I tried first."
- "I traced the same butterfly twice — once detail-first, once shapes-first — and shapes-first came out far more symmetrical."

Generic prose:
> "A rose is drawn by layering petals around a center."

First-person prose:
> "I drew this rose three times before it clicked — starting from a tight spiral and adding rounded petals outward is what finally made it look like a rose instead of a cabbage."

The second version is the same idea, but it has *experience* in it. Google's HCU classifier is built to detect the difference.

**Constraint:** never fabricate experience. If the technique wasn't actually drawn/tested, don't claim it was. Better to cite a recognized technique reference by name than to invent a fake "I tried this."

### Signal 7 — Named source citations

Every concept, comparison, and explainer post (and any tutorial that asserts an art fact) cites at least two named, authoritative sources for its facts, definitions, and material claims. Full citation:

> Impressionist painters emphasized the play of light with loose, visible brushstrokes rather than fine detail — see the [Tate's definition of Impressionism](URL). (source)

Citation rule: **source + publication + linked reference**. Anything less is contraband.

Go to the primary source — the museum, the manufacturer's spec, the recognized technique reference — wherever possible. Quoting a content-farm blog that paraphrases a museum is two steps removed and is exactly how invented art "facts" spread.

### Signal 8 — Primary-source citations

E-E-A-T's "trustworthiness" letter. The post links to ≥ 3 primary or reputable sources (more for pillars and explainers). Strong sources for art content are:

- **Museums and art institutions** (the Met, MoMA, Tate, the National Gallery) for art history, movements, and works
- **Recognized art-instruction references** and named, credentialed artists for technique and method
- **Art-supply manufacturers' spec sheets** for material facts (pencil grades, paper weight in lb/GSM)
- **Color-theory references** for hue/value/saturation and the color wheel
- **University art-department / institutional `.edu`** teaching pages

What does **not** count as primary:

- Pinterest, generic "art hacks" blogs, and quote-of-the-day-style listicles
- A competitor's "how to draw X" page (test the technique yourself)
- AI-generated summaries
- Reddit, Quora, Medium (useful for audience voice in research — not as a fact source)
- A rights holder's brand site quoted to imply they endorse Scribbloo's fan-art

### Signal 9 — Editorial-standard display

Where the post relies on a tested method, display the standard inline somewhere in the post body:

> "Every step in this tutorial was drawn by hand before publishing, and every art fact here is checked against a museum or a recognized art reference."

This is much stronger than burying the standard in the footer note. The reader sees the editorial rigor in context, where it earns trust for the specific claims.

### Signal 10 — Corrections policy

The site should have a public corrections policy linked from the footer:

> "We fix mistakes in our posts — especially techniques that don't work or facts that are off. If a step gives you trouble or you spot a wrong fact, [reply to us](mailto:...) and we'll fix it. Corrections are noted at the bottom of the affected post with the date and what changed."

The renderer styles plain Markdown via a fixed component map (no custom JSX components). When a post has been corrected, log it in plain markdown at the bottom — a blockquote (the styled answer-box) or a bold "Correction (date):" line:

```markdown
> **Correction (2026-05-10):** This tutorial previously started with petal detail before the basic shapes, which made the rose hard to keep even. The steps now build the spiral center first. Corrected.
```

This is a strong trust signal. Sites that publicly track corrections look serious. Sites that quietly edit look sketchy — and for an instructional site, publishing a technique that doesn't work and silently fixing it is exactly the failure mode readers distrust.

---

## What E-E-A-T is NOT

Common confusions:

- **It is not keyword density.** Stuffing the footer note with keywords doesn't help.
- **It is not link count.** Ten low-quality outbound links hurt more than three primary sources.
- **It is not "AI disclosure".** Google's stated position is that AI use is fine as long as the content is helpful and accurate. Adding "this post was written by AI" doesn't earn or lose ranking by itself. The page either has E-E-A-T or it doesn't.
- **It is not just for YMYL.** This site is not YMYL, but every page benefits from the signals above — and working techniques + true, sourced art facts are the ones that set a coloring-and-drawing site apart.

---

## E-E-A-T audit checklist (run on every post before publish)

### Author / brand signals
- [ ] Visible byline present (default: **Scribbloo**, via `author: null`)
- [ ] About / publisher page exists and is linked (where the convention is in place)
- [ ] Brand editorial note rendered at the post footer
- [ ] Note contains a *specific* claim of relevant editorial standard (tested techniques, checked facts)
- [ ] Author in the `BlogPosting` JSON-LD matches the visible byline (Scribbloo); publisher Organization is Scribbloo

### Accuracy signals (the spine for this site)
- [ ] Every drawing step / coloring tip / print instruction actually works when followed (tested by hand)
- [ ] Every art fact, material property, and color-theory term traces to a museum / reputable reference / manufacturer spec / .edu source
- [ ] Approaches that genuinely vary (cute vs realistic, markers vs watercolor, hot- vs cold-press) are given as honest options with the condition named — not a false single "right way"
- [ ] Any licensed character is handled as fan-art with the disclaimer (no implied official status)

### Kids-safety / materials signals (only if the post recommends supplies for toddlers or classrooms)
- [ ] Non-toxic, age-appropriate materials preferred and stated honestly
- [ ] No small-parts or sharp-tool recommendations for very young children

### Experience signals
- [ ] At least one first-person experience marker in the body (e.g. "I drew this with a 2B pencil and starting from the center kept it even") OR a named technique reference explicitly cited
- [ ] If the author followed a specific method (drew and tested the steps), it is stated inline

### Trust signals
- [ ] `publishedAt` set correctly; currency tracked via git (no `dateModified` field exists — do not add one)
- [ ] ≥ 3 outbound links to primary / reputable sources (more for pillars; museum / reference / manufacturer / .edu preferred)
- [ ] ≥ 2 named source citations with full attribution + linked reference (where the post asserts art facts)
- [ ] Every art fact cited or traceable; every technique tested
- [ ] Corrections policy linked in the footer
- [ ] If the post has been previously corrected, the correction is logged in plain markdown at the bottom

---

## E-E-A-T anti-patterns

These are the easy-to-spot mistakes:

- **Faceless or wrong byline.** "By Admin" → fix by using the brand byline (default: **Scribbloo**, `author: null`)
- **Generic footer note.** "We love coloring" → fix by stating the specific editorial standard (tested techniques, checked facts)
- **Unsourced fact.** "Graphite pencils contain lead" (false) with no source → fix by sourcing it to a manufacturer's material guide and stating the correct fact (graphite is carbon)
- **Broken technique.** Steps that start with fine detail and don't produce the promised drawing → fix by rebuilding the steps foundation-first and re-testing
- **Implied license.** "Official Hello Kitty pages" → fix with fan-style phrasing + disclaimer
- **Stale-date confusion.** Trying to add a `dateModified` field → there isn't one; track currency via git / `publishedAt`
- **AI-only voice.** Zero first-person markers across a 1,200-word tutorial → fix by inserting at least one specific moment of actually drawing/coloring/printing the thing
- **Standards by implication.** Footer says "carefully made" without showing the method → fix by being specific

---

## What to do if there's no named expert author

Scribbloo publishes under its brand, not a tenured art professor — and that's fine. The trust comes from method, not titles.

The footer note should declare Scribbloo's *actual* standard, honestly:

> "Scribbloo isn't a fine-art academy. We're people who got tired of 'how to draw' guides that skip the steps that actually matter, so we draw and test every tutorial by hand before it ships, check every art fact against a museum or a recognized reference, and clearly label fan-style drawings of licensed characters as unofficial."

This honest framing is actually a strong trust signal. It is the AI-slop sites that confidently publish broken techniques and invented art "facts." A brand that draws, tests, and sources its content earns more trust than a fake authority.

For posts that **recommend supplies for young children** specifically, the trust gap is closed not by a credential but by preferring non-toxic, age-appropriate materials and saying so — see the kids-safety guidance above.

---

**blogOS** — pages that earn the ranking they get.
