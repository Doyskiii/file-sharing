import User from '#models/user'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  public async run() {
    const users = [
      {
        username: 'admin',
        email: 'admin@mail.com',
        password: 'admin123',
        roleName: 'Superadmin',
      },
      {
        username: 'user',
        email: 'user@mail.com',
        password: 'user1234',
        roleName: 'User',
      },
    ]

    for (const data of users) {
      const user = await User.updateOrCreate(
        { email: data.email },
        {
          username: data.username,
          password: data.password,
          isActive: true,
          isTotpEnabled: false,
        }
      )

      const role = await Role.findBy('name', data.roleName)
      if (role) {
        await user.related('roles').sync([role.id])
      }
    }
  }
}
