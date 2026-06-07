#!/usr/bin/env python3
"""Turn the merged keyword set into a /plan folder of MD content briefs an AI agent can batch-write."""
import csv, re, json, pathlib, glob
from collections import defaultdict

KR = pathlib.Path(__file__).parent
SITE = KR.parent.parent
PLAN = SITE / "plan"
PLAN.mkdir(exist_ok=True)

# collapse multiword entities to a single token at the text level (longest first)
FIXUPS = [("five nights at freddy's","fnaf"),("five nights at freddys","fnaf"),
          ("five nights at freddy","fnaf"),("five night at freddy","fnaf"),
          ("bob sponge","spongebob"),("my little pony","mlp"),
          ("pok mon","pokemon"),("pokémon","pokemon"),("k pop","kpop"),
          ("spider man","spiderman"),("hello kitty","hellokitty")]
UNFIX = {"hellokitty":"hello kitty","spiderman":"spider-man","mlp":"my little pony"}  # restore for display
rows = list(csv.DictReader(open(KR / "MASTER_keywords.csv")))
# fold in the supplemental drawing-prompts cluster
seen = {r["keyword"].lower() for r in rows}
if (KR / "prompts_keywords.json").exists():
    for p in json.load(open(KR / "prompts_keywords.json")):
        if p["keyword"].lower() in seen: continue
        rows.append({"keyword": p["keyword"], "search_volume": p.get("sv") or 0,
                     "kd": p.get("kd"), "cpc": p.get("cpc"), "intent": p.get("intent") or "",
                     "cluster": "prompts", "discovery": "prompts", "variants": p["keyword"]})
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
              "man","page","fre","colour","coloring","kpop","pic","app","simply","auto","saint",
              "format","marker"}
def d(s):  # restore display form of merged entities
    for a,b in UNFIX.items(): s = re.sub(rf"\b{a}\b", b, s)
    return s
ACR = {"fnaf","pdf","abc","diy","mlp"}
def title(s):
    s = d(s)
    small = {"a","an","the","of","for","to","and","with","in"}
    ws = s.split()
    out = []
    for i,w in enumerate(ws):
        if w.lower() in ACR: out.append(w.upper())
        elif w in small and i: out.append(w)
        else: out.append(w.capitalize())
    return " ".join(out)

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

# ---- consolidation: alias many surface forms to ONE canonical concept (kills near-dup pages) ----
SYNONYM = {
    # plurals / spelling / language variants
    "dino":"dinosaur","dinosaurs":"dinosaur","floral":"flower","flowers":"flower",
    "xmas":"christmas","springtime":"spring","summertime":"summer","wintertime":"winter",
    "autumn":"fall","unicornio":"unicorn","abc":"alphabet","number":"numbers",
    # vehicles
    "auto":"car","automobile":"car","automotive":"car","cars":"car",
    # animals
    "doggie":"dog","doggo":"dog","canine":"dog","kitten":"cat","kitty":"hellokitty",
    # heroes
    "superheroe":"superhero","hero":"superhero",
    # animation
    "animation":"animated",
    # characters / franchises (single-token after FIXUPS)
    "freddy":"fnaf","freddys":"fnaf","mlp":"mlp","pony":"mlp",
    "lilo":"stitch","boobie":"bobbie",
}
AUDIENCE = {  # any subject made only of these -> a single audience landing page
    "adult":"for Adults","adults":"for Adults","grown":"for Adults",
    "kid":"for Kids","kids":"for Kids","child":"for Kids","children":"for Kids",
    "toddler":"for Toddlers","toddlers":"for Toddlers","preschool":"for Toddlers",
    "teen":"for Teens","teens":"for Teens","teenager":"for Teens","teenage":"for Teens",
    "boy":"for Boys","boys":"for Boys","girl":"for Girls","girls":"for Girls",
}
def canon(subj):
    if subj in SYNONYM: return SYNONYM[subj]          # multiword phrase hit
    toks = [SYNONYM.get(t, t) for t in subj.split()]
    return " ".join(toks).strip()

