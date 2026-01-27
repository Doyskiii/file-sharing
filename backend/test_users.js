import { Client } from 'pg';
import fs from 'fs';

// Read environment variables from .env file
const envContent = fs.readFileSync('./.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, value] = line.split('=');
    envVars[key.trim()] = value.trim();
  }
});

const client = new Client({
  host: envVars.PG_HOST || 'localhost',
  port: envVars.PG_PORT || 5432,
  user: envVars.PG_USER || 'postgres',
  password: envVars.PG_PASSWORD || 'postgres',
  database: envVars.PG_DB_NAME || 'db_magang',
  ssl: false
});

async function checkUsers() {
  try {
    await client.connect();
    console.log('✅ Connected to database:', envVars.PG_DB_NAME || 'db_magang');
    
    // Check if users table exists and has records
    const result = await client.query('SELECT id, username, email FROM users LIMIT 10;');
    console.log(`Found ${result.rowCount} users in the database:`);
    
    if (result.rowCount > 0) {
      result.rows.forEach(row => {
        console.log(`- ID: ${row.id}, Username: ${row.username}, Email: ${row.email}`);
      });
    } else {
      console.log('No users found in the database.');
      console.log('You need to run the seeders to create default users.');
    }
    
    await client.end();
    console.log('✅ Connection closed.');
  } catch (err) {
    console.error('❌ Error checking users:');
    console.error('Error details:', err.message);
    
    if (client) {
      try {
        await client.end();
      } catch(e) {
        console.error('Error closing client:', e);
      }
    }
  }
}

checkUsers();