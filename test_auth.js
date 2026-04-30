const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 5175,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.write(JSON.stringify({ email: 'admin954809@gmail.com', password: 'Admin@1234' }));
req.end();