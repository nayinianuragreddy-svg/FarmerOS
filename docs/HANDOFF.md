# FarmerOS — Engineering Handoff & Architecture Reference

_Last updated: 2026-06-02. This document is the single source of truth for how FarmerOS is
built. It is intentionally exhaustive — every directory, file, route, data flow, and known
limitation is described._

---

## 1. What FarmerOS is

A geo-first platform with two intertwined products:

1. **A crop marketplace** — farmers post geotagged crop listings; buyers discover them on a live
   map of India and contact them directly (zero middlemen).
2. **A public agricultural-data terminal** (`/data`) — turns India's free government/open data
   (live mandi prices, MSP, weather/soil) into legible, decision-grade intelligence.

Design principle for `/data`: **deliver decisions, not data** — profit (not just price),
net-of-transport (not gross), a daily story (not a static table), and a question box (not dropdowns).

It is a live investor demo. **All data is real** (government/open APIs) except a small set of
demo map listings (`MOCK_PINS`) used to populate the map before real farmers sign up.

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js **16.2.6** (App Router, **Turbopack**) |
| UI | React **19.2**, TypeScript **5**, Tailwind CSS **v4** (`@tailwindcss/postcss`) |
| Map | MapLibre GL **v5.24** + Carto dark raster tiles (free, no key) + ESRI satellite toggle |
| State | Zustand **v5** with `persist` (localStorage key `farmeros-auth`) |
| Backend | Supabase (Postgres + **PostGIS** + Auth), `@supabase/supabase-js` v2, `@supabase/ssr` |
| Icons | `lucide-react` v1 |
| Toasts | `react-hot-toast` |

**Node 20** is required (Node 18 has produced failed builds). Use `nvm use 20`.

---

## 3. Repository layout

```
src/
  app/
    layout.tsx            Root layout — imports maplibre CSS + globals; fonts; metadata
    page.tsx              "/" landing (server component composing landing sections)
    globals.css           Theme tokens, .glass-panel, .app-field/.app-btn-*, animations, maplibre overrides
    map/page.tsx          "/map" → renders <MapClient/>
    data/page.tsx         "/data" → the agri-data terminal (largest file, ~1190 lines)
    auth/page.tsx         Phone→OTP login
    auth/setup/page.tsx   Role selection + profile onboarding
    dashboard/farmer/     Farmer dashboard
    dashboard/buyer/      Buyer dashboard
    list/page.tsx         Create a crop listing (farmer only)
    api/                  Route handlers (see §6)
  components/
    ui/                   Shared chrome: AppNav, SearchField, PageLayout, StatsCard, Navbar*, LanguageSelector*
    landing/              Landing sections (Hero, HeroMap, PriceTicker, Problem, HowItWorks, ForFarmers, ForBuyers, Stats, Vision, CTA, Footer, LandingNavbar*)
    map/                  FarmerOSMap, CategoryPillsBar, MapControls, BottomSheet, CropCardPopup*, FilterPanel*
    data/                 SellAdvisor, CommodityDetail, PriceSpectrum
    dashboard/            WeatherWidget
    listings/             ListingCard, GeoTagPicker
    MapClient.tsx         Client wrapper for /map (AppNav + dynamic FarmerOSMap)
    HomeClient.tsx        *Legacy/unused* alternate landing wrapper
  lib/                    api.ts, mandi.ts, constants.ts, mock-data.ts, types.ts, supabase.ts, supabase-server.ts
  store/authStore.ts      Zustand auth + listings + saved + ratings (persisted)
supabase/schema.sql       Full DB schema (PostGIS, RLS, functions, seed)
public/                   SVGs only
docs/HANDOFF.md           This file
```

\* = present but **not currently used** in the app (kept for reference): `Navbar.tsx`,
`LandingNavbar.tsx`, `HomeClient.tsx`, `LanguageSelector.tsx`, `CropCardPopup.tsx`,
`FilterPanel.tsx`. Safe to delete if you want to trim, but harmless.

---

## 4. Routes & pages

