import User from '#models/user'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Find admin user
    const adminUser = await User.query().where('email', 'admin@example.com').first()
    if (!adminUser) {
      console.log('Admin user not found')
      return
    }

    // Find Superadmin role
    const superadminRole = await Role.findBy('name', 'Superadmin')
    if (!superadminRole) {
      console.log('Superadmin role not found')
      return
    }

    // Assign Superadmin role to admin user and activate account
    await adminUser.related('roles').sync([superadminRole.id])
    adminUser.isActive = true
    await adminUser.save()
    console.log('Assigned Superadmin role to admin user and activated account')
  }
}
