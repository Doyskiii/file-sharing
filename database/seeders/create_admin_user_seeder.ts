import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Create admin user if not exists
    let adminUser = await User.query().where('email', 'admin@example.com').first()
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        isActive: true,
        isTotpEnabled: false,
        totpSecret: null,
      })
      console.log('Admin user created')
    } else {
      console.log('Admin user already exists')
    }
  }
}
