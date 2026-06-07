# دليل تنفيذ SEO — Splendor Journeys / Majestic

> **الغرض:** مرجع واحد لنظام SEO في المشروع — مصادر البيانات، الدوال، وربط الصفحات بالـ CMS.

---

## 1. نظرة عامة على البنية

```
┌──────────────────────────────────────────────────────────────────────────┐
│  environment.ts          siteUrl (+ seo defaults مُوصى به مستقبلاً)        │
│  index.html              meta أولية قبل تحميل Angular                    │
│  public/robots.txt + sitemap.xml                                           │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────────┐
│  SeoService (src/app/services/seo.service.ts)                              │
│  • updateSeoData()              ← تحديث <head> (داخلي)                    │
│  • applyHomeSeo()               ← Home فقط                                 │
│  • applyPageSeo() / applyPageSeoByRoute()  ← صفحات CMS                    │
│  • applySettingsSeo()           ← صفحات بدون مفتاح CMS                    │
│  • applyEntitySeo()             ← tour / blog / destination details       │
└───────────────┬──────────────────────┬──────────────────────┬──────────────┘
                │                      │                      │
     ┌──────────▼──────────┐  ┌────────▼────────┐  ┌─────────▼─────────┐
     │ GET /settings       │  │ GET /pages      │  │ GET entity by slug │
     │ option_key: 'seo'   │  │ ?includes=seo   │  │ includes=seo       │
     │ (Home + fallback)   │  │ match by `key`  │  │ data.seo + title   │
     └─────────────────────┘  └─────────────────┘  └────────────────────┘
                │
     ┌──────────▼──────────────────────────────────────────┐
     │  page-seo.config.ts                                │
     │  route segment → CMS key (مثال: about → about-us)  │
     └────────────────────────────────────────────────────┘
```

### 1.1 قواعد مصدر SEO (ملخص)

| نوع الصفحة | الدالة | مصدر البيانات |
|------------|--------|----------------|
| **Home** (`/`) | `applyHomeSeo()` | `GET /settings` فقط — **لا** يستخدم `/pages` |
| **صفحات CMS** (about, blog, contact, faq, rent-car…) | `applyPageSeoByRoute()` | `GET /pages?includes=seo` حسب `key` → إن لم تُوجد → `settings` |
| **تفاصيل** (tour / blog / destination) | `applyEntitySeo()` | `data.seo` من استجابة التفاصيل |
| **باقي الصفحات** (tour list, login, cart…) | `applySettingsSeo()` | `GET /settings` + fallbacks محلية |

### 1.2 أولوية الحقول داخل `updateSeoData`

| الحقل | الأولوية (من الأعلى للأقل) |
|--------|---------------------------|
| **Title** | `meta_title` → `og_title` → `fallbackTitle` → `defaultTitle` |
| **Description** | `meta_description` → `og_description` → `fallbackDescription` → `defaultDescription` |
| **Image** | `og_image` → `twitter_image` → `fallbackImage` → `defaultImage` |
| **Canonical / og:url** | `canonical` من `seoData` → `window.location.href` (أو `siteUrl` على السيرفر) |
| **Robots** | `seoData.robots` → `'index, follow'` |

---

## 2. الملفات الأساسية

| الملف | الدور |
|-------|------|
| `src/app/services/seo.service.ts` | الخدمة المركزية + cache لقائمة `/pages` |
| `src/app/config/page-seo.config.ts` | ربط مسار Angular → مفتاح CMS `pages[].key` |
| `src/app/services/data.service.ts` | `getSetting()`, `getPages()`, `getTourBySlug()`, … |
| `src/environments/environment*.ts` | `siteUrl` |
| `src/index.html` | قيم أولية للزحف |
| `public/robots.txt` | قواعد الزحف |
| `public/sitemap.xml` | خريطة الموقع |

---

## 3. `page-seo.config.ts` — ربط المسارات بالـ CMS

