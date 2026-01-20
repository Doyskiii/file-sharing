const pg = require('pg');
const fs = require('fs');
const path = require('path');

const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_ZnUGfNuek59I@ep-fancy-shadow-ae5sdgfg-pooler.c-2.us-east-2.aws.neon.tech/db_magang?channel_binding=require&sslmode=require';

const client = new Client({
  connectionString: connectionString,
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to Neon database');

    // Read SQL file
    const sqlFile = path.join(process.cwd(), 'database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute SQL
    await client.query(sql);
    console.log('✓ Database schema created successfully');

    await client.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
