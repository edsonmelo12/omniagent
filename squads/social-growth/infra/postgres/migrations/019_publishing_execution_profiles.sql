ALTER TABLE publishing_executions
ADD COLUMN IF NOT EXISTS publishing_profile_id uuid REFERENCES publishing_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS publishing_executions_profile_idx
ON publishing_executions (publishing_profile_id, created_at DESC);