**المسار:** `src/app/config/page-seo.config.ts`

```typescript
export const PAGE_SEO_ROUTE_KEYS: Record<string, string> = {
  about: 'about-us',      // route /about  → CMS key "about-us"
  blog: 'blog',
  contact: 'contact-us',
  faq: 'faqs',
  'rent-car': 'car-rental',
  gallery: 'Gallery',
  // ...
};
```

### متى تحتاج تعديل الكود؟

| الحالة | ماذا تفعل |
|--------|-----------|
| الأدمن يحدّث SEO لصفحة موجودة (about, blog…) | **لا شيء** — البيانات من API عند التحميل |
| الأدمن يضيف `key` جديد في الـ dashboard **ورابط Angular موجود** | سطر واحد في `PAGE_SEO_ROUTE_KEYS` إن كان اسم الـ route ≠ الـ key |
| الأدمن يضيف صفحة **ورابط Angular جديد** | route في `data.routes.ts` + سطر في config + `applyPageSeoByRoute()` في الـ component |

### مثال: صفحة `career` جديدة

```typescript
// 1. page-seo.config.ts
career: 'career',

// 2. career.component.ts — ngOnInit
this.seoService.applyPageSeoByRoute('career', {
  title: ' Career',
  description: 'Join our team',
  image: '/assets/image/splendor-logo.webp',
});
```

إن تطابق اسم الـ route مع مفتاح CMS (`/gallery` و `gallery`)، يكفي:

```typescript
this.seoService.applyPageSeoByRoute('gallery', { ... });
```

بدون إضافة سطر في الـ config.

### أدوات مساعدة (تطوير)

```typescript
// عرض كل مفاتيح الصفحات من الـ API
this.seoService.getCmsPageKeys().subscribe((keys) => console.log(keys));

// بعد تغيير الصفحات في الـ CMS أثناء التطوير
this.seoService.clearPagesCache();
```

---

## 4. `SeoService` — الدوال العامة

**المسار:** `src/app/services/seo.service.ts`

### 4.1 الواجهات

```typescript
export interface SeoData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_card?: string;
  twitter_image?: string;
  canonical?: string;
  robots?: string;
  structure_schema?: string; // JSON-LD كنص
}

export interface SeoFallbacks {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  structure_schema?: string;
}
```

### 4.2 دوال التطبيق (استخدمها من الـ Components)

| الدالة | الاستخدام |
|--------|-----------|
| `applyHomeSeo(fallbacks?)` | الصفحة الرئيسية — من `/settings` فقط |
| `applyPageSeoByRoute(routePath, fallbacks?)` | صفحة CMS عبر مسار Angular (يقرأ `page-seo.config.ts`) |
| `applyPageSeo(pageKey, fallbacks?)` | صفحة CMS بمفتاح CMS مباشر (مثال `'about-us'`) |
| `applySettingsSeo(fallbacks?)` | صفحات بدون مفتاح في `/pages` |
| `applyEntitySeo(rawSeo, fallbacks?)` | tour-details / blog-details / destination-details |
| `updateSeoData(seoData, title?, desc?, image?)` | تحديث يدوي منخفض المستوى (نادر) |

### 4.3 دوال مساعدة

| الدالة | الوظيفة |
|--------|---------|
| `normalizeApiSeo(raw)` | تحويل `seo` من API مع تجاهل null والقيم الفارغة |
| `extractSeoFromSettings(settings[], lang)` | استخراج SEO من `option_key === 'seo'` |
| `findPageByKey(pages[], key)` | بحث case-insensitive عن صفحة CMS |
| `getCurrentLanguage()` | `localStorage.language` أو `'en'` |
| `getCmsPageKeys()` | Observable بكل مفاتيح الصفحات من API |
| `clearPagesCache()` | إعادة جلب `/pages` |
| `resetToDefaults()` | إعادة العنوان والوصف الافتراضي (غير مستخدم حالياً) |

