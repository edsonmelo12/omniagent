CREATE TABLE publishing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel text NOT NULL,
  provider text NOT NULL,
  account_label text NOT NULL,
  external_account_id text,
  secret_ref text NOT NULL,
  connection_status text NOT NULL DEFAULT 'disconnected',
  approval_mode text NOT NULL DEFAULT 'manual',
  publish_mode text NOT NULL DEFAULT 'dry_run_only',
  capabilities_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  constraints_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_validated_at timestamptz,
  last_error_code text,
  last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    channel IN (
      'instagram',
      'facebook',
      'linkedin',
      'pinterest',
      'tiktok',
      'youtube'
    )
  ),
  CHECK (
    provider IN (
      'rube',
      'meta_graph',
      'linkedin_api',
      'youtube_api',
      'buffer',
      'manual'
    )
  ),
  CHECK (
    connection_status IN (
      'disconnected',
      'pending_auth',
      'active',
      'reauth_required',
      'paused',
      'revoked',
      'error'
    )
  ),
  CHECK (
    approval_mode IN (
      'manual',
      'two_step',
      'auto'
    )
  ),
  CHECK (
    publish_mode IN (
      'dry_run_only',
      'live_enabled'
    )
  ),
  CHECK (jsonb_typeof(capabilities_json) = 'object'),
  CHECK (jsonb_typeof(constraints_json) = 'object'),
  UNIQUE (client_id, channel, account_label)
);

CREATE INDEX publishing_profiles_client_channel_idx
ON publishing_profiles (client_id, channel, connection_status);

CREATE INDEX publishing_profiles_secret_ref_idx
ON publishing_profiles (secret_ref);

CREATE TRIGGER publishing_profiles_set_updated_at
BEFORE UPDATE ON publishing_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
