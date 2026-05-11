#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");
const slug = readArg("slug", "blog-post");
const postArg = readArg("post");
const assetIdArg = readArg("asset-id");

if (!client) {
  console.error(
    "Usage: node render-blog-preview-canonical.mjs --client <client-slug> [--slug <slug>] [--post <path>] [--asset-id <AC-XX-YY>]",
  );
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const blogDir = path.join(clientDir, "blog");
const postPath = postArg ? path.resolve(root, postArg) : path.join(blogDir, "blog-post.md");
const previewDir = path.join(blogDir, "previews");
const previewPath = path.join(previewDir, `${slug}.html`);
const buildId = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
const buildDir = path.join(blogDir, "builds", buildId);
const buildPath = path.join(buildDir, `${slug}.html`);
const manifestPath = path.join(clientDir, "review", "campaign-manifest.json");

if (!fs.existsSync(postPath)) {
  console.error(`blog post not found: ${postPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(postPath, "utf8");

const getSection = (title) => {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = markdown.match(re);
  return match ? match[1].trim() : "";
};

const getLineValue = (block, label) => {
  const re = new RegExp(`-\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(.+)`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
};
const findLocalAssetPath = (text) => {
  const match = text.match(/(?:^|[\s`])(assets\/[A-Za-z0-9._/-]+)(?:$|[\s`])/m);
  return match ? match[1] : "";
};
const ensure = (condition, message) => {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
};
const containsForbiddenPlaceholder = (text) =>
  /\[imagem\s*:|prompt\s+para\s+gerar|gere\s+uma\s+imagem|imagem\s+conceitual|placeholder\s+de\s+imagem|midjourney|dall-e|stable\s+diffusion/i.test(
    text,
  );

const stripMd = (text) => text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
const esc = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const inlineMd = (text) => esc(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");

const renderMdBlock = (text) => {
  const lines = text.split(/\r?\n/);
  const out = [];
  let listMode = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listMode === "ul") out.push("</ul>");
    if (listMode === "ol") out.push("</ol>");
    listMode = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }
    if (/^####\s+/.test(line)) {
      flushParagraph();
      closeList();
      out.push(`<h3>${inlineMd(line.replace(/^####\s+/, "").replace(/^H3:\s*/i, ""))}</h3>`);
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushParagraph();
      closeList();
      out.push(`<h2>${inlineMd(line.replace(/^###\s+/, "").replace(/^H2:\s*/i, ""))}</h2>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (listMode !== "ol") {
        closeList();
        out.push("<ol>");
        listMode = "ol";
      }
      out.push(`<li>${inlineMd(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }
    if (/^- /.test(line)) {
      flushParagraph();
      if (listMode !== "ul") {
        closeList();
        out.push("<ul>");
        listMode = "ul";
      }
      out.push(`<li>${inlineMd(line.replace(/^- /, ""))}</li>`);
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return out.join("\n");
};

const topicIntent = getSection("Topic and Intent");
const titleTag = stripMd(getSection("Title Tag")).split(/\r?\n/)[0] || "Preview de Blog";
const metaDescription = stripMd(getSection("Meta Description")).split(/\r?\n/)[0] || "";
const h1 = stripMd(getSection("H1")).split(/\r?\n/)[0] || titleTag;
const cleanTitle = (h1 || titleTag).trim();
const intro = getSection("Intro");
const body = getSection("Body");
const faq = getSection("FAQ");
const conclusion = getSection("Conclusion");
const featuredImage = getSection("Featured Image");
const featuredImageSourceSearch = getSection("Featured Image Source Search");
const altText = getLineValue(featuredImage, "Alt text") || "Imagem de destaque do artigo";
ensure(featuredImage.length > 0, "missing `Featured Image` section");
ensure(featuredImageSourceSearch.length > 0, "missing `Featured Image Source Search` section");
ensure(!containsForbiddenPlaceholder(featuredImage), "featured image section contains placeholder/generative prompt language");
ensure(
  !containsForbiddenPlaceholder(featuredImageSourceSearch),
  "featured image source search contains placeholder/generative prompt language",
);
const sourcePage = getLineValue(featuredImageSourceSearch, "Source page");
const chosenSource = getLineValue(featuredImageSourceSearch, "Chosen source");
const licenseNote = getLineValue(featuredImageSourceSearch, "License note");
const licenseCheckDate = getLineValue(featuredImageSourceSearch, "License check date");
ensure(/^https?:\/\//i.test(sourcePage), "featured image source search must include real `Source page` URL");
ensure(chosenSource.length > 0, "featured image source search must include `Chosen source`");
ensure(licenseNote.length > 0, "featured image source search must include `License note`");
ensure(/\b\d{4}-\d{2}-\d{2}\b/.test(licenseCheckDate), "featured image source search must include valid `License check date`");
const imagePath =
  findLocalAssetPath(getLineValue(featuredImage, "Asset")) ||
  findLocalAssetPath(getLineValue(featuredImage, "Implementation note")) ||
  findLocalAssetPath(getLineValue(featuredImageSourceSearch, "Local asset path"));
ensure(imagePath.length > 0, "featured image must declare local asset path under `assets/`");
const absoluteImagePath = path.join(blogDir, imagePath);
ensure(fs.existsSync(absoluteImagePath), `featured image asset not found: ${absoluteImagePath}`);

const keyword = getLineValue(topicIntent, "Primary keyword") || "";
const intent = getLineValue(topicIntent, "Search intent") || "";
const derivedAssetId = (assetIdArg || slug || "").match(/(AC-\d{2}-\d{2}[a-z]?)/i)?.[1]?.toUpperCase() || null;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titleTag)} · Preview</title>
  <meta name="description" content="${esc(metaDescription)}">
  <style>
    :root{--bg:#f5f1ea;--paper:#fffdf8;--text:#2e261f;--muted:#6d6052;--accent:#9f4f2e;--line:#e7dccf}
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(circle at 10% 0%, #efe3d3 0%, #f5f1ea 40%, #f2ede4 100%);color:var(--text);font-family:Georgia,"Times New Roman",serif;line-height:1.75}
    .wrap{max-width:980px;margin:36px auto;padding:0 18px}
    article{background:var(--paper);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 18px 45px rgba(63,42,28,.08)}
    .hero{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
    .content{padding:34px 34px 40px}
    .eyebrow{font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
    h1{font-size:2.45rem;line-height:1.12;margin:10px 0 10px;color:#2a1f16}
    h2{font-size:1.45rem;margin:28px 0 10px;color:#3b2a1f}
    h3{font-size:1.15rem;margin:20px 0 8px;color:#4a3426}
    p,li{font-size:1.07rem;color:#3b3028}
    .meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
    .pill{font:600 12px/1.2 system-ui,sans-serif;padding:6px 10px;border-radius:999px;background:#f2e6d8;color:#6b3e2a;border:1px solid #e7d4c2}
    .section{margin-top:18px}
    .footer{margin-top:24px;font:500 12px/1.4 system-ui,sans-serif;color:var(--muted)}
    code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em}
  </style>
</head>
<body>
  <div class="wrap">
    <article>
      <img class="hero" src="../${esc(imagePath)}" alt="${esc(altText)}">
      <div class="content">
        <div class="eyebrow">${esc(client)} · preview canônico</div>
        <h1>${esc(h1)}</h1>
        <div class="meta">
          <span class="pill">Keyword: ${esc(keyword)}</span>
          <span class="pill">Intent: ${esc(intent)}</span>
        </div>
        <section class="section">
          ${renderMdBlock(intro)}
        </section>
        <section class="section">
          ${renderMdBlock(body)}
        </section>
        <section class="section">
          <h2>FAQ</h2>
          ${renderMdBlock(faq)}
        </section>
        <section class="section">
          <h2>Conclusão</h2>
          ${renderMdBlock(conclusion)}
        </section>
        <p class="footer">Renderizado automaticamente de <code>blog-post.md</code>. Atualizado em ${new Date()
          .toISOString()
          .slice(0, 10)}.</p>
      </div>
    </article>
  </div>
</body>
</html>`;

fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(buildDir, { recursive: true });
fs.writeFileSync(previewPath, html, "utf8");
fs.writeFileSync(buildPath, html, "utf8");

const relativeFromClient = (absolutePath) => path.relative(clientDir, absolutePath).split(path.sep).join("/");

let manifest = {
  version: "1.0.0",
  client,
  updatedAt: new Date().toISOString(),
  assets: {
    blog: [],
    social: [],
  },
};

if (fs.existsSync(manifestPath)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest = {
      version: parsed?.version || "1.0.0",
      client: parsed?.client || client,
      updatedAt: new Date().toISOString(),
      assets: {
        blog: Array.isArray(parsed?.assets?.blog) ? parsed.assets.blog : [],
        social: Array.isArray(parsed?.assets?.social) ? parsed.assets.social : [],
      },
    };
  } catch {
    manifest = {
      version: "1.0.0",
      client,
      updatedAt: new Date().toISOString(),
      assets: {
        blog: [],
        social: [],
      },
    };
  }
}

const blogAsset = {
  assetId: derivedAssetId || slug.toUpperCase(),
  slug,
  title: cleanTitle,
  status: "review",
  canonicalPreviewPath: relativeFromClient(previewPath),
  latestBuildPath: relativeFromClient(buildPath),
  sourcePostPath: path.relative(root, postPath).split(path.sep).join("/"),
  updatedAt: new Date().toISOString(),
};

const keyFor = (item) => (item?.assetId || "").toLowerCase();
const slugKeyFor = (item) => (item?.slug || "").toLowerCase();
const existingIndex = manifest.assets.blog.findIndex(
  (entry) => keyFor(entry) === keyFor(blogAsset) || slugKeyFor(entry) === slug.toLowerCase(),
);
if (existingIndex >= 0) {
  manifest.assets.blog[existingIndex] = {
    ...manifest.assets.blog[existingIndex],
    ...blogAsset,
  };
} else {
  manifest.assets.blog.push(blogAsset);
}
manifest.assets.blog = manifest.assets.blog.sort((a, b) => String(a.assetId).localeCompare(String(b.assetId)));

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const hubRender = spawnSync(
  process.execPath,
  [path.join(root, "squads", "social-growth", "scripts", "render-campaign-hub-canonical.mjs"), "--client", client],
  { encoding: "utf8" },
);
if (hubRender.status !== 0) {
  console.error(hubRender.stderr || hubRender.stdout || "failed to refresh campaign hub");
  process.exit(hubRender.status || 1);
}
let hubResult = null;
try {
  hubResult = JSON.parse(hubRender.stdout || "{}");
} catch {
  hubResult = null;
}

const visibleWords = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .split(/\s+/)
  .filter(Boolean).length;

console.log(
  JSON.stringify(
    {
      ok: true,
      client,
      postPath: path.relative(root, postPath),
      previewPath: path.relative(root, previewPath),
      buildPath: path.relative(root, buildPath),
      manifestPath: path.relative(root, manifestPath),
      campaignHubPath: hubResult?.hubPath ?? `squads/social-growth/output/${client}/review/campaign-hub.html`,
      assetId: blogAsset.assetId,
      visibleWords,
      image: imagePath,
      sourcePage,
    },
    null,
    2,
  ),
);
