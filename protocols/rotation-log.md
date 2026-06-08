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
