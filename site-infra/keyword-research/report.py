#!/usr/bin/env python3
"""Merge DataForSEO + Apify autocomplete, gap-analyze vs existing content, write report."""
import json, csv, re, pathlib, glob
from collections import defaultdict

ROOT = pathlib.Path(__file__).parent
SITE = ROOT.parent.parent  # repo root

STOP={"a","an","the","of","for","on","in","to","and","with","my","your","is","are","at","by","or","how","i","it","that","this","s"}
def sig(k):
    toks=[t for t in re.findall(r"[a-z0-9]+",k.lower()) if t not in STOP]
    toks=[t[:-1] if t.endswith("s") and len(t)>3 else t for t in toks]
    return " ".join(sorted(toks))

# ---- load DataForSEO clean ----
dfs=json.load(open(ROOT/"keywords_clean.json"))
master={}
for r in dfs:
    master[sig(r["keyword"])]={**r,"discovery":"dataforseo"}

# ---- merge Apify net-new (with volume) ----
ac=json.load(open(ROOT/"autocomplete_volumes.json"))
for r in ac:
    v=r.get("search_volume") or 0
    if v<=0: continue
    s=sig(r["keyword"])
    if s in master:
        master[s].setdefault("discovery","dataforseo")
        continue
    master[s]={"keyword":r["keyword"],"search_volume":v,"kd":None,
               "cpc":r.get("cpc"),"intent":None,"discovery":"apify_autocomplete",
               "cluster":None,"n_variants":1,"variants":r["keyword"]}

rows=list(master.values())

# ---- re-cluster everything (reuse logic) ----
CLUSTERS = {
 "Tool/feature (photo→coloring, generator, AI)":["generator","maker","creator","converter","convert","photo to","turn photo","picture to","ai coloring","create coloring","make coloring","photo into","from photo","your own"],
 "Coloring — licensed/characters":["hello kitty","ninja turtle","toy story","transformers","naruto","ninjago","venom","zootopia","pokemon","bluey","sonic","spider-man","spiderman","barbie","disney","mario","minecraft","stitch","kpop demon","k-pop demon","encanto","frozen","paw patrol","sanrio","kuromi","cinnamoroll","gabby"],
 "Coloring — animals":["animal","cat","dog","puppy","kitten","horse","lion","dinosaur","dino","bird","elephant"," fish","fox","owl","bunny","rabbit","butterfly","turtle","shark","panda","tiger","bear","insect"],
 "Coloring — unicorn/fairy/fantasy/princess":["unicorn","fairy","mermaid","princess","dragon","castle","wizard"," magic","fantasy","rainbow"],
 "Coloring — seasonal/holiday":["christmas","halloween","easter","thanksgiving","valentine","fall ","autumn","winter","summer","spring","pumpkin","santa","snowman","holiday"],
 "Coloring — audience (kids/adults/toddler)":["for kids","for adults","for toddlers","toddler","preschool","for boys","for girls","baby","for teens","kindergarten","year old"],
 "Coloring — format (free/printable/pdf/online)":["free","printable","pdf","online","print","book","sheet"],
 "Coloring — flowers/nature/food/vehicles":["flower","floral","rose","nature","tree","garden","mandala","ice cream","food","truck","car ","cars"],
 "Drawing ideas — by style/theme":["drawing idea","things to draw","what to draw","sketch idea","doodle","cool drawing","cute drawing","easy drawing","aesthetic drawing","art idea"],
 "How to draw / tutorials":["how to draw","step by step","drawing tutorial","learn to draw","for beginners"],
}
def cluster_of(k):
    kl=k.lower()
    for name,kws in CLUSTERS.items():
        if any(w in kl for w in kws): return name
    if "color" in kl or "colour" in kl: return "Coloring — general/other"
    return "Drawing/sketch — other"
for r in rows:
    r["cluster"]=cluster_of(r["keyword"])
    r["search_volume"]=r.get("search_volume") or 0

rows.sort(key=lambda r:-r["search_volume"])

