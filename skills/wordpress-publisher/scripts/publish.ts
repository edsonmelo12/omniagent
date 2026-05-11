import fs from 'fs';
import path from 'path';

type WpCategory = {
  id: number;
  name: string;
  slug: string;
  parent?: number;
  count?: number;
};

type CategoryGovernance = {
  enabled?: boolean;
  allow_create?: boolean;
  max_total_categories?: number;
  max_new_categories_per_run?: number;
  fallback_category_name?: string;
  allowed_new_categories?: string[];
  blocked_name_patterns?: string[];
  alias_map?: Record<string, string>;
  asset_category_map?: Record<string, string>;
  cache_path?: string;
};

const normalizeText = (value: string) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const slugify = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

async function fetchAllCategories(url: string, headers: Record<string, string>) {
  const categories: WpCategory[] = [];
  let page = 1;
  while (true) {
    const response = await fetch(`${url}/wp-json/wp/v2/categories?per_page=100&page=${page}`, { headers });
    if (!response.ok) {
      if (response.status === 400 && page > 1) break;
      throw new Error(`Failed to fetch categories page ${page}: ${response.status}`);
    }
    const chunk = (await response.json()) as WpCategory[];
    categories.push(...chunk);
    if (chunk.length < 100) break;
    page += 1;
  }
  return categories;
}

function selectExistingCategoryId(
  requestedName: string,
  categories: WpCategory[],
  aliasMap: Record<string, string>,
) {
  const requestedNorm = normalizeText(requestedName);
  const canonical = aliasMap[requestedNorm] || requestedName;
  const canonicalNorm = normalizeText(canonical);
  const canonicalSlug = slugify(canonical);

  const byName = categories.find((cat) => normalizeText(cat.name) === canonicalNorm);
  if (byName) return byName.id;
  const bySlug = categories.find((cat) => normalizeText(cat.slug) === canonicalSlug);
  if (bySlug) return bySlug.id;
  return null;
}

