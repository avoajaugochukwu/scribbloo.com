# Site Voice Profile — Per-Site Voice Lock for BlogOS

## What it is

A `voice_profile.md` is a per-site (or per-section) artifact that captures **audience-specific voice rules the BlogOS writer must preserve verbatim**. It lives at:

- Single-site setup: `research/voice_profile.md`
- Multi-section setup: `research/voice_profile-<section>.md` (e.g. `voice_profile-tutorials.md`)
- Multi-site monorepo: `sites/<site-slug>/research/voice_profile.md`

It is automatically picked up by `/b-write` as a `CHANNEL VOICE LOCK` block in the writer subagent prompt.

It exists because **BlogOS is generic by design** — anti-AI-slop, scannability cadence, E-E-A-T patterns, conclusion shapes — and the writer subagent runs with zero memory. Without a voice profile, the writer will happily apply generic patterns even when the site has earned a specific voice that the pack would otherwise flatten.

A voice profile is the site's answer to: *"BlogOS, here's what's load-bearing about how this audience hears us. Touch the rest, but not this."*

---

## When to build one

Build a voice profile **only when the site has a non-obvious voice signal** that generic BlogOS would damage. Trigger conditions:

### 1. Demographic outlier
The site's reader base skews materially older, younger, more male, more niche-occupational, more regional, or more sub-cultural than typical web audiences. Generic punch-ups assume a generic audience.

### 2. Comment / email / forum scrape reveals a load-bearing identity frame
Pull the top reader comments, forum posts, or reply emails. Look for:

- First-person statements about why they want the thing ("my 6-year-old wants to draw a unicorn and I can't", "I gave up art in school and want to start again")
- Repeated era / event references (specific cultural moments, styles, or movements the audience anchors to)
- Vocabulary patterns from a specific occupation, fandom, or sub-culture
- Explicit gratitude for a value the site provides ("finally a tutorial that doesn't assume I'm already an artist")
- Frustration arcs the audience shares ("every 'easy' tutorial is actually really hard")

### 3. Existing post performance reveals voice patterns that win
If certain phrasings, framings, or arguments produce significantly higher engagement than others, codify them. If `/b-review` keeps trimming a phrase you keep wanting back, that phrase is voice-locked.

### 4. The site has an explicit editorial stance
If the site takes a recognizable position (a "no skill needed, everyone can draw" stance, a warmth-over-rigor stance), that position needs to be load-bearing in the voice.

**Skip if:** the site is generic / broad-audience with no signature voice. Most general-information sites don't need a voice profile. Sites with a non-obvious demographic skew or a strong editorial voice almost always do.

---

## The canonical structure (6 sections, in order)

A voice profile is short — under 400 lines, often closer to 250. Long enough to be load-bearing, short enough that an orchestrator can inject the whole thing into a subagent prompt without bloat.

### Section 1 — The audience identity sentence

Open with one sentence — the most important sentence in the document — that names the audience as a specific *kind of person*, not a content cohort. Lead with what they are/want/struggle with, not what they read.

**Generic / wrong:**
> "The audience is people interested in drawing."

**Specific / right:**
> "The audience is a parent or teacher at the kitchen table with a restless kid and a single pencil, plus the grown-up beginner who quietly thinks they 'can't draw' — both want a friendly, no-pressure way to make something cute in ten minutes, and both are tired of 'easy' tutorials that turn out to need real skill."

Follow with 3-5 lines quantifying the signal (demographic stats, comment-scrape hit rates, search data) so the claim has receipts.

### Section 2 — The N voice rules

Numbered list. 5-8 rules typically. Each rule:

- **Rule name** in bold (one short phrase)
- 1-2 sentences explaining the mechanic
- One ❌ counter-example and one ✅ exemplar

The rules should cover:

- How to address the reader (peer? curious beginner? parent helping a kid? nervous grown-up?)
- Vocabulary expectations (art jargon assumed / welcomed / kept minimal and defined?)
- Tonal register (warm? playful? encouraging? whimsical?)
- What to validate vs. what to challenge in the reader's existing beliefs ("I can't draw")
- Any explicit "value prop" line the writer should say out loud ("no skill needed", "you've got this")
- Friction points the writer should NOT smooth away

### Section 3 — Canonical reader quotes

8-15 verbatim quotes from comments, emails, reviews, or search queries that show the audience speaking in their own words. With source if available.

These are the receipts: if a future writer or auditor questions whether a voice rule is real, the canonical quote proves it. They also double as in-context examples for the subagent.

### Section 4 — Touchstone library (when applicable)

If the audience anchors against specific shared references, list them with the specific data the writer can drop in.

For a coloring-and-drawing site: the reassuring facts and friendly shortcuts the audience half-remembers or wants to hear (start every drawing from basic shapes — circles, ovals, lines; "if you can draw a circle and a line, you can draw this"; print coloring sheets on cardstock so markers don't bleed; A4 *or* US Letter both work with "fit to page"), and the common discouraging myths to gently correct (the myth that drawing is an inborn "talent" you either have or don't — replace it with "it's a skill that grows with practice"). Dropping a correct, encouraging version of a thing they thought was true is a trust win.

This makes the touchstone-cadence rule actionable rather than abstract. Not every voice profile needs this section — only when there's a "drop a reference to X every N sections" rule.

### Section 5 — Anti-patterns

