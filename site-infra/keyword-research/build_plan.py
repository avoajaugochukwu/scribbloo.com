#!/usr/bin/env python3
"""Turn the merged keyword set into a /plan folder of MD content briefs an AI agent can batch-write."""
import csv, re, json, pathlib, glob
from collections import defaultdict

KR = pathlib.Path(__file__).parent
SITE = KR.parent.parent
PLAN = SITE / "plan"
PLAN.mkdir(exist_ok=True)

FIXUPS = [("pok mon","pokemon"),("pokémon","pokemon"),("k pop","kpop"),("spider man","spiderman"),
          ("hello kitty","hellokitty")]  # keep multiword entities intact through tokenization
UNFIX = {"hellokitty":"hello kitty","spiderman":"spider-man"}  # restore for display
rows = list(csv.DictReader(open(KR / "MASTER_keywords.csv")))
for r in rows:
    k = r["keyword"].lower()
    for a,b in FIXUPS: k = k.replace(a,b)
    r["keyword"] = k
    r["v"] = int(r["search_volume"] or 0)
    r["kd"] = int(r["kd"]) if r["kd"] not in ("", None) else None

# ---------- existing content (for status) ----------
GENERIC = {"coloring","colouring","color","colour","pages","page","book","sheet","sheets","how","to",
           "draw","drawing","drawings","a","an","the","for","of","and","with","ideas","idea","easy",
           "cute","free","printable","things","to","step","by","beginners","kids","in","out","print"}
existing = set()
for p in glob.glob(str(SITE / "content/**/*.mdx"), recursive=True):
    existing.add(pathlib.Path(p).stem)
def have(slug):
    toks = set(slug.split("-")) - GENERIC          # ignore generic words when matching
    if not toks: return None
    for s in existing:
        st = set(s.split("-")) - GENERIC
        if toks & st and (toks <= st or st <= toks or len(toks & st) >= 2):
            return s
    return None

def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
NO_SING = {"christmas","xmas","dinosaurs","lotus","cactus","octopus","series","news"}
def sing(t):
    if t in NO_SING or len(t) <= 3: return t
    if t.endswith("ies"): return t[:-3] + "y"          # butterflies -> butterfly
    if t.endswith(("ches","shes","sses","xes","zes")): return t[:-2]
    if t.endswith("s") and not t.endswith(("ss","us","is","as","os")): return t[:-1]
    return t
# truncations / split artifacts / non-subjects to drop
BLOCK_SUBJ = {"ch","pop","out","up","printed","the","your","own","basic","really","more","color",
              "draw","drawing","print","new","old","big","small","good","best","real","easy","cute",
              "man","page","fre","colour","coloring","kpop"}
def d(s):  # restore display form of merged entities
    for a,b in UNFIX.items(): s = re.sub(rf"\b{a}\b", b, s)
    return s
def title(s):
    s = d(s)
    small = {"a","an","the","of","for","to","and","with","in"}
    ws = s.split()
    return " ".join(w if (w in small and i) else w.capitalize() for i,w in enumerate(ws))

# ---------- classify + extract page key ----------
TOOL_HINTS = ["generator","maker","creator"," convert","converter","photo to color","turn photo",
              "picture to color","photo into color","make your own color","create color","ai color","from photo"]
COLOR_STRIP = {"coloring","colouring","color","colour","pages","page","book","books","sheet","sheets",
               "printable","free","pdf","online","print","printout","printouts","printing","to","for",
               "the","a","an","of","and","with","in","out","color","colors"}
TUT_STRIP = {"how","to","draw","drawing","a","an","the","easy","step","by","for","beginners","beginner",
             "and","of","with","tutorial","simple"}
AUD = {"kids":"for Kids","adults":"for Adults","toddlers":"for Toddlers","toddler":"for Toddlers",
       "preschool":"for Preschoolers","boys":"for Boys","girls":"for Girls","teens":"for Teens"}
FMT = {"adults":"for Adults","adult":"for Adults","kids":"for Kids","kid":"for Kids",
       "printable":"Free Printable","free":"Free Printable","pdf":"PDF","online":"Online"}
