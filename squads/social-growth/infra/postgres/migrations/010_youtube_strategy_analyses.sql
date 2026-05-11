CREATE TABLE youtube_strategy_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version)
);

CREATE INDEX youtube_strategy_analyses_client_version_idx ON youtube_strategy_analyses (client_id, version DESC);
CREATE INDEX youtube_strategy_analyses_client_status_idx ON youtube_strategy_analyses (client_id, status);

CREATE TRIGGER youtube_strategy_analyses_set_updated_at
BEFORE UPDATE ON youtube_strategy_analyses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

