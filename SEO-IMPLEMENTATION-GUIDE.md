# SEO Implementation Guide — Angular + CMS (Portable)

> **Purpose:** Reusable SEO system spec. Attach this file to any Angular project — an AI agent or developer should **discover project data dynamically** and apply the patterns below without hardcoded site names, routes, or CMS keys.

---

## 0. Instructions for AI Agent (read first)

When this guide is provided in **any** project, follow this workflow **before** writing code:

### Step 1 — Discover project files

| What | Where to look |
|------|----------------|
| SEO service | `**/seo.service.ts` |
| Route → CMS mapping | `**/page-seo.config.ts` |
| API layer | `**/data.service.ts` (or equivalent) |
| Routes | `**/*.routes.ts`, `app.routes.ts` |
| Environment | `**/environment*.ts` |
| Static SEO fallback | `src/index.html`, `public/robots.txt`, `public/sitemap.xml` |

### Step 2 — Discover routes (dynamic)

```bash
# Find all Angular route paths
rg "path:\s*['\"]" --glob "*.routes.ts"
```

Build a list: `{ routePath, componentFile }` for every static page (ignore `:slug`, `:id` param routes for CMS page SEO — those use entity SEO).

### Step 3 — Discover current SEO wiring (dynamic)

```bash
rg "applyHomeSeo|applyPageSeoByRoute|applyPageSeo|applyEntitySeo|applySettingsSeo" src/
```

For each component found, record: **component → SEO method → route argument**.

### Step 4 — Discover CMS page keys (dynamic)

From the project's API (usually `GET /pages?includes=seo`):

- Read `DataService.getPages()` (or equivalent) — note response path (e.g. `res.data.data[]`).
- Each page item has `key` and `seo` object.
- Optionally call `SeoService.getCmsPageKeys()` at runtime during dev.

Build list: `{ cmsKey, hasSeoData }`.

### Step 5 — Build route → CMS key mapping (dynamic)

For each static route, compare **route segment** vs **CMS key**:

| Condition | Action |
|-----------|--------|
| Route equals CMS key (case-insensitive) | No mapping entry needed |
| Route differs from CMS key | Add to `PAGE_SEO_ROUTE_KEYS` in `page-seo.config.ts` |
| Route has no CMS key | SEO stays **empty** until admin adds page in CMS |
| Dynamic detail route (`/tours/:slug`) | Use `applyEntitySeo(entity.seo)` — not `/pages` |

**Auto-mapping algorithm:**

```
for each staticRoute in routes:
  cmsKey = find pages[].key where normalize(key) == normalize(route)
  if not found:
    cmsKey = find best match in CMS keys (manual review)
  if route != cmsKey:
    PAGE_SEO_ROUTE_KEYS[route] = cmsKey
```

`normalize(s)` = trim, lowercase, spaces → hyphens.

### Step 6 — Apply missing wiring

| Page type | Call in `ngOnInit` (or after API success) |
|-----------|-------------------------------------------|
| Home (`path: ''`) | `seoService.applyHomeSeo()` |
| Static CMS page | `seoService.applyPageSeoByRoute('<routeSegment>')` |
| Entity detail | `seoService.applyEntitySeo(data.seo)` after fetch |

**Do not** hardcode fallbacks (`title`, `description`, `image`) in components — SEO comes from API only (except Home defaults).

### Step 7 — Verify

- DevTools → `<head>` on each page type
- Confirm null API fields → empty meta tags (no injected defaults on CMS/entity pages)

---

