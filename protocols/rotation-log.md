# Rotation Log — scribbloo.com

Append-only log of the variety-rotation slot picks used by each `/b-write` and `/b-review` run. The next run reads the recent entries and avoids repeating the same intro pattern, context bridge, and conclusion shape — so a reader browsing several "how to draw" posts or "things to draw" listicles doesn't feel like they're reading the same article with the subject swapped. See `protocols/blog/variety-rotation-skill.md` for the slot definitions.

Track variety across the content slots that matter for scribbloo:

- **Drawing subject** (rose, cat, dinosaur, unicorn, anime eyes, butterfly…) — don't cluster the same subject family back-to-back.
- **Content type / archetype** (✏️ tutorial · 📝 listicle · 📂 coloring collection · 🛠️ tool landing).
- **Intro pattern** (the opening hook before the first blockquote answer box).

Format per entry:

```
## <slug> — <YYYY-MM-DD> — <archetype>
- Slot 1 (intro pattern): <code>
- Slot 2 (specifics drop): <code>
- Slot 3 (H2 phrasing): <codes>
- Slot 4 (transitions): <codes>
- Slot 6 (scannability device): <codes>
- Slot 7 (evidence type): <codes>
- Slot 8 (conclusion shape): <code>
- Slot 9 (CTA): <code>
```

---

<!-- New entries appended below by /b-write and /b-review. -->

## how-to-turn-photos-into-coloring-pages — 2026-06-08 — 🛠️ tool landing / how-to hybrid
- Slot 1 (intro pattern): capability-reassurance ("if you can take a screenshot, you can do this")
- Slot 2 (specifics drop): converter / app / trace-by-hand three-method fan-out
- Slot 3 (H2 phrasing): "Why turn a photo into a coloring page?", "3 easy ways to turn a photo into a coloring page", "How to pick a photo that turns out well", "Printing and sharing your coloring page"
- Slot 4 (transitions): consequence (so/since), contrast (but)
- Slot 6 (scannability device): numbered method steps + bold lead-in tips + bulleted photo/print checklists
- Slot 7 (evidence type): cited RCTs (coloring/anxiety), verified print specs (300 DPI, lb/GSM, A4/US Letter), tool-behavior recon
- Slot 8 (conclusion shape): 9E Practical Synthesis (pick clearest photo, convert/trace, print on heavier paper)
- Slot 9 (CTA): single link to /coloring-pages browse hub

## unicorn-activities-for-kids — 2026-06-08 — 📝 listicle (deep b-review)
- Slot 1 (intro pattern): question-led answer blockquote ("Looking for unicorn activities for kids?")
- Slot 2 (specifics drop): four-group sort (printables/crafts/games/learning) + age callouts + April 9 National Unicorn Day hook
- Slot 3 (H2 phrasing): grouped-category headings ("Printable unicorn fun", "Crafty unicorn creations", "Unicorn party games", "Unicorn learning activities", "Tips for a magical unicorn day")
- Slot 4 (transitions): consequence/contrast bridges, no "and then"
- Slot 6 (scannability device): numbered H3 activities (1–15) + bulleted supply/tips lists + answer blockquote
- Slot 7 (evidence type): cited facts (National Day Calendar for April 9; Kids Activities Blog for borax-free slime activator chemistry); publisher links for books
- Slot 8 (conclusion shape): 9E Practical Synthesis ("pick one from each group = a whole unicorn day")
- Slot 9 (CTA): single collection CTA to /coloring-pages/fantasy/unicorn (print + color to kick off)

## b-review 2026-06-08 — how-to-draw/hibiscus + how-to-draw/star (adversarial quote audit)

