import { Pool } from "pg";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");
const squadsDir = join(rootDir, "..", "squads", "social-growth");

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const migrations = [
  "001_identity_and_access.sql",
  "002_client_core.sql",
  "003_social_discovery.sql",
  "004_social_intelligence.sql",
  "005_brief_and_research.sql",
  "006_proposals.sql",
  "007_content_and_schedule.sql",
  "008_approvals_and_monitoring.sql",
  "009_evidence.sql",
  "010_youtube_strategy_analyses.sql",
  "011_strategy_intelligence_assets.sql",
  "012_publishing_executions.sql",
  "013_social_presence.sql",
];

async function run() {
  console.log("🚀 Initializing database...");

  for (const migration of migrations) {
    console.log(`  Applying ${migration}...`);
    const path = join(squadsDir, "infra", "postgres", "migrations", migration);
    const sql = await readFile(path, "utf-8");
    
    try {
      await pool.query(sql);
    } catch (error: any) {
      if (error.code === "42P07") {
        console.log(`    Relation already exists, skipping.`);
      } else {
        console.error(`    Error applying ${migration}:`, error.message);
      }
    }
  }

  console.log("✅ Database initialized.");
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
