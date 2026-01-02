import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign Keys
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('file_id')
        .unsigned()
        .references('id')
        .inTable('files')
        .onDelete('SET NULL')
        .nullable()

      table
        .enum('action', ['upload', 'download', 'share', 'delete', 'update', 'login'])
        .notNullable()

      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()

      table.timestamp('created_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
