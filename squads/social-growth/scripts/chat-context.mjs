import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function readJsAssignment(filePath) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, 'utf8');
  const assignmentIndex = text.indexOf('=');
  if (assignmentIndex < 0) return null;
  const jsonText = text.slice(assignmentIndex + 1).trim().replace(/;\s*$/, '');
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function statusBucket(status) {
  const value = String(status || '').toLowerCase();
  if (value === 'published' || value.includes('public') || value.includes('aprov')) return 'published';
  if (value === 'scheduled' || value.includes('agend')) return 'scheduled';
  if (value === 'review' || value.includes('revis') || value.includes('preview')) return 'review';
  if (value === 'blocked' || value.includes('bloq')) return 'blocked';
  return 'draft';
}

function countBy(items, selector) {
  return items.reduce((acc, item) => {
    const key = selector(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortCountObject(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

function pickClientName(data, campaigns) {
  const clientId = data?.client || campaigns?.client || 'amiclube';
  const clients = Array.isArray(data?.clients) ? data.clients : Array.isArray(campaigns?.clients) ? campaigns.clients : [];
  const client = clients.find((entry) => entry.id === clientId);
  return client?.name || clientId;
}

export function loadChatContext(dashboardDir) {
  const data = readJsAssignment(join(dashboardDir, 'data.js')) || {};
  const campaignsData = readJsAssignment(join(dashboardDir, 'campaigns-data.js')) || data?.campaigns || {};
  const articlesData = readJsAssignment(join(dashboardDir, 'articles-data.js')) || { items: [] };
  const catalogPath = join(dashboardDir, 'instagram-commerce-catalog.json');
  const catalog = existsSync(catalogPath) ? JSON.parse(readFileSync(catalogPath, 'utf8')) : null;

  const campaignItems = Array.isArray(campaignsData.items)
    ? campaignsData.items
    : Array.isArray(data?.campaigns?.items)
      ? data.campaigns.items
      : Array.isArray(data.queue)
        ? data.queue
        : [];
  const queueItems = Array.isArray(data.queue) ? data.queue : [];
  const articles = Array.isArray(articlesData.items) ? articlesData.items : [];
  const products = Array.isArray(catalog?.products) ? catalog.products : Array.isArray(catalog?.items) ? catalog.items : [];

  const statusCounts = countBy(campaignItems, (item) => statusBucket(item.status));
  const channelCounts = countBy(campaignItems, (item) => String(item.channel || 'sem canal').toLowerCase());
  const publishedItems = campaignItems.filter((item) => statusBucket(item.status) === 'published');
  const publishedByChannel = countBy(publishedItems, (item) => String(item.channel || 'sem canal'));
  const publishedByType = countBy(publishedItems, (item) => String(item.type || 'sem tipo'));
  const pendingReview = campaignItems.filter((item) => statusBucket(item.status) === 'review').slice(0, 8);
  const scheduled = queueItems.filter((item) => statusBucket(item.status) === 'scheduled').slice(0, 8);
  const published = publishedItems.slice(0, 8);
  const engagementSeries = Array.isArray(data?.engagement?.series) ? data.engagement.series : [];
  const topEngagement = engagementSeries
    .slice()
    .sort((a, b) => Number(b.engagement || 0) - Number(a.engagement || 0))
    .slice(0, 8);

  return {
    client: {
      id: data?.client || campaignsData?.client || 'amiclube',
      name: pickClientName(data, campaignsData),
    },
    campaign: {
      sourceFile: campaignsData.sourceFile || 'campaign-manifest.json',
      updatedAt: campaignsData.updatedAt || data.lastUpdated || null,
      active: Array.isArray(campaignsData.campaigns)
        ? campaignsData.campaigns.find((campaign) => campaign.status === 'active') || campaignsData.campaigns[0] || null
        : null,
    },
    counts: {
      campaignItems: campaignItems.length,
      queueItems: queueItems.length,
      articles: articles.length,
      products: products.length,
      status: statusCounts,
      channels: channelCounts,
      publishedByChannel: sortCountObject(publishedByChannel),
      publishedByType: sortCountObject(publishedByType),
      engagement: data?.engagement?.summary || null,
      presence: data?.presence || null,
    },
    samples: {
      pendingReview: pendingReview.map((item) => ({ assetId: item.assetId || item.asset_id, title: item.title || item.plannedTitle, channel: item.channel, type: item.type })),
      scheduled: scheduled.map((item) => ({ assetId: item.asset_id || item.assetId, channel: item.channel, publishAt: item.publish_at, status: item.status })),
      published: published.map((item) => ({ assetId: item.assetId || item.asset_id, title: item.title || item.plannedTitle, channel: item.channel, type: item.type, publishedUrl: item.publishedUrl || item.published_url })),
      articles: articles.slice(0, 8).map((item) => ({ assetId: item.assetId, title: item.title, status: item.status, targetDate: item.targetDate, previewHtml: item.previewHtml, articleUrl: item.articleUrl })),
      products: products.slice(0, 8).map((item) => ({ id: item.id || item.retailer_id, name: item.name, price: item.price, availability: item.availability, salesUrl: item.sales_url || item.product_link })),
      topEngagement: topEngagement.map((item) => ({ date: item.date, label: item.label, likes: item.likes, comments: item.comments, engagement: item.engagement, type: item.type })),
    },
  };
}

export { statusBucket };
