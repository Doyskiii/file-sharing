# Instruksi Final untuk Restart dan Verifikasi

## Perubahan yang Telah Dilakukan

1. **Memperbarui controller file** agar tidak gagal jika logging activity bermasalah
2. **Memperbarui service activity** dengan penanganan error yang lebih robust
3. **Menambahkan kolom `folderId` dan `metadata` ke model Activity**
4. **Meningkatkan limit multipart** di `config/bodyparser.ts` dari 20MB ke 50MB
5. **Memastikan struktur database** memiliki kolom yang diperlukan

## Langkah-langkah Restart Backend

1. **Hentikan backend jika sedang berjalan** (tekan Ctrl+C di terminal tempat Anda menjalankan `npm run dev`)

2. **Bersihkan cache Node.js (opsional tapi direkomendasikan)**:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   npm cache clean --force
   ```

3. **Jalankan backend**:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   npm run dev
   ```

4. **Perhatikan log saat startup** untuk melihat apakah ada error

5. **Coba login di frontend** (http://localhost:3000) dengan kredensial:
   - Email: `Superadmin@example.com`
   - Password: `Superadmin123`

6. **Setelah login berhasil**, coba upload file kecil (kurang dari 1MB) terlebih dahulu

7. **Perhatikan log backend** saat permintaan upload dikirim

## Jika Masih Bermasalah

Jika Anda masih mengalami masalah upload file:

1. **Periksa Developer Tools** browser:
   - Tab Network: Lihat detail permintaan POST ke `/api/files`
   - Tab Console: Lihat error JavaScript

2. **Periksa log backend** untuk melihat pesan error spesifik

3. **Coba endpoint debug** `/debug-files`:
   ```bash
   curl -X POST \
     http://localhost:3333/debug-files \
     -H 'Authorization: Bearer YOUR_TOKEN' \
     -F 'file=@/path/to/small-test-file.txt'
   ```

## Solusi Alternatif

Jika masalah terus berlanjut, kita bisa sementara menonaktifkan logging activity untuk upload file:

1. Di `file_controller.ts`, Anda bisa mengomentari baris logging activity:
   ```typescript
   // await ActivityService.logFromContext(ctx, 'file:upload', {...})
   ```

2. Ini akan memungkinkan upload file berjalan sementara kita memperbaiki masalah logging.

## Verifikasi Berhasil

Jika perbaikan berhasil:
- Upload file akan berhasil tanpa error fatal
- File akan disimpan ke database dan sistem file
- Aktivitas upload akan dicatat (jika logging berhasil) atau upload akan tetap berhasil (jika logging gagal)