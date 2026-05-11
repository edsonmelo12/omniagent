import { Pool } from "pg";
import { createHash } from "node:crypto";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const hashPassword = (password: string) => `sha256:${createHash("sha256").update(password).digest("hex")}`;

async function run() {
  const newEmail = "edson@portaldemidias.com";
  const newPass = "admin_portal_2026";
  const hashed = hashPassword(newPass);

  console.log(`🚀 Resetting admin user to ${newEmail}...`);
  
  await pool.query(
    "update users set email = $1, password_hash = $2 where email = 'edson@portaldemidias.com'",
    [newEmail, hashed]
  );

  console.log("✅ User updated successfully.");
  process.exit(0);
}

run();