Two-column table: **Don't / Why**. The phrasings, framings, and patterns that specifically kill *this site's* audience. Generic anti-patterns (em dashes, fake stats) belong in BlogOS, not here. This section lists the site-specific failures.

| Don't | Why |
|---|---|
| Call a tutorial "ultimate" or a technique "pro-level" | The reader came to feel capable, not outclassed. Hype reads as filler and makes a beginner feel behind before they start. |
| Ship a step that doesn't actually work, or skip a step | The reader expects to follow along and succeed. A broken step is the one failure this site can't afford — it confirms the "I can't draw" fear. |
| Imply a licensed character is official ("the official Pokémon page") | False licensed-status is a trust and legal failure. Use fan-style phrasing + a light disclaimer, or a generic equivalent. |

### Section 6 — Whitelist (recommended)

The list of preferred outbound sources for this site. Saves the writer guessing.

For a coloring-and-drawing site:

- Museum collection pages and major art institutions — the gold standard for art-history facts (who made a work, dates, movements)
- University art-department pages (`.edu`) for color theory and technique fundamentals
- The project's own `plan/` briefs and cluster guides — the source of truth for which subjects/keywords each post targets
- Established art-instruction references and manufacturer spec sheets — for materials facts (pencil grades, paper weight in lb / GSM, marker behavior, lightfastness)
- Reputable how-to and art-education sites used only for technique confirmation, never copied

Plus blacklist — content-farm and aggregator pages to NOT cite even when they rank first: Pinterest, generic "drawing tips" content mills, AI-image dumps, and any page that claims official/licensed status for fan content or states a materials "fact" with no primary source. They are where wrong facts and trademark trouble breed.

---

## How it's consumed

`/b-write` picks up the voice profile per post. The orchestrator:

1. Reads the brief
2. Looks for `research/voice_profile.md` (or section-specific variant if multi-section)
3. If found, injects the full file as a `===SITE VOICE LOCK===` block in the writer subagent prompt
4. The subagent treats the lock with the same protection as the factual entity lock — do not paraphrase, do not strip voice-locked language, even when generic BlogOS rules would flag it

Sites without a `voice_profile.md` behave with pack-only writing — no lock, generic voice. The system is opt-in.

---

## How to bootstrap one

Reproducible procedure:

### 1. Reader data first

If you have analytics, pull:
- GA4 audience demographics
- GSC top search queries hitting the site
- Email replies (top 50 from the last 6 months)
- Comments (if the site has them)
- Customer / reader surveys (if any)

For a new site without data: build the profile from the *intended* audience, mark it provisional, and refine after the first 90 days of real reader data.

### 2. Quantify signals

Run pattern passes for:

- Repeated phrasings the audience uses (when describing themselves, their kids, their worries)
- References that come up often (specific characters, styles, occasions like birthdays or rainy days)
- Demographic markers (parent, teacher, grandparent, returning-beginner life stages)
- Frustration markers ("I can't draw...", "this 'easy' tutorial wasn't easy...", "my kid gets bored...")
- Gratitude markers ("Finally someone...", "Thank you for...", "My daughter loved...")

Record hit rates so the profile has receipts.

### 3. Draft the 6 sections

Identity sentence first. Then voice rules. Then quotes. Then touchstones. Then anti-patterns. Then whitelist.

### 4. File at `research/voice_profile.md`

Done. `/b-write` picks it up on the next run.

### 5. Re-scrape quarterly

Audiences drift. The profile should evolve. Re-pull data quarterly and update the profile if signals have shifted.

---

## Multi-section voice profiles

A single site can have different voices in different sections. Example for scribbloo.com:

- `/research/voice_profile.md` — the site-wide default
- `/research/voice_profile-tutorials.md` — voice for "how to draw X" tutorials (step-led, encouraging, hands-on)
- `/research/voice_profile-listicles.md` — voice for "N easy things to draw" idea lists (browsy, fun, momentum-building)
- `/research/voice_profile-collections.md` — voice for coloring-collection landings (parent/teacher-facing, use-case-led)

When a post is in a section with its own voice profile, that profile *overrides* the site-wide one for the relevant rules. The site-wide profile still applies for anything the section profile doesn't address.

The orchestrator looks for the section profile first, then falls back to the site profile.

---

## What NOT to put in a voice profile

- **Factual constraints** about specific topics — those go in the per-post brief
- **Structural rules** (heading skeleton, length, hook formula) — those are BlogOS pack territory
- **Title / meta / slug rules** — those are in `title-meta-slug-skill.md`
- **Generic SEO best practices** — those are in `seo-and-schema-skill.md`
- **One-off editorial decisions** — those go in the relevant skill file if they're load-bearing, or in the per-post brief

A voice profile is exclusively about **phrasings and identity frames the writer would otherwise damage**. If a rule would apply to three different sites' voice profiles, it doesn't belong in a voice profile — it belongs in BlogOS.

---

## Existing voice profiles

- `research/voice_profile.md` — scribbloo.com, site-wide ("Storybook Retro": warm, playful, encouraging, grade-6, US spelling, author byline = the "Scribbloo" brand, not a person).

Add new ones here as they're built.

---

## When to skip voice profiles

For brand-new sites with no audience data yet, the voice profile is provisional. The writer subagent will still inject something useful — it just won't have receipts.

Better to ship 5-10 posts with the pack-only voice, observe what resonates with readers, then build the profile from real signals. Premature voice locking can lock in the writer's idea of the audience rather than the actual audience.

---

**BlogOS** — voice that survives the writer.
