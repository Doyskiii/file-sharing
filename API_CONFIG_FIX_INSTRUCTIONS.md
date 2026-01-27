# Instruksi untuk Memperbaiki Konfigurasi API

## Masalah yang Ditemukan

Konfigurasi API frontend memiliki masalah routing:
- Frontend Next.js diatur untuk me-rewrite `/api/` ke backend
- Tapi endpoint upload file adalah `/files`, bukan `/api/files`
- Ini menyebabkan permintaan upload file tidak melalui proxy dengan benar

## Solusi yang Telah Diterapkan

1. **Memperbarui next.config.js** untuk menambahkan routing untuk endpoint `/files` dan `/debug-files`:
   ```javascript
   async rewrites() {
     return [
       {
         source: '/api/:path*',
         destination: 'http://localhost:3333/:path*',
       },
       {
         source: '/files/:path*',
         destination: 'http://localhost:3333/files/:path*',
       },
       {
         source: '/debug-files/:path*',
         destination: 'http://localhost:3333/debug-files/:path*',
       },
     ]
   }
   ```

## Langkah-langkah Selanjutnya

### 1. Restart Frontend
Hentikan dan jalankan ulang frontend:
```bash
# Di terminal frontend
cd c:\Users\LENOVO\file-sharing\frontend
npm run dev
```

### 2. Restart Backend (untuk memastikan semua perubahan diterapkan)
```bash
# Di terminal backend
cd c:\Users\LENOVO\file-sharing\backend
npm run dev
```

### 3. Coba Upload File Lagi
- Buka http://localhost:3000
- Login dengan kredensial yang benar
- Coba upload file kecil

## Alternatif: Ganti Konfigurasi API

Jika masalah masih berlanjut, kita juga bisa mengganti baseURL di api.ts untuk menggunakan path proxy:

```typescript
// Di frontend/src/lib/api.ts
const api = axios.create({
    baseURL: '/api',  // Gunakan path proxy daripada URL langsung
    withCredentials: false,
})
```

Tapi karena kita sudah menambahkan routing untuk `/files` dan `/debug-files` di next.config.js, seharusnya konfigurasi saat ini sudah cukup.

## Verifikasi Perubahan

Setelah restart:
- Permintaan ke `/files` sekarang akan di-rewrite ke backend
- Permintaan ke `/debug-files` juga akan di-rewrite ke backend
- Semua permintaan API sekarang melalui proxy dengan benar