import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      // 'longtext' untuk memastikan cukup ruang untuk JWT yang panjang
      table.text('jwt_token', 'longtext').notNullable().unique()

      table.string('ip_address', 45).nullable()
      table.string('device_name', 100).nullable()

      table.timestamp('expires_at', { useTz: true })
      table.timestamp('created_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
