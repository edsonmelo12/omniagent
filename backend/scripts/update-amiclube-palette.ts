import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function run() {
  try {
    const paletteStr = `
# Official Visual Palette
- Teal: #299d8f
- Deep Blue: #234555
- Coral: #dc4c5d
- Creme: #e7d4bd
- Yellow: #fed136
`;

    // Primeiro buscamos as notas atuais
    const currentRes = await pool.query("SELECT notes FROM clients WHERE slug = 'amiclube'");
    const currentNotes = currentRes.rows[0]?.notes || "";
    
    // Adicionamos a paleta se ela não existir
    if (!currentNotes.includes("# Official Visual Palette")) {
      const updatedNotes = currentNotes + "\n" + paletteStr;
      await pool.query("UPDATE clients SET notes = $1 WHERE slug = 'amiclube'", [updatedNotes]);
      console.log("Database updated with AmiClube palette.");
    } else {
      console.log("Palette already exists in database notes.");
    }
  } catch (err) {
    console.error("Error updating database:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
