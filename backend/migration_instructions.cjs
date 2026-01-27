console.log('Checking if migrations need to be run...');
console.log('Since we switched from SQLite to PostgreSQL, we may need to run migrations.');

console.log('\nTo run migrations, use:');
console.log('npx adonis migration:run');

console.log('\nTo reset and re-run migrations, use:');
console.log('npx adonis migration:refresh');

console.log('\nTo check migration status, use:');
console.log('npx adonis migration:status');

console.log('\nAfter running migrations, you may need to seed the database:');
console.log('npx adonis db:seed');