### 4.4 `updateSeoData` — ما يُحدَّث في `<head>`

- `<title>`
- `meta`: description, keywords, robots
- Open Graph: og:title, og:description, og:image, og:type, og:url
- Twitter: card, title, description, image
- `<link rel="canonical">`
- `<script type="application/ld+json">` عند وجود `structure_schema`

**الصور:** `getFullImageUrl()` يضيف `environment.siteUrl` للمسارات النسبية (`/assets/...`).

---

## 5. أنماط الاستدعاء في الصفحات (4 أنماط)

### النمط 1 — Home (`applyHomeSeo`)

**الملف:** `pages/home/home.component.ts`

```typescript
ngOnInit(): void {
  this.seoService.applyHomeSeo();
}
```

- يستدعي `DataService.getSetting()` (مع cache في DataService).
- يقرأ `option_key === 'seo'` حسب اللغة الحالية.

---

### النمط 2 — صفحات CMS (`applyPageSeoByRoute`)

**أمثلة:** about, blog, contact, faq, rent-car

```typescript
ngOnInit(): void {
  this.seoService.applyPageSeoByRoute('about', {
    title: ' About Us',
    description: 'Learn more about us',
    image: '/assets/image/splendor-logo.webp',
  });
}
```

**التدفق:**

1. `routePath` → `PAGE_SEO_ROUTE_KEYS` → مفتاح CMS (مثال `about-us`)
2. `GET /pages?includes=seo` → إيجاد الصفحة بـ `key`
3. إن وُجدت → `page.seo` + fallbacks
4. إن لم تُوجد → `extractSeoFromSettings` + fallbacks

**Endpoint:** `DataService.getPages()` → `res.data.data[]`

---

### النمط 3 — صفحات بدون مفتاح CMS (`applySettingsSeo`)

**أمثلة:** tour list, destination list, login, cart, make-trip, profile…

```typescript
ngOnInit(): void {
  this.seoService.applySettingsSeo({
    title: ' Tours',
    description: 'Search and discover amazing tours…',
    image: '/assets/image/splendor-logo.webp',
  });
}
```

يستخدم إعدادات الموقع العامة من `/settings` عندما لا توجد صفحة مطابقة في `/pages`.

---

### النمط 4 — تفاصيل كيان (`applyEntitySeo`)

**أمثلة:** tour-details, blog-details, destination-details

**بعد نجاح API:**

```typescript
const tourSeo = this.tour?.seo;
this.seoService.applyEntitySeo(tourSeo, {
  title: this.tour?.title,
  description:
    tourSeo?.meta_description ||
    tourSeo?.og_description ||
    'Explore the tour details',
  image:
    tourSeo?.og_image ||
    tourSeo?.twitter_image ||
    this.tour?.featured_image ||
    '/assets/image/splendor-logo.webp',
  keywords: tourSeo?.meta_keywords || '',
  canonical: tourSeo?.canonical || '',
  robots: tourSeo?.robots || '',
  structure_schema: tourSeo?.structure_schema || '',
});
```

**Endpoints:**

| Component | DataService |
|-----------|-------------|
| tour-details | `getTourBySlug(slug)` — `includes=…,seo,…` |
| blog-details | `getBlogBySlug(slug)` |
| destination-details | `getDestinationBySlug(slug)?includes=seo` |

`applyEntitySeo` يدمج `data.seo` من API مع `SeoFallbacks` ثم يستدعي `updateSeoData`.

---

## 6. جدول الصفحات — الدالة المستخدمة حالياً

