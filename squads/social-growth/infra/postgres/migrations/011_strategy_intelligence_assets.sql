CREATE TABLE strategy_intelligence_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  version integer NOT NULL,
  kind text NOT NULL,
  source_analysis_id uuid NULL REFERENCES youtube_strategy_analyses(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, version, kind)
);

CREATE INDEX strategy_intelligence_assets_client_version_idx ON strategy_intelligence_assets (client_id, version DESC);
CREATE INDEX strategy_intelligence_assets_client_kind_idx ON strategy_intelligence_assets (client_id, kind);

CREATE TRIGGER strategy_intelligence_assets_set_updated_at
BEFORE UPDATE ON strategy_intelligence_assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
