import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany([
      { name: 'BOD', description: 'Board of Directors' },
      { name: 'Finance', description: 'finance' },
      { name: 'Project Manager', description: 'project manager' },
      { name: 'Administration', description: 'administration' },
      { name: 'Founder', description: 'founder' },
      { name: 'Tata Usaha', description: 'tata usaha' },
      { name: 'User', description: 'user' },
      { name: 'Superadmin', description: 'superadmin' },
    ])
  }
}
