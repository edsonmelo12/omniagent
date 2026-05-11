CREATE TABLE social_intelligence_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  collected_at timestamptz NOT NULL DEFAULT now(),
  public_only boolean NOT NULL DEFAULT true,
  confidence integer NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  presence_score integer CHECK (presence_score >= 0 AND presence_score <= 100),
  consistency_score integer CHECK (consistency_score >= 0 AND consistency_score <= 100),
  proof_score integer CHECK (proof_score >= 0 AND proof_score <= 100),
  conversion_readiness integer CHECK (conversion_readiness >= 0 AND conversion_readiness <= 100),
  main_gaps_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  opportunity_notes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE social_intelligence_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid NOT NULL REFERENCES social_intelligence_snapshots(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_type text NOT NULL,
  collected_at timestamptz NOT NULL DEFAULT now(),
  confidence integer NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  notes text
);

CREATE INDEX social_intelligence_snapshots_client_collected_idx
  ON social_intelligence_snapshots (client_id, collected_at DESC);

CREATE INDEX social_intelligence_sources_snapshot_idx
  ON social_intelligence_sources (snapshot_id);

CREATE TRIGGER social_intelligence_snapshots_set_updated_at
BEFORE UPDATE ON social_intelligence_snapshots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

