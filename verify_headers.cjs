const http = require('http');

const options = {
  method: 'GET',
  hostname: 'localhost',
  port: 5500, // Common port for the backend in this project
  path: '/uploads/1772256813767-612359066.mp4',
  headers: {
    'Range': 'bytes=0-100' // Test range request
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
  
  if (res.headers['accept-ranges'] === 'bytes') {
    console.log('SUCCESS: Accept-Ranges header verified.');
  } else {
    console.log('WARNING: Accept-Ranges header missing.');
  }
  
  if (res.headers['cache-control'] && res.headers['cache-control'].includes('max-age=0')) {
    console.log('SUCCESS: Cache-Control header verified.');
  } else {
    console.log('WARNING: Cache-Control header not as expected.');
  }
  
  res.on('data', () => {}); // Consume data
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
