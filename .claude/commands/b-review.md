---
description: Adversarial audit + fix of an existing Scribbloo page — verifies grounding, working steps, links, images; refuses to pass thin content.
argument-hint: <slug or content path, e.g. cat or content/how-to-draw/cat.mdx>
---

# /b-review — adversarial trust + quality audit

Resolve `$ARGUMENTS` to its MDX file, audit it against the full BlogOS pack, **fix issues in place**,
and report a verdict. **Refuse to pass** if a broken step, an unverifiable claim, a fabricated quote,
or thin content remains. Be skeptical — assume the draft is wrong until proven otherwise.

## 1. Re-walk the technique
Walk every drawing step in order as a beginner would. The result must actually produce the promised
drawing, foundation-first (light guides → basic shapes → details). A tutorial that starts with fine
detail or skips the construction shapes is **broken → blocker** (`accuracy-and-trust-skill.md`).

## 2. Re-verify every source and quote (the cardinal-sin check)
For each claim, stat, and quote (`research-and-citation-skill.md`):
- **Quotes:** confirm the person is real and actually said it. Re-check with
  `npm run research -- "<the quote or subject>"` and/or WebFetch the cited page. A quote you cannot
  verify, or that is commonly **misattributed**, → cut it or replace with a verified one. No exceptions.
- **Facts/tips:** each load-bearing claim links to a real Tier-1/2 source (museum, established
  instruction reference, art-supply spec, named educator). A claim sourced only to a content farm or
  with no link → fix or cut.
- **Citation count** meets the type minimum (tutorial 2–5, listicle/pillar 4–8).
- **Trademark:** licensed characters use fan-style phrasing + disclaimer, never implied endorsement.

## 3. Anti-thin / depth check
- Real, specific, non-obvious value beyond what 10 other pages already say (the variety angle from
  `variety-rotation-skill.md` is present, not a subject-swap of a sibling post).
- Hits the type's word-count floor with substance, not padding. FAQ answers the query in the first line.
- Primary keyword in title + H1 + first 100 words + meta; secondary keywords natural, not stuffed.

## 4. Links + images
- 3–6 internal links, **canonical paths only** (no aliases / `page/N` / 404s), descriptive anchors.
- The matching coloring collection is linked **bidirectionally**; the relevant `/drawing-ideas`
  listicle and 2–3 siblings are linked. Verify each target file/dir actually exists.
- Hero (`featuredImage`) present; tutorials embed the **process strip** (`steps.webp`) and its stages
  match the written steps. Alt text is descriptive.

## 5. Fix + verify
Patch issues in place (literal swaps; don't reorganize during verification). Then run `npm run validate`
and confirm the page still builds. Append the review to `protocols/rotation-log.md`.

## Verdict
Report: **PASS** (all gates green) or **BLOCKED** with the exact failing items. Never report PASS with a
broken step, an unverifiable/fabricated quote, a missing process image, or thin content outstanding.
