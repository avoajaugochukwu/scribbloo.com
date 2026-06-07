---
name: google-trust-audit
description: Pre-publish audit for Google's Helpful Content system, E-E-A-T framework, and spam policies (including scaled content abuse, site reputation abuse, and expired-domain abuse). This skill is the gate between a finished draft and "ready to ship." If the post fails any check here, do not publish. For Scribbloo, an accuracy & trust gate is a first-class check alongside the Google checks: every technique must actually work, every art fact must be true and traceable to a museum/reputable reference/manufacturer, and every licensed character must be handled as fan-art with no implied official status.
---

# Google Trust Audit — the gate before publish

> Google does not ban AI-generated content. It bans content that does not help people. This audit is the difference. Run it on every post.

---

## What the audit covers

Four frameworks:

1. **Helpful Content system** — Google's site-wide signal that judges whether content is people-first or search-engine-first. A single bad post can drag the whole site.
2. **E-E-A-T framework** — Experience, Expertise, Authoritativeness, Trustworthiness.
3. **Accuracy & trust gate** — for this site, every technique in a post must actually work when followed, every art fact (material property, color-theory term, art-history note) must be true and traceable to a museum, a reputable art-instruction reference, an art-supply manufacturer's spec, or a .edu source, and every licensed character must be handled as fan-art with no implied official status. A broken technique, a fabricated fact, or an implied license is a publish blocker. (See `accuracy-and-trust-skill.md` — the trust gate for this site.)
4. **Spam policies** — Scaled content abuse, site reputation abuse, expired-domain abuse, cloaking, sneaky redirects.

If a post passes all four, it's eligible to rank. If a post fails any, it should be revised or killed before publish.

Note on YMYL: a coloring-and-drawing site is **not** YMYL, so the audit does not require a medical-style reviewer. The only real-stakes corners are **kids'-supply safety** (recommending materials for toddlers/classrooms — prefer non-toxic, age-appropriate items) and **licensed characters** (use fan-style phrasing + a light disclaimer, never imply official/licensed status).

---

## Section 1 — Helpful Content audit