| # | Component | الدالة | مصدر SEO |
|---|-----------|--------|----------|
| 1 | Home | `applyHomeSeo()` | `/settings` |
| 2 | About | `applyPageSeoByRoute('about')` | `/pages` → `about-us` |
| 3 | Blog | `applyPageSeoByRoute('blog')` | `/pages` → `blog` |
| 4 | Contact | `applyPageSeoByRoute('contact')` | `/pages` → `contact-us` |
| 5 | FAQ | `applyPageSeoByRoute('faq')` | `/pages` → `faqs` |
| 6 | Rent car | `applyPageSeoByRoute('rent-car')` | `/pages` → `car-rental` |
| 7 | Tour list | `applySettingsSeo()` | `/settings` |
| 8 | Tour details | `applyEntitySeo(tour.seo, …)` | `GET /tours/:slug` |
| 9 | Destination list | `applySettingsSeo()` | `/settings` |
| 10 | Destination details | `applyEntitySeo(data.seo, …)` | `GET /destinations/:slug` |
| 11 | Blog details | `applyEntitySeo(data.seo, …)` | `GET /blogs/:slug` |
| 12 | Blog category | `applySettingsSeo()` | `/settings` |
| 13 | Category (tours) | `applySettingsSeo()` | `/settings` |
| 14 | Make trip | `applySettingsSeo()` | `/settings` |
| 15 | Guest experience | `applySettingsSeo()` | `/settings` |
| 16 | Best time to visit | `applySettingsSeo()` | `/settings` |
| 17 | Login / Signup / Forget password | `applySettingsSeo()` | `/settings` |
| 18 | Profile / Cart | `applySettingsSeo()` | `/settings` |

---

## 7. شكل بيانات API

### 7.1 إعدادات الموقع — Home و fallback عام

```http
GET /settings
```

```json
{
  "option_key": "seo",
  "option_value": {
    "en": {
      "meta_title": "…",
      "meta_description": "…",
      "meta_keywords": "…",
      "og_title": "…",
      "og_description": "…",
      "twitter_title": "…",
      "twitter_description": "…",
      "canonical": "https://splendorjourneys.com/",
      "structure_schema": "{ … }"
    },
    "ar": { "…": "…" },
    "robots": "index, follow",
    "og_type": "website",
    "twitter_card": "summary_large_image"
  }
}
```

### 7.2 صفحات CMS

```http
GET /pages?includes=seo
```

```json
{
  "data": {
    "data": [
      {
        "id": 2,
        "key": "about-us",
        "title": "About Us",
        "short_description": "…",
        "seo": {
          "meta_title": "…",
          "meta_description": "…",
          "og_image": "…",
          "canonical": "…",
          "robots": "index, follow",
          "structure_schema": null
        }
      }
    ]
  }
}
```

**مفاتيح موجودة في الـ CMS (أمثلة):** `home`, `about-us`, `blog`, `contact-us`, `faqs`, `car-rental`, `Gallery`, `privacy-policy`, `terms-and-conditions`, `travel-policy`, `privacy-and-cookies`, …

> **ملاحظة:** `home` في `/pages` **لا يُستخدم** للصفحة الرئيسية — Home يأخذ SEO من `/settings` فقط.

### 7.3 كيان (Tour / Blog / Destination)

```json
{
  "title": "Swimming with Dolphins…",
  "featured_image": "https://backend…/image.jpg",
  "seo": {
    "meta_title": "…",
    "meta_description": "…",
    "og_image": "…",
    "canonical": "…",
    "meta_keywords": "…",
    "robots": "index, follow",
    "structure_schema": "{ … }"
  }
}
```

---

## 8. `environment` و `index.html`

### 8.1 environment

```typescript
export const environment = {
  production: false,
  siteUrl: 'https://splendorjourneys.com', // بدون / في الآخر
  apiUrl: 'https://…/api',
};
```

القيم الافتراضية (`defaultTitle`, `defaultDescription`, `defaultImage`) حالياً داخل `seo.service.ts`. **مُوصى به:** نقلها إلى `environment.seo` (انظر القسم 10).

### 8.2 index.html

```html
<title>Splendor Journeys</title>
<meta name="description" content="…" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://splendorjourneys.com/" />
<base href="/" />
```

`<base href="/">` **مطلوب** لـ Angular — لا تحذفه.

