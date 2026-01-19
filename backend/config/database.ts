import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import { join } from 'node:path'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION', 'sqlite'),
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: join(process.cwd(), 'tmp', 'db.sqlite3'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      useNullAsDefault: true,
    },
    pg: {
      client: 'pg',
      connection: {
        host: env.get('PG_HOST'),
        port: env.get('PG_PORT'),
        user: env.get('PG_USER'),
        password: env.get('PG_PASSWORD'),
        database: env.get('PG_DB_NAME', 'db_magang'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