# ---- theme tree: map each collection subject to ONE top-level theme (url-structure-guide §6) ----
# Standard 8 (canonical) + GAP themes that the Standard 8 doesn't cover yet (flagged for review).
STD_THEMES = ["animals","characters","holidays","fantasy","nature","vehicles","education","patterns"]
GAP_THEMES = ["food","sports","religion","people"]   # decide: promote to themes, or fold/drop
THEME = {
 # animals
 "dinosaur":"animals","cat":"animals","dog":"animals","horse":"animals","bird":"animals",
 "butterfly":"animals","axolotl":"animals","bear":"animals","bunny":"animals","cow":"animals",
 "duck":"animals","elephant":"animals","fish":"animals","frog":"animals","giraffe":"animals",
 "lion":"animals","monkey":"animals","mouse":"animals","penguin":"animals","puppy":"animals",
 "rabbit":"animals","shark":"animals","sheep":"animals","snake":"animals","tiger":"animals",
 "turtle":"animals","turkey":"animals","whale":"animals","wolf":"animals","dolphin":"animals",
 "eagle":"animals","spider":"animals",
 # characters / franchises / people-IP
 "hellokitty":"characters","pokemon":"characters","pikachu":"characters","sonic":"characters",
 "bluey":"characters","spiderman":"characters","stitch":"characters","labubu":"characters",
 "minecraft":"characters","mario":"characters","paw":"characters","patrol":"characters",
 "disney":"characters","spongebob":"characters","frozen":"characters","elsa":"characters",
 "barbie":"characters","mickey":"characters","squishmallow":"characters","peppa":"characters",
 "mcqueen":"characters","mlp":"characters","fnaf":"characters","sprunki":"characters",
 "snoopy":"characters","minion":"characters","harry":"characters","potter":"characters",
 "godzilla":"characters","transformer":"characters","taylor":"characters","swift":"characters",
 "toy":"characters","story":"characters","superhero":"characters","crayola":"characters",
 "coco":"characters","wyo":"characters","bobbie":"characters","princess":"characters",
 "goku":"characters","naruto":"characters","grinch":"characters","hulk":"characters",
 "rapunzel":"characters","lisa":"characters","frank":"characters","melanie":"characters",
 "martinez":"characters","shadow":"characters","cinderella":"characters",
 # holidays (incl. seasons)
 "christmas":"holidays","halloween":"holidays","easter":"holidays","thanksgiving":"holidays",
 "valentine":"holidays","birthday":"holidays","patrick":"holidays","mother":"holidays",
 "father":"holidays","summer":"holidays","winter":"holidays","spring":"holidays","fall":"holidays",
 "santa":"holidays","pumpkin":"holidays","elf":"holidays",
 # fantasy
 "unicorn":"fantasy","dragon":"fantasy","mermaid":"fantasy","fairy":"fantasy",
 # nature
 "flower":"nature","rainbow":"nature","star":"nature","ocean":"nature","beach":"nature","mushroom":"nature",
 # vehicles
 "car":"vehicles","truck":"vehicles","hot":"vehicles","wheel":"vehicles",
 # education
 "alphabet":"education","numbers":"education","letter":"education","anatomy":"education","kindergarten":"education",
 # patterns
 "mandala":"patterns","heart":"patterns",
 "animal":"animals",                                  # animals theme hub
 # --- GAP (not in Standard 8) — flagged in collections-map.md review ---
 "food":"food","ice":"food","cream":"food","strawberry":"food","apple":"food",
 "football":"sports",
 "jesus":"religion","bible":"religion",
}
# cross-cutting STYLE facets (not a theme) -> flat /coloring-pages/<style>, tag-driven
STYLE = {"cute","adorable","kawaii","aesthetic","funny","fun","cozy","anime","animated",
         "cool","beautiful","detailed","mini","small"}
