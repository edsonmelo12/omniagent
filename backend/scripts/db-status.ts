import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function run() {
  console.log("📊 Database Status Report:");
  
  const users = await pool.query("select count(*) from users");
  const agencies = await pool.query("select count(*) from agencies");
  const memberships = await pool.query("select count(*) from memberships");
  const clients = await pool.query("select count(*) from clients");

  console.log(`  Users: ${users.rows[0].count}`);
  console.log(`  Agencies: ${agencies.rows[0].count}`);
  console.log(`  Memberships: ${memberships.rows[0].count}`);
  console.log(`  Clients: ${clients.rows[0].count}`);

  if (Number(memberships.rows[0].count) === 0 && Number(users.rows[0].count) > 0) {
     console.log("⚠️ Warning: Users exist but no memberships found!");
  }

  process.exit(0);
}

run();
