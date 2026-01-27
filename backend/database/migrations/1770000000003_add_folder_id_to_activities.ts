import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    // Only add folder_id column if it doesn't exist
    const hasFolderIdColumn = await this.schema.hasColumn(this.tableName, 'folder_id');
    if (!hasFolderIdColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.integer('folder_id').unsigned().nullable()
      })
    }
  }

  async down() {
    const hasFolderIdColumn = await this.schema.hasColumn(this.tableName, 'folder_id');
    if (hasFolderIdColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('folder_id')
      })
    }
  }
}