async function publish() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Error: Missing input file path.');
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const {
    title,
    content,
    slug,
    status = 'draft',
    category_names = [],
    category_ids = [],
    tags = [],
    featured_image_path,
    excerpt,
    connection,
    category_governance = {},
    asset_id = '',
  } = input;
  const governance: CategoryGovernance = category_governance || {};

  const url = connection?.url || process.env.WORDPRESS_URL;
  const user = connection?.user || process.env.WORDPRESS_USER;
  const password = connection?.password || process.env.WORDPRESS_APP_PASSWORD;

  if (!url || !user || !password) {
    console.error('Error: Missing WordPress credentials.');
    process.exit(1);
  }

  const auth = Buffer.from(`${user}:${password}`).toString('base64');
  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };

  // --- 1. Category Governance and Mapping ---
  let finalCategoryIds = [...category_ids];
  let allCategories: WpCategory[] = [];
  const appliedCategories: { name: string; id: number; source: string }[] = [];
  const createdCategories: { name: string; id: number }[] = [];
  const governanceWarnings: string[] = [];

  const governanceEnabled = governance.enabled !== false;
  const allowCreate = governanceEnabled && governance.allow_create === true;
  const maxTotalCategories = Number(governance.max_total_categories ?? 12);
  const maxNewCategoriesPerRun = Number(governance.max_new_categories_per_run ?? 1);
  const fallbackCategoryName = String(governance.fallback_category_name || '').trim();
  const allowedNew = new Set((governance.allowed_new_categories || []).map((name) => normalizeText(name)));
  const blockedPatterns = (governance.blocked_name_patterns || []).map((value) => new RegExp(value, 'i'));
  const aliasMapEntries = Object.entries(governance.alias_map || {}).map(([key, value]) => [normalizeText(key), value]);
  const aliasMap = Object.fromEntries(aliasMapEntries);
  let createdThisRun = 0;

  try {
    allCategories = await fetchAllCategories(url, headers);
  } catch (err: any) {
    console.warn(`Warning: Failed to fetch categories for mapping: ${err?.message || String(err)}`);
    governanceWarnings.push('category fetch failed, using provided category_ids only');
  }

  const mappedCategoryByAsset = governance.asset_category_map?.[String(asset_id || '').toUpperCase()] || null;
  const requestedCategoryNames = category_names.length > 0 ? [...category_names] : mappedCategoryByAsset ? [mappedCategoryByAsset] : [];

  if (requestedCategoryNames.length > 0 && allCategories.length > 0) {
    console.log(`Resolving categories for: ${requestedCategoryNames.join(', ')}...`);
    for (const requestedName of requestedCategoryNames) {
      const existingId = selectExistingCategoryId(requestedName, allCategories, aliasMap);
      if (existingId) {
        finalCategoryIds.push(existingId);
        appliedCategories.push({ name: requestedName, id: existingId, source: 'existing' });
        continue;
      }

      const candidateNorm = normalizeText(requestedName);
      const blocked = blockedPatterns.some((pattern) => pattern.test(requestedName));
      const allowByList = allowedNew.size === 0 || allowedNew.has(candidateNorm);
      const underBudget = createdThisRun < maxNewCategoriesPerRun;
      const underMaxTotal = allCategories.length < maxTotalCategories;

      if (allowCreate && allowByList && !blocked && underBudget && underMaxTotal) {
        try {
          const createResponse = await fetch(`${url}/wp-json/wp/v2/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: requestedName, slug: slugify(requestedName) }),
          });
          if (createResponse.ok) {
            const created = (await createResponse.json()) as WpCategory;
            allCategories.push(created);
            finalCategoryIds.push(created.id);
            appliedCategories.push({ name: requestedName, id: created.id, source: 'created' });
            createdCategories.push({ name: created.name, id: created.id });
            createdThisRun += 1;
            console.log(`Created category: ${created.name} -> ID: ${created.id}`);
            continue;
          }
          const errorBody = await createResponse.text();
          governanceWarnings.push(`failed to create category "${requestedName}": ${errorBody}`);
        } catch (err: any) {
          governanceWarnings.push(`failed to create category "${requestedName}": ${err?.message || String(err)}`);
        }
      } else {
        if (!allowCreate) governanceWarnings.push(`category "${requestedName}" missing and creation disabled`);
        if (!allowByList) governanceWarnings.push(`category "${requestedName}" rejected by allowlist`);
        if (blocked) governanceWarnings.push(`category "${requestedName}" rejected by blocked pattern`);
        if (!underBudget) governanceWarnings.push(`category "${requestedName}" rejected by new-category budget`);
        if (!underMaxTotal) governanceWarnings.push(`category "${requestedName}" rejected by max total categories`);
      }
    }
  }

  if (fallbackCategoryName && allCategories.length > 0 && finalCategoryIds.length === 0) {
    let fallbackId = selectExistingCategoryId(fallbackCategoryName, allCategories, aliasMap);
    if (!fallbackId && allowCreate && createdThisRun < maxNewCategoriesPerRun && allCategories.length < maxTotalCategories) {
      try {
        const createResponse = await fetch(`${url}/wp-json/wp/v2/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: fallbackCategoryName, slug: slugify(fallbackCategoryName) }),
        });
        if (createResponse.ok) {
          const created = (await createResponse.json()) as WpCategory;
          fallbackId = created.id;
          createdCategories.push({ name: created.name, id: created.id });
          createdThisRun += 1;
        }
      } catch {
        // no-op
      }
    }
    if (fallbackId) {
      finalCategoryIds.push(fallbackId);
      appliedCategories.push({ name: fallbackCategoryName, id: fallbackId, source: 'fallback' });
    }
  }

  // Remove duplicates
  finalCategoryIds = [...new Set(finalCategoryIds)];

  let featuredMediaId: number | null = null;

  // --- 2. Upload Media ---
  if (featured_image_path && fs.existsSync(featured_image_path)) {
    console.log(`Uploading media: ${featured_image_path}...`);
    const fileName = path.basename(featured_image_path);
    const fileData = fs.readFileSync(featured_image_path);

    try {
      const mediaResponse = await fetch(`${url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'image/jpeg',
        },
        body: fileData,
      });

      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        featuredMediaId = media.id;
        console.log(`Media uploaded successfully. ID: ${featuredMediaId}`);
      }
    } catch (err: any) {
      console.warn(`Warning: Media upload error: ${err.message}`);
    }
  }

  // --- 3. Create Post ---
  console.log('Creating post...');
  const postData: any = {
    title,
    content,
    status,
    excerpt,
    slug,
    categories: finalCategoryIds,
    tags,
    yoast_head_json: {
      focuskw: input.meta?._yoast_wpseo_focuskw || input.meta?.focuskw,
      metadesc: input.meta?._yoast_wpseo_metadesc || input.meta?.metadesc,
      title: input.meta?._yoast_wpseo_title || input.meta?.title,
    },
  };

  if (featuredMediaId) {
    postData.featured_media = featuredMediaId;
  }

  try {
    const response = await fetch(`${url}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      const post = await response.json();
      console.log('Post created successfully!');
      console.log(`ID: ${post.id}`);
      console.log(`Edit URL: ${url}/wp-admin/post.php?post=${post.id}&action=edit`);
      console.log(`Categories applied: ${finalCategoryIds.join(', ')}`);
      if (createdCategories.length > 0) {
        console.log(`Categories created this run: ${createdCategories.map((cat) => `${cat.name} (${cat.id})`).join(', ')}`);
      }
      if (governanceWarnings.length > 0) {
        console.log(`Category governance warnings: ${governanceWarnings.join(' | ')}`);
      }

      if (governance.cache_path) {
        try {
          const cachePayload = {
            updatedAt: new Date().toISOString(),
            wordpressUrl: url,
            governance,
            categoryCount: allCategories.length,
            categories: allCategories
              .map((category) => ({ id: category.id, name: category.name, slug: category.slug, count: category.count ?? 0 }))
              .sort((a, b) => a.name.localeCompare(b.name)),
            appliedCategories,
            createdCategories,
            warnings: governanceWarnings,
            latestPost: {
              id: post.id,
              title: post.title?.rendered || title,
              editUrl: `${url}/wp-admin/post.php?post=${post.id}&action=edit`,
            },
          };
          fs.mkdirSync(path.dirname(governance.cache_path), { recursive: true });
          fs.writeFileSync(governance.cache_path, JSON.stringify(cachePayload, null, 2));
        } catch (err: any) {
          console.warn(`Warning: Failed to write category cache: ${err?.message || String(err)}`);
        }
      }
    } else {
      const error = await response.json();
      console.error('Error creating post:', JSON.stringify(error, null, 2));
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
    process.exit(1);
  }
}

publish();
