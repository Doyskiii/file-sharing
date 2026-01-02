import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign Keys
      table.integer('owner_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.integer('folder_id').references('id').inTable('folders').onDelete('SET NULL').nullable()

      // File Details
      table.string('original_name', 255).notNullable()
      table.string('stored_name', 255).notNullable().unique()
      table.string('mime_type', 100).notNullable()
      table.bigInteger('size').unsigned().notNullable()
      table.string('path', 255).notNullable()

      // Encryption Details
      table.boolean('is_encrypted').defaultTo(false).notNullable()
      table.string('encryption_method', 50).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
