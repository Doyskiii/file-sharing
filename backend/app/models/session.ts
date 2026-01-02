import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Session extends BaseModel {
  public static updatedAt = null

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column({ serializeAs: null }) // Sembunyikan token dari output JSON
  declare jwtToken: string

  @column()
  declare ipAddress: string | null

  @column()
  declare deviceName: string | null

  @column.dateTime({ autoCreate: true })
  declare expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => User)
  declare users: BelongsTo<typeof User>
}
