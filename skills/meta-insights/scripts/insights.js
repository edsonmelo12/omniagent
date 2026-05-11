#!/usr/bin/env node
// Meta Insights Collector
// Usage: node --env-file=.env insights.js --client amiclube --period last_7_days [--output json]

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

const args = process.argv.slice(2);
const getArg = (name, def = null) => {
  const idx = args.indexOf(name);
  return idx === -1 ? def : args[idx + 1] ?? def;
};

const client = getArg('--client');
const period = getArg('--period', 'last_7_days');
const output = getArg('--output', 'json');

if (!client) {
  console.error('Usage: node insights.js --client <slug> [--period last_7_days|last_30_days|lifetime] [--output json]');
  process.exit(1);
}

// ── Database credentials loader ────────────────────────────────

async function loadCredentialsFromDB(slug) {
  try {
    // Try different possible paths
    let db;
    const possiblePaths = [
      '/home/edsonrmjunior/Local Sites/omniagent/backend/src/shared/db/database.js',
      '../../backend/src/shared/db/database.js',
    ];
    
    for (const p of possiblePaths) {
      try {
        db = await import(p);
        break;
      } catch { continue; }
    }
    
    if (!db) throw new Error('Database module not found');
    
    const { queryOne } = db;
    
    const instagram = await queryOne(`
      SELECT op.account_ref, op.secret_ref 
      FROM observation_profiles op
      JOIN clients c ON c.id = op.client_id
      WHERE c.slug = $1 AND op.channel = 'instagram' AND op.status = 'active'
    `, [slug]);
    
    const facebook = await queryOne(`
      SELECT op.account_ref, op.secret_ref 
      FROM observation_profiles op
      JOIN clients c ON c.id = op.client_id
      WHERE c.slug = $1 AND op.channel = 'facebook' AND op.status = 'active'
    `, [slug]);
    
    if (!instagram) return null;
    
    const credentials = {
      instagram: {
        userId: instagram.account_ref,
        accessToken: resolveSecret(instagram.secret_ref),
      },
    };
    
    if (facebook) {
      credentials.facebook = {
        pageId: facebook.account_ref,
        accessToken: resolveSecret(facebook.secret_ref),
      };
    }
    
    return credentials;
  } catch (e) {
    console.warn('[db] Could not load from database:', e.message);
    return null;
  }
}

function resolveSecret(secretRef) {
  if (!secretRef) return null;
  if (secretRef.startsWith('env://')) {
    return process.env[secretRef.slice(5)] ?? null;
  }
  return null;
}

// ── Load client credentials from env file (fallback) ───────────────────

function loadClientEnv(slug) {
  const basePath = '/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth';
  const paths = [
    join(basePath, `.env.publish.${slug}`),
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

// ── Load client credentials ─────────────────────────────────────

async function getCredentials(slug) {
  // Try database first
  const dbCredentials = await loadCredentialsFromDB(slug);
  if (dbCredentials?.instagram?.accessToken) {
    console.log('[creds] Using database credentials');
    return dbCredentials;
  }
  
  // Fallback to env file
  console.log('[creds] Database not available, using env file');
  loadClientEnv(slug);
  return {
    instagram: {
      userId: process.env.INSTAGRAM_USER_ID,
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    },
    facebook: {
      pageId: process.env.FACEBOOK_PAGE_ID,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    },
  };
}

const creds = await getCredentials(client);

const IG_TOKEN = creds.instagram?.accessToken;
const IG_USER_ID = creds.instagram?.userId;
const FB_TOKEN = creds.facebook?.accessToken;
const FB_PAGE_ID = creds.facebook?.pageId;

if (!IG_TOKEN || !IG_USER_ID) {
  console.error(`Missing credentials for ${client}`);
  process.exit(1);
}

// ── API configuration ────────────────────────────────────────────

const IG_API = 'https://graph.facebook.com/v21.0';
const PERIOD_MAP = {
  'last_7_days': 7,
  'last_30_days': 30,
  'lifetime': null, // use lifetime
};

const sinceDays = PERIOD_MAP[period] || 7;
const sinceDate = sinceDays
  ? new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  : null;

// ── Helpers ─────────────────────────────────────────────────

function buildParams(extra = {}) {
  const p = new URLSearchParams({ access_token: IG_TOKEN, ...extra });
  return '?' + p.toString();
}

async function fetchIG(endpoint, params = {}) {
  const url = `${IG_API}/${endpoint}${Object.keys(params).length ? '?' + new URLSearchParams(params).toString() + '&' : '?'}access_token=${IG_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IG API error [${res.status}]: ${err}`);
  }
  return res.json();
}

// ── Get account metrics ────────────────────────────────────────

async function getAccountInsights() {
  try {
    // Get account info directly (no period filter needed)
    const accountInfo = await fetchIG(IG_USER_ID, 'fields=name,username,media_count,followers_count');
    
    // Get reach with proper date range (max 30 days)
    const params = { 
      metric: 'reach',
      period: 'day'
    };
    const sinceDate7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    params.since = sinceDate7;
    
    let reachData = { values: [] };
    try {
      reachData = await fetchIG(`${IG_USER_ID}/insights`, params);
    } catch (e) {
      console.warn('Reach error:', e.message);
    }
    
    return {
      follower_count: accountInfo.followers_count || 0,
      media_count: accountInfo.media_count || 0,
      reach: reachData.values?.[0]?.value || 0,
    };
  } catch (e) {
    console.warn('Account insights error:', e.message);
    return {};
  }
}

