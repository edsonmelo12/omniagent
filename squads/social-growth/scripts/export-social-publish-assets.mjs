#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");
if (!client) {
  console.error("Usage: node export-social-publish-assets.mjs --client <client-slug>");
  process.exit(2);
}

const assetFilterRaw = readArg("asset") || readArg("assets");
const assetFilterSet = assetFilterRaw
  ? new Set(
      assetFilterRaw
        .split(",")
        .map((value) => String(value || "").trim().toUpperCase())
        .filter(Boolean),
    )
  : null;

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const manifestPath = path.join(clientDir, "review", "campaign-manifest.json");
const policyPath = path.join(clientDir, "publishing", "social-publish-assets-policy.json");
const captionsPath = path.join(clientDir, "publishing", "social-final-captions.json");
const publishDir = path.join(clientDir, "social", "publish");
const outputPath = path.join(clientDir, "publishing", "social-publish-assets.json");

const nowIso = new Date().toISOString();
const failures = [];
const notes = [];

if (!fs.existsSync(manifestPath)) {
  console.error(`campaign manifest missing: ${manifestPath}`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  console.error("campaign manifest is not valid JSON");
  process.exit(1);
}

let policy = {
  export_on_social_statuses: ["review", "approved", "ready_to_schedule", "scheduled", "published"],
};
if (fs.existsSync(policyPath)) {
  try {
    policy = {
      ...policy,
      ...JSON.parse(fs.readFileSync(policyPath, "utf8")),
    };
  } catch {
    failures.push("social publish assets policy is not valid JSON");
  }
} else {
  notes.push("social-publish-assets-policy missing; using default statuses");
}

const exportStatuses = new Set(
  (Array.isArray(policy.export_on_social_statuses) ? policy.export_on_social_statuses : [])
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean),
);

const normalizeType = (value) => String(value || "").trim().toLowerCase();
const canonicalStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();
  if (!status) return "";
  if (status.includes("aprovado") || status.includes("approved")) return "approved";
  if (status.includes("em revisão") || status.includes("revisao") || status.includes("review")) return "review";
  if (status.includes("preview pronto") || status.includes("ready")) return "ready_to_schedule";
  if (status.includes("agendado") || status.includes("scheduled")) return "scheduled";
  if (status.includes("publicado") || status.includes("published")) return "published";
  if (status.includes("planejado") || status.includes("planned")) return "planned";
  return status;
};

const typeConfig = (typeRaw, channel) => {
  const type = normalizeType(typeRaw);
  const ch = String(channel || "").trim().toLowerCase();
  if (type.includes("carrossel")) {
    return {
      width: 1080,
      height: 1350,
      selectors: [".slide"],
      exportKind: "image_sequence_png",
      mode: "viewport",
      isMultiFrame: true,
      wrapperSelector: ".carousel-track",
      containerSelector: ".carousel-viewport",
    };
  }
  if (type.includes("stories")) {
    return {
      width: 1080,
      height: 1920,
      selectors: [".story"],
      exportKind: "image_sequence_png",
      mode: "viewport",
      isMultiFrame: true,
      wrapperSelector: ".frame-wrapper",
      containerSelector: ".frame-container",
    };
  }
  if (type.includes("reels")) {
    return {
      width: 1080,
      height: 1920,
      selectors: [".frame", ".slide", ".story"],
      exportKind: "image_sequence_png",
      mode: "viewport",
      isMultiFrame: true,
      wrapperSelector: ".reels-track",
      containerSelector: ".frame-container",
    };
  }
  if (ch.includes("instagram") && type.includes("post")) {
    return {
      width: 1080,
      height: 1350,
      selectors: [".frame", ".card-container", ".card", ".post", ".canvas", ".artboard"],
      exportKind: "single_image_png",
      mode: "selector",
      isMultiFrame: false,
    };
  }
  if (ch.includes("facebook") && type.includes("post")) {
    return {
      width: 1200,
      height: 630,
      selectors: [".frame", ".card-container", ".card", ".post", ".canvas", ".artboard"],
      exportKind: "single_image_png",
      mode: "selector",
      isMultiFrame: false,
    };
  }
  return {
    width: 1200,
    height: 627,
    selectors: [".card-container", ".card", ".post", ".canvas", ".artboard"],
    exportKind: "single_image_png",
    mode: "selector",
    isMultiFrame: false,
  };
};

