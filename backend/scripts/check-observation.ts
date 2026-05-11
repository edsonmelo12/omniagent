import { query } from '../src/shared/db/database.js';

async function main() {
  // Get observation_profiles for amiclube
  const obs = await query(`
    SELECT op.*, c.name as client_name 
    FROM observation_profiles op
    JOIN clients c ON c.id = op.client_id
    WHERE c.slug = $1
  `, ['amiclube']);
  
  console.log('=== observation_profiles for amiclube ===');
  if (obs.length === 0) {
    console.log('Nenhum registro encontrado');
  } else {
    console.log(JSON.stringify(obs, null, 2));
  }
  
  // Get table schema
  const schema = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'observation_profiles'
    ORDER BY ordinal_position;
  `);
  
  console.log('\n=== observation_profiles schema ===');
  schema.forEach(c => {
    console.log(`- ${c.column_name}: ${c.data_type} ${c.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
  });
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});