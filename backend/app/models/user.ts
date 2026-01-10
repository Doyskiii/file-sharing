import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

import Role from './role.js'
import Session from './session.js'
import Folder from './folder.js'
import File from './file.js'
import Activity from './activity.js'
import FileShare from './file_share.js'
import FileKey from './file_key.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends AuthFinder(BaseModel) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isActive: boolean

  @column({ serializeAs: null })
  declare totpSecret: string | null

  @column()
  declare isTotpEnabled: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===== RELATION =====
  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @hasMany(() => Folder, { foreignKey: 'ownerId' })
  declare folders: HasMany<typeof Folder>

  @hasMany(() => File)
  declare files: HasMany<typeof File>

  @hasMany(() => Activity)
  declare activities: HasMany<typeof Activity>

  @hasMany(() => FileShare, { foreignKey: 'ownerId' })
  declare ownedShares: HasMany<typeof FileShare>

  @hasMany(() => FileShare, { foreignKey: 'sharedWithId' })
  declare receivedShares: HasMany<typeof FileShare>

  @hasMany(() => FileKey)
  declare fileKeys: HasMany<typeof FileKey>
}
