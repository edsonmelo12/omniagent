#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQUAD_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(SQUAD_ROOT, 'output/dashboard');
const QUEUE_PATH = join(SQUAD_ROOT, 'output/amiclube/publishing/social-publish-queue.json');
const MONITOR_PATH = join(SQUAD_ROOT, 'output/amiclube/publishing/social-publish-monitor.md');
const MONITORING_DIR = join(SQUAD_ROOT, 'output/amiclube/monitoring');
const INSTAGRAM_CATALOG_SEED_PATH = join(SQUAD_ROOT, '..', '..', 'backend', 'scripts', 'seed-instagram-commerce.ts');
const INSTAGRAM_CATALOG_SERVICE_PATH = join(SQUAD_ROOT, '..', '..', 'backend', 'src', 'modules', 'instagram-commerce', 'instagram-commerce.service.ts');
const INSTAGRAM_CATALOG_SNAPSHOT_PATH = join(SQUAD_ROOT, 'output/dashboard/instagram-commerce-catalog.json');
const CAMPAIGN_MANIFEST_PATH = join(SQUAD_ROOT, 'output/amiclube/review/campaign-manifest.json');
const SOCIAL_CAPTIONS_PATH = join(SQUAD_ROOT, 'output/amiclube/publishing/social-final-captions.json');
const SOCIAL_PREVIEWS_DIR = join(SQUAD_ROOT, 'output/amiclube/social/previews');
const SOCIAL_REVIEW_DIR = join(SQUAD_ROOT, 'output/amiclube/review');
const DASHBOARD_HTML_PATH = join(OUTPUT_DIR, 'index.html');
const CAMPAIGNS_DATA_JS_PATH = join(OUTPUT_DIR, 'campaigns-data.js');

