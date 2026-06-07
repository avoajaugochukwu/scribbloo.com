---
name: variety-rotation
description: Anti-repetition rotation system for BlogOS on Scribbloo. Prevents same-y drawing/coloring posts by rotating drawing subjects, content types, difficulty levels, intro patterns, transitions, sub-head phrasings, emphasis types, and conclusion shapes. The writer must pick ONE option from each relevant bank and log selections so the next post avoids the same combo. Originally adapted from FacelessOS, retuned for blog mechanics.
---

# Variety Rotation — every post should feel like its own thing

> Originally created by Joey Sergio for FacelessOS, retuned here for blog posts. Same principle: AI writers default to the same mechanical choices, post after post. Rotation forces variety into the slots where the default is sameness.

**MANDATORY:** Before drafting, consult this file. After drafting, append a rotation log to the audit (NOT to the MDX body — the orchestrator persists the log separately). When the next post is written, pass the last log so the new post avoids the same combo.

If you don't rotate, three consecutive posts on the same site read as templated even if individually each is good — and on a drawing/coloring site, where many posts share a "here's what you need, here are the steps, here's the finished piece" backbone, the risk is acute. Rotation is the antidote.

---

## How the system works

Each post has a set of mechanical slots where the writer defaults to the same choices. This file provides **numbered rotation banks** for each slot — including content-level slots unique to Scribbloo (the drawing subject, the content type, the difficulty level) and the usual prose slots (intro, transitions, conclusions). The writer must:

1. Pick ONE number from each relevant bank per post
2. Never reuse the same combination across consecutive posts on the same site
3. Log selections in the audit (separate from the MDX body)

The orchestrator persists the log to `protocols/rotation-log.md` (one level up from this skill, already created) and feeds it to the next run with: *"Avoid these rotation numbers from the last post: [paste log]"*

---

## SLOT 0A — DRAWING SUBJECT (content-level)

The single biggest "same-y" risk on Scribbloo: every post being about the same kind of thing. Rotate the subject across the corpus so the front page isn't five cat tutorials in a row.

| Code | Subject family | Example topics |
|---|---|---|
| 0A-1 | Animals | cat, dog, horse, butterfly, dragon, fish |
| 0A-2 | Flowers & plants | rose, sunflower, tulip, cactus, leaves |
| 0A-3 | People & faces | a face, cartoon person, eyes, hands, hair |
| 0A-4 | Food & sweets | cupcake, ice cream, pizza, boba, strawberry |
| 0A-5 | Anime / cartoon style | anime eyes, chibi character, manga face |
| 0A-6 | Vehicles & machines | car, rocket, train, plane, truck |

**Rule:** don't publish two posts from the same subject family back to back unless a cluster build calls for it (and even then, vary everything below).

---

## SLOT 0B — CONTENT TYPE (content-level)

Rotate *what kind of post* it is, not just the subject.

| Code | Type | Shape | Lives at |
|---|---|---|---|
| 0B-1 | Tutorial (step-by-step) | supply list → numbered steps → finished piece | `content/blog/<slug>.mdx` |
| 0B-2 | Listicle | "N ideas/things to draw," each with a sample | `content/blog/<slug>.mdx` |
| 0B-3 | Collection / category landing | preview sheets + copy in `seoDetails` frontmatter | `content/categories/<slug>.mdx` (a different route) |

Collections live on the categories route, not the blog route — but they're a content type the writer rotates *into* so the blog corpus isn't all tutorials. Cross-link blog posts to collections via `relatedCategories`.

---

## SLOT 0C — DIFFICULTY / AUDIENCE (content-level)

Rotate who the post is pitched at so the corpus serves the whole audience.

| Code | Level | Voice & scope |
|---|---|---|
| 0C-1 | Kids | super simple shapes, big friendly steps, "ask a grown-up to print this" |
| 0C-2 | Beginner | no skill assumed, light guidelines, encouraging |
| 0C-3 | Intermediate | shading, proportion, color theory touches |

**Rule:** if the last two posts were both beginner-level, push the next one up (intermediate) or down (kids).

---

## SLOT 1 — INTRO PATTERN

The opening paragraph shape. See `BLOG-INTRO-SWIPE.md` for the full patterns. Pick one per post.

| Code | Pattern | Best for |
|---|---|---|
| 1A | Direct Answer | "how to draw X" tutorials, "what supplies do I need" |
| 1B | Cold Open | pillar piece, a story-led drawing guide |
| 1C | Stake-First | comparison ("markers vs colored pencils") decision posts |
| 1D | Contrarian | myth-busting ("you don't need to be 'good at art')") |
| 1E | Story-First | a "the first time my kid drew a dragon" walkthrough |
| 1F | Specific Number | listicles ("40 easy things to draw") |
| 1G | Question Opener | "what's the easiest animal to draw?" explainer |
| 1H | Practical Promise | how-to tutorials |
| 1I | Friction Opener | subjects readers find intimidating (faces, hands, horses) |
| 1J | Cross-Reference | a post inside a larger cluster/hub |

