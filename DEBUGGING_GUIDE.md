# Panduan Debugging untuk Masalah Login dan Upload

## Masalah Umum dan Solusi

### 1. Error 400 (Bad Request) saat Login
Ini biasanya terjadi karena:
- Format data yang dikirim tidak sesuai
- Validasi input gagal
- Kredensial salah

**Solusi:**
1. Pastikan Anda menggunakan kredensial yang benar:
   - Email: `Superadmin@example.com`
   - Password: `Superadmin123`
2. Cek konsol browser untuk pesan error spesifik
3. Cek log backend untuk detail error

### 2. Koneksi Database
Pastikan database PostgreSQL `db_magang`:
- Sedang berjalan
- Dapat diakses dari aplikasi
- Berisi data pengguna yang benar

### 3. Konfigurasi Backend
Pastikan file-file berikut telah diubah dengan benar:
- `backend/config/database.ts` - Harus menggunakan `connection: 'pg'`
- `backend/.env` - Harus menggunakan `DB_CONNECTION=pg` dan detail koneksi PostgreSQL

## Langkah-langkah Debugging

### 1. Cek Status Backend
1. Buka terminal dan navigasi ke direktori backend:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   ```
2. Jalankan backend:
   ```bash
   npm run dev
   ```
3. Perhatikan log untuk error apapun

### 2. Cek Koneksi Database
1. Pastikan PostgreSQL server berjalan
2. Pastikan database `db_magang` ada
3. Coba jalankan perintah untuk memverifikasi koneksi:
   ```bash
   node ace db:seed
   ```

### 3. Cek Frontend
1. Buka browser dan pergi ke http://localhost:3000
2. Buka Developer Tools (F12)
3. Lihat tab Network untuk melihat permintaan API
4. Coba login dan lihat permintaan `/api/login`

### 4. Cek Isi Database
Jika login masih gagal, cek isi database:
1. Gunakan aplikasi seperti pgAdmin atau psql
2. Lihat isi tabel `users` di database `db_magang`
3. Pastikan user dengan email `Superadmin@example.com` ada

## Verifikasi Perubahan

Pastikan perubahan berikut telah diterapkan:

### Di backend/config/database.ts:
```javascript
const dbConfig = defineConfig({
  connection: 'pg', // Harus 'pg', bukan 'sqlite'
  // ...
  pg: {
    client: 'pg',
    connection: {
      host: env.get('PG_HOST'),
      port: env.get('PG_PORT'),
      user: env.get('PG_USER'),
      password: env.get('PG_PASSWORD'),
      database: env.get('PG_DB_NAME', 'db_magang'),
      ssl: env.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    },
    // ...
  },
})
```

### Di backend/.env:
```
DB_CONNECTION=pg
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=db_magang
```

## Restart Prosedur Lengkap

1. Hentikan semua proses aplikasi (frontend dan backend)
2. Pastikan PostgreSQL server berjalan
3. Jalankan backend:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   npm run dev
   ```
4. Di terminal baru, jalankan frontend:
   ```bash
   cd c:\Users\LENOVO\file-sharing\frontend
   npm run dev
   ```
5. Akses http://localhost:3000 dan coba login

## Jika Masih Bermasalah

Jika Anda masih mengalami masalah, coba jalankan perintah berikut di backend untuk reset dan rebuild database:
```bash
# Hapus dan buat ulang migrasi (BERHATI-HATI: ini akan menghapus semua data!)
node ace migration:refresh
node ace db:seed
```

Lalu restart aplikasi.