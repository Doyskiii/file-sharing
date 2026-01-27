// Skrip untuk menjalankan migrasi dan seeding secara otomatis
const { spawn } = require('child_process');
const path = require('path');

console.log('Menjalankan migrasi dan seeding database...');

// Fungsi untuk menjalankan perintah
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Menjalankan: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { 
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✓ ${command} ${args.join(' ')} berhasil\n`);
        resolve();
      } else {
        console.error(`✗ ${command} ${args.join(' ')} gagal dengan kode: ${code}\n`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(`✗ Error saat menjalankan ${command}:`, err.message);
      reject(err);
    });
  });
}

async function setupDatabase() {
  const backendDir = path.join(__dirname, '..', 'backend');
  
  try {
    console.log('Langkah 1: Menjalankan migrasi ulang (migration:refresh)');
    await runCommand('node', ['ace', 'migration:refresh'], backendDir);
    
    console.log('Langkah 2: Menjalankan seeding (db:seed)');
    await runCommand('node', ['ace', 'db:seed'], backendDir);
    
    console.log('✅ Migrasi dan seeding berhasil diselesaikan!');
    console.log('\nKredensial login yang tersedia sekarang:');
    console.log('- Superadmin: Superadmin@example.com / Superadmin123');
    console.log('- Admin: Admin@example.com / Admin123');
    console.log('- KetuaTeam: KetuaTeam@example.com / KetuaTeam123');
    console.log('- User: User@example.com / User1234');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat menjalankan migrasi dan seeding:', error.message);
    console.log('\nPastikan:');
    console.log('1. PostgreSQL server sedang berjalan');
    console.log('2. Database db_magang sudah dibuat');
    console.log('3. Kredensial di .env benar');
    console.log('4. Anda berada di direktori backend saat menjalankan perintah');
  }
}

setupDatabase();