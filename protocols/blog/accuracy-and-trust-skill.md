---
name: accuracy-and-trust
description: The hard publish gate for Scribbloo. Every load-bearing claim (technique steps, art-history facts, materials behavior, terminology, tool/printing facts) must be correct AND verifiable. Technique steps must actually work — every drawing step must build a recognizable result, and every materials claim ("graphite smudges", "watercolor lifts when wet") must be true. Every factual claim (art history, who painted what, what a medium does, what a term means, paper/printing facts) must be verified against a real authority (a respected art reference, a museum/.edu/.gov page, a manufacturer spec) and cited. Fabricated facts, fake statistics, invented "studies", and false claims of official/licensed status are publish blockers. This is the role quote-attribution played in the original pack.
---

# Accuracy & Trust — The Hard Gate

The internet is full of drawing blogs that botch a step, claim a technique works when it doesn't, repeat an art-history "fact" that drifted three sites ago, or sprinkle in a fake "studies show 73% of kids…" stat to sound authoritative. A coloring-and-drawing site that ships a tutorial whose steps don't actually produce the thing — or that quietly implies it's the official home of a licensed character — is just another thin aggregator, and worse, it sends a hopeful beginner away frustrated. A site whose every step works and whose every claim is true earns the trust, the links, and the rankings.

**The rule: no technique step and no factual claim ships unless it is verified.** Technique steps are verified by reasoning through them to a recognizable result; facts, materials behavior, terminology, and history are verified against an authority. A confident-but-wrong claim is not a small error — it is the one thing this whole site exists to get right: a beginner trusting us, and succeeding.

---

## Two kinds of claim, two ways to verify

### 1. Technique steps → they must actually work

The step-by-step instructions in a tutorial: "start with an oval for the head", "add two curved lines for the petals", "shade the left side darker". A reader follows these in order, expecting a recognizable rose / cat / dinosaur at the end.

- **Source of truth:** established, repeatable drawing technique. The test is whether a beginner following the steps **in the stated order** ends up with the thing the title promises. Steps must build from basic shapes → details, with nothing missing and nothing out of sequence.
- **Trace the steps yourself.** Mentally (or on paper) walk each step and confirm it produces what it claims. "Connect the two circles to form the body" only works if step 1 actually drew two circles in the right place. A step that references a shape that was never drawn is a blocker.
- **Materials behavior must be true.** If a step says "blend with a tissue" or "lift the paint with a damp brush", that has to be how the medium actually behaves (see `materials-and-terminology-skill.md`). Don't promise a result a medium can't give.
- All materials, tool names, grades, and printing terms follow `materials-and-terminology-skill.md` — name them consistently and correctly.

### 2. Facts, history, materials behavior & terminology → an authority wins

Art-history facts (who painted what, when a movement happened), stated properties of a medium ("charcoal is darker than graphite"), definitions of terms (hue vs. value vs. saturation), and printing/paper facts.

- **Acceptable sources:** respected art references and instruction books, museum sites (e.g. major museum collection pages), `.edu` art-department pages, `.gov` references, and manufacturer spec sheets for product facts (paper weight, pencil grades, lightfastness). Wikipedia is a starting point, never a final citation — follow it to the museum page, the reference book, or the manufacturer and cite that.
- **Synthesize and attribute — never copy.** Cite the source inline (and in any sources list the layout renders). "Graphite pencils run from hard (H) to soft (B); softer grades like 6B lay down darker, smudgier lines" with a citation to a manufacturer or art reference beats a confident bare claim.
- Where a fact genuinely varies by convention (paper weight in lb vs. GSM, A4 vs. US Letter sizing), **give both and name the dependency** — don't invent false certainty.

### Trust rule: licensed characters & trademarks

Some high-demand subjects are **licensed characters** (Hello Kitty, Pokémon, Sonic, Bluey, Spider-Man, and similar). These are real search demand, but a false claim of official or licensed status is a trust *and* legal blocker.

- **Never imply official/licensed status.** Don't say "official", "licensed", or "from the makers of". Use descriptive, fan-style phrasing ("fan-art style", "inspired by").
- **Add a light disclaimer** in the intro: *"Not affiliated with or endorsed by the rights holders — these are original fan-style drawings."*
- **Prefer a generic equivalent** where the search intent allows it ("cute kitty", "race car", "blue dog"). When in doubt on a character page, flag it rather than publish.

---

## The verification ladder

Every load-bearing step/claim gets one of four buckets:

| Bucket | Meaning | What to do |
|---|---|---|
| Verified | Step produces the promised result, or the fact/material/term matches an authority | Ship it. Cite the authority for facts, history, and product specs. |
| Range / varies | The value depends on a convention or an unstated choice | Ship it **as a range or as both variants**, and name the dependency ("A4 vs. US Letter", "lb vs. GSM"). Never collapse to a fake single value. |
| Contradicted | A step doesn't produce the result, or the claim contradicts the authority | Correct it. Fix the step order or the wrong fact, then re-check the surrounding instructions. |
| Unverifiable / fabricated | No authority anywhere, an invented stat, a made-up "study", or a false licensed-status claim | Cut it, or replace with a sourced value. Do not ship. |

A post may ship with Verified and Range claims. A post that still contains an unresolved Contradicted or Unverifiable claim **does not ship**.

---

