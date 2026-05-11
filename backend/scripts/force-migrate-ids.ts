import pg from "pg";
const { Pool } = pg;

async function migrate() {
  const pool = new Pool({
    connectionString: "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth"
  });

  const sql = `
    -- Drop FKs
    ALTER TABLE atos_asset_intents DROP CONSTRAINT IF EXISTS atos_asset_intents_asset_id_fkey;
    ALTER TABLE atos_asset_intents DROP CONSTRAINT IF EXISTS atos_asset_intents_client_id_fkey;
    ALTER TABLE atos_verdicts DROP CONSTRAINT IF EXISTS atos_verdicts_client_id_fkey;
    ALTER TABLE atos_pattern_groups DROP CONSTRAINT IF EXISTS atos_pattern_groups_client_id_fkey;

    -- Alter Types
    ALTER TABLE atos_asset_intents ALTER COLUMN asset_id TYPE TEXT;
    ALTER TABLE atos_asset_intents ALTER COLUMN client_id TYPE TEXT;
    ALTER TABLE atos_verdicts ALTER COLUMN client_id TYPE TEXT;
    ALTER TABLE atos_verdicts ALTER COLUMN target_id TYPE TEXT;
    ALTER TABLE atos_pattern_groups ALTER COLUMN client_id TYPE TEXT;
  `;

  try {
    await pool.query(sql);
    console.log("✅ Database schema updated for flexible IDs (FKs removed for compatibility).");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
