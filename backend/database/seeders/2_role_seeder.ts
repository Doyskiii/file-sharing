import Role from '#models/role'
import Permission from '#models/permission'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Create roles with check for existing
    const roleData = [
      { name: 'BOD', description: 'Board of Directors' },
      { name: 'Finance', description: 'finance' },
      { name: 'Project Manager', description: 'project manager' },
      { name: 'Administration', description: 'administration' },
      { name: 'Founder', description: 'founder' },
      { name: 'Tata Usaha', description: 'tata usaha' },
      { name: 'User', description: 'user' },
      { name: 'Superadmin', description: 'superadmin' },
    ];

    const roles = [];
    for (const data of roleData) {
      let role = await Role.query().where('name', data.name).first();
      if (!role) {
        role = await Role.create(data);
      }
      roles.push(role);
    }

    // Fetch permissions
    const permissions = await Permission.all()

    // Assign permissions to Superadmin role
    const superadminRole = roles.find(role => role.name === 'Superadmin')
    if (superadminRole) {
      await superadminRole.related('permissions').sync(permissions.map(p => p.id))
    }

    // Assign basic permissions to other roles as needed
    // For example, assign user:view to all roles, but since it's not in permissions, skip for now
    // You can customize based on requirements
  }
}
