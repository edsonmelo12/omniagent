#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contractPath = path.join(rootDir, "contracts", "post-system.json");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function detectFormat(packageText) {
  const lower = packageText.toLowerCase();
  if (lower.includes("facebook post")) return "facebook-post";
  if (lower.includes("instagram feed")) return "instagram-carousel";
  if (lower.includes("instagram reels") || lower.includes("reels")) return "reels-sequence";
  if (lower.includes("instagram stories") || lower.includes("stories")) return "stories-sequence";
  if (lower.includes("linkedin post") || lower.includes("linkedin article")) return "linkedin-carousel";
  if (lower.includes("pinterest pin")) return "pinterest-pin";
  return "social-single-post";
}

function pickSection(packageText, header) {
  const lines = packageText.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === header.toLowerCase());
  if (start < 0) return [];
  const section = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^##\s+/.test(line) && i > start + 1) break;
    section.push(line);
  }
  return section;
}

function extractHeading(sectionLines, prefixes) {
  for (const line of sectionLines) {
    const trimmed = line.trim();
    for (const prefix of prefixes) {
      if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
        return trimmed.replace(new RegExp(`^${prefix}[:\-]\s*`, "i"), "").trim();
      }
    }
  }
  return "";
}

function extractTextAfterHeading(sectionLines, headings) {
  const normalized = headings.map((value) => value.toLowerCase());
  for (let i = 0; i < sectionLines.length; i += 1) {
    const trimmed = sectionLines[i].trim();
    if (!trimmed.startsWith("###")) continue;
    const heading = trimmed.replace(/^#+\s*/, "").trim().toLowerCase();
    if (!normalized.includes(heading)) continue;
    for (let j = i + 1; j < sectionLines.length; j += 1) {
      const next = sectionLines[j].trim();
      if (!next) continue;
      if (/^#+\s+/.test(next)) break;
      return next;
    }
  }
  return "";
}

function extractLabeledValue(sectionLines, labelRegex) {
  for (const line of sectionLines) {
    const trimmed = line.trim();
    const match = trimmed.match(labelRegex);
    if (!match) continue;
    const value = match[1]?.trim();
    if (value) return value;
  }
  return "";
}

function extractBullets(sectionLines) {
  return sectionLines
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+|^\d+\.\s+/, "").trim())
    .filter(Boolean);
}

