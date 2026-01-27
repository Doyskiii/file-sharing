import { createConnection } from 'typeorm'
import env from '#start/env'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    console.log('DB Connection type:', env.get('DB_CONNECTION'))
    console.log('PG_HOST:', env.get('PG_HOST'))
    console.log('PG_DB_NAME:', env.get('PG_DB_NAME'))
    
    const connection = await createConnection({
      type: 'postgres',
      host: env.get('PG_HOST'),
      port: env.get('PG_PORT'),
      username: env.get('PG_USER'),
      password: env.get('PG_PASSWORD'),
      database: env.get('PG_DB_NAME'),
      synchronize: false,
      logging: true,
    });
    
    console.log('Database connected successfully!')
    await connection.close();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();