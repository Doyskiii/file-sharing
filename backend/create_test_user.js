import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function createTestUser() {
  try {
    // Import Adonis app
    const { app } = await import('./bin/server.js');

    // Boot the app
    await app.booted();

    // Import models
    const User = (await import('./app/models/user.js')).default;
    const Role = (await import('./app/models/role.js')).default;

    console.log('Creating test users...');

    // Create admin user
    let adminUser = await User.query().where('email', 'admin@mail.com').first();
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@mail.com',
        password: 'admin123',
        isActive: true,
        isTotpEnabled: false,
        totpSecret: null,
      });
      console.log('✅ Admin user created');

      // Assign Superadmin role
      const superadminRole = await Role.findBy('name', 'Superadmin');
      if (superadminRole) {
        await adminUser.related('roles').attach([superadminRole.id]);
        console.log('✅ Superadmin role assigned');
      }
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create regular user
    let regularUser = await User.query().where('email', 'user@mail.com').first();
    if (!regularUser) {
      regularUser = await User.create({
        username: 'user',
        email: 'user@mail.com',
        password: 'user1234',
        isActive: true,
        isTotpEnabled: false,
        totpSecret: null,
      });
      console.log('✅ Regular user created');

      // Assign User role
      const userRole = await Role.findBy('name', 'User');
      if (userRole) {
        await regularUser.related('roles').attach([userRole.id]);
        console.log('✅ User role assigned');
      }
    } else {
      console.log('ℹ️ Regular user already exists');
    }

    console.log('🎉 Test users creation completed!');
    console.log('📧 Admin: admin@mail.com / admin123');
    console.log('📧 User: user@mail.com / user1234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUser();
