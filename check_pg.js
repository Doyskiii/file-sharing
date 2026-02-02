import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB_NAME || 'db_magang',
  ssl: false, // Disable SSL for local testing
});

client.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    client.query('SELECT id, username, email FROM users LIMIT 5', (err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log(res.rows);
      }
      client.end();
    });
  }
});