MODS = ["easy","cute","cool","simple","aesthetic","kawaii","anime","cottagecore","beautiful",
        "fun","small","mini","random","sad","scary","creepy","detailed",
        "for kids","for beginners","for girls","for boys","for adults",
        "christmas","halloween","fall","autumn","winter","summer","spring","valentine","thanksgiving",
        "flower","animal","food","heart","space","ocean","nature"]

SUBJ_NOISE = {"ideas","idea","best","top","new","good","simple","my","you","your","really","very",
              "super","pictures","picture","images","image","of","to","color","colour","really",
              "print","printable","free","online","pdf","cute","easy","cool","sheet","sheets"}
def clean_subj(subj):
    toks = [t for t in subj.split() if t and t not in SUBJ_NOISE and t.isalpha() and len(t) > 1]
    dedup = [t for i,t in enumerate(toks) if i == 0 or t != toks[i-1]]   # drop "cat cat"
    return " ".join(dedup[:3]).strip()

def classify(kw):
    k = kw.lower()
    if any(h in k for h in TOOL_HINTS):
        if "photo" in k or "picture" in k: return ("tool", "photo to coloring page")
        if "ai" in k.split(): return ("tool", "ai coloring page generator")
        if "maker" in k: return ("tool", "coloring page maker")
        return ("tool", "coloring page generator")
    if "color" in k or "colour" in k:
        toks = [sing(t) for t in re.findall(r"[a-z0-9]+", k) if t not in COLOR_STRIP and t not in AUD]
        subj = " ".join(toks).strip()
        if subj:
            return ("coloring", subj)
        # no subject -> format/audience landing
        for key,lab in FMT.items():
            if re.search(rf"\b{key}\b", k): return ("coloring_landing", lab)
        return ("coloring_landing", "Free Printable")
    if "how to" in k and "draw" in k:
        toks = [sing(t) for t in re.findall(r"[a-z0-9]+", k) if t not in TUT_STRIP]
        subj = " ".join(toks).strip()
        return ("tutorial", subj) if subj else None
    if any(t in k for t in ["drawing idea","things to draw","what to draw","sketch idea","doodle",
                            "art idea","cute drawing","easy drawing","cool drawing","drawings"]):
        mod = next((m for m in MODS if m in k), "")
        return ("listicle", mod or "_pillar")
    return None

pages = defaultdict(list)  # (type,key) -> [rows]
for r in rows:
    c = classify(r["keyword"])
    if not c: continue
    t, key = c
    if t in ("tutorial", "coloring"):
        key = clean_subj(key)
        if not key: continue
    pages[(t, key)].append(r)

# ---------- build page objects with near-duplicate subject merging + caps ----------
def build(kind, minvol, cap=None):
    groups = []
    for (t,key), members in pages.items():
        if t != kind or not key: continue
        groups.append([key, set(key.split()), list(members)])
    # merge: if one subject's tokens are a subset of another, fold into the larger
    groups.sort(key=lambda g:(-max(m["v"] for m in g[2]), len(g[1])))
    kept = []
    for key, toks, members in groups:
        host = None
        for kp in kept:
            if toks <= kp[1] or kp[1] <= toks:   # token-subset either way -> same entity
                host = kp; break
        if host:
            host[2].extend(members)
            if len(toks) < len(host[1]):          # prefer the shorter, cleaner subject as label
                host[0], host[1] = key, toks
        else:
            kept.append([key, toks, members])
    out = []
    for key, toks, members in kept:
        if not (set(key.split()) - BLOCK_SUBJ): continue   # drop all-junk subjects
        members = list({m["keyword"]: m for m in members}.values())
        members.sort(key=lambda r:-r["v"])
        vol = members[0]["v"]
        if vol < minvol: continue
        kds = [m["kd"] for m in members if m["kd"] is not None]
        out.append({"key": key, "members": members, "vol": vol,
                    "kd": min(kds) if kds else None,
                    "intent": members[0]["intent"] or "informational",
                    "secondary": members[1:12]})
    out.sort(key=lambda p:-p["vol"])
    return out[:cap] if cap else out