**Rule:** never use the same Slot 1 + Slot 9 (conclusion) combo two posts in a row.

---

## SLOT 2 — CONTEXT BRIDGE (after intro → into the body)

The transition from intro to the first H2's content. Default crutches: *"To understand this, we need to..."*, *"But before we dive in..."*

### Rotation bank (pick one)

**2A — The Specifics Drop**
Jump straight to the most specific thing the body will do.
```
The whole rose starts with one tiny spiral — that's step one.
```

**2B — The Common-Belief Bridge**
Frame the body as a response to what readers usually believe.
```
Most people think you need to draw all the petals at once. You don't. Here's the easier way.
```

**2C — The Personal Bridge**
Use real, warm engagement with the craft.
```
The first time I tried to draw a cat, it looked like a potato. Then I learned the shapes trick.
```

**2D — The Hard Question Bridge**
Lead with the part beginners actually worry about.
```
The part everyone freezes on is the face. So let's start there and make it easy.
```

**2E — The Tradition Bridge**
Anchor the lesson in how artists have always done it.
```
Artists have built figures out of simple shapes for centuries. We're going to do the same.
```

**2F — The Cold Cut**
No bridge. Hard cut from intro to the first H2 with no connector at all.

**2G — The Supply Bridge**
Open with exactly what they need before anything else.
```
Grab a pencil, an eraser, and one sheet of paper. That's the whole kit.
```

**2H — The Stakes Bridge**
Restate what makes this worth doing.
```
The reason this matters: get the basic shape right and everything after it falls into place. Rush it and nothing lines up.
```

---

## SLOT 3 — SUB-HEAD PHRASING

H2s default to label phrasings ("Background", "Section 1", "The first step"). Rotate phrasing across the post.

### Rotation bank (pick at least 3 different styles per post)

**3A — Question H2:** "Why does a cat start with a circle, not the ears?"
**3B — Claim H2:** "Most beginners press too hard on their first lines"
**3C — Specific anchor H2:** "Step 1: a small spiral for the heart of the rose"
**3D — Direct-instruction H2:** "Start with two light ovals for the body"
**3E — Comparison H2:** "Colored pencils vs markers for a beginner rose"
**3F — Number H2:** "Three mistakes that flatten a face drawing"
**3G — Contrarian H2:** "You don't need fancy supplies — here's what actually matters"
**3H — Setup H2:** "What you'll need before you start"  *(use sparingly — but a supply H2 is genuinely useful)*
**3I — Story H2:** "The doodle that finally made dragons click for my kid"

**Rule:** in a post with 5+ H2s, use at least 3 different H2 styles. Mixing styles is itself a quality signal.

---

## SLOT 4 — TRANSITIONS BETWEEN SECTIONS

Default: *"Now let's look at..."*, *"Moving on to..."*, *"Another important aspect is..."*

### Rotation bank (pick one per transition, vary across sections)

**4A — Consequence Cut**
```
Get that shape right and the petals practically draw themselves.
```

**4B — Contrast Cut**
```
The next step looks nothing like the last one.
```

**4C — Question Cut**
```
Which raises the question everyone asks next: [next H2 question].
```

**4D — Specific Detail Cut**
```
Look at where the ears meet the head and you'll see why.
```

**4E — Quiet Cut**
No transition line — just end the section on a warm beat and start the next with a new H2 and a fresh first sentence.

**4F — Foreshadow Cut**
```
This won't fully make sense until you've added the color in the last step.
```

**4G — Reversal Cut**
```
The rule you just read has one exception, and it's where most kids get stuck.
```

**4H — Scope Expansion Cut**
```
Once you can draw one, you can draw a whole garden of them.
```

---

## SLOT 5 — ENCOURAGEMENT / SUPPORT STACKING (when reinforcing a beat)

When a section piles on reassurance or backs up a claim, the default phrasing gets monotonous: *"Don't worry...", "It's also true that..."*

### Rotation bank (pick one per layer)

**5A** — "If yours looks wobbly, that's completely fine — wobbly lines have charm."
**5B** — "The same trick works for a dog, a fox, a bear — any round-faced animal."
**5C** — "Even pro illustrators rough in shapes first; you're doing exactly what they do."
**5D** — "The strongest version of this is the simplest — fewer lines, more confidence."
**5E** — "A heads-up: some people prefer to color first, then outline — both work."
**5F** — "Here's the move stated even plainer: one circle, two triangles, done."
**5G** — "Outside roses, the spiral-then-wrap idea draws tulips and peonies too."
**5H** — "And the proof is in the doing — draw it twice and the second one always looks better."

