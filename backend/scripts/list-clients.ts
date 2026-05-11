import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query("select name, slug from clients where status = 'active'");
    console.log("Active clients found:");
    if (res.rows.length === 0) {
      console.log("No active clients found in database.");
    } else {
      res.rows.forEach(row => console.log(`- ${row.name} (Slug: ${row.slug})`));
    }
  } catch (err) {
    console.error("Error querying database:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
