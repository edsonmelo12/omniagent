#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg('client');
if (!client) {
  console.error('Usage: node validate-blog-social-alignment.mjs --client <client-slug>');
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, 'squads', 'social-growth', 'output', client);
const manifestPath = path.join(clientDir, 'review', 'campaign-manifest.json');
const policyPath = path.join(clientDir, 'publishing', 'blog-social-alignment.json');
const channelEligibilityPath = path.join(clientDir, 'publishing', 'channel-eligibility.json');

const failures = [];
const notes = [];

if (!fs.existsSync(manifestPath)) failures.push(`campaign manifest missing: ${manifestPath}`);
if (!fs.existsSync(policyPath)) failures.push(`blog-social alignment policy missing: ${policyPath}`);
if (!fs.existsSync(channelEligibilityPath)) failures.push(`channel eligibility policy missing: ${channelEligibilityPath}`);

let manifest = null;
let policy = null;
let channelEligibility = null;

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    failures.push('campaign manifest is not valid JSON');
  }
}

if (fs.existsSync(policyPath)) {
  try {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  } catch {
    failures.push('blog-social alignment policy is not valid JSON');
  }
}

if (fs.existsSync(channelEligibilityPath)) {
  try {
    channelEligibility = JSON.parse(fs.readFileSync(channelEligibilityPath, 'utf8'));
  } catch {
    failures.push('channel eligibility policy is not valid JSON');
  }
}

const norm = (value) => String(value || '').trim().toUpperCase();
const normChannel = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw === 'ig') return 'instagram';
  if (raw === 'in') return 'linkedin';
  if (raw.startsWith('linkedin')) return 'linkedin';
  if (raw.startsWith('instagram')) return 'instagram';
  if (raw.startsWith('facebook')) return 'facebook';
  if (raw.startsWith('stories')) return 'instagram';
  if (raw.startsWith('blog')) return 'blog';
  return raw;
};

const createdBlogAssets = Array.isArray(manifest?.assets?.blog)
  ? manifest.assets.blog.filter((entry) => String(entry?.canonicalPreviewPath || '').trim().length > 0)
  : [];

const createdBlogIds = new Set(createdBlogAssets.map((entry) => norm(entry.assetId)));
const manifestSocialIds = new Set(
  (Array.isArray(manifest?.assets?.social) ? manifest.assets.social : []).map((entry) => norm(entry.assetId)),
);

const socialItems = Array.isArray(policy?.social_assets) ? policy.social_assets : [];
if (socialItems.length === 0) {
  failures.push('policy.social_assets is empty; each social asset must declare content_mode/blog_parent_id when applicable');
}

const allowedModes = new Set(['blog_derivative', 'seasonal_offer', 'product_offer', 'institutional']);
const strictBlogStatuses = new Set((policy?.coverage_rules?.enforce_on_blog_statuses || ['approved', 'ready_to_schedule', 'scheduled', 'published']).map((s) => String(s).toLowerCase()));
const requiredMinPerBlog = Number(policy?.coverage_rules?.required_min_social_per_blog ?? 1);
const channelEntries = Array.isArray(channelEligibility?.channels) ? channelEligibility.channels : [];
const channelPolicyMap = new Map();
for (const item of channelEntries) {
  const id = normChannel(item?.id);
  if (!id) continue;
  channelPolicyMap.set(id, {
    state: String(item?.state || '').trim().toUpperCase() || 'ACTIVE',
    account_exists: item?.account_exists === true,
    publish_enabled: item?.publish_enabled === true,
    credentials_valid: item?.credentials_valid === true,
  });
}
const productionStates = new Set(
  (channelEligibility?.enforcement?.production_states || ['ACTIVE'])
    .map((s) => String(s).trim().toUpperCase())
    .filter(Boolean),
);
const enforceSocialStatuses = new Set(
  (channelEligibility?.enforcement?.enforce_on_social_statuses || ['review', 'approved', 'ready_to_schedule', 'scheduled', 'published'])
    .map((s) => String(s).toLowerCase())
    .filter(Boolean),
);
const allowedBacklogStatuses = new Set(
  (channelEligibility?.enforcement?.allowed_backlog_social_statuses || ['planned', 'parked', 'backlog'])
    .map((s) => String(s).toLowerCase())
    .filter(Boolean),
);

