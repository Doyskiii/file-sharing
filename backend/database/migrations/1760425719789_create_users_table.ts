import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.string('username', 255).notNullable()
      table.string('email', 150).notNullable().unique()
      table.string('password', 180).notNullable()

      table.boolean('is_active').notNullable().defaultTo(false)
      table.string('totp_secret').nullable()
      table.boolean('is_totp_enabled').notNullable().defaultTo(false)

      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('SET NULL') // Jika role dihapus, set kolom ini jadi NULL

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
