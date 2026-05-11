CREATE TABLE content_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE TABLE content_production_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE INDEX content_plans_client_version_idx ON content_plans (client_id, version DESC);
CREATE INDEX content_production_packages_client_version_idx ON content_production_packages (client_id, version DESC);
CREATE INDEX schedules_client_version_idx ON schedules (client_id, version DESC);

CREATE TRIGGER content_plans_set_updated_at
BEFORE UPDATE ON content_plans
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER content_production_packages_set_updated_at
BEFORE UPDATE ON content_production_packages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER schedules_set_updated_at
BEFORE UPDATE ON schedules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
