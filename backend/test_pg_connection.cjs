const { exec } = require('child_process');

console.log('Testing PostgreSQL connection to db_magang...');
console.log('Checking if PostgreSQL service is available...');

// Simple test to see if we can connect to PostgreSQL
const testCommand = `
  node -e "
    const { Pool } = require('pg');
    const fs = require('fs');
    
    // Read environment variables from .env file
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    envContent.split('\\n').forEach(line => {
      if (line.includes('=')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
      }
    });
    
    const pool = new Pool({
      host: envVars.PG_HOST,
      port: parseInt(envVars.PG_PORT),
      user: envVars.PG_USER,
      password: envVars.PG_PASSWORD,
      database: envVars.PG_DB_NAME
    });
    
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ PostgreSQL connection FAILED:');
        console.error(err.message);
        console.log('\\nMake sure:');
        console.log('1. PostgreSQL server is running');
        console.log('2. Database \\'db_magang\\' exists');
        console.log('3. Credentials in .env file are correct');
        pool.end();
        process.exit(1);
      } else {
        console.log('✅ Successfully connected to PostgreSQL database!');
        console.log('✅ Database:', envVars.PG_DB_NAME);
        console.log('✅ Connected at:', res.rows[0].now);
        pool.end();
        process.exit(0);
      }
    });
  "
`;

exec(testCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});