#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const requiredManifestFields = ["asset_id", "client", "style", "format", "slides"];
const postPreviewRequiredFields = ["asset_id", "client", "format", "exported_images"];

const requiredStyleTokens = [
  "--style-bg",
  "--style-bg-alt",
  "--style-text-heading",
  "--style-text-body",
  "--style-accent",
  "--style-heading-font",
  "--style-body-font",
  "--style-gradient",
];

const multiSlideFormats = ["instagram-carousel", "reels-sequence", "stories-sequence", "linkedin-carousel"];
const singleFrameFormats = ["facebook-post", "pinterest-pin", "social-single-post"];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isMultiSlideFormat(format) {
  return multiSlideFormats.includes(format);
}

function isSingleFrameFormat(format) {
  return singleFrameFormats.includes(format);
}

function validateManifest(manifest) {
  const format = manifest.format;

  if (format === "post-preview") {
    const missing = postPreviewRequiredFields.filter((field) => !manifest[field]);
    if (missing.length) {
      throw new Error(`Manifesto inválido (post-preview). Campos ausentes: ${missing.join(", ")}`);
    }
    if (!Array.isArray(manifest.exported_images) || manifest.exported_images.length === 0) {
      throw new Error("Manifesto inválido. `exported_images` (array) é obrigatório para post-preview.");
    }
    if (manifest.caption_source !== "social-final-captions") {
      if (!manifest.caption) {
        throw new Error("Manifesto inválido. `caption` é obrigatório para post-preview quando caption_source != social-final-captions.");
      }
      if (!Array.isArray(manifest.hashtags)) {
        throw new Error("Manifesto inválido. `hashtags` (array) é obrigatório para post-preview quando caption_source != social-final-captions.");
      }
    }
    return;
  }

  const missing = requiredManifestFields.filter((field) => !manifest[field]);
  if (missing.length) {
    throw new Error(`Manifesto inválido. Campos ausentes: ${missing.join(", ")}`);
  }

  if (isMultiSlideFormat(format)) {
    if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
      throw new Error(`Manifesto inválido. \`slides\` precisa ter pelo menos 1 item para ${format}.`);
    }
    return;
  }

  if (isSingleFrameFormat(format)) {
    if (!manifest.headline && !manifest.title) {
      throw new Error(`Manifesto inválido. \`headline\` ou \`title\` é obrigatório para ${format}.`);
    }
    return;
  }

  throw new Error(`Formato ainda não implementado: ${format}`);
}

function loadTemplate(format) {
  const templatePath = path.join(rootDir, "templates", `${format}.hbs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado para formato: ${format}`);
  }
  return readText(templatePath);
}

function loadStyle(style) {
  const stylePath = path.join(rootDir, "styles", `${style}.css`);
  if (!fs.existsSync(stylePath)) {
    throw new Error(`Preset de estilo não encontrado: ${style}`);
  }
  const css = readText(stylePath);
  const missing = requiredStyleTokens.filter((token) => !css.includes(token));
  if (missing.length) {
    throw new Error(`Preset de estilo inválido (${style}). Tokens ausentes: ${missing.join(", ")}`);
  }
  return css;
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

function renderSimpleTemplate(template, data) {
  let result = template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => data[key] ?? "");
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return data[key] ? content : "";
  });
  return result;
}

function renderSection(template, name, html) {
  return template.replace(new RegExp(`\\{\\{#if\\s+${name}\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}`, "g"), (_, content) => {
    if (!html) return "";
    return content.replace(new RegExp(`\\{\\{${name}\\}\\}`, "g"), html);
  });
}

function renderVariable(template, name, value) {
  return template.replace(new RegExp(`\\{\\{${name}\\}\\}`, "g"), value ?? "");
}

function getSlideTitle(slide) {
  return slide.title?.text || slide.heading?.text || slide.title || slide.heading || "";
}

function getSlideBody(slide) {
  return slide.subtitle?.text || slide.body?.text || slide.subtitle || slide.body || "";
}

