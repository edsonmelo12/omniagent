#!/usr/bin/env node
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { loadChatContext } from './chat-context.mjs';
import { buildChatResponse } from './chat-router.mjs';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const DASHBOARD_DIR = join(__dirname, '../output/dashboard');
const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('request_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/chat/context' && req.method === 'GET') {
    sendJson(res, 200, loadChatContext(DASHBOARD_DIR));
    return true;
  }

  if (pathname === '/api/chat' && req.method === 'POST') {
    const body = await readRequestBody(req);
    const payload = body ? JSON.parse(body) : {};
    const context = loadChatContext(DASHBOARD_DIR);
    sendJson(res, 200, buildChatResponse({
      prompt: payload.prompt || '',
      context,
      history: Array.isArray(payload.history) ? payload.history : [],
      mode: payload.mode || 'normal',
    }));
    return true;
  }

  return false;
}

function resolveStaticPath(pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = normalize(join(DASHBOARD_DIR, requestedPath));
  if (!filePath.startsWith(normalize(DASHBOARD_DIR))) return null;
  return filePath;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    if (url.pathname.startsWith('/api/')) {
      const handled = await handleApi(req, res, url.pathname);
      if (!handled) sendJson(res, 404, { error: 'api_route_not_found' });
      return;
    }
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'internal_error' });
    return;
  }

  let filePath = resolveStaticPath(url.pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  const ext = extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  
  res.writeHead(200, { 'Content-Type': mimeType });
  res.end(readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log(`🚀 Dashboard rodando em: http://localhost:${PORT}`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📊 Diretório: ${DASHBOARD_DIR}`);
  console.log(`\nPara atualizar os dados: npm run dashboard:update`);
});
