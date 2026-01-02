import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'folders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 100).notNullable()

      // Relasi ke User (pemilik folder)
      table.integer('owner_id').references('id').inTable('users').onDelete('CASCADE').notNullable()

      // Relasi ke dirinya sendiri (folder induk)
      table.integer('parent_id').references('id').inTable('folders').onDelete('SET NULL').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
