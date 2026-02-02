import { Client } from 'pg';
import fs from 'fs';

// Read environment variables from .env file
const envContent = fs.readFileSync('./backend/.env', 'utf8');
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

async function checkUser() {
  try {
    await client.connect();
    console.log('✅ Connected to database:', envVars.PG_DB_NAME || 'db_magang');

    // Check the user
    const result = await client.query('SELECT id, username, email, password, is_active FROM users WHERE email = $1;', ['Superadmin@example.com']);

    if (result.rowCount > 0) {
      const user = result.rows[0];
      console.log(`User found: ${user.username} (${user.email})`);
      console.log(`is_active: ${user.is_active}`);
      console.log(`Password hash: ${user.password}`);
    } else {
      console.log('Superadmin user not found in database.');
    }

    await client.end();
    console.log('✅ Connection closed.');
  } catch (err) {
    console.error('❌ Error checking user:');
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

checkUser();
