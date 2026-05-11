#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const requiredManifestFields = ["asset_id", "client", "style", "format", "slides"];
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
  const missing = requiredManifestFields.filter((field) => !manifest[field]);
  if (missing.length) {
    throw new Error(`Manifesto inválido. Campos ausentes: ${missing.join(", ")}`);
  }

  const format = manifest.format;

  if (isMultiSlideFormat(format)) {
    if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
      throw new Error(`Manifesto inválido. \`slides\` precisa ter pelo menos 1 item para ${format}.`);
    }
    return;
  }

  if (format === "post-preview") {
    if (!manifest.caption) {
      throw new Error("Manifesto inválido. `caption` é obrigatório para post-preview.");
    }
    if (!Array.isArray(manifest.hashtags) || manifest.hashtags.length === 0) {
      throw new Error("Manifesto inválido. `hashtags` (array) é obrigatório para post-preview.");
    }
    if (!Array.isArray(manifest.exported_images) || manifest.exported_images.length === 0) {
      throw new Error("Manifesto inválido. `exported_images` (array) é obrigatório para post-preview.");
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

function renderSimpleTemplate(template, data) {
  let result = template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => data[key] ?? "");
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return data[key] ? content : "";
  });
  return result;
}

function getSlideTitle(slide) {
  return slide.title?.text || slide.heading?.text || slide.title || slide.heading || "";
}

function getSlideBody(slide) {
  return slide.subtitle?.text || slide.body?.text || slide.subtitle || slide.body || "";
}

