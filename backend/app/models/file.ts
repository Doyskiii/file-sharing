import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import User from './user.js'
import Folder from './folder.js'
import Activity from './activity.js'
import FileShare from './file_share.js'
import FileKey from './file_key.js'

export default class File extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare ownerId: number

  @column()
  declare folderId: number | null

  @column()
  declare originalName: string

  @column()
  declare storedName: string

  @column()
  declare mimeType: string

  @column()
  declare size: number // bigint akan menjadi number di model

  @column()
  declare path: string

  @column()
  declare isEncrypted: boolean

  @column()
  declare encryptionMethod: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => User)
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => Folder)
  declare folders: BelongsTo<typeof Folder>

  @hasMany(() => Activity)
  declare activities: HasMany<typeof Activity>

  @hasMany(() => FileShare)
  declare shares: HasMany<typeof FileShare>

  @hasMany(() => FileKey)
  declare keys: HasMany<typeof FileKey>
}
