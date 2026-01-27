# Instruksi untuk Restart dan Verifikasi Setelah Perbaikan Metadata

## Perubahan yang Telah Dilakukan

1. **Menambahkan kolom `folderId` ke model Activity** di `app/models/activity.ts`
2. **Menambahkan kolom `metadata` ke model Activity** di `app/models/activity.ts`
3. **Memperbarui fungsi `log` di ActivityService** untuk hanya menetapkan `folderId` jika itu benar-benar disediakan
4. **Meningkatkan limit multipart** di `config/bodyparser.ts` dari 20MB ke 50MB
5. **Menambahkan endpoint debug** `/debug-files` untuk membantu debugging upload

## Langkah-langkah Restart Backend

1. **Hentikan backend jika sedang berjalan** (tekan Ctrl+C di terminal tempat Anda menjalankan `npm run dev`)

2. **Jalankan backend**:
   ```bash
   cd c:\Users\LENOVO\file-sharing\backend
   npm run dev
   ```

3. **Perhatikan log saat startup** untuk melihat apakah ada error

4. **Coba login di frontend** (http://localhost:3000) dengan kredensial:
   - Email: `Superadmin@example.com`
   - Password: `Superadmin123`

5. **Setelah login berhasil**, coba upload file kecil (kurang dari 1MB) terlebih dahulu

6. **Perhatikan log backend** saat permintaan upload dikirim untuk melihat apakah error telah teratasi

## Jika Masih Bermasalah

Jika Anda masih mengalami masalah upload file:

1. **Coba endpoint debug** `/debug-files`:
   ```bash
   curl -X POST \
     http://localhost:3333/debug-files \
     -H 'Authorization: Bearer YOUR_TOKEN' \
     -F 'file=@/path/to/small-test-file.txt'
   ```

2. **Periksa Developer Tools** browser:
   - Tab Network: Lihat detail permintaan POST ke `/api/files`
   - Tab Console: Lihat error JavaScript

3. **Periksa log backend** untuk melihat pesan error spesifik

## Verifikasi Berhasil

Jika perbaikan berhasil:
- Upload file akan berhasil tanpa error "Cannot define folderId or metadata on Activity model"
- File akan disimpan ke database dan sistem file
- Aktivitas upload akan dicatat di tabel activities dengan metadata yang sesuai