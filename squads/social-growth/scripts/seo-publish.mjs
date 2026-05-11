#!/usr/bin/env node
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

// ── Default config (fallback) ──
const DEFAULT_CONFIG = {
  wpUrl: "https://amiclube.com.br",
  wpUser: "edsonrmjunior",
  wpPass: "CoBy YZRb OjNf tUV3 I9sw Ma6Q",
  categoryMap: {
    "Blog": 5, "Compra e Conversão": 276,
    "Confiança e Reputação": 275, "Escolha e Ergonomia": 273,
    "Preço, Valor e Tendências": 274,
  },
};

// ── Load config from DB or file ──
function loadConfig(client) {
  if (!client) return DEFAULT_CONFIG;
  // Try database-backed resolution if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    try {
      const { Client } = require('pg');
      const dbClient = new Client({ connectionString: process.env.DATABASE_URL });
      dbClient.connectSync();
      const res = dbClient.querySync(
        `SELECT channel, provider, secret_ref
         FROM publishing_profiles
         WHERE client_id = (SELECT id FROM clients WHERE slug = $1)
         AND connection_status = 'active'`,
        [client]
      );
      dbClient.endSync();
      const wpProfile = res.rows.find(r => r.channel === 'wordpress' && r.provider === 'wordpress_api');
      if (wpProfile && wpProfile.secret_ref?.startsWith('env://')) {
        const varName = wpProfile.secret_ref.slice(6);
        const wpPass = process.env[varName];
        const urlVar = `WORDPRESS_URL`;
        const userVar = `WORDPRESS_USER`;
        if (process.env[urlVar] && process.env[userVar] && wpPass) {
          return {
            wpUrl: process.env[urlVar],
            wpUser: process.env[userVar],
            wpPass,
            categoryMap: DEFAULT_CONFIG.categoryMap,
          };
        }
      }
    } catch (dbErr) {
      console.warn("⚠️  Database lookup failed, falling back to file-based config:", dbErr.message);
    }
  }
  // Fallback to file-based config
  const altPath = path.join(process.cwd(), "squads", "social-growth", "pipeline", "data", `${client}-publishing-profile.md`);
  if (!fs.existsSync(altPath)) return DEFAULT_CONFIG;
  const c = fs.readFileSync(altPath, "utf-8");
  const url = (c.match(/Website URL:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpUrl).trim();
  const user = (c.match(/REST API User:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpUser).trim();
  const pass = (c.match(/Application Password:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpPass).trim();
  return { wpUrl: url, wpUser: user, wpPass: pass, categoryMap: DEFAULT_CONFIG.categoryMap };
}

const cliClient = process.argv.find(a => a.startsWith("--client="))?.split("=")[1];
const config = loadConfig(cliClient);
const WP_URL = config.wpUrl;
const WP_USER = config.wpUser;
const WP_APP_PASSWORD = config.wpPass;
const CATEGORY_MAP = config.categoryMap;

// ── HTTP request helper ──
function makeRequest(endpoint, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
    const isFormData = typeof data === "string" && data.includes("--");
    const options = {
      hostname: new URL(WP_URL).hostname,
      path: `/wp-json/wp/v2/${endpoint}`,
      method,
      headers: { "Authorization": `Basic ${auth}` },
    };
    if (data && !isFormData) {
      options.headers["Content-Type"] = "application/json";
    }
    const req = https.request(options, (res) => {
      let b = "";
      res.on("data", (c) => b += c);
      res.on("end", () => {
        try { resolve(JSON.parse(b)); } catch { resolve(b); }
      });
    });
    req.on("error", reject);
    if (data) {
      if (isFormData) {
        options.headers["Content-Type"] = "multipart/form-data; boundary=" + data.match(/--(.*?)\r?\n/)[1];
        options.headers["Content-Length"] = Buffer.byteLength(data);
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

function multipart(fields) {
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).slice(2);
  let body = "";
  for (const [k, v] of Object.entries(fields)) {
    if (v.file && v.filename) {
      const data = require("fs").readFileSync(v.file);
      body += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"; filename="${v.filename}"\r\nContent-Type: ${v.type || "application/octet-stream"}\r\n\r\n${data}\r\n`;
    } else {
      body += `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
    }
  }
  body += `--${boundary}--\r\n`;
  return { body, boundary };
}

// ── Publish function (2-step) ──
async function publishPost(postId, { title, slug, content, status, date, featured_media, date_gmt, focuskw, seoTitle, metadesc, categories }) {
  if (!categories || categories.length === 0) {
    console.log(`❌ Rejeitado: categories é obrigatório`);
    return null;
  }
  const catNames = categories.map(id => Object.keys(CATEGORY_MAP).find(k => CATEGORY_MAP[k] === id) || id).join(", ");

  // Step 1: create or update post
  if (!postId) {
    console.log(`\n📤 Criando post: "${title}"`);
    const createData = {
      title, slug, content,
      status: status || "future",
      featured_media, categories,
    };
    if (date) createData.date = date;
    if (date_gmt) createData.date_gmt = date_gmt;
    const created = await makeRequest("posts", "POST", createData);
    if (!created.id) {
      console.log(`❌ Erro na criação: ${created.message || JSON.stringify(created)}`);
      return null;
    }
    postId = created.id;
    console.log(`   🔔 Post ${postId} criado`);
  }

  // Step 2: update with Yoast SEO fields
  console.log(`\n📤 Aplicando SEO no post ${postId}: "${title}"`);
  const seoData = {
    yoast_head_json: {
      focuskw,
      title: seoTitle,
      metadesc,
    },
  };
  const result = await makeRequest(`posts/${postId}`, "POST", seoData);

  if (result.id) {
    console.log(`✅ Post ${postId} concluído!`);
    console.log(`   📝 Focus KW: ${focuskw}`);
    console.log(`   🔗 Slug: ${result.slug || slug}`);
    console.log(`   📅 Data: ${result.date}`);
    console.log(`   🖼️  Featured: ${result.featured_media || featured_media}`);
    console.log(`   🏷️  Categorias: ${catNames}`);
    console.log(`   🔗 URL: ${result.link}`);
  } else {
    console.log(`❌ Erro: ${result.message || JSON.stringify(result)}`);
  }
  return result;
}

// ── Validator helper ──
async function runValidator(postId, postTitle) {
  try {
    const { execSync } = await import("node:child_process");
    const scriptsDir = new URL(".", import.meta.url).pathname;
    const decodedDir = scriptsDir.replace(/%20/g, " ");
    // Pass client so validator can read from DB
    const result = execSync(
      `node "${decodedDir}post-publish-validator.mjs" --client ${cliClient} --post-id ${postId} --fix --silent`,
      { encoding: "utf-8", timeout: 30000, cwd: decodedDir }
    );
    const lines = result.trim().split("\n").filter(l =>
      l.startsWith("   🔧") ||
      l.match(/✅ Post \d+ atualizado/) ||
      l.match(/Score|Atenção|Aprovado|Rejeitado/)
    );
    if (lines.length > 0) {
      console.log(`   🔍 ${lines[lines.length - 1].trim()}`);
      const hasRejeitado = lines.some(l => l.includes("Rejeitado"));
      if (hasRejeitado) {
        console.log(`   ⚠️  Revisão manual recomendada`);
      }
    }
  } catch (e) {
    // silently ignore
  }
}

// ── Parse schedule-plan.md and extract posts for a given week ──
function parseSchedulePlan(schedulePath, weekFilter = null) {
  if (!fs.existsSync(schedulePath)) {
    console.error(`❌ Schedule plan not found: ${schedulePath}`);
    return [];
  }
  const content = fs.readFileSync(schedulePath, "utf-8");
  const posts = [];
  
  // Extract Blog section
  const blogSection = content.match(/## Agendamento Blog[\s\S]*?(?=\n## |\n---|$)/)?.[0];
  if (!blogSection) return posts;

  // Parse table rows (skip header)
  const rows = blogSection.split("\n").filter(l => l.trim().startsWith("|") && !l.includes("Data | Ativo"));
  for (const row of rows) {
    const cols = row.split("|").map(c => c.trim()).filter(c => c);
    if (cols.length < 4) continue;
    const [data, ativo, titulo, horario, status] = cols;
    
    // Skip if not preview_ready or review
    if (!["✅ preview_ready", "🔄 review"].some(s => status?.includes(s))) continue;

    // Extract week from date (assuming format DD/MM/YYYY)
    const [day, month] = data.split("/").map(Number);
    const weekNum = month === 4 ? 2 : month === 5 ? 3 : null;
    if (weekFilter && weekNum !== weekFilter) continue;

    posts.push({
      ativo,
      titulo,
      data: data.trim(),
      horario: horario?.replace("✅ preview_ready", "").replace("🔄 review", "").trim(),
      status: status?.trim(),
    });
  }
  return posts;
}

// ── CLI argument parser ──
function parseArgs() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx === -1 ? null : args[idx + 1] ?? null;
  };
  const hasFlag = (name) => args.includes(name);

  return {
    client: getArg("--client=")?.split("=")[1] || getArg("--client"),
    schedulePlan: getArg("--schedule-plan"),
    week: getArg("--week") ? parseInt(getArg("--week")) : null,
    onlyUnpublished: hasFlag("--only-unpublished"),
    draft: getArg("--draft"),
    postId: getArg("--post-id") ? parseInt(getArg("--post-id")) : null,
    title: getArg("--title"),
    slug: getArg("--slug"),
    contentFile: getArg("--content-file"),
    date: getArg("--date"),
    dateGmt: getArg("--date-gmt"),
    imageId: getArg("--image-id") ? parseInt(getArg("--image-id")) : null,
    focuskw: getArg("--focuskw"),
    seoTitle: getArg("--seo-title"),
    metadesc: getArg("--metadesc"),
    categories: getArg("--categories")?.split(",").map(Number),
  };
}

// ── Main execution ──
const params = parseArgs();

(async () => {
  // Mode 1: Schedule plan mode
  if (params.schedulePlan) {
    const weekFilter = params.week;
    console.log(`📅 Lendo schedule plan: ${params.schedulePlan}`);
    if (weekFilter) console.log(`   Filtrando semana: ${weekFilter}`);
    
    const posts = parseSchedulePlan(params.schedulePlan, weekFilter);
    console.log(`   Posts encontrados: ${posts.length}`);
    
    for (const post of posts) {
      console.log(`\n📌 Processando: ${post.ativo} - ${post.titulo}`);
      // Here you would read the corresponding blog-post.md and extract data
      // For now, we'll skip since we need the actual content
      console.log(`   ⚠️  Modo schedule-plan requer implementação adicional para ler blog-post.md`);
    }
    console.log("\n🎯 Sessão completa!");
    return;
  }

  // Mode 2: Draft mode
  if (params.draft) {
    const draftFile = params.draft;
    const existingPostId = params.postId;
    console.log(`📤 Publicando draft: ${draftFile}`);
    
    const draftContent = fs.readFileSync(draftFile, "utf-8");
    const getField = (name) => draftContent.match(new RegExp(`## ${name}\\s*\\n\\s*(.+?)\\s*(?:\\n|$)`))?.[1]?.trim();
    const getMultiline = (name) => {
      const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
      return (draftContent.match(re)?.[1] || "").trim();
    };
    
    const titleTag = getField("Title Tag") || "";
    const metaDesc = getField("Meta Description") || "";
    const h1 = getField("H1") || "";
    const intro = getMultiline("Intro");
    const body = getMultiline("Body");
    const keyword = getField("Primary keyword") || "";
    const categories = [CATEGORY_MAP["Blog"]];
    
    // Sanitize title: strip " | Brand" suffix for WordPress post title
    // Keep full Title Tag for seoTitle
    const cleanTitle = titleTag.replace(/\s*\|\s*.+$/, "").trim();
    const seoTitle = titleTag;
    
    // Build content: ensure H1 is present exactly once at the top
    let bodyContent = `${intro}\n${body}`;
    // Remove any leading <h1>...</h1> from the combined content
    bodyContent = bodyContent.replace(/^\s*<h1>[\s\S]*?<\/h1>\s*/i, "");
    // Now prepend the clean H1
    bodyContent = `<h1>${h1}</h1>\n` + bodyContent;
    
    const postData = {
      postId: existingPostId,
      title: cleanTitle || h1,
      slug: titleTag ? titleTag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : undefined,
      seoTitle: seoTitle,
      status: "future",
      date: undefined,
      date_gmt: undefined,
      featured_media: params.imageId || undefined,
      focuskw: keyword,
      metadesc: metaDesc,
      categories,
      content: bodyContent,
    };
    Object.keys(postData).forEach(k => postData[k] === undefined && delete postData[k]);
    
    const result = await publishPost(postData.postId, postData);
    if (result?.id) {
      await runValidator(result.id, postData.title);
    }
    return;
  }

  // Mode 3: Direct CLI parameters
  if (params.title) {
    const postData = {
      postId: params.postId,
      title: params.title,
      slug: params.slug,
      status: "future",
      date: params.date,
      date_gmt: params.dateGmt,
      featured_media: params.imageId,
      focuskw: params.focuskw,
      seoTitle: params.seoTitle,
      metadesc: params.metadesc,
      categories: params.categories || [CATEGORY_MAP["Blog"]],
      content: params.contentFile ? fs.readFileSync(params.contentFile, "utf-8") : null,
    };
    Object.keys(postData).forEach(k => postData[k] === undefined && delete postData[k]);
    
    const result = await publishPost(postData.postId, postData);
    if (result?.id) {
      await runValidator(result.id, postData.title);
    }
    return;
  }

  // Help
  console.log(`
Uso: node seo-publish.mjs [modo] [opções]

Modos:
  --schedule-plan <arquivo>  Ler schedule plan e publicar posts
  --draft <arquivo.md>      Publicar a partir de draft Markdown
  --title <titulo>             Publicar com parâmetros diretos

Opções comuns:
  --client <nome>               Cliente (amiclube)
  --post-id <N>                 ID do post existente (para atualizar)
  --week <N>                    Filtrar por semana (1, 2, 3...)
  --only-unpublished             Pular posts já existentes

Opções para --title:
  --slug <slug>                Slug do post
  --date <ISO>                  Data (ex: 2026-05-05T08:00:00)
  --date-gmt <ISO>              Data GMT
  --image-id <N>               ID da imagem destacada
  --focuskw <keyword>           Focus keyword
  --seo-title <titulo>         SEO title
  --metadesc <texto>           Meta description
  --categories <ids>            IDs separados por vírgula
  --content-file <arquivo>       Arquivo com conteúdo HTML
`);
})();