---

## SLOT 6 — COMMENTARY / VOICE LINES

Personality phrases — the warm Scribbloo voice showing up between steps. Defaults: "It's worth noting that...", "Importantly..."

### Rotation bank (pick 2-4 per post)

**6A** — "Yes, mine looked lopsided the first time too."
**6B** — "[Short warm observation specific to the subject]."
**6C** — "Take a beat and admire it — you made that."  *(use max once per 5 posts)*
**6D** — "Which, once it clicks, you'll never un-see in every rose you draw."
**6E** — "I redrew this one three times so you only have to once."
**6F** — "[Plain-language rephrasing of the tricky step]."
**6G** — "And this is the step where it stops looking like scribbles and starts looking like a cat."
**6H** — "Which is not the same as [common mix-up]."
**6I** — "No skill needed here — promise."
**6J** — "I'd do it a touch differently than most tutorials — [your gentle tweak]."

---

## SLOT 7 — EMPHASIS TYPE

When a section needs pulled emphasis, rotate the type. Note this renderer is **plain Markdown into a fixed MDX component map** — there are no `<Callout>`/`<Tip>` components, and no GFM tables. "Emphasis" means a Markdown blockquote (which renders as the tinted box), a bolded lead line, or a pulled key sentence. Pick the *kind of emphasis*, then render it in Markdown.

### Rotation bank (pick the type that fits)

**7A — Tip:** practical advice, as a blockquote led with **Tip:**
**7B — Warning:** what to avoid (pressing too hard, skipping guidelines), as a blockquote led with **Watch out:**
**7C — Key Takeaway:** the load-bearing single sentence, as a standalone bolded line
**7D — Sidebar:** related context that breaks the main flow, as a blockquote
**7E — Definition:** an inline definition of a term (*value*, *hue*), as a bolded term + plain prose
**7F — Pull Quote:** a sourced fact or warm encouragement pulled out as a blockquote
**7G — Comparison:** a two-line "X vs Y" contrast in prose (NO GFM tables in the body)

**Rule:** not every post needs pulled emphasis. But every post over 1,500 words should have at least one. Remember the answer box itself is a blockquote/tinted box (see the renderer notes) — don't double up with a redundant one right beside it.

---

## SLOT 8 — FAQ BLOCK STYLE (when applicable)

When the post includes a FAQ block at the bottom, the questions and answers can be styled in different ways. All in plain Markdown (H3 questions, prose answers — no components, and note FAQ schema is not auto-emitted).

### Rotation bank

**8A — Plain Q/A:** Question H3, answer paragraph
**8B — Inline question + bolded answer first line + supporting prose**
**8C — Q/A with a linked collection or related tutorial per answer**
**8D — Q/A with "short answer / longer answer" two-paragraph structure**

---

## SLOT 9 — CONCLUSION SHAPE

The final beat before the CTA. Defaults: *"In conclusion..."*, *"To summarize..."*, *"At the end of the day..."*

### Rotation bank (pick one)

**9A — Full Circle**
Reference a detail from the opening and reframe it.
```
That potato-shaped first cat? Look at the one you just drew. Same hands, better cat.
```

**9B — Open Invitation**
Leave the reader with the next thing to try.
```
Now try it with a dog. Same shapes, floppier ears. That's the post after this one.
```

**9C — Quiet Landing**
End on a single warm statement. Let it sit.
```
[Plain, kind closing line — "You drew a rose. That's the whole thing."]
```

**9D — Wider Lens**
Pull out to show what this unlocks beyond the one drawing.
```
[How the shapes-first idea works for almost anything you'll want to draw next.]
```

**9E — Practical Synthesis**
Restate what to do right now.
```
If you want to put this into practice: print a blank sheet and draw three roses in a row.
```

**9F — Honest Acknowledgement**
Acknowledge what the post doesn't cover or where it kept things simple.
```
This is the easy version. The piece on shading a rose takes it further when you're ready.
```

**9G — Specific Recommendation**
Recommend one specific next action or read.
```
The single thing I'd do next is color it in — grab our [Rose Coloring Pages](/coloring-pages/roses).
```

**9H — Restatement of Stakes**
Why this mattered.
```
[Sentence restating why drawing-from-shapes makes everything else easier, in the post's new framing.]
```

---

## ROTATION LOG TEMPLATE

After every post, append this block to the audit (not the MDX body — orchestrator persists it):

