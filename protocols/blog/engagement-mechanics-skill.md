---
name: engagement-mechanics
description: Scroll-depth psychology and scannability mechanics for blog posts. This is how a Scribbloo post keeps a skimming reader scrolling and a real reader engaged — through scannability cadence, the But/Therefore rule, the Dopamine Ladder adapted for text, and the four web-specific retention killers. Calibrated for the MDX renderer: the scannability events are the opening blockquote answer, the materials list, the numbered steps, an inline image, lists, sub-headings, and blockquotes — NOT GFM tables, which do not render here.
---

# Engagement Mechanics — keeping the scroll alive

> A blog reader is a different animal from a video viewer. They are skimming first, reading second. They scroll faster than they read. They make stay-or-leave decisions in 8-15 seconds on every screen. Your post has to win the skim test before the read test ever happens.

This is the psychology of retention, mapped onto an MDX page rendered through `<MDXRemote>` with a fixed component map. Same psychology, different surface — and a surface with real constraints (only plain Markdown elements, no custom JSX components, no GFM tables).

---

## The Dopamine Ladder (web version)

Every reader's journey releases increasing dopamine as they progress. The six levels, mapped to blog reality:

### Level 1: STIMULATION (first 0.5 seconds)
- The page loads
- They see the headline, the featured image, the visual rhythm
- Subconscious processing in milliseconds

**For blogs:** the H1 (rendered from frontmatter `title`) + featured image + the visible first lines are the stun gun. If those don't earn 2 more seconds, the reader bounces. On a "How to Draw a Cat" post, the cheerful featured sketch carries half the work before a single word is read.

### Level 2: CAPTIVATION (first 8-15 seconds)
- The reader reads the opening blockquote
- They evaluate: "is this what I came for, and is this going to be easy enough for me?"
- A curiosity gap forms or doesn't

**Trigger:** the opening blockquote answer satisfies them in 40-60 words AND opens a loop they need scrolled to close. On this site the blockquote *is* the answer box — it's the first thing in the body and the styled, tinted break that orients the reader. "You can draw a cat from two circles and a few lines — here's the catch most beginners trip on."

### Level 3: ANTICIPATION (first scroll, ~30 seconds)
- They scan the H2 skeleton
- They form a hypothesis about whether the rest of the post is worth their time
- HIGHEST engagement happens when the H2s preview specific value they didn't expect

**For blogs:** every H2 must promise something specific. "Background" is not a promise. "How to draw the ears so the cat doesn't look like a fox" is.

### Level 4: VALIDATION (every H2 they reach)
- They scan-read or fully read a section
- They get either: a payoff (a step that clearly works) or a setup for the next loop
- Unclosed loops compound — readers who stop mid-tutorial don't return

**Critical:** every H2 should close the loop opened by the previous H2 AND open the next one. Step 3 finishes the head; the last line teases that the body is where most people make the cat too stiff.

### Level 5: AFFECTION (second visit)
- Reader returns to this site for another tutorial or coloring page
- They start to recognize the voice
- Why trust matters — affection requires *someone* to be affectionate toward

**For blogs:** build trust through the warm, encouraging Scribbloo voice, consistency, and reliable delivery on the headline promise — the steps actually work, the drawing actually looks like the thing, and nobody is made to feel clumsy.

### Level 6: REVELATION (bookmark / share / print or color)
- Reader trusts the site as a consistent source of value
- They bookmark it, share a post, or — the real conversion here — print the matching coloring pages or start the next tutorial
- This is what compounds into a real readership

**Action:** every post earns one CTA, usually the link to the matching coloring collection or a related tutorial. See `conclusion-and-cta-skill.md`.

---

## The four web-specific retention killers

### Killer 1: THE WALL OF TEXT

**What it looks like:**
> 1,200 words of unbroken prose, no sub-headings, no lists, no materials list, no inline image, no blockquotes.

**Why it kills:** the skimming reader scrolls past it because they cannot tell what's in it. The reading reader gets lost. A parent looking for a quick draw-along with their kid gives up fast.

**The fix:** every 200-300 words gets a *scannability event* — a sub-head, a bulleted or numbered list, a materials list, an inline image, a worked step, or a blockquote tip. (Note: a GFM pipe table is **not** a usable event here — it renders as raw pipes. If you need to compare options, use a list or prose instead.)

A 1,500-word post should have 5-7 scannability events minimum. Otherwise it reads as undifferentiated mass.

### Killer 2: THE DELAY DISEASE

**What it looks like:**
> "In this article, we will explore the wonderful world of drawing cats, examining the history of feline art, the supplies you might consider, and how to get started. Before we begin, it's important to understand…"

**Why it kills:** the first lines are supposed to *answer the query*, not announce what the article will cover. The reader has 8 seconds; you spent them on a menu.

**The fix:** the opening blockquote IS the direct answer — "A cute cat starts with two shapes: a circle for the head and a soft oval for the body. Add triangle ears, a tail, and two dot eyes, and you're most of the way there. No experience needed." 40-60 words. Then the first H2 with a section worth scrolling for.

