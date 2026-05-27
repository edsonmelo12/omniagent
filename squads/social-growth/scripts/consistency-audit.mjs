#!/usr/bin/env node

/**
 * Consistency Audit — Social Growth Squad
 *
 * Auditoria read-only de contratos, fila, manifest, exports e evidências.
 * Não altera arquivos. Use `--json` para saída estruturada.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('squads/social-growth');
const OUTPUT_DIR = path.join(ROOT, 'output');
const requestedClient = process.argv.find(arg => arg.startsWith('--client='))?.split('=')[1] || process.env.SOCIAL_CLIENT || '';
const asJson = process.argv.includes('--json');
const failOn = process.argv.find(arg => arg.startsWith('--fail-on='))?.split('=')[1] || '';

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const findings = [];

function add(severity, code, message, evidence = []) {
  findings.push({ severity, code, message, evidence });
}

function read(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function list(dir, predicate = () => true) {
  try {
    return fs.readdirSync(dir).filter(predicate);
  } catch {
    return [];
  }
}

function discoverClient() {
  if (requestedClient) return requestedClient;
  const candidates = list(OUTPUT_DIR, name => exists(path.join(OUTPUT_DIR, name, 'publishing')));
  return candidates
    .map(name => {
      const publishing = path.join(OUTPUT_DIR, name, 'publishing');
      const mtimes = ['schedule-plan.md', 'social-publish-queue.json', 'social-publish-monitor.md']
        .map(file => {
          try { return fs.statSync(path.join(publishing, file)).mtimeMs; } catch { return 0; }
        });
      return { name, mtime: Math.max(...mtimes) };
    })
    .filter(row => row.mtime > 0)
    .sort((a, b) => b.mtime - a.mtime)[0]?.name || '';
}

function parsePipelineSteps() {
  const pipeline = read(path.join(ROOT, 'pipeline/pipeline.yaml'));
  return [...pipeline.matchAll(/-\s+(pipeline\/steps\/[^\n]+)/g)].map(match => match[1].trim());
}

function parsePartyAgents() {
  const rows = read(path.join(ROOT, 'squad-party.csv')).split(/\r?\n/).slice(1).filter(Boolean);
  return rows.map(line => line.split(',')[2]?.trim().replace('./', '').match(/agents\/(.*)\.agent\.md/)?.[1]).filter(Boolean);
}

function stepAgent(stepFile) {
  return read(path.join(ROOT, stepFile)).match(/^agent:\s*([^\n]+)/m)?.[1]?.trim() || '';
}

function normalizeAgent(agent) {
  return agent.replace(/^squads\/social-growth\/agents\//, '').replace(/^\.\/agents\//, '').replace(/\.agent\.md$/, '');
}

function auditPipelineContracts() {
  const refs = parsePipelineSteps();
  const stepFiles = list(path.join(ROOT, 'pipeline/steps'), file => file.endsWith('.md')).map(file => `pipeline/steps/${file}`);
  const party = new Set(parsePartyAgents());
  const agentFiles = list(path.join(ROOT, 'agents'), file => file.endsWith('.agent.md')).map(file => file.replace('.agent.md', ''));

  for (const ref of refs) {
    if (!exists(path.join(ROOT, ref))) add('P0', 'missing_step', `Pipeline referencia step inexistente: ${ref}`, [ref]);
  }

  for (const step of refs) {
    const agent = stepAgent(step);
    if (!agent) continue;
    const normalized = normalizeAgent(agent);
    if (!party.has(normalized)) {
      add('P0', 'step_agent_not_in_party', `Step ativo usa agente fora do squad-party: ${step} -> ${agent}`, [step, agent]);
    }
    if (agent.includes('/')) {
      add('P2', 'noncanonical_agent_reference', `Step usa referência não canônica de agente: ${step} -> ${agent}`, [step, agent]);
    }
  }

  for (const file of stepFiles.filter(file => !refs.includes(file))) {
    add('P3', 'unreferenced_step_file', `Step existe mas não está na pipeline ativa: ${file}`, [file]);
  }

  for (const agent of agentFiles.filter(agent => !party.has(agent))) {
    add('P3', 'unreferenced_agent_file', `Agente existe mas não está no squad-party: ${agent}`, [`agents/${agent}.agent.md`]);
  }
}

function loadPublishing(client) {
  const base = path.join(OUTPUT_DIR, client);
  return {
    base,
    queue: readJson(path.join(base, 'publishing/social-publish-queue.json'), { queue: [] })?.queue || [],
    assets: readJson(path.join(base, 'publishing/social-publish-assets.json'), { exports: [] })?.exports || [],
    manifest: readJson(path.join(base, 'review/campaign-manifest.json'), { assets: { social: [], blog: [] } })?.assets || { social: [], blog: [] },
    monitor: read(path.join(base, 'publishing/social-publish-monitor.md')),
    scheduleStatus: read(path.join(base, 'publishing/schedule-status.md')),
    schedulePlan: read(path.join(base, 'publishing/schedule-plan.md')),
  };
}

function byId(rows, key) {
  return new Map(rows.map(row => [row[key] || row.assetId || row.asset_id, row]));
}

function statusMismatch(queueStatus, scheduleStatus, assetStatus, manifestStatus) {
  // display-status vocabulary (schedule-plan.md) vs canonical (queue/worker).
  // These pairs are intentionally valid and do NOT represent real mismatches.
  const displayToCanonical = {
    'preview_ready': 'scheduled',
    'ready_to_publish': 'scheduled',
    'future': 'scheduled',
    'recovery_rescheduled': 'scheduled',
    'scheduled (id ': 'scheduled',
  };
  const canonicalSchedule = displayToCanonical[scheduleStatus?.toLowerCase()] || scheduleStatus?.toLowerCase() || '';

  const text = `${queueStatus} ${scheduleStatus} ${assetStatus} ${manifestStatus}`;
  if (/published/.test(queueStatus) && !/published|approved|APPROVED/.test(`${assetStatus} ${manifestStatus}`)) return true;
  if (/review/i.test(assetStatus) && /scheduled|published|queued/i.test(queueStatus)) return true;
  if (/APPROVED/i.test(manifestStatus) && /review/i.test(assetStatus)) return true;
  if (queueStatus === 'queued' && canonicalSchedule === 'scheduled') return true;
  if (queueStatus === 'blocked' && /scheduled|queued/i.test(canonicalSchedule)) return true;
  return false;
}

function hasEvidence(dir, assetId, kind) {
  return list(dir, file => file.endsWith('.md')).some(file => {
    const lower = file.toLowerCase();
    return lower.includes(assetId.toLowerCase()) && (!kind || lower.includes(kind));
  });
}

function auditPublishing(client) {
  if (!client) {
    add('P0', 'client_not_detected', 'Nenhum cliente com publishing detectado.', []);
    return;
  }

  const data = loadPublishing(client);
  const queueById = byId(data.queue, 'asset_id');
  const assetsById = byId(data.assets, 'asset_id');
  const manifestById = byId(data.manifest.social || [], 'assetId');

  const legacyPublished = ['AC-30-02'];
  const legacyExported = ['AC-30-02', 'AC-30-10', 'AC-30-11', 'AC-30-12', 'AC-30-14', 'AC-30-21', 'AC-30-22', 'AC-30-25', 'AC-30-26', 'AC-30-27', 'AC-30-35'];

  const allIds = [...new Set([...queueById.keys(), ...assetsById.keys(), ...manifestById.keys()])].sort();

  for (const id of allIds) {
    const queue = queueById.get(id);
    const asset = assetsById.get(id);
    const manifest = manifestById.get(id);
    if (queue && !queue.published_post_id && statusMismatch(queue.status || '-', queue.schedule_status || '-', asset?.status || '-', manifest?.status || '-')) {
      add('P1', 'publishing_status_mismatch', `Status divergente para ${id}`, [
        `queue.status=${queue.status || '-'}`,
        `queue.schedule_status=${queue.schedule_status || '-'}`,
        `social-publish-assets.status=${asset?.status || '-'}`,
        `campaign-manifest.status=${manifest?.status || '-'}`,
      ]);
    }
  }

  for (const id of [...queueById.keys()].filter(id => !assetsById.has(id))) {
    const q = queueById.get(id);
    if (q?.published_post_id) continue;
    add('P1', 'queue_asset_missing_from_exports', `Ativo na fila não aparece em social-publish-assets: ${id}`, [id]);
  }

  for (const id of [...assetsById.keys()].filter(id => !queueById.has(id))) {
    if (legacyExported.includes(id)) continue;
    add('P2', 'export_not_in_queue', `Ativo exportado não aparece na fila atual: ${id}`, [id]);
  }

  for (const item of data.queue) {
    for (const file of item.files || []) {
      if (!exists(file)) add('P0', 'queue_file_missing', `Arquivo da fila não existe: ${item.asset_id}`, [file]);
    }
  }

  for (const item of data.assets) {
    for (const file of item.files || []) {
      if (!exists(file)) add('P0', 'export_file_missing', `Arquivo exportado não existe: ${item.asset_id}`, [file]);
    }
  }

  for (const item of [...(data.manifest.social || []), ...(data.manifest.blog || [])]) {
    if (item.canonicalPreviewPath && !exists(path.join(data.base, item.canonicalPreviewPath))) {
      add('P1', 'manifest_preview_missing', `Preview do manifest não existe: ${item.assetId}`, [item.canonicalPreviewPath]);
    }
  }

  const vdcDir = path.join(data.base, 'visual-decision-cards');
  const reviewDir = path.join(data.base, 'review');
  for (const item of data.queue.filter(row => row.status !== 'published')) {
    const missing = [];
    if (!hasEvidence(vdcDir, item.asset_id, 'vdc')) missing.push('VDC');
    if (!hasEvidence(vdcDir, item.asset_id, 'rcc')) missing.push('RCC');
    if (!hasEvidence(reviewDir, item.asset_id, 'review')) missing.push('Review');
    if (!hasEvidence(reviewDir, item.asset_id, 'pipeline-compliance') && !hasEvidence(reviewDir, item.asset_id, 'pipeline-audit')) missing.push('Compliance');
    if (missing.length) add('P1', 'active_asset_missing_evidence', `Ativo ativo sem evidência dedicada: ${item.asset_id}`, missing);
  }

  const publishedInStatus = [...data.scheduleStatus.matchAll(/\|\s*(AC-[^|\s]+)\s*\|\s*✅ published/g)].map(match => match[1]);
  for (const id of publishedInStatus) {
    if (legacyPublished.includes(id)) continue;
    if (!queueById.has(id) && !data.monitor.includes(id)) {
      add('P1', 'published_history_missing_from_monitor', `Ativo publicado no schedule-status não está na fila/monitor atual: ${id}`, [id]);
    }
  }
}

function auditState() {
  const state = readJson(path.join(ROOT, 'state.json'), null);
  if (!state) return;
  if (state.status === 'running' && state.step?.current === 1 && state.agents?.some(agent => agent.status === 'working')) {
    add('P2', 'stale_running_state', 'state.json parece preso em execução inicial.', [
      `step=${state.step?.label}`,
      `updatedAt=${state.updatedAt}`,
    ]);
  }
}

const client = discoverClient();
auditPipelineContracts();
auditPublishing(client);
auditState();

findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.code.localeCompare(b.code));

const summary = {
  client: client || null,
  generatedAt: new Date().toISOString(),
  counts: findings.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, { P0: 0, P1: 0, P2: 0, P3: 0 }),
  findings,
};

if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`# Squad Consistency Audit — ${client || 'client not detected'}`);
  console.log(`Generated: ${summary.generatedAt}`);
  console.log(`Counts: P0=${summary.counts.P0 || 0} P1=${summary.counts.P1 || 0} P2=${summary.counts.P2 || 0} P3=${summary.counts.P3 || 0}`);
  for (const item of findings) {
    console.log(`\n## ${item.severity} ${item.code}`);
    console.log(item.message);
    for (const evidence of item.evidence || []) console.log(`- ${evidence}`);
  }
}

if (failOn && findings.some(item => severityRank[item.severity] <= severityRank[failOn])) {
  process.exitCode = 1;
}
