CREATE TABLE IF NOT EXISTS raw_evidence_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES evidence_sources(id) ON DELETE RESTRICT,
  observation_profile_id uuid REFERENCES observation_profiles(id) ON DELETE SET NULL,
  collection_run_id uuid REFERENCES collection_runs(id) ON DELETE SET NULL,
  collected_at timestamptz NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  record_type text NOT NULL,
  asset_external_ref text,
  payload_ref text NOT NULL,
  payload_hash text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS normalized_observation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  observation_profile_id uuid REFERENCES observation_profiles(id) ON DELETE SET NULL,
  raw_evidence_record_id uuid NOT NULL REFERENCES raw_evidence_records(id) ON DELETE RESTRICT,
  asset_id uuid,
  channel text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  evidence_level text NOT NULL CHECK (evidence_level IN ('public_only', 'authorized_export', 'direct_api', 'manual_confirmed', 'derived')),
  completeness_status text NOT NULL CHECK (completeness_status IN ('complete', 'partial', 'minimal', 'missing')),
  normalization_metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(normalization_metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qualitative_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  observation_profile_id uuid REFERENCES observation_profiles(id) ON DELETE SET NULL,
  asset_id uuid,
  channel text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  signal_type text NOT NULL,
  summary_text text NOT NULL,
  source_ref text,
  evidence_level text NOT NULL CHECK (evidence_level IN ('public_only', 'authorized_export', 'direct_api', 'manual_confirmed', 'derived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS observation_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  asset_id uuid,
  window_type text NOT NULL CHECK (window_type IN ('asset', 'weekly', 'monthly')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  social_signals jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(social_signals) = 'object'),
  site_signals jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(site_signals) = 'object'),
  business_signals jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(business_signals) = 'object'),
  qualitative_signals jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(qualitative_signals) = 'object'),
  observation_profile_ids jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(observation_profile_ids) = 'array'),
  source_count integer NOT NULL DEFAULT 0 CHECK (source_count >= 0),
  evidence_level text NOT NULL CHECK (evidence_level IN ('public_only', 'authorized_export', 'direct_api', 'manual_confirmed', 'derived')),
  completeness_status text NOT NULL CHECK (completeness_status IN ('complete', 'partial', 'minimal', 'missing')),
  notes text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, asset_id, window_type, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS raw_evidence_records_client_period_idx
  ON raw_evidence_records (client_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS raw_evidence_records_collection_run_idx
  ON raw_evidence_records (collection_run_id);

CREATE INDEX IF NOT EXISTS raw_evidence_records_asset_external_ref_idx
  ON raw_evidence_records (asset_external_ref);

CREATE INDEX IF NOT EXISTS normalized_observation_records_client_channel_metric_idx
  ON normalized_observation_records (client_id, channel, metric_name);

CREATE INDEX IF NOT EXISTS normalized_observation_records_asset_period_idx
  ON normalized_observation_records (asset_id, period_start);

CREATE INDEX IF NOT EXISTS normalized_observation_records_profile_period_idx
  ON normalized_observation_records (observation_profile_id, period_start);

CREATE INDEX IF NOT EXISTS qualitative_evidence_client_signal_period_idx
  ON qualitative_evidence (client_id, signal_type, period_start);

CREATE INDEX IF NOT EXISTS qualitative_evidence_asset_period_idx
  ON qualitative_evidence (asset_id, period_start);

CREATE INDEX IF NOT EXISTS observation_summaries_client_window_period_idx
  ON observation_summaries (client_id, window_type, period_start DESC);