HUB = {"animal":"animals"}                            # subject that IS its theme's hub
def theme_of(key):
    toks = key.split()
    if any(t in STYLE for t in toks): return "facet"
    for t in toks:
        if t in THEME: return THEME[t]
    return "misc"                                     # unmapped -> review

def page_path(p):
    pt, key = p["ptype"], p["key"]
    if pt == "Tutorial (blog)":   return f"/how-to-draw/{slugify(d(key))}"
    if pt == "Collection (category)":
        if key in HUB: return f"/coloring-pages/{HUB[key]}"          # theme hub
        th = theme_of(key)
        if th == "facet": return f"/coloring-pages/{slugify(d(key))}"  # flat style facet
        return f"/coloring-pages/{th}/{slugify(d(key))}"
    if pt == "Category landing":
        if key == "Free Printable": return "/coloring-pages"        # the hub itself
        return f"/coloring-pages/{slugify(key)}"                     # for-adults, pdf, online…
    if pt == "Listicle (blog)":
        return "/drawing-ideas" if key == "_pillar" else f"/drawing-ideas/{slugify(d(key))}"
    if pt == "Tool landing page": return f"/tools/{p['slug']}"
    return "/"

def classify(kw):
    k = kw.lower()
    if any(h in k for h in TOOL_HINTS):
        if "photo" in k or "picture" in k: return ("tool", "photo to coloring page")
        if "ai" in k.split(): return ("tool", "ai coloring page generator")
        if "maker" in k: return ("tool", "coloring page maker")
        return ("tool", "coloring page generator")
    if "color" in k or "colour" in k:
        toks = [sing(t) for t in re.findall(r"[a-z0-9]+", k) if t not in COLOR_STRIP]
        if toks and all(t in AUDIENCE for t in toks):          # audience-only -> one landing page
            return ("coloring_landing", AUDIENCE[toks[0]])
        toks = [t for t in toks if t not in AUDIENCE]           # strip audience words from theme subject
        subj = " ".join(toks).strip()
        if subj:
            return ("coloring", subj)
        for key,lab in FMT.items():
            if re.search(rf"\b{key}\b", k): return ("coloring_landing", lab)
        return ("coloring_landing", "Free Printable")
    if "how to" in k and "draw" in k:
        toks = [sing(t) for t in re.findall(r"[a-z0-9]+", k) if t not in TUT_STRIP]
        subj = " ".join(toks).strip()
        return ("tutorial", subj) if subj else None
    # drawing-prompts cluster (consolidated into a few resource pages)
    if "generator" in k and ("prompt" in k or ("random" in k and "draw" in k)):
        return ("tool", "drawing prompt generator")
    if "prompt" in k:
        return ("named", "art prompts" if "art prompt" in k else "drawing prompts")
    if "sketchbook" in k:
        return ("named", "sketchbook cover ideas" if "cover" in k else "sketchbook ideas")
    if "challenge" in k and ("draw" in k or "doodle" in k or "sketch" in k):
        return ("named", "drawing challenge ideas")
    if "when bored" in k and "draw" in k:
        return ("named", "things to draw when bored")
    if any(t in k for t in ["drawing idea","things to draw","what to draw","sketch idea","doodle",
                            "art idea","cute drawing","easy drawing","cool drawing","drawings"]):
        mod = next((m for m in MODS if m in k), "")
        return ("listicle", mod or "_pillar")
    # reverse word order: "[subject] drawing [easy]" == "how to draw [subject]" intent.
    # singular "drawing" only (plural "drawings" already handled as a listicle above). Placed last
    # so prompt/sketchbook/named/listicle checks win first (e.g. "drawing prompts" stays named).
    if re.search(r"\bdrawing\b", k):
        toks = [sing(t) for t in re.findall(r"[a-z0-9]+", k) if t not in TUT_STRIP]
        subj = " ".join(toks).strip()
        if subj: return ("tutorial", subj)          # pure-modifier (e.g. "easy") -> empty -> None
    return None

