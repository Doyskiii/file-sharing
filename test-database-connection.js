// Test Database Connection
// Run: node test-database-connection.js

const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'db_magang',
  });

  try {
    console.log('🔄 Attempting to connect to database...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL database: db_magang');
    
    // Test query
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Database Info:');
    console.log('  - Database:', result.rows[0].current_database);
    console.log('  - User:', result.rows[0].current_user);
    console.log('  - PostgreSQL Version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing Tables:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('  ⚠️  No tables found. You need to run migrations.');
    }
    
    await client.end();
    console.log('\n✅ Connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('  1. Make sure PostgreSQL is running on localhost:5432');
    console.error('  2. Verify database "db_magang" exists');
    console.error('  3. Check username and password are correct');
    console.error('  4. Run: CREATE DATABASE db_magang; (if database doesn\'t exist)');
    
    if (client._connected) {
      await client.end();
    }
    return false;
  }
}

testConnection();