The HCU classifier asks (loosely paraphrased from Google's own documentation): *would someone reading this content feel they got what they were looking for, that they trust who wrote it, and that the writer knows the topic well enough to teach it?*

### Helpful Content checks (must pass 8 of 9)

#### Check 1: People-first framing
- [ ] The post is written for someone with a specific need (how to draw a rose, what to color this weekend, easy things to draw with kids), not for a keyword
- [ ] The H1 (from frontmatter `title`) and excerpt describe what the reader will *get* (a rose they can actually draw, a set of free printables), not what the post *covers*
- [ ] The intent (informational, inspirational, get-the-printable) matches what someone typing the target query actually wants

#### Check 2: Unique angle
- [ ] The angle is not the same as the top 3 results on Google for this query
- [ ] The post takes a position, shows a genuinely followable step-by-step, fixes a common beginner mistake, or synthesizes ideas in a way the top 3 do not
- [ ] If the angle is "more comprehensive than competitors," there is genuinely 30%+ more useful information (cute + realistic variations, a real materials list, a matching coloring page), not padding

#### Check 3: First-hand experience
- [ ] At least one first-person experience marker present (the drawing actually drawn, the page actually colored/printed), OR
- [ ] At least one named primary source explicitly cited (a museum, a recognized art-instruction reference, a manufacturer spec)
- [ ] The post does not read as if it could have been written by someone who never picked up a pencil or printed the sheet

#### Check 4: Demonstrated expertise
- [ ] The brand has a displayed editorial standard (the draw-and-test-by-hand + facts-checked-against-a-museum/reference method)
- [ ] Specific, non-obvious knowledge present in the post — the actual step sequence that works, the right pencil grade, the correct print setting, the true art fact

#### Check 5: Satisfying depth
- [ ] The post fully answers the target query without forcing the reader to leave for another page
- [ ] All natural follow-up questions are addressed (either in the body or in an FAQ section)
- [ ] No "we'll cover that in part 2" deferrals on core steps

#### Check 6: Honest claims
- [ ] No exaggerated headline claims that the body doesn't deliver on (a "40 ideas" listicle delivers 40)
- [ ] No "the only drawing guide you'll ever need" framing unless the post genuinely is comprehensive
- [ ] No false certainty — where the result depends on style or materials (cute vs realistic, markers vs watercolor), say so; every technique shown actually works when followed

#### Check 7: Not search-engine-first
- [ ] The post would still be valuable if Google didn't exist
- [ ] Keywords appear naturally in prose, not stuffed into headings, alt text, or paragraphs
- [ ] No "this article will cover" preamble that exists to load keywords into the first paragraph

#### Check 8: Original or value-add to existing information
- [ ] If the post covers a common topic (how to draw a heart, cute things to draw), it adds a genuinely followable method, tested tips, fresh ideas, or unique synthesis
- [ ] Not a reword of a competitor's "how to draw X" page or a content-farm drawing-ideas listicle

#### Check 9: Trust foundations
- [ ] Author byline present (default: **Scribbloo**, via `author: null`)
- [ ] Brand editorial note / About link present
- [ ] Content is current (`publishedAt` set correctly; there is no `dateModified` field — currency is tracked via git)
- [ ] Outbound links to primary / reputable sources
- [ ] No misleading headlines

**Pass threshold:** 8 of 9. Failures on Check 4 or Check 9 are blocking — fix before publish.

---

## Section 2 — E-E-A-T audit

See `eeat-signals-skill.md` for the full discipline. This audit verifies the signals are present.

### E-E-A-T checks (must pass 9 of 10)

#### Experience
- [ ] First-person experience marker present (the drawing drawn, the page colored/printed) or named primary source cited
- [ ] Specific details that suggest real testing (the exact step that keeps it even, the pencil grade that worked, the print setting that filled the page)
- [ ] Materials and terminology are **correct and consistent** — the vocabulary an artist actually uses (HB/2B/6B pencil grades, paper weight in lb and GSM, hue/value/saturation, "fit to page" printing). No sloppy or mixed-up terms.

#### Expertise
- [ ] The brand has a displayed editorial standard relevant to this post
- [ ] At least 2 named source citations if the content type calls for them (waive only for a simple, self-contained tutorial that asserts no art facts)
- [ ] Techniques tested by hand; art facts verified against a museum / reputable reference / manufacturer by the trust pass

#### Authoritativeness
- [ ] Site has an About page linked from the footer
- [ ] The brand / publisher (Scribbloo) is consistent across byline and JSON-LD
- [ ] Site has links from at least 5 other relevant sites (out of scope per post, but the audit notes if the site is new)
- [ ] Internal linking signals topical authority — this post lives in a cluster (tutorial ↔ matching coloring collection ↔ sibling tutorials, via `relatedCategories`/`relatedPages`)

#### Trustworthiness
- [ ] Primary / reputable source citations (≥ 3: museum / reputable reference / manufacturer / .edu where facts are asserted)
- [ ] Content current (`publishedAt` correct; currency via git — no `dateModified` field)
- [ ] Corrections policy linked
- [ ] Honest framing — no clickbait, no false-certainty "one right way"
- [ ] Every technique was tested by hand and every art fact passed the trust gate
- [ ] Any licensed character handled as fan-art with the disclaimer; affiliate links (if any) clearly disclosed
- [ ] Contact / about info reachable from this page

**Pass threshold:** 9 of 10.

### Kids-safety / licensed-character checks (apply ONLY if the post recommends supplies for young children, or features a licensed character)

A coloring-and-drawing site is not YMYL, so these do not apply to most posts. When the topic touches kids' supplies or a trademarked character, all relevant items must pass:

- [ ] Materials recommended for toddlers/classrooms are non-toxic and age-appropriate, stated honestly; no small parts or sharp tools for very young kids
- [ ] Any licensed character (Hello Kitty, Pokémon, Sonic, Bluey…) uses fan-style phrasing ("fan-art style", "inspired by"), never implying official/licensed status
- [ ] A light disclaimer is present on character content: "Not affiliated with or endorsed by the rights holders — these are original fan-style drawings."
- [ ] A generic equivalent is preferred where the intent allows (e.g. "cute kitty", "race car") instead of the trademarked name
- [ ] No copyrighted official character art is reproduced — only original fan-style drawings

---

## Section 3 — Accuracy & trust audit (site-specific gate)

This site's defining failure modes are the technique that doesn't work, the fabricated art "fact", and the fan-art that pretends to be official. This section is a hard gate. See `accuracy-and-trust-skill.md` for the full method.

#### Accuracy & trust checks (must have ZERO unresolved violations)

- [ ] Every drawing step, coloring tip, and print instruction in the post actually works when followed (tested by hand; tutorials build foundation-first — basic shapes and light guidelines before detail)
- [ ] No art fact, material property, color-theory term, or art-history note (a movement's date, a medium's behavior, a pencil grade, a paper weight) is asserted without a museum, reputable reference, manufacturer spec, or .edu source
- [ ] Nothing is fabricated; where practice genuinely varies (cute vs realistic style, markers vs watercolor, hot- vs cold-press paper), both options are given with the condition named — not a false single "right way"
- [ ] All materials and terminology are correct and consistent (pencil grades, lb/GSM, color terms, print settings)
- [ ] Each asserted art fact links to its source (museum, reputable reference, manufacturer, .edu)
- [ ] Every licensed character is handled as fan-art with the disclaimer and no implied official status

#### How to test
Walk the post's headline technique step by step as a beginner would, and confirm it produces the result the post promises. Independently re-check the three highest-stakes art facts against authoritative sources (a museum page, a manufacturer's spec, a recognized reference). Scan for any trademarked character and confirm the fan-style phrasing + disclaimer are present. If any technique fails when followed, any asserted fact comes back unsourced (or wrong) and the post still claims it, or any licensed character implies official status, the post is a **blocking fail** — do not ship.

