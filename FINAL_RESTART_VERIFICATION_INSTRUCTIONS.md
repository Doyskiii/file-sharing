# Instruksi Final untuk Restart dan Verifikasi Semua Perubahan

## Perubahan yang Telah Dilakukan

### Backend:
1. **Menambahkan kolom `folderId` dan `metadata` ke model Activity**
2. **Memperbarui controller file** agar tidak gagal jika logging activity bermasalah
3. **Memperbarui service activity** dengan penanganan error yang lebih robust
4. **Meningkatkan limit multipart** di `config/bodyparser.ts` dari 20MB ke 50MB
5. **Menambahkan endpoint debug** `/debug-files`

### Frontend:
1. **Mengganti baseURL di api.ts** agar menggunakan proxy Next.js
2. **Memperbarui next.config.js** untuk menambahkan routing untuk `/files` dan `/debug-files`

## Langkah-langkah Restart Lengkap

### 1. Hentikan Aplikasi
- Hentikan frontend jika sedang berjalan (Ctrl+C di terminal frontend)
- Hentikan backend jika sedang berjalan (Ctrl+C di terminal backend)

### 2. Jalankan Backend
Buka terminal/command prompt baru dan jalankan:
```bash
cd c:\Users\LENOVO\file-sharing\backend
npm run dev
```

### 3. Jalankan Frontend
Buka terminal/command prompt baru dan jalankan:
```bash
cd c:\Users\LENOVO\file-sharing\frontend
npm run dev
```

### 4. Coba Upload File
- Buka browser dan kunjungi http://localhost:3000
- Login dengan kredensial:
  - Email: `Superadmin@example.com`
  - Password: `Superadmin123`
- Coba upload file kecil (kurang dari 1MB)

## Cara Memverifikasi Keberhasilan

### Di Browser:
- Buka Developer Tools (F12)
- Pergi ke tab Network
- Coba upload file
- Lihat permintaan POST ke `/files`
- Pastikan statusnya 200 (bukan 400)

### Di Terminal Backend:
- Lihat log untuk melihat apakah permintaan diterima
- Tidak boleh ada error "Cannot define" pada Activity model

## Jika Masih Bermasalah

Jika Anda masih mengalami masalah:

1. **Coba endpoint debug**:
   ```bash
   curl -X POST \
     http://localhost:3000/debug-files \
     -H 'Authorization: Bearer YOUR_TOKEN' \
     -F 'file=@/path/to/small-test-file.txt'
   ```

2. **Periksa tab Network di Developer Tools** untuk melihat detail permintaan dan response

3. **Periksa log backend** untuk melihat error spesifik

## Solusi Darurat

Jika masalah terus berlanjut, Anda bisa sementara menonaktifkan logging activity di file controller:
- Di `backend/app/controllers/file_controller.ts`, komentari baris yang memanggil `ActivityService.logFromContext`

## Harapan Setelah Perubahan Ini

Setelah restart dan verifikasi:
- ✅ Upload file akan berhasil tanpa error 400
- ✅ File akan disimpan ke database dan sistem file
- ✅ Aktivitas upload akan dicatat (jika logging berhasil) atau upload akan tetap berhasil (jika logging gagal)
- ✅ Semua permintaan API akan melalui proxy dengan benar