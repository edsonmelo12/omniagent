#!/usr/bin/env node
// GA4 Insights Collector
// Usage: node --env-file=.env insights.js --client amiclube --period last_7_days

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const args = process.argv.slice(2);
const getArg = (name, def = null) => {
  const idx = args.indexOf(name);
  return idx === -1 ? def : args[idx + 1] ?? def;
};

const client = getArg('--client');
const period = getArg('--period', 'last_7_days');

if (!client) {
  console.error('Usage: node insights.js --client <slug> [--period last_7_days|last_30_days|last_90_days]');
  process.exit(1);
}

// ── Load client credentials ─────────────────────────────────────

function loadClientEnv(slug) {
  const paths = [
    join(process.cwd(), 'squads', 'social-growth', `.env.publish.${slug}`),
  ];
  for (const p of paths) {
    try {
      if (readFileSync(p, 'utf8')) {
        for (const line of readFileSync(p, 'utf8').split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx === -1) continue;
          const key = trimmed.slice(0, eqIdx).trim();
          const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (key && !process.env[key]) process.env[key] = value;
        }
      }
    } catch { /* ignore */ }
  }
}

loadClientEnv(client);

// ── Get GA4 credentials from observation_profiles ─────────────────────

async function getGA4Credentials(slug) {
  // This would query the database in production
  // For now, check environment or default path
  const defaultPath = resolve('/home/edsonrmjunior/Local Sites/omniagent', 'backend', '.secrets', `ga4-${slug}.json`);
  try {
    const creds = JSON.parse(readFileSync(defaultPath, 'utf8'));
    return creds;
  } catch {
    // Try environment path
    const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (envPath) {
      try {
        return JSON.parse(readFileSync(envPath, 'utf8'));
      } catch {}
    }
    return null;
  }
}

// ── Date helpers ─────────────────────────────────────────────────

const PERIOD_DAYS = {
  'last_7_days': 7,
  'last_30_days': 30,
  'last_90_days': 90,
};

function getDateRange(periodOption) {
  const days = PERIOD_DAYS[periodOption] || 7;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    days
  };
}

// ── GA4 Client ─────────────────────────────────────────────────

async function getClient(credentials) {
  if (!credentials) {
    throw new Error('GA4 credentials not found');
  }
  // Write temp credentials file
  const tempCredPath = join('/tmp', `ga4-creds-${client}.json`);
  writeFileSync(tempCredPath, JSON.stringify(credentials));
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredPath;
  return new BetaAnalyticsDataClient();
}

async function runReport(client, propertyId, reportRequest) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    ...reportRequest,
  });
  return response;
}

// ── Reports ─────────────────────────────────────────────────

async function getOverview(client, propertyId, dateRange) {
  const response = await runReport(client, propertyId, {
    dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });
  
  if (!response.rows || response.rows.length === 0) {
    return { total_users: 0, sessions: 0, pageviews: 0, bounce_rate: 0, avg_engagement_time: 0 };
  }
  
  const row = response.rows[0];
  return {
    total_users: parseInt(row.metricValues[0].value) || 0,
    sessions: parseInt(row.metricValues[1].value) || 0,
    pageviews: parseInt(row.metricValues[2].value) || 0,
    bounce_rate: parseFloat(row.metricValues[3].value) || 0,
    avg_engagement_time: parseFloat(row.metricValues[4].value) || 0,
  };
}

async function getTopPages(client, propertyId, dateRange, limit = 10) {
  const response = await runReport(client, propertyId, {
    dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
    limit,
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
  });
  
  if (!response.rows) return [];
  
  return response.rows.map(row => ({
    path: row.dimensionValues[0].value,
    pageviews: parseInt(row.metricValues[0].value) || 0,
    avg_engagement_time: parseFloat(row.metricValues[1].value) || 0,
  }));
}

async function getTrafficSources(client, propertyId, dateRange, limit = 10) {
  const response = await runReport(client, propertyId, {
    dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    limit,
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });
  
  if (!response.rows) return [];
  
  return response.rows.map(row => ({
    source: row.dimensionValues[0].value,
    medium: row.dimensionValues[1].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    users: parseInt(row.metricValues[1].value) || 0,
  }));
}

async function getDevices(client, propertyId, dateRange) {
  const response = await runReport(client, propertyId, {
    dateRanges: [{ startDate: dateRange.start, endDate: dateRange.end }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
  });
  
  if (!response.rows) return [];
  
  return response.rows.map(row => ({
    device: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value) || 0,
    sessions: parseInt(row.metricValues[1].value) || 0,
  }));
}

async function getRealtime(client, propertyId) {
  return { active_users: 0 };
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  console.log(`[ga4-insights] Collecting for ${client}, period: ${period}`);
  
  const credentials = await getGA4Credentials(client);
  if (!credentials) {
    console.error('GA4 credentials not found');
    process.exit(1);
  }
  
  // Get property ID from credentials or environment
  const propertyId = process.env.GA4_PROPERTY_ID || credentials.property_id || '302524520';
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID not set');
    process.exit(1);
  }
  
  const ga4Client = await getClient(credentials);
  const dateRange = getDateRange(period);
  
  console.log(`[ga4-insights] Date range: ${dateRange.start} to ${dateRange.end}`);
  
  const [overview, pages, sources, devices, realtime] = await Promise.all([
    getOverview(ga4Client, propertyId, dateRange),
    getTopPages(ga4Client, propertyId, dateRange),
    getTrafficSources(ga4Client, propertyId, dateRange),
    getDevices(ga4Client, propertyId, dateRange),
    getRealtime(ga4Client, propertyId),
  ]);
  
  const result = {
    collected_at: new Date().toISOString(),
    client,
    period,
    overview,
    top_pages: pages,
    traffic_sources: sources,
    devices,
    realtime,
  };
  
  console.log(JSON.stringify(result, null, 2));
  
  // Save to output
  const outPath = resolve('/home/edsonrmjunior/Local Sites/omniagent', 'squads', 'social-growth', 'output', client, 'monitoring', `ga4-insights-${Date.now()}.json`);
  try {
    writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`\n[Saved] ${outPath}`);
  } catch (e) {
    console.warn('Could not save output:', e.message);
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});