tut   = build("tutorial", 2000, cap=80)
col   = build("coloring", 1500, cap=120)
land  = build("coloring_landing", 1500)
lst   = build("listicle", 1500, cap=30)
tools = build("tool", 20)

# merge landing buckets (dedupe by label)
land_m = {}
for p in land:
    lab = p["key"]
    if lab not in land_m or p["vol"] > land_m[lab]["vol"]:
        land_m[lab] = p
land = sorted(land_m.values(), key=lambda p:-p["vol"])

# ---------- titles / slugs / status ----------
def kdstr(kd): return str(kd) if kd is not None else "—"
def fmt(n): return f"{n:,}"

def finalize(plist, mk_title, mk_primary, ptype, path):
    for p in plist:
        p["title"] = mk_title(p)
        p["primary"] = mk_primary(p)
        p["slug"] = slugify(p["title"])
        p["status"] = have(p["slug"])
        p["ptype"] = ptype
        p["file"] = path
    return plist

tut  = finalize(tut,  lambda p: f"How to Draw {title(p['key'])}",
                      lambda p: f"how to draw {p['key']}", "Tutorial (blog)", "how-to-draw.md")
col  = finalize(col,  lambda p: f"{title(p['key'])} Coloring Pages",
                      lambda p: f"{p['key']} coloring pages", "Collection (category)", "coloring-collections.md")
land = finalize(land, lambda p: f"Coloring Pages {p['key']}" if p['key'].startswith('for') else f"{p['key']} Coloring Pages",
                      lambda p: p["members"][0]["keyword"], "Category landing", "coloring-collections.md")
def lst_title(p):
    if p["key"] == "_pillar": return "Drawing Ideas (Things to Draw)"
    base = "Things to Draw" if "draw" in p["members"][0]["keyword"] and "idea" not in p["members"][0]["keyword"] else "Drawing Ideas"
    return f"{title(p['key'])} {base}"
lst  = finalize(lst,  lst_title, lambda p: p["members"][0]["keyword"], "Listicle (blog)", "drawing-ideas.md")
tools= finalize(tools,lambda p: title(p["members"][0]["keyword"]),
                      lambda p: p["members"][0]["keyword"], "Tool landing page", "tools.md")

# ---------- write cluster brief files ----------
def kw_table(p):
    L = [f"- **Primary:** `{d(p['primary'])}` — vol **{fmt(p['vol'])}**/mo · KD **{kdstr(p['kd'])}** · {p['intent']}"]
    if p["secondary"]:
        sec = ", ".join(f"`{d(m['keyword'])}` ({fmt(m['v'])})" for m in p["secondary"])
        L.append(f"- **Also target:** {sec}")
    return "\n".join(L)

GUIDES = {
 "how-to-draw.md": ("How-to-Draw Tutorials", "Step-by-step drawing tutorials (blog posts).",
   "Template: **how-to-draw tutorial** in `00-writing-guide.md`. ~900–1300 words. "
   "Numbered steps (5–8), one materials list, beginner tips, a 'common mistakes' box, and a CTA to the matching coloring page/category if one exists."),
 "coloring-collections.md": ("Coloring Collections & Category Landings",
   "Theme/character collection pages + top category landings — use the **category MDX** schema.",
   "Template: **coloring category** in `00-writing-guide.md`. Intro paragraph (50–120 words) with the primary keyword in sentence 1, "
   "a `howToGuide` (download & print steps), 3–5 benefit bullets, and an FAQ (2–4 Q&A). These pages list the printable images for that theme."),
 "drawing-ideas.md": ("Drawing-Ideas Listicles", "Inspiration listicles (blog posts).",
   "Template: **listicle** in `00-writing-guide.md`. Title with a number (e.g. '40 …'). Each idea = H3 + 1–3 sentences + difficulty. "
   "Intro 80–120 words, primary keyword in H1 + first 100 words. 1200–1800 words."),
 "tools.md": ("Tool / Feature Landing Pages", "High-intent pages for the photo→coloring + generator features.",
   "Template: **tool landing** in `00-writing-guide.md`. Above-the-fold value prop + the actual tool/CTA, how-it-works (3 steps), use cases, FAQ. Conversion-focused."),
}

