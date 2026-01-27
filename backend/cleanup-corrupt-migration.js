// Cleanup corrupt migration record
import pg from 'pg';
const { Client } = pg;

async function cleanup() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'db_magang',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Delete the corrupt migration record
    const result = await client.query(`
      DELETE FROM adonis_schema 
      WHERE name = 'database/migrations/1768927798091_create_update_activities_action_enums_table'
      RETURNING *
    `);

    if (result.rowCount > 0) {
      console.log('✅ Removed corrupt migration record:', result.rows[0].name);
    } else {
      console.log('ℹ️  No corrupt migration found to remove');
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (client._connected) {
      await client.end();
    }
  }
}

cleanup();
