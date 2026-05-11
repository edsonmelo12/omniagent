import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query("SELECT * FROM clients WHERE slug = 'amiclube'");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error("Error querying database:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