def write_cluster(path, plists):
    head, sub, gnote = GUIDES[path]
    L = [f"# {head}", "", f"_{sub}_", "", f"> **How to write these:** {gnote}", "",
         "See [`00-writing-guide.md`](00-writing-guide.md) for voice, frontmatter schema, and SEO rules. "
         "Statuses: ✅ exists · 🆕 new.", ""]
    for plist in plists:
        for p in plist:
            badge = "✅" if p["status"] else "🆕"
            L.append(f"## {badge} {p['title']}")
            L.append(f"`slug: {p['slug']}` · **{p['ptype']}**" + (f" · _exists as `{p['status']}` → refresh/expand_" if p["status"] else ""))
            L.append("")
            L.append(kw_table(p))
            L.append("")
    (PLAN / path).write_text("\n".join(L))

write_cluster("how-to-draw.md", [tut])
write_cluster("coloring-collections.md", [col, land])
write_cluster("drawing-ideas.md", [lst])
write_cluster("tools.md", [tools])

# ---------- master plan.md ----------
allp = [(p, "how-to-draw.md") for p in tut] + \
       [(p, "coloring-collections.md") for p in col+land] + \
       [(p, "drawing-ideas.md") for p in lst] + \
       [(p, "tools.md") for p in tools]
allp.sort(key=lambda x:-x[0]["vol"])

total_vol = sum(p["vol"] for p,_ in allp)
new_n = sum(1 for p,_ in allp if not p["status"])
L = ["# Scribbloo Content Plan", "",
     f"**{len(allp)} pages** mapped to keyword demand · **{new_n} new** · combined target volume **{fmt(total_vol)}/mo**.",
     "Built from the fan-out keyword research (DataForSEO Labs + Apify autocomplete). "
     "Volumes = monthly US Google searches; KD = keyword difficulty (lower = easier).", "",
     "**Workflow for the AI writer:** pick a row → open its brief file (linked) → read the keyword targets + the per-type "
     "writing template in [`00-writing-guide.md`](00-writing-guide.md) → output the MDX file at the right path. Rows are independent, so write in parallel/batches.",
     "", "Type key: 📂 collection/category · ✏️ tutorial · 📝 listicle · 🛠️ tool.  Status: 🆕 new · ✅ exists (refresh).", "",
     "| # | Page | Type | Primary keyword | Vol/mo | KD | Status | Brief |",
     "|--:|------|:----:|-----------------|------:|:--:|:------:|-------|"]
ICON = {"Tutorial (blog)":"✏️","Collection (category)":"📂","Category landing":"📂",
        "Listicle (blog)":"📝","Tool landing page":"🛠️"}
for i,(p,f) in enumerate(allp,1):
    st = "✅" if p["status"] else "🆕"
    anchor = slugify(p["title"])
    L.append(f"| {i} | {p['title']} | {ICON.get(p['ptype'],'')} | `{d(p['primary'])}` | {fmt(p['vol'])} | {kdstr(p['kd'])} | {st} | [brief]({f}#{anchor}) |")
L += ["", "## Files in this plan", "",
      "- [`00-writing-guide.md`](00-writing-guide.md) — brand voice, MDX frontmatter schemas, per-type templates, SEO + internal-linking rules (read first).",
      "- [`how-to-draw.md`](how-to-draw.md) — tutorial briefs.",
      "- [`coloring-collections.md`](coloring-collections.md) — theme/character collections + category landings.",
      "- [`drawing-ideas.md`](drawing-ideas.md) — listicle briefs.",
      "- [`tools.md`](tools.md) — tool/feature landing pages.",
      "", "_Source data: `site-infra/keyword-research/MASTER_keywords.csv` (5,262 keywords)._"]
(PLAN / "plan.md").write_text("\n".join(L))

print(f"pages: {len(allp)} (tut {len(tut)}, collections {len(col)}, landings {len(land)}, listicles {len(lst)}, tools {len(tools)})")
print(f"new: {new_n} | total target vol: {fmt(total_vol)}/mo")
print("wrote:", *(p.name for p in sorted(PLAN.glob('*.md'))))