---

## Section 4 — Spam policy audit

Google's spam policies have evolved sharply with AI. The three most relevant for blog production at scale:

### Scaled content abuse

> "Producing many pages with the primary purpose of manipulating search rankings, regardless of whether the content is created by humans or AI."

#### Scaled content checks (must have ZERO violations)

- [ ] This post is NOT one of many near-identical posts where only the subject word varies — the **template-clone trap** (e.g. 200 near-identical "how to draw X" posts that swap only the animal name, with identical steps and no real, distinct guidance)
- [ ] This post is NOT a template fill-in where only the subject changes between posts (the trap for "how to draw X" tutorials and "X coloring pages" collections — cloned across hundreds with no genuinely distinct steps, tips, or commentary)
- [ ] If we're publishing many tutorials or collections on related subjects, each has genuinely subject-specific steps, a real materials note, tested tips, or fresh ideas
- [ ] Publishing rate is reasonable (not 50 cloned "how to draw" posts/day)
- [ ] No `<h1>` keyword stuffing
- [ ] No paragraph keyword stuffing (target query appears naturally, not 10x per paragraph)

#### How to test
Search 3 random sentences from the post in Google with quotes around them. If they return zero results, that's a unique post. If they return results from other AI-spammy drawing/coloring sites, the post has the same fingerprint as scaled content. Rewrite.

### Site reputation abuse (formerly "parasite SEO")

> "Publishing pages on a third-party site to take advantage of that site's ranking signals."

Not applicable per post — applies if this site has a section that hosts third-party content disconnected from the site's main purpose. Flag in the audit if the post:

- [ ] Is on a topic completely unrelated to coloring, drawing, or the site's themes
- [ ] Was written by a third party (guest post) that the site has no editorial relationship with
- [ ] Exists to drive traffic to an unrelated affiliate offer

A coloring-and-drawing site publishing a post about, say, crypto or unrelated product reviews hits this.

### Expired-domain abuse

Not applicable per post — applies at the domain level. The audit confirms:

- [ ] This site is not built on an expired domain that previously had different content
- [ ] If it is, there is a clear continuity story (acquisition, rebrand) declared publicly

Default: this is not a concern for new domains. Flag only if relevant.

### Cloaking
- [ ] The content shown to crawlers matches the content shown to users
- [ ] No JavaScript that hides text from one and shows it to the other
- [ ] No keyword-stuffed alt text invisible to readers

### Hidden text
- [ ] No white text on white background
- [ ] No tiny-font keywords
- [ ] No off-screen keyword blocks

### Doorway pages
- [ ] This post does not exist purely to funnel into a coloring collection or an affiliate link
- [ ] Each post is genuinely useful as a destination on its own (the tutorial teaches the drawing even before the reader grabs the matching coloring page)

