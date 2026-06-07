---
name: analytics-coaching
description: Read your web analytics and Google Search Console to diagnose post problems on Scribbloo. Replaces FacelessOS's retention-coaching-skill (which read YouTube Studio retention graphs). This is the skill for post-publish optimization — what does it mean when a tutorial has high impressions but low CTR, or high CTR but low time-on-page, or readers who start a step-by-step but never reach the finished drawing, or a listicle quietly losing to a competitor?
---

# Analytics Coaching — diagnose what the post is actually doing

> A post can be perfectly written and still underperform — and the data tells you specifically what's wrong. This skill is how to read your web analytics + Google Search Console and translate the numbers into the specific writing / SEO fix to apply. It is **tool-agnostic**: whatever analytics package the site runs (a privacy-light tool, GA4, server logs, or none yet), the shapes below are read from whatever pageview / engagement signals you have. Don't assume a specific tool is installed.

---

## The two data sources

### Google Search Console (GSC)

Tells you what's happening *in the SERP* before the click:

- Impressions (how many times the post showed up in search results)
- Clicks (how many times someone clicked through)
- CTR (Clicks ÷ Impressions)
- Average position (1-100, where the post ranks for each query)
- Top queries the post ranks for

GSC is the "is the post discoverable and clickable" signal. It's free and should always be connected. (For this niche, also watch Pinterest referrals — a lot of "how to draw" and "coloring pages" traffic arrives from pins, not just Google.)

### Your web analytics

Tells you what's happening *on the page* after the click. Whatever tool you use, the signals that matter are:

- Visitors / pageviews
- Visit duration (average time on page)
- Bounce rate
- Scroll depth (if your tool captures it as an event)
- Outbound / internal clicks — most importantly, the **"opened a coloring collection" or "started a related tutorial" action** (a click from the post to a `relatedCategories` collection or `relatedPages` tutorial), and for tutorials, a **scroll-to-finished-drawing** signal