function formatPublishDate(publishAtIso) {
  const date = new Date(publishAtIso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

function formatInsightDate(dateIso) {
  const date = new Date(`${dateIso}T00:00:00-03:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatClientLabel(clientId) {
  const raw = String(clientId || '').trim();
  if (!raw) return 'Cliente';
  return raw
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .replace(/\bAmi\s?Clube\b/i, 'AmiClube');
}

function readJsonFile(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function toPosixPath(value) {
  return String(value || '').split(sep).join('/');
}

function relFromDashboard(absolutePath) {
  return toPosixPath(relative(OUTPUT_DIR, absolutePath));
}

function stripHtmlTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToTextPreserveParagraphs(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|section|article|li|h[1-6])>/gi, '\n')
    .replace(/<(?:p|div|section|article|li|h[1-6])[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function resolveDashboardRelativeResource(filePath, resourcePath) {
  const value = String(resourcePath || '').trim();
  if (!value || /^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return relFromDashboard(join(dirname(filePath), value));
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractHtmlImages(html, filePath) {
  const sources = [];
  const text = String(html || '');

  for (const match of text.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)) {
    sources.push(resolveDashboardRelativeResource(filePath, match[1]));
  }

  for (const match of text.matchAll(/background-image:\s*url\((['"]?)(.*?)\1\)/gi)) {
    sources.push(resolveDashboardRelativeResource(filePath, match[2]));
  }

  return uniqueValues(sources);
}

function extractHtmlCaption(html) {
  const text = String(html || '');
  const reviewMatch = text.match(/<div class="caption-content">\s*([\s\S]*?)\s*<div class="hashtags">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/i);
  if (reviewMatch) {
    const caption = htmlToTextPreserveParagraphs(reviewMatch[1]);
    const hashtags = uniqueValues((stripHtmlTags(reviewMatch[2]).match(/#\S+/g) || []).map((tag) => tag.trim()));
    if (caption || hashtags.length) {
      return { caption, hashtags };
    }
  }

  const captionContentStart = text.match(/<div[^>]*class="[^"]*caption-content[^"]*"[^>]*>/i);
  if (captionContentStart && typeof captionContentStart.index === 'number') {
    const contentStart = captionContentStart.index + captionContentStart[0].length;
    const hashtagsStartMatch = text.slice(contentStart).match(/<div[^>]*class="[^"]*hashtags[^"]*"[^>]*>/i);
    const hashtagsStart = hashtagsStartMatch && typeof hashtagsStartMatch.index === 'number'
      ? contentStart + hashtagsStartMatch.index
      : -1;
    const contentEnd = hashtagsStart >= 0 ? hashtagsStart : text.indexOf('</div>', contentStart);
    const captionHtml = contentEnd >= 0 ? text.slice(contentStart, contentEnd) : text.slice(contentStart);
    let hashtags = [];

    if (hashtagsStart >= 0) {
      const hashtagsTagStart = hashtagsStart + (hashtagsStartMatch?.[0].length || 0);
      const hashtagsTagEnd = text.indexOf('</div>', hashtagsTagStart);
      const hashtagsHtml = hashtagsTagEnd >= 0 ? text.slice(hashtagsStart, hashtagsTagEnd + 6) : text.slice(hashtagsStart);
      hashtags = uniqueValues((stripHtmlTags(hashtagsHtml).match(/#\S+/g) || []).map((tag) => tag.trim()));
    }

    const caption = htmlToTextPreserveParagraphs(captionHtml);
    if (caption || hashtags.length) {
      return { caption, hashtags };
    }
  }

  const patterns = [
    /<(?:div|p|section|article)[^>]*class="[^"]*(?:caption-text|body-text|body)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p|section|article)>/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const caption = htmlToTextPreserveParagraphs(match[1]);
    if (caption) return { caption, hashtags: [] };
  }

  return { caption: '', hashtags: [] };
}

function resolveRenderableAsset(assetId) {
  const target = slug(assetId);
  const files = [];

  const collect = (dir, kind) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const lower = name.toLowerCase();
      if (!lower.startsWith(target)) continue;
      if (!lower.endsWith('.html')) continue;
      files.push({ filePath: join(dir, name), kind, name });
    }
  };

  collect(SOCIAL_REVIEW_DIR, 'review');
  collect(SOCIAL_PREVIEWS_DIR, 'preview');

  files.sort((a, b) => {
    const score = (entry) => {
      const lower = entry.name.toLowerCase();
      if (entry.kind === 'review') return 0;
      if (lower.includes('post-preview')) return 1;
      const versionMatch = lower.match(/-v(\d+)(?:[^a-z0-9]|$)/);
      if (versionMatch) return 2 - Number(versionMatch[1]) * 0.001;
      return 3;
    };
    return score(a) - score(b) || b.name.localeCompare(a.name);
  });

  for (const entry of files) {
    try {
      const html = readFileSync(entry.filePath, 'utf8');
      const exportedImages = extractHtmlImages(html, entry.filePath);
      const { caption, hashtags } = extractHtmlCaption(html);
      if (exportedImages.length > 0 || caption || hashtags.length > 0) {
        return {
          fileName: entry.name,
          filePath: entry.filePath,
          source: entry.kind === 'review' ? 'review-modal' : 'preview-html',
          exportedImages,
          caption,
          hashtags,
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadLatestJson(prefix, predicate = () => true) {
  if (!existsSync(MONITORING_DIR)) return null;

  const files = readdirSync(MONITORING_DIR)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.json'))
    .map((name) => {
      const filePath = join(MONITORING_DIR, name);
      return { filePath, mtimeMs: statSync(filePath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(file.filePath, 'utf-8'));
      if (predicate(data)) {
        return { filePath: file.filePath, data };
      }
    } catch {
      continue;
    }
  }

  return null;
}

function parseEngagementData() {
  const latestInsights = loadLatestJson('insights-', (data) => Array.isArray(data?.recent_posts) && data.recent_posts.length > 0);
  if (!latestInsights?.data || !Array.isArray(latestInsights.data.recent_posts) || latestInsights.data.recent_posts.length === 0) {
    return null;
  }

  const series = [...latestInsights.data.recent_posts]
    .slice()
    .reverse()
    .map((item) => {
      const likes = Number(item.likes || 0);
      const comments = Number(item.comments || 0);
      return {
        date: item.date,
        label: formatInsightDate(item.date),
        likes,
        comments,
        engagement: likes + comments,
        type: item.type || null,
      };
    });

  const total = series.reduce((sum, item) => sum + item.engagement, 0);
  const peak = series.reduce((best, item) => (item.engagement > (best?.engagement ?? -1) ? item : best), null);

  return {
    sourceFile: basename(latestInsights.filePath),
    collectedAt: latestInsights.data.collected_at || null,
    summary: {
      totalEngagement: total,
      averageEngagement: series.length ? total / series.length : 0,
      peakEngagement: peak?.engagement || 0,
      peakDate: peak?.label || null,
      totalLikes: Number(latestInsights.data?.summary?.total_likes_30d || 0),
      totalComments: Number(latestInsights.data?.summary?.total_comments_30d || 0),
      engagementRate: Number(latestInsights.data?.summary?.engagement_rate || 0),
    },
    series,
  };
}

function parseTrafficSourcesData() {
  const latestGa4 = loadLatestJson('ga4-insights-', (data) => Array.isArray(data?.traffic_sources) && data.traffic_sources.length > 0);
  if (!latestGa4?.data || !Array.isArray(latestGa4.data.traffic_sources) || latestGa4.data.traffic_sources.length === 0) {
    return null;
  }

  const sources = latestGa4.data.traffic_sources
    .map((item) => {
      const sessions = Number(item.sessions || 0);
      return {
        source: item.source || 'unknown',
        medium: item.medium || 'unknown',
        sessions,
      };
    })
    .sort((a, b) => b.sessions - a.sessions);

  const totalSessions = sources.reduce((sum, item) => sum + item.sessions, 0) || 1;
  const palette = ['#0C5CAB', '#10B981', '#F59E0B', '#A855F7', '#EF4444', '#14B8A6'];

  return {
    sourceFile: basename(latestGa4.filePath),
    collectedAt: latestGa4.data.collected_at || null,
    totalSessions,
    sources: sources.map((item, index) => ({
      ...item,
      share: item.sessions / totalSessions,
      color: palette[index % palette.length],
    })),
  };
}

function parsePresenceData() {
  const latestSocial = loadLatestJson('insights-', (data) => data?.instagram_metrics || data?.facebook_metrics || data?.summary);
  const latestGa4 = loadLatestJson('ga4-insights-', (data) => data?.overview || data?.top_pages);

  const instagram = latestSocial?.data?.instagram_metrics || {};
  const facebook = latestSocial?.data?.facebook_metrics || {};
  const recentPosts = Array.isArray(latestSocial?.data?.recent_posts) ? latestSocial.data.recent_posts : [];
  const socialSummary = latestSocial?.data?.summary || {};
  const overview = latestGa4?.data?.overview || {};
  const topPages = Array.isArray(latestGa4?.data?.top_pages) ? [...latestGa4.data.top_pages] : [];
  topPages.sort((a, b) => Number(b.pageviews || 0) - Number(a.pageviews || 0));

  const blogPageviews = topPages.reduce((sum, item) => sum + Number(item.pageviews || 0), 0);
  const topPage = topPages[0] || null;

  return {
    collectedAt: latestSocial?.data?.collected_at || latestGa4?.data?.collected_at || null,
    sourceFiles: {
      social: latestSocial ? basename(latestSocial.filePath) : null,
      ga4: latestGa4 ? basename(latestGa4.filePath) : null,
    },
    social: {
      instagram: {
        followers: Number(instagram.followers || 0),
        posts: Number(instagram.media_count || 0),
        followersChange: Number(instagram.followers_change || 0),
      },
      facebook: {
        fans: Number(facebook.fan_count || 0),
        talkingAbout: Number(facebook.talking_about || 0),
        fanChange: Number(facebook.fan_change || 0),
      },
      engagement: {
        recentPosts: recentPosts.length,
        likes: Number(socialSummary.total_likes_30d || 0),
        comments: Number(socialSummary.total_comments_30d || 0),
        avgLikesPerPost: Number(socialSummary.avg_likes_per_post || 0),
        engagementRate: Number(socialSummary.engagement_rate || 0),
      },
    },
    blog: {
      sessions: Number(overview.sessions || 0),
      users: Number(overview.total_users || 0),
      pageviews: Number(overview.pageviews || 0),
      bounceRate: Number(overview.bounce_rate || 0),
      avgEngagementTime: Number(overview.avg_engagement_time || 0),
      topPage: topPage ? {
        path: String(topPage.path || '').trim(),
        pageviews: Number(topPage.pageviews || 0),
        avgEngagementTime: Number(topPage.avg_engagement_time || 0),
      } : null,
      topPages: topPages.slice(0, 3).map((item) => ({
        path: String(item.path || '').trim(),
        pageviews: Number(item.pageviews || 0),
        avgEngagementTime: Number(item.avg_engagement_time || 0),
      })),
      blogPageviews,
    },
  };
}

function parseCatalogData() {
  const fallbackProducts = [
    { id: '7994347384003193', name: 'COMBO Squirtle, Pikachu e Charmander', related_content_themes: ['pokemon', 'iniciante', 'combo', 'personagens'] },
    { id: '6977908515592965', name: 'COMBO Pikachu e Charmander', related_content_themes: ['pokemon', 'iniciante', 'combo'] },
    { id: '9659621224111848', name: 'Pé de Pano', related_content_themes: ['livre', 'infantil', 'iniciante'] },
    { id: '6470957126283143', name: 'COMBO Pica Pau + Pé de Pano', related_content_themes: ['combo', 'personagens', 'tv'] },
    { id: '6295437027158864', name: 'Pica-Pau', related_content_themes: ['personagens', 'tv', 'iniciante'] },
  ];

  const buildSnapshot = (catalogId, products, sourceFile) => {
    const themeCounts = new Map();
    for (const product of products) {
      for (const theme of Array.isArray(product.related_content_themes) ? product.related_content_themes : []) {
        themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
      }
    }

    const topThemes = [...themeCounts.entries()]
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme));

    return {
      sourceFile,
      catalogId,
      totalProducts: products.length,
      products,
      topThemes,
    };
  };

  if (existsSync(INSTAGRAM_CATALOG_SNAPSHOT_PATH)) {
    try {
      const snapshot = JSON.parse(readFileSync(INSTAGRAM_CATALOG_SNAPSHOT_PATH, 'utf-8'));
      const products = Array.isArray(snapshot?.products) ? snapshot.products : [];
      if (products.length > 0) {
        return buildSnapshot(snapshot.catalogId || '362908558546091', products, snapshot.sourceFile || 'instagram-commerce-catalog.json');
      }
    } catch {
      // fallback below
    }
  }

  const parseHotmartUrls = () => {
    if (!existsSync(INSTAGRAM_CATALOG_SERVICE_PATH)) return new Map();
    const serviceText = readFileSync(INSTAGRAM_CATALOG_SERVICE_PATH, 'utf-8');
    const blockMatch = serviceText.match(/const hotmartUrls: Record<string, string> = \{([\s\S]*?)\n\s*\};/);
    if (!blockMatch) return new Map();

    const hotmartMap = new Map();
    for (const match of blockMatch[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
      hotmartMap.set(match[1], match[2]);
    }
    return hotmartMap;
  };

  const hotmartUrls = parseHotmartUrls();

  if (!existsSync(INSTAGRAM_CATALOG_SEED_PATH)) {
    return buildSnapshot('362908558546091', fallbackProducts.map((product) => ({ ...product, hotmart_url: hotmartUrls.get(product.id) || null })), 'seed-instagram-commerce.ts');
  }

  const seedText = readFileSync(INSTAGRAM_CATALOG_SEED_PATH, 'utf-8');
  const catalogIdMatch = seedText.match(/const INSTAGRAM_CATALOG_ID = "([^"]+)"/);
  const productsBlockMatch = seedText.match(/const PRODUCTS = \[(.*?)\];/s);
  if (!productsBlockMatch) return buildSnapshot(catalogIdMatch?.[1] || '362908558546091', fallbackProducts, 'seed-instagram-commerce.ts');

  const products = [];
  const itemRe = /\{\s*id:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*themes:\s*\[([^\]]*)\]\s*\}/gs;
  for (const match of productsBlockMatch[1].matchAll(itemRe)) {
    const themes = [];
    const themesText = match[3] || '';
    for (const themeMatch of themesText.matchAll(/"([^"]+)"/g)) {
      themes.push(themeMatch[1]);
    }
    products.push({
      id: match[1],
      name: match[2],
      related_content_themes: themes,
      hotmart_url: hotmartUrls.get(match[1]) || null,
    });
  }

  const resolvedProducts = products.length > 0
    ? products
    : fallbackProducts.map((product) => ({ ...product, hotmart_url: hotmartUrls.get(product.id) || null }));

  return buildSnapshot(catalogIdMatch?.[1] || '362908558546091', resolvedProducts, 'seed-instagram-commerce.ts');
}

function parseCampaignsData() {
  const manifest = readJsonFile(CAMPAIGN_MANIFEST_PATH, { assets: { social: [] } });
  const captions = readJsonFile(SOCIAL_CAPTIONS_PATH, { captions: [] });
  const queueData = readJsonFile(QUEUE_PATH, { queue: [] });
  const clientId = String(queueData?.client || 'amiclube').trim().toLowerCase();
  const campaignId = String(manifest?.campaignId || `${clientId}-current-cycle`).trim().toLowerCase();
  const campaignLabel = String(manifest?.campaignLabel || formatClientLabel(clientId)).trim();
  const campaignStatus = String(manifest?.campaignStatus || 'active').trim().toLowerCase();
  const campaignWindow = manifest?.campaignWindow && typeof manifest.campaignWindow === 'object' ? manifest.campaignWindow : null;

  const captionIndex = new Map();
  for (const caption of Array.isArray(captions?.captions) ? captions.captions : []) {
    const assetId = String(caption?.asset_id || '').trim().toUpperCase();
    const channel = String(caption?.channel || '').trim().toLowerCase();
    if (!assetId) continue;
    captionIndex.set(`${assetId}|${channel}`, caption);
  }

  const queueIndex = new Map();
  for (const row of Array.isArray(queueData?.queue) ? queueData.queue : []) {
    const assetId = String(row?.asset_id || '').trim().toUpperCase();
    if (!assetId) continue;
    queueIndex.set(assetId, row);
  }

  const normalizePublishedEvidence = (asset, queueRow) => {
    const publishedPostId = asset?.publishedPostId || queueRow?.published_post_id || null;
    const publishedUrl = asset?.publishedUrl || queueRow?.published_url || null;
    const sourceStatus = String(asset?.status || '').trim();
    const queueStatus = String(queueRow?.status || '').trim();
    const hasPublishEvidence = !!(publishedPostId || publishedUrl || String(queueRow?.last_result || '').toLowerCase() === 'published_ok');
    const status = hasPublishEvidence ? 'published' : (queueStatus || sourceStatus);
    return { publishedPostId, publishedUrl, status, sourceStatus };
  };

  const previewFiles = existsSync(SOCIAL_PREVIEWS_DIR)
    ? readdirSync(SOCIAL_PREVIEWS_DIR)
        .filter((name) => name.toLowerCase().endsWith('.json'))
        .sort((a, b) => a.localeCompare(b))
    : [];

  const resolvePreviewManifest = (assetId) => {
    const target = slug(assetId);
    const candidates = previewFiles
      .filter((name) => name.toLowerCase().startsWith(target))
      .sort((a, b) => {
        const score = (name) => {
          const lower = name.toLowerCase();
          if (lower.includes('post-preview-manifest')) return 0;
          if (lower.includes('preview-manifest')) return 1;
          return 2;
        };
        return score(a) - score(b) || a.localeCompare(b);
      });

    for (const fileName of candidates) {
      const preview = readJsonFile(join(SOCIAL_PREVIEWS_DIR, fileName), null);
      const exportedImages = Array.isArray(preview?.exported_images)
        ? preview.exported_images.map((value) => relFromDashboard(value)).filter(Boolean)
        : [];
      if (exportedImages.length === 0) continue;
      return {
        fileName,
        exportedImages,
        channel: preview?.channel || null,
        objective: preview?.objective || null,
        title: preview?.title || null,
      };
    }

    return null;
  };

  const socialAssets = Array.isArray(manifest?.assets?.social) ? manifest.assets.social : [];
  const items = socialAssets.map((asset) => {
    const assetId = String(asset?.assetId || '').trim().toUpperCase();
    const channel = String(asset?.channel || '').trim().toLowerCase();
    const caption = captionIndex.get(`${assetId}|${channel}`) || captionIndex.get(`${assetId}|instagram`) || captionIndex.get(`${assetId}|facebook`) || null;
    const preview = resolvePreviewManifest(assetId);
    const canonicalPreviewPath = String(asset?.canonicalPreviewPath || '').trim();
    const canonicalPreviewHtml = canonicalPreviewPath ? relFromDashboard(join(SQUAD_ROOT, 'output', 'amiclube', canonicalPreviewPath)) : '';
    const renderableAsset = resolveRenderableAsset(assetId);
    const queueRow = queueIndex.get(assetId) || null;
    const publication = normalizePublishedEvidence(asset, queueRow);

    const exportedImages = (renderableAsset?.exportedImages?.length ? renderableAsset.exportedImages : preview?.exportedImages) || [];
    const finalCaption = renderableAsset?.caption || caption?.final_caption || '';
    const finalHashtags = renderableAsset?.hashtags?.length ? renderableAsset.hashtags : (Array.isArray(caption?.hashtags) ? caption.hashtags : []);
    const reviewModalHtml = renderableAsset?.source === 'review-modal'
      ? relFromDashboard(renderableAsset.filePath)
      : '';

      return {
        assetId,
        client: clientId,
        campaignId,
        title: String(asset?.title || asset?.plannedTitle || '').trim(),
      plannedTitle: String(asset?.plannedTitle || '').trim(),
      status: publication.status,
      sourceStatus: publication.sourceStatus,
      priority: String(asset?.priority || '').trim(),
      weekLabel: String(asset?.weekLabel || '').trim(),
      channel: String(asset?.channel || '').trim(),
      type: String(asset?.type || '').trim(),
      objective: String(asset?.objective || '').trim(),
      blogParentId: String(asset?.blogParentId || '').trim(),
      slug: String(asset?.slug || '').trim(),
      version: String(asset?.version || '').trim(),
      style: String(asset?.style || '').trim(),
      source: String(asset?.source || 'campaign-manifest').trim(),
      canonicalPreviewPath,
      canonicalPreviewHtml,
      reviewModalHtml,
      reviewModalFile: renderableAsset?.source === 'review-modal' ? renderableAsset.fileName : '',
      exportedImages,
      previewManifestFile: preview?.fileName || '',
      caption: finalCaption,
      hashtags: finalHashtags,
      cta: String(caption?.cta || '').trim(),
      firstLineHook: String(caption?.first_line_hook || '').trim(),
      linkTarget: String(caption?.link_target || asset?.articleUrl || '').trim(),
      linkStrategy: String(caption?.link_strategy || asset?.linkStrategy || '').trim(),
      altText: String(caption?.alt_text || '').trim(),
      publishedPostId: publication.publishedPostId,
      publishedUrl: publication.publishedUrl,
      publishedAt: asset?.publishedAt || queueRow?.published_at || null,
    };
  });

  return {
    sourceFile: basename(CAMPAIGN_MANIFEST_PATH),
    updatedAt: new Date().toISOString(),
    client: clientId,
    clients: [{ id: clientId, name: formatClientLabel(clientId) }],
    campaigns: [{ id: campaignId, label: campaignLabel, status: campaignStatus, window: campaignWindow, client: clientId }],
    totalSocialAssets: items.length,
    items,
    byAssetId: Object.fromEntries(items.map((item) => [item.assetId, item])),
  };
}

function parseQueueJson() {
  if (!existsSync(QUEUE_PATH)) {
    return null;
  }

  const content = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
  const queue = Array.isArray(content.queue) ? content.queue : [];
  const published = queue.filter((item) => item.status === 'published').length;
  const scheduled = queue.filter((item) => item.status === 'scheduled').length;
  const blocked = queue.filter((item) => item.status === 'blocked').length;
  const alerts = {
    critical: Array.isArray(content.failures) ? content.failures : [],
    warning: Array.isArray(content.warnings) ? content.warnings : [],
    info: queue.filter((item) => item.status === 'scheduled').map((item) => `${item.asset_id}: aguardando janela`),
  };

  return {
    metrics: {
      totalInQueue: queue.length,
      published,
      scheduled,
      blocked,
    },
    queue: queue.map((item) => ({
      asset_id: item.asset_id,
      channel: item.channel,
      publish_at: formatPublishDate(item.publish_at_iso),
      publish_at_iso: item.publish_at_iso,
      status: item.status,
      link_target: item.link_target || null,
      recommended_product_id: item.recommended_product_id || null,
      recommended_product_name: item.recommended_product_name || null,
      selected_product_id: item.selected_product_id || null,
      selected_product_name: item.selected_product_name || null,
      selected_product_sales_url: item.selected_product_sales_url || null,
      product_tag_status: item.product_tag_status || null,
      product_tag_product_id: item.product_tag_product_id || null,
      product_override_allowed: item.product_override_allowed ?? null,
      product_selection_mode: item.product_selection_mode || null,
      product_selection_reason: item.product_selection_reason || null,
      product_alternatives: Array.isArray(item.product_alternatives) ? item.product_alternatives : [],
      published_post_id: item.published_post_id || null,
      published_url: item.published_url || null,
    })),
    lastUpdated: content.updatedAt || content.generatedAt || new Date().toISOString(),
    alerts,
  };
}

function parseMonitorFile() {
  if (!existsSync(MONITOR_PATH)) {
    return null;
  }

  const content = readFileSync(MONITOR_PATH, 'utf-8');
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
      const parts = line.split('|').map((p) => p.trim()).filter((p) => p);
      if (parts.length >= 4 && parts[0] && parts[0] !== 'asset_id') {
        const asset_id = parts[0];
        const channel = parts[1];
        const publish_at_iso = parts[2];
        const status = parts[3];

        if (asset_id && asset_id.startsWith('AC-')) {
          queue.push({
            asset_id,
            channel,
            publish_at: formatPublishDate(publish_at_iso),
            publish_at_iso,
            status,
          });
        }
      }
    }
    if (inQueue && line.includes('## Critical')) {
      inQueue = false;
    }
  }

  const published = queue.filter((q) => q.status === 'published').length;
  const scheduled = queue.filter((q) => q.status === 'scheduled').length;
  const blocked = queue.filter((q) => q.status === 'blocked').length;

  return {
    metrics: {
      totalInQueue: queue.length,
      published,
      scheduled,
      blocked,
    },
    queue,
    lastUpdated: new Date().toISOString(),
    alerts: {
      critical: [],
      warning: [],
      info: queue.filter((q) => q.status === 'scheduled').map((q) => `${q.asset_id}: aguardando janela`),
    },
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
  
  const monitorData = parseQueueJson() || parseMonitorFile();
  const engagementData = parseEngagementData();
  const trafficSourcesData = parseTrafficSourcesData();
  const presenceData = parsePresenceData();
  const catalogData = parseCatalogData();
  const campaignsData = parseCampaignsData();
  const stateData = parseStateSummary();
  
  const data = {
    client: campaignsData.client || 'amiclube',
    clients: campaignsData.clients || [{ id: 'amiclube', name: formatClientLabel('amiclube') }],
    ...(monitorData || {}),
    engagement: engagementData,
    trafficSources: trafficSourcesData,
    presence: presenceData,
    catalog: catalogData,
    campaigns: campaignsData,
    ...(stateData || {}),
    alerts: monitorData?.alerts || {}
  };
  
  const dashboardDataPath = join(OUTPUT_DIR, 'data.json');
  const dashboardDataJsPath = join(OUTPUT_DIR, 'data.js');
  const dataJson = JSON.stringify(data, null, 2);
  writeFileSync(dashboardDataPath, `${dataJson}\n`);
  writeFileSync(dashboardDataJsPath, `window.__DASHBOARD_DATA__ = ${JSON.stringify(data)};\n`);
  writeFileSync(CAMPAIGNS_DATA_JS_PATH, `window.__CAMPAIGNS_DATA__ = ${JSON.stringify(campaignsData)};\n`);

  if (existsSync(DASHBOARD_HTML_PATH)) {
    const html = readFileSync(DASHBOARD_HTML_PATH, 'utf-8');
    const embedded = `<script src="data.js"></script>`;
    const nextHtml = html.replace(/<script src="data\.js"><\/script>|<script id="dashboard-data" type="application\/json">[\s\S]*?<\/script>/, embedded);
    writeFileSync(DASHBOARD_HTML_PATH, nextHtml, 'utf8');
  }
  
  console.log(`✅ Dashboard atualizada:`);
  console.log(`   - Total na fila: ${data.metrics?.totalInQueue || 0}`);
  console.log(`   - Publicados: ${data.metrics?.published || 0}`);
  console.log(`   - Agendados: ${data.metrics?.scheduled || 0}`);
  console.log(`   - Bloqueados: ${data.metrics?.blocked || 0}`);
  console.log(`   - Arquivo: ${dashboardDataPath}`);
  console.log(`   - JS: ${dashboardDataJsPath}`);
  console.log(`   - Campaigns JS: ${CAMPAIGNS_DATA_JS_PATH}`);
}

main();
