# Instruksi untuk Menjalankan Aplikasi Setelah Perbaikan Database

## Langkah-langkah

1. **Hentikan aplikasi backend jika sedang berjalan** (Ctrl+C)

2. **Jalankan aplikasi backend**:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   node ace serve --watch
   ```
   
   Atau jika Anda menggunakan perintah development:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   npm run dev
   ```

3. **Biarkan aplikasi berjalan**, lalu buka browser dan kunjungi:
   - Frontend: http://localhost:3000
   - Anda bisa mencoba login dengan salah satu kredensial berikut:
     - Superadmin:
       - Email: Superadmin@example.com
       - Password: Superadmin123
     - Admin:
       - Email: Admin@example.com
       - Password: Admin123
     - KetuaTeam:
       - Email: KetuaTeam@example.com
       - Password: KetuaTeam123
     - User:
       - Email: User@example.com
       - Password: User1234

## Verifikasi Perubahan

Setelah login berhasil:
1. Coba upload file untuk memastikan fungsi upload berjalan
2. Periksa apakah aktivitas upload tercatat di database
3. Semua operasi database sekarang menggunakan PostgreSQL db_magang

## Troubleshooting

Jika masih mengalami masalah:
1. Pastikan PostgreSQL server Anda sedang berjalan
2. Pastikan database db_magang ada di PostgreSQL Anda
3. Pastikan kredensial di file .env benar
4. Lihat log aplikasi untuk pesan error spesifik