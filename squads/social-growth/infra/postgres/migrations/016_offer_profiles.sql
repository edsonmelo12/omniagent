CREATE TABLE offer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_product_id uuid NOT NULL REFERENCES client_products(id) ON DELETE CASCADE,
  source_client_record_id uuid REFERENCES client_briefs(id) ON DELETE SET NULL,
  source_market_research_id uuid REFERENCES market_researches(id) ON DELETE SET NULL,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved')),
  confidence integer NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  confirmed_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  inferred_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  proof_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX offer_profiles_product_version_idx
  ON offer_profiles (client_product_id, version);

CREATE INDEX offer_profiles_client_collected_idx
  ON offer_profiles (client_id, created_at DESC);

CREATE INDEX offer_profiles_product_collected_idx
  ON offer_profiles (client_product_id, created_at DESC);

CREATE TRIGGER offer_profiles_set_updated_at
BEFORE UPDATE ON offer_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
