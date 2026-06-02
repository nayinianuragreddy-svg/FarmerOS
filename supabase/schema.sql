-- ============================================================
-- FarmerOS — Supabase Database Schema
-- Paste this into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable PostGIS for geo-queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── FARMER PROFILES ────────────────────────────────────────
CREATE TABLE farmer_profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  village      TEXT NOT NULL,
  mandal       TEXT,
  district     TEXT NOT NULL,
  state        TEXT NOT NULL,
  pincode      TEXT NOT NULL,
  rating_avg   NUMERIC(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BUYER PROFILES ─────────────────────────────────────────
CREATE TABLE buyer_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  village         TEXT,
  mandal          TEXT,
  district        TEXT NOT NULL,
  state           TEXT NOT NULL,
  pincode         TEXT NOT NULL,
  preferred_crops TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CROP TAXONOMY ──────────────────────────────────────────
CREATE TABLE crop_taxonomy (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category     TEXT NOT NULL,
  name         TEXT NOT NULL,
  hindi_name   TEXT,
  popular      BOOLEAN DEFAULT FALSE,
  UNIQUE(category, name)
);

-- ─── CROP LISTINGS ──────────────────────────────────────────
CREATE TABLE crop_listings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_category  TEXT NOT NULL,
  crop_name      TEXT NOT NULL,
  crop_variety   TEXT,
  quantity       NUMERIC NOT NULL CHECK (quantity > 0),
  unit           TEXT NOT NULL CHECK (unit IN ('kg', 'quintal', 'tonne')),
  expected_price NUMERIC,
  price_unit     TEXT,
  is_organic     BOOLEAN DEFAULT FALSE,
  images         TEXT[] DEFAULT '{}',
  geo_point      GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS geo column
  harvest_date   DATE,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'expired')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Spatial index for fast radius queries
CREATE INDEX crop_listings_geo_idx ON crop_listings USING GIST (geo_point);
-- Index for status queries
CREATE INDEX crop_listings_status_idx ON crop_listings (status);
-- Index for farmer queries
CREATE INDEX crop_listings_farmer_idx ON crop_listings (farmer_id);

-- ─── CROP IMAGES ────────────────────────────────────────────
CREATE TABLE crop_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE NOT NULL,
  url        TEXT NOT NULL,
  order_idx  INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LISTING EXPIRY LOG ──────────────────────────────────────
CREATE TABLE listing_expiry_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID REFERENCES crop_listings(id) ON DELETE CASCADE NOT NULL,
  alert_sent_at TIMESTAMPTZ,
  renewed_at   TIMESTAMPTZ,
  hidden_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RATINGS ─────────────────────────────────────────────────
CREATE TABLE ratings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farmer_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stars      INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)  -- one rating per buyer per listing
);

-- ─── NOTIFICATIONS LOG ───────────────────────────────────────
CREATE TABLE notifications_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel    TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  type       TEXT NOT NULL,  -- 'expiry_alert', 'new_rating', 'listing_hidden', etc.
  message    TEXT NOT NULL,
  sent_at    TIMESTAMPTZ DEFAULT NOW(),
  status     TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'delivered'))
);

-- ─── SAVED LISTINGS (buyer bookmarks) ────────────────────────
CREATE TABLE saved_listings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, listing_id)
);

-- ============================================================
-- VIEWS
-- ============================================================

-- Listings with farmer info (used by /api/listings GET)
CREATE OR REPLACE VIEW listings_with_farmer AS
SELECT
  cl.*,
  ST_X(cl.geo_point::geometry) AS longitude,
  ST_Y(cl.geo_point::geometry) AS latitude,
  fp.name          AS farmer_name,
  fp.village       AS farmer_village,
  fp.district      AS farmer_district,
  fp.state         AS farmer_state,
  fp.rating_avg    AS farmer_rating_avg,
  fp.rating_count  AS farmer_rating_count