// ── Get user media ──────────────────────────────────────────────

async function getUserMedia() {
  try {
    const params = { fields: 'id,caption,media_type,permalink,timestamp,thumbnail_url', limit: '25' };
    const data = await fetchIG(`${IG_USER_ID}/media`, params);
    return data.data || [];
  } catch (e) {
    console.warn('Get media error:', e.message);
    return [];
  }
}

// ── Get media insights ─────────────────────────────────────────

async function getMediaInsights(mediaId) {
  try {
    // Need metric_type=total_value for aggregated metrics
    const params = { 
      metric: 'views,reach,likes,comments,shares,saved,total_interactions',
      metric_type: 'total_value'
    };
    if (sinceDate) {
      params.period = 'day';
      params.since = sinceDate;
    }
    const data = await fetchIG(`${mediaId}/insights`, params);
    const result = {};
    for (const d of data.data || []) {
      result[d.name] = d.values?.[0]?.value ?? 0;
    }
    return result;
  } catch (e) {
    return {};
  }
}

// ── Facebook Page Insights ─────────────────────────────────

async function fetchFB(endpoint, params = {}) {
  const url = `${IG_API}/${endpoint}${Object.keys(params).length ? '?' + new URLSearchParams(params).toString() + '&' : '?'}access_token=${FB_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FB API error [${res.status}]: ${err}`);
  }
  return res.json();
}

async function getFacebookPageInsights() {
  if (!FB_TOKEN || !FB_PAGE_ID) {
    console.warn('Facebook credentials not available, skipping...');
    return {};
  }
  
  try {
    // Get page info
    const pageInfo = await fetchFB(FB_PAGE_ID, 'fields=name,fan_count,talking_about_count,were_here_count');
    
    // Get page insights - using correct metrics
    const params = { 
      metric: 'page_impressions_unique,page_impressions,page_reach_unique',
      period: 'day'
    };
    const sinceDate7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    params.since = sinceDate7;
    
    let insightsData = { data: [] };
    try {
      insightsData = await fetchFB(`${FB_PAGE_ID}/insights`, params);
    } catch (e) {
      console.warn('FB insights error:', e.message);
    }
    
    const insights = {};
    for (const d of insightsData.data || []) {
      insights[d.name] = d.values?.[0]?.value ?? 0;
    }
    
    return {
      page_name: pageInfo.name || '',
      fan_count: pageInfo.fan_count || 0,
      talking_about: pageInfo.talking_about_count || 0,
      checkins: pageInfo.were_here_count || 0,
      impressions_unique: insights.page_impressions_unique || 0,
      impressions: insights.page_impressions || 0,
      reach_unique: insights.page_reach_unique || 0,
    };
  } catch (e) {
    console.warn('Facebook insights error:', e.message);
    return {};
  }
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  console.log(`[meta-insights] Collecting for ${client}, period: ${period}`);

  const accountMetrics = await getAccountInsights();
  const facebookMetrics = await getFacebookPageInsights();
  const media = await getUserMedia();

  console.log(`[meta-insights] Found ${media.length} media items`);
  console.log(`[meta-insights] Facebook page: ${facebookMetrics.page_name || 'N/A'}`);

  // Filter to items within period
  const mediaFiltered = sinceDate
    ? media.filter(m => m.timestamp && m.timestamp >= sinceDate)
    : media;

  // Get insights for each media
  const posts = [];
  for (const m of mediaFiltered.slice(0, 20)) { // limit to 20 most recent
    const insights = await getMediaInsights(m.id);
    posts.push({
      media_id: m.id,
      media_type: m.media_type,
      post_url: m.permalink || `https://instagram.com/p/${m.id}`,
      caption: m.caption?.substring(0, 100) || '',
      published_at: m.timestamp,
      metrics: insights,
    });
  }

  const result = {
    collected_at: new Date().toISOString(),
    client,
    period,
    account_metrics: accountMetrics,
    facebook_metrics: facebookMetrics,
    posts,
    summary: {
      total_posts: posts.length,
      total_views: posts.reduce((s, p) => s + (p.metrics.views || 0), 0),
      total_engagement: posts.reduce((s, p) => s + (p.metrics.total_interactions || 0), 0),
    },
  };

  // Output
  if (output === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n=== ${client.toUpperCase()} - ${period} ===\n`);
    console.log(`Account: ${accountMetrics.follower_count || 'N/A'} followers`);
    console.log(`Reach: ${accountMetrics.reach || 'N/A'}`);
    console.log(`Impressions: ${accountMetrics.impressions || 'N/A'}\n`);
    console.log(`Posts analyzed: ${posts.length}`);
    for (const p of posts) {
      console.log(`- ${p.post_url}`);
      console.log(`  Views: ${p.metrics.views || 0}, Reach: ${p.metrics.reach || 0}, Eng: ${p.metrics.total_interactions || 0}`);
    }
  }

  // Save to output
  const outPath = join(process.cwd(), 'squads', 'social-growth', 'output', client, 'monitoring', `insights-${Date.now()}.json`);
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