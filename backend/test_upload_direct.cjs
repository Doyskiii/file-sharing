// Test script untuk menguji upload file langsung ke backend
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Buat file teks sederhana untuk testing
const testFileName = 'test-upload.txt';
fs.writeFileSync(testFileName, 'Ini adalah file test untuk upload');

// Token autentikasi - ganti dengan token aktual dari localStorage Anda
const authToken = 'YOUR_AUTH_TOKEN_HERE';

const formData = new FormData();
formData.append('file', fs.createReadStream(testFileName));

// Kirim permintaan upload
axios({
  method: 'POST',
  url: 'http://localhost:3333/files',
  data: formData,
  headers: {
    ...formData.getHeaders(),
    'Authorization': `Bearer ${authToken}`
  }
})
.then(response => {
  console.log('✅ Upload berhasil!');
  console.log('Response:', response.data);
})
.catch(error => {
  console.log('❌ Upload gagal!');
  console.log('Error:', error.response?.data || error.message);
  console.log('Status:', error.response?.status);
  console.log('Headers:', error.response?.headers);
});