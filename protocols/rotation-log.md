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

<!-- New entries appended below by /b-write and /b-review. No entries yet — this is a fresh corpus for the scribbloo.com blogOS pipeline. -->