# ---- write master CSV ----
cols=["keyword","search_volume","kd","cpc","intent","cluster","discovery","n_variants","variants"]
with open(ROOT/"MASTER_keywords.csv","w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=cols,extrasaction="ignore"); w.writeheader()
    for r in rows: w.writerow(r)

# ---- gap analysis vs existing content ----
have=set()
for p in glob.glob(str(SITE/"content/**/*.mdx"),recursive=True):
    have.add(sig(pathlib.Path(p).stem.replace("-"," ")))
existing_slugs=[pathlib.Path(p).stem for p in glob.glob(str(SITE/"content/**/*.mdx"),recursive=True)]

def covered(kw):
    s=set(sig(kw).split())
    for h in have:
        hs=set(h.split())
        if hs and hs.issubset(s) or s.issubset(hs) and len(s)>=2:
            return True
    return False

# ---- helpers for report ----
def fmt(n): return f"{n:,}"
def top(filt,n=25,key=None):
    xs=[r for r in rows if filt(r)]
    xs.sort(key=key or (lambda r:-r["search_volume"]))
    return xs[:n]

# opportunities: real volume, low KD
opps=top(lambda r:r["search_volume"]>=800 and r.get("kd") is not None and r["kd"]<=15,40,
         key=lambda r:-(r["search_volume"]/((r.get("kd") or 0)+1)))
# autocomplete-discovered wins
ac_wins=top(lambda r:r["discovery"]=="apify_autocomplete" and r["search_volume"]>=1500,30)

# cluster summary
cs=defaultdict(lambda:[0,0])
for r in rows:
    cs[r["cluster"]][0]+=1; cs[r["cluster"]][1]+=r["search_volume"]

L=[]
L.append("# Scribbloo — Keyword Research (fan-out)\n")
L.append("_Method: human-style fan-out. **DataForSEO Labs** `related_keywords` (depth tree = Google 'related searches'), `keyword_suggestions` (long-tail), `keyword_ideas` (category) for volume/KD/intent — then **Apify** Google Autocomplete (what people actually type, alphabet+suffix expansion) to catch fresh/trending terms DataForSEO missed, re-quantified via DataForSEO Google Ads volume._\n")
L.append(f"**{fmt(len(rows))}** unique keywords (close-variants collapsed) · location: United States · all volumes = monthly Google searches.\n")

L.append("## Topic clusters (where the demand is)\n")
L.append("| Cluster | Keywords | Total monthly volume |")
L.append("|---|--:|--:|")
for name,(n,v) in sorted(cs.items(),key=lambda x:-x[1][1]):
    L.append(f"| {name} | {n} | {fmt(v)} |")

L.append("\n## Highest-priority opportunities (strong volume ÷ low difficulty ≤15)\n")
L.append("These are the fastest wins for a newer site — real demand, weak competition.\n")
L.append("| Keyword | Volume | KD | Intent | Cluster |")
L.append("|---|--:|--:|---|---|")
for r in opps:
    L.append(f"| {r['keyword']} | {fmt(r['search_volume'])} | {r['kd']} | {r.get('intent') or '-'} | {r['cluster'].split('—')[-1].strip()} |")

L.append("\n## Net-new from Apify autocomplete (DataForSEO didn't surface these)\n")
L.append("Mostly **licensed characters & specific subjects** — concrete page ideas with proven demand.\n")
L.append("| Keyword | Volume | CPC |")
L.append("|---|--:|--:|")
for r in ac_wins:
    L.append(f"| {r['keyword']} | {fmt(r['search_volume'])} | {r.get('cpc') or 0} |")

# content gaps: high-vol opportunity keywords not yet covered
gap=[r for r in rows if r["search_volume"]>=2000 and not covered(r["keyword"])
     and (r.get("kd") is None or r["kd"]<=20)]
gap.sort(key=lambda r:-r["search_volume"])
L.append(f"\n## Content gaps — high-demand, not yet on the site\n")
L.append(f"_You currently have {len(existing_slugs)} content files. Below: keywords with ≥2,000 vol & KD≤20 that don't map to any existing page._\n")
L.append("| Keyword | Volume | KD | Suggested page type |")
L.append("|---|--:|--:|---|")
def ptype(k):
    kl=k.lower()
    if "how to draw" in kl: return "Tutorial (blog)"
    if "drawing" in kl or "sketch" in kl or "doodle" in kl or "to draw" in kl or "art idea" in kl: return "Idea listicle (blog)"
    if any(g in kl for g in ["generator","maker","convert","photo to","turn photo","your own"]): return "Tool landing page"
    return "Coloring page / category"
for r in gap[:40]:
    L.append(f"| {r['keyword']} | {fmt(r['search_volume'])} | {r.get('kd') if r.get('kd') is not None else '?'} | {ptype(r['keyword'])} |")

L.append("\n## Files\n")
L.append("- `MASTER_keywords.csv` — everything merged (DataForSEO + Apify), sorted by volume\n- `keywords_clean.csv` — DataForSEO set, close-variants collapsed\n- `keywords_all.csv` — raw 8.5k before dedupe\n- `insights.json` — opportunities + question keywords\n- `apify_autocomplete.json` — raw autocomplete\n- `raw/` — every API response\n")

(ROOT/"REPORT.md").write_text("\n".join(L))
print("wrote REPORT.md and MASTER_keywords.csv")
print("master rows:",len(rows),"| gaps:",len(gap),"| opps:",len(opps),"| ac_wins:",len(ac_wins))
