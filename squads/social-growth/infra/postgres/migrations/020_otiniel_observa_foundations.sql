CREATE TABLE IF NOT EXISTS observation_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('meta', 'youtube', 'ga4', 'linkedin', 'crm', 'manual', 'other')),
  channel text NOT NULL,
  profile_type text NOT NULL DEFAULT 'observation',
  account_ref text NOT NULL,
  property_ref text,
  organization_ref text,
  display_name text,
  secret_ref text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'invalid', 'revoked')),
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(scopes) = 'array'),
  connection_metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(connection_metadata) = 'object'),
  last_validated_at timestamptz,
  last_collected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, provider, account_ref, profile_type)
);

CREATE TABLE IF NOT EXISTS evidence_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  observation_profile_id uuid REFERENCES observation_profiles(id) ON DELETE SET NULL,
  source_type text NOT NULL CHECK (source_type IN ('social_api', 'site_analytics', 'crm', 'spreadsheet_import', 'csv_upload', 'manual_form', 'screenshot_review')),
  provider_name text NOT NULL CHECK (provider_name IN ('meta', 'youtube', 'ga4', 'linkedin', 'crm', 'manual', 'other')),
  account_ref text,
  access_mode text NOT NULL CHECK (access_mode IN ('manual', 'oauth', 'api_token', 'service_account', 'import')),
  status text NOT NULL,
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(source_metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  observation_profile_id uuid REFERENCES observation_profiles(id) ON DELETE SET NULL,
  source_id uuid REFERENCES evidence_sources(id) ON DELETE SET NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('manual', 'connector', 'scheduled', 'backfill')),
  run_status text NOT NULL CHECK (run_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  records_received integer NOT NULL DEFAULT 0 CHECK (records_received >= 0),
  records_normalized integer NOT NULL DEFAULT 0 CHECK (records_normalized >= 0),
  error_code text,
  error_message text,
  run_metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(run_metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS observation_profiles_agency_client_idx
  ON observation_profiles (agency_id, client_id);

CREATE INDEX IF NOT EXISTS observation_profiles_client_provider_channel_idx
  ON observation_profiles (client_id, provider, channel);

CREATE INDEX IF NOT EXISTS observation_profiles_secret_ref_idx
  ON observation_profiles (secret_ref);

CREATE INDEX IF NOT EXISTS evidence_sources_client_provider_idx
  ON evidence_sources (client_id, provider_name);

CREATE INDEX IF NOT EXISTS evidence_sources_profile_idx
  ON evidence_sources (observation_profile_id);

CREATE INDEX IF NOT EXISTS collection_runs_client_started_idx
  ON collection_runs (client_id, started_at DESC);

CREATE INDEX IF NOT EXISTS collection_runs_profile_started_idx
  ON collection_runs (observation_profile_id, started_at DESC);

CREATE TRIGGER observation_profiles_set_updated_at
BEFORE UPDATE ON observation_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER evidence_sources_set_updated_at
BEFORE UPDATE ON evidence_sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER collection_runs_set_updated_at
BEFORE UPDATE ON collection_runs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
