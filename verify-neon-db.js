const pg = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_ZnUGfNuek59I@ep-fancy-shadow-ae5sdgfg-pooler.c-2.us-east-2.aws.neon.tech/db_magang?channel_binding=require&sslmode=require';

const client = new pg.Client({
  connectionString: connectionString,
});

async function verifyDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to Neon database\n');

    // Get list of tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Created Tables:');
    console.log('─'.repeat(40));
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    console.log('─'.repeat(40));
    console.log(`Total: ${result.rows.length} tables\n`);

    await client.end();
    console.log('✓ Verification complete');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