## 1. Architecture (fixed pattern)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  environment.siteUrl          index.html (initial crawl fallback)        │
│  public/robots.txt            public/sitemap.xml                         │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│  SeoService                                                              │
│  • updateSeoData(seoData)         ← updates <head> (internal)            │
│  • applyHomeSeo()                 ← Home only                            │
│  • applyPageSeoByRoute(route)     ← static pages via /pages              │
│  • applyPageSeo(cmsKey)           ← direct CMS key lookup                │
│  • applyEntitySeo(rawSeo)         ← detail pages (tour/blog/…)           │
└───────────────┬──────────────────────┬──────────────────────┬──────────┘
                │                      │                      │
     ┌──────────▼──────────┐  ┌────────▼────────┐  ┌─────────▼─────────┐
     │ GET /settings       │  │ GET /pages      │  │ GET /{entity}/:slug│
     │ option_key: 'seo'   │  │ ?includes=seo   │  │ ?includes=seo      │
     │ (Home only)         │  │ match by `key`  │  │ response.seo       │
     └─────────────────────┘  └─────────────────┘  └────────────────────┘
                │
     ┌──────────▼──────────────────────────────────────────┐
     │  page-seo.config.ts                                 │
     │  PAGE_SEO_ROUTE_KEYS: route → cmsKey (when different)│
     └────────────────────────────────────────────────────┘
```

---

## 2. SEO source rules (never change)

| Page type | Method | Data source | If missing |
|-----------|--------|-------------|------------|
| **Home** | `applyHomeSeo()` | `GET /settings` → `option_key === 'seo'` | Home defaults from service/env |
| **Static pages** | `applyPageSeoByRoute(route)` | `GET /pages` → match `key` via config | **Empty** SEO fields |
| **Entity details** | `applyEntitySeo(seo)` | Entity API response `data.seo` | **Empty** SEO fields |

**Never** use `/settings` as fallback for CMS or entity pages.

---

## 3. Supported SEO fields (apply all from API)

These fields must be read from API and written to `<head>` when present:

```
meta_title, meta_description, meta_keywords,
og_title, og_description, og_image, og_type,
viewport, robots, canonical,
twitter_title, twitter_description, twitter_card, twitter_image, twitter_creator,
structure_schema
```

| Rule | Behavior |
|------|----------|
| API value is `null` / empty | Meta tag content = `''` (empty string) |
| CMS / entity pages | **No** hardcoded title/description/image fallbacks |
| Home page only | May use `defaultTitle`, `defaultDescription`, `defaultImage` |
| `canonical` empty | Remove `<link rel="canonical">` |
| `structure_schema` empty | Remove JSON-LD script |
| Relative image paths | Prefix with `environment.siteUrl` |

### Meta tags written by `updateSeoData`

| Tag | Source field(s) |
|-----|-----------------|
| `<title>` | `meta_title` → `og_title` |
| `meta[name=description]` | `meta_description` → `og_description` |
| `meta[name=keywords]` | `meta_keywords` |
| `meta[name=robots]` | `robots` |
| `meta[name=viewport]` | `viewport` (only if set) |
| `meta[property=og:*]` | og fields |
| `meta[name=twitter:*]` | twitter fields |
| `link[rel=canonical]` | `canonical` |
| `script[type=application/ld+json]` | `structure_schema` |

---

## 4. Core files (create or adapt per project)

| File | Role |
|------|------|
| `src/app/services/seo.service.ts` | Central SEO logic + `/pages` cache |
| `src/app/config/page-seo.config.ts` | `PAGE_SEO_ROUTE_KEYS` + `resolveCmsKeyFromRoute()` |
| `src/app/services/data.service.ts` | `getPages()`, `getSetting()`, entity fetch methods |
| `src/environments/environment*.ts` | `siteUrl`, optional `seo` defaults |
| `src/index.html` | Initial meta before Angular boot |
| `public/robots.txt` | Crawl rules |
| `public/sitemap.xml` | Sitemap URL |

---

## 5. `page-seo.config.ts` — dynamic mapping

Only add entries when **Angular route ≠ CMS key**. Unlisted routes use the route string as key (case-insensitive match).

```typescript
/**
 * Maps Angular route segment → CMS pages[].key (when they differ).
 * Discover mappings by comparing *.routes.ts paths with GET /pages keys.
 */
export const PAGE_SEO_ROUTE_KEYS: Record<string, string> = {
  // GENERATED: routeSegment: 'cms-key',
  // Example pattern (replace with project data):
  // about: 'about-us',
  // contact: 'contact-us',
};

