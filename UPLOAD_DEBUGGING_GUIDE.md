# Panduan Debugging untuk Masalah Upload File

## Error 400 saat Upload File

Error 400 (Bad Request) saat upload file biasanya terjadi karena beberapa alasan:

### 1. Autentikasi Gagal
Upload file memerlukan pengguna untuk login terlebih dahulu.

**Solusi:**
- Pastikan Anda sudah login sebelum mencoba upload file
- Cek apakah token otorisasi ada di localStorage
- Coba logout dan login kembali

### 2. Format Data Tidak Sesuai
Permintaan upload file harus dalam format multipart/form-data.

**Solusi:**
- Pastikan frontend mengirim data dalam format yang benar
- File harus dikirim sebagai FormData
- Header Content-Type harus diatur ke multipart/form-data

### 3. Validasi File Gagal
File mungkin tidak memenuhi persyaratan validasi.

**Solusi:**
- Pastikan ukuran file tidak melebihi 50MB
- Pastikan jenis file didukung (PDF, DOC, XLS, gambar, dll)
- Cek apakah file tidak rusak

## Langkah-langkah Debugging

### 1. Cek Autentikasi
1. Buka Developer Tools (F12)
2. Pergi ke tab Application
3. Cek localStorage untuk melihat apakah token ada:
   - Kunci 'token' harus ada dan berisi nilai
   - Kunci 'user' harus ada dan berisi informasi pengguna

### 2. Cek Permintaan Jaringan
1. Buka Developer Tools (F12)
2. Pergi ke tab Network
3. Coba upload file
4. Cari permintaan POST ke `/api/files`
5. Klik permintaan tersebut dan lihat:
   - Headers: Apakah Authorization header ada dan benar?
   - Payload: Apakah file dikirim dengan benar?
   - Response: Apa pesan error yang tepat?

### 3. Cek Log Backend
1. Pastikan backend sedang berjalan
2. Lihat terminal tempat Anda menjalankan `npm run dev` di backend
3. Coba upload file dan lihat error apa yang muncul di log

### 4. Coba Upload Manual
Coba upload file menggunakan curl atau Postman untuk memastikan backend berfungsi:

```bash
curl -X POST \
  http://localhost:3333/files \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -F 'file=@/path/to/your/file.pdf' \
  -F 'folderId=1' \
  -F 'encrypt=false'
```

### 5. Cek Konfigurasi Middleware
Pastikan middleware autentikasi diaktifkan untuk endpoint upload file di `start/routes.ts`:
- Endpoint `/files` harus menggunakan middleware auth

## Verifikasi Konfigurasi Backend

Pastikan file-file berikut telah diubah dengan benar:

### Di backend/start/routes.ts:
Endpoint `/files` harus dilindungi dengan middleware auth:
```javascript
router
  .group(() => {
    router.post('/files', '#controllers/file_controller.store')
    // ... endpoint lainnya
  })
  .use(middleware.auth({ guards: ['api'] }))
```

### Di backend/config/database.ts:
Harus menggunakan PostgreSQL:
```javascript
const dbConfig = defineConfig({
  connection: 'pg', // Harus 'pg', bukan 'sqlite'
  // ...
})
```

## Solusi Cepat

Jika Anda masih mengalami masalah, coba langkah-langkah berikut:

1. **Logout dan login kembali** di aplikasi
2. **Clear cache browser** dan localStorage
3. **Restart backend** dan coba lagi
4. **Coba upload file kecil** (kurang dari 1MB) untuk menguji

## Jika Masih Bermasalah

Jika Anda masih mengalami error 400 saat upload file:

1. Cek log backend untuk pesan error yang lebih spesifik
2. Kirimkan detail error dari tab Network di Developer Tools
3. Pastikan Anda menggunakan kredensial login yang benar
4. Pastikan database PostgreSQL berfungsi dengan baik