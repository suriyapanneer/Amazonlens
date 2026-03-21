-- AmazonLens v4 — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor

-- ── Profiles ──────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asin TEXT NOT NULL,
  title TEXT,
  brand TEXT DEFAULT 'Unknown',
  category TEXT DEFAULT '',
  price NUMERIC(10,2) DEFAULT 0,
  monthly_sales INTEGER DEFAULT 0,
  monthly_revenue NUMERIC(12,2) DEFAULT 0,
  bsr INTEGER DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  review_vel NUMERIC(8,2) DEFAULT 0,
  fulfillment TEXT DEFAULT '',
  seller_age INTEGER DEFAULT 0,
  weight NUMERIC(6,3) DEFAULT 0,
  images INTEGER DEFAULT 0,
  active_sellers INTEGER DEFAULT 0,
  sponsored BOOLEAN DEFAULT false,
  url TEXT DEFAULT '',
  moat_score INTEGER DEFAULT 0,
  opportunity_score INTEGER DEFAULT 0,
  profit_estimate NUMERIC(10,2) DEFAULT 0,
  margin_estimate NUMERIC(5,1) DEFAULT 0,
  sellable BOOLEAN DEFAULT false,
  verdict TEXT DEFAULT 'SKIP' CHECK (verdict IN ('ENTER', 'WATCH', 'SKIP')),
  source TEXT DEFAULT '' CHECK (source IN ('xray', 'cerebro', 'blackbox', '')),
  top_keyword TEXT DEFAULT '',
  keyword_count INTEGER DEFAULT 0,
  zero_comp_keywords INTEGER DEFAULT 0,
  gold_keywords INTEGER DEFAULT 0,
  bb_category TEXT DEFAULT '',
  bb_net_margin NUMERIC(5,1) DEFAULT 0,
  bb_opportunity_score INTEGER DEFAULT 0,
  costs_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, asin)
);

-- ── Keywords ──────────────────────────────────────────────────────────────────
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  asin TEXT,
  keyword TEXT NOT NULL,
  search_vol INTEGER DEFAULT 0,
  iq_score INTEGER DEFAULT 0,
  competing INTEGER DEFAULT 0,
  trend NUMERIC(6,2) DEFAULT 0,
  organic_rank INTEGER DEFAULT 0,
  sponsored_rank INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'SKIP' CHECK (tier IN ('ZERO_COMP', 'GOLD', 'SILVER', 'BRONZE', 'SKIP')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Analyses ──────────────────────────────────────────────────────────────────
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  stats_json JSONB,
  costs_json JSONB,
  opportunity_score INTEGER,
  verdict TEXT,
  forecast_json JSONB,
  reasons_json JSONB,
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Reports ───────────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  report_type TEXT DEFAULT 'market' CHECK (report_type IN ('market', 'product', 'comparison', 'keyword')),
  pdf_url TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_user_asin ON products(user_id, asin);
CREATE INDEX idx_products_verdict ON products(user_id, verdict);
CREATE INDEX idx_products_sellable ON products(user_id, sellable) WHERE sellable = true;
CREATE INDEX idx_keywords_user ON keywords(user_id);
CREATE INDEX idx_keywords_product ON keywords(product_id);
CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_reports_user ON reports(user_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own keywords" ON keywords FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own analyses" ON analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own reports" ON reports FOR ALL USING (auth.uid() = user_id);

-- ── Triggers ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
