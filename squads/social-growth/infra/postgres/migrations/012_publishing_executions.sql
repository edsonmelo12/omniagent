CREATE TABLE publishing_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES schedules(id) ON DELETE SET NULL,
  mode text NOT NULL DEFAULT 'dry_run',
  status text NOT NULL DEFAULT 'draft',
  platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_by uuid REFERENCES users(id) ON DELETE SET NULL,
  confirmed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (mode IN ('dry_run', 'live')),
  CHECK (status IN ('draft', 'blocked', 'dry_run_passed', 'queued', 'published', 'failed')),
  CHECK (jsonb_typeof(platforms) = 'array')
);

CREATE INDEX publishing_executions_client_created_idx ON publishing_executions (client_id, created_at DESC);
CREATE INDEX publishing_executions_schedule_idx ON publishing_executions (schedule_id, created_at DESC);

CREATE TRIGGER publishing_executions_set_updated_at
BEFORE UPDATE ON publishing_executions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
