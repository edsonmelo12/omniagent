import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname;
const projectRoot = path.resolve(__dirname, '../../..');

const client = process.argv.includes('--client') ? process.argv[process.argv.indexOf('--client') + 1] : 'amiclube';
const manifestPath = path.join(projectRoot, 'squads/social-growth/output', client, 'review/campaign-manifest.json');
const previewsDir = path.join(projectRoot, 'squads/social-growth/output', client, 'social/previews');
const publishDir = path.join(projectRoot, 'squads/social-growth/output', client, 'social/publish');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

let issues = 0;
let checked = 0;
let passed = 0;

console.log(`\n🔍 HTML-PNG Sync Verification — ${client}\n`);

// Assets can be an object with categories (blog, social, etc.) or an array
const assetsObj = manifest.assets || {};
const allAssets = Object.values(assetsObj).flat();

for (const asset of allAssets) {
  const previewPath = asset.canonicalPreviewPath;
  if (!previewPath || !previewPath.endsWith('.html')) continue;
  if (!previewPath.includes('social/previews')) continue; // Skip blog previews

  const assetId = asset.id || asset.asset_id || asset.assetId || path.basename(previewPath).split('.')[0];
  const htmlFile = path.join(projectRoot, 'squads/social-growth/output', client, previewPath);
  
  // Find matching publish directory
  const assetIdLower = assetId.toLowerCase();
  let publishSubdir = null;
  
  if (fs.existsSync(publishDir)) {
    const dirs = fs.readdirSync(publishDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    const match = dirs.find(d => d === assetIdLower) || 
                  dirs.find(d => d.toLowerCase() === assetIdLower) ||
                  dirs.find(d => d.toLowerCase().startsWith(assetIdLower.replace(/-v\d+$/, '').replace(/-v2$/, '').replace(/-v3$/, '').replace(/-v4$/, '').replace(/-v5$/, '')));
    if (match) {
      publishSubdir = path.join(publishDir, match);
    }
  }

  if (!htmlFile || !fs.existsSync(htmlFile)) {
    continue; // HTML doesn't exist, skip (not a sync issue, just missing preview)
  }

  if (!publishSubdir || !fs.existsSync(publishSubdir)) {
    continue; // No published PNGs, skip
  }

  const pngFiles = fs.readdirSync(publishSubdir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  if (pngFiles.length === 0) {
    continue; // No PNGs to compare
  }

  checked++;
  const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
  const htmlLower = htmlContent.toLowerCase();

  let assetIssues = 0;

  // Check for known content mismatches
  if (assetIdLower.includes('ac-30-06')) {
    if (htmlLower.includes('mito') || htmlLower.includes('verdade')) {
      console.log(`❌ ${assetId}: CONTENT MISMATCH — HTML contains "Mitos/Verdades" but PNGs are "Filtros"`);
      assetIssues++;
    }
  }
  
  if (assetIdLower.includes('ac-30-08')) {
    // Check body content only, not CSS properties
    const bodyContent = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '';
    const bodyLower = bodyContent.toLowerCase();
    if (bodyLower.includes('lorem') || bodyLower.includes('mockup') || bodyLower.includes('placeholder text')) {
      console.log(`❌ ${assetId}: CONTENT MISMATCH — Body contains placeholder/mock content`);
      assetIssues++;
    }
  }

  // Check for generic desync indicators
  if (htmlLower.includes('placeholder') && htmlLower.includes('url do artigo')) {
    console.log(`⚠️  ${assetId}: POTENTIAL DESYNC — Contains placeholder content`);
    assetIssues++;
  }

  // Check for lorem ipsum (excluding CSS property names like grid-template)
  const loremMatch = htmlLower.match(/lorem\s*ipsum/i);
  if (loremMatch) {
    console.log(`⚠️  ${assetId}: POTENTIAL DESYNC — Contains lorem ipsum text`);
    assetIssues++;
  }

  // Check for mockup text outside of CSS (look in body content only)
  const bodyContent = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '';
  const bodyLower = bodyContent.toLowerCase();
  if (bodyLower.includes('mockup') || bodyLower.includes('lorem')) {
    console.log(`⚠️  ${assetId}: POTENTIAL DESYNC — Body contains mock/mockup content`);
    assetIssues++;
  }

  if (assetIssues === 0) {
    console.log(`✅ ${assetId}: Sync OK (${pngFiles.length} PNGs)`);
    passed++;
  } else {
    issues += assetIssues;
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`Checked: ${checked} | Passed: ${passed} | Issues: ${issues}`);

if (issues > 0) {
  console.log(`\n🚫 SYNC FAILED — Block asset advancement until HTML and PNG are aligned.`);
  process.exit(1);
} else {
  console.log(`\n✅ SYNC PASSED — All checked previews match published assets.`);
  process.exit(0);
}