export function resolveCmsKeyFromRoute(routePath: string): string {
  return PAGE_SEO_ROUTE_KEYS[routePath] ?? routePath;
}
```

### How to generate mappings in a new project

1. List routes: `rg "path:" --glob "*.routes.ts"`
2. List CMS keys: from `/pages` API response `data[].key`
3. For each static route, if `normalize(route) !== normalize(cmsKey)` but they represent the same page → add mapping
4. Do **not** change Angular routes — only update config

---

## 6. `SeoService` — public API

### Interfaces

```typescript
export interface SeoData {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_type?: string | null;
  viewport?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_card?: string | null;
  twitter_image?: string | null;
  twitter_creator?: string | null;
  canonical?: string | null;
  robots?: string | null;
  structure_schema?: string | null;
}
```

### Methods

| Method | When to use |
|--------|-------------|
| `applyHomeSeo(fallbacks?)` | Home route only — `/settings` |
| `applyPageSeoByRoute(routePath)` | Static page — pass **route segment** from `*.routes.ts` |
| `applyPageSeo(cmsKey)` | Direct CMS key (rare — prefer `ByRoute`) |
| `applyEntitySeo(rawSeo)` | After entity API success — pass `response.seo` |
| `normalizeApiSeo(raw)` | Normalize any API seo object |
| `getCmsPageKeys()` | Dev: list all CMS keys from API |
| `clearPagesCache()` | Dev: refresh `/pages` cache after CMS changes |

---

## 7. Wiring patterns (3 types)

### Pattern A — Home

```typescript
// home.component.ts — ngOnInit
this.seoService.applyHomeSeo();
```

- Source: `GET /settings` where `option_key === 'seo'`
- Language: read from project i18n (e.g. `localStorage.language` or `'en'`)

### Pattern B — Static CMS page

```typescript
// {page}.component.ts — ngOnInit
// Use the route segment exactly as defined in *.routes.ts
this.seoService.applyPageSeoByRoute('<routeSegment>');
```

Flow:

1. `routeSegment` → `resolveCmsKeyFromRoute()` → CMS `key`
2. `GET /pages?includes=seo` → find page by `key` (case-insensitive)
3. Found → apply all `page.seo` fields
4. Not found → empty SEO

### Pattern C — Entity detail

```typescript
// After successful API subscribe:
this.seoService.applyEntitySeo(response.data.seo);
```

- Discover entity methods in `DataService` (e.g. `getTourBySlug`, `getBlogBySlug`)
- Ensure API request includes `seo` in query/includes params
- Call **after** data is loaded, not in `ngOnInit` before fetch

---

## 8. Dynamic page inventory template

> **AI:** Generate this table from the target project — do not copy from another project.

| # | Route | Component | SEO method | CMS key / source |
|---|-------|-----------|------------|------------------|
| 1 | `/` | `{HomeComponent}` | `applyHomeSeo()` | `/settings` |
| 2 | `/{route}` | `{Component}` | `applyPageSeoByRoute('{route}')` | `/pages` → `{cmsKey}` |
| … | `/{entity}/:slug` | `{DetailComponent}` | `applyEntitySeo(data.seo)` | `GET /{entities}/:slug` |

**Generation steps:**

```bash
# 1. Routes + components
rg "path:\s*['\"]([^'\"]+)['\"]" --glob "*.routes.ts" -o

# 2. Current SEO calls
rg "apply(Page|Home|Entity)Seo" src/app/pages -l

