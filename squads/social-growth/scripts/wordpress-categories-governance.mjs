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
const mode = String(readArg('mode', 'sync')).toLowerCase(); // sync | ensure

if (!client) {
  console.error('Usage: node wordpress-categories-governance.mjs --client <client-slug> [--mode sync|ensure]');
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, 'squads', 'social-growth', 'output', client);
const publishingDir = path.join(clientDir, 'publishing');
const policyPath = path.join(publishingDir, 'wordpress-category-governance.json');
const cachePath = path.join(publishingDir, 'wordpress-categories-cache.json');
const profilePath = path.join(root, 'squads', 'social-growth', 'pipeline', 'data', `${client}-publishing-profile.md`);

const failures = [];
const notes = [];

const normalize = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const slugify = (value) =>
  normalize(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const parseProfileField = (markdown, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`-\\s*\\*\\*${escaped}:\\*\\*\\s*(.+)`, 'i'));
  return match ? match[1].trim() : '';
};

const fetchAllCategories = async (url, headers) => {
  const categories = [];
  let page = 1;
  while (true) {
    const response = await fetch(`${url}/wp-json/wp/v2/categories?per_page=100&page=${page}`, { headers });
    if (!response.ok) {
      if (response.status === 400 && page > 1) break;
      throw new Error(`failed to fetch categories page ${page}: ${response.status}`);
    }
    const chunk = await response.json();
    categories.push(...chunk);
    if (chunk.length < 100) break;
    page += 1;
  }
  return categories;
};

if (!fs.existsSync(profilePath)) {
  failures.push(`publishing profile not found: ${profilePath}`);
}

let profile = '';
if (fs.existsSync(profilePath)) profile = fs.readFileSync(profilePath, 'utf8');

const websiteUrl = parseProfileField(profile, 'Website URL');
const user = parseProfileField(profile, 'REST API User');
const appPassword = parseProfileField(profile, 'Application Password');

if (!websiteUrl || websiteUrl.includes('[PENDENTE]')) failures.push('Website URL missing in publishing profile');
if (!user || user.includes('[PENDENTE]')) failures.push('REST API User missing in publishing profile');
if (!appPassword || appPassword.includes('[PENDENTE]')) failures.push('Application Password missing in publishing profile');

const defaultPolicy = {
  enabled: true,
  allow_create: true,
  max_total_categories: 12,
  max_new_categories_per_run: 2,
  fallback_category_name: 'Blog',
  core_categories: ['Blog'],
  allowed_new_categories: ['Blog'],
  blocked_name_patterns: ['^\\s*$', '^uncategorized$'],
  alias_map: {},
};

let policy = defaultPolicy;
if (fs.existsSync(policyPath)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
    policy = { ...defaultPolicy, ...parsed };
  } catch {
    failures.push(`invalid JSON policy file: ${policyPath}`);
  }
} else {
  fs.mkdirSync(path.dirname(policyPath), { recursive: true });
  fs.writeFileSync(policyPath, `${JSON.stringify(defaultPolicy, null, 2)}\n`, 'utf8');
  notes.push(`created default policy at ${path.relative(root, policyPath)}`);
}

if (failures.length > 0) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        client,
        mode,
        failures,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const auth = Buffer.from(`${user}:${appPassword}`).toString('base64');
const headers = {
  Authorization: `Basic ${auth}`,
  'Content-Type': 'application/json',
};

let categories = [];
try {
  categories = await fetchAllCategories(websiteUrl, headers);
} catch (error) {
  failures.push(`failed to fetch categories from WordPress: ${error.message || String(error)}`);
}

const created = [];
const warnings = [];

if (failures.length === 0 && mode === 'ensure' && policy.enabled && policy.allow_create) {
  let newCount = 0;
  const maxNew = Number(policy.max_new_categories_per_run ?? 2);
  const maxTotal = Number(policy.max_total_categories ?? 12);
  const allowSet = new Set((policy.allowed_new_categories || []).map((name) => normalize(name)));
  const blocked = (policy.blocked_name_patterns || []).map((pattern) => new RegExp(pattern, 'i'));

  for (const categoryName of policy.core_categories || []) {
    const exists = categories.find((cat) => normalize(cat.name) === normalize(categoryName) || normalize(cat.slug) === slugify(categoryName));
    if (exists) continue;
    const nameNorm = normalize(categoryName);
    if (allowSet.size > 0 && !allowSet.has(nameNorm)) {
      warnings.push(`skipped core category not in allowlist: ${categoryName}`);
      continue;
    }
    if (blocked.some((pattern) => pattern.test(categoryName))) {
      warnings.push(`skipped core category by blocked pattern: ${categoryName}`);
      continue;
    }
    if (newCount >= maxNew) {
      warnings.push(`new-category budget reached (${maxNew})`);
      break;
    }
    if (categories.length >= maxTotal) {
      warnings.push(`max total categories reached (${maxTotal})`);
      break;
    }

    try {
      const response = await fetch(`${websiteUrl}/wp-json/wp/v2/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: categoryName, slug: slugify(categoryName) }),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        warnings.push(`failed to create category ${categoryName}: ${errorBody}`);
        continue;
      }
      const createdCategory = await response.json();
      categories.push(createdCategory);
      created.push({ id: createdCategory.id, name: createdCategory.name, slug: createdCategory.slug });
      newCount += 1;
    } catch (error) {
      warnings.push(`failed to create category ${categoryName}: ${error.message || String(error)}`);
    }
  }
}

if (failures.length === 0) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  const cache = {
    updatedAt: new Date().toISOString(),
    client,
    mode,
    wordpressUrl: websiteUrl,
    policy,
    stats: {
      total: categories.length,
      createdThisRun: created.length,
    },
    categories: categories
      .map((cat) => ({ id: cat.id, name: cat.name, slug: cat.slug, count: cat.count ?? 0 }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    created,
    warnings,
    notes,
  };
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

const result = {
  ok: failures.length === 0,
  client,
  mode,
  profilePath: path.relative(root, profilePath),
  policyPath: path.relative(root, policyPath),
  cachePath: path.relative(root, cachePath),
  totalCategories: categories.length,
  createdCategories: created,
  warnings,
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
