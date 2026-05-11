CREATE TABLE creative_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_brand_profile_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL,
  source_offer_profile_id uuid REFERENCES offer_profiles(id) ON DELETE SET NULL,
  source_snapshot_id uuid REFERENCES social_intelligence_snapshots(id) ON DELETE SET NULL,
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

CREATE TABLE creative_profile_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_profile_id uuid NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_type text NOT NULL,
  collected_at timestamptz NOT NULL DEFAULT now(),
  confidence integer NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  notes text
);

CREATE UNIQUE INDEX creative_profiles_client_version_idx
  ON creative_profiles (client_id, version);

CREATE INDEX creative_profiles_client_collected_idx
  ON creative_profiles (client_id, created_at DESC);

CREATE INDEX creative_profile_sources_profile_idx
  ON creative_profile_sources (creative_profile_id);

CREATE TRIGGER creative_profiles_set_updated_at
BEFORE UPDATE ON creative_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
