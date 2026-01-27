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

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database:', envVars.PG_DB_NAME);
    
    // Check if users table exists and has data
    const userResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (userResult.rows[0].exists) {
      console.log('✅ Users table exists');
      
      // Count users
      const countResult = await client.query('SELECT COUNT(*) FROM users;');
      const userCount = parseInt(countResult.rows[0].count);
      console.log(`✅ Users in database: ${userCount}`);
      
      if (userCount > 0) {
        // Show sample user (without showing password)
        const sampleUser = await client.query('SELECT id, username, email FROM users LIMIT 1;');
        console.log('Sample user:', sampleUser.rows[0]);
      } else {
        console.log('❌ No users found in database. You need to register a new user or migrate data.');
      }
    } else {
      console.log('❌ Users table does not exist. You need to run migrations.');
    }
    
    // Check other important tables
    const tablesToCheck = ['roles', 'permissions', 'files', 'activities'];
    for (const table of tablesToCheck) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        );
      `);
      
      if (result.rows[0].exists) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table};`);
        console.log(`✅ ${table} table exists with ${countResult.rows[0].count} records`);
      } else {
        console.log(`❌ ${table} table does not exist`);
      }
    }
    
  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.log('\nMake sure:');
    console.log('1. PostgreSQL server is running');
    console.log('2. Database \'db_magang\' exists');
    console.log('3. Credentials in .env file are correct');
  } finally {
    await client.end();
  }
}

checkDatabase();