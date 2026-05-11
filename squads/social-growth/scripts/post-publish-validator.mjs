#!/usr/bin/env node
/**
 * post-publish-validator.mjs — safety net de última milha
 *
 * CRÍTICO (auto-fix imediato): título SEO, meta description, slug, categoria, keyword no título/desc
 * INFORMATIVO (apenas reporta): links externos, imagens com alt, transições, links internos
 *
 * Uso: node post-publish-validator.mjs --post-id <id> [--fix] [--client=nome]
 *       node post-publish-validator.mjs --post-id <id> --fix --silent  (modo integrado)
 */

import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_CONFIG = {
  wpUrl: "[PENDENTE]",
  wpUser: "[PENDENTE]",
  wpPass: "[PENDENTE]",
  categoryMap: { "Blog": 1 },
};

async function loadConfig(client) {
  // First try database-backed resolution (same as resolve-client-secrets.mjs)
  if (client && process.env.DATABASE_URL) {
    try {
      const pgModule = await import("pg").catch(() => null);
      if (pgModule) {
        const dbClient = new pgModule.Client({ connectionString: process.env.DATABASE_URL });
        await dbClient.connect();
        const res = await dbClient.query(
          `SELECT channel, provider, secret_ref
           FROM publishing_profiles
           WHERE client_id = (SELECT id FROM clients WHERE slug = $1)
           AND connection_status = 'active'`,
          [client]
        );
        await dbClient.end();
        const wpProfile = res.rows.find(r => r.channel === 'wordpress' && r.provider === 'wordpress_api');
        if (wpProfile && wpProfile.secret_ref?.startsWith('env://')) {
          const varName = wpProfile.secret_ref.slice(6);
          const wpPass = process.env[varName];
          // Also resolve WP_URL and WP_USER from env (or from a similar pattern)
          const urlVar = `WORDPRESS_URL`;
          const userVar = `WORDPRESS_USER`;
          if (process.env[urlVar] && process.env[userVar] && wpPass) {
            return {
              wpUrl: process.env[urlVar],
              wpUser: process.env[userVar],
              wpPass,
              categoryMap: { "Blog": 5 },
            };
          }
        }
      }
    } catch (dbErr) {
      console.warn("⚠️ Database lookup failed, falling back to file-based config:", dbErr.message);
    }
  }
  // Fallback to file-based config
  if (!client) return DEFAULT_CONFIG;
  const altPath = path.join(process.cwd(), "squads", "social-growth", "pipeline", "data", `${client}-publishing-profile.md`);
  if (!fs.existsSync(altPath)) return DEFAULT_CONFIG;
  const c = fs.readFileSync(altPath, "utf-8");
  // Parse WordPress connection (strip markdown bold markers)
  const wpUrl = (c.match(/Website URL:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpUrl).trim();
  const wpUser = (c.match(/REST API User:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpUser).trim();
  const wpPass = (c.match(/Application Password:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpPass).trim();
  // Parse category map if present (format: "CategoryName: ID")
  const catLines = c.match(/^-\s*\*\*Category Map:\*\*\s*(.+)$/im)
    ? c.match(/^-\s*\*\*Category Map:\*\*\s*(.+)$/im)[1].split(",").map(s => s.trim())
    : [];
  const fallbackCatId = parseInt(c.match(/Default Category ID:\s*(\d+)/)?.[1]) || DEFAULT_CONFIG.categoryMap["Blog"];
  const categoryMap = catLines.length > 0
    ? Object.fromEntries(catLines.map(e => { const [k,v] = e.split(":").map(s => s.trim()); return [k, parseInt(v)]; }))
    : { "Blog": fallbackCatId };
  return { wpUrl, wpUser, wpPass, categoryMap };
}

const getArg = (name) => {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? null : process.argv[idx + 1] ?? null;
};
const cliClient = getArg("--client") || process.argv.find(a => a.startsWith("--client="))?.split("=")[1];

// Async bootstrap to load config from DB or file
async function bootstrap() {
  if (cliClient && process.env.DATABASE_URL) {
    try {
      const pgModule = await import("pg").catch(() => null);
      if (pgModule) {
        const dbClient = new pgModule.Client({ connectionString: process.env.DATABASE_URL });
        await dbClient.connect();
        const res = await dbClient.query(
          `SELECT channel, provider, secret_ref
           FROM publishing_profiles
           WHERE client_id = (SELECT id FROM clients WHERE slug = $1)
           AND connection_status = 'active'`,
          [cliClient]
        );
        await dbClient.end();
        const wpProfile = res.rows.find(r => r.channel === 'wordpress' && r.provider === 'wordpress_api');
        if (wpProfile && wpProfile.secret_ref?.startsWith('env://')) {
          const varName = wpProfile.secret_ref.slice(6);
          const wpPass = process.env[varName];
          // Also resolve WP_URL and WP_USER from env
          const urlVar = `WORDPRESS_URL`;
          const userVar = `WORDPRESS_USER`;
          if (process.env[urlVar] && process.env[userVar] && wpPass) {
            return {
              wpUrl: process.env[urlVar],
              wpUser: process.env[userVar],
              wpPass,
              categoryMap: { "Blog": 5 },
            };
          }
        }
      }
    } catch (dbErr) {
      console.warn("⚠️ Database lookup failed, falling back to file-based config:", dbErr.message);
    }
  }
  // Fallback to file-based config
  if (!cliClient) return DEFAULT_CONFIG;
  const altPath = path.join(process.cwd(), "squads", "social-growth", "pipeline", "data", `${cliClient}-publishing-profile.md`);
  if (!fs.existsSync(altPath)) return DEFAULT_CONFIG;
  const c = fs.readFileSync(altPath, "utf-8");
  const wpUrl = (c.match(/Website URL:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpUrl).trim();
  const wpUser = (c.match(/REST API User:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpUser).trim();
  const wpPass = (c.match(/Application Password:\s*\**\s*(.+?)\s*\**\s*$/m)?.[1] || DEFAULT_CONFIG.wpPass).trim();
  return { wpUrl, wpUser, wpPass, categoryMap: DEFAULT_CONFIG.categoryMap };
}

const { wpUrl: WP_URL, wpUser: WP_USER, wpPass: WP_APP_PASSWORD, categoryMap: CATEGORY_MAP } = await bootstrap();

const TRANSITION_WORDS = [
  "além disso", "também", "ademais", "ainda", "bem como",
  "no entanto", "porém", "contudo", "entretanto", "por outro lado", "todavia",
  "portanto", "assim", "por isso", "consequentemente", "logo", "desse modo", "em suma",
  "primeiramente", "em primeiro lugar", "depois", "finalmente", "por fim", "antes de",
  "principalmente", "sobretudo", "especialmente", "de fato", "certamente",
  "por exemplo", "como", "a saber", "isto é", "ou seja",
  "caso", "desde que", "a menos que", "contanto que",
  "além do mais", "do mesmo modo", "dessa forma",
  "em outras palavras", "em resumo",
  "apesar de", "ainda que", "se bem que",
  "com efeito", "na verdade",
];

function api(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
    const json = data ? JSON.stringify(data) : null;
    const options = {
      hostname: new URL(WP_URL).hostname,
      path: `/wp-json/wp/v2/${endpoint}`,
      method,
      headers: { "Authorization": `Basic ${auth}` },
    };
    if (json) { options.headers["Content-Type"] = "application/json"; options.headers["Content-Length"] = Buffer.byteLength(json); }
    const req = https.request(options, (res) => {
      let b = "";
      res.on("data", c => b += c);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve(b); } });
    });
    req.on("error", reject);
    if (json) req.write(json);
    req.end();
  });
}