const mappedCoverage = new Map();
for (const blogId of createdBlogIds) mappedCoverage.set(blogId, 0);

for (const item of socialItems) {
  const socialId = norm(item?.asset_id);
  const mode = String(item?.content_mode || '').toLowerCase();
  const parent = norm(item?.blog_parent_id);
  const status = String(item?.status || '').toLowerCase();
  const channel = normChannel(item?.channel);

  if (!socialId) {
    failures.push('social asset entry without asset_id in policy');
    continue;
  }
  if (!channel) {
    failures.push(`social asset ${socialId} missing channel`);
    continue;
  }
  const channelPolicy = channelPolicyMap.get(channel);
  if (!channelPolicy) {
    failures.push(`social asset ${socialId} uses unmapped channel: ${channel}`);
    continue;
  }
  const channelIsProductionReady =
    productionStates.has(channelPolicy.state) &&
    channelPolicy.account_exists &&
    channelPolicy.publish_enabled &&
    channelPolicy.credentials_valid;

  if (enforceSocialStatuses.has(status) && !channelIsProductionReady) {
    failures.push(
      `social asset ${socialId} status=${status} is on non-production channel ${channel} (state=${channelPolicy.state})`,
    );
  }
  if (!channelIsProductionReady && !allowedBacklogStatuses.has(status)) {
    failures.push(
      `social asset ${socialId} on non-production channel ${channel} must be backlog-only status (${Array.from(allowedBacklogStatuses).join(', ')})`,
    );
  }
  if (!allowedModes.has(mode)) {
    failures.push(`social asset ${socialId} has invalid content_mode: ${mode}`);
    continue;
  }

  if (mode === 'blog_derivative') {
    if (!parent) {
      failures.push(`social asset ${socialId} is blog_derivative but missing blog_parent_id`);
      continue;
    }
    if (!createdBlogIds.has(parent)) {
      notes.push(`social asset ${socialId} points to blog ${parent} not yet created in manifest`);
    }
    if (manifestSocialIds.has(socialId) && mappedCoverage.has(parent)) {
      mappedCoverage.set(parent, mappedCoverage.get(parent) + 1);
    }
  }

  if ((mode === 'seasonal_offer' || mode === 'product_offer') && parent) {
    failures.push(`social asset ${socialId} uses ${mode} and must not define blog_parent_id`);
  }

  if (!manifestSocialIds.has(socialId) && status === 'published') {
    failures.push(`social asset ${socialId} marked published in policy but missing in campaign manifest`);
  }
}

for (const blogEntry of createdBlogAssets) {
  const blogId = norm(blogEntry.assetId);
  const blogStatus = String(blogEntry?.status || '').toLowerCase();
  if (!strictBlogStatuses.has(blogStatus)) continue;
  const coverage = mappedCoverage.get(blogId) ?? 0;
  if (coverage < requiredMinPerBlog) {
    failures.push(
      `blog ${blogId} status=${blogStatus} has social coverage below required minimum (${coverage} < ${requiredMinPerBlog})`,
    );
  }
}

const result = {
  ok: failures.length === 0,
  client,
  manifestPath: path.relative(root, manifestPath),
  policyPath: path.relative(root, policyPath),
  channelEligibilityPath: path.relative(root, channelEligibilityPath),
  createdBlogIds: Array.from(createdBlogIds),
  manifestSocialIds: Array.from(manifestSocialIds),
  mappedCoverage: Array.from(mappedCoverage.entries()).map(([blogId, coverage]) => ({ blogId, coverage })),
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
