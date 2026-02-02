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

async function seedRoles() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if roles table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'roles'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Roles table does not exist. Please run migrations first.');
      return;
    }

    // Define roles to seed
    const roles = [
      { name: 'BOD', description: 'Board of Directors' },
      { name: 'Finance', description: 'finance' },
      { name: 'Project Manager', description: 'project manager' },
      { name: 'Administration', description: 'administration' },
      { name: 'Founder', description: 'founder' },
      { name: 'Tata Usaha', description: 'tata usaha' },
      { name: 'User', description: 'user' },
      { name: 'Superadmin', description: 'superadmin' },
    ];

    for (const role of roles) {
      // Check if role exists
      const existing = await client.query('SELECT id FROM roles WHERE name = $1', [role.name]);

      if (existing.rows.length === 0) {
        // Insert role
        const result = await client.query(
          'INSERT INTO roles (name, description, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id',
          [role.name, role.description]
        );
        console.log(`✅ Created role: ${role.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`ℹ️ Role already exists: ${role.name}`);
      }
    }

    console.log('🎉 Roles seeding completed!');

  } catch (err) {
    console.error('❌ Error seeding roles:');
    console.error('Error details:', err.message);
  } finally {
    await client.end();
    console.log('✅ Connection closed.');
  }
}

seedRoles();
