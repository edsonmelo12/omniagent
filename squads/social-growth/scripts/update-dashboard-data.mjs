#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQUAD_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(SQUAD_ROOT, 'output/dashboard');

function parseMonitorFile() {
  // Monitor still in client-specific folder
  const monitorPath = join(SQUAD_ROOT, 'output/amiclube/publishing/social-publish-monitor.md');
  
  if (!existsSync(monitorPath)) {
    console.log('Monitor file not found, using default data');
    return null;
  }
  
  const content = readFileSync(monitorPath, 'utf-8');
  
  const queue = [];
  const lines = content.split('\n');
  let inQueue = false;
  
  for (const line of lines) {
    if (line.includes('asset_id')) {
      inQueue = true;
      continue;
    }
    if (inQueue && line.trim() === '') continue;
    if (inQueue && line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 4 && parts[0] && parts[0] !== 'asset_id') {
        const asset_id = parts[0];
        const channel = parts[1];
        const publish_at_iso = parts[2];
        const status = parts[3];
        
        if (asset_id && asset_id.startsWith('AC-')) {
          const date = new Date(publish_at_iso);
          const publish_at = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          
          queue.push({ asset_id, channel, publish_at, status });
        }
      }
    }
    if (inQueue && line.includes('## Critical')) {
      inQueue = false;
    }
  }
  
  const published = queue.filter(q => q.status === 'published').length;
  const scheduled = queue.filter(q => q.status === 'scheduled').length;
  const blocked = queue.filter(q => q.status === 'blocked').length;
  
  return {
    metrics: {
      totalInQueue: queue.length,
      published,
      scheduled,
      blocked
    },
    queue: queue.slice(0, 10),
    lastUpdated: new Date().toISOString()
  };
}

function parseStateSummary() {
  const statePath = join(SQUAD_ROOT, 'state-summary.md');
  
  if (!existsSync(statePath)) return null;
  
  const content = readFileSync(statePath, 'utf-8');
  
  const blogsMatch = content.match(/Blogs no calendário.*?(\d+)/);
  const alertsMatch = content.match(/Alertas críticos.*?(\d+)/);
  
  return {
    blogsScheduled: blogsMatch ? parseInt(blogsMatch[1]) : 0,
    criticalAlerts: alertsMatch ? parseInt(alertsMatch[1]) : 0
  };
}

function main() {
  console.log('🔄 Atualizando dados da dashboard...');
  
  const monitorData = parseMonitorFile();
  const stateData = parseStateSummary();
  
  const data = {
    client: 'amiclube',
    ...(monitorData || {}),
    ...(stateData || {}),
    alerts: monitorData ? {
      critical: [],
      warning: [],
      info: monitorData.queue.filter(q => q.status === 'scheduled').map(q => `${q.asset_id}: aguardando janela`)
    } : {}
  };
  
  const dashboardDataPath = join(OUTPUT_DIR, 'data.json');
  writeFileSync(dashboardDataPath, JSON.stringify(data, null, 2));
  
  console.log(`✅ Dashboard atualizada:`);
  console.log(`   - Total na fila: ${data.metrics?.totalInQueue || 0}`);
  console.log(`   - Publicados: ${data.metrics?.published || 0}`);
  console.log(`   - Agendados: ${data.metrics?.scheduled || 0}`);
  console.log(`   - Bloqueados: ${data.metrics?.blocked || 0}`);
  console.log(`   - Arquivo: ${dashboardDataPath}`);
}

main();