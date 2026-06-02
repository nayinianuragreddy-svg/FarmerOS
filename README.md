# 🌾 FarmerOS — India's Geo-First Crop Discovery & Agri-Data Platform

FarmerOS connects Indian farmers directly to buyers on a **live map**, and turns India's
open government data into a **world-class agricultural terminal** — live mandi prices, MSP,
weather & soil, and "where should I sell today?" decisions. Built as a real, working product
on **100% free, real data sources** (no mocks except a small set of demo map listings).

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind CSS v4 · MapLibre GL v5 · Zustand v5 · Supabase (Postgres + PostGIS + Auth)
- **Three surfaces:** `/` (story landing) · `/map` (interactive crop map) · `/data` (public agri-data terminal)

> Full architecture, per-file reference, data flows and gotchas: **[docs/HANDOFF.md](docs/HANDOFF.md)**.

---

## Quick start

```bash
nvm use 20          # Node 20 (project targets Node 20; 18 has failed builds)
npm install
npm run dev         # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`.

### Environment (`.env.local` — gitignored, required)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only: admin writes + history clock
AGMARKNET_KEY=<data.gov.in API key>            # server-only: live mandi prices
# optional / unused: NEXT_PUBLIC_OWM_KEY, NEXT_PUBLIC_APP_URL
```

- `AGMARKNET_KEY`: a personal **data.gov.in** key (login via Janparichay → My Account → "Generate API Key").
  Without it the app falls back to a rate-limited public sample key.
- Supabase DB schema lives in [`supabase/schema.sql`](supabase/schema.sql). Apply with `psql`.

---

## What's inside (high level)

| Route | What it is |
|-------|-----------|
| `/` | Marketing landing — hero with live MapLibre map, live price ticker, the "₹1→₹0.33 middleman" story, how-it-works, stats, vision, CTA. |
| `/map` | Full interactive crop map — unified top bar + search (crop filter / location fly-to), seasonal bar, category pills, Zillow-style price-pill markers, bottom sheet on click. |
| `/data` | **The agri-data terminal.** Ask-anything box, live national snapshot, Daily Mandi Report (shareable), Sell Advisor (net-of-transport), full Price Explorer (state/category/sort/compare/drill-down with the Price Spectrum viz), Weather & Soil advisory, nearby mandis, crop calendar, sources. |
| `/auth`, `/auth/setup` | Phone → OTP login (demo OTP **123456**) + role/profile onboarding. |
| `/dashboard/farmer`, `/dashboard/buyer` | Role dashboards. `/list` — create a crop listing. |

### Live data sources (all free, all real)
Agmarknet daily mandi prices (data.gov.in) · MSP floor prices (CACP) · Open-Meteo weather + soil ·
Nominatim geocoding · OSM Overpass (nearby mandis) · India Post (pincode) · Wikipedia (crop info) ·
Sunrise-Sunset. Supabase stores auth, profiles, listings, and a **daily price-history table** that
accumulates trends over time.

---

## Conventions & gotchas

- **Node 20** required (`nvm use 20`). Tailwind v4 (`@import "tailwindcss"` in `globals.css`).
- **Never run `next build` while `next dev` is running on the same `.next`** — it corrupts the route manifest (all `/api/*` → 404). Fix: `rm -rf .next` and restart.
- MapLibre CSS is imported in `src/app/layout.tsx` (a per-component import did not bundle under Turbopack).
- Design system: dark `#070C0A`, accent `#00C97A`, amber `#D4841A`; shared `.glass-panel`, `.app-field`, `.app-btn-*`; one nav (`AppNav`) + one search (`SearchField`) across all pages.

See **[docs/HANDOFF.md](docs/HANDOFF.md)** for the exhaustive per-file map, API contracts, data flows, and the full list of known limitations.