### 8.3 robots.txt

```
User-agent: *
Allow: /

Disallow: /login
Disallow: /signup
Disallow: /forget-password
Disallow: /profile
Disallow: /cart
Disallow: /checkout

Sitemap: https://splendorjourneys.com/sitemap.xml
```

---

## 9. Checklist — مشروع جديد أو صفحة جديدة

### إعداد أولي

- [ ] `environment.siteUrl`
- [ ] نسخ `seo.service.ts` + `page-seo.config.ts`
- [ ] `index.html` + `public/robots.txt` + `public/sitemap.xml`
- [ ] `DataService.getPages()` و `getSetting()`

### لكل صفحة

- [ ] حدد النمط (Home / CMS / Settings / Entity)
- [ ] استدعِ الدالة المناسبة في `ngOnInit` أو بعد `subscribe` ناجح
- [ ] إن CMS: تأكد من `key` في الـ dashboard + سطر في `page-seo.config.ts` إن لزم

### تحقق

- [ ] DevTools → Elements → `<head>`
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) عند JSON-LD
- [ ] `curl …/robots.txt` و `/sitemap.xml`

---

## 10. تحسين مُوصى به — defaults من `environment`

```typescript
// environment.ts
seo: {
  siteName: 'Splendor Journeys',
  defaultTitle: 'Splendor Journeys',
  defaultDescription: 'Discover amazing tours…',
  defaultImage: '/assets/image/splendor-logo.webp',
},
```

```typescript
// seo.service.ts — بداية الكلاس
private defaultTitle = environment.seo.defaultTitle;
private defaultDescription = environment.seo.defaultDescription;
private defaultImage = environment.seo.defaultImage;
```

---

## 11. SPA و SSR

- **SPA:** محركات البحث تعتمد على JavaScript؛ `index.html` = fallback حتى يعمل `SeoService`.
- **SSR:** على السيرفر `getCurrentUrl()` يرجع `siteUrl` — ضع `canonical` صريحاً في `seoData` للصفحات المهمة.
- **صور OG:** يجب أن تكون URLs مطلقة — `getFullImageUrl` يحول المسارات النسبية.

---

## 12. أخطاء Console شائعة (ليست من المشروع)

رسائل مثل:

```text
content_script.js:726 Tag not handled: base
content_script.js:726 Tag not handled: style
```

تأتي من **إضافة متصفح** (أداة SEO، مدير كلمات مرور، …) وليست من Angular. للتأكيد: افتح الموقع في **نافذة خاصة بدون إضافات** — الرسائل تختفي.

لا تحذف `<base href="/">` من `index.html`.

---

## 13. نسخة مختصرة للمطور

```text
Home          → applyHomeSeo()                    → GET /settings
CMS pages     → applyPageSeoByRoute('about', …)   → GET /pages (key) → else settings
Other pages   → applySettingsSeo({ fallbacks })   → GET /settings
Details       → applyEntitySeo(entity.seo, …)     → entity API (tour/blog/destination)

Config        → src/app/config/page-seo.config.ts (route → CMS key)
New CMS page  → admin updates dashboard only (no deploy) OR add route + config line
Dev tools     → getCmsPageKeys(), clearPagesCache()
```

---

## 14. استبدال سريع عند نقل المشروع

| ابحث عن | استبدل بـ |
|---------|-----------|
| `Splendor Journeys` | `{{SITE_NAME}}` |
| `splendorjourneys.com` | `{{DOMAIN}}` |
| `https://splendorjourneys.com` | `{{SITE_URL}}` |
| `/assets/image/splendor-logo.webp` | `{{DEFAULT_OG_IMAGE}}` |

---

*آخر تحديث: نظام SEO المركزي — `applyHomeSeo` / `applyPageSeoByRoute` / `applySettingsSeo` / `applyEntitySeo` + `page-seo.config.ts` — مشروع Majestic / Splendor Journeys.*
