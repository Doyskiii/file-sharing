# Instruksi untuk Memperbaiki Masalah Login

## Masalah
Setelah mengganti dari SQLite ke PostgreSQL, Anda mengalami masalah "invalid credential" saat login.

## Penyebab
Kemungkinan besar karena Anda mencoba login dengan kredensial yang salah atau belum menjalankan migrasi/seeding di database PostgreSQL.

## Solusi

### 1. Coba Login dengan Kredensial Berikut
- Email: `Superadmin@example.com`
- Password: `Superadmin123`

### 2. Jika Masih Bermasalah, Jalankan Migrasi dan Seeding
Buka terminal di direktori `c:\Users\LENOVO\file-sharing\backend` dan jalankan:

```bash
# Jalankan migrasi (ini akan membuat ulang tabel-tabel)
node ace migration:refresh

# Jalankan seeding (ini akan membuat ulang data pengguna)
node ace db:seed
```

### 3. Atau, Registrasi User Baru
Jika Anda tidak ingin menjalankan migrasi ulang, Anda bisa:
- Registrasi user baru di http://localhost:3000/register
- Lalu login dengan kredensial yang baru Anda buat

## Catatan Penting
- Pastikan PostgreSQL server Anda sedang berjalan
- Pastikan database `db_magang` ada di PostgreSQL Anda
- Setelah perubahan konfigurasi, restart aplikasi backend Anda

## Kredensial Default
Jika seeding berhasil dijalankan, kredensial default adalah:
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