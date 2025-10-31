#!/usr/bin/env node

/**
 * Simple HTTP server to serve Mortech test results viewer
 * Usage: node scripts/serve-test-results.js [port]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8080;
const BASE_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath;

  // Default to the viewer HTML
  if (urlPath === '/' || urlPath === '/index.html') {
    filePath = path.join(__dirname, 'mortech-test-results-viewer.html');
  }
  // Handle the viewer HTML directly
  else if (urlPath === '/scripts/mortech-test-results-viewer.html') {
    filePath = path.join(__dirname, 'mortech-test-results-viewer.html');
  }
  // Handle all other requests relative to BASE_DIR (project root)
  else {
    // Remove leading slash and join with BASE_DIR
    const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
    filePath = path.join(BASE_DIR, cleanPath);
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${urlPath} (resolved to: ${filePath})`);
    console.log(`404: ${urlPath} -> ${filePath}`);
    return;
  }

  // Check if it's a directory
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  // Read and serve file
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mortech Test Results Viewer Server`);
  console.log(`📡 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${BASE_DIR}`);
  console.log(`\n💡 Open your browser and navigate to:`);
  console.log(`   http://localhost:${PORT}/scripts/mortech-test-results-viewer.html`);
  console.log(`\n⏹️  Press Ctrl+C to stop the server\n`);
});