### Killer 3: THE CONTEXT DUMP

**What it looks like:**
> H2: "A Brief History of Cats in Art"
> 800 words on Egyptian wall paintings and famous cat portraits — before the post shows a single line of how to draw one.

**Why it kills:** brains cannot store abstract context without anchoring it to a stake. Front-loaded history = mass exit. The reader came to draw, not to read a museum placard.

**The fix:** the Golden Ratio:
- 30 seconds of context maximum at the top
- Followed by the first real step (the basic shapes)
- Context or fun facts show up later, when the reader has motivation to absorb them

For a blog: never let "Background" or "History" be the first H2. Lead with the supplies and the first shapes; backfill the fun stuff only when the reader is already invested.

### Killer 4: THE PAYOFF VOID

**What it looks like:** the reader hits the step they came for, gets a drawing they're happy with, and the post stops being interesting from that point on.

**Why it kills:** there's a 30-second window after each payoff where the reader thinks "got what I came for, leaving now."

**The fix:** within the same paragraph that delivers a payoff, open the next loop:

> "That gives you a perfectly good sitting cat. But if you want it to look *cute* instead of just correct, the trick is all in the eyes — make them big and low on the face, and the whole thing turns adorable."
> [next H2 shows the cute-eyes tweak]

The loop closes, then opens immediately. The reader scrolls to the next H2 to close the new loop.

---

## The But/Therefore rule (still works)

If your transitions between paragraphs and sections read as "and then" — you have boring content. Every transition should be:

- **But** (contrast)
- **However** (contrast)
- **Therefore** (consequence)
- **So** (consequence)
- **Which is why** (consequence)
- A question (open new loop)

If "and then" works, the connection isn't earned. Rewrite with conflict or consequence.

### The test

Read just the first sentence of each new paragraph. Does it follow from the last sentence of the previous paragraph by *contrast* or *consequence*? If half are "And then…" or "Also…", you have a list dressed as an argument.

---

## Sentence rhythm (Gary Provost principle)

Three short sentences in a row is an AI fingerprint. So is a paragraph of identical-length sentences. Vary the rhythm.

**Bad:**
> Draw a circle. Add two ears. Make the eyes big.

**Good:**
> Start with a single circle for the head — that's the whole foundation, so take your time and keep it loose. Add two triangle ears on top. Then drop in the eyes low and wide, because that one choice is what turns a plain cat into the round-cheeked, slightly silly cat that kids actually want to color in.

Mix punchy (5-10 words) with flowing (20-30 words). The post should look jagged on the page, not smooth.

---

## Scannability cadence (the web's rehook)

The rule is one **scannability event every 200-300 words**. On this site the events are the ones that *actually render* through the MDX component map:

- **Sub-head** (H2 or H3)
- **Bulleted or numbered list** — for materials or parallel items, and for the numbered steps of a tutorial
- **The materials list** — pencil, eraser, paper, optional markers, on their own bulleted lines
- **An inline image** — a step photo or sketch, `![alt](/images/blog/<slug>/inline-1.png)`, rendered in a retro frame
- **Blockquote** — the opening answer box, or a tip / "common mistake" callout

What does **not** count as an event on this renderer:

- **GFM pipe tables** — they print as literal `| --- |` pipes. Use a list or prose instead. If a comparison genuinely needs a grid, write it as a tidy list — but reach for a list first.
- **Custom JSX callout components** (`<AnswerBox>`, `<ProTip>`, etc.) — they don't exist in the component map. A callout is a **blockquote** or a **bold lead-in** sentence.

For tutorials, the opening blockquote answer, the materials list, and the numbered steps (each with its own inline step image where possible) are the strongest events — they break the prose visually and reward the skimmer exactly when they're scanning for "just show me how." An 8-step method is 8 visual beats. For listicles, every idea is its own H3 event.

Without a scannability event, the prose becomes wallpaper. The skimming reader scrolls past wallpaper.

### Cadence rules by length

For each band, count only events that render here (blockquote answer, materials list, numbered steps, inline images, lists, sub-heads, tip blockquotes):

| Body length | Minimum scannability events | Distribution |
|---|---|---|
| 300-600 | 3-4 | answer + materials list + first steps minimum |
| 700-1,200 | 4-6 | one every 200-250 words |
| 1,200-2,000 | 6-9 | one every 200-300 words |
| 2,000-2,500 | 9-12 | one every 200-250 words |

(That table above is in this skill *doc*, not in a published post — published posts must not rely on GFM tables.)

---

## The skim-then-read pattern

Realistic reader behavior on a blog post:

1. **Skim H1 + featured image** (1 second)
2. **Read the opening blockquote** (8 seconds)
3. **Skim the H2 list** (5 seconds)
4. **Decide:** scroll to a specific H2 (often "Step 1"), read top-down, or leave
5. **Scan the chosen H2** by reading the first sentence + any bold / list / step image
6. **Read full prose** only after the scan rewards them

Designing for this pattern:

- **First sentence of every paragraph** is the most load-bearing. The skim reader reads only first sentences.
- **First sentence of every H2 section** is the second-most. Often the snippet target.
- **Bold the load-bearing phrase** in each paragraph — gives the skimmer their anchor.
- **Lists for parallel items** — the skimmer counts the supplies or steps without reading prose.
- **The materials list and the step images** are skim magnets — readers scrolling for "just show me the steps" stop on them.
- **H2 phrasing** = the search query they typed, restated as a claim or question.

Posts written for the read-only reader (long prose, no bolds, no lists, no step images) lose the skim reader by paragraph 3.

---

## Stakes escalation across the post

A post should feel like each section is higher-stakes — or more rewarding — than the last, until the wrap-up. The post earns its length by escalating, not flattening.

For a tutorial (e.g., "how to draw a cat easy"):
- H2 1: the simplest version (basic shapes — circle head, oval body)
- H2 2: the most-asked next step (the face — eyes, nose, whiskers)
- H2 3: the surprising tip (why low, wide eyes read as "cute")
- H2 4: the common mistake (making the body too stiff or the ears too small)
- H2 5: the variations (a sleeping cat, a fluffy cat, color ideas)
- Conclusion: what to do with it — and the link to the cat coloring pages

Each H2 takes the reader one step further into a finished, better drawing. The post is "worth scrolling for" because the payoff keeps growing.

For a listicle, escalation is grouping: open with the easiest ideas, build toward the more rewarding or impressive ones, so the reader feels their skill climbing as they scroll.

---

## Pace variety inside sections

Within a section, mix:

- A short setup paragraph (1-3 sentences)
- A longer "here's how and why" paragraph (3-5 sentences)
- A scannability event (list, step image, materials list, tip blockquote)
- A short consequence paragraph ("now your cat has a face")
- A transition that opens the next loop

This rhythm — short → long → visual → short → transition — keeps both the skimmer and the reader engaged. A section that is just five 4-sentence paragraphs is monotone, even if each paragraph is well-written.

---

## The post's emotional arc

Even how-to posts have an emotional arc. Label the intended emotion of each H2 as you outline:

- Curiosity (open the question — "can I really draw this?")
- Reassurance (deliver the simple first step — "yes, it starts with one circle")
- Delight (the tip that makes it look good — the cute-eyes trick)
- Friction (the common mistake everyone makes)
- Resolution (the finished drawing, plus variations)
- Forward momentum (what to do next — color it in, try the next animal)

A post that hits the same emotional note in every section is flat. A post that swings curiosity → reassurance → delight → resolution is alive — and leaves the reader feeling capable, which is the whole Scribbloo promise.

For pillar guides, the arc matters even more. See `narrative-arc-skill.md`.

---

## Read-aloud test

Before publishing, read the post out loud — or have a TTS engine read it. Listen for:

- **Robotic patches:** "It is important to note that…", "It can be observed that…" → rewrite
- **Awkward word sequences** — if it doesn't roll, it doesn't write
- **Identical sentence lengths in a row** — sentence-length variation is rhythm
- **Phrases you would never say to a kid or a friend** → rewrite to how you'd actually say it
- **Where you naturally pause** — those are your paragraph breaks
- **Anything stiff or intimidating** — this is a warm, "you've got this" voice; if a line would scare off a beginner, soften it

It applies just as much to prose written for the eye as to anything spoken.

---

## What kills engagement that anti-AI-slop doesn't catch

- **No scannability events** — the wall of text problem
- **Relying on a GFM table for the visual break** — it renders as pipes; the "event" is invisible
- **No step images** — a draw-along with no pictures is the hardest sell on this site
- **No emotional arc** — the flat report problem
- **No stakes escalation** — every section feels like the same depth
- **All paragraphs same length** — the AI-rhythm problem
- **First sentence of paragraph is generic** — the skimmer loses their anchor
- **H2s phrased as labels not as claims** — "Background" vs "Why the eyes go low on the face"
- **A cold or clinical tone** — beginners and kids need warmth, not a textbook
- **No internal links in the body** — the post feels like a dead end (link the matching coloring collection)

---

## Pre-publish engagement checklist

- [ ] A scannability event every 200-300 words (events that render: blockquote, materials list, numbered steps, inline images, lists, sub-heads — NOT GFM tables)
- [ ] Opening blockquote delivers the answer in 40-60 words
- [ ] First sentence of every paragraph is load-bearing
- [ ] Bold the load-bearing phrase per paragraph
- [ ] H2 phrasing is claim or question, never label
- [ ] Sentence-length variation visible (jagged edge if printed)
- [ ] Stakes / payoff escalate across H2s
- [ ] Each section has a clear emotional beat
- [ ] But/Therefore over And/Then
- [ ] Each loop closes and opens another
- [ ] At least one materials list and (for tutorials) step images present
- [ ] Voice is warm and encouraging — never intimidating
- [ ] Read aloud sounds natural

---

**BlogOS** — engagement is structure plus rhythm.
