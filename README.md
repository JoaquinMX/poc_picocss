# Vanilla News Frontend

A production-grade, framework-free frontend for a modern news platform.  
Built with Vanilla JavaScript (ES Modules) and PicoCSS (classless), this project delivers fast, SEO-friendly article pages with integrated analytics, ads, and subscription paywalls.

---

## 1) Project Overview

### What this app is
This repository contains the **delivery frontend** for a news site:
- Renders article feeds and article pages
- Integrates with analytics, ads, and subscription systems
- Optimized for performance, SEO, and maintainability without a JavaScript framework

It is designed to be deployed as a **static site behind a CDN** while dynamically loading content from a backend API.

### Who it is for
- **Editors**: Articles load fast, are SEO-friendly, and are accurately measured.
- **Product & Growth**: Views, reads, conversions, and ad performance are tracked reliably.
- **Engineers**: The codebase is simple, modular, and framework-free, making it easy to extend or migrate later.

### Problems it solves
| Problem | How it is addressed |
|-------|---------------------|
| SEO | Server-rendered HTML pages + CDN caching |
| Speed | Static assets, no JS framework, aggressive CDN caching |
| Analytics | Event-based tracking for views, reads, and funnels |
| Ads | Provider-agnostic ad placements and rules |
| Subscriptions | Paywall logic + entitlement caching |
| Maintainability | Modular ES Modules, no build step |

---

## 2) Architecture Summary

### Where this frontend fits

This frontend is a **thin delivery and interaction layer** on top of a backend that provides:

- **Articles API** – Content, metadata, SEO fields
- **Analytics ingestion API** – View, heartbeat, completion events
- **Ads provider** – External ad network (e.g. Google Ad Manager)
- **Subscription provider** – External billing + entitlements (e.g. Stripe, RevenueCat)

The frontend does **not** store or compute business data. It renders and reports.

```

Browser
|
|  HTML / JS / CSS (CDN)
v
Frontend (this repo)
|
| fetch()
v
Backend APIs
├── /api/articles
├── /api/events
├── /api/entitlements
└── Subscription + Ads providers

```

### SSR vs client-side behavior
- Pages (`index.html`, `article.html`, `subscribe.html`) are **server-rendered or pre-rendered** by your backend or static generator.
- JavaScript adds:
  - Dynamic content loading
  - Analytics
  - Paywall logic
  - Ads

If JavaScript fails, users still get readable, crawlable content.

### CDN & caching assumptions
- HTML pages and media are cached at the CDN
- API responses use short TTLs
- Article pages are invalidated when content changes

---

## 3) Tech Stack

- **Vanilla JavaScript** (ES Modules)
- **PicoCSS (classless)** for styling
- **HTML5 semantic elements** (`article`, `header`, `nav`, `main`, etc.)

### Browser APIs used
- `fetch` – API calls
- `navigator.sendBeacon` – reliable analytics delivery
- `IntersectionObserver` – scroll and visibility tracking
- `document.visibilityState` – detect active reading
- `localStorage` – meter and cached entitlements

---

## 4) Folder & File Structure

