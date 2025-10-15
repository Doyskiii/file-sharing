import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE')
      table
        .integer('permission_id')
        .unsigned() // angka tanpa tanda negatif
        // biar tipe data-nya sama dengan kolom roles.id
        .references('id')
        .inTable('permissions')
        .onDelete('CASCADE')

      // Mencegah duplikasi entri (satu role tidak bisa punya permission yang sama dua kali)
      table.primary(['role_id', 'permission_id'])

      table.timestamp('created_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
