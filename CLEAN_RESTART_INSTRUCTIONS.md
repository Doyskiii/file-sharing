# Instruksi untuk Membersihkan dan Restart Aplikasi

## Masalah yang Diketahui
- Tabel `activities` di database sudah memiliki kolom `folder_id` dan `metadata`
- Namun aplikasi masih melaporkan error bahwa kolom-kolom tersebut tidak ada di model

## Penyebab yang Mungkin
- Cache TypeScript/AdonisJS mungkin menyimpan versi lama dari model Activity
- Build aplikasi mungkin perlu di-refresh

## Langkah-langkah Pembersihan dan Restart

### 1. Hentikan Backend
Jika backend sedang berjalan, hentikan dengan menekan Ctrl+C

### 2. Bersihkan Cache dan Build
Jalankan perintah berikut di direktori backend:
```bash
cd c:\Users\LENOVO\file-sharing\backend

# Hapus direktori output jika ada
rmdir /s /q build 2>nul

# Hapus cache node_modules jika perlu
# (opsional, hanya jika masalah terus berlanjut)
# rmdir /s /q node_modules
# npm install

# Clear cache npm
npm cache clean --force

# Build aplikasi (jika menggunakan production build)
# npm run build
```

### 3. Restart Backend
Jalankan perintah berikut:
```bash
cd c:\Users\LENOVO\file-sharing\backend
npm run dev
```

### 4. Coba Upload File Lagi
- Buka aplikasi di http://localhost:3000
- Login dengan kredensial yang benar
- Coba upload file kecil

### 5. Jika Masih Bermasalah, Coba Mode Production
Kadang mode development bisa memiliki masalah cache. Coba build dan jalankan dalam mode production:
```bash
cd c:\Users\LENOVO\file-sharing\backend

# Build aplikasi
npm run build

# Jalankan dalam mode production
node bin/server.js
```

## Verifikasi Perubahan
Setelah restart, pastikan:
- Tidak ada error saat startup
- Model Activity memiliki kolom folderId dan metadata
- Upload file berhasil tanpa error "Cannot define ... on Activity model"

## Jika Masih Bermasalah
Jika masalah terus berlanjut setelah restart dan pembersihan:
1. Coba restart komputer Anda
2. Coba clone ulang repositori ke direktori baru
3. Hubungi administrator sistem untuk memastikan tidak ada masalah permission