import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from './user.js'
import File from './file.js'

export type ActivityAction = 'upload' | 'download' | 'share' | 'delete' | 'update' | 'login'

export default class Activity extends BaseModel {
  public static updatedAt = null

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare fileId: number | null

  @column()
  declare action: ActivityAction

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => File)
  declare file: BelongsTo<typeof File>
}
