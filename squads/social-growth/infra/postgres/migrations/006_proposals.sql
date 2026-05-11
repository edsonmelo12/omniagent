CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  archetype text NOT NULL,
  thesis text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE INDEX proposals_client_version_idx ON proposals (client_id, version DESC);
CREATE INDEX proposals_client_status_idx ON proposals (client_id, status);

CREATE TRIGGER proposals_set_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

