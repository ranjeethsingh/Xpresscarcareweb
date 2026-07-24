const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Got a request!', req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, it works!');
});

server.listen(3000, () => {
  console.log('Test server running on http://localhost:3000');
});