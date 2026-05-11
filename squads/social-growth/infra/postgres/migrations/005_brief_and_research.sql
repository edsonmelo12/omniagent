CREATE TABLE client_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE TABLE market_researches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE INDEX client_briefs_client_version_idx ON client_briefs (client_id, version DESC);
CREATE INDEX market_researches_client_version_idx ON market_researches (client_id, version DESC);

CREATE TRIGGER client_briefs_set_updated_at
BEFORE UPDATE ON client_briefs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER market_researches_set_updated_at
BEFORE UPDATE ON market_researches
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

