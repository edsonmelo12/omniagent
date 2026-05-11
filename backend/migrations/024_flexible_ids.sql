-- Altering ID columns to accept readable strings for pipeline compatibility
ALTER TABLE atos_asset_intents ALTER COLUMN asset_id TYPE TEXT;
ALTER TABLE atos_asset_intents ALTER COLUMN client_id TYPE TEXT;
ALTER TABLE atos_verdicts ALTER COLUMN client_id TYPE TEXT;
ALTER TABLE atos_verdicts ALTER COLUMN target_id TYPE TEXT;
ALTER TABLE atos_pattern_groups ALTER COLUMN client_id TYPE TEXT;
