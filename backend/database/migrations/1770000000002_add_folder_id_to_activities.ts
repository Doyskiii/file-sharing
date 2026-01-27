import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    // Check if folder_id column already exists before adding it
    const hasFolderIdColumn = await this.schema.hasColumn(this.tableName, 'folder_id');
    if (!hasFolderIdColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.integer('folder_id').unsigned().nullable().references('id').inTable('folders').onDelete('CASCADE')
      })
    }
  }

  async down() {
    const hasFolderIdColumn = await this.schema.hasColumn(this.tableName, 'folder_id');
    if (hasFolderIdColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropForeign(['folder_id'])
        table.dropColumn('folder_id')
      })
    }
  }
}