/**
 * Detect if HTML has a constrained container width (e.g., min(360px, ...))
 * and return the original design width for scaling calculations.
 */
const detectDesignWidth = (htmlContent) => {
  const constraints = [
    /min\((\d+)px,\s*calc/,
    /min\((\d+)px,\s*100%/,
    /width:\s*(\d+)px\s*;/,
    /width:\s*(\d+)px\s*!important/,
  ];
  for (const re of constraints) {
    const m = htmlContent.match(re);
    if (m) return parseInt(m[1], 10);
  }
  return null;
};

/**
 * Build CSS overrides for multi-frame export at target width.
 * Scales container, fonts, spacing proportionally to the ratio.
 */
const buildExportOverrides = (cfg, htmlContent, frameCount) => {
  const designWidth = detectDesignWidth(htmlContent);
  const ratio = designWidth ? cfg.width / designWidth : 1;

  const lines = [];

  // Body: center, no padding, dark background for reels/stories
  if (cfg.mode === "viewport") {
    lines.push(`body {
      padding: 0 !important;
      margin: 0 !important;
      gap: 0 !important;
      background: var(--dark, #0a0f16) !important;
      min-height: ${cfg.height}px;
      display: flex;
      justify-content: center;
      align-items: center;
    }`);
  }

  // Hide shield/metadata
  lines.push(`.shield { display: none !important; }`);

  // Hide progress bar
  lines.push(`.progress { display: none !important; }`);

  // Disable CSS transitions on all track/wrapper elements — prevents blur/mid-transition captures
  lines.push(`.reels-track { transition: none !important; }`);
  lines.push(`.carousel-track { transition: none !important; }`);
  lines.push(`.frame-wrapper, .reels-viewport, .carousel-viewport { transition: none !important; }`);

  // 3-zone structure: header-zone (top), content-creative (center), bottom-accent + progress-bar (bottom)
  lines.push(`.header-zone { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 2 !important; padding: 60px 80px 0 !important; }`);
  lines.push(`.slide-content { position: relative !important; z-index: 2 !important; width: 100% !important; padding: 0 80px !important; display: flex !important; flex-direction: column !important; justify-content: center !important; }`);
  lines.push(`.content-creative { display: flex !important; flex-direction: column !important; justify-content: center !important; }`);
  lines.push(`.slide { justify-content: center !important; align-items: center !important; }`);
  lines.push(`.slide-inner { display: flex !important; flex-direction: column !important; justify-content: center !important; }`);
  lines.push(`.slide-inner > div { flex: none !important; }`);
  lines.push(`.screen { justify-content: center !important; padding-top: 0 !important; }`);

  // Font scaling: ratio 1080/420 = 2.57 (or 1920/380 = 5.05 for stories/reels)
  lines.push(`.headline { font-size: 67px !important; line-height: 1.1 !important; margin-bottom: 24px !important; font-family: 'Playfair Display', serif !important; font-weight: 800 !important; }`);
  lines.push(`.headline.lg { font-size: 77px !important; margin-bottom: 20px !important; }`);
  lines.push(`.headline.sm { font-size: 51px !important; }`);
  lines.push(`.body-text { font-size: 36px !important; line-height: 1.45 !important; }`);
  lines.push(`.body-text.sm { font-size: 33px !important; }`);
  lines.push(`.sub-text { font-size: 39px !important; max-width: 820px !important; line-height: 1.4 !important; }`);
  lines.push(`.accent-line { width: 103px !important; height: 8px !important; margin-bottom: 31px !important; border-radius: 5px !important; }`);
  lines.push(`.header-bar .label { font-size: 23px !important; letter-spacing: 3.9px !important; text-transform: uppercase !important; font-weight: 700 !important; }`);
  lines.push(`.header-bar .num { font-size: 26px !important; }`);
  lines.push(`.accent-highlight { font-weight: 700 !important; }`);
  lines.push(`.cta-btn { font-size: 28px !important; padding: 36px 82px !important; }`);
  lines.push(`.tag { font-size: 26px !important; letter-spacing: 5.2px !important; text-transform: uppercase !important; font-weight: 600 !important; margin-bottom: 10px !important; }`);
  lines.push(`.feature-item { padding: 26px 0 !important; }`);
  lines.push(`.feature-label { font-size: 33px !important; font-weight: 600 !important; }`);
  lines.push(`.feature-desc { font-size: 28px !important; margin-top: 5px !important; }`);
  lines.push(`.frame-title { font-size: 93px !important; line-height: 1.1 !important; margin-bottom: 41px !important; }`);
  lines.push(`.frame-body { font-size: 46px !important; line-height: 1.35 !important; }`);
  lines.push(`.frame-cta { font-size: 41px !important; }`);
  lines.push(`.frame-number { font-size: 31px !important; }`);
  lines.push(`.timestamp { font-size: 31px !important; }`);
  lines.push(`.story-title { font-size: 82px !important; line-height: 1.05 !important; }`);
  lines.push(`.story-sub { font-size: 41px !important; line-height: 1.4 !important; }`);
  lines.push(`.story-number { font-size: 72px !important; }`);
  lines.push(`.story-question { font-size: 46px !important; line-height: 1.3 !important; }`);
  lines.push(`.story-cta { font-size: 36px !important; }`);

  // Hide page chrome: header, compliance card, metadata blocks
  lines.push(`.header, .compliance, .render-info, .asset-meta, .page-header, .page-footer, .preview-header, .preview-footer { display: none !important; }`);

  if (cfg.mode === "viewport" && designWidth && ratio > 1) {
    // Scale container to target width
    if (cfg.containerSelector) {
      lines.push(`${cfg.containerSelector} {
        width: ${cfg.width}px !important;
        height: ${cfg.height}px !important;
        max-width: none !important;
        min-width: ${cfg.width}px !important;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
        overflow: visible !important;
      }`);
    }

    // Scale carousel container/viewport chain
    lines.push(`.carousel-container { width: ${cfg.width}px !important; height: ${cfg.height}px !important; max-width: none !important; }`);
    lines.push(`.carousel-viewport { width: ${cfg.width}px !important; height: ${cfg.height}px !important; max-width: none !important; min-width: ${cfg.width}px !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; }`);
    lines.push(`.reels-viewport { width: ${cfg.width}px !important; height: ${cfg.height}px !important; max-width: none !important; min-width: ${cfg.width}px !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; }`);

    // Scale wrapper — disable transition for clean positioning
    if (cfg.wrapperSelector) {
      lines.push(`${cfg.wrapperSelector} { transition: none !important; }`);
    }

    // Scale each story/slide to fill the container width
    lines.push(`.story, .slide, .frame { width: ${cfg.width}px !important; height: ${cfg.height}px !important; min-width: ${cfg.width}px !important; flex-shrink: 0 !important; }`);

    // Scale all font sizes proportionally
    lines.push(`.title { font-size: ${Math.round(52 * ratio)}px !important; }`);
    lines.push(`.body { font-size: ${Math.round(16 * ratio)}px !important; margin-top: ${Math.round(16 * ratio)}px !important; }`);
    lines.push(`.kicker { font-size: ${Math.round(10 * ratio)}px !important; }`);
    lines.push(`.time { font-size: ${Math.round(11 * ratio)}px !important; }`);
    lines.push(`.chip { font-size: ${Math.round(10 * ratio)}px !important; padding: ${Math.round(8 * ratio)}px ${Math.round(12 * ratio)}px !important; gap: ${Math.round(6 * ratio)}px !important; }`);
    lines.push(`.number { font-size: ${Math.round(28 * ratio)}px !important; }`);
    lines.push(`.number-label { font-size: ${Math.round(10 * ratio)}px !important; }`);
    lines.push(`.cta { font-size: ${Math.round(11 * ratio)}px !important; padding: ${Math.round(12 * ratio)}px ${Math.round(16 * ratio)}px !important; margin-top: ${Math.round(24 * ratio)}px !important; }`);

    // Scale spacing
    lines.push(`.screen { padding: ${Math.round(28 * ratio)}px ${Math.round(24 * ratio)}px ${Math.round(22 * ratio)}px !important; }`);
    lines.push(`.topline { top: ${Math.round(28 * ratio)}px !important; left: ${Math.round(24 * ratio)}px !important; right: ${Math.round(24 * ratio)}px !important; gap: ${Math.round(12 * ratio)}px !important; }`);
    lines.push(`.chips { bottom: ${Math.round(22 * ratio)}px !important; left: ${Math.round(24 * ratio)}px !important; right: ${Math.round(24 * ratio)}px !important; gap: ${Math.round(8 * ratio)}px !important; }`);
    lines.push(`.number-grid { gap: ${Math.round(12 * ratio)}px !important; margin-top: ${Math.round(20 * ratio)}px !important; }`);
    lines.push(`.number-card { padding: ${Math.round(14 * ratio)}px !important; border-radius: ${Math.round(12 * ratio)}px !important; }`);

    // Stories-specific scaling (headlines, body text, scale items, CTA, etc.)
    lines.push(`.headline { font-size: ${Math.round(32 * ratio)}px !important; margin-bottom: ${Math.round(12 * ratio)}px !important; }`);
    lines.push(`.headline.sm { font-size: ${Math.round(26 * ratio)}px !important; }`);
    lines.push(`.headline.cta { font-size: ${Math.round(28 * ratio)}px !important; }`);
    lines.push(`.subhead { font-size: ${Math.round(16 * ratio)}px !important; margin-bottom: ${Math.round(16 * ratio)}px !important; }`);
    lines.push(`.scale-item { gap: ${Math.round(14 * ratio)}px !important; margin-bottom: ${Math.round(18 * ratio)}px !important; }`);
    lines.push(`.scale-num { width: ${Math.round(44 * ratio)}px !important; height: ${Math.round(44 * ratio)}px !important; font-size: ${Math.round(18 * ratio)}px !important; border-width: ${Math.round(2 * ratio)}px !important; }`);
    lines.push(`.scale-text { font-size: ${Math.round(18 * ratio)}px !important; padding-top: ${Math.round(2 * ratio)}px !important; }`);
    lines.push(`.cta-btn { padding: ${Math.round(14 * ratio)}px ${Math.round(36 * ratio)}px !important; font-size: ${Math.round(14 * ratio)}px !important; letter-spacing: ${Math.round(1 * ratio)}px !important; border-width: ${Math.round(2 * ratio)}px !important; }`);
    lines.push(`.link-sticker { padding: ${Math.round(10 * ratio)}px ${Math.round(20 * ratio)}px !important; font-size: ${Math.round(12 * ratio)}px !important; margin-top: ${Math.round(18 * ratio)}px !important; gap: ${Math.round(6 * ratio)}px !important; }`);
    lines.push(`.accent-line { width: ${Math.round(40 * ratio)}px !important; height: ${Math.round(3 * ratio)}px !important; margin-bottom: ${Math.round(16 * ratio)}px !important; }`);
    lines.push(`.story-content { padding: ${Math.round(60 * ratio)}px ${Math.round(28 * ratio)}px ${Math.round(80 * ratio)}px !important; }`);

    // Handle inline font-size overrides on specific elements (e.g., Frame 3 title, Frame 4 title)
    // These are set via style="" attributes — we override via data attributes or JS
    // The JS below will handle inline scaling

    lines.push(`/* Export scale ratio: ${ratio.toFixed(2)}x (design: ${designWidth}px → target: ${cfg.width}px) */`);
  }

  return lines.join("\n");
};

const relFromRoot = (absolute) => path.relative(root, absolute).split(path.sep).join("/");
const absFromClient = (rel) => path.join(clientDir, String(rel || ""));

const readJson = (file, fallback = null) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
};

const captionsData = readJson(captionsPath, { captions: [] });
const captionById = new Map(
  (captionsData?.captions || []).map((row) => [String(row.asset_id || "").trim().toUpperCase(), row]),
);

const socialAssets = Array.isArray(manifest?.assets?.social) ? manifest.assets.social : [];
const selectedAssets = socialAssets.filter((asset) => {
  const status = canonicalStatus(asset?.status);
  const relPreview = String(asset?.canonicalPreviewPath || "").trim();
  if (relPreview.length === 0) return false;
  if (assetFilterSet) {
    return assetFilterSet.has(String(asset?.assetId || "").trim().toUpperCase());
  }
  return exportStatuses.has(status);
});

fs.mkdirSync(publishDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const exportRows = [];

for (const asset of selectedAssets) {
  const assetId = String(asset?.assetId || "").trim().toUpperCase();
  const relPreview = String(asset?.canonicalPreviewPath || "").trim();
  const absPreview = absFromClient(relPreview);
  const assetType = String(asset?.type || "").trim();
  const assetChannel = String(asset?.channel || "").trim();
  const status = canonicalStatus(asset?.status);

  if (!assetId || !relPreview) continue;
  if (!fs.existsSync(absPreview)) {
    failures.push(`preview missing for ${assetId}: ${relPreview}`);
    continue;
  }

  // ── CAPTION COMPLETENESS CHECKPOINT ──
  // Block export if asset is scheduled/published-bound and has no caption.
  // Caption is required for live_api publishing — exporting PNG without caption wastes pipeline time.
  const captionRow = captionById.get(assetId);
  const hasCaption = captionRow && (
    String(captionRow.final_caption || "").trim().length > 0 ||
    String(captionRow.first_line_hook || "").trim().length > 0
  );
  if (!hasCaption && ["scheduled", "ready_to_schedule"].includes(status)) {
    notes.push(`caption missing for ${assetId} — export blocked (caption required for publishing)`);
    continue;
  }

  const htmlContent = fs.readFileSync(absPreview, "utf8");
  const cfg = typeConfig(assetType, assetChannel);
  const page = await browser.newPage({
    viewport: { width: cfg.width, height: cfg.height },
    deviceScaleFactor: 1,
  });

  const fileUrl = `file://${absPreview}`;

  // Build export-specific CSS overrides
  const cssOverrides = buildExportOverrides(cfg, htmlContent, 1);

  try {
    await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 30000 });
  } catch {
    console.error(`  WARN: failed networkidle for ${assetId}, continuing`);
  }

  // Apply CSS overrides
  try {
    await page.addStyleTag({ content: cssOverrides });
  } catch {
    console.error(`  WARN: failed to add CSS overrides for ${assetId}`);
  }

  // Wait for fonts and images to render
  await page.waitForTimeout(1500);

  // Handle inline font-size scaling for multi-frame viewport mode
  if (cfg.mode === "viewport" && cfg.isMultiFrame) {
    const designWidth = detectDesignWidth(htmlContent);
    const ratio = designWidth ? cfg.width / designWidth : 1;
    if (ratio > 1) {
      await page.evaluate((scaleRatio) => {
        // Scale inline font-size values
        document.querySelectorAll("[style]").forEach((el) => {
          const style = el.getAttribute("style");
          const updated = style.replace(
            /font-size:\s*(\d+(?:\.\d+)?)px/g,
            (_match, val) => `font-size: ${Math.round(parseFloat(val) * scaleRatio)}px`
          );
          if (updated !== style) el.setAttribute("style", updated);
        });
      }, ratio);
    }
  }

  // Hide chrome UI elements and metadata blocks
  try {
    await page.evaluate(() => {
      document.body.classList.add("export-mode");
      document.querySelectorAll(
        ".swipe-arrow, .progress-label, .ig-header, .ig-dots, .ig-actions, .ig-caption, .progress-track, .story-dots, .preview-controls, .story-dot, .header, .compliance, .render-info, .asset-meta, .page-header, .page-footer, .preview-header, .preview-footer"
      ).forEach((el) => (el.style.display = "none"));
    });
  } catch {
    // Non-fatal
  }

  const assetDir = path.join(publishDir, assetId.toLowerCase());
  fs.mkdirSync(assetDir, { recursive: true });

  let captured = [];
  let matchedSelector = "";

  if (cfg.mode === "viewport" && cfg.isMultiFrame) {
    // Multi-frame viewport export: position each frame and screenshot the container
    const frameCount = await page.evaluate((wrapperSel) => {
      const wrapper = document.querySelector(wrapperSel);
      if (!wrapper) return 0;
      return wrapper.children.length;
    }, cfg.wrapperSelector);

    if (frameCount === 0) {
      failures.push(`${assetId}: no frames found in wrapper`);
      await page.close();
      continue;
    }

    for (let i = 0; i < frameCount; i++) {
      await page.evaluate((data) => {
        const { wrapperSel, frameIndex } = data;
        const wrapper = document.querySelector(wrapperSel);
        if (wrapper) {
          wrapper.style.transition = "none";
          wrapper.style.transform = "none";
          wrapper.querySelectorAll(".frame").forEach((frame, idx) => {
            frame.style.display = idx === frameIndex ? "flex" : "none";
          });
        }
        // Also freeze track transition as fallback
        const track = document.querySelector(".reels-track, .carousel-track");
        if (track) {
          track.style.transition = "none";
          track.style.transform = "none";
        }
      }, { wrapperSel: cfg.wrapperSelector, frameIndex: i });

      await page.waitForTimeout(600);

      const fileName = `${assetId.toLowerCase()}-${String(i + 1).padStart(2, "0")}.png`;
      const outAbs = path.join(assetDir, fileName);

      try {
        const frameSel = cfg.selectors && cfg.selectors.length > 0 ? cfg.selectors[0] : ".frame";
        const frameLocator = page.locator(frameSel).nth(i);
        await frameLocator.screenshot({ path: outAbs, type: "png" });
        captured.push(outAbs);
      } catch {
        // Fallback to full page
        await page.screenshot({ path: outAbs, fullPage: false });
        captured.push(outAbs);
      }
    }
    matchedSelector = `viewport:${cfg.containerSelector}`;
  } else {
    // Selector-based export (carousels with .slide, single posts, etc.)
    for (const selector of cfg.selectors) {
      const count = await page.locator(selector).count();
      if (count <= 0) continue;
      matchedSelector = selector;
      for (let i = 0; i < count; i += 1) {
        const fileName = `${assetId.toLowerCase()}-${String(i + 1).padStart(2, "0")}.png`;
        const outAbs = path.join(assetDir, fileName);
        try {
          // For carousels: make each slide fill the full canvas before screenshot.
          // Without this, Playwright captures slides at their natural min-width (e.g. 420px)
          // resulting in content rendered at preview scale inside a full-size image.
          if (cfg.isMultiFrame) {
            // Export at native preview scale, then resize to target with ImageMagick.
            // CSS variable–based layouts fail to resize via Playwright's clip because
            // the layout engine caps internal dimensions regardless of CSS overrides.
            // ImageMagick resize with ! (ignore aspect) guarantees exact target dimensions.
            await page.evaluate(
              (data) => {
                const { w, h } = data;
                // Freeze all transitions
                const track = document.querySelector(".reels-track, .carousel-track");
                if (track) track.style.transition = "none";
                document.body.classList.add("export-mode");
                document.body.style.padding = "0";
                document.body.style.margin = "0";
                // Hide non-essential chrome
                const header = document.querySelector(".header");
                if (header) header.style.display = "none";
                document.querySelectorAll(".slide").forEach((s, j) => {
                  s.style.display = j === data.idx ? "flex" : "none";
                  s.style.justifyContent = "center";
                  s.style.alignItems = "center";
                });
              },
              { idx: i, w: cfg.width, h: cfg.height },
            );

            // Screenshot at native scale
            const fileName = `${assetId.toLowerCase()}-${String(i + 1).padStart(2, "0")}-native.png`;
            const nativeAbs = path.join(assetDir, fileName);
            await page.screenshot({ path: nativeAbs, type: "png" });

            // Resize to exact target dimensions with ImageMagick
            const finalFileName = `${assetId.toLowerCase()}-${String(i + 1).padStart(2, "0")}.png`;
            const outAbs = path.join(assetDir, finalFileName);
            try {
              execSync(
                `convert "${nativeAbs}" -resize ${cfg.width}x${cfg.height}! "${outAbs}"`,
                { stdio: "pipe" },
              );
              fs.unlinkSync(nativeAbs);
              captured.push(outAbs);
            } catch (e) {
              failures.push(`imagemagick resize failed for ${assetId} frame ${i + 1}: ${e.message}`);
            }
            continue;
          }
          const finalFileName = `${assetId.toLowerCase()}-${String(i + 1).padStart(2, "0")}.png`;
          const outAbs = path.join(assetDir, finalFileName);
          try {
            if (cfg.isMultiFrame) {
              // Screenshot the full page — the active slide fills the viewport at full resolution.
              await page.screenshot({ path: outAbs, type: "png", clip: { x: 0, y: 0, width: cfg.width, height: cfg.height } });
            } else {
              const locator = page.locator(selector).nth(i);
              await locator.screenshot({ path: outAbs });
            }
            captured.push(outAbs);
          } catch {
            failures.push(`failed screenshot ${assetId} selector=${selector} index=${i + 1}`);
          }
        } catch {
          failures.push(`failed screenshot ${assetId} selector=${selector} index=${i + 1}`);
        }
      }
      if (captured.length > 0) break;
    }

    if (captured.length === 0) {
      const outAbs = path.join(assetDir, `${assetId.toLowerCase()}-01.png`);
      try {
        await page.screenshot({ path: outAbs, fullPage: false });
        captured = [outAbs];
        matchedSelector = "(viewport)";
      } catch {
        failures.push(`failed fallback screenshot for ${assetId}`);
      }
    }
  }

  await page.close();

  exportRows.push({
    asset_id: assetId,
    type: assetType,
    channel: assetChannel,
    status,
    source_preview_path: relPreview,
    export_kind: cfg.exportKind,
    selector_used: matchedSelector || "(none)",
    files: captured.map((abs) => relFromRoot(abs)),
  });
}