function slideBackgroundStyle(slide) {
  const background = slide.background || {};
  if (background.type === "gradient" && background.from && background.to) {
    return `background: radial-gradient(circle at 22% 12%, var(--style-accent-soft), transparent 34%), linear-gradient(145deg, ${background.from}, ${background.to});`;
  }
  if (background.type === "solid" && background.color) {
    return `background: radial-gradient(circle at 22% 12%, var(--style-accent-soft), transparent 34%), linear-gradient(145deg, ${background.color}, var(--style-bg-alt));`;
  }
  if (background.type === "image" && background.src) {
    const overlay = background.overlay || "rgba(0,0,0,0.52)";
    const position = background.position || "center";
    return `background: linear-gradient(${overlay}, ${overlay}), url('${escapeHtml(background.src)}') ${position}/cover no-repeat;`;
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
  const backgroundStyle = slideBackgroundStyle(slide);
  const textVariant = slide.textVariant || "light";
  const isProof = slide.truthCard || isCta;

  return `
        <section class="slide slide-${index + 1} ${escapeHtml(slide.type || "content")}" data-text-variant="${escapeHtml(textVariant)}" style="${backgroundStyle}">
          ${manifest.format !== "linkedin-carousel" ? `
          <div class="header-zone">
            <span class="brand-mark">${escapeHtml(manifest.brand || manifest.client)}</span>
            <span class="deck-label">${escapeHtml(manifest.deck_label || manifest.format)}</span>
          </div>` : ""}
          <div class="content-creative ${alignClass}">
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            ${title ? `<h${isCover ? "1" : "2"} class="${titleClass}">${escapeHtml(title)}</h${isCover ? "1" : "2"}>` : ""}
            ${body ? `<div class="${isProof ? "proof-card" : ""}"><p class="${isCover ? "subtitle" : "body-text"}">${escapeHtml(body)}</p></div>` : ""}
            ${ctaText ? `<div class="cta-block">${escapeHtml(ctaText)}</div>` : ""}
            ${!isCover && !isCta ? `<div class="divider"></div>` : ""}
          </div>
          ${manifest.format !== "linkedin-carousel" ? `
          <div class="footer-zone"><span>${escapeHtml(manifest.footer || manifest.brand || manifest.client)}</span><span>${String(index + 1).padStart(2, "0")}</span></div>
          ${index < total - 1 ? "<div class=\"swipe-arrow\">arraste</div>" : ""}` : ""}
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
  const backgroundStyle = slideBackgroundStyle(slide);
  const textVariant = slide.textVariant || "light";

  return `
        <section class="frame frame-${index + 1} ${escapeHtml(slide.type || "content")}" data-text-variant="${escapeHtml(textVariant)}" style="${backgroundStyle}">
          <span class="brand-mark">${escapeHtml(manifest.brand || manifest.client)}</span>
          <div class="content-creative ${alignClass}">
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            ${title ? `<h${isCover ? "1" : "2"} class="${titleClass}">${escapeHtml(title)}</h${isCover ? "1" : "2"}>` : ""}
            ${body ? `<p class="body-text">${escapeHtml(body)}</p>` : ""}
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

function renderPostPreview(manifest) {
  const imagesHtml = manifest.exported_images
    .map((imgPath) => `<img src="${escapeHtml(imgPath)}" alt="Slide" onclick="openLightbox(this.src)" loading="lazy" />`)
    .join("\n        ");

  const hashtagsHtml = manifest.hashtags
    .map((tag) => `<a class="hashtag" href="https://www.instagram.com/explore/tags/${encodeURIComponent(tag.replace(/^#/, ""))}/" target="_blank" rel="noopener">${escapeHtml(tag)}</a>`)
    .join(" ");

  const captionHtml = `${escapeHtml(manifest.caption)}\n          <div class="hashtags-row">${hashtagsHtml}</div>`;

  const ctaValue = manifest.cta || "";
  const ctaTag = ctaValue
    ? `<span class="meta-tag">CTA: ${escapeHtml(ctaValue)}</span>`
    : "";

  return {
    title: escapeHtml(manifest.title || manifest.asset_id),
    assetId: escapeHtml(manifest.asset_id),
    slideCount: manifest.exported_images.length,
    imagesHtml,
    captionHtml,
    channel: escapeHtml(manifest.channel || ""),
    objective: escapeHtml(manifest.objective || ""),
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
    tokensCss: readText(path.join(rootDir, "tokens.css")),
    styleCss: `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`,
    format: "",
  };
}

function renderSingleFramePost(manifest) {
  const slide = manifest.slides?.[0] || {};
  const bg = slide.background || manifest.background || {};
  const eyebrow = slide.eyebrow || manifest.eyebrow || "";
  const title = getSlideTitle(slide) || manifest.title || manifest.headline || "";
  const body = getSlideBody(slide) || manifest.body || "";
  const ctaText = slide.cta?.text || slide.cta || manifest.cta || "";
  const textVariant = slide.textVariant || manifest.textVariant || "light";
  const align = slide.align || manifest.align || "center";
  const alignClass = align === "center" ? "center" : "";

  return {
    title: escapeHtml(title),
    brand: escapeHtml(manifest.brand || manifest.client),
    brandInitial: (manifest.brand || manifest.client || "").charAt(0).toUpperCase(),
    eyebrow: escapeHtml(eyebrow),
    body: escapeHtml(body),
    ctaText: escapeHtml(ctaText),
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

  const pathMap = {
    "post-preview": () => path.resolve(process.cwd(), "squads", "social-growth", "output", client, "social", "previews", `${asset}-post-preview.html`),
    "social-single-post": () => path.resolve(process.cwd(), "squads", "social-growth", "output", client, "social", "previews", `${asset}-${manifest.style}-single-post.html`),
    "facebook-post": () => path.resolve(process.cwd(), "squads", "social-growth", "output", client, "social", "previews", `${asset}-${manifest.style}-fb.html`),
    "pinterest-pin": () => path.resolve(process.cwd(), "squads", "social-growth", "output", client, "social", "previews", `${asset}-${manifest.style}-pin.html`),
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
  } else if (isMultiSlideFormat(format)) {
    const tokensCss = readText(path.join(rootDir, "tokens.css"));
    const styleCss = `${loadStyle(manifest.style)}\n${renderTokenOverrides(manifest.design_tokens)}`;
    const renderFn = format === "stories-sequence" ? renderSlideSimple : renderSlide;
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
