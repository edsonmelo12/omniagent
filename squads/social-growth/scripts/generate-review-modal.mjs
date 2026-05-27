#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(rootDir, "..", "..");

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function readDraftCaptionFallback(client, assetId) {
  const draftDir = path.join(rootDir, "output", client, "social", "drafts");
  const previewDir = path.join(rootDir, "output", client, "social", "previews");
  const stripHtmlTags = (value) => String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!fs.existsSync(draftDir)) {
    return readPreviewCaptionFallback(previewDir, assetId, stripHtmlTags);
  }

  const target = String(assetId || "").trim().toLowerCase();
  const draftFile = fs.readdirSync(draftDir).find((name) => {
    const lower = name.toLowerCase();
    return lower.startsWith(target) && lower.endsWith(".md");
  });
  if (!draftFile) {
    return { finalCaption: "", hashtags: [] };
  }

  const content = fs.readFileSync(path.join(draftDir, draftFile), "utf8");
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s+Caption\b/i.test(line));
  if (start < 0) {
    return { finalCaption: "", hashtags: [] };
  }

  const captionLines = [];
  const hashtags = [];
  let inCaption = false;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^---\s*$/.test(line) || /^##\s+Visual Brief\b/i.test(line)) break;
    if (!inCaption && !line.trim()) continue;
    inCaption = true;
    const trimmed = line.trim();
    if (!trimmed) {
      captionLines.push("");
      continue;
    }
    if (/^#\S/.test(trimmed)) {
      hashtags.push(...trimmed.split(/\s+/).filter((token) => token.startsWith("#")));
      continue;
    }
    captionLines.push(trimmed);
  }

  const finalCaption = captionLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (finalCaption) return { finalCaption, hashtags };
  return readPreviewCaptionFallback(previewDir, assetId, stripHtmlTags);
}

