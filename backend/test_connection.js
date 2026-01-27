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
  database: 'postgres', // Connect to default postgres database first
  ssl: false // Disable SSL for this connection
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL server!');
    
    // Check if our target database exists
    const dbCheckQuery = `
      SELECT datname 
      FROM pg_catalog.pg_database 
      WHERE lower(datname) = lower($1);
    `;
    const dbExists = await client.query(dbCheckQuery, [envVars.PG_DB_NAME || 'db_magang']);
    
    if (dbExists.rowCount === 0) {
      console.log(`❌ Database '${envVars.PG_DB_NAME || 'db_magang'}' does not exist.`);
      console.log(`💡 Creating database '${envVars.PG_DB_NAME || 'db_magang'}'...`);
      
      // Create the database
      await client.query(`CREATE DATABASE "${envVars.PG_DB_NAME || 'db_magang'}";`);
      console.log(`✅ Database '${envVars.PG_DB_NAME || 'db_magang'}' created successfully!`);
    } else {
      console.log(`✅ Database '${envVars.PG_DB_NAME || 'db_magang'}' already exists.`);
    }
    
    await client.end();
    console.log('✅ Connection closed.');
    
    // Now test connection to the specific database
    await testSpecificDatabase();
  } catch (err) {
    console.error('❌ PostgreSQL connection FAILED:');
    console.error('Error details:', err.message);
    console.log('\nMake sure:');
    console.log('1. PostgreSQL server is running');
    console.log('2. Credentials in .env file are correct');
    
    if (client) {
      try {
        await client.end();
      } catch(e) {
        console.error('Error closing client:', e);
      }
    }
  }
}

async function testSpecificDatabase() {
  const specificClient = new Client({
    host: envVars.PG_HOST || 'localhost',
    port: envVars.PG_PORT || 5432,
    user: envVars.PG_USER || 'postgres',
    password: envVars.PG_PASSWORD || 'postgres',
    database: envVars.PG_DB_NAME || 'db_magang',
    ssl: false // Disable SSL
  });

  try {
    await specificClient.connect();
    console.log(`✅ Successfully connected to database: ${envVars.PG_DB_NAME || 'db_magang'}`);
    
    // Check if tables exist
    const tablesResult = await specificClient.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log('Number of tables in database:', tablesResult.rows.length);
    
    await specificClient.end();
    console.log('✅ Specific database connection closed.');
  } catch (err) {
    console.error('❌ Could not connect to specific database:');
    console.error('Error details:', err.message);
    
    if (specificClient) {
      try {
        await specificClient.end();
      } catch(e) {
        console.error('Error closing specific client:', e);
      }
    }
  }
}

testConnection();