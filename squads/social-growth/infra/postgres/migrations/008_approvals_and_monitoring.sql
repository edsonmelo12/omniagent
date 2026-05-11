CREATE TABLE approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  artifact_type text NOT NULL,
  artifact_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (artifact_type IN (
    'client_record',
    'market_research',
    'proposal',
    'content_plan',
    'content_production_package',
    'schedule'
  ))
);

CREATE TABLE monitoring_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX approvals_client_status_idx ON approvals (client_id, status);
CREATE INDEX monitoring_reports_client_period_idx ON monitoring_reports (client_id, period_end DESC);

CREATE TRIGGER approvals_set_updated_at
BEFORE UPDATE ON approvals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER monitoring_reports_set_updated_at
BEFORE UPDATE ON monitoring_reports
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
