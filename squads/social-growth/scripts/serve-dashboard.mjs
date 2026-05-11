#!/usr/bin/env node
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

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

const server = createServer((req, res) => {
  let filePath = join(DASHBOARD_DIR, req.url === '/' ? 'index.html' : req.url);
  
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
  console.log(`📊 Diretório: ${DASHBOARD_DIR}`);
  console.log(`\nPara atualizar os dados: npm run dashboard:update`);
});