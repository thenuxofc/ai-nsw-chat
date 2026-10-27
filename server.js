const http = require('http');
const fs = require('fs');
const path = require('path');
const chatFunction = require('./netlify/functions/chat');
const charactersFunction = require('./netlify/functions/characters');
const imageFunction = require('./netlify/functions/image');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;

  // Convert searchParams to standard key-value object
  const queryStringParameters = {};
  for (const [key, value] of parsedUrl.searchParams.entries()) {
    queryStringParameters[key] = value;
  }

  // Adapt Node HTTP request to Netlify event format
  const getBody = () => new Promise(resolve => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
  });

  // API: /api/chat
  if (pathname === '/api/chat') {
    const rawBody = await getBody();
    const event = {
      httpMethod: req.method,
      queryStringParameters,
      body: rawBody,
      headers: req.headers
    };

    const response = await chatFunction.handler(event);
    res.writeHead(response.statusCode, response.headers || {});
    res.end(response.body);
    return;
  }

  // API: /api/characters
  if (pathname === '/api/characters') {
    const event = {
      httpMethod: req.method,
      queryStringParameters,
      headers: req.headers
    };

    const response = await charactersFunction.handler(event);
    res.writeHead(response.statusCode, response.headers || {});
    res.end(response.body);
    return;
  }

  // API: /api/image
  if (pathname === '/api/image') {
    const event = {
      httpMethod: req.method,
      queryStringParameters,
      headers: req.headers
    };

    const response = await imageFunction.handler(event);
    if (response.isBase64Encoded) {
      const buffer = Buffer.from(response.body, 'base64');
      res.writeHead(response.statusCode, response.headers || {});
      res.end(buffer);
    } else {
      res.writeHead(response.statusCode, response.headers || {});
      res.end(response.body);
    }
    return;
  }

  // Serve static files from /public
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 handler
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`AI Girl Chat API server running on http://localhost:${PORT}`);
  console.log(`Try GET API: http://localhost:${PORT}/api/chat?prompt=hello&character=Kohana`);
  console.log(`Try Characters API: http://localhost:${PORT}/api/characters`);
});
