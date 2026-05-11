-- 023_publishing_assets.sql

-- A consolidated view of published content to be used by Atos and Otiniel
CREATE TABLE IF NOT EXISTS publishing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Lineage
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES publishing_executions(id) ON DELETE SET NULL,
  pauta_id VARCHAR(100), -- ID of the editorial pauta from the schedule
  
  -- Identifying Metadata
  title VARCHAR(255) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  format VARCHAR(50) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Content Metadata
  url TEXT, -- Link to the live post
  thumbnail_url TEXT,
  platforms_metadata JSONB DEFAULT '{}'::jsonb,
  
  status VARCHAR(50) DEFAULT 'published',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_publishing_assets_client ON publishing_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_publishing_assets_channel ON publishing_assets(channel);
CREATE INDEX IF NOT EXISTS idx_publishing_assets_published ON publishing_assets(published_at);
CREATE INDEX IF NOT EXISTS idx_publishing_assets_pauta ON publishing_assets(pauta_id);

CREATE TRIGGER trg_publishing_assets_updated_at
BEFORE UPDATE ON publishing_assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
