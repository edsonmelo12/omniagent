-- 022_atos_analista_core.sql

-- Intents table: stores the "why" of an asset
CREATE TABLE IF NOT EXISTS atos_asset_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES publishing_assets(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  primary_objective VARCHAR(50) NOT NULL, -- authority, distribution, capture, conversion
  secondary_objective VARCHAR(50),
  return_horizon VARCHAR(50) NOT NULL, -- short_term, medium_term, long_term
  funnel_stage VARCHAR(50) NOT NULL, -- awareness, consideration, decision, post_conversion
  
  theme VARCHAR(255) NOT NULL,
  angle VARCHAR(255) NOT NULL,
  editorial_thesis TEXT,
  icp VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atos_asset_intents_client ON atos_asset_intents(client_id);
CREATE INDEX IF NOT EXISTS idx_atos_asset_intents_asset ON atos_asset_intents(asset_id);
CREATE INDEX IF NOT EXISTS idx_atos_asset_intents_objective ON atos_asset_intents(primary_objective);

-- Verdicts table: stores the analyst's conclusion
CREATE TABLE IF NOT EXISTS atos_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  target_type VARCHAR(50) NOT NULL, -- asset, group
  target_id UUID NOT NULL, -- can be asset_id or pattern_group_id
  
  decision VARCHAR(50) NOT NULL, -- scale, repeat_with_adjustment, redistribute, archive, inconclusive
  probable_causality TEXT,
  confidence VARCHAR(20) NOT NULL, -- high, medium, low
  
  main_gap TEXT,
  next_action TEXT,
  
  analyst_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atos_verdicts_client ON atos_verdicts(client_id);
CREATE INDEX IF NOT EXISTS idx_atos_verdicts_target ON atos_verdicts(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_atos_verdicts_decision ON atos_verdicts(decision);

-- Pattern Groups table: stores aggregated analytical views
CREATE TABLE IF NOT EXISTS atos_pattern_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  group_type VARCHAR(50) NOT NULL, -- theme, angle, format, objective
  group_key VARCHAR(255) NOT NULL, -- the value being grouped (e.g. "Authority", "Instagram Reel")
  
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  portfolio_contribution JSONB, -- reach_share, conversion_share, etc.
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atos_pattern_groups_client ON atos_pattern_groups(client_id);
CREATE INDEX IF NOT EXISTS idx_atos_pattern_groups_key ON atos_pattern_groups(group_type, group_key);
CREATE INDEX IF NOT EXISTS idx_atos_pattern_groups_period ON atos_pattern_groups(period_start, period_end);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION atos_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_atos_asset_intents_updated_at') THEN
    CREATE TRIGGER trg_atos_asset_intents_updated_at
    BEFORE UPDATE ON atos_asset_intents
    FOR EACH ROW EXECUTE FUNCTION atos_update_timestamp();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_atos_verdicts_updated_at') THEN
    CREATE TRIGGER trg_atos_verdicts_updated_at
    BEFORE UPDATE ON atos_verdicts
    FOR EACH ROW EXECUTE FUNCTION atos_update_timestamp();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_atos_pattern_groups_updated_at') THEN
    CREATE TRIGGER trg_atos_pattern_groups_updated_at
    BEFORE UPDATE ON atos_pattern_groups
    FOR EACH ROW EXECUTE FUNCTION atos_update_timestamp();
  END IF;
END $$;
