import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Permission from './permission.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  // Kolom timestamp ini otomatis dikelola oleh Lucid
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // ===== RELATION =====
  @manyToMany(() => Permission, {
    pivotTable: 'role_permissions', // Nama tabel jembatan
    pivotForeignKey: 'role_id', // Foreign key untuk Role di tabel jembatan
    pivotRelatedForeignKey: 'permission_id', // Foreign key untuk Permission di tabel jembatan
  })
  declare permissions: ManyToMany<typeof Permission>

  @hasMany(() => User)
  declare users: HasMany<typeof User>
}
