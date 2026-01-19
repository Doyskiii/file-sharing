import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    // First, drop the existing enum type constraint
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName} 
      ALTER COLUMN action TYPE VARCHAR(50)
    `)

    this.schema.alterTable(this.tableName, (table) => {
      // Add folder_id column
      table
        .integer('folder_id')
        .unsigned()
        .references('id')
        .inTable('folders')
        .onDelete('SET NULL')
        .nullable()

      // Add metadata column for additional context
      table.json('metadata').nullable()

      // Add indexes for better query performance
      table.index('user_id')
      table.index('file_id')
      table.index('folder_id')
      table.index('action')
      table.index('created_at')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('user_id')
      table.dropIndex('file_id')
      table.dropIndex('folder_id')
      table.dropIndex('action')
      table.dropIndex('created_at')
      table.dropColumn('folder_id')
      table.dropColumn('metadata')
    })

    // Revert action column back to original type
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      ALTER COLUMN action TYPE VARCHAR(255)
    `)
  }
}
