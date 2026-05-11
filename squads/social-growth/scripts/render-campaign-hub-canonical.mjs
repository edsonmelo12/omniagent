#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");

if (!client) {
  console.error("Usage: node render-campaign-hub-canonical.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const reviewDir = path.join(clientDir, "review");
const hubPath = path.join(reviewDir, "campaign-hub.html");
const manifestPath = path.join(reviewDir, "campaign-manifest.json");
const blogDir = path.join(clientDir, "blog");
const socialDir = path.join(clientDir, "social");
const reviewPath = path.join(reviewDir, "content-review.md");
const backlogPath = path.join(clientDir, "editorial-backlog.md");
const alignmentPath = path.join(clientDir, "publishing", "blog-social-alignment.json");
const channelEligibilityPath = path.join(clientDir, "publishing", "channel-eligibility.json");
const categoryGovernancePath = path.join(clientDir, "publishing", "wordpress-category-governance.json");
const schedulePlanPath = path.join(clientDir, "publishing", "schedule-plan.md");
const squadPath = path.join(root, "squads", "social-growth", "squad.yaml");

const toPosix = (value) => value.split(path.sep).join("/");
const relFromHub = (absolutePath) => toPosix(path.relative(reviewDir, absolutePath));
const htmlEscape = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
const stripHtml = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const normalizeId = (value) => String(value || "").trim().toUpperCase();
const normalizeStatus = (value) => String(value || "").trim() || "Planejado";
const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const readJsonFile = (filePath, fallback) => {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const listHtmlFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listHtmlFiles(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(full);
  }
  return files;
};

const relativeFromClient = (absolutePath) => toPosix(path.relative(clientDir, absolutePath));
const absoluteFromClient = (relativePath) => path.join(clientDir, relativePath);
const extractTitleFromPreview = (filePath) => {
  if (!fs.existsSync(filePath)) return prettyTitle(filePath);
  const html = fs.readFileSync(filePath, "utf8");
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1 && h1[1]) return stripHtml(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title && title[1]) return stripHtml(title[1]).replace(/\s*·\s*Preview$/i, "");
  return prettyTitle(filePath);
};
const readFirstHeading = (filePath) => {
  if (!fs.existsSync(filePath)) return "";
  const content = fs.readFileSync(filePath, "utf8");
  const heading = content.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : "";
};

const parseChannelType = (rawValue) => {
  const raw = String(rawValue || "").trim();
  const lower = raw.toLowerCase();
  if (!raw) return { channel: "-", type: "-" };
  if (lower === "blog") return { channel: "Blog", type: "blog" };

  let channel = raw.split(/\s+/)[0];
  let format = raw.slice(channel.length).trim();

  if (/^instagram\b/i.test(raw)) {
    channel = "Instagram";
    format = raw.replace(/^instagram\s*/i, "").trim();
  } else if (/^linkedin\b/i.test(raw)) {
    channel = "LinkedIn";
    format = raw.replace(/^linkedin\s*/i, "").trim();
  } else if (/^facebook\b/i.test(raw)) {
    channel = "Facebook";
    format = raw.replace(/^facebook\s*/i, "").trim();
  } else if (/^stories\b/i.test(raw)) {
    channel = "Stories";
    format = raw.replace(/^stories\s*/i, "").trim();
  }

  const typeSource = format || raw;
  const typeLower = typeSource.toLowerCase();
  let type = typeLower;
  if (/carrossel/.test(typeLower)) type = "carrossel";
  else if (/reels/.test(typeLower)) type = "reels";
  else if (/stories|sequ[êe]ncia/.test(typeLower)) type = "stories";
  else if (/card est[áa]tico|post est[áa]tico/.test(typeLower)) type = "post estático";
  else if (/post oferta/.test(typeLower)) type = "post oferta";
  else if (/post/.test(typeLower)) type = "post";

  return { channel, type };
};

const normalizeChannelKey = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw === "-") return "";
  if (raw === "ig") return "instagram";
  if (raw === "in") return "linkedin";
  if (raw.startsWith("instagram")) return "instagram";
  if (raw.startsWith("linkedin")) return "linkedin";
  if (raw.startsWith("facebook")) return "facebook";
  if (raw.startsWith("stories")) return "instagram";
  if (raw.startsWith("blog")) return "blog";
  return raw;
};

