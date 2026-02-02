import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import User from './user.js'
import File from './file.js'
import Folder from './folder.js'

export type ActivityAction =
  // Auth activities
  | 'auth:login'
  | 'auth:logout'
  | 'auth:register'
  // File activities
  | 'file:upload'
  | 'file:download'
  | 'file:update'
  | 'file:delete'
  | 'file:view'
  | 'file:encrypt'
  | 'file:decrypt'
  // Folder activities
  | 'folder:create'
  | 'folder:update'
  | 'folder:delete'
  | 'folder:view'
  // Share activities
  | 'share:create'
  | 'share:update'
  | 'share:delete'
  | 'share:access'
  | 'share:download'
  // Key activities
  | 'key:share'
  // User activities
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  // Role activities
  | 'role:assign'
  | 'role:revoke'
  // Legacy (for backward compatibility)
  | 'upload'
  | 'download'
  | 'share'
  | 'delete'
  | 'update'
  | 'login'

export default class Activity extends BaseModel {
  public static updatedAt = null

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare fileId: number | null

  @column()
  declare folderId: number | null

  @column()
  declare action: ActivityAction

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => File, {
    foreignKey: 'fileId',
  })
  declare file: BelongsTo<typeof File>

  @belongsTo(() => Folder, {
    foreignKey: 'folderId',
  })
  declare folder: BelongsTo<typeof Folder>
}