function readPreviewCaptionFallback(previewDir, assetId, stripHtmlTags) {
  if (!fs.existsSync(previewDir)) {
    return { finalCaption: "", hashtags: [] };
  }

  const target = String(assetId || "").trim().toLowerCase();
  const candidates = fs.readdirSync(previewDir)
    .filter((name) => name.toLowerCase().startsWith(target) && name.toLowerCase().endsWith(".html"))
    .sort((a, b) => {
      const score = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes("caption")) return 0;
        if (lower.includes("post-preview")) return 1;
        return 2;
      };
      return score(a) - score(b) || a.localeCompare(b);
    });

  for (const file of candidates) {
    const html = fs.readFileSync(path.join(previewDir, file), "utf8");
    const textMatch = html.match(/<(?:div|p|section|article)[^>]*class="[^"]*(?:caption-text|body-text|body)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p|section|article)>/i);
    const text = textMatch ? stripHtmlTags(textMatch[1]) : "";
    const hashtagMatch = html.match(/<(?:div|p|section|article)[^>]*class="[^"]*(?:hashtags|hashtags-row|chips)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p|section|article)>/i);
    const hashtags = hashtagMatch
      ? Array.from(new Set((stripHtmlTags(hashtagMatch[1]).match(/#\S+/g) || []).map((tag) => tag.trim()).filter(Boolean)))
      : [];
    if (text) {
      return { finalCaption: text, hashtags };
    }
  }

  return { finalCaption: "", hashtags: [] };
}

function readPreviewManifestFallback(client, assetId) {
  const previewDir = path.join(rootDir, "output", client, "social", "previews");
  if (!fs.existsSync(previewDir)) return null;

  const target = slug(assetId);
  const candidates = fs.readdirSync(previewDir)
    .filter((name) => name.toLowerCase().startsWith(target) && name.toLowerCase().endsWith("-manifest.json"))
    .sort((a, b) => {
      const score = (name) => (name.toLowerCase().includes("post-preview-manifest") ? 0 : 1);
      return score(a) - score(b) || a.localeCompare(b);
    });

  for (const file of candidates) {
    const data = readJson(path.join(previewDir, file));
    const exportedImages = Array.isArray(data?.exported_images) ? data.exported_images.filter(Boolean) : [];
    if (exportedImages.length === 0) continue;
    return {
      exported_images: exportedImages,
      channel: String(data?.channel || "").trim(),
      objective: String(data?.objective || "").trim(),
      title: String(data?.title || "").trim(),
    };
  }

  return null;
}

function normalizeStatus(status, hasRenderableContent) {
  const raw = String(status || "").trim();
  const lower = raw.toLowerCase();
  if (/(approved|aprovad)/i.test(lower)) return { label: "APROVADO", className: "approved" };
  if (/(blocked|bloquead|reprov)/i.test(lower)) return { label: "BLOQUEADO", className: "blocked" };
  if (/(review|revis|preview pronto)/i.test(lower) || hasRenderableContent) return { label: "EM REVISÃO", className: "review" };
  if (/(planejad|planned)/i.test(lower)) return { label: "PLANEJADO", className: "planned" };
  return { label: raw ? raw.toUpperCase() : "PLANEJADO", className: hasRenderableContent ? "review" : "planned" };
}

function toReviewRelativeUrl(outputPath, absolutePath) {
  return path.relative(path.dirname(outputPath), absolutePath).split(path.sep).join("/");
}

function resolveDimensions(asset, exportSource, images) {
  const channel = String(exportSource?.channel || asset?.channel || "").toLowerCase();
  const type = String(asset?.type || exportSource?.format || "").toLowerCase();
  if (type.includes("stories") || channel.includes("stories")) return "1080x1920";
  if (channel.includes("facebook") || type.includes("facebook")) return "1200x630";
  if (images.length > 1) return "1080x1350";
  return "1080x1350";
}

function generateReviewModal(client, assetId, outputDir) {
  const manifestPath = path.join(rootDir, "output", client, "review", "campaign-manifest.json");
  const assetsPath = path.join(rootDir, "output", client, "publishing", "social-publish-assets.json");
  const captionsPath = path.join(rootDir, "output", client, "publishing", "social-final-captions.json");
  const templatePath = path.join(rootDir, "design-system", "templates", "review-modal.hbs");

  const manifest = readJson(manifestPath);
  const assetsData = readJson(assetsPath);
  const captionsData = readJson(captionsPath);
  const template = fs.readFileSync(templatePath, "utf8");

  if (!manifest) {
    console.error("❌ manifest não encontrado");
    return;
  }

  const asset = manifest.assets.social.find(a => a.assetId === assetId);
  if (!asset) {
    console.error(`❌ Asset ${assetId} não encontrado no manifest`);
    return;
  }

  const exportData = assetsData?.exports?.find(e => e.asset_id === assetId) || readPreviewManifestFallback(client, assetId);
  const captionData = captionsData?.captions?.find(c => c.asset_id === assetId);
  const draftFallback = readDraftCaptionFallback(client, assetId);
  const outputPath = path.join(outputDir, `${assetId.toLowerCase()}-review-modal.html`);
  const exportFiles = Array.isArray(exportData?.files)
    ? exportData.files
    : Array.isArray(exportData?.exported_images)
      ? exportData.exported_images
      : [];

  const images = exportFiles.map((file, idx) => {
    const absolutePath = path.isAbsolute(file) ? file : path.resolve(workspaceRoot, file);
    return {
      index: String(idx + 1).padStart(2, "0"),
      url: toReviewRelativeUrl(outputPath, absolutePath)
    };
  });

  const caption = captionData?.final_caption || draftFallback.finalCaption || "Caption não disponível";
  const hashtagsSource = (captionData?.hashtags?.length ? captionData.hashtags : draftFallback.hashtags) || [];
  const hashtags = hashtagsSource
    .map((tag) => String(tag || "").trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");

  const statusInfo = normalizeStatus(asset.status, images.length > 0 || caption !== "Caption não disponível");
  const dimensions = resolveDimensions(asset, exportData, images);
  const previewTarget = asset.canonicalPreviewPath
    ? path.join(rootDir, "output", client, asset.canonicalPreviewPath)
    : "";

  const data = {
    asset_id: asset.assetId,
    version: asset.version || "v1",
    status: statusInfo.label,
    status_class: statusInfo.className,
    format: asset.type || "carrossel",
    channel: asset.channel || "Instagram",
    dimensions,
    images,
    caption,
    hashtags,
    article_url: asset.articleUrl || "",
    preview_url: previewTarget ? toReviewRelativeUrl(outputPath, previewTarget) : "",
    generated_at: new Date().toLocaleString("pt-BR")
  };

  const outputHtml = template
    .replace(/\{\{asset_id\}\}/g, data.asset_id)
    .replace(/\{\{version\}\}/g, data.version)
    .replace(/\{\{status\}\}/g, data.status)
    .replace(/\{\{status_class\}\}/g, data.status_class)
    .replace(/\{\{format\}\}/g, data.format)
    .replace(/\{\{channel\}\}/g, data.channel)
    .replace(/\{\{dimensions\}\}/g, data.dimensions)
    .replace(/\{\{caption\}\}/g, data.caption.replace(/</g, "&lt;").replace(/>/g, "&gt;"))
    .replace(/\{\{hashtags\}\}/g, data.hashtags)
    .replace(/\{\{article_url\}\}/g, data.article_url)
    .replace(/\{\{preview_url\}\}/g, data.preview_url)
    .replace(/\{\{generated_at\}\}/g, data.generated_at)
    .replace(/\{\{images\.length\}\}/g, data.images.length);

  const cond = (html, name, value) => {
    const regex = new RegExp(`\\{\\{#if ${name}\\}\\}\\s*([\\s\\S]*?)\\s*\\{\\{\\/if\\}\\}`, "g");
    return html.replace(regex, value ? "$1" : "");
  };

  const outputHtmlResolved = cond(cond(cond(outputHtml, "article_url", data.article_url), "preview_url", data.preview_url), "hashtags", data.hashtags);

  const imagesBlock = images.length ? images.map(img => `          <div class="gallery-item">
            <img src="${img.url}" alt="Slide ${img.index}" />
            <span class="slide-number">${img.index}</span>
          </div>`).join("\n") : `          <div class="gallery-empty">
            Nenhuma imagem exportada encontrada para este asset.
          </div>`;

  const outputHtmlFinal = outputHtmlResolved.replace(/\{\{#each images\}\}[\s\S]*?\{\{\/each\}\}/, imagesBlock);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, outputHtmlFinal, "utf8");

  console.log(`✅ Review gerado: ${outputPath}`);
  return outputPath;
}

const args = parseArgs(process.argv);
if (!args.client || !args.asset) {
  console.log("Uso: node generate-review-modal.mjs --client <client> --asset <asset_id>");
  console.log("Exemplo: node generate-review-modal.mjs --client amiclube --asset AC-30-31");
  process.exit(1);
}

const outputDir = args.out || path.join(rootDir, "output", args.client, "review");
generateReviewModal(args.client, args.asset.toUpperCase(), outputDir);