pages = defaultdict(list)  # (type,key) -> [rows]
for r in rows:
    c = classify(r["keyword"])
    if not c: continue
    t, key = c
    if t in ("tutorial", "coloring"):
        key = canon(clean_subj(key))            # consolidate near-dup subjects
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
        # BLOCK_SUBJ drops junk *subject nouns* — only for subject-keyed types. Listicle/named keys
        # are modifiers ("easy","cute"), which BLOCK_SUBJ would wrongly nuke (killed the 301k "easy").
        if kind in ("coloring", "tutorial") and not (set(key.split()) - BLOCK_SUBJ): continue
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
named = build("named", 1000)
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
        p["path"] = page_path(p)
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
NAMED_TITLES = {"drawing prompts":"Drawing Prompts (Ideas & List)","art prompts":"Art Prompts",
                "sketchbook ideas":"Sketchbook Ideas","sketchbook cover ideas":"Sketchbook Cover Ideas",
                "drawing challenge ideas":"Drawing Challenge Ideas","things to draw when bored":"Things to Draw When Bored"}
named= finalize(named,lambda p: NAMED_TITLES.get(p["key"], title(p["key"])),
                      lambda p: p["members"][0]["keyword"], "Listicle (blog)", "drawing-ideas.md")
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
write_cluster("drawing-ideas.md", [named, lst])
write_cluster("tools.md", [tools])

# ---------- master plan.md ----------
allp = [(p, "how-to-draw.md") for p in tut] + \
       [(p, "coloring-collections.md") for p in col+land] + \
       [(p, "drawing-ideas.md") for p in lst+named] + \
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
     "Canonical URL paths follow [`url-structure-guide.md`](url-structure-guide.md); the collection theme tree "
     "is in [`collections-map.md`](collections-map.md).", "",
     "| # | Page | Type | Primary keyword | Vol/mo | KD | Status | Path |",
     "|--:|------|:----:|-----------------|------:|:--:|:------:|------|"]
ICON = {"Tutorial (blog)":"✏️","Collection (category)":"📂","Category landing":"📂",
        "Listicle (blog)":"📝","Tool landing page":"🛠️"}
for i,(p,f) in enumerate(allp,1):
    st = "✅" if p["status"] else "🆕"
    anchor = slugify(p["title"])
    L.append(f"| {i} | [{p['title']}]({f}#{anchor}) | {ICON.get(p['ptype'],'')} | `{d(p['primary'])}` | {fmt(p['vol'])} | {kdstr(p['kd'])} | {st} | `{p['path']}` |")
L += ["", "## Files in this plan", "",
      "- [`00-writing-guide.md`](00-writing-guide.md) — brand voice, MDX frontmatter schemas, per-type templates, SEO + internal-linking rules (read first).",
      "- [`url-structure-guide.md`](url-structure-guide.md) — canonical URL/routing spec (read before adding routes).",
      "- [`internal-linking.md`](internal-linking.md) — the cross-type link mesh (the main ranking lever).",
      "- [`image-pipeline.md`](image-pipeline.md) — how leaf images are made + the CDN switch.",
      "- [`collections-map.md`](collections-map.md) — collection → theme/subject/path map + aliases + review items.",
      "- [`how-to-draw.md`](how-to-draw.md) — tutorial briefs.",
      "- [`coloring-collections.md`](coloring-collections.md) — theme/character collections + category landings.",
      "- [`drawing-ideas.md`](drawing-ideas.md) — listicle briefs.",
      "- [`tools.md`](tools.md) — tool/feature landing pages.",
      "", "_Source data: `site-infra/keyword-research/MASTER_keywords.csv` (5,262 keywords)._"]
(PLAN / "plan.md").write_text("\n".join(L))

