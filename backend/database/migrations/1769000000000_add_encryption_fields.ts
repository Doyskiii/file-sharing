import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'add_encryption_fields'

  async up() {
    // Add encryption fields to users table (only if they don't exist)
    const hasPublicKey = await this.schema.hasColumn('users', 'public_key')
    if (!hasPublicKey) {
      this.schema.alterTable('users', (table) => {
        table.text('public_key').nullable()
        table.text('encrypted_private_key').nullable()
      })
    }

    // Add encryption fields to files table (only if they don't exist)
    const hasIsEncrypted = await this.schema.hasColumn('files', 'is_encrypted')
    if (!hasIsEncrypted) {
      this.schema.alterTable('files', (table) => {
        table.boolean('is_encrypted').defaultTo(false)
        table.text('encryption_key').nullable() // Encrypted AES key
      })
    }

    // Add encryption key for recipient to file_shares table (only if it doesn't exist)
    const hasEncryptedKey = await this.schema.hasColumn('file_shares', 'encrypted_key_for_recipient')
    if (!hasEncryptedKey) {
      this.schema.alterTable('file_shares', (table) => {
        table.text('encrypted_key_for_recipient').nullable()
      })
    }
  }

  async down() {
    // Remove encryption fields from users table
    this.schema.alterTable('users', (table) => {
      table.dropColumn('public_key')
      table.dropColumn('encrypted_private_key')
    })

    // Remove encryption fields from files table
    this.schema.alterTable('files', (table) => {
      table.dropColumn('is_encrypted')
      table.dropColumn('encryption_key')
    })

    // Remove encryption key from file_shares table
    this.schema.alterTable('file_shares', (table) => {
      table.dropColumn('encrypted_key_for_recipient')
    })
  }
}