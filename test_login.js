import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login with default credentials...');
    
    const response = await axios.post('http://localhost:3333/login', {
      email: 'Superadmin@example.com',
      password: 'Superadmin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    // Test the token by accessing the /me endpoint
    if (response.data.token) {
      const meResponse = await axios.get('http://localhost:3333/me', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('✅ /me endpoint access successful!');
      console.log('User info:', meResponse.data);
    }
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();