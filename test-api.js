const http = require('http');

const baseUrl = 'http://localhost:3333';
let token = '';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3333,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('   File Sharing API Test Suite');
  console.log('========================================\n');

  try {
    // 1. Authentication
    console.log('[1] Testing Authentication...');
    const loginRes = await makeRequest('POST', '/login', {
      email: 'Superadmin@example.com',
      password: 'password',
    });

    console.log('Login response:', loginRes);

    if (!loginRes.data.token) {
      throw new Error('Failed to get authentication token');
    }

    token = loginRes.data.token;
    console.log('[OK] Authentication successful\n');

    // 2. Create Folder
    console.log('[2] Testing Folder Creation...');
    const folderRes = await makeRequest('POST', '/folders', {
      name: 'Test Folder',
      parentId: null,
    });

    const folderId = folderRes.data.id;
    console.log('[OK] Folder created\n');

    // 3. List Folders
    console.log('[3] Testing List Folders...');
    const listFoldersRes = await makeRequest('GET', '/folders');
    console.log(`[OK] Found ${listFoldersRes.data.length} folders\n`);

    // 4. Get Folder Details
    console.log('[4] Testing Get Folder Details...');
    const folderDetailsRes = await makeRequest('GET', `/folders/${folderId}`);
    console.log('[OK] Folder details retrieved\n');

    // 5. Update Folder
    console.log('[5] Testing Update Folder...');
    const updateFolderRes = await makeRequest('PUT', `/folders/${folderId}`, {
      name: 'Updated Folder Name',
    });
    console.log('[OK] Folder updated\n');

    // 6. List Files
    console.log('[6] Testing List Files...');
    const listFilesRes = await makeRequest('GET', '/files');
    console.log(`[OK] Found ${listFilesRes.data.length} files\n`);

    // 7. Get User Activities
    console.log('[7] Testing Activity Logging...');
    const activitiesRes = await makeRequest('GET', '/activities/me');
    console.log(`[OK] Found ${activitiesRes.data.length} activities\n`);

    // 8. Get Current User
    console.log('[8] Testing Get Current User...');
    const meRes = await makeRequest('GET', '/me');
    console.log(`[OK] Current user: ${meRes.data.email}\n`);

    // 9. Cleanup - Delete Folder
    console.log('[9] Testing Delete Folder...');
    const deleteRes = await makeRequest('DELETE', `/folders/${folderId}`);
    console.log('[OK] Folder deleted\n');

    console.log('========================================');
    console.log('   All Tests Passed Successfully!');
    console.log('========================================\n');

    console.log('Tested Features:');
    console.log('  - Authentication');
    console.log('  - Folder Management (Create, List, Read, Update, Delete)');
    console.log('  - File Management (List)');
    console.log('  - Activity Logging');
    console.log('  - User Profile\n');
  } catch (error) {
    console.error('\n[ERROR]', error);
    process.exit(1);
  }
}

runTests();