await browser.close();

const result = {
  version: "1.0.0",
  client,
  generatedAt: nowIso,
  sourceManifestPath: relFromRoot(manifestPath),
  exportDir: relFromRoot(publishDir),
  selectedAssets: selectedAssets.length,
  exportedAssets: exportRows.length,
  exports: exportRows,
  failures,
  notes,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

// ── DIMENSION VALIDATION ──
// After export, verify every PNG has correct dimensions and minimum file size.
// Fail if any image is wrong size or suspiciously small (< 100KB = likely blank/corrupt).
const validationErrors = [];
for (const row of exportRows) {
  for (const relFile of row.files) {
    const absFile = path.join(root, relFile);
    if (!fs.existsSync(absFile)) {
      validationErrors.push(`${relFile}: file missing`);
      continue;
    }
    try {
      const identify = execSync(`identify -format "%w %h %b" "${absFile}"`, { encoding: "utf8" }).trim();
      const [w, h, size] = identify.split(" ");
       const channel = String(row.channel || "").trim().toLowerCase();
       const type = String(row.type || "").trim().toLowerCase();
       const expectedW = channel.includes("facebook") ? 1200 : (type.includes("reels") || type.includes("stories") ? 1080 : 1080);
       const expectedH = channel.includes("facebook") ? 630 : (type.includes("reels") || type.includes("stories") ? 1920 : 1350);
      const sizeBytes = parseFloat(size);
      const isKB = size.endsWith("KB") || size.endsWith("iB");
      const isMB = size.endsWith("MB");
      const byteSize = isKB ? sizeBytes * 1024 : isMB ? sizeBytes * 1024 * 1024 : sizeBytes;
      if (parseInt(w, 10) !== expectedW || parseInt(h, 10) !== expectedH) {
        validationErrors.push(`${relFile}: expected ${expectedW}x${expectedH}, got ${w}x${h}`);
      }
      if (byteSize < 100 * 1024) {
        validationErrors.push(`${relFile}: file too small (${size}), likely blank or mid-transition capture`);
      }
    } catch (e) {
      validationErrors.push(`${relFile}: identify failed — ${e.message}`);
    }
  }
}
if (validationErrors.length > 0) {
  console.error("\nEXPORT VALIDATION FAILED:");
  validationErrors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: failures.length === 0,
      client,
      outputPath: relFromRoot(outputPath),
      selectedAssets: result.selectedAssets,
      exportedAssets: result.exportedAssets,
      failures,
      notes,
      validation: "PASS",
    },
    null,
    2,
  ),
);

process.exit(failures.length === 0 ? 0 : 1);