export async function validatePost(postId, applyFix = false, silent = false) {
  const log = silent ? () => {} : (...a) => console.log(...a);

  log(`🔍 Post ${postId}...`);

  const post = await api("GET", `posts/${postId}?context=edit`);
  if (!post.id) {
    log(`❌ Post não encontrado`);
    return { pass: 0, fail: 0, fixed: 0, ok: false };
  }

  const title = post.title?.raw || "";
  const slug = post.slug || "";
  const rendered = post.content?.rendered || "";
  const content = post.content?.raw || "";
  const categories = post.categories || [];
  const focuskw = post._yoast_wpseo_focuskw || "";
  const metadesc = post._yoast_wpseo_metadesc || "";
  const yoastHead = post.yoast_head || "";

  const text = rendered.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const totalSentences = sentences.length;
  const transCount = sentences.filter(s => TRANSITION_WORDS.some(tw => s.toLowerCase().includes(tw))).length;
  const transPct = totalSentences > 0 ? Math.round(transCount / totalSentences * 100) : 0;
  const internalLinks = (rendered.match(/<a\s[^>]*href="https:\/\/amiclube\.com\.br[^"]*"[^>]*>/gi) || []).length;
  const externalLinks = (rendered.match(/<a\s[^>]*href="https?:\/\/(?!amiclube\.com\.br)[^"]*"[^>]*>/gi) || []).length;
  const imagesWithAlt = (rendered.match(/<img[^>]*alt="[^"]+"[^>]*>/gi) || []).filter(m => !m.includes('alt=""')).length;
  const firstP = rendered.match(/<p>(.*?)<\/p>/i);
  const firstPText = firstP ? firstP[1].replace(/<[^>]*>/g, "").trim() : "";

  const titleMatch = yoastHead.match(/<title>(.*?)<\/title>/);
  const seoTitle = titleMatch ? titleMatch[1] : title;
  const descMatch = yoastHead.match(/name="description"\s+content="(.*?)"/);
  const currentMetadesc = descMatch ? descMatch[1] : metadesc;
  const catId = categories[0];
  const catName = Object.keys(CATEGORY_MAP).find(k => CATEGORY_MAP[k] === catId) || "Desconhecida";

  // ── CRITICAL checks (auto-fix seguros) ──
  const criticalChecks = [];
  const criticalFixes = [];

  // C1: Meta description
  const mdLen = currentMetadesc.length;
  const mdOk = mdLen >= 120 && mdLen <= 160;
  criticalChecks.push({
    id: "metadesc_len", label: "Meta description 120-160 chars",
    pass: mdOk, detail: `${mdLen} chars`,
    fix: !mdOk && !!focuskw ? () => {
      const base = focuskw.charAt(0).toUpperCase() + focuskw.slice(1);
      const fallback = "Guia completo para decisão consciente e segura.";
      let newMd = `${base}: ${currentMetadesc || fallback}`.substring(0, 157);
      if (newMd.length < 120) newMd = newMd + " " + fallback;
      newMd = newMd.substring(0, 160);
      criticalFixes.push({ key: "_yoast_wpseo_metadesc", value: newMd });
      return `Gerada (${newMd.length} chars)`;
    } : null,
  });

  // C2: Meta description contains keyword
  const mdHasKw = !focuskw || currentMetadesc.toLowerCase().includes(focuskw.toLowerCase());
  criticalChecks.push({
    id: "metadesc_kw", label: "Keyword na meta description",
    pass: mdHasKw, detail: mdHasKw ? "OK" : `"${focuskw}" ausente`,
    fix: !mdHasKw && !!focuskw ? () => {
      const newMd = `${focuskw.charAt(0).toUpperCase()}${focuskw.slice(1)}: ${currentMetadesc}`.substring(0, 160);
      criticalFixes.push({ key: "_yoast_wpseo_metadesc", value: newMd });
      return `Inserida`;
    } : null,
  });

  // C3: SEO title length
  const titleLen = seoTitle.length;
  const titleOk = titleLen <= 55;
  criticalChecks.push({
    id: "title_len", label: "Título SEO ≤55 chars",
    pass: titleOk, detail: `${titleLen} chars`,
    fix: titleLen > 55 ? () => {
      const suffix = "| AmiClube";
      const idx = seoTitle.lastIndexOf(suffix);
      let core = idx >= 0 ? seoTitle.substring(0, idx).trim() : seoTitle;
      core = core.replace(/[:\-–—.]+$/, "").trim();
      while (core.length + suffix.length + 2 > 55 && core.includes(" ")) {
        core = core.split(" ").slice(0, -1).join(" ");
      }
      const fixed = core + " " + suffix;
      criticalFixes.push({ key: "_yoast_wpseo_title", value: fixed });
      return `Encurtado (${fixed.length} chars)`;
    } : null,
  });

  // C4: Keyword in SEO title
  const titleHasKw = !focuskw || seoTitle.toLowerCase().includes(focuskw.toLowerCase());
  criticalChecks.push({
    id: "title_kw", label: "Keyword no título SEO",
    pass: titleHasKw, detail: titleHasKw ? "OK" : `"${focuskw}" ausente`,
    fix: !titleHasKw && !!focuskw ? () => {
      const suffix = "| AmiClube";
      const base = focuskw.charAt(0).toUpperCase() + focuskw.slice(1);
      const fixed = `${base} ${suffix}`;
      criticalFixes.push({ key: "_yoast_wpseo_title", value: fixed });
      return `Substituído para "${fixed}"`;
    } : null,
  });

  // C5: Slug contains keyword
  const kwSlugNormalized = focuskw
    ? focuskw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
    : "";
  const slugHasKw = !focuskw || slug.includes(kwSlugNormalized.substring(0, 15));
  criticalChecks.push({
    id: "slug_kw", label: "Keyword no slug",
    pass: slugHasKw, detail: slug,
    fix: !slugHasKw && !!kwSlugNormalized ? () => {
      const newSlug = kwSlugNormalized;
      criticalFixes.push({ key: "slug", value: newSlug });
      return `Slug corrigido para "${newSlug}"`;
    } : null,
  });

  // C6: Category not Uncategorized
  const catOk = catId && catId !== 1;
  criticalChecks.push({
    id: "category", label: "Categoria definida",
    pass: catOk, detail: catOk ? catName : "Uncategorized",
    fix: !catOk ? () => {
      criticalFixes.push({ key: "categories", value: [CATEGORY_MAP["Blog"]] });
      return `Alterada para Blog`;
    } : null,
  });

  // C7: Internal links ≥1
  const linksOk = internalLinks >= 1;
  criticalChecks.push({
    id: "links_internal", label: "Link interno",
    pass: linksOk, detail: `${internalLinks} link(s)`,
    fix: !linksOk ? () => {
      criticalFixes.push({ key: "content_append", value: `\n<p><a href="${WP_URL}">Visite a AmiClube</a> para mais informações.</p>` });
      return `Adicionado link para ${WP_URL}`;
    } : null,
  });

  // ── INFORMATIVE checks (apenas report) ──
  const hasFAQ = rendered.includes("FAQ") || rendered.includes("faq") || (rendered.match(/<h[23][^>]*>[^<]*(FAQ|faq|Perguntas|perguntas)[^<]*<\/h[23]>/gi) || []).length > 0;
  const hasFAQPage = yoastHead.includes("FAQPage");
  const hasOrganization = yoastHead.includes("Organization") || yoastHead.includes("organization");
  const hasAuthor = yoastHead.includes("author") || rendered.includes("author");
  const hasSourceAttribution = rendered.includes("Fonte") || rendered.includes("fonte") || rendered.includes("Referência") || rendered.includes("referência");

  const infoChecks = [
    { id: "focuskw", label: "Focus keyword definida", pass: !!focuskw, detail: focuskw || "vazia" },
    { id: "kw_intro", label: "Keyword na introdução", pass: !focuskw || firstPText.toLowerCase().includes(focuskw.toLowerCase()), detail: focuskw ? (firstPText.includes(focuskw) ? "OK" : "ausente") : "N/A" },
    { id: "links_external", label: "Links externos", pass: externalLinks >= 1, detail: `${externalLinks} link(s)` },
    { id: "images_alt", label: "Imagens com alt", pass: imagesWithAlt >= 1, detail: `${imagesWithAlt} imagem(ns)` },
    { id: "transitions", label: "Transições ≥25%", pass: transPct >= 25, detail: `${transCount}/${totalSentences} (${transPct}%)` },
    // ── GEO checks ──
    { id: "faq_visible", label: "FAQ visível (extractable)", pass: hasFAQ, detail: hasFAQ ? "OK" : "não identificado" },
    { id: "faqpage_schema", label: "FAQPage schema presente", pass: hasFAQPage, detail: hasFAQPage ? "OK" : "ausente" },
    { id: "org_schema", label: "Organization schema", pass: hasOrganization, detail: hasOrganization ? "OK" : "ausente" },
    { id: "author_block", label: "Author block visível", pass: hasAuthor, detail: hasAuthor ? "OK" : "ausente" },
    { id: "source_attribution", label: "Source attribution", pass: hasSourceAttribution, detail: hasSourceAttribution ? "OK" : "não identificado" },
  ];

  // ── Apply fixes ──
  const fixableChecks = criticalChecks.filter(c => !c.pass && c.fix);
  let fixedCount = 0;

  if (fixableChecks.length > 0 && applyFix) {
    const payload = {};
    for (const c of fixableChecks) {
      const msg = c.fix();
      log(`   🔧 ${c.label}: ${msg}`);
      fixedCount++;
    }

    // Build update payload
    const yoastPayload = {};
    let contentAppend = "";
    for (const f of criticalFixes) {
      if (f.key === "_yoast_wpseo_title") yoastPayload.title = f.value;
      else if (f.key === "_yoast_wpseo_metadesc") yoastPayload.metadesc = f.value;
      else if (f.key === "slug") payload.slug = f.value;
      else if (f.key === "categories") payload.categories = f.value;
      else if (f.key === "content_append") contentAppend = f.value;
    }
    if (Object.keys(yoastPayload).length > 0) payload.yoast_head_json = yoastPayload;
    if (contentAppend) payload.content = content + contentAppend;

    if (Object.keys(payload).length > 0) {
      const res = await api("POST", `posts/${postId}`, payload);
      if (res.id) log(`   ✅ Post ${postId} atualizado`);
    }
  }

  // ── Report ──
  const passCount = criticalChecks.filter(c => c.pass).length + infoChecks.filter(c => c.pass).length;
  const failCount = criticalChecks.filter(c => !c.pass).length + infoChecks.filter(c => !c.pass).length;
  const total = criticalChecks.length + infoChecks.length;
  const score = total > 0 ? Math.round(passCount / total * 100) : 0;

  if (!silent) {
    console.log(`\n📋 ${title.substring(0, 60)}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━`);

    console.log(`\n🔴 Críticos (auto-fixável):`);
    for (const c of criticalChecks) {
      const icon = c.pass ? "✅" : "❌";
      const fixed = !c.pass && c.fix && applyFix ? " 🔧" : "";
      console.log(` ${icon}${fixed} ${c.label} — ${c.detail}`);
    }

    console.log(`\n🟡 Informativos:`);
    const geoChecks = infoChecks.filter(c => ["faq_visible","faqpage_schema","org_schema","author_block","source_attribution"].includes(c.id));
    const seoInfoChecks = infoChecks.filter(c => !["faq_visible","faqpage_schema","org_schema","author_block","source_attribution"].includes(c.id));
    for (const c of seoInfoChecks) {
      const icon = c.pass ? "✅" : "❌";
      console.log(` ${icon} ${c.label} — ${c.detail}`);
    }
    if (geoChecks.some(c => !c.pass) || true) {
      console.log(`\n🌐 GEO:`);
      for (const c of geoChecks) {
        const icon = c.pass ? "✅" : "❌";
        console.log(` ${icon} ${c.label} — ${c.detail}`);
      }
    }

    console.log(`\n📊 Score: ${score}% (${passCount}/${total})`);
    if (score >= 85) console.log(`🟢 Aprovado`);
    else if (score >= 60) console.log(`🟡 Atenção (${failCount} pendente(s))`);
    else console.log(`🔴 Rejeitado (${failCount} pendente(s))`);
  }

  return { pass: passCount, fail: failCount, fixed: fixedCount, score, ok: score >= 60 };
}

// ── CLI ──
const args = process.argv.slice(2);
let postId = null, applyFix = false, silent = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--post-id" || args[i] === "-p") postId = parseInt(args[i + 1]);
  if (args[i] === "--fix" || args[i] === "-f") applyFix = true;
  if (args[i] === "--silent" || args[i] === "-s") silent = true;
}

if (!postId) { console.log(`Uso: node post-publish-validator.mjs --post-id <id> [--fix]`); process.exit(1); }

await validatePost(postId, applyFix, silent);