# ---------- collections-map.md (theme tree, generated) ----------
def write_collections_map():
    by_theme = defaultdict(list)
    for p in col: by_theme[theme_of(p["key"])].append(p)
    L = ["# Collections Map (theme → subject → path)", "",
         "**Auto-generated by `site-infra/keyword-research/build_plan.py` — do not hand-edit; re-run the generator.**",
         "Governed by [`url-structure-guide.md`](url-structure-guide.md). Synonyms are already folded by the "
         "generator (the `SYNONYM`/`AUDIENCE` maps); folded variants show under **Also targets**.", "",
         f"**{len(col)} canonical collections** + **{len(land)} facet landings**. "
         "One canonical page per intent; do not create separate pages for the folded variants.", ""]
    NICE = {"holidays":"holidays (incl. seasons)"}
    for th in STD_THEMES:
        items = sorted(by_theme.get(th, []), key=lambda p:-p["vol"])
        if not items: continue
        L += [f"## {NICE.get(th, th)} — `/coloring-pages/{th}`", "",
              "| Subject | Path | Vol/mo | Also targets (folded) |", "|---|---|--:|---|"]
        for p in items:
            also = ", ".join(f"`{d(m['keyword'])}`" for m in p["secondary"][:6]) or "—"
            L.append(f"| {title(p['key'])} | `{p['path']}` | {fmt(p['vol'])} | {also} |")
        L.append("")
    # facets = audience/format landings + cross-cutting STYLE collections
    facets = land + by_theme.get("facet", [])
    L += ["## facets (cross-cutting — audience / style / format, tag-driven, flat path)", "",
          "| Facet | Path | Vol/mo | Also targets |", "|---|---|--:|---|"]
    for p in sorted(facets, key=lambda p:-p["vol"]):
        also = ", ".join(f"`{d(m['keyword'])}`" for m in p["secondary"][:6]) or "—"
        L.append(f"| {p['title']} | `{p['path']}` | {fmt(p['vol'])} | {also} |")
    L.append("")
    # gaps / review
    review = []
    for th in GAP_THEMES:
        for p in sorted(by_theme.get(th, []), key=lambda p:-p["vol"]):
            review.append((p, f"no `{th}` theme in Standard 8 — promote to a theme, or fold/drop"))
    for p in sorted(by_theme.get("misc", []), key=lambda p:-p["vol"]):
        review.append((p, "unmapped subject — assign a theme in `THEME` (build_plan.py) or drop"))
    if review:
        L += ["## Review / decide", "",
              "Not auto-placed in the Standard-8 tree — needs a human call before writing.", "",
              "| Collection | Vol/mo | Provisional path | Issue |", "|---|--:|---|---|"]
        for p, why in review:
            L.append(f"| {title(p['key'])} | {fmt(p['vol'])} | `{p['path']}` | {why} |")
        L.append("")
    # aliases / redirects (resolve SYNONYM -> canonical page path)
    idx = {}
    for p in col:
        for t in p["key"].split(): idx.setdefault(t, p["path"])
    L += ["## Aliases / redirects (308)", "",
          "Synonym slugs that must **not** become pages — redirect into the canonical path "
          "(feed `next.config.js redirects()` + the page's `aliases:` frontmatter).", "",
          "| Alias | → Canonical path |", "|---|---|"]
    for a, b in sorted(SYNONYM.items()):
        tgt = idx.get(b)
        if tgt: L.append(f"| `{a}` | `{tgt}` |")
    L.append("")
    (PLAN / "collections-map.md").write_text("\n".join(L))

write_collections_map()

print(f"pages: {len(allp)} (tut {len(tut)}, collections {len(col)}, landings {len(land)}, listicles {len(lst)}, tools {len(tools)})")
print(f"new: {new_n} | total target vol: {fmt(total_vol)}/mo")
print("wrote:", *(p.name for p in sorted(PLAN.glob('*.md'))))
