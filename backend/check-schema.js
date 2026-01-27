// Quick script to check if migration columns exist
import pg from 'pg';
const { Client } = pg;

async function checkSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'db_magang',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Check users table columns
    const usersColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    usersColumns.rows.forEach(row => console.log('  -', row.column_name));

    // Check files table columns
    const filesColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'files' 
      ORDER BY ordinal_position
    `);
    console.log('\nFiles table columns:');
    filesColumns.rows.forEach(row => console.log('  -', row.column_name));

    // Check file_shares table columns
    const sharesColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'file_shares' 
      ORDER BY ordinal_position
    `);
    console.log('\nFile_shares table columns:');
    sharesColumns.rows.forEach(row => console.log('  -', row.column_name));

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (client._connected) {
      await client.end();
    }
  }
}

checkSchema();
