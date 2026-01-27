setTimeout(async () => {
  const http = require('http');

  const postData = JSON.stringify({
    email: 'Superadmin@example.com',
    password: 'Superadmin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3333,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Response body: ${data}`);
      if (res.statusCode === 200) {
        console.log('✅ Login successful! The backend server is working correctly.');
      } else {
        console.log('❌ Login failed. The backend server might not be running properly.');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    console.log('❌ Could not connect to backend server. Please make sure it is running on port 3333.');
  });

  req.write(postData);
  req.end();
}, 15000); // Wait 15 seconds for servers to start