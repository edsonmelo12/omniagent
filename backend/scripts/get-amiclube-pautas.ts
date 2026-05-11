import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function run() {
  try {
    // Busca o plano de conteúdo mais recente para o Amiclube
    const res = await pool.query(`
      SELECT cp.payload_json, c.name 
      FROM content_plans cp
      JOIN clients c ON cp.client_id = c.id
      WHERE c.slug = 'amiclube'
      ORDER BY cp.created_at DESC
      LIMIT 1
    `);

    if (res.rows.length === 0) {
      console.log("No content plan found for Amiclube in database.");
    } else {
      const payload = res.rows[0].payload_json;
      console.log("Latest Pautas found for Amiclube:");
      if (payload && payload.editorialPautas) {
        payload.editorialPautas.forEach((pauta: any, index: number) => {
          console.log(`\n[Pauta ${index + 1}]`);
          console.log(`Título: ${pauta.title}`);
          console.log(`Pilar: ${pauta.pillar}`);
          console.log(`Ângulo: ${pauta.angle}`);
          console.log(`Objetivo: ${pauta.objective}`);
          console.log(`Formato: ${pauta.format}`);
        });
      } else {
        console.log("Content plan found, but no editorialPautas in JSON.");
        console.log("Payload:", JSON.stringify(payload, null, 2));
      }
    }
  } catch (err) {
    console.error("Error querying database:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