function buildDirectionFromPackage(packagePath, contract, overrides = {}) {
  const text = readText(packagePath);
  const format = overrides.format || detectFormat(text);
  const style = overrides.style || contract.formats?.[format]?.default_style || "premium-editorial";
  const titleSection = pickSection(text, `## ${format.includes("carousel") ? "Instagram Feed" : format.includes("reels") ? "Instagram Reels" : format.includes("stories") ? "Instagram Stories" : format.includes("facebook") ? "Facebook Post" : format.includes("linkedin") ? "LinkedIn Post" : "Pinterest Pin"}`);
  let title = "Mensagem principal do asset";
  let body = title;

  if (format === "facebook-post" || format === "social-single-post") {
    title = extractTextAfterHeading(titleSection, ["theme", "idea", "abertura", "tema"]) || title;
    body = extractTextAfterHeading(titleSection, ["copy", "body", "abertura"]) || title;
  } else if (format === "instagram-carousel" || format === "linkedin-carousel") {
    title = extractLabeledValue(titleSection, /(?:-\s*)?Abertura(?:\s*\([^)]*\))?:\s*(.+)$/i)
      || extractTextAfterHeading(titleSection, ["tema", "theme", "idea"])
      || title;
    body = extractLabeledValue(titleSection, /(?:-\s*)?Fecho:\s*(.+)$/i)
      || extractLabeledValue(titleSection, /(?:-\s*)?Prova:\s*(.+)$/i)
      || extractTextAfterHeading(titleSection, ["copy by slide", "copy", "structure"])
      || title;
  } else if (format === "reels-sequence") {
    title = extractLabeledValue(titleSection, /(?:-\s*)?Abertura(?:\s*\([^)]*\))?:\s*(.+)$/i)
      || extractTextAfterHeading(titleSection, ["hook", "abertura", "tema", "idea"])
      || title;
    body = extractLabeledValue(titleSection, /(?:-\s*)?Beats?:\s*(.+)$/i)
      || extractLabeledValue(titleSection, /(?:-\s*)?Fecho:\s*(.+)$/i)
      || title;
  } else if (format === "stories-sequence") {
    title = extractLabeledValue(titleSection, /(?:-\s*)?Frame 1:\s*(.+)$/i)
      || extractTextAfterHeading(titleSection, ["sequence", "hook", "abertura"])
      || title;
    body = extractLabeledValue(titleSection, /(?:-\s*)?Frame 2:\s*(.+)$/i)
      || extractLabeledValue(titleSection, /(?:-\s*)?Fecho:\s*(.+)$/i)
      || title;
  } else if (format === "pinterest-pin") {
    title = extractTextAfterHeading(titleSection, ["idea", "tema", "theme"]) || title;
    body = extractLabeledValue(titleSection, /(?:-\s*)?Destination:\s*(.+)$/i)
      || extractLabeledValue(titleSection, /(?:-\s*)?Text on Pin:\s*(.+)$/i)
      || title;
  }
  const bullets = extractBullets(titleSection);
  const canvas = contract.formats?.[format]?.canvas || { width: 1080, height: 1350 };

  const base = {
    asset_id: overrides.assetId || `example-${format}`,
    client: overrides.client || "Template",
    brand: overrides.brand || "MARCA",
    style,
    format,
    title,
    deck_label: overrides.deckLabel || (format.includes("carousel") ? "carrossel" : "post"),
    topic: overrides.topic || title,
    footer: overrides.footerNote || "@marca",
    footerNote: overrides.footerNote || "@marca",
    design_tokens: {},
    design_system: true,
    engine_version: "compose.mjs",
    canvas,
    preview: {
      width: Math.round(canvas.width / 2.5714285714),
      height: Math.round(canvas.height / 2.5714285714),
    },
  };

  if (contract.formats?.[format]?.mode === "single") {
    base.slides = [
      {
        type: "cover",
        align: "center",
        eyebrow: overrides.eyebrow || "Destaque",
        title,
        body,
        textVariant: "light",
        contrast_strategy: "dark-overlay",
        background: {
          type: "image",
          src: overrides.backgroundSrc || "",
          position: "center",
          overlay: "rgba(0,0,0,0.52)",
        },
      },
    ];
    base.caption = overrides.caption || body;
    base.hashtags = Array.isArray(overrides.hashtags) ? overrides.hashtags : [];
    if (bullets.length) base.listHtml = bullets.map((item) => `<div class="feature-item"><span class="feature-dot"></span>${item}</div>`).join("");
  } else {
    const slidePlan = contract.formats?.[format]?.slide_plan || [];
    base.slides = slidePlan.map((step, index) => ({
      type: index === 0 ? "cover" : step === "cta" ? "cta" : "content",
      align: index === 0 || step === "cta" ? "center" : "left",
      eyebrow: index === 0 ? (overrides.eyebrow || "Destaque") : step.toUpperCase(),
      title: index === 0 ? title : `${step} ${index}`,
      body: index === 0 ? body : (bullets[index - 1] || `Desenvolva o ponto ${index + 1} com clareza.`),
      textVariant: "light",
      contrast_strategy: index === 0 ? "dark-overlay" : "zone-isolation",
      background: index === 0 ? {
        type: "image",
        src: overrides.backgroundSrc || "",
        position: "center",
        overlay: "rgba(0,0,0,0.52)",
      } : {
        type: "solid",
        color: index % 2 === 0 ? "#F5F0E8" : "#E8D5C4",
      },
    }));
  }

  return base;
}

function main() {
  const args = parseArgs(process.argv);
  const packagePath = args.package ? path.resolve(process.cwd(), args.package) : path.join(rootDir, "..", "output", "content", "content-production-package.md");
  const outputPath = args.output ? path.resolve(process.cwd(), args.output) : path.resolve(process.cwd(), "tmp", "visual-direction.json");

  if (!fs.existsSync(packagePath)) {
    console.error(`Pacote de conteúdo não encontrado: ${packagePath}`);
    process.exit(1);
  }

  const contract = readJson(contractPath);
  const direction = buildDirectionFromPackage(packagePath, contract, {
    format: args.format,
    style: args.style,
    assetId: args.assetId,
    client: args.client,
    brand: args.brand,
    deckLabel: args.deckLabel,
    topic: args.topic,
    footerNote: args.footerNote,
    eyebrow: args.eyebrow,
    caption: args.caption,
    backgroundSrc: args.backgroundSrc,
    hashtags: args.hashtags ? String(args.hashtags).split(/\s+/).filter(Boolean) : [],
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(direction, null, 2)}\n`, "utf8");
  console.log(`Visual direction gerada: ${outputPath}`);
}

main();