```

/
├── index.html
├── article.html
├── subscribe.html
├── css/
│   └── pico.min.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── state.js
│   ├── router.js
│   ├── render.js
│   ├── pages/
│   │   ├── home.js
│   │   ├── article.js
│   │   └── subscribe.js
│   ├── analytics/
│   │   ├── tracker.js
│   │   └── scroll.js
│   ├── ads/
│   │   └── ads.js
│   └── auth/
│       └── entitlements.js

````

### Key files

- **`api.js`**  
  Wrapper around `fetch` with base URL, retries, and JSON handling.

- **`state.js`**  
  Lightweight in-memory + localStorage state (user, meter, entitlements).

- **`router.js`**  
  Page bootstrapper. Detects which page is loaded and initializes the correct module.

- **`render.js`**  
  DOM rendering helpers (article, feed, paywall, errors).

- **`pages/`**  
  One module per page:
  - `home.js` – article feed
  - `article.js` – article detail, paywall, analytics
  - `subscribe.js` – checkout flow

- **`analytics/`**  
  Event collection and read detection.

- **`ads/`**  
  Ad slot management and provider loading.

- **`auth/`**  
  Subscription entitlements and paywall decisions.

---

## 5) How Pages Work

### Home feed
1. `index.html` loads
2. `pages/home.js` fetches `/api/articles`
3. Articles are rendered as a list of links

### Article page
1. `article.html` loads with a slug
2. `pages/article.js` fetches `/api/articles/:slug`
3. Renders article, hero media, metadata
4. Entitlements are checked
5. Paywall or ads are applied
6. Analytics tracking starts

### Subscription page
1. `subscribe.html` loads
2. `pages/subscribe.js` requests `/api/checkout`
3. Redirects to external subscription provider

### Routing / progressive enhancement
Each HTML file is a valid standalone page.  
JavaScript only enhances it. There is no client-side router.

---

## 6) Analytics Model

### View
Sent once when the article page loads.

### Heartbeat
Sent every 15 seconds while:
- The tab is visible
- The user is active on the page

Used to estimate time-on-page and engagement.

### Completion
Sent once when:
- Scroll depth ≥ 90%
- Active reading time ≥ threshold (derived from article reading time)

### Event delivery
- Events are batched in memory
- Sent using `navigator.sendBeacon`
- Fallback to `fetch` if Beacon is unavailable
- Flushed on `visibilitychange` and `beforeunload`

This ensures analytics survive tab closes and navigation.

---

## 7) Paywall & Ads Logic

### Paywall modes
- `free` – full article
- `metered` – N free articles, then paywall
- `subscriber_only` – teaser + subscribe CTA

### Metering
- Stored in `localStorage`
- Incremented on each article view
- Resettable by backend or user login

### Entitlements
- Fetched from `/api/entitlements`
- Cached locally with a TTL
- Updated via login or page refresh

### Ads
- Non-subscribers see full ad load
- Subscribers see reduced or no ads
- Ad slots are placeholders in HTML; `ads.js` decides what to load

---

## 8) API Contracts

### `GET /api/articles`
Returns a list of articles for the home feed.

### `GET /api/articles/:slug`
Returns full article data including:
- Body
- Media
- Paywall mode
- SEO fields

### `POST /api/events`
Accepts batched analytics events:
- view
- heartbeat
- complete
- ad clicks
- subscribe intent

### `GET /api/entitlements`
Returns the user’s subscription status.

### `POST /api/checkout`
Returns a redirect URL to the subscription provider.

---

## 9) Local Development

### Run locally
Any static server works.

Example:
```bash
npx serve .
````

Or:

```bash
python3 -m http.server
```

### Configuration

Edit `js/config.js`:

```js
export const config = {
  API_BASE: "http://localhost:8080",
  ANALYTICS_SAMPLE_RATE: 1.0,
  ADS_ENABLED: true
};
```

Example `.env` for your backend:

```
API_BASE=http://localhost:8080
ADS_PROVIDER_KEY=demo
SUBSCRIPTION_PROVIDER=stripe
```

---

## 10) Production Deployment Model

* This frontend is deployed as **static files**
* Served from a **CDN** (Cloudflare, Fastly, CloudFront, etc.)
* Backend controls:

  * HTML generation
  * Cache headers
  * Invalidation when articles are published

Environment values are injected via:

* `config.js` at build time, or
* CDN edge rewrites

---

## 11) Non-goals

This frontend intentionally does not:

* Use React, Vue, or any JS framework
* Contain a CMS or editorial UI
* Perform server-side rendering inside this repo
* Maintain complex client-side state
* Run ad or subscription logic itself

It is a fast, clean delivery layer that relies on backend systems for business logic.

```
