import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth',
});

async function main() {
  await client.connect();
  
  // List tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  console.log('=== Tables ===');
  tables.rows.forEach(t => console.log('-', t.table_name));
  
  // Check clients table
  const clients = await client.query('SELECT id, name, slug, website_url FROM clients LIMIT 5');
  console.log('\n=== Clients ===');
  clients.rows.forEach(c => console.log('-', c.slug, ':', c.name));
  
  await client.end();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});