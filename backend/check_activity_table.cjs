const { Client } = require('pg');
const fs = require('fs');

// Read environment variables from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, value] = line.split('=');
    envVars[key.trim()] = value.trim();
  }
});

const client = new Client({
  host: envVars.PG_HOST,
  port: parseInt(envVars.PG_PORT),
  user: envVars.PG_USER,
  password: envVars.PG_PASSWORD,
  database: envVars.PG_DB_NAME
});

async function checkActivityTableStructure() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database:', envVars.PG_DB_NAME);
    
    // Check columns in activities table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'activities'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Columns in activities table:');
    console.table(result.rows);
    
    // Check if required columns exist
    const requiredColumns = ['folder_id', 'metadata'];
    const existingColumns = result.rows.map(row => row.column_name);
    
    console.log('\n🔍 Checking for required columns:');
    for (const col of requiredColumns) {
      const exists = existingColumns.includes(col);
      console.log(`${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }
    
  } catch (err) {
    console.error('❌ Error checking database structure:', err.message);
  } finally {
    await client.end();
  }
}

checkActivityTableStructure();