### Link spam
- [ ] No participation in link-trading schemes
- [ ] No purchase of links for ranking
- [ ] Outbound links are editorial, not paid placements (paid get `rel="sponsored"`)
- [ ] Internal links serve readers, not just SEO

---

## Section 5 — AI-content honesty (Google's stance)

Google's published stance (as of 2026): AI-generated content is fine if it is helpful, accurate, and adds value. AI-generated content is contraband if it is scaled, templated, or low-effort.

There is no "AI-generated" disclosure requirement from Google. There is from some industries (legal, regulated finance) and from honesty norms.

**This site's policy:** disclose AI assistance when it materially shaped the content. Example footer line:

> "This post was drafted with AI assistance under Scribbloo's editorial review. Every step was drawn and tested by hand, every art fact checked against a museum or recognized reference, and any licensed character clearly labeled as unofficial fan-style art."

Adding this does not hurt SEO. Not adding it is fine too. What matters is that the post is genuinely helpful, accurate, and — for this site — that the techniques work, the facts are true, and licensed characters are handled honestly.

---

## Section 6 — The audit output

The writer / reviewer outputs the audit as a structured block, separate from the post Markdown:

```
===GOOGLE TRUST AUDIT===

**Helpful Content checks (X/9 passing)**
- ✅ People-first framing
- ✅ Unique angle: <one-line description of the unique angle>
- ✅ First-hand experience: <which marker, e.g. "drew the rose from a spiral center with a 2B pencil">
- ❌ Demonstrated expertise: <what's missing — e.g., "no editorial standard displayed">
- ✅ Satisfying depth
- ✅ Honest claims
- ✅ Not search-engine-first
- ✅ Original value-add
- ✅ Trust foundations

**E-E-A-T checks (X/10 passing)**
- ✅ Experience
- ✅ Expertise
- ⚠️ Authoritativeness: site is < 6 months old, limited inbound links
- ✅ Trustworthiness

**Accuracy & trust checks (X violations)**
- ✅ All techniques tested by hand and work when followed
- ✅ All art facts/material specs/terms sourced to a museum / reputable reference / manufacturer / .edu
- ✅ Options given instead of false certainty where style/materials vary; correct materials & terminology
- ✅ Any licensed character handled as fan-art with disclaimer, no implied official status

**Kids-safety / licensed-character checks (N/A unless kids' supplies or a trademarked character)**
- ✅ Non-toxic, age-appropriate materials; fan-style phrasing + disclaimer present

**Spam policy checks (X violations)**
- ✅ No scaled content / template-clone fingerprint
- ✅ No site reputation abuse
- ✅ No cloaking / hidden text / doorway

**Overall risk level:** [LOW / MEDIUM / HIGH]

**Action required before publish:**
1. <specific fix>
2. <specific fix>
```

The orchestrator presents this to the user. If risk is MEDIUM or HIGH, the user decides whether to ship with the flag or fix. An unresolved accuracy/trust violation — a broken technique, a fabricated fact, or a mishandled trademark — is always HIGH.

---

## Risk-level guide

| Risk | Trigger | Action |
|---|---|---|
| LOW | All HCU + E-E-A-T pass, all techniques tested and working, all art facts sourced, licensed characters handled as fan-art, zero spam violations | Ship |
| MEDIUM | 1-2 HCU/E-E-A-T fails OR 1 spam violation OR site is new | Fix the specific issues, then ship |
| HIGH | 3+ HCU fails OR any technique that doesn't work when followed OR any unsourced/wrong art fact OR a licensed character implying official status OR a kids'-supply post missing safety signals OR multiple spam violations | Do not ship; redo |

---

## What the audit does NOT check

- **Whether the post will rank** — that's a long-term outcome, not an audit gate
- **Whether the writing is "good"** — that's the anti-AI-slop checklist in `blog-os-master.md`
- **Schema validity** — covered by `seo-and-schema-skill.md`
- **Snippet eligibility** — covered by `featured-snippet-skill.md`
- **Internal-link math** — covered by `topical-authority-skill.md`

Each skill checks its own scope. This audit specifically checks Google's published quality + policy guidelines, plus the site's accuracy & trust gate (working techniques, true sourced facts, honest trademark handling).

---

**blogOS** — pass the audit, then ship.
