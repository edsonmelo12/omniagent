import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export type AssetIntentRow = {
  id: string;
  asset_id: string;
  client_id: string;
  primary_objective: string;
  secondary_objective: string | null;
  return_horizon: string;
  funnel_stage: string;
  theme: string;
  angle: string;
  editorial_thesis: string | null;
  icp: string | null;
  created_at: Date;
  updated_at: Date;
};

export type AnalyticalVerdictRow = {
  id: string;
  client_id: string;
  target_type: string;
  target_id: string;
  decision: string;
  probable_causality: string | null;
  confidence: string;
  main_gap: string | null;
  next_action: string | null;
  analyst_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export type PublishingAssetRow = {
  id: string;
  client_id: string;
  schedule_id: string | null;
  execution_id: string | null;
  pauta_id: string | null;
  title: string;
  channel: string;
  format: string;
  published_at: Date | null;
  url: string | null;
  thumbnail_url: string | null;
  platforms_metadata: any;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export const createPublishingAssetRow = async (data: Omit<PublishingAssetRow, "id" | "created_at" | "updated_at">) => {
  const query = `
    INSERT INTO publishing_assets (
      client_id, schedule_id, execution_id, pauta_id, title, channel, format, 
      published_at, url, thumbnail_url, platforms_metadata, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  const values = [
    data.client_id, data.schedule_id, data.execution_id, data.pauta_id, data.title,
    data.channel, data.format, data.published_at, data.url, data.thumbnail_url,
    JSON.stringify(data.platforms_metadata), data.status
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] as PublishingAssetRow;
};

export const findPublishingAssetById = async (id: string) => {
  const query = `SELECT * FROM publishing_assets WHERE id = $1;`;
  const { rows } = await pool.query(query, [id]);
  return (rows[0] as PublishingAssetRow) || null;
};

export const listPublishingAssetsByClientId = async (clientId: string) => {
  const query = `SELECT * FROM publishing_assets WHERE client_id = $1 ORDER BY published_at DESC NULLS LAST;`;
  const { rows } = await pool.query(query, [clientId]);
  return rows as PublishingAssetRow[];
};

export const createAssetIntentRow = async (data: Omit<AssetIntentRow, "id" | "created_at" | "updated_at">) => {
  const query = `
    INSERT INTO atos_asset_intents (
      asset_id, client_id, primary_objective, secondary_objective, 
      return_horizon, funnel_stage, theme, angle, editorial_thesis, icp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    data.asset_id, data.client_id, data.primary_objective, data.secondary_objective,
    data.return_horizon, data.funnel_stage, data.theme, data.angle, data.editorial_thesis, data.icp
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] as AssetIntentRow;
};

export const findAssetIntentByAssetId = async (assetId: string) => {
  const query = `SELECT * FROM atos_asset_intents WHERE asset_id = $1;`;
  const { rows } = await pool.query(query, [assetId]);
  return (rows[0] as AssetIntentRow) || null;
};

export const findAssetIntentsByAssetIds = async (assetIds: string[]) => {
  if (assetIds.length === 0) return [];
  const query = `SELECT * FROM atos_asset_intents WHERE asset_id = ANY($1);`;
  const { rows } = await pool.query(query, [assetIds]);
  return rows as AssetIntentRow[];
};

export const findLatestVerdictsByTargetIds = async (targetType: string, targetIds: string[]) => {
  if (targetIds.length === 0) return [];
  const query = `
    SELECT DISTINCT ON (target_id) * 
    FROM atos_verdicts 
    WHERE target_type = $1 AND target_id = ANY($2) 
    ORDER BY target_id, created_at DESC;
  `;
  const { rows } = await pool.query(query, [targetType, targetIds]);
  return rows as AnalyticalVerdictRow[];
};

export const listAssetIntentsByClientId = async (clientId: string) => {
  const query = `SELECT * FROM atos_asset_intents WHERE client_id = $1;`;
  const { rows } = await pool.query(query, [clientId]);
  return rows as AssetIntentRow[];
};

export const createAnalyticalVerdictRow = async (data: Omit<AnalyticalVerdictRow, "id" | "created_at" | "updated_at">) => {
  const query = `
    INSERT INTO atos_verdicts (
      client_id, target_type, target_id, decision, probable_causality, 
      confidence, main_gap, next_action, analyst_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [
    data.client_id, data.target_type, data.target_id, data.decision, data.probable_causality,
    data.confidence, data.main_gap, data.next_action, data.analyst_id
  ];
  const { rows } = await pool.query(query, values);
  return rows[0] as AnalyticalVerdictRow;
};

export const listVerdictsByTarget = async (targetType: string, targetId: string) => {
  const query = `SELECT * FROM atos_verdicts WHERE target_type = $1 AND target_id = $2 ORDER BY created_at DESC;`;
  const { rows } = await pool.query(query, [targetType, targetId]);
  return rows as AnalyticalVerdictRow[];
};
