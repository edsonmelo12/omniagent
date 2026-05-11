#!/usr/bin/env node
// WordPress Connection Test
// Reads credentials from environment variables (NOT hardcoded)
// Usage: node --env-file=../.env test-wp-connection.ts

async function testConnection() {
  const url = process.env.WORDPRESS_URL;
  const user = process.env.WORDPRESS_USER;
  const password = process.env.WORDPRESS_APP_PASSWORD;

  if (!url || !user || !password) {
    console.error(
      "Missing WordPress credentials.\n" +
      "Set WORDPRESS_URL, WORDPRESS_USER, and WORDPRESS_APP_PASSWORD in .env\n" +
      "Or run: PGPASSWORD=... psql ... -c \"SELECT secret_ref FROM publishing_profiles WHERE channel='wordpress'\"\n" +
      "and resolve env:// reference."
    );
    process.exit(1);
  }

  console.log(`Testing connection to: ${url} as ${user}...`);

  const auth = Buffer.from(`${user}:${password}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(`${url}/wp-json/wp/v2/categories?per_page=1`, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const categories = await response.json();
      console.log('✅ Connection Successful!');
      console.log(`Status: ${response.status} ${response.statusText}`);
      if (categories && categories.length > 0) {
        console.log(`Observed Category: ${categories[0].name} (ID: ${categories[0].id})`);
      }
    } else {
      const error = await response.text();
      console.error('❌ Connection Failed.');
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error('Error Details:', error);
    }
  } catch (err) {
    console.error('❌ Network Error:', err.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
