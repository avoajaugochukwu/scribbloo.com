# Site Search

**Status:** Implemented. This is the canonical reference for how site-wide search works and
how to extend it as new content types are added. Read this before touching search or adding a
new searchable content type.

Search is **server-side over a flat in-memory index** — no database, no external service
(Algolia/Meilisearch), no client-shipped index. The site is file-based MDX (~hundreds of
pages today, scaling to 1,000+), so a linear scan of the index per query is effectively
instant and keeps everything in one place we control.

---

## 1. Architecture at a glance

```
content (MDX) ──► loaders (lib/content/*) ──► getSearchIndex()  [SearchDoc[]]
                                                     │
                                       searchContent(q) scores + ranks
                                                     │
                        ┌────────────────────────────┼───────────────────────┐
                        ▼                             ▼                        ▼
              GET /api/search (JSON)         /search page (SSR)        header dropdown
              (header dropdown, future       grouped results,          (client, calls the
               client callers)               works without JS          API as you type)
```

Every searchable thing — a coloring page, a category, a facet, a blog post, a tutorial — is
normalized into a single `SearchDoc`. The index is built **once per process** with
`React.cache`, from the same loaders the pages already use. Query time is a weighted scan.

## 2. Files

| File | Role |
|---|---|
| `lib/content/search-shared.ts` | **Client-safe** primitives: `SearchType`, `SearchDoc`, `SearchResult`, `SEARCH_TYPE_META` (labels + ranking weights + group order), `groupByType()`. No `server-only`, no loaders — safe to import from client components. |
| `lib/content/search.ts` | **Server-only** index + scorer. Holds the source registry, `getSearchIndex()`, `searchContent()`, and the scoring. Re-exports everything from `search-shared.ts` so server callers can import from one place. |
| `app/api/search/route.ts` | `GET /api/search?q=&limit=&types=` → ranked JSON. Edge-cacheable. |
| `app/search/page.tsx` | Server-rendered results page, grouped by type, `noindex, follow`. Works with JS disabled; shareable via `?q=`. |
| `components/search/SiteSearch.tsx` | Client search input. `variant="header"` = live debounced dropdown hitting the API; `variant="page"` = larger box that submits to `/search`. |
| `components/search/SearchResultRow.tsx` | One result row (thumb + type badge + title + description), shared by the page and the dropdown. |

The header (`components/Header.tsx`) renders `<SiteSearch variant="header" />` on desktop and a
search-icon link to `/search` on mobile. The homepage JSON-LD (`app/page.tsx`) declares a
`SearchAction` sitelinks-searchbox pointing at `/search?q={search_term_string}`.

## 3. The `SearchDoc` model

```ts
interface SearchDoc {
  id: string;              // `<type>:<url>` — stable + unique
  type: SearchType;        // 'coloring-page' | 'collection' | 'facet' | 'blog' | 'how-to-draw' | 'drawing-ideas' | 'tools'
  title: string;
  description: string | null;
  url: string;             // canonical, ready-to-link href
  image: string | null;    // thumbnail URL, or null when there's no art
  keywords: string[];      // extra match tokens (tags, aliases, path segments) — never displayed
  date: string | null;     // ISO, for recency tie-breaks
}
```

`keywords` is the lever for "findable but not shown" terms: tags, synonym aliases, parent
folder slugs. Stuff it generously — it only affects matching, never display.

## 4. Ranking

`searchContent(query, { limit, types })`:

1. Tokenize the query (lowercase, strip punctuation, unique terms).
2. **AND semantics** — every query term must match *somewhere* in a doc, or the doc is dropped.
3. Per-doc score, weighted by field:
   - exact title == query `+100`; title startsWith `+40`; title includes `+18`
   - per term: whole word in title `+12`, substring of title `+7`, in keywords `+4`, in description `+2`
   - `+ SEARCH_TYPE_META[type].weight` (a small per-type nudge — a matching **category** outranks a single leaf)
4. Sort by score, then recency (`date` desc), then title.

Type weights and group order both live in `SEARCH_TYPE_META` (`search-shared.ts`). Tune
relevance there — it's the one knob.

## 5. Adding a new searchable content type

Three edits, all in the two `search*` files. Nothing else (API, page, dropdown) changes — they
all read the index generically.

1. **`search-shared.ts`** — add the key to the `SearchType` union and an entry to
   `SEARCH_TYPE_META` (`label`, `plural`, `weight`). Its position in that object also sets where
   the group appears on `/search`.
2. **`search.ts`** — write a source function `async (): Promise<SearchDoc[]>` that maps your
   loader's items into `SearchDoc`s (resolve thumbnails via `imageUrl`, push tags/aliases into
   `keywords`), and add it to the `SOURCES` array.
3. If it's an image kind `imageUrl` doesn't know yet, add it in `lib/images.ts`.

That's it — it's now in the API, the `/search` page, and the header dropdown.

## 6. SEO notes

- **`/search` is `noindex, follow`.** Search result pages are not evergreen content; never let
  them into the index or the sitemap (`app/sitemap.ts` is content-derived and already excludes
  `/search` and `/api/*`).
- The homepage `SearchAction` JSON-LD is the only thing Google needs; do not add per-page
  search markup.

## 7. Future levers (as the site grows)

- **Typo tolerance / fuzzy matching** — current matching is substring/word-boundary. If recall
  becomes a problem, add a small edit-distance pass in `scoreDoc` (still no dependency needed at
  this scale).
- **Synonyms** — today handled per-doc via `keywords` (and collection `aliases`). A central
  synonym map could expand query terms before scoring if it grows.
- **Body-text search** — we index titles/descriptions/keywords, not full MDX bodies. Add body
  tokens to `keywords` (truncated) if deep matches are wanted; watch index size.
- **Popular / zero-result logging** — the API is the choke point to instrument what people search
  for and what returns nothing.
- **Recent searches / suggestions** in the dropdown (client-side, localStorage).