FROM crop_listings cl
LEFT JOIN farmer_profiles fp ON fp.user_id = cl.farmer_id
WHERE cl.status = 'active';

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Listings within radius (km) of a point
CREATE OR REPLACE FUNCTION listings_within_radius(
  center_lat FLOAT,
  center_lng FLOAT,
  radius_km  FLOAT DEFAULT 100,
  cat        TEXT DEFAULT NULL,
  only_organic BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id             UUID,
  crop_name      TEXT,
  crop_category  TEXT,
  quantity       NUMERIC,
  unit           TEXT,
  is_organic     BOOLEAN,
  images         TEXT[],
  latitude       FLOAT,
  longitude      FLOAT,
  distance_km    FLOAT,
  farmer_name    TEXT,
  farmer_village TEXT,
  farmer_district TEXT,
  farmer_state   TEXT,
  rating_avg     NUMERIC,
  expires_at     TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.id,
    cl.crop_name,
    cl.crop_category,
    cl.quantity,
    cl.unit,
    cl.is_organic,
    cl.images,
    ST_Y(cl.geo_point::geometry)::FLOAT AS latitude,
    ST_X(cl.geo_point::geometry)::FLOAT AS longitude,
    (ST_Distance(
      cl.geo_point,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
    ) / 1000)::FLOAT AS distance_km,
    fp.name,
    fp.village,
    fp.district,
    fp.state,
    fp.rating_avg,
    cl.expires_at
  FROM crop_listings cl
  LEFT JOIN farmer_profiles fp ON fp.user_id = cl.farmer_id
  WHERE
    cl.status = 'active'
    AND ST_DWithin(
      cl.geo_point,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_km * 1000
    )
    AND (cat IS NULL OR cl.crop_category = cat)
    AND (only_organic = FALSE OR cl.is_organic = TRUE)
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Auto-update farmer rating when a new rating is added
CREATE OR REPLACE FUNCTION update_farmer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE farmer_profiles
  SET
    rating_avg   = (SELECT AVG(stars)::NUMERIC(3,2) FROM ratings WHERE farmer_id = NEW.farmer_id),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE farmer_id = NEW.farmer_id)
  WHERE user_id = NEW.farmer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_farmer_rating
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_farmer_rating();

-- Auto-expire listings past their expiry date
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS void AS $$
BEGIN
  UPDATE crop_listings
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE farmer_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_listings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Farmer profiles: own profile only for write; public read
CREATE POLICY "Farmers: read all"     ON farmer_profiles FOR SELECT USING (true);
CREATE POLICY "Farmers: own write"    ON farmer_profiles FOR ALL    USING (auth.uid() = user_id);

-- Buyer profiles: own profile only
CREATE POLICY "Buyers: own profile"   ON buyer_profiles  FOR ALL    USING (auth.uid() = user_id);

-- Listings: public read for active; farmers manage their own
CREATE POLICY "Listings: public read" ON crop_listings   FOR SELECT USING (status = 'active' OR auth.uid() = farmer_id);
CREATE POLICY "Listings: farmer write" ON crop_listings  FOR ALL    USING (auth.uid() = farmer_id);

-- Ratings: public read; buyers write own ratings
CREATE POLICY "Ratings: public read"  ON ratings         FOR SELECT USING (true);
CREATE POLICY "Ratings: buyer write"  ON ratings         FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Saved: own only
CREATE POLICY "Saved: own"            ON saved_listings  FOR ALL    USING (auth.uid() = buyer_id);

-- Notifications: own only
CREATE POLICY "Notif: own"            ON notifications_log FOR ALL  USING (auth.uid() = user_id);