If the site doesn't have a "clicked through to a coloring collection" event configured yet, set one up — it's the single most useful on-page conversion signal for this corpus (the post's job is to send a reader to a printable or the next lesson). Until then, infer it from outbound-click or next-page data.

Together: GSC tells you whether the post is *found and clicked*. Your analytics tell you whether it *keeps the reader and sends them to a coloring sheet or the next tutorial*.

---

## The five performance shapes

Every published post falls into one of five shapes. Each shape has a specific diagnosis and fix.

### Shape 1: HIGH IMPRESSIONS, LOW CTR (poor SERP attractiveness)

**What you see:**
- GSC: 1,000+ impressions, < 1% CTR, average position 5-15
- The post is being shown to people, but they're clicking competitors instead

**Diagnosis:** the title and/or meta description aren't winning the click. Could also be a SERP feature (an image pack, People Also Ask) eating the click above the organic results — common for "how to draw" and "coloring pages" queries, which are very image-forward.

**Fix:**
1. Search the target query yourself and look at the SERP
2. Read your title and meta description from a searcher's perspective
3. Compare to the top 3 organic results — what are they offering that yours isn't?
4. Iterate on:
   - Front-loading the query in the title ("How to Draw a Rose (Easy, Step by Step)" beats "A Friendly Guide to Floral Sketching")
   - Adding a modifier (Easy, Step by Step, for Kids, for Beginners, Free Printable, [2026])
   - Rewriting the `metaDescription` with warm, active phrasing and a specific promise (the number of steps, "no skill needed," "free to print")
   - Making sure the featured image is a strong, recognizable thumbnail — for image-pack queries the picture wins the click
5. Wait 2-4 weeks. Compare CTR.

**Not the fix:** changing the body of the post. The body is fine — Google ranks it, but the SERP listing isn't winning the click.

### Shape 2: LOW IMPRESSIONS, ANY CTR (poor discoverability)

**What you see:**
- GSC: < 100 impressions per month, average position > 20
- The post isn't ranking high enough to be seen

**Diagnosis:** the post lacks topical authority signals or has technical SEO problems.

**Fix:**
1. Check the topical map — does this post have inbound internal links from siblings in its cluster (other animal tutorials, other coloring collections)?
2. Check the title — is the target query in it?
3. Check the slug — is the target query in it?
4. Check the body — does the target query appear naturally throughout, or only once?
5. Build internal links from 2-3 sibling posts to this one (and set its own `relatedCategories` / `relatedPages`)
6. Verify the post is in the sitemap and indexed (GSC → Coverage); confirm `status: Done`
7. Wait 4-8 weeks. Re-check.

**Not the fix:** rewriting the body before fixing the topical authority and technical SEO.

### Shape 3: HIGH CTR, LOW ENGAGEMENT TIME (the bounce shape)

**What you see:**
- GSC: 2-5% CTR (above average)
- Analytics: visit duration < 30 seconds, bounce rate > 80%
- People click, see the page, and leave fast

**Diagnosis:** the title / description is over-promising or mis-framing what the post delivers — OR, on a tutorial, **the reader can't see they're in the right place fast enough**. They clicked "how to draw a cat easy" and have to scroll past a long intro before they see the supply list, the first step image, or the blockquote answer. They bounce.

**Fix:**
1. Read the title and meta description
2. Read the first thing on the page — is the encouraging direct answer in the **blockquote answer box** at the very top, and is a step image visible within the first screen?
3. If the title promises "easy cat" and the post opens with three paragraphs about the history of cat drawings before any shape, that's the mismatch.
4. Either:
   - Align the title/description to what the post actually delivers
   - Move the payoff up: lead with the blockquote answer ("five steps, just a pencil"), put the supply list and first step image near the top
5. The reader should know within the first screen that this is the easy, do-able tutorial they wanted.

**Not the fix:** assuming the post is "just not what they were looking for" — it is, the payoff is just buried.

### Shape 4: LONG ENGAGEMENT TIME, LOW SCROLL DEPTH (early payoff, no journey)

**What you see:**
- Analytics: visit duration 1-2 minutes
- Scroll-depth event (if captured): most readers stop at 25-40%
- People are reading, but only the top

**Diagnosis:** the top of the post is satisfying — they got the supply list and the first couple of steps — but the rest isn't pulling them to the finish. A tutorial where readers stall at 40% means many never reach the finished drawing; a listicle where they stall means the first few ideas were the only good ones.

**Fix:**
1. Look at the H2 list of the post
2. Are the H2s phrased as claims/questions that *promise specific value* ("The step where it finally looks like a cat") rather than labels ("More steps")?
3. Does the post have an arc (supply list → easy first shapes → the satisfying "now it looks real" moment → finished and colored)?
4. For a listicle, are the strongest, most surprising ideas spread through the list, not all front-loaded?
5. Add a re-hook around 30-40% — a "here's the step everyone gets wrong, and the fix" beat
6. Make sure each step image is light enough to load, so a slow image isn't where readers drop
7. Add internal links so a reader who finishes a section can keep going (to a related tutorial or a coloring sheet of the same subject)

**Not the fix:** writing a longer post. Scroll depth is a quality signal, not a length signal.

### Shape 5: HIGH ENGAGEMENT, HIGH SCROLL DEPTH, NO COLLECTION/TUTORIAL CLICKS (engaged readers don't act)

**What you see:**
- Analytics: 3+ minutes visit duration, 75%+ scroll depth
- "Opened a coloring collection" / "started a related tutorial" action: 0 — they finish the post and leave without printing a sheet or trying the next lesson

**Diagnosis:** the reader is engaged but the CTA isn't right. Could be:
- CTA is too generic ("learn more")
- CTA is buried after a wall of closing text
- The reader has no obvious next step that matches their mood (they just drew a rose — offer to color one, or draw a tulip next)
- The post teaches the drawing but never points to the printable or the next tutorial

**Fix:**
1. Look at the conclusion shape — is the warm close followed by a single specific CTA?
2. Is the CTA descriptive ("Print our Rose Coloring Pages and color the one you just drew") or generic ("see more")?
3. Is a related coloring collection linked *early* — right under the answer, at the moment a reader thinks "I'd love to just color one" — not only at the very bottom?
4. Are `relatedCategories` / `relatedPages` set so the cross-links actually exist?
5. Add or rewrite: a single, specific Markdown link to the matching collection or next tutorial (e.g. `[Rose Coloring Pages](/coloring-pages/roses)`). Plus an internal link at the peak-interest moment.

**Not the fix:** adding three competing CTAs.

---

## The query-level diagnosis (GSC)

Beyond per-post analytics, look at *what queries* each post ranks for.

### Healthy pattern
- Top query matches the post's intended target (from the `plan/` brief)
- 5-10 supporting long-tail queries also rank
- All queries are topically aligned

### Unhealthy patterns

#### Pattern A: Mismatched top query
- The post ranks for a query you didn't target
- It doesn't rank for the query you did target

**Diagnosis:** Google has decided the post is about a different topic than you intended. Either your title/headings are mis-signaling, or the body is genuinely off-topic from your declared target. (Example: a "how to draw a rose" tutorial that ranks for "rose coloring pages" instead — Google read it as a coloring post.)

**Fix:** Either re-align the post (rewrite title/headings/intro to actually target the declared query) or, if the post genuinely serves the other intent better, lean into that — and make sure the right collection or tutorial exists for the original intent.

#### Pattern B: Long-tail without head term
- Post ranks for 20+ specific queries ("how to draw a baby elephant," "how to draw a cartoon elephant")
- Doesn't rank for the main head term ("how to draw an elephant")

**Diagnosis:** the post is a thin cluster competing with a non-existent pillar. The site needs the pillar.

**Fix:** Write the pillar. Link the existing post(s) up to it.

#### Pattern C: Cannibalization / losing to a competitor
- Two posts on the same site rank for the same query, both poorly (e.g. two "easy things to draw" listicles), OR your listicle is steadily losing position to a competitor's stronger one
- Neither of yours hits position 1-5; both float around 10-30

**Diagnosis:** duplicate intent diluting each other, or a single post that's been out-classed by a fresher, more complete competitor.

**Fix:** If it's two of your own, merge them (see `update-discipline-skill.md`) — pick the stronger as survivor, redirect the other. If you're losing to a competitor, study their post: more ideas, better sample images per item, clearer steps, fresher entries — then do a substantive refresh that beats it.

---

## Tracking the right metrics

You don't need 50 metrics. The five that matter:

| Metric | Where | Target |
|---|---|---|
| **Impressions** | GSC, last 28 days | Growing month over month |
| **CTR** | GSC, last 28 days | > 2% on average; > 5% on top posts |
| **Average position** | GSC, last 28 days | < 15 within 6 months of publish; < 10 within 12 |
| **Visit duration** | Your analytics | > 90 seconds on tutorials/listicles; > 3 min on pillars |
| **Collection/tutorial-click rate** | Your analytics (custom action) | Site-specific — track the trend (the core conversion: post → printable or next lesson) |

Set up GSC alerts for:
- Posts dropping > 50% impressions month-over-month (something broke)
- Posts dropping > 20% CTR month-over-month (SERP competition changed)
- Sudden new high-impression query (an opportunity to update the post to capture more)
- A seasonal post climbing (its season is arriving — make sure it's freshened)

---

## When to update vs leave alone

GSC + your analytics tell you which posts deserve attention:

| Signal | Action |
|---|---|
| Post is ranking #1-3 + good CTR + good engagement | Leave alone. Don't touch a winner. |
| Post is ranking #5-15 + good CTR + good engagement | Update lightly — refresh a few listicle ideas, add a step image, link a new collection. |
| Post is ranking #15-30 + decent CTR + okay engagement | Substantive update — new sections/ideas, better internal linking, surface the collection link earlier. |
| Post is ranking > 30 + low CTR + low engagement | Question whether to rewrite, replace, or sunset. |
| Post is ranking #1-3 + good CTR + low engagement | The opening is right but the body is failing. Rewrite the middle — spread the strong ideas, add a re-hook. |
| Post is ranking #5-15 + low CTR + low engagement | Title / `metaDescription` rewrite. The post itself might be fine. |

See `update-discipline-skill.md` for the full update / replace / sunset decision tree.

---

## The monthly analytics rhythm

A reasonable cadence for a site of 30-100 posts:

### Weekly (5 min)
- Glance at GSC top performers and top decliners (and Pinterest referrals)
- Note any post with a sudden 50%+ change

### Monthly (45 min)
- Review every post's impressions / CTR / visit duration / collection-click rate
- Triage: leave / light update / substantive update / replace / sunset
- For each substantive update, schedule the work
- Flag any seasonal post whose season is within 6 weeks

### Quarterly (3 hours)
- Topical map review — are clusters (animals, flowers, listicles, coloring collections) healthy?
- Pillar refresh — are pillars still ranking? Do they need new sections?
- Stale post audit — anything ranking poorly or losing to a competitor that should be refreshed or retired

### Annually
- Full corpus audit — every post checked against the freshness model
- Voice profile updated based on the year's audience signals (if voice profiles are present)
- Topical map redrawn if site direction has shifted

---

## What the data does NOT tell you

Some things analytics can't measure:

- Whether the post is *good* — only whether it's engaged with
- Whether the post is *trustworthy* — only whether it's clicked
- Whether the steps actually *work* — no analytics tool can catch a tutorial whose steps don't lead to the drawing; only following the steps yourself can (see `accuracy-and-trust-skill.md`)
- Whether a licensed character is implied as official — only a content review catches that
- Whether the post is *helpful* — visit duration is a proxy, not a measure
- Whether the post will rank *next month* — past performance isn't future ranking

So: read the data, but also read the post. The data is a flashlight on what's happening, not the judgment of what to do.

---

## Pre-update analytics checklist

Before deciding to update a post, check:

- [ ] What's the current impression count?
- [ ] What's the current CTR?
- [ ] What's the average position for the target query?
- [ ] What other queries does the post rank for?
- [ ] What's the visit duration?
- [ ] What's the scroll depth (if available)? For tutorials, do readers reach the finished drawing?
- [ ] What's the collection/tutorial-click rate for this post?
- [ ] How are Pinterest / referral sources trending?
- [ ] What changed in the last 28 days?

Then decide which of the five shapes the post is in, and apply the matching fix.

---

**BlogOS** — read the data, then read the post.
