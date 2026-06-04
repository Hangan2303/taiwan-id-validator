const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const FILE = path.join(__dirname, 'app.html');

const server = http.createServer((req, res) => {
  fs.readFile(FILE, (err, data) => {
    if (err) { res.writeHead(500); res.end('Error'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Taiwan ID Validator running at:\n\n  http://localhost:${PORT}\n`);
});