function renderChoicePills(slide) {
  const choices = Array.isArray(slide.cta_pills)
    ? slide.cta_pills
    : Array.isArray(slide.choice_pills)
      ? slide.choice_pills
      : [];

  if (!choices.length) return "";

  const pills = choices.map((choice, index) => {
    const text = typeof choice === "string" ? choice : choice?.text || choice?.label || "";
    const primary = typeof choice === "object" && (choice.primary || choice.emphasis || index === 0);
    return `<span class="choice-pill ${primary ? "primary" : ""}">${escapeHtml(text)}</span>`;
  }).join("");

  return `<div class="choice-pills">${pills}</div>`;
}

function slideBackgroundStyle(slide, index, manifest) {
  const background = slide.background || {};
  const isCover = slide.type === "cover" || index === 0;
  const contrastStrategy = slide.contrast_strategy || "dark-overlay";
  const texture = background.texture || "none";

  // texture-pattern: usa gradiente + noise CSS para ritmo visual sem imagem
  if (background.type === "texture-pattern") {
    const from = background.from || "var(--style-bg)";
    const to = background.to || "var(--style-bg-alt)";
    const accent = "var(--style-accent-soft, var(--style-accent))";
    let gradient = `background: linear-gradient(145deg, ${from}, ${to});`;
    const noiseSvg = '%3Csvg%20viewBox%3D%270%200%20256%20256%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.9%27%20numOctaves%3D%274%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23n)%27%20opacity%3D%270.04%27%2F%3E%3C%2Fsvg%3E';
    const grainSvg = '%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27turbulence%27%20baseFrequency%3D%270.65%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23n)%27%20opacity%3D%270.06%27%2F%3E%3C%2Fsvg%3E';
    if (texture === "noise") {
      gradient += ` background-image: url("data:image/svg+xml,${noiseSvg}"), linear-gradient(145deg, ${from}, ${to});`;
    } else if (texture === "grain") {
      gradient += ` background-image: url("data:image/svg+xml,${grainSvg}"), linear-gradient(145deg, ${from}, ${to});`;
    }
    return gradient;
  }

  if (background.type === "gradient" && background.from && background.to) {
    return `background: radial-gradient(circle at 22% 12%, var(--style-accent-soft), transparent 34%), linear-gradient(145deg, ${background.from}, ${background.to});`;
  }
  if (background.type === "solid" && background.color) {
    return `background: radial-gradient(circle at 22% 12%, var(--style-accent-soft), transparent 34%), linear-gradient(145deg, ${background.color}, var(--style-bg-alt));`;
  }
  if (background.type === "image" && background.src) {
    // Reels-sequence pode repetir a imagem do banco em todos os frames quando o briefing pede continuidade.
    if (!isCover && manifest?.format !== "reels-sequence") {
      throw new Error(`Slide ${index + 1} tem background.type="image" mas não é cover. Imagem do banco é permitida apenas no slide 1 (cover). Use solid, gradient ou texture-pattern para slides 2+.`);
    }
    const position = background.position || "center";
    let overlay = background.overlay || "rgba(0,0,0,0.52)";
    // contrast_strategy override
    if (contrastStrategy === "dark-overlay") overlay = "rgba(0,0,0,0.52)";
    else if (contrastStrategy === "light-overlay") overlay = "rgba(255,255,255,0.25)";
    else if (contrastStrategy === "gradient-mask") overlay = "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)";
    else if (contrastStrategy === "zone-isolation") overlay = "rgba(0,0,0,0.35)";
    else if (contrastStrategy === "no-overlay-justified") overlay = "rgba(0,0,0,0)";
    const encodedSrc = background.src.replace(/ /g, '%20').replace(/'/g, '%27');
    if (typeof overlay === "string" && overlay.startsWith("linear-gradient")) {
      return `background: ${overlay}, url(${encodedSrc}) ${position}/cover no-repeat;`;
    }
    return `background: linear-gradient(${overlay}, ${overlay}), url(${encodedSrc}) ${position}/cover no-repeat;`;
  }
  return "";
}

function renderSlide(slide, index, total, manifest) {
  const isCover = slide.type === "cover" || index === 0;
  const isCta = slide.type === "cta" || index === total - 1;
  const alignClass = slide.align === "center" || isCover || isCta ? "center" : "";
  const titleClass = isCover ? "title" : "heading";
  const title = getSlideTitle(slide);
  const body = getSlideBody(slide);
  const eyebrow = slide.eyebrow || slide.label || (isCover ? manifest.topic || "Estratégia" : `Parte ${index + 1}`);
  const ctaText = slide.cta?.text || slide.cta || "";
  const progress = Math.round(((index + 1) / total) * 100);
  const backgroundStyle = slideBackgroundStyle(slide, index, manifest);
  const textVariant = slide.textVariant || "light";
  const isProof = slide.truthCard || isCta;

  return `
        <section class="slide slide-${index + 1} ${escapeHtml(slide.type || "content")}" data-text-variant="${escapeHtml(textVariant)}" style='${backgroundStyle}'>
          ${manifest.format !== "linkedin-carousel" ? `
          <div class="header-zone">
            <span class="brand-mark">${escapeHtml(manifest.brand || manifest.client)}</span>
            <span class="deck-label">${escapeHtml(manifest.deck_label || manifest.format)}</span>
          </div>` : ""}
          <div class="content-creative ${alignClass}">
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            ${title ? `<h${isCover ? "1" : "2"} class="${titleClass}">${escapeHtml(title)}</h${isCover ? "1" : "2"}>` : ""}
            ${body ? `<div class="${isProof ? "proof-card" : ""}"><p class="${isCover ? "subtitle" : "body-text"}">${escapeHtml(body)}</p></div>` : ""}
            ${renderChoicePills(slide)}
            ${ctaText ? `<div class="cta-block">${escapeHtml(ctaText)}</div>` : ""}
            ${!isCover && !isCta ? `<div class="divider"></div>` : ""}
          </div>
          ${manifest.format !== "linkedin-carousel" ? `
          <div class="footer-zone"><span>${escapeHtml(manifest.footer || manifest.brand || manifest.client)}</span><span>${String(index + 1).padStart(2, "0")}</span></div>
          ${manifest.hide_swipe_arrow ? "" : (index < total - 1 ? "<div class=\"swipe-arrow\">arraste</div>" : "")}` : ""}
          ${manifest.format === "linkedin-carousel" ? `<div class="page-indicator">${String(index + 1)}/${total}</div>` : ""}
          ${manifest.format !== "linkedin-carousel" ? `<div class="progress-bar" aria-hidden="true"><span style="width: ${progress}%"></span></div>` : ""}
        </section>`;
}

function renderSlideSimple(slide, index, total, manifest) {
  const isCover = slide.type === "cover" || index === 0;
  const isCta = slide.type === "cta" || index === total - 1;
  const alignClass = slide.align === "center" || isCover || isCta ? "center" : "";
  const titleClass = isCover ? "title" : "heading";
  const title = getSlideTitle(slide);
  const body = getSlideBody(slide);
  const eyebrow = slide.eyebrow || slide.label || (isCover ? manifest.topic || "Estratégia" : `Parte ${index + 1}`);
  const ctaText = slide.cta?.text || slide.cta || "";
  const backgroundStyle = slideBackgroundStyle(slide, index, manifest);
  const textVariant = slide.textVariant || "light";

  return `
        <section class="frame story frame-${index + 1} ${escapeHtml(slide.type || "content")}" data-text-variant="${escapeHtml(textVariant)}" style='${backgroundStyle}'>
          <span class="brand-mark">${escapeHtml(manifest.brand || manifest.client)}</span>
          <div class="content-creative ${alignClass}">
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            ${title ? `<h${isCover ? "1" : "2"} class="${titleClass}">${escapeHtml(title)}</h${isCover ? "1" : "2"}>` : ""}
            ${body ? `<p class="body-text">${escapeHtml(body)}</p>` : ""}
            ${renderChoicePills(slide)}
            ${ctaText ? `<div class="cta-block">${escapeHtml(ctaText)}</div>` : ""}
          </div>
        </section>`;
}

function renderDots(total) {
  return Array.from({ length: total }, (_, index) => `<button class="${index === 0 ? "active" : ""}" type="button" aria-label="Ir para slide ${index + 1}"></button>`).join("");
}

function renderProgressHtml(total) {
  return Array.from({ length: total }, (_, index) => `<div class="seg ${index === 0 ? "active" : ""}"></div>`).join("");
}

function resolveCaptionFromJson(manifest) {
  if (manifest.caption_source !== "social-final-captions") {
    return null;
  }
  const captionId = manifest.asset_caption_id || manifest.asset_id;
  const jsonPath = path.resolve(process.cwd(), "squads", "social-growth", "output", slug(manifest.client), "publishing", "social-final-captions.json");
  if (!fs.existsSync(jsonPath)) {
    console.warn(`[post-preview] social-final-captions.json não encontrado em ${jsonPath}. Usando fallback inline.`);
    return null;
  }
  let captionsData;
  try {
    captionsData = JSON.parse(readText(jsonPath));
  } catch {
    console.warn(`[post-preview] Falha ao ler social-final-captions.json. Usando fallback inline.`);
    return null;
  }
  const entry = (captionsData.captions || []).find((c) => c.asset_id === captionId);
  if (!entry) {
    console.warn(`[post-preview] Caption para "${captionId}" não encontrado em social-final-captions.json. Usando fallback inline.`);
    return null;
  }
  return {
    caption: entry.final_caption || manifest.caption || "",
    hashtags: entry.hashtags || manifest.hashtags || [],
    cta: manifest.cta_override || entry.cta || "",
    link_target: entry.link_target || "",
    alt_text: entry.alt_text || "",
    channel: entry.channel || manifest.channel || "",
    format: entry.format || "",
    first_line_hook: entry.first_line_hook || "",
  };
}

function renderPostPreview(manifest) {
  const captionData = resolveCaptionFromJson(manifest);
  const caption = captionData?.caption || manifest.caption || "";
  const hashtags = captionData?.hashtags || manifest.hashtags || [];
  const ctaValue = captionData?.cta || manifest.cta || captionData?.first_line_hook || "";

  const imagesHtml = (manifest.exported_images || [])
    .map((imgPath) => `<img src="${escapeHtml(imgPath)}" alt="Slide" onclick="openLightbox(this.src)" loading="lazy" />`)
    .join("\n        ");

  const hashtagsHtml = hashtags
    .map((tag) => `<a class="hashtag" href="https://www.instagram.com/explore/tags/${encodeURIComponent(tag.replace(/^#/, ""))}/" target="_blank" rel="noopener">${escapeHtml(tag)}</a>`)
    .join(" ");

  const captionHtml = `${escapeHtml(caption)}${hashtagsHtml ? `\n          <div class="hashtags-row">${hashtagsHtml}</div>` : ""}`;

  const ctaTag = ctaValue
    ? `<span class="meta-tag">CTA: ${escapeHtml(ctaValue)}</span>`
    : "";

  return {
    title: escapeHtml(manifest.title || manifest.asset_id),
    assetId: escapeHtml(manifest.asset_id),
    slideCount: (manifest.exported_images || []).length,
    imagesHtml,
    captionHtml,
    channel: escapeHtml(captionData?.channel || manifest.channel || ""),
    objective: escapeHtml(manifest.objective || captionData?.format || ""),
    cta: escapeHtml(ctaValue),
    ctaTag,
    tokensCss: "",
    styleCss: "",
  };
}

function renderSinglePost(manifest) {
  const bg = manifest.background || {};
  const bgFilter = bg.filter || "";
  const bgFilterCss = bgFilter ? `filter: ${bgFilter};` : "";
  const bgOverlay = bg.overlay || "linear-gradient(180deg, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.55) 50%, rgba(26,26,26,0.8) 100%)";
  const bgSrc = bg.src || "";
  const listHtml = manifest.listHtml || manifest.list_html || "";

  const listItemsHtml = listHtml
    ? `<div class="feature-list">${listHtml}</div>`
    : "";

  return {
    title: escapeHtml(manifest.title || manifest.headline || manifest.asset_id),
    brand: escapeHtml(manifest.brand || manifest.client),
    brandInitial: (manifest.brand || manifest.client || "").charAt(0).toUpperCase(),
    bgSrc: escapeHtml(bgSrc),
    bgFilterCss,
    bgOverlay,
    eyebrow: escapeHtml(manifest.eyebrow || ""),
    headline: escapeHtml(manifest.headline || manifest.title || ""),
    showDivider: !!(manifest.showDivider ?? true),
    body: escapeHtml(manifest.body || ""),
    cta: escapeHtml(manifest.cta || ""),
    listHtml: listItemsHtml,
    footerNote: escapeHtml(manifest.footerNote || manifest.footer_note || manifest.brand || manifest.client),
    tokensCss: readText(path.join(rootDir, "tokens.css")),
    styleCss: `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`,
    format: "",
  };
}

function renderSingleFramePost(manifest) {
  const slide = manifest.slides?.[0] || {};
  const bg = slide.background || manifest.background || {};
  const bgFilter = bg.filter || "";
  const bgFilterCss = bgFilter ? `filter: ${bgFilter};` : "";
  const bgOverlay = bg.overlay || "linear-gradient(180deg, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.55) 50%, rgba(26,26,26,0.8) 100%)";
  const bgSrc = bg.src || "";
  const eyebrow = slide.eyebrow || manifest.eyebrow || "";
  const title = getSlideTitle(slide) || manifest.title || manifest.headline || "";
  const body = getSlideBody(slide) || manifest.body || "";
  const ctaText = slide.cta?.text || slide.cta || manifest.cta || "";
  const textVariant = slide.textVariant || manifest.textVariant || "light";
  const align = slide.align || manifest.align || "center";
  const alignClass = align === "center" ? "center" : "";
  const rawListHtml = manifest.listHtml || manifest.list_html || "";
  const listHtml = rawListHtml;
  const footerNote = manifest.footerNote || manifest.footer_note || manifest.brand || manifest.client || "";

  const headlineVal = escapeHtml(title);
  const ctaVal = escapeHtml(ctaText);
  return {
    title: headlineVal,
    headline: headlineVal,
    brand: escapeHtml(manifest.brand || manifest.client),
    brandInitial: (manifest.brand || manifest.client || "").charAt(0).toUpperCase(),
    bgSrc: escapeHtml(bgSrc),
    bgFilterCss,
    bgOverlay: escapeHtml(bgOverlay),
    eyebrow: escapeHtml(eyebrow),
    body: escapeHtml(body),
    ctaText: ctaVal,
    cta: ctaVal,
    listHtml,
    footerNote: escapeHtml(footerNote),
    showDivider: !!slide.showDivider ?? true,
    textVariant: escapeHtml(textVariant),
    alignClass,
    tokensCss: readText(path.join(rootDir, "tokens.css")),
    styleCss: `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`,
  };
}

function outputPathFor(manifest, args) {
  if (args.out) return path.resolve(process.cwd(), args.out);
  const client = slug(manifest.client);
  const asset = slug(manifest.asset_id);

  const squadOutputDir = path.resolve(process.cwd(), "squads", "social-growth", "output");
  const pathMap = {
    "post-preview": () => path.resolve(squadOutputDir, client, "social", "previews", `${asset}-post-preview.html`),
    "social-single-post": () => path.resolve(squadOutputDir, client, "social", "previews", `${asset}-${manifest.style}-single-post.html`),
    "facebook-post": () => path.resolve(squadOutputDir, client, "social", "previews", `${asset}-${manifest.style}-fb.html`),
    "pinterest-pin": () => path.resolve(squadOutputDir, client, "social", "previews", `${asset}-${manifest.style}-pin.html`),
  };

  if (pathMap[manifest.format]) return pathMap[manifest.format]();
  return path.resolve(process.cwd(), "squads", "social-growth", "output", client, "social", "previews", `${asset}-${manifest.style}-${manifest.format}.html`);
}

function compose(manifest, args) {
  validateManifest(manifest);
  const template = loadTemplate(manifest.format);
  const format = manifest.format;

  let html;
  if (format === "post-preview") {
    const data = renderPostPreview(manifest);
    html = renderSimpleTemplate(template, data);
  } else if (isSingleFrameFormat(format)) {
    const tokensCss = readText(path.join(rootDir, "tokens.css"));
    const styleCss = `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`;
    const data = renderSingleFramePost(manifest);
    data.tokensCss = tokensCss;
    data.styleCss = styleCss;
    html = renderSimpleTemplate(template, data);
    if (format === "facebook-post") {
      html = renderSection(html, "listHtml", data.listHtml);
      html = renderSection(html, "footerNote", data.footerNote);
      html = renderVariable(html, "listHtml", data.listHtml);
      html = renderVariable(html, "footerNote", data.footerNote);
    }
  } else if (isMultiSlideFormat(format)) {
    const tokensCss = readText(path.join(rootDir, "tokens.css"));
    const styleCss = `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`;
    const renderFn = (format === "stories-sequence" || format === "reels-sequence") ? renderSlideSimple : renderSlide;
    const slidesHtml = manifest.slides.map((slide, index) => renderFn(slide, index, manifest.slides.length, manifest)).join("\n");

    const data = {
      title: escapeHtml(manifest.title || manifest.asset_id),
      brand: escapeHtml(manifest.brand || manifest.client),
      tokensCss,
      styleCss,
      slidesHtml,
      dotsHtml: renderDots(manifest.slides.length),
      progressHtml: format === "stories-sequence" ? renderProgressHtml(manifest.slides.length) : "",
    };
    html = renderSimpleTemplate(template, data);
  } else {
    const tokensCss = readText(path.join(rootDir, "tokens.css"));
    const styleCss = `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`;
    const slidesHtml = manifest.slides.map((slide, index) => renderSlide(slide, index, manifest.slides.length, manifest)).join("\n");
    html = renderSimpleTemplate(template, {
      title: escapeHtml(manifest.title || manifest.asset_id),
      brand: escapeHtml(manifest.brand || manifest.client),
      tokensCss,
      styleCss,
      slidesHtml,
      dotsHtml: renderDots(manifest.slides.length),
    });
  }

  const outPath = outputPathFor(manifest, args);
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, html, "utf8");
  return outPath;
}

function renderTokenOverrides(tokens = {}) {
  const allowed = {
    accent_color: "--style-accent",
    title_color: "--style-text-heading",
    body_color: "--style-text-body",
    muted_color: "--style-text-muted",
    heading_font: "--style-heading-font",
    body_font: "--style-body-font",
    noise_opacity: "--style-noise-opacity",
  };
  const declarations = Object.entries(tokens)
    .filter(([key, value]) => allowed[key] && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const cssValue = key.endsWith("_font") ? `"${String(value).replace(/"/g, "")}"` : String(value);
      return `  ${allowed[key]}: ${cssValue};`;
    });
  if (!declarations.length) return "";
  return `:root {\n${declarations.join("\n")}\n}`;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.manifest) {
    throw new Error("Uso: node compose.mjs --manifest path/to/manifest.json [--format post-preview] [--out path/to/output.html]");
  }
  const manifestPath = path.resolve(process.cwd(), args.manifest);
  const manifest = JSON.parse(readText(manifestPath));
  if (args.format) {
    manifest.format = args.format;
  }
  const outPath = compose(manifest, args);
  console.log(`HTML gerado: ${outPath}`);
}

try {
  main();
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exit(1);
}