const parseBacklogPlan = () => {
  if (!fs.existsSync(backlogPath)) return { blog: [], social: [] };
  const rows = fs
    .readFileSync(backlogPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => /^\|/.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()));

  const blog = [];
  const social = [];

  for (const cells of rows) {
    if (cells.length < 9) continue;
    const assetId = normalizeId(cells[1]);
    if (!/^AC-\d{2}-\d{2}[A-Z]?$/i.test(assetId)) continue;

    const priority = String(cells[2] || "").trim() || "-";
    const weekRaw = String(cells[3] || "").trim();
    const weekLabel = /^\d+$/.test(weekRaw) ? `Semana ${weekRaw}` : (weekRaw || "Ciclo");
    const channelFormat = String(cells[4] || "").trim();
    const title = String(cells[5] || "").trim();
    const objective = String(cells[6] || "").trim() || "-";
    const status = normalizeStatus(cells[8]);
    const { channel, type } = parseChannelType(channelFormat);

    const entry = {
      assetId,
      plannedTitle: title,
      title,
      status,
      priority,
      weekLabel,
      channel,
      type,
      objective,
      source: "editorial-backlog",
      titleSource: "planned-pauta",
      canonicalPreviewPath: "",
      planned: true,
    };

    if (type === "blog") blog.push(entry);
    else social.push(entry);
  }

  return { blog, social };
};

const readAlignmentMap = () => {
  const data = readJsonFile(alignmentPath, { social_assets: [] });
  const map = new Map();
  for (const item of Array.isArray(data?.social_assets) ? data.social_assets : []) {
    const id = normalizeId(item?.asset_id);
    if (!id) continue;
    map.set(id, {
      content_mode: String(item?.content_mode || "").trim(),
      blog_parent_id: normalizeId(item?.blog_parent_id || ""),
      channel: normalizeChannelKey(item?.channel || ""),
    });
  }
  return map;
};

const readCategoryMap = () => {
  const data = readJsonFile(categoryGovernancePath, {});
  const src = data?.asset_category_map && typeof data.asset_category_map === "object" ? data.asset_category_map : {};
  const map = new Map();
  for (const [key, value] of Object.entries(src)) {
    map.set(normalizeId(key), String(value || "").trim());
  }
  return map;
};

const readScheduleMap = () => {
  if (!fs.existsSync(schedulePlanPath)) return new Map();
  const map = new Map();
  const lines = fs.readFileSync(schedulePlanPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const rowMatch = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})[^|]*\|/);
    if (!rowMatch) continue;
    const date = rowMatch[1];
    const idMatch = line.match(/(AC-\d{2}-\d{2}[A-Z]?|CAROUSEL-[A-Z0-9-]+|STORIES-[A-Z0-9-]+|LINKEDIN-[A-Z0-9-]+)/i);
    if (!idMatch) continue;
    map.set(normalizeId(idMatch[1]), date);
  }
  return map;
};

const readChannelEligibility = () => {
  const data = readJsonFile(channelEligibilityPath, { channels: [], enforcement: {} });
  const byId = new Map();
  for (const item of Array.isArray(data?.channels) ? data.channels : []) {
    const id = normalizeChannelKey(item?.id);
    if (!id) continue;
    byId.set(id, {
      state: String(item?.state || "").trim().toUpperCase() || "ACTIVE",
      account_exists: item?.account_exists === true,
      publish_enabled: item?.publish_enabled === true,
      credentials_valid: item?.credentials_valid === true,
    });
  }
  const productionStates = new Set(
    (Array.isArray(data?.enforcement?.production_states) ? data.enforcement.production_states : ["ACTIVE"])
      .map((value) => String(value || "").trim().toUpperCase())
      .filter(Boolean),
  );
  const defaultState = String(data?.default_channel_state || "ACTIVE").trim().toUpperCase();

  return { byId, productionStates, defaultState };
};

