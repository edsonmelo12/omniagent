#!/usr/bin/env node
/**
 * Safeguard: Verify all campaign assets are present in campaign hub
 * Compares campaign-manifest.json with campaign-hub.html
 * Reports missing assets that could be accidentally deleted
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubPath = path.join(root, 'squads', 'social-growth', 'output', 'amiclube', 'review', 'campaign-hub.html');
const manifestPath = path.join(root, 'squads', 'social-growth', 'output', 'amiclube', 'review', 'campaign-manifest.json');

// Read files
if (!fs.existsSync(hubPath)) {
  console.error('ERROR: campaign hub not found:', hubPath);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  console.error('ERROR: campaign manifest not found:', manifestPath);
  process.exit(1);
}

const hub = fs.readFileSync(hubPath, 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Extract all asset IDs from manifest (blog + social)
const allAssets = [
  ...(manifest.assets.blog || []).map(a => a.assetId),
  ...(manifest.assets.social || []).map(a => a.assetId)
];

// Check each asset is in hub
const missing = [];
const found = [];

allAssets.forEach(assetId => {
  if (!hub.includes(assetId)) {
    missing.push(assetId);
  } else {
    found.push(assetId);
  }
});

console.log('\n🔍 SAFEGUARD CHECK: Campaign Hub vs Manifest');
console.log('='.repeat(50));

console.log(`\n📊 Total assets in manifest: ${allAssets.length}`);
console.log(`✅ Found in hub: ${found.length}`);
console.log(`❌ Missing from hub: ${missing.length}`);

if (missing.length > 0) {
  console.log('\n🚨 MISSING ASSETS (could be accidentally deleted):');
  missing.forEach(a => console.log(`   - ${a}`));
  console.log('\n⚠️  ACTION REQUIRED: Restore missing assets to campaign hub!');
  process.exit(1);
} else {
  console.log('\n✅ ALL ASSETS PRESENT IN CAMPAIGN HUB');
  console.log('🛡 Safeguard check passed!\n');
  process.exit(0);
}
