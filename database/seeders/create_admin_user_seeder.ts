import User from '#models/user'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Create multiple users with different roles
    const usersData = [
      {
        username: 'Superadmin',
        email: 'Superadmin@example.com',
        password: 'Superadmin123',
        roleName: 'Superadmin',
      },
      {
        username: 'Admin',
        email: 'Admin@example.com',
        password: 'Admin123',
        roleName: 'Administration',
      },
      {
        username: 'KetuaTeam',
        email: 'KetuaTeam@example.com',
        password: 'KetuaTeam123',
        roleName: 'Project Manager',
      },
      {
        username: 'User',
        email: 'User@example.com',
        password: 'User1234',
        roleName: 'User',
      },
    ]

    for (const userData of usersData) {
      let user = await User.query().where('email', userData.email).first()
      if (!user) {
        user = await User.create({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          isActive: true,
          isTotpEnabled: false,
          totpSecret: null,
        })
        console.log(`${userData.username} user created`)

        // Assign role
        const role = await Role.findBy('name', userData.roleName)
        if (role) {
          await user.related('roles').attach([role.id])
          console.log(`Assigned ${userData.roleName} role to ${userData.username}`)
        }
      } else {
        console.log(`${userData.username} user already exists`)
      }
    }
  }
}
