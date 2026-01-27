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

async function checkUserRoles() {
  try {
    await client.connect();
    console.log('✅ Connected to database:', envVars.PG_DB_NAME || 'db_magang');
    
    // Join users with roles to see which users have which roles
    const result = await client.query(`
      SELECT u.id, u.username, u.email, r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.id;
    `);
    
    console.log(`User-role relationships:`);
    result.rows.forEach(row => {
      console.log(`- User: ${row.username} (${row.email}) -> Role: ${row.role_name || 'No role assigned'}`);
    });
    
    await client.end();
    console.log('✅ Connection closed.');
  } catch (err) {
    console.error('❌ Error checking user roles:');
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

checkUserRoles();