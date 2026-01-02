import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import File from './file.js'

export default class FileKey extends BaseModel {
  public static updatedAt = null

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fileId: number

  @column()
  declare userId: number

  @column()
  declare encryptedKey: string

  @column()
  declare algorithm: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => File)
  declare file: BelongsTo<typeof File>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