### hibiscus.mdx — PASS (after fixes)
- Betty Edwards "draw what you see, not what you know" — CUT/REPLACED. Paraphrase of her method passed off as a verbatim quote; not found verbatim, only on quote-aggregators. Replaced with verified verbatim quote "drawing teaches accurate perception—how to see what is really 'out there'" (source: drawright.com official interview) + her sourced "a teachable, learnable skill" line.
- Picasso "Inspiration exists, but it has to find you working" via Brassaï's *Conversations with Picasso* — CUT. Brassaï source fabricated; Wikiquote lists the line only under weak posthumous secondary attribution, not Brassaï. Replaced closing with the verified Edwards encouragement instead.
- Removed unverifiable in-quote "always come back and modify the shape" attributed to the Sketch Club video; softened "Curtis Mr. T" personal name to the verified channel "The Sketch Club" (channel confirmed, instructor name unverifiable).
- Citations kept-verified: JeyRam (verbatim guide-circle), Xencelabs (verbatim center+5 petals), Sketch Club video (confirmed hibiscus step-by-step). Steps walk foundation-first and produce the flower. steps.webp present. Internal links resolve.

### star.mdx — PASS (after fixes)
- Kenneth Clark "you can only learn to draw by drawing" via *Landscape into Art* — CUT. Not in the book; no verifiable attribution (real adjacent quotes are Loomis/Pissarro). Replaced with verified Andrew Loomis *Fun With a Pencil*: start with a "form," then "build your final lines in by selecting, eliminating the lines you do not use" (Internet Archive source).
- Ruskin "learn to look at nature, and you will soon learn to draw" via *The Elements of Drawing* — REPLACED. Not in the book and reverses Ruskin's actual emphasis. Swapped for the verified verbatim line from the same book (Preface §xv, Gutenberg): "the best answerer of questions is perseverance; and the best drawing-masters are the woods and hills."
- 5-point star method re-walked: dot order 12→5→10→2→7→12 is the correct pentagram skip-one traversal; one-stroke section matches. Correct.
- Citations kept-verified: Skillshare (verbatim light-pressure + dots/erase advice), Bert Dodson *Keys to Drawing* (real book, paraphrase). steps.webp present. Internal links resolve.
- npm run validate: 0 errors, 0 warnings.

## b-review 2026-06-08 — how-to-draw/flower + how-to-draw/tree (adversarial quote audit)

### flower.mdx — PASS (after fixes)
- Sarah Simblet "where the petals all connect in the middle of the flower is more important than getting their edges in the right place" — REPLACED. Quote is real but traces only to a YouTube video (RHS/Chelsea Flower Show "How to Draw Flowers"), not to *Botany for the Artist*; channel could not be verified as an official primary publication, and the body carried no link. Swapped for an attributed paraphrase of the verified, on-page Draw Botanical guidance (petals radiate from the center) — same teaching point, real linked source.
- Fixed "the school run by botanical artist Wendy Hollender" → "the online school founded by botanical artist Wendy Hollender" (drawbotanical.com confirms Hollender as founder, not sole operator).
- Citations kept-verified: Draw Botanical / Wendy Hollender (verbatim "observe the flower's structure carefully" + "What basic shape does it suggest?" + repeat-the-same-flower line, all confirmed on-page); Michaela Jean (both quotes confirmed verbatim on michaelajeanart.com); Artists Network / Lee Hammond (hard-cartoon-outline → soften-edge advice confirmed). Steps walk foundation-first (center circle → guide ring → petals → details) and produce a flower. steps.webp present under the step-by-step H2. Internal links resolve (/coloring-pages/nature, /drawing-ideas/flower, /how-to-draw/rose, /how-to-draw/tree).