```
Rotation Log — <slug> — <date>
- Slot 0A (Subject): 0A-2
- Slot 0B (Content Type): 0B-1
- Slot 0C (Difficulty): 0C-2
- Slot 1 (Intro Pattern): 1H
- Slot 2 (Context Bridge): 2G
- Slot 3 (H2 Phrasing Mix): 3C, 3D, 3F, 3H  (across the H2s)
- Slot 4 (Section Transitions): 4A, 4B, 4D, 4H
- Slot 5 (Encouragement Stacking): 5A, 5C
- Slot 6 (Commentary Lines): 6A, 6G, 6I
- Slot 7 (Emphasis): 7A, 7B
- Slot 8 (FAQ Style): 8C
- Slot 9 (Conclusion): 9G
```

The orchestrator stores the log in `protocols/rotation-log.md` (one level up; already created). The next run reads recent logs and avoids the same combos.

---

## CROSS-POST RULES

1. **Never reuse the Slot 1 + Slot 9 combo** two posts in a row on the same site (these define how the post *feels*).
2. **Never repeat Slot 0A (subject) two posts in a row** unless deliberately building a cluster — and rotate 0B/0C hard if you do.
3. **Slot 4 transitions:** use at least 3 different codes per post AND swap at least one between consecutive posts.
4. **Slot 6 commentary lines:** rotate at least 2 of 3-4 selections between consecutive posts.
5. **Slot 3 sub-head phrasing:** if the last post had a question-heavy H2 mix, the next post should lean claim-heavy or instruction-heavy.
6. **If a slot's options have all been used in the last 3 posts**, force yourself into older options or write a new one in.

---

## CLUSTER-LEVEL VARIETY

On a drawing/coloring site, the sharpest repetition risk is *within a subject or content cluster* — three animal tutorials, or four coloring collections, written back to back land as a template. Extra guard rails by cluster:

- **Animal-tutorial cluster** (cat, dog, horse, butterfly): these almost beg for the identical "circle for the head → ovals for the body → details → color" shape. Force different Slot 1 / Slot 9 combos and at least one different Slot 3 mix between any two animal tutorials. Vary whether the post opens with the finished piece or the first shape, and rotate Slot 0C difficulty.
- **Flower-tutorial cluster** (rose, tulip, sunflower): rotate whether the post opens story-first (1B/1E) or practical-promise (1H), and alternate which leans on shading vs. clean line art.
- **Listicle cluster** ("40 things to draw," "cute drawing ideas," "easy doodles"): these share a "intro promise → numbered ideas → encouraging close" backbone. Rotate the framing of the ideas (by theme, by difficulty, by mood) and the Slot 7 emphasis type so the lists don't all read the same. Rotate the count and the Slot 1 number opener.
- **Coloring-collection cluster** (dinosaur, unicorn, Halloween, ocean): these share a "what's in the set → who it's for → print tips" shape in `seoDetails`. Rotate the audience framing (kids vs. classroom vs. relaxing adult), the seasonal hook, and the order of the print-tips so two collections never read identically.

When two posts in the same cluster ship close together, treat the second as "consecutive" for the cross-post rules even if other posts came between them.

---

## EMERGENCY VARIETY CHECK

If a post STILL feels templated after rotation, scan for these sneaky defaults that no slot fully catches:

| Sneaky default | Fix |
|---|---|
| "The reality is..." | Just state the reality. |
| "In fact..." | Usually unnecessary; delete. |
| "You see..." | Filler. Cut. |
| "Here's the thing:" | AI tell. Rewrite. |
| "At the end of the day..." | Cliché. Use a specific. |
| "Simply draw the shape..." | Tutorial tell. Show the actual shape and where it goes. |
| "It's important to note that..." | Note it without the preamble. |
| "Let's dive in." | Cut. Start with the first shape. |
| "Needless to say..." | If it's needless, don't say it. |
| "Grab your supplies and let's get started!" | Overused tutorial opener. Lead with the first move instead. |

---

## When variety is the wrong move

Variety for variety's sake isn't the goal. Some patterns are best because they fit the archetype:

- **Tutorials almost always start with Pattern 1H (Practical Promise) or 1A (Direct Answer)** — readers came to draw the thing; promise it and start. Rotating to "Cold Open" would lose the snippet and the reader.
- **Listicles almost always start with 1F (Specific Number)** — the count is the hook ("40 easy things to draw").
- **Intimidating subjects (faces, hands, horses) earn 1I (Friction Opener)** — name the fear, then dissolve it.
- **Pillar pieces / story-led guides earn 1B or 1E (Cold Open or Story-First)** — they need narrative pull.

The rotation log catches the *sub-slots* (transitions, commentary, conclusions) more than the structural choices. The structural choices follow archetype — but the **subject (0A), content type (0B), and difficulty (0C) must always rotate** so the corpus stays fresh.

---

**BlogOS** — every post should feel like its own thing.
