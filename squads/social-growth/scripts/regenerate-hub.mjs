#!/usr/bin/env node
// Regenerates campaign-hub.html from campaign-manifest.json
// Usage: node regenerate-hub.mjs --client amiclube
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const clientIdx = args.indexOf("--client");
const client = clientIdx >= 0 ? args[clientIdx + 1] : null;
if (!client) {
  console.error("Usage: node regenerate-hub.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const reviewDir = path.join(root, "squads", "social-growth", "output", client, "review");
const manifestPath = path.join(reviewDir, "campaign-manifest.json");
const hubPath = path.join(reviewDir, "campaign-hub.html");

if (!fs.existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const socialAssets = (manifest.assets?.social || []).filter(a => a.assetId);
const blogAssets = (manifest.assets?.blog || []).filter(a => a.assetId);

function statusBadge(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s.includes("aprovado") || s.includes("approved") || s.includes("preview_ready")) {
    return `<span class="tag status-ok">${status}</span>`;
  }
  if (s.includes("revis") || s.includes("review")) {
    return `<span class="tag status-review">${status}</span>`;
  }
  if (s.includes("planej") || s.includes("planned")) {
    return `<span class="tag status-warn">${status}</span>`;
  }
  return `<span class="tag">${status}</span>`;
}

function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

// Build map: blogParentId → [social assets with that parent]
function buildSiblingMap() {
  const map = {};
  socialAssets.forEach(a => {
    const pid = a.blogParentId || "__none__";
    if (!map[pid]) map[pid] = [];
    map[pid].push(a);
  });
  return map;
}

const siblingMap = buildSiblingMap();

function getPreviewRelative(asset) {
  const cp = asset.canonicalPreviewPath || "";
  return cp;
}

function getPreviewBase(asset) {
  const cp = getPreviewRelative(asset);
  if (!cp) return "";
  return cp.includes("/blog/") ? "blog" : "social";
}

function siblingData(asset) {
  const pid = asset.blogParentId || "__none__";
  const siblings = siblingMap[pid] || [];
  return siblings
    .filter(s => s.canonicalPreviewPath && s.canonicalPreviewPath.length > 0)
    .map(s => ({
      id: s.assetId,
      title: s.title || s.plannedTitle || "",
      url: "../social/previews/" + escapeHtml(s.canonicalPreviewPath.split("/").pop()),
    }));
}

function socialCard(asset) {
  const previewPath = getPreviewRelative(asset);
  const previewBase = getPreviewBase(asset);
  const hasPreview = previewPath && previewPath.length > 0;
  const articleAsset = blogAssets.find(a => a.assetId === asset.blogParentId);
  const articleLink = articleAsset ? `../blog/previews/${(articleAsset.canonicalPreviewPath || "").split("/").pop()}` : "";
  const sibs = siblingData(asset);
  const sibsJson = escapeHtml(JSON.stringify(sibs));

  return `
                <div class="card" data-asset-id="${asset.assetId}" data-siblings="${sibsJson}">
                  <div class="card-id"><span>${escapeHtml(asset.assetId)}</span> <span>${escapeHtml(asset.weekLabel || "")}</span></div>
                  <div class="card-title">${escapeHtml(asset.title || asset.plannedTitle || "")}</div>
                  <div class="tag-cloud">
                    <span class="tag social">${escapeHtml(asset.channel || "")} · ${escapeHtml(asset.type || "")}</span>
                    ${statusBadge(asset.status)}
                  </div>
                  <div class="card-actions">
                    ${hasPreview
                      ? `<button onclick="openModal('../social/previews/${escapeHtml(previewPath.split("/").pop())}', '${escapeHtml(asset.title || "")}')" class="btn btn-outline">Preview</button>`
                      : `<button class="btn btn-outline" disabled style="opacity:0.5;cursor:default">Sem preview</button>`
                    }
                    ${asset.postPreviewPath
                      ? `<button onclick="openModal('../social/previews/${escapeHtml(asset.postPreviewPath.split("/").pop())}', '${escapeHtml(asset.title || "")} · Caption')" class="btn btn-outline" style="flex:0.6">Caption</button>`
                      : ""
                    }
                    ${articleLink
                      ? `<a href="${articleLink}" class="btn btn-outline" target="_blank" title="Ver Artigo">🔗</a>`
                      : ""
                    }
                  </div>
                  ${hasPreview ? `<div class="hub-link-badge">→ ${escapeHtml(previewPath)}</div>` : ""}
                </div>
              `;
}

function blogCard(asset) {
  const preview = asset.canonicalPreviewPath || "";
  const hasPreview = preview && preview.length > 0;

  return `
              <div class="card blog-main" data-asset-id="${asset.assetId}">
                <div class="card-id"><span>${escapeHtml(asset.assetId)}</span> <span>${escapeHtml(asset.weekLabel || "")}</span></div>
                <div class="card-title" style="-webkit-line-clamp:1">${escapeHtml(asset.title || asset.plannedTitle || "")}</div>
                <div class="tag-cloud">
                  ${statusBadge(asset.status)}
                  ${asset.wpCategory ? `<span class="tag">${escapeHtml(asset.wpCategory)}</span>` : ""}
                  ${asset.objective ? `<span class="tag">${escapeHtml(asset.objective)}</span>` : ""}
                  <span class="tag">Owner: ${escapeHtml(asset.phaseOwner || "-")}</span>
                </div>
                <div class="card-actions">
                  ${hasPreview
                    ? `<button onclick="openModal('../blog/previews/${escapeHtml(preview.split("/").pop())}', '${escapeHtml(asset.title || "")}')" class="btn btn-primary">Revisar Artigo</button>
                       <a href="../blog/previews/${escapeHtml(preview.split("/").pop())}" target="_blank" class="btn btn-outline" style="flex:0; padding:10px 15px">↗</a>`
                    : `<button class="btn btn-primary" disabled style="opacity:0.5;cursor:default">Aguardando</button>`
                  }
                </div>
              </div>
            `;
}

function groupByLinhagem() {
  const groups = {};
  socialAssets.forEach(a => {
    const linhagem = a.blogParentId || a.linhagem || "standalone";
    if (!groups[linhagem]) groups[linhagem] = [];
    groups[linhagem].push(a);
  });
  return groups;
}

const groups = groupByLinhagem();
let socialSectionsHtml = "";

for (const [parentId, children] of Object.entries(groups)) {
  if (parentId === "standalone") continue;
  const parentBlog = blogAssets.find(a => a.assetId === parentId);
  const blogTitle = parentBlog ? (parentBlog.title || parentBlog.plannedTitle || parentId) : `Linhagem: ${parentId}`;

  socialSectionsHtml += `
              <div class="card blog-main" data-asset-id="${parentId}">
                <div class="card-id"><span>${escapeHtml(parentId)}</span> <span>${escapeHtml(parentBlog?.weekLabel || "")}</span></div>
                <div class="card-title" style="-webkit-line-clamp:1">${escapeHtml(blogTitle)}</div>
                <div class="tag-cloud">
                  ${parentBlog ? statusBadge(parentBlog.status) : ""}
                  ${parentBlog?.wpCategory ? `<span class="tag">${escapeHtml(parentBlog.wpCategory)}</span>` : ""}
                  ${parentBlog?.objective ? `<span class="tag">${escapeHtml(parentBlog.objective)}</span>` : ""}
                  <span class="tag">Owner: ${escapeHtml(parentBlog?.phaseOwner || "-")}</span>
                </div>
                <div class="card-actions">
                  ${parentBlog?.canonicalPreviewPath
                    ? `<button onclick="openModal('../blog/previews/${escapeHtml(parentBlog.canonicalPreviewPath.split("/").pop())}', '${escapeHtml(blogTitle)}')" class="btn btn-primary">Revisar Artigo</button>
                       <a href="../blog/previews/${escapeHtml(parentBlog.canonicalPreviewPath.split("/").pop())}" target="_blank" class="btn btn-outline" style="flex:0; padding:10px 15px">↗</a>`
                    : `<button class="btn btn-primary" disabled style="opacity:0.5;cursor:default">Aguardando</button>`
                  }
                </div>
              </div>

              <div class="social-row">
                ${children.map(socialCard).join("")}
              </div>
            `;
}

const standalone = socialAssets.filter(a => !a.blogParentId && !a.linhagem);
if (standalone.length > 0) {
  socialSectionsHtml += `
              <div class="empty-state">Conteúdo Standalone</div>
              <div class="social-row">
                ${standalone.map(socialCard).join("")}
              </div>
            `;
}

const hubHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Hub · ${escapeHtml(client)} · Canonical</title>
  <style>
    :root{
      --bg:#f8fafc;
      --card:#ffffff;
      --card-border:#e2e8f0;
      --accent:#b48a1d;
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
    .tag.status-review{background:#fef3c7;color:#d97706;border-color:#fde68a}
    
    .card-actions{display:flex;gap:10px}
    .btn{flex:1;text-align:center;padding:10px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;transition:0.2s;cursor:pointer;border:none;display:inline-block}
    .btn-primary{background:var(--text);color:#fff}
    .btn-primary:hover{background:var(--accent)}
    .btn-outline{background:#fff;color:var(--text);border:1px solid var(--line)}
    .btn-outline:hover{border-color:var(--accent);color:var(--accent)}

    .hub-link-badge{font-size:9px;color:var(--muted);margin-top:6px;word-break:break-all;font-family:monospace}

    /* Modal System */
    .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.8);display:none;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);padding:40px}
    .modal-content{width:100%;max-width:1200px;height:100%;background:#fff;border-radius:24px;overflow:hidden;position:relative;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}
    .modal-header{padding:16px 24px;border-bottom:1px solid var(--card-border);display:flex;justify-content:space-between;align-items:center;background:#fff}
    .modal-close{cursor:pointer;background:#f1f5f9;border:none;border-radius:50%;width:36px;height:36px;font-size:20px;display:flex;align-items:center;justify-content:center;transition:0.2s}
    .modal-close:hover{background:var(--accent);color:#fff}
    .modal-nav{cursor:pointer;background:#f1f5f9;border:none;border-radius:50%;width:32px;height:32px;font-size:22px;display:flex;align-items:center;justify-content:center;transition:0.2s;line-height:1;padding:0}
    .modal-nav:hover{background:var(--accent);color:#fff}
    .modal-iframe{flex:1;border:none;width:100%;height:100%}

    .empty-state{color:var(--muted);font-style:italic;font-size:0.95rem;background:#f1f5f9;padding:20px;border-radius:12px;text-align:center}
    footer{margin-top:60px;padding:40px 0;border-top:1px solid var(--card-border);color:var(--muted);font-size:0.85rem;text-align:center}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Campaign Hub · ${escapeHtml(client)}</h1>
      <div class="header-meta">
        <span class="badge premium">Premium Light v2.1</span>
        <span class="badge">Review: PUBLISH</span>
        <span class="badge">${escapeHtml(client.charAt(0).toUpperCase() + client.slice(1))} Exclusive</span>
        <span class="badge">Gerado: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </header>

    <main>
      <section class="campaign-group">
        <div class="campaign-header">
          <h2>Assets</h2>
          <span class="badge">${socialAssets.length} social · ${blogAssets.length} blog</span>
        </div>
        <div class="campaign-body">
          ${socialSectionsHtml}
        </div>
      </section>
    </main>

    <footer>
      <p>Hub gerado automaticamente a partir do campaign-manifest.json · Regenerar após qualquer atualização de asset</p>
    </footer>
  </div>

    <!-- Modal -->
    <div id="preview-modal" class="modal-overlay" onclick="closeModal(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px">
            <button id="modal-prev" class="modal-nav" onclick="navigateSibling(-1)" title="Anterior">‹</button>
            <strong id="modal-title">Preview</strong>
            <button id="modal-next" class="modal-nav" onclick="navigateSibling(1)" title="Próximo">›</button>
          </div>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <iframe id="modal-iframe" class="modal-iframe"></iframe>
      </div>
    </div>

    <script>
      const HUB_BUILD = ${Date.now()};
      let _siblings = [];
      let _currentIdx = 0;

      function openModal(url, title) {
        const card = event && event.target ? event.target.closest("[data-siblings]") : null;
        if (card) {
          try {
            _siblings = JSON.parse(card.dataset.siblings || "[]");
            const idx = _siblings.findIndex(s => s.url === url || s.url.includes(url.split("?").shift()));
            _currentIdx = idx >= 0 ? idx : 0;
          } catch(e) { _siblings = []; _currentIdx = 0; }
        } else {
          _siblings = [];
          _currentIdx = 0;
        }
        updateNavButtons();
        document.getElementById("modal-title").textContent = title || "Preview";
        const sep = url.includes("?") ? "&" : "?";
        document.getElementById("modal-iframe").src = url + sep + "_b=" + HUB_BUILD;
        document.getElementById("preview-modal").style.display = "flex";
        document.body.style.overflow = "hidden";
      }

      function navigateSibling(dir) {
        if (!_siblings.length) return;
        _currentIdx = (_currentIdx + dir + _siblings.length) % _siblings.length;
        const sib = _siblings[_currentIdx];
        if (!sib) return;
        document.getElementById("modal-title").textContent = sib.title || "Preview";
        const sep = sib.url.includes("?") ? "&" : "?";
        document.getElementById("modal-iframe").src = sib.url + sep + "_b=" + HUB_BUILD;
        updateNavButtons();
      }

      function updateNavButtons() {
        const prev = document.getElementById("modal-prev");
        const next = document.getElementById("modal-next");
        prev.style.display = _siblings.length > 1 ? "" : "none";
        next.style.display = _siblings.length > 1 ? "" : "none";
      }

      function closeModal(e) {
        if (e && e.target !== e.currentTarget) return;
        document.getElementById("preview-modal").style.display = "none";
        document.getElementById("modal-iframe").src = "";
        document.body.style.overflow = "";
        _siblings = [];
      }
      document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeModal();
      });
    </script>
</body>
</html>`;

fs.writeFileSync(hubPath, hubHtml, "utf8");
console.log(`Hub regenerated: ${hubPath}`);
console.log(`  ${blogAssets.length} blog assets, ${socialAssets.length} social assets`);
