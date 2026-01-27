# Instruksi Lengkap untuk Menjalankan Aplikasi Setelah Perbaikan Database

## Persyaratan Awal

Pastikan hal-hal berikut telah siap:
1. PostgreSQL server sedang berjalan di komputer Anda
2. Database `db_magang` telah dibuat di PostgreSQL
3. Kredensial PostgreSQL di file `.env` benar

## Langkah-langkah Menjalankan Aplikasi

### 1. Jalankan Backend
Buka terminal/command prompt baru dan jalankan:

```bash
cd c:\Users\LENOVO\file-sharing\backend
npm run dev
```

Biarkan aplikasi backend berjalan (jangan tutup terminal ini).

### 2. Jalankan Frontend (jika diperlukan)
Di terminal/command prompt lain, jalankan:

```bash
cd c:\Users\LENOVO\file-sharing\frontend
npm run dev
```

### 3. Akses Aplikasi
Buka browser dan kunjungi:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3333 (biasanya tidak perlu diakses langsung)

## Kredensial Login yang Tersedia

Setelah seeding berhasil, Anda bisa login dengan salah satu kredensial berikut:

### Superadmin
- Email: `Superadmin@example.com`
- Password: `Superadmin123`

### Admin
- Email: `Admin@example.com`
- Password: `Admin123`

### KetuaTeam
- Email: `KetuaTeam@example.com`
- Password: `KetuaTeam123`

### User
- Email: `User@example.com`
- Password: `User1234`

## Verifikasi Fungsi Upload File

Setelah login berhasil:
1. Coba upload file ke aplikasi
2. Pastikan file berhasil diupload dan muncul di daftar file
3. Aktivitas upload akan tercatat di database PostgreSQL

## Troubleshooting Umum

### Jika masih tidak bisa login:
1. Pastikan NODE_ENV di file `.env` diatur ke `development`
2. Pastikan Anda menggunakan kredensial yang benar dari daftar di atas
3. Cek log aplikasi backend untuk pesan error spesifik

### Jika upload file masih bermasalah:
1. Pastikan koneksi database berhasil
2. Cek apakah tabel `files` dan `activities` ada di database PostgreSQL
3. Pastikan ukuran file tidak melebihi batas maksimum (50MB)

### Jika muncul error SSL:
Periksa kembali konfigurasi SSL di `config/database.ts` - di lingkungan development, SSL harus diatur ke `false`.

## Verifikasi Koneksi Database

Jika Anda ingin memverifikasi bahwa aplikasi benar-benar terhubung ke PostgreSQL `db_magang`:
1. Buka aplikasi PostgreSQL Anda (misalnya pgAdmin)
2. Lihat database `db_magang`
3. Periksa tabel-tabel seperti `users`, `files`, `activities` - mereka harus ada dan berisi data