const readPhaseOwnerLabels = () => {
  const fallback = {
    blogWriter: "Blog Writer",
    socialPlanner: "Content Repurposer",
    reviewer: "Reviewer",
    checkpoint: "Usuario (Checkpoint de Aprovacao)",
    scheduler: "Scheduler",
    publisher: "Wagner WordPress",
  };

  if (!fs.existsSync(squadPath)) return fallback;
  const text = fs.readFileSync(squadPath, "utf8");
  const ownersByStep = new Map();
  const regex = /- step:\s*([^\n]+)\n\s*owner:\s*([^\n]+)\n\s*displayName:\s*([^\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    ownersByStep.set(match[1].trim(), match[3].trim());
  }

  return {
    blogWriter: ownersByStep.get("pipeline/steps/step-03d-create-blog-post.md") || fallback.blogWriter,
    socialPlanner: ownersByStep.get("pipeline/steps/step-03f-repurpose-content.md") || fallback.socialPlanner,
    reviewer: ownersByStep.get("pipeline/steps/step-04-review-content.md") || fallback.reviewer,
    checkpoint: ownersByStep.get("pipeline/steps/step-05-approve-schedule.md") || fallback.checkpoint,
    scheduler: ownersByStep.get("pipeline/steps/step-06-schedule-delivery.md") || fallback.scheduler,
    publisher: ownersByStep.get("pipeline/steps/step-06b-publish-to-wordpress.md") || fallback.publisher,
  };
};

const inferWeekLabel = (assetId) => {
  const id = normalizeId(assetId);
  const match = id.match(/^AC-\d{2}-0([1-4])[A-Z]?$/i);
  return match ? `Semana ${match[1]}` : "Ciclo";
};

const inferSocialType = (entry) => {
  const fromType = String(entry?.type || "").trim();
  if (fromType) return fromType;
  const source = `${String(entry?.slug || "")} ${String(entry?.title || "")}`.toLowerCase();
  if (/carrossel|carousel/.test(source)) return "carrossel";
  if (/reels/.test(source)) return "reels";
  if (/stories/.test(source)) return "stories";
  if (/linkedin/.test(source)) return "post";
  return "post";
};

const inferSocialChannel = (entry) => {
  const fromChannel = String(entry?.channel || "").trim();
  if (fromChannel && fromChannel !== "-") return fromChannel;
  const source = `${String(entry?.slug || "")} ${String(entry?.title || "")}`.toLowerCase();
  if (/linkedin/.test(source)) return "LinkedIn";
  if (/facebook/.test(source)) return "Facebook";
  if (/stories/.test(source)) return "Stories";
  return "Instagram";
};

const resolvePhaseOwner = (group, status, labels) => {
  const lower = String(status || "").toLowerCase();
  if (/^review$|\\brevis[aã]o\\b|\\bem revis[aã]o\\b/.test(lower)) return labels.reviewer;
  if (/aprov/.test(lower)) return labels.checkpoint;
  if (/agend|schedul/.test(lower)) return labels.scheduler;
  if (/public|publish/.test(lower)) return group === "blog" ? labels.publisher : labels.scheduler;
  return group === "blog" ? labels.blogWriter : labels.socialPlanner;
};

const applyOperationalMetadata = (entry, group, maps, ownerLabels) => {
  const id = normalizeId(entry?.assetId);
  const alignment = maps.alignment.get(id) || null;
  const status = normalizeStatus(entry?.status);
  const alignedChannel = alignment?.channel || "";
  const channel = group === "blog"
    ? "Blog"
    : (alignedChannel === "facebook"
      ? "Facebook"
      : alignedChannel === "instagram"
        ? "Instagram"
        : alignedChannel === "linkedin"
          ? "LinkedIn"
          : inferSocialChannel(entry));
  const type = group === "blog" ? "blog" : inferSocialType(entry);
  const contentMode =
    String(entry?.contentMode || "").trim() ||
    (group === "social" ? String(alignment?.content_mode || "").trim() || "blog_derivative" : "editorial");
  const blogParentId =
    group === "social"
      ? normalizeId(alignment?.blog_parent_id || "") || normalizeId(entry?.blogParentId || "")
      : normalizeId(entry?.blogParentId || "");
  const wpCategory =
    String(entry?.wpCategory || "").trim() || (group === "blog" ? String(maps.categories.get(id) || "") : "");
  const rawTargetDate = String(entry?.targetDate || "").trim();
  const targetDate = (rawTargetDate && rawTargetDate !== "-")
    ? rawTargetDate
    : String(maps.schedule.get(id) || "");
  const objective = String(entry?.objective || "").trim() || "-";
  const weekLabel = String(entry?.weekLabel || "").trim() || inferWeekLabel(id);
  const phaseOwner = String(entry?.phaseOwner || "").trim() || resolvePhaseOwner(group, status, ownerLabels);

  return {
    ...entry,
    assetId: id || String(entry?.assetId || "").trim(),
    status,
    channel,
    type,
    objective,
    weekLabel,
    contentMode,
    blogParentId: blogParentId || "-",
    wpCategory: wpCategory || "-",
    targetDate: targetDate || "-",
    phaseOwner,
  };
};

const loadManifest = () => {
  if (!fs.existsSync(manifestPath)) {
    return {
      version: "1.0.0",
      client,
      updatedAt: new Date().toISOString(),
      assets: { blog: [], social: [] },
    };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return {
      version: parsed?.version || "1.0.0",
      client: parsed?.client || client,
      updatedAt: new Date().toISOString(),
      assets: {
        blog: Array.isArray(parsed?.assets?.blog) ? parsed.assets.blog : [],
        social: Array.isArray(parsed?.assets?.social) ? parsed.assets.social : [],
      },
    };
  } catch {
    return {
      version: "1.0.0",
      client,
      updatedAt: new Date().toISOString(),
      assets: { blog: [], social: [] },
    };
  }
};

const syncEntriesWithCanonicalDir = (entries, dir, group, allowedIds = null) => {
  const discovered = listHtmlFiles(dir).map((absolutePath) => {
    const rel = relativeFromClient(absolutePath);
    const base = path.basename(absolutePath).toLowerCase();
    const idMatch = base.match(/(ac-\d{2}-\d{2}[a-z]?)/i);
    const assetId = idMatch ? idMatch[1].toUpperCase() : path.basename(absolutePath, ".html").toUpperCase();
    return {
      assetId,
      slug: path.basename(absolutePath, ".html"),
      title: extractTitleFromPreview(absolutePath),
      status: "review",
      canonicalPreviewPath: rel,
      updatedAt: new Date(fs.statSync(absolutePath).mtimeMs).toISOString(),
      source: group === "blog" ? "blog-canonical-preview" : "social-canonical-preview",
    };
  }).filter((item) => !allowedIds || allowedIds.has(normalizeId(item.assetId)));

  const byKey = new Map();
  for (const item of Array.isArray(entries) ? entries : []) {
    if (!item || typeof item !== "object") continue;
    const key = String(item.assetId || item.slug || "").toLowerCase();
    if (!key) continue;
    if (allowedIds && !allowedIds.has(normalizeId(item.assetId || item.slug || ""))) continue;
    byKey.set(key, item);
  }

  for (const discoveredItem of discovered) {
    const key = String(discoveredItem.assetId || discoveredItem.slug || "").toLowerCase();
    const previous = byKey.get(key);
    const plannedTitle = typeof previous?.plannedTitle === "string" ? previous.plannedTitle.trim() : "";
    const title = plannedTitle || discoveredItem.title;
    byKey.set(key, {
      ...previous,
      ...discoveredItem,
      title,
      status: previous?.status || discoveredItem.status,
      titleSource: plannedTitle ? "planned-pauta" : discoveredItem.source,
      canonicalPreviewPath: previous?.canonicalPreviewPath || discoveredItem.canonicalPreviewPath,
    });
  }

  return Array.from(byKey.values()).sort((a, b) => String(a.assetId || "").localeCompare(String(b.assetId || "")));
};

const mergePlannedEntries = (entries, plannedEntries) => {
  const byKey = new Map();
  for (const item of Array.isArray(entries) ? entries : []) {
    if (!item || typeof item !== "object") continue;
    const key = String(item.assetId || item.slug || "").toLowerCase();
    if (!key) continue;
    byKey.set(key, item);
  }
  for (const planned of Array.isArray(plannedEntries) ? plannedEntries : []) {
    const key = String(planned.assetId || "").toLowerCase();
    if (!key) continue;
    const previous = byKey.get(key);
    byKey.set(key, {
      ...previous,
      ...planned,
      canonicalPreviewPath: previous?.canonicalPreviewPath || planned.canonicalPreviewPath || "",
    });
  }
  return Array.from(byKey.values()).sort((a, b) => String(a.assetId || "").localeCompare(String(b.assetId || "")));
};

const parseReviewVerdict = () => {
  if (!fs.existsSync(reviewPath)) return "PENDING";
  const review = fs.readFileSync(reviewPath, "utf8");
  const match = review.match(/##\s+Verdict\s*\n([A-Z]+)/i);
  return match ? match[1].toUpperCase() : "PENDING";
};

const resolveArticleDestination = (entry, group, blogById) => {
  if (group !== "social") {
    return {
      articleLinkState: "nao_aplicavel",
      articleLinkLabel: "não aplicável",
      articleLinkHref: null,
    };
  }

  const mode = String(entry?.contentMode || "").trim().toLowerCase();
  const parentId = normalizeId(entry?.blogParentId || "");
  if (mode !== "blog_derivative" || !parentId || parentId === "-") {
    return {
      articleLinkState: "nao_aplicavel",
      articleLinkLabel: "não aplicável",
      articleLinkHref: null,
    };
  }

  const parent = blogById.get(parentId);
  if (!parent) {
    return {
      articleLinkState: "pre_publicacao",
      articleLinkLabel: "pré-publicação (artigo ainda não criado)",
      articleLinkHref: null,
    };
  }

  const publicUrlFields = ["publicUrl", "publishedUrl", "wordpressPublicUrl", "liveUrl", "permalink"];
  for (const field of publicUrlFields) {
    const candidate = String(parent?.[field] || "").trim();
    if (isHttpUrl(candidate)) {
      return {
        articleLinkState: "publicado",
        articleLinkLabel: "URL pública ativa",
        articleLinkHref: candidate,
      };
    }
  }

  const previewPath = String(parent?.canonicalPreviewPath || "").trim();
  if (previewPath) {
    const absolutePreviewPath = absoluteFromClient(previewPath);
    if (fs.existsSync(absolutePreviewPath)) {
      return {
        articleLinkState: "revisao_interna",
        articleLinkLabel: "preview interno ativo",
        articleLinkHref: relFromHub(absolutePreviewPath),
      };
    }
  }

  return {
    articleLinkState: "pre_publicacao",
    articleLinkLabel: "pré-publicação (aguardando preview)",
    articleLinkHref: null,
  };
};

const prettyTitle = (file) =>
  path
    .basename(file, ".html")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

const buildCards = (entries, group, ownerLabels, maps, blogById) =>
  entries.map((entry) => {
    const canonicalPath = entry.canonicalPreviewPath || "";
    const resolvedPath = canonicalPath ? absoluteFromClient(canonicalPath) : null;
    const exists = resolvedPath ? fs.existsSync(resolvedPath) : false;
    const sourceStatus = normalizeStatus(entry.status || "Planejado");
    const displayStatus = exists ? sourceStatus : "planejado (preview pendente)";
    const ownerStatus = exists ? sourceStatus : "Planejado";
    const phaseOwner = resolvePhaseOwner(group, ownerStatus, ownerLabels);
    const channelKey = normalizeChannelKey(entry.channel);
    const channelPolicy = channelKey ? maps.channelEligibility.byId.get(channelKey) : null;
    const channelState = channelPolicy?.state || maps.channelEligibility.defaultState;
    const productionReady = Boolean(
      group === "blog" ||
      (
        channelPolicy &&
        maps.channelEligibility.productionStates.has(channelPolicy.state) &&
        channelPolicy.account_exists &&
        channelPolicy.publish_enabled &&
        channelPolicy.credentials_valid
      ),
    );
    const articleDestination = resolveArticleDestination(entry, group, blogById);

    return {
      href: exists ? relFromHub(resolvedPath) : null,
      id: normalizeId(entry.assetId || "ASSET"),
      week: entry.weekLabel || "Ciclo",
      title: entry.plannedTitle || entry.title || prettyTitle(canonicalPath || entry.assetId || "asset"),
      status: displayStatus,
      exists,
      type: entry.type || "-",
      channel: entry.channel || "-",
      parent: entry.blogParentId || "-",
      mode: entry.contentMode || "-",
      objective: entry.objective || "-",
      owner: phaseOwner,
      category: entry.wpCategory || "-",
      targetDate: entry.targetDate || "-",
      channelState,
      productionReady,
      articleLinkState: articleDestination.articleLinkState,
      articleLinkLabel: articleDestination.articleLinkLabel,
      articleLinkHref: articleDestination.articleLinkHref,
    };
  });

const campaignContext = (() => {
  const indexPath = path.join(clientDir, "index.md");
  const pautaPath = path.join(clientDir, "pauta-atual.md");
  const indexTitle = readFirstHeading(indexPath);
  const pautaTitle = readFirstHeading(pautaPath);
  return {
    indexPath: fs.existsSync(indexPath) ? relFromHub(indexPath) : null,
    pautaPath: fs.existsSync(pautaPath) ? relFromHub(pautaPath) : null,
    indexTitle,
    pautaTitle,
  };
})();

const phaseOwnerLabels = readPhaseOwnerLabels();
const maps = {
  alignment: readAlignmentMap(),
  categories: readCategoryMap(),
  schedule: readScheduleMap(),
  channelEligibility: readChannelEligibility(),
};

const manifest = loadManifest();
const backlogPlan = parseBacklogPlan();
const plannedBlogIds = new Set(backlogPlan.blog.map((entry) => normalizeId(entry.assetId)).filter(Boolean));
const plannedSocialIds = new Set(backlogPlan.social.map((entry) => normalizeId(entry.assetId)).filter(Boolean));

manifest.assets.blog = mergePlannedEntries(manifest.assets.blog, backlogPlan.blog);
manifest.assets.social = mergePlannedEntries(manifest.assets.social, backlogPlan.social);

manifest.assets.blog = syncEntriesWithCanonicalDir(
  manifest.assets.blog,
  path.join(blogDir, "previews"),
  "blog",
  plannedBlogIds.size > 0 ? plannedBlogIds : null,
)
  .map((entry) => applyOperationalMetadata(entry, "blog", maps, phaseOwnerLabels));
manifest.assets.social = syncEntriesWithCanonicalDir(
  manifest.assets.social,
  path.join(socialDir, "previews"),
  "social",
  plannedSocialIds.size > 0 ? plannedSocialIds : null,
)
  .map((entry) => applyOperationalMetadata(entry, "social", maps, phaseOwnerLabels));

manifest.updatedAt = new Date().toISOString();
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const verdict = parseReviewVerdict();
const dateLabel = new Date().toISOString().slice(0, 10);
const blogEntriesForHub = plannedBlogIds.size > 0
  ? manifest.assets.blog.filter((entry) => plannedBlogIds.has(normalizeId(entry.assetId)))
  : manifest.assets.blog;
const blogById = new Map();
for (const blog of manifest.assets.blog) {
  const id = normalizeId(blog?.assetId);
  if (!id) continue;
  blogById.set(id, blog);
}
const blogCards = buildCards(blogEntriesForHub, "blog", phaseOwnerLabels, maps, blogById);
const socialCards = buildCards(manifest.assets.social, "social", phaseOwnerLabels, maps, blogById);
const socialPublishableCards = socialCards.filter((card) => card.productionReady);
const socialExpansionCards = socialCards.filter((card) => !card.productionReady);

const failures = [];
const linkSet = new Set();
for (const card of [...blogCards, ...socialCards]) {
  if (!card.href) continue;
  if (!card.exists) failures.push(`missing preview file referenced by manifest: ${card.href}`);
  if (linkSet.has(card.href)) failures.push(`duplicate href detected in hub sources: ${card.href}`);
  linkSet.add(card.href);
}
if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        client,
        manifestPath: path.relative(root, manifestPath),
        failures,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const renderMetadata = (card) => {
  const rows = [
    ["Tipo", card.type],
    ["Canal", card.channel],
    ["Canal elegibilidade", card.channelState],
    ["Artigo-pai", card.parent],
    ["Destino do link", card.articleLinkLabel || "-"],
    ["Modo", card.mode],
    ["Objetivo", card.objective],
    ["Owner fase", card.owner],
    ["Categoria WP", card.category],
    ["Data alvo", card.targetDate],
  ];

  return rows
    .map(([label, value]) => `<div class=\"kv\"><span class=\"k\">${htmlEscape(label)}:</span> <span class=\"v\">${htmlEscape(value)}</span></div>`)
    .join("\n");
};

const cardMarkup = (card) => {
  const previewLinkMarkup = card.href
    ? `<a class="card-preview-link" href="${htmlEscape(card.href)}" target="_blank">Abrir preview</a>`
    : `<span class="card-preview-link disabled">Preview indisponível</span>`;
  const articleLinkMarkup = card.channel === "Blog"
    ? ""
    : (card.articleLinkState === "nao_aplicavel"
      ? ""
      : (card.articleLinkHref
        ? `<a class="article-link" href="${htmlEscape(card.articleLinkHref)}" target="_blank">Abrir artigo relacionado</a>`
        : `<span class="article-link disabled">Artigo relacionado indisponível</span>`));
  const inner = `
  <div class="id">${htmlEscape(card.id)} · ${htmlEscape(card.week)}</div>
  <div class="title">${htmlEscape(card.title)}</div>
  <div class="sub">Status: ${htmlEscape(card.status)}</div>
  <div class="meta-grid">
    ${renderMetadata(card)}
  </div>
  <div class="card-actions">
    ${previewLinkMarkup}
    ${articleLinkMarkup}
  </div>`;

  return card.href
    ? `
<div class="card">
${inner}
</div>`
    : `
<div class="card disabled" aria-disabled="true">
${inner}
</div>`;
};

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Hub · ${htmlEscape(client)} · Canonical</title>
  <style>
    :root{
      --bg:#f8fafc;
      --card:#ffffff;
      --card-border:#e2e8f0;
      --accent:#b48a1d; /* Dourado mais profundo para contraste no claro */
      --text:#0f172a;
      --muted:#64748b;
      --line:#cbd5e1;
      --ok:#16a34a;
      --warn:#d97706;
      --blog-accent:#2563eb;
      --social-accent:#7c3aed;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);font-family:inter,system-ui,-apple-system,sans-serif;line-height:1.5}
    .wrap{max-width:1400px;margin:40px auto;padding:0 24px}
    
    header{margin-bottom:32px;border-bottom:2px solid var(--accent);padding-bottom:24px}
    h1{margin:0;font-size:2.2rem;color:var(--text);letter-spacing:-0.03em;font-weight:800}
    .header-meta{display:flex;gap:12px;margin-top:12px;align-items:center}
    
    .badge{font:700 10px/1 sans-serif;border-radius:4px;padding:5px 10px;text-transform:uppercase;letter-spacing:0.05em;background:#f1f5f9;color:var(--muted);border:1px solid var(--card-border)}
    .badge.premium{background:var(--accent);color:#fff;border-color:var(--accent)}
    .badge.blog{background:var(--blog-accent);color:#fff;border-color:var(--blog-accent)}
    .badge.social{background:var(--social-accent);color:#fff;border-color:var(--social-accent)}
    
    .campaign-group{background:var(--card);border:1px solid var(--card-border);border-radius:20px;margin-bottom:40px;overflow:hidden;box-shadow:var(--shadow)}
    .campaign-header{padding:24px 30px;background:#fdfdfd;border-bottom:1px solid var(--card-border);display:flex;justify-content:space-between;align-items:center}
    .campaign-header h2{margin:0;font-size:1.3rem;font-weight:800;color:var(--text)}
    
    .campaign-body{padding:30px}
    
    .social-row{display:flex;gap:20px;overflow-x:auto;padding-bottom:12px;margin-top:24px}
    .social-row::-webkit-scrollbar{height:8px}
    .social-row::-webkit-scrollbar-thumb{background:var(--line);border-radius:10px}

    .card{min-width:320px;background:#fff;border:1px solid var(--card-border);border-radius:14px;padding:20px;position:relative;transition:all 0.3s ease;box-shadow:0 2px 4px rgba(0,0,0,0.02)}
    .card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 12px 20px rgba(0,0,0,0.05)}
    .card.blog-main{min-width:100%;background:#fcfcfc;border-left:4px solid var(--blog-accent)}
    
    .card-id{font-size:11px;font-weight:800;color:var(--muted);margin-bottom:6px;display:flex;justify-content:space-between;text-transform:uppercase}
    .card-title{font-size:1.1rem;font-weight:700;margin-bottom:14px;color:var(--text)}
    
    .tag-cloud{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
    .tag{font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;background:#f8fafc;color:var(--muted);border:1px solid var(--card-border)}
    .tag.status-ok{background:#f0fdf4;color:#16a34a;border-color:#bcf0da}
    .tag.status-warn{background:#fffbeb;color:#d97706;border-color:#fde68a}
    
    .card-actions{display:flex;gap:10px}
    .btn{flex:1;text-align:center;padding:10px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;transition:0.2s;cursor:pointer;border:none;display:inline-block}
    .btn-primary{background:var(--text);color:#fff}
    .btn-primary:hover{background:var(--accent)}
    .btn-outline{background:#fff;color:var(--text);border:1px solid var(--line)}
    .btn-outline:hover{border-color:var(--accent);color:var(--accent)}

    /* Modal System */
    .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.8);display:none;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);padding:40px}
    .modal-content{width:100%;max-width:1200px;height:100%;background:#fff;border-radius:24px;overflow:hidden;position:relative;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}
    .modal-header{padding:16px 24px;border-bottom:1px solid var(--card-border);display:flex;justify-content:space-between;align-items:center;background:#fff}
    .modal-close{cursor:pointer;background:#f1f5f9;border:none;border-radius:50%;width:36px;height:36px;font-size:20px;display:flex;align-items:center;justify-content:center;transition:0.2s}
    .modal-close:hover{background:var(--accent);color:#fff}
    .modal-iframe{flex:1;border:none;width:100%;height:100%}

    .empty-state{color:var(--muted);font-style:italic;font-size:0.95rem;background:#f1f5f9;padding:20px;border-radius:12px;text-align:center}
    footer{margin-top:60px;padding:40px 0;border-top:1px solid var(--card-border);color:var(--muted);font-size:0.85rem;text-align:center}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Campaign Hub · ${htmlEscape(client)}</h1>
      <div class="header-meta">
        <span class="badge premium">Premium Light v2.1</span>
        <span class="badge">Review: ${htmlEscape(verdict)}</span>
        <span class="badge">AmiClube Exclusive</span>
      </div>
    </header>

    <main>
      ${blogCards.map(blog => {
        const children = socialCards.filter(s => s.parent === blog.id);
        return `
        <section class="campaign-group">
          <div class="campaign-header">
            <h2>Linhagem: ${htmlEscape(blog.title)}</h2>
            <span class="badge blog">Artigo Principal</span>
          </div>
          <div class="campaign-body">
            <div class="card blog-main">
              <div class="card-id"><span>${htmlEscape(blog.id)}</span> <span>${htmlEscape(blog.week)}</span></div>
              <div class="card-title" style="-webkit-line-clamp:1">${htmlEscape(blog.title)}</div>
              <div class="tag-cloud">
                <span class="tag status-ok">${htmlEscape(blog.status)}</span>
                <span class="tag">${htmlEscape(blog.category)}</span>
                <span class="tag">${htmlEscape(blog.objective)}</span>
                <span class="tag">Owner: ${htmlEscape(blog.owner)}</span>
              </div>
              <div class="card-actions">
                ${blog.href ? `<button onclick="openModal('${htmlEscape(blog.href)}', '${htmlEscape(blog.title)}')" class="btn btn-primary">Revisar Artigo</button>` : `<span class="btn btn-outline disabled">Aguardando Draft</span>`}
                ${blog.href ? `<a href="${htmlEscape(blog.href)}" target="_blank" class="btn btn-outline" style="flex:0; padding:10px 15px">↗</a>` : ""}
              </div>
            </div>

            <div class="social-row">
              ${children.length > 0 ? children.map(social => `
                <div class="card">
                  <div class="card-id"><span>${htmlEscape(social.id)}</span> <span>${htmlEscape(social.week)}</span></div>
                  <div class="card-title">${htmlEscape(social.title)}</div>
                  <div class="tag-cloud">
                    <span class="tag social">${htmlEscape(social.channel)} · ${htmlEscape(social.type)}</span>
                    <span class="tag status-warn">${htmlEscape(social.status)}</span>
                  </div>
                  <div class="card-actions">
                    ${social.href ? `<button onclick="openModal('${htmlEscape(social.href)}', '${htmlEscape(social.title)}')" class="btn btn-outline">Preview</button>` : `<span class="btn btn-outline disabled">Pendente</span>`}
                    ${social.articleLinkHref ? `<a href="${htmlEscape(social.articleLinkHref)}" class="btn btn-outline" target="_blank" title="Ver Artigo">🔗</a>` : ""}
                  </div>
                </div>
              `).join('') : '<div class="empty-state">Nenhum derivado social planejado para este artigo.</div>'}
            </div>
          </div>
        </section>
        `;
      }).join('\n')}

      ${(() => {
        const orphans = socialCards.filter(s => s.parent === "-" || !blogCards.find(b => b.id === s.parent));
        if (orphans.length === 0) return "";
        return `
        <section class="campaign-group" style="border-top: 4px solid var(--social-accent)">
          <div class="campaign-header">
            <h2>Posts Sociais Avulsos / Ofertas</h2>
            <span class="badge social">Standalone</span>
          </div>
          <div class="campaign-body">
            <div class="social-row">
              ${orphans.map(social => `
                <div class="card">
                  <div class="card-id"><span>${htmlEscape(social.id)}</span> <span>${htmlEscape(social.week)}</span></div>
                  <div class="card-title">${htmlEscape(social.title)}</div>
                  <div class="tag-cloud">
                    <span class="tag social">${htmlEscape(social.channel)} · ${htmlEscape(social.type)}</span>
                    <span class="tag status-warn">${htmlEscape(social.status)}</span>
                  </div>
                  <div class="card-actions">
                    ${social.href ? `<button onclick="openModal('${htmlEscape(social.href)}', '${htmlEscape(social.title)}')" class="btn btn-outline">Preview</button>` : `<span class="btn btn-outline disabled">Pendente</span>`}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
        `;
      })()}
    </main>

    <footer>
      Design Premium Light · social-growth · amiclube-hub-renderer
    </footer>
  </div>

  <!-- Popup Modal -->
  <div id="previewModal" class="modal-overlay" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div style="font-weight:800; color:var(--text)" id="modalTitle">Preview</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <iframe id="previewIframe" class="modal-iframe"></iframe>
    </div>
  </div>

  <script>
    function openModal(url, title) {
      document.getElementById('previewIframe').src = url;
      document.getElementById('modalTitle').innerText = title;
      document.getElementById('previewModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      document.getElementById('previewModal').style.display = 'none';
      document.getElementById('previewIframe').src = '';
      document.body.style.overflow = 'auto';
    }
    // Fechar no ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>
`;

fs.mkdirSync(reviewDir, { recursive: true });
fs.writeFileSync(hubPath, html, "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      client,
      hubPath: path.relative(root, hubPath),
      manifestPath: path.relative(root, manifestPath),
      blogCards: blogCards.length,
      socialCards: socialCards.length,
      socialPublishableCards: socialPublishableCards.length,
      socialExpansionCards: socialExpansionCards.length,
      verdict,
    },
    null,
    2,
  ),
);