-- ============================================================
-- SEED CROP TAXONOMY (core crops)
-- ============================================================
INSERT INTO crop_taxonomy (category, name, hindi_name, popular) VALUES
  -- Food Grains
  ('food_grains', 'Rice - Basmati',    'बासमती चावल',  true),
  ('food_grains', 'Rice - Sona Masoori','सोना मसूरी',   true),
  ('food_grains', 'Wheat - Sharbati',   'शरबती गेहूं',  true),
  ('food_grains', 'Wheat - Lokwan',     'लोकवन गेहूं',  false),
  ('food_grains', 'Maize / Corn',       'मक्का',        true),
  ('food_grains', 'Jowar (Sorghum)',    'ज्वार',        true),
  ('food_grains', 'Bajra (Pearl Millet)','बाजरा',       true),
  ('food_grains', 'Ragi (Finger Millet)','रागी',        false),
  -- Pulses
  ('pulses', 'Tur / Arhar (Pigeon Pea)','तूर दाल',     true),
  ('pulses', 'Chana - Desi',            'देसी चना',    true),
  ('pulses', 'Chana - Kabuli',          'काबुली चना',  false),
  ('pulses', 'Moong (Green Gram)',      'मूंग दाल',     true),
  ('pulses', 'Urad (Black Gram)',       'उड़द दाल',     true),
  ('pulses', 'Masoor (Red Lentil)',     'मसूर दाल',    true),
  -- Vegetables
  ('vegetables', 'Tomato',             'टमाटर',       true),
  ('vegetables', 'Onion',              'प्याज़',       true),
  ('vegetables', 'Potato',             'आलू',          true),
  ('vegetables', 'Brinjal (Eggplant)', 'बैंगन',        false),
  ('vegetables', 'Okra (Bhindi)',      'भिंडी',        true),
  ('vegetables', 'Cauliflower',        'गोभी',         false),
  -- Fruits
  ('fruits', 'Mango - Alphonso',       'अल्फांसो आम', true),
  ('fruits', 'Mango - Banganapalli',   'बंगनपल्ली',   true),
  ('fruits', 'Banana',                 'केला',         true),
  ('fruits', 'Pomegranate',            'अनार',         true),
  ('fruits', 'Grapes - Green',         'हरे अंगूर',   true),
  -- Oilseeds
  ('oilseeds', 'Groundnut',            'मूंगफली',      true),
  ('oilseeds', 'Mustard / Rapeseed',   'सरसों',        true),
  ('oilseeds', 'Soybean',              'सोयाबीन',      true),
  -- Spices
  ('spices', 'Turmeric',               'हल्दी',        true),
  ('spices', 'Cumin (Jeera)',          'जीरा',         true),
  ('spices', 'Black Pepper',           'काली मिर्च',   true),
  ('spices', 'Dry Red Chilli',         'लाल मिर्च',   true),
  ('spices', 'Cardamom',               'इलाइची',      true)
ON CONFLICT (category, name) DO NOTHING;

-- ============================================================
-- MANDI PRICE HISTORY ("history clock")
-- Daily national snapshot per commodity, written once/day by
-- /api/mandi-snapshot. Builds the price trends the govt feed lacks.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mandi_history (
  date         text    NOT NULL,            -- Agmarknet arrival_date, "DD/MM/YYYY"
  commodity    text    NOT NULL,            -- Agmarknet commodity name
  avg_modal    integer NOT NULL,            -- national avg modal price, ₹/quintal
  min_modal    integer NOT NULL,            -- cheapest mandi that day
  max_modal    integer NOT NULL,            -- dearest mandi that day
  mandi_count  integer NOT NULL,            -- # mandis reporting that day
  captured_at  timestamptz DEFAULT now(),
  PRIMARY KEY (date, commodity)
);
ALTER TABLE public.mandi_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read mandi_history" ON public.mandi_history;
CREATE POLICY "public read mandi_history" ON public.mandi_history FOR SELECT USING (true);
-- Writes are server-only via the service-role key (bypasses RLS).

-- ============================================================
-- STORAGE BUCKETS (run in Supabase Storage settings)
-- ============================================================
-- Create a public bucket called: crop-images
-- Policy: Allow authenticated users to upload
-- Policy: Allow public read
-- These are configured in Supabase Dashboard → Storage
