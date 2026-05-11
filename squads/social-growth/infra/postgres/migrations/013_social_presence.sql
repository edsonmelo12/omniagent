CREATE TABLE social_presence_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text,
  profile_url text NOT NULL,
  source_snapshot_id uuid REFERENCES social_intelligence_snapshots(id) ON DELETE SET NULL,
  collected_at timestamptz NOT NULL DEFAULT now(),
  followers_count integer CHECK (followers_count >= 0),
  posts_count integer CHECK (posts_count >= 0),
  latest_post_at timestamptz,
  observation_status text NOT NULL DEFAULT 'partial' CHECK (observation_status IN ('captured', 'partial', 'unavailable')),
  confidence integer NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  notes text,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX social_presence_snapshots_client_platform_collected_idx
  ON social_presence_snapshots (client_id, platform, collected_at DESC, created_at DESC);

CREATE INDEX social_presence_snapshots_agency_collected_idx
  ON social_presence_snapshots (agency_id, collected_at DESC, created_at DESC);

CREATE INDEX social_presence_snapshots_platform_collected_idx
  ON social_presence_snapshots (platform, collected_at DESC, created_at DESC);

CREATE TRIGGER social_presence_snapshots_set_updated_at
BEFORE UPDATE ON social_presence_snapshots
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
