import Permission from '#models/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const permissionData = [
      { name: 'user:create', description: 'Create new users' },
      { name: 'user:update', description: 'Update user information' },
      { name: 'user:delete', description: 'Delete users' },
      { name: 'user:assign-role', description: 'Assign roles to users' },
      { name: 'role:create', description: 'Create new roles' },
      { name: 'role:update', description: 'Update role information' },
      { name: 'role:delete', description: 'Delete roles' },
      { name: 'role:assign-permission', description: 'Assign permissions to roles' },
      { name: 'permission:view', description: 'View permissions' },
    ]

    for (const data of permissionData) {
      let permission = await Permission.query().where('name', data.name).first()
      if (!permission) {
        await Permission.create(data)
      }
    }
  }
}
