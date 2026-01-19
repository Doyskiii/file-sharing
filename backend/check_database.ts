import db from '@adonisjs/lucid/services/db'

async function checkDatabase() {
  try {
    // Check users
    const users = await db.from('users').select('id', 'username', 'email', 'is_active')
    console.log('\n=== USERS IN DATABASE ===')
    console.log('Total users:', users.length)
    console.table(users)

    // Check roles
    const roles = await db.from('roles').select('id', 'name', 'description')
    console.log('\n=== ROLES IN DATABASE ===')
    console.log('Total roles:', roles.length)
    console.table(roles)

    // Check permissions
    const permissions = await db.from('permissions').select('id', 'name', 'description')
    console.log('\n=== PERMISSIONS IN DATABASE ===')
    console.log('Total permissions:', permissions.length)
    console.table(permissions)

    // Check user_roles
    const userRoles = await db
      .from('user_roles')
      .join('users', 'user_roles.user_id', 'users.id')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('users.username', 'users.email', 'roles.name as role_name')
    console.log('\n=== USER ROLES MAPPING ===')
    console.log('Total mappings:', userRoles.length)
    console.table(userRoles)

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkDatabase()
