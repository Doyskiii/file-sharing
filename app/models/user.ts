import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import Role from './role.js'
import Session from './session.js'
import Folder from './folder.js'
import File from './file.js'
import Activity from './activity.js'
import FileShare from './file_share.js'
import FileKey from './file_key.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null }) // Sembunyikan password dari output JSON
  declare password: string

  @column()
  declare isActive: boolean

  @column({ serializeAs: null }) // Sembunyikan juga secret key
  declare totpSecret: string | null

  @column()
  declare isTotpEnabled: boolean

  @column()
  declare roleId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => Role)
  declare roles: BelongsTo<typeof Role>

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @hasMany(() => Folder, { foreignKey: 'ownerId' })
  declare folders: HasMany<typeof Folder>

  @hasMany(() => File)
  declare files: HasMany<typeof File>

  @hasMany(() => Activity)
  declare activities: HasMany<typeof Activity>

  // Daftar file yang dibagikan OLEH user ini
  @hasMany(() => FileShare, {
    foreignKey: 'ownerId',
  })
  declare ownedShares: HasMany<typeof FileShare>

  // Daftar file yang dibagikan KEPADA user ini
  @hasMany(() => FileShare, {
    foreignKey: 'sharedWithId',
  })
  declare receivedShares: HasMany<typeof FileShare>

  @hasMany(() => FileKey)
  declare fileKeys: HasMany<typeof FileKey>
}
