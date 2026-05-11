CREATE TABLE social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text NOT NULL,
  profile_url text NOT NULL,
  discovery_source text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  confidence integer NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, platform, handle)
);

CREATE INDEX social_profiles_client_platform_idx ON social_profiles (client_id, platform);

CREATE TRIGGER social_profiles_set_updated_at
BEFORE UPDATE ON social_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

