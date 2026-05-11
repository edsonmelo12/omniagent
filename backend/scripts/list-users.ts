import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function run() {
  const res = await pool.query("select email from users");
  console.log("Registered users:");
  res.rows.forEach(row => console.log(`- ${row.email}`));
  process.exit(0);
}

run();
