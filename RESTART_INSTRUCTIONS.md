# Instruksi untuk Restart dan Verifikasi Backend

## Langkah-langkah Restart Backend

1. **Hentikan backend jika sedang berjalan** (tekan Ctrl+C di terminal tempat Anda menjalankan `npm run dev`)

2. **Pastikan konfigurasi telah diperbarui**:
   - `config/database.ts` harus menggunakan `connection: 'pg'`
   - `config/bodyparser.ts` harus memiliki limit multipart `50mb`
   - `.env` harus memiliki `DB_CONNECTION=pg` dan detail koneksi PostgreSQL

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

7. **Perhatikan log backend** saat permintaan upload dikirim untuk melihat error spesifik

## Verifikasi Konfigurasi

Pastikan file-file berikut memiliki konfigurasi yang benar:

### backend/config/database.ts
```javascript
const dbConfig = defineConfig({
  connection: 'pg', // Harus 'pg', bukan 'sqlite'
  // ...
})
```

### backend/config/bodyparser.ts
```javascript
multipart: {
  // ...
  limit: '50mb', // Harus 50mb untuk cocok dengan controller
  // ...
},
```

### backend/.env
```
DB_CONNECTION=pg
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=db_magang
```

## Jika Masih Bermasalah

Jika setelah restart masih bermasalah:

1. **Coba upload file sangat kecil** (misalnya file teks 1KB)
2. **Periksa Developer Tools** browser:
   - Tab Network: Lihat detail permintaan POST ke `/api/files`
   - Tab Console: Lihat error JavaScript
3. **Periksa log backend** untuk melihat pesan error spesifik
4. **Coba endpoint debug** `/debug-files` yang telah ditambahkan

## Endpoint Debug Tersedia

Endpoint `/debug-files` telah ditambahkan untuk membantu debugging upload file. Anda bisa mengujinya dengan:
```bash
curl -X POST \
  http://localhost:3333/debug-files \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@/path/to/file'
```