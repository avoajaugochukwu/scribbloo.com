#!/usr/bin/env python3
"""Clean, dedupe near-variants, cluster, and score the fan-out keywords."""
import json, csv, re, pathlib
from collections import defaultdict

ROOT = pathlib.Path(__file__).parent
rows = json.load(open(ROOT / "keywords_all.json"))

STOP = {"a","an","the","of","for","on","in","to","and","with","my","your","is",
        "are","at","by","or","how","i","it","that","this","s"}
CORE = ("color", "coloring", "colour", "draw", "drawing", "sketch", "doodle",
        "paint", "trace", "printable", "colouring")
# obvious off-topic noise to drop
BLOCK = ("download apk","mod apk","game","roblox","minecraft download",".com",
         "login","near me","app store","google play","wallpaper hd")

def relevant(k):
    if any(b in k for b in BLOCK): return False
    return any(c in k for c in CORE)

def sig(k):
    toks = [t for t in re.findall(r"[a-z0-9]+", k.lower()) if t not in STOP]
    # singularize trivial plurals so page/pages, idea/ideas collapse
    toks = [t[:-1] if t.endswith("s") and len(t) > 3 else t for t in toks]
    return " ".join(sorted(toks))

CANON = ["how to draw","coloring pages","coloring book","drawing ideas","things to draw",
         "what to draw","easy to draw","sketch ideas","doodle ideas","coloring sheets",
         "step by step","for beginners","for kids","for adults","printable coloring pages",
         "free printable","coloring page"]
def naturalness(k):
    kl = k.lower()
    toks = k.split()
    # reward natural canonical phrases appearing intact; penalize dangling order
    bonus = -sum(2 for c in CANON if c in kl)
    bonus += -5 if any(kl.startswith(c) for c in CANON) else 0   # strongly prefer canonical-prefix phrasing
    dup = 3 if len(toks) != len(set(toks)) else 0                # penalize "drawing drawing ideas"
    dangle = 2 if (toks and (toks[0] in {"to","a","of","for","on","in"} or toks[-1] in {"how","to","a","of","for","the"})) else 0
    stops = sum(1 for t in toks if t in STOP)
    return (bonus + dangle + dup, stops, len(toks), len(k))

# collapse near-variants by signature
groups = defaultdict(list)
for r in rows:
    if not r.get("keyword") or not relevant(r["keyword"]):
        continue
    groups[sig(r["keyword"])].append(r)

clean = []
for s, members in groups.items():
    rep = min(members, key=lambda r: naturalness(r["keyword"]))
    vol = max((m.get("search_volume") or 0) for m in members)
    kds = [m["kd"] for m in members if m.get("kd") is not None]
    cpcs = [m["cpc"] for m in members if m.get("cpc") is not None]
    intents = [m["intent"] for m in members if m.get("intent")]
    variants = sorted({m["keyword"] for m in members}, key=naturalness)
    clean.append({
        "keyword": rep["keyword"],
        "search_volume": vol,
        "kd": min(kds) if kds else None,
        "cpc": round(sum(cpcs)/len(cpcs), 2) if cpcs else None,
        "intent": max(set(intents), key=intents.count) if intents else None,
        "n_variants": len(variants),
        "variants": " ; ".join(variants[:6]),
    })

clean.sort(key=lambda r: r["search_volume"], reverse=True)

# ---- thematic clustering ----
CLUSTERS = {
    "Tool / feature (photo→coloring, generator, AI)":
        ["generator","maker","creator","converter","convert","photo to","turn photo","picture to",
         "ai coloring","create coloring","make coloring","photo into","from photo"],
    "Coloring — animals":
        ["animal","cat","dog","puppy","kitten","horse","lion","dragon","dinosaur","dino","bird",
         "elephant","fish","fox","owl","bunny","rabbit","butterfly","turtle","shark","panda","tiger","bear"],
    "Coloring — unicorn / fairy / fantasy / princess":
        ["unicorn","fairy","mermaid","princess","dragon","castle","wizard","magic","fantasy","rainbow"],
    "Coloring — seasonal / holiday":
        ["christmas","halloween","easter","thanksgiving","valentine","fall","autumn","winter","summer",
         "spring","pumpkin","santa","snowman","holiday"],
    "Coloring — audience (kids/adults/toddler)":
        ["for kids","for adults","for toddlers","toddler","preschool","for boys","for girls","baby",
         "for teens","kindergarten"],
    "Coloring — format (free/printable/pdf/online/easy)":
        ["free","printable","pdf","online","easy","cute","simple","hard","detailed","book","sheet","sheets"],
    "Coloring — flowers / nature":
        ["flower","floral","rose","nature","tree","garden","plant","mandala","landscape"],
    "Drawing ideas — by style/theme":
        ["drawing idea","things to draw","what to draw","sketch idea","doodle","cool drawing","cute drawing",
         "easy drawing","aesthetic drawing","sketch idea"],
    "How to draw / tutorials":
        ["how to draw","step by step","drawing tutorial","learn to draw","drawing for beginners"],
}

def cluster_of(k):
    kl = k.lower()
    for name, kws in CLUSTERS.items():
        if any(kw in kl for kw in kws):
            return name
    if "coloring" in kl or "colouring" in kl or "color page" in kl:
        return "Coloring — general / other"
    return "Drawing / sketch — other"

for r in clean:
    r["cluster"] = cluster_of(r["keyword"])

# ---- write cleaned CSV ----
cols = ["keyword","search_volume","kd","cpc","intent","cluster","n_variants","variants"]
with open(ROOT / "keywords_clean.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    for r in clean: w.writerow(r)
json.dump(clean, open(ROOT / "keywords_clean.json","w"), indent=2)

# ---- opportunities: decent volume, low difficulty ----
opps = [r for r in clean if r["search_volume"] >= 500 and r["kd"] is not None and r["kd"] <= 20]
opps.sort(key=lambda r: (r["search_volume"]/(r["kd"]+1)), reverse=True)

# ---- question / informational keywords (blog fodder) ----
QWORDS = ("how ","what ","why ","when ","can you","is it","ideas","easy","step by step","for beginners")
questions = [r for r in clean if any(q in r["keyword"].lower() for q in QWORDS)
             and r["search_volume"] >= 300]
questions.sort(key=lambda r: r["search_volume"], reverse=True)

print(f"clean keywords: {len(clean)}  (from {len(rows)} raw)")
print(f"opportunities (vol>=500, KD<=20): {len(opps)}")

# cluster summary
by_c = defaultdict(lambda: [0,0])
for r in clean:
    by_c[r["cluster"]][0]+=1
    by_c[r["cluster"]][1]+=r["search_volume"]
print("\n=== CLUSTERS (count | total monthly volume) ===")
for name,(n,v) in sorted(by_c.items(), key=lambda x:-x[1][1]):
    print(f"  {v:>10,}  ({n:>4} kw)  {name}")

print("\n=== TOP 30 OPPORTUNITIES (high volume / low KD) ===")
for r in opps[:30]:
    print(f"  vol {r['search_volume']:>7,}  KD {r['kd']:>2}  {r['keyword']}")
json.dump({"opportunities":opps,"questions":questions}, open(ROOT/"insights.json","w"), indent=2)
