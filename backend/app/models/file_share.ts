import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import File from './file.js'

// Definisikan tipe untuk 'access_type'
export type AccessType = 'view' | 'edit' | 'download'

export default class FileShare extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fileId: number

  @column()
  declare ownerId: number

  @column()
  declare sharedWithId: number | null

  @column()
  declare accessType: AccessType

  @column()
  declare isPublic: boolean

  @column()
  declare publicToken: string | null

  @column.dateTime()
  declare expiredAt: DateTime | null

  @column()
  declare encryptedKeyForRecipient: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => File, {
    foreignKey: 'fileId',
  })
  declare file: BelongsTo<typeof File>

  // Relasi untuk pemilik share
  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  // Relasi untuk penerima share
  @belongsTo(() => User, {
    foreignKey: 'sharedWithId',
  })
  declare recipient: BelongsTo<typeof User>
}
