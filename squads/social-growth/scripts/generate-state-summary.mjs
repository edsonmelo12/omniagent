#!/usr/bin/env node

/**
 * Gera `state-summary.md` para carregamento rápido do Atlas.
 *
 * Uso:
 *   npm run social:summary
 *   npm run social:summary -- --client=amiclube
 *
 * O script evita acoplamento com um cliente específico: se `--client` não for
 * informado, escolhe o diretório em `output/{client}/` com arquivos de
 * publicação mais recentes.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const BASE_DIR = path.resolve('squads/social-growth');
const OUTPUT_PATH = path.join(BASE_DIR, 'state-summary.md');
const requestedClient = process.argv.find(arg => arg.startsWith('--client='))?.split('=')[1] || process.env.SOCIAL_CLIENT || '';

function readIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function fileMtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function discoverClient() {
  const outputDir = path.join(BASE_DIR, 'output');

  if (requestedClient) {
    return requestedClient;
  }

  const candidates = fs.existsSync(outputDir)
    ? fs.readdirSync(outputDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(name => fs.existsSync(path.join(outputDir, name, 'publishing')))
    : [];

  return candidates
    .map(name => {
      const publishingDir = path.join(outputDir, name, 'publishing');
      const mtime = Math.max(
        fileMtime(path.join(publishingDir, 'schedule-plan.md')),
        fileMtime(path.join(publishingDir, 'schedule-status.md')),
        fileMtime(path.join(publishingDir, 'social-publish-monitor.md')),
      );
      return { name, mtime };
    })
    .filter(candidate => candidate.mtime > 0)
    .sort((a, b) => b.mtime - a.mtime)[0]?.name || '';
}

function parseCalendar(schedulePlan) {
  const calendarSection = schedulePlan.split('## Calendar')[1]?.split('## ')[0] || '';
  const rows = [];

  for (const line of calendarSection.split('\n')) {
    const columns = line.split('|').map(column => column.trim()).filter(Boolean);
    if (columns.length !== 5 || columns[0] === 'Date' || columns[0].startsWith('---')) {
      continue;
    }

    rows.push({
      date: columns[0],
      channel: columns[1],
      format: columns[2],
      asset: columns[3],
      status: columns[4],
    });
  }

  return rows;
}

function isSocial(row) {
  return row.channel.toLowerCase() !== 'blog';
}

function isActiveSocialStatus(status) {
  return /(queued|scheduled|preview_ready|ready_to_publish|recovery_rescheduled)/i.test(status);
}

function isUnpublished(row) {
  return !/published/i.test(row.status);
}

function parseApprovals(stateJson) {
  try {
    const parsed = JSON.parse(stateJson || '{}');
    return {
      schedule: parsed.approvals?.schedule?.pending === false,
      strategy: parsed.approvals?.strategy?.pending === false,
    };
  } catch {
    return { schedule: false, strategy: false };
  }
}

function runConsistencyAudit(client) {
  try {
    const args = ['squads/social-growth/scripts/consistency-audit.mjs', '--json'];
    if (client) args.push(`--client=${client}`);
    return JSON.parse(execFileSync('node', args, { encoding: 'utf-8' }));
  } catch {
    return { counts: { P0: 0, P1: 0, P2: 0, P3: 0 }, findings: [] };
  }
}

const client = discoverClient();
const clientBase = client ? path.join(BASE_DIR, 'output', client) : '';
const publishingBase = clientBase ? path.join(clientBase, 'publishing') : '';

const schedulePlan = readIfExists(path.join(publishingBase, 'schedule-plan.md'));
const scheduleStatus = readIfExists(path.join(publishingBase, 'schedule-status.md'));
const monitor = readIfExists(path.join(publishingBase, 'social-publish-monitor.md'));
const stateJson = readIfExists(path.join(BASE_DIR, 'state.json'));

const now = new Date().toISOString().split('T')[0];
const today = new Date(now);
const calendarRows = parseCalendar(schedulePlan);
const upcoming = calendarRows
  .filter(row => new Date(row.date) >= today && isUnpublished(row))
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 3);

const quickSocialRows = calendarRows
  .filter(row => isSocial(row) && new Date(row.date) >= today && isUnpublished(row))
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 6);

const blogRows = calendarRows.filter(row => row.channel.toLowerCase() === 'blog');
const socialRows = calendarRows.filter(isSocial);
const alerts = [
  monitor.includes('FAILED') ? '`FAILED` no monitor social' : '',
  monitor.includes('BLOCKED') ? '`BLOCKED` no monitor social' : '',
  monitor.includes('missing_exported_files') ? '`missing_exported_files` no monitor social' : '',
].filter(Boolean);
const approvals = parseApprovals(stateJson);
const consistency = runConsistencyAudit(client);
const consistencyAlerts = consistency.findings
  .filter(finding => ['P0', 'P1', 'P2'].includes(finding.severity))
  .slice(0, 8);
const criticalAlertCount = alerts.length + (consistency.counts.P0 || 0) + (consistency.counts.P1 || 0);

const detailPrefix = client ? `output/${client}` : 'output/{client}';
const md = `# State Summary - Social Growth Squad

> **Atualizado em:** ${now} (gerado via \`generate-state-summary.mjs\`)
> **Cliente detectado:** ${client || 'não detectado'}
> **Atualização:** \`npm run social:summary${client ? ` -- --client=${client}` : ''}\`

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Blogs no calendário | ${blogRows.length} |
| Blogs publicados/agendados | ${blogRows.filter(row => /(published|scheduled|future)/i.test(row.status)).length} |
| Sociais publicados | ${socialRows.filter(row => /published/i.test(row.status)).length} |
| Sociais na fila/agendados | ${socialRows.filter(row => isActiveSocialStatus(row.status)).length} |
| Alertas críticos | ${criticalAlertCount || 0} |
| Auditoria de consistência | P0=${consistency.counts.P0 || 0}; P1=${consistency.counts.P1 || 0}; P2=${consistency.counts.P2 || 0}; P3=${consistency.counts.P3 || 0} |

## Próximos 3 Eventos

| Data | Ativo | Canal | Status |
|------|-------|-------|--------|
${upcoming.length ? upcoming.map(row => `| ${row.date} | ${row.asset} | ${row.channel} ${row.format} | ${row.status} |`).join('\n') : '| - | - | - | - |'}

## Fila Social Rápida

| Data | Ativo | Canal | Status |
|------|-------|-------|--------|
${quickSocialRows.length ? quickSocialRows.map(row => `| ${row.date} | ${row.asset} | ${row.channel} ${row.format} | ${row.status} |`).join('\n') : '| - | - | - | - |'}

## Gargalos Identificados

${alerts.length ? alerts.map(alert => `- Verificar ${alert}`).join('\n') : '- Nenhum gargalo crítico identificado no momento'}
${consistencyAlerts.length ? consistencyAlerts.map(finding => `- ${finding.severity} ${finding.code}: ${finding.message}`).join('\n') : '- Auditoria de consistência sem alertas P0/P1/P2'}
${scheduleStatus ? '' : '- `schedule-status.md` não encontrado para o cliente detectado'}

## Aprovações

- Agenda (schedule): ${approvals.schedule ? 'aprovada' : 'pendente ou não registrada'}
- Estratégia: ${approvals.strategy ? 'aprovada' : 'pendente ou não registrada'}

## Onde Ler Detalhes

- **Agendamento completo:** \`${detailPrefix}/publishing/schedule-plan.md\`
- **Status da fila:** \`${detailPrefix}/publishing/schedule-status.md\`
- **Monitor social:** \`${detailPrefix}/publishing/social-publish-monitor.md\`
- **Memórias da squad:** \`_memory/memories.md\` (recentes) ou \`_memory/memories-archive.md\` (histórico)
`;

fs.writeFileSync(OUTPUT_PATH, md, 'utf-8');
console.log(`state-summary.md gerado em ${OUTPUT_PATH}`);
console.log(`Cliente: ${client || 'não detectado'} | Blogs: ${blogRows.length} | Sociais ativos: ${socialRows.filter(row => isActiveSocialStatus(row.status)).length} | Alertas críticos: ${criticalAlertCount}`);