### tree.mdx — PASS (after fixes)
- Edgar Degas "drawing is not what one sees but what one can make others see" — CUT. Paraphrase traceable only to quote-aggregators (Goodreads/AZQuotes), no documented primary source, AND mis-cited to a John Muir Laws YouTube URL that has nothing to do with Degas (double contraband). Replaced with the verified Kimon Nicolaïdes line "The first function of an art student is to observe, to study nature." from *The Natural Way to Draw* (recognized instruction reference; linked to Internet Archive copy).
- John Muir Laws "feel like this sort of lollipop flat thing" — DE-QUOTED. "lightly, loosely" is confirmed verbatim in the video (~21:44) and kept; but the "lollipop flat thing" wording is NOT in that transcript. Converted to attributed paraphrase (no quote marks around words he didn't say), still crediting his tree-drawing workshop.
- Citations kept-verified: John Muir Laws "lightly, loosely" (verbatim, confirmed); Nicolaïdes (replacement, verified verbatim via The Natural Way to Draw quote set). Steps walk foundation-first (trunk → main branches → smaller branches → roots → foliage clumps → texture → shade) and produce a tree. steps.webp present under the step-by-step H2. Internal links resolve (/coloring-pages/nature, /drawing-ideas/things-to-draw, /how-to-draw/flower, /how-to-draw/rose).
- npm run validate: 0 errors, 0 warnings.

## b-review 2026-06-08 — how-to-draw/landscape + how-to-draw/earth (adversarial quote audit)

### landscape.mdx — PASS (after fixes)
- Betty Edwards "Drawing is not really very difficult. Seeing is the problem..." — KEPT-VERIFIED, wording corrected. Confirmed verbatim against the book PDF (Internet Archive copy of *The New Drawing on the Right Side of the Brain*). The draft's tail "or more properly, shifting to a particular way of seeing" was wrong; book reads "or, to be more specific, shifting to a particular way of seeing." Fixed to match.
- Andrew Loomis "The beginner must be content to start with the simplest exercises. There is no short cut to sound draughtsmanship." (*Fun With a Pencil*) — CUT (FABRICATED). Not in the book (full-text search of the Alex Hays PDF) and unfindable anywhere on the web; book's actual beginner language is about caricature/fun and the sphere-cube-egg forms. Replaced with a verified verbatim Loomis line from the same book: "Every form is like some simpler form, with this or that variation, and with pieces added on." (linked to the full-text PDF).
- Tom McPherson (×2), Orla Stevens, Claudia Nice — DE-QUOTED. All four were direct quotes in quotation marks sourced only to YouTube videos (cardinal-sin risk). Converted to attributed paraphrases of each teacher's method; named teacher + video link retained as a real reference, no unverifiable verbatim claims.
- Technique re-walked: horizon line → background → midground → foreground path (narrowing for depth) → foreground details → atmospheric shading → ink/clean → color. Foundation-first; teaches horizon + fore/mid/background. steps.webp present under the step-by-step H2. Internal links resolve (/coloring-pages/nature, /drawing-ideas/aesthetic, /how-to-draw/tree, /how-to-draw/flower).

### earth.mdx — PASS (after fixes)
- Betty Edwards "Learn to draw what you see, not what you think you see." (*Drawing on the Right Side of the Brain*) — REPLACED (FABRICATED). Not verbatim in the book; only "On believing what you think you see" exists as a section heading. Replaced with verified verbatim Edwards: she describes the goal as learning "to set your symbol system aside and accurately draw what you see."
- Betty Edwards "make your first marks very light and tentative, so that you can change them easily as you search for correct relationships." — REPLACED (FABRICATED). No such sentence in the book; the constituent phrases do not co-occur. De-quoted to an attributed paraphrase of her real method ("just barely indicate placement of the first marks," "search for correct relationships" appear separately in the text) — no fabricated verbatim claim.
- Kathy Barbro / Art Projects for Kids "Draw a circle or trace one." — KEPT-VERIFIED. Confirmed verbatim as Step 1 on artprojectsforkids.org/how-to-draw-the-earth/ (live, Tier-2 instruction source).
- Chiki Doodle — DE-QUOTED. The in-step quote was sourced only to a YouTube video; converted to attributed paraphrase (named teacher + link kept).
- Technique re-walked: circle guide → light continents → place 1-2 land masses → coastline details → ink/clean → light & shadow crescent (roundness) → color. Foundation-first; teaches circle + continents + light/shadow. steps.webp present under the step-by-step H2. Internal links resolve (/coloring-pages/nature, /drawing-ideas/cool, /how-to-draw/star, /how-to-draw/tree).
- npm run validate: 0 errors, 0 warnings.
