import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import File from './file.js'

export default class Folder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare ownerId: number

  @column()
  declare parentId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===== RELATION =====
  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => Folder, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof Folder>

  @hasMany(() => Folder, {
    foreignKey: 'parentId',
  })
  declare children: HasMany<typeof Folder>

  @hasMany(() => File)
  declare files: HasMany<typeof File>
}