# 3. Gaps = routes without SEO call → add wiring
# 4. Wrong method = fix to match page type (Home / Page / Entity)
```

---

## 9. API contracts (adapt paths to project)

### 9.1 Settings — Home SEO

```http
GET {apiUrl}/settings
```

```json
{
  "data": [
    {
      "option_key": "seo",
      "option_value": {
        "en": {
          "meta_title": "...",
          "meta_description": "...",
          "canonical": "{siteUrl}/"
        },
        "ar": { "...": "..." },
        "robots": "index, follow",
        "og_type": "website",
        "twitter_card": "summary_large_image"
      }
    }
  ]
}
```

> Adapt: `option_key` name, language keys, response wrapper (`data` vs array).

### 9.2 CMS pages — static page SEO

```http
GET {apiUrl}/pages?includes=seo
```

```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "key": "{cms-key}",
        "title": "...",
        "seo": {
          "meta_title": "...",
          "meta_description": "...",
          "og_image": "...",
          "og_type": "article",
          "viewport": "width=device-width, initial-scale=1",
          "robots": "index, follow",
          "canonical": "{siteUrl}/{path}",
          "twitter_card": null,
          "structure_schema": null
        }
      }
    ]
  }
}
```

> Adapt: response path (`res?.data?.data` vs `res?.data`), pagination wrapper.

> **`home` key in `/pages` is NOT used for Home route** — Home uses `/settings` only.

### 9.3 Entity detail SEO

```json
{
  "title": "...",
  "featured_image": "...",
  "seo": {
    "meta_title": "...",
    "meta_description": "...",
    "og_image": "...",
    "canonical": "...",
    "robots": "index, follow",
    "structure_schema": "{ ... }"
  }
}
```

> Adapt: entity name, slug param, includes query on fetch method.

---

## 10. Environment & static files

### environment.ts

```typescript
export const environment = {
  production: false,
  siteUrl: '{SITE_URL}',   // no trailing slash
  apiUrl: '{API_URL}',
  // optional:
  seo: {
    defaultTitle: '{SITE_NAME}',
    defaultDescription: '...',
    defaultImage: '/assets/...',
  },
};
```

### index.html (fallback before Angular)

```html
<title>{SITE_NAME}</title>
<meta name="description" content="..." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="{SITE_URL}/" />
<base href="/" />
```

### robots.txt

```
User-agent: *
Allow: /

Disallow: /login
Disallow: /profile
Disallow: /cart

Sitemap: {SITE_URL}/sitemap.xml
```

> Discover auth/private routes from `*.routes.ts` and add to `Disallow`.

---

## 11. Checklist — new project or new page

### Initial setup

- [ ] Copy/adapt `seo.service.ts` + `page-seo.config.ts`
- [ ] Set `environment.siteUrl`
- [ ] Wire `DataService.getPages()` + `getSetting()` (+ entity methods)
- [ ] Configure `index.html`, `robots.txt`, `sitemap.xml`

### Per page (dynamic discovery)

- [ ] Classify: **Home** / **Static** / **Entity detail**
- [ ] Static: add `applyPageSeoByRoute('<route>')` in component
- [ ] Entity: add `applyEntitySeo(data.seo)` after API success
- [ ] If route ≠ CMS key: add mapping in `page-seo.config.ts`
- [ ] Verify CMS key exists in `/pages` (or accept empty until admin adds it)

### QA

- [ ] DevTools → `<head>` per page type
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) if JSON-LD used

---

## 12. SPA & SSR notes

- **SPA:** Crawlers depend on JS — `index.html` is fallback until `SeoService` runs.
- **SSR:** `getCurrentUrl()` returns `siteUrl` on server — set explicit `canonical` in CMS for important pages.
- **OG images:** Must be absolute URLs — service prefixes relative paths with `siteUrl`.

---

## 13. Quick reference

```text
Home          → applyHomeSeo()                      → GET /settings
Static page   → applyPageSeoByRoute('<route>')      → GET /pages (key via config) → else empty
Entity detail → applyEntitySeo(entity.seo)            → entity API → else empty

Mapping       → page-seo.config.ts (only when route ≠ cms key)
Dev tools     → getCmsPageKeys(), clearPagesCache()
All fields    → full seo object from API, null = empty tag
```

---

## 14. AI prompt template (copy when starting a new project)

```
Apply docs/SEO-IMPLEMENTATION-GUIDE.md to this project:

1. Discover all routes from *.routes.ts
2. Discover current SEO wiring (grep applyHomeSeo, applyPageSeoByRoute, applyEntitySeo)
3. Read seo.service.ts, page-seo.config.ts, data.service.ts
4. Build PAGE_SEO_ROUTE_KEYS by comparing routes vs /pages CMS keys
5. Wire missing pages with the correct pattern (Home / Page / Entity)
6. Use API seo fields only — no hardcoded fallbacks on CMS/entity pages
7. Output the generated page inventory table
```

---

*Portable SEO guide — dynamic discovery over hardcoded project data. Version: Angular CMS pattern (Home=settings, Pages=/pages, Details=entity.seo).*
