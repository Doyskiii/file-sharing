import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    // Drop the check constraint created by the enum type
    await this.db.rawQuery(`
      ALTER TABLE ${this.tableName}
      DROP CONSTRAINT IF EXISTS activities_action_check
    `)
  }

  async down() {
    // In down migration, we can't easily recreate the constraint
    // since the original enum values are not available
    // This is acceptable for this fix
  }
}
