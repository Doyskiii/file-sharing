# Instruksi untuk Debug Upload File

## Langkah-langkah Debug

### 1. Jalankan Backend
Pastikan backend berjalan:
```bash
cd c:\Users\LENOVO\file-sharing\backend
npm run dev
```

### 2. Cek Autentikasi
Pastikan Anda sudah login dan memiliki token. Ambil token dari localStorage browser Anda.

### 3. Coba Upload File Secara Manual
Gunakan curl atau Postman untuk menguji endpoint upload:

```bash
curl -X POST \
  http://localhost:3333/debug-files \
  -H 'Authorization: Bearer YOUR_ACTUAL_TOKEN_HERE' \
  -F 'file=@/path/to/your/test-file.pdf' \
  -F 'folderId=1' \
  -F 'encrypt=false'
```

Ganti `YOUR_ACTUAL_TOKEN_HERE` dengan token aktual dari localStorage Anda, dan ganti path file dengan file yang ingin Anda upload.

### 4. Periksa Log Backend
Saat permintaan dikirim, periksa log backend untuk melihat pesan debug yang ditampilkan.

### 5. Coba Endpoint Normal Juga
Jika endpoint debug bekerja, coba endpoint normal juga:
```bash
curl -X POST \
  http://localhost:3333/files \
  -H 'Authorization: Bearer YOUR_ACTUAL_TOKEN_HERE' \
  -F 'file=@/path/to/your/test-file.pdf' \
  -F 'folderId=1' \
  -F 'encrypt=false'
```

## Informasi yang Perlu Dikumpulkan

Saat mencoba upload file, kumpulkan informasi berikut:

1. Pesan error lengkap dari frontend
2. Pesan error dari backend log
3. Header permintaan dari tab Network di Developer Tools
4. Status respons dari permintaan upload

## Jika Masih Bermasalah

Jika Anda masih mengalami masalah, kemungkinan besar ada salah satu dari:

1. **Token tidak valid** - coba login ulang
2. **File terlalu besar** - coba file kecil (< 1MB)
3. **Jenis file tidak didukung** - coba file PDF atau TXT
4. **Masalah konfigurasi backend** - periksa apakah middleware auth berfungsi
5. **Masalah database** - periksa apakah koneksi database berhasil

## Verifikasi Konfigurasi Middleware

Pastikan middleware auth berfungsi dengan benar. Endpoint upload file harus dilindungi oleh middleware auth agar user.id tersedia untuk membuat record file.