## The verification mechanism

### For technique steps — walk them in order

1. **Read each step in sequence** and picture (or sketch) exactly what it draws.
2. **Confirm continuity:** every shape a later step references was actually created by an earlier step, and the order builds from basic shapes to final details with nothing skipped.
3. **Confirm the result:** following all steps yields the thing the title promises (a recognizable rose, an easy cat, a dinosaur). If a step breaks the chain or the end result wouldn't read as the subject → it's Contradicted; fix the step and re-walk from there.

### For facts, history, materials & terminology — WebSearch / WebFetch an authority

There is no Perplexity or other API pipeline. Use **WebSearch** to locate an authority and **WebFetch** to read the exact fact, then check it. Batch independent lookups where possible.

1. **WebSearch** for the fact at an authority, e.g. `graphite pencil grades H B scale`, `watercolor lifting technique`, `hue value saturation definition site:.edu`, `A4 vs US Letter dimensions`, `Van Gogh Starry Night date museum`.
2. **WebFetch** the authoritative page (a museum collection page, a university art-department note, a manufacturer spec, a respected instruction reference) and read the precise fact or definition.
3. **Compare** the authority's value with the draft:
   - Matches → Verified; add the authority as the citation.
   - Authority gives a range or multiple conventions → Range; carry both into the copy.
   - Contradicts the draft → Contradicted; correct the draft.
   - No credible authority → Unverifiable; cut or replace with a sourced fact.

For technique steps you do not need WebSearch — walk the steps and confirm they build the result.

---

## High-risk claim types (verify with extra care)

- **Step continuity in tutorials** — the most common failure is a step referencing a shape that was never drawn, or steps out of order. Walk every tutorial start to finish and confirm a beginner reaches the promised result.
- **Materials behavior** — "blend graphite with a tortillon", "lift watercolor while wet", "marker bleeds through thin paper". Confirm the medium actually behaves that way before promising the result (cite a manufacturer or instruction reference).
- **Color-theory terminology** — hue vs. value vs. saturation, tint vs. shade, warm vs. cool; state the term precisely and cite an art-education source. Misusing these signals an author who doesn't work in the field.
- **Art-history facts** — who made a work, the date, the movement; never quote from memory; cite a museum/.edu page and state the fact exactly.
- **Printing / paper facts** — paper weight (lb / GSM), page size (A4 / US Letter), "fit to page" behavior, cardstock; these change the reader's print result, so state both unit systems and cite a spec (see `materials-and-terminology-skill.md`).
- **Licensed characters** — never imply official/licensed status; fan-style phrasing + disclaimer, or a generic equivalent (see the trust rule above).
- **Statistics & "studies"** — do not invent numbers ("most kids learn faster when…") or cite studies that don't exist. If you can't source a stat to a real authority, cut it.

---

## How to present verified, ranged, and corrected claims

**Verified (technique step, walked to a result):**
> Start with a light oval for the rose's center, then wrap five soft, overlapping U-shapes around it for the inner petals — those overlapping curves are what make it read as a rose, not a circle.

**Verified (fact, checked against an authority):**
> Graphite pencils are graded from H (hard, light) to B (soft, dark): an HB is the everyday middle, while a **6B** lays down a rich, dark, easily smudged line — handy for shading. (per the pencil maker's grade guide)

**Range / varies (convention-dependent):**
> Print on **US Letter (8.5 × 11 in)** in the US or **A4 (210 × 297 mm)** elsewhere; both work — just choose "fit to page" so the design isn't cropped.

**Corrected (contradicted the draft):**
> Add the cat's ears **after** you've drawn the head circle, not before — placing them first leaves you guessing where the head sits and they end up lopsided.

**Trust (licensed character handled):**
> These are original, fan-style kitty drawings — *not affiliated with or endorsed by the rights holders.* If you'd rather keep it generic, a plain "cute kitty" works just as well and is all yours.

---

## Integration with the write/review pipeline

- **In the writer pass:** run this verification after drafting and before the re-audit. The audit's "Steps & claims verified (N)" block reports every load-bearing step/claim's bucket.
- **In the review pass:** step/claim verification is part of the audit. Any Contradicted/Unverifiable left unresolved blocks the rewrite from overwriting the file.
- **Gate behavior:** if any load-bearing claim ends as Unverifiable (or Contradicted the writer could not resolve against the source of truth), emit the audit with `POST NOT SHIPPED — claims unverified` and do not write the file.

---

## Audit reporting format

```
**Steps & claims verified (N)**
- Verified: "5 steps build a recognizable rose" — walked in order, each step's shapes referenced exist, end result reads as a rose
- Verified: "6B is softer/darker than HB" — pencil-grade reference, cited
- Verified: "hue = the color itself, value = how light/dark" — art-education .edu source, cited
- Range: "print on US Letter or A4, fit to page" — both carried, dependency named
- Contradicted → corrected: "step 4 shaded ears that weren't drawn yet" — reordered ears to step 2
- Unverifiable → cut: "studies show kids who color are 40% calmer" — no real source, removed
- Trust → fixed: "official Pokémon coloring page" — changed to fan-style phrasing + disclaimer
```

---

**Get the steps and the facts right.** It is the one thing the rest of the internet gets wrong, and the reason a beginner who tries our tutorial actually succeeds — and the reason this site deserves to rank.