### `/` — landing (`app/page.tsx`)
Server component composing, in order: `AppNav` (transparent variant) → `HeroSection` →
`PriceTicker` → `ProblemSection` → `HowItWorksSection` → `ForFarmersSection` →
`ForBuyersSection` → `StatsSection` → `VisionSection` → `CTASection` → `Footer`.
- **HeroSection** — split layout: left copy + CTAs; right is a **real MapLibre map** (`HeroMap.tsx`)
  with refined price-pill markers + one floating glass crop card whose Agmarknet figure is **live**
  (national tomato avg via `fetchMandiSnapshot`).
- **PriceTicker** — scrolling marquee of the most-active commodities, **live** from the snapshot.
- **ProblemSection** — scroll-triggered "₹1.00 → ₹0.33" middleman countdown.
- **CTASection** — closing block with dotted map texture + scattered crop-pin dots.

### `/map` — interactive crop map (`MapClient.tsx` → `FarmerOSMap.tsx`)
- `AppNav` (solid) with the unified search: typing filters pins; a place name geocodes + flies the map
  (handled inside `FarmerOSMap`'s debounced geocode effect; crop-name matches are skipped). Reads `?q=` deep links.
- Below nav: seasonal intelligence bar → `CategoryPillsBar` → full map → `BottomSheet` on pin click.
- Markers: **wrapper div (maplibre owns position) + inner styled pill** — critical: never set
  `position`/`transform` on the marker element itself or it stretches full-width (the v5 marker bug we hit).
- Pins are `MOCK_PINS` + the logged-in farmer's own active listings.

### `/data` — agri-data terminal (`app/data/page.tsx`)
The centerpiece. Sticky in-page section nav: Overview · Prices · Sell Smart · Weather & Soil ·
In Season · Sources. See §7 for the full feature breakdown.

### `/auth`, `/auth/setup`, dashboards, `/list`
See §8 (auth) and the per-file notes. Dashboards + `/list` use `PageLayout` (which renders `AppNav`).

---

## 5. Data libraries (`src/lib`)

- **`types.ts`** — domain types: `UserRole`, `CropCategory` (12 categories), `User`, `FarmerProfile`,
  `BuyerProfile`, `CropListing`, `Rating`, `CropTaxonomy`, `MapPin`.
- **`constants.ts`** — `MAP_STYLE` (Carto dark raster), `INDIA_CENTER/ZOOM/BOUNDS`, `CATEGORY_CONFIG`
  (12 categories → label/emoji/color/mapColor), `CROP_TAXONOMY` (~180 crops by category),
  `INDIAN_STATES`, `QUANTITY_UNITS`, `LISTING_EXPIRY_DAYS`, `LISTING_ALERT_DAY`, `SUPPORTED_LANGUAGES`.
- **`mock-data.ts`** — `MOCK_PINS`: 30 demo listings (5 "fresh"/today). The **only** intentional mock.
- **`mandi.ts`** (client) — the live-price client layer:
  - `fetchMandiSnapshot(state?)` — memoized-per-scope fetch of `/api/mandi-snapshot`; returns
    `{ commodities, states, mandiCount, commodityCount, date }`.
  - `CommoditySnapshot`, `StateFacet`, `MandiSnapshot` types.
  - `commodityEmoji()`, `prettyCommodity()` (strips Agmarknet parentheticals).
  - `commodityCategory()` + `CATEGORIES` — keyword classifier → browse-by-category facet.
  - `getMSPFor()` — MSP floor (₹/qtl) by keyword, the ~23 mandated crops (2025-26 figures).
  - `getBreakEvenFor()` — **MSP ÷ 1.5** (the govt A2+FL formula) → Profit Lens break-even.
  - `STATE_CENTROIDS` + `stateDistanceKm()` + `FREIGHT_PER_QTL_KM` (0.5) — net-realization geography.
- **`api.ts`** (mixed) — external API helpers + reference data:
  - `fetchWeather`, `geocodeLocation`, `reverseGeocode`, `lookupPincode`, `getCropDescription`
    (Wikipedia), `fetchSunriseSunset`.
  - `getMandiPrice` (async, hits `/api/mandi-prices`), `getMandiPriceSync` (fallback from `MOCK_MANDI_PRICES`),
    `getPriceTickerData`.
  - `MSP_PRICES` / `getMSP`, `SUPPORTED_LANGUAGES`, `LangCode`.
- **`supabase.ts`** — browser client (`createClient`). **`supabase-server.ts`** —
  `createServerSupabaseClient` (cookie-based) + `createAdminClient` (service role, server-only, bypasses RLS).

### Store — `src/store/authStore.ts` (Zustand, persisted as `farmeros-auth`)
Holds `user`, `session`, `activeRole`, `farmerProfile`, `buyerProfile`, `myListings`,
`savedListingIds`, `ratings`, `is_new`. Actions: `loginWithSession`, `login`, `logout`,
`setFarmerProfile`, `setBuyerProfile`, `setActiveRole`, `markProfileComplete`, `addListing`,
`updateListing`, `deleteListing`, `hideListing`, `renewListing`, `toggleSaved`,
`updatePreferredCrops`, `addRating`. **Listings are currently client-side/persisted** (not yet
round-tripped to Supabase for the demo).

---

## 6. API routes (`src/app/api`)

| Route | Method | Purpose / contract |
|-------|--------|--------------------|
| `auth/send-otp` | POST | Demo stub — OTP is always **123456** (no SMS). |
| `auth/verify-otp` | POST | `{phone, otp}` → verifies `123456`, creates/sign-in Supabase user via deterministic email `91{phone}@farmeros.in` + password `FOS_{phone}_farmeros2024` (admin client), returns JWT session. |
| `profile` | POST | Upsert farmer/buyer profile. |
| `listings` | GET/POST/PATCH/DELETE | PostGIS radius query (`listings_within_radius`) + CRUD (Bearer auth). |
| `mandi-prices` | GET | `?commodity=&state=&limit=` → Agmarknet rows mapped to `{commodity,market,district,state,variety,grade,min/max/modalPrice,pricePerKg,date}`. `state=all` omits the state filter. Lowercase Agmarknet field ids. |
| `mandi-snapshot` | GET | `?state=` → aggregates the full day's rows **per commodity** (avg/min/max, count, dearest `bestMarket`, cheapest `worstMarket`); returns the **states facet**, `mandiCount`, `commodityCount`. Memoizes RAW rows in-memory (1h); **uses `cache:'no-store'`** on the upstream fetch (the old `next:{revalidate}` served stale 267-row partials). Records the national daily snapshot to `mandi_history` once/day via the admin client (the "history clock"). |
| `mandi-history` | GET | `?commodity=` → date-ordered `{date,avg_modal,min_modal,max_modal,mandi_count}` series from `mandi_history` → powers trend sparklines. |
| `nearby-mandis` | GET | `?lat=&lng=&radius=` → OSM Overpass `marketplace` nodes; computes **haversine distance** and sorts; tries multiple Overpass mirrors (the public endpoint is heavily rate-limited and may return nothing). |

**Agmarknet resource id:** `9ef84268-d588-465a-a308-a864a43d0070` ("Current Daily Price of Various
Commodities from Various Markets (Mandi)"). Field ids are **lowercase** (`commodity, state, district,
market, variety, grade, modal_price, min_price, max_price, arrival_date`); modal prices can be decimal.

---

## 7. The `/data` terminal — feature breakdown

1. **History clock** — `mandi-snapshot` writes the national daily snapshot to Supabase
   `mandi_history` (once/day, awaited, integer-rounded). `mandi-history` reads it back → trends
   grow each day. **This is the moat: price history the govt feed doesn't provide.**
2. **Profit Lens** — `getBreakEvenFor` (MSP÷1.5) → each crop shows "+X% over cost / −X% below cost".
3. **Price Spectrum** (`PriceSpectrum.tsx`) — the signature viz: every mandi a dot on a ₹ axis with
   MSP floor line + break-even line + shaded profit zone + median + hover tooltip. Used in `CommodityDetail`.
4. **Net-realization** (`SellAdvisor.tsx`) — "Selling from <state>" re-ranks mandis by
   **price − freight** (state-centroid distance × `FREIGHT_PER_QTL_KM`). Labelled as an estimate.
5. **Craft** — shimmer skeleton loaders, jargon tooltips (MSP/quintal/APMC), colour-as-data,
   sun panel follows searched location, real mandi distances (km).
6. **Daily Mandi Report** — auto-written briefing from the snapshot (most-active, biggest spread,
   priciest, above-MSP count) + a one-tap **WhatsApp share**. Replaced the old filler card.
7. **Ask-anything** — hero query box; deterministic parser matches a commodity + optional state +
   intent (cheap/dear/msp) → an answer card with a "Full breakdown" button (opens `CommodityDetail`).

**Price Explorer** (the table) — full-width; state selector (re-fetches live), category chips,
sort (most-active/price/vs-MSP/A–Z), search, compare (pin up to 4), columns for avg ₹/kg, # mandis,
MSP ₹ (✓/⚠), dearest + cheapest mandi (with ₹), day range. Click a row → `CommodityDetail`
slide-over (stat grid, MSP, Profit Lens, **Price Spectrum**, trend sparkline, state geography,
variety breakdown, top-25 mandis, Wikipedia blurb, "See on map").

**Conditions** — one location search drives Weather (Open-Meteo: temp/humidity/wind + **soil
moisture/temp + 3-day rain probability + agro-advisory**), Nearest Mandis (OSM, with distance),
and the Sun panel (follows location, no longer hardcoded to Delhi).

---

## 8. Auth flow

Phone-first, no real SMS (demo). `auth/page.tsx`: enter phone → OTP step → enter **123456** →
`verify-otp` creates/sign-in the Supabase user (deterministic email/password) and returns a JWT
session stored in the Zustand store. New users go to `auth/setup` (role + profile, pincode
auto-fill via India Post); on completion they land on `/dashboard/{role}`.

---

## 9. Supabase schema (`supabase/schema.sql`)

Extensions: `postgis`, `uuid-ossp`. Tables: `farmer_profiles`, `buyer_profiles`, `crop_taxonomy`,
`crop_listings` (with `geo_point` GIST index), `crop_images`, `listing_expiry_log`, `ratings`,
`notifications_log`, `saved_listings`, **`mandi_history`** (daily price history — date, commodity,
avg/min/max_modal, mandi_count; public-read RLS). Functions: `listings_within_radius(lat,lng,radius)`,
`update_farmer_rating()`, `expire_old_listings()`. RLS is enabled on all tables.

Apply: `PGPASSWORD=<db pw> psql "postgresql://postgres@db.<project>.supabase.co:5432/postgres" -f supabase/schema.sql`.

---

## 10. Design system

- Background **#070C0A** everywhere; accent emerald **#00C97A**; amber **#D4841A**.
- `.glass-panel` (warm-dark translucent), `.app-field` / `.app-field-error`, `.app-btn-primary` /
  `.app-btn-ghost` in `globals.css`. One nav (`AppNav`) + one search (`SearchField`) across all pages.
- H1 ≤ 58px; section padding ≤ 72px; cards `0 36px 72px rgba(0,0,0,0.55)`.

---

## 11. Known limitations & gotchas

- **`next build` + `next dev` on the same `.next` corrupts the route manifest** → all `/api/*` 404.
  Fix: stop both, `rm -rf .next`, restart. (Build for validation only when dev is stopped.)
- **OSM Overpass** (nearby mandis) is heavily rate-limited / sometimes unreachable from server
  networks → the panel may be empty. Code + mirrors are correct; degrades gracefully (no mock).
- **Listings are client-side only** (Zustand-persisted), not yet persisted to Supabase in the demo.
- **Net-realization distance is state-centroid-level** (intra-state ≈ 110 km), labelled as an estimate.
- **MSP/Profit Lens cover only the ~23 mandated crops**; others show no MSP/break-even.
- **`mandi_history` was created live via psql** and is now also in `schema.sql`.
- `.env.local` is gitignored (holds secrets) — recreate on a fresh clone.
- Unused files retained for reference (see §3); the language toggle (`SUPPORTED_LANGUAGES`,
  `LanguageSelector.tsx`) is wired in data but not surfaced in the UI yet.

---

## 12. Roadmap (discussed, not built)

Persist listings to Supabase · global command-palette search across the whole app · price alerts ·
real vernacular (Bhashini) toggle · trust/verification layer · demand-side ("buyers looking for") pins ·
FPO/aggregation ("pool a truckload from N nearby farmers").
