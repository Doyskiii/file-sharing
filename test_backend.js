const { exec } = require('child_process');

// Test login with curl
const command = 'curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\\"email\\":\\"Superadmin@example.com\\",\\"password\\":\\"Superadmin123\\"}"';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Response: ${stdout}`);
});