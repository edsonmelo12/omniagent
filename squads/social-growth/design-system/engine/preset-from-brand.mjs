#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesDir = path.resolve(__dirname, "..", "styles");

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
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function tokenSource(args) {
  if (args.json) {
    const data = readJson(path.resolve(process.cwd(), args.json));
    return { name: data.name, ...(data.tokens || {}) };
  }
  return {
    name: args.name,
    bg: args.bg || args.primary,
    bg_alt: args.bgAlt || args.secondary || args.primary,
    text_heading: args.headingColor || "#ffffff",
    text_body: args.bodyColor || "#f2f2f2",
    text_muted: args.mutedColor || "#b7b7b7",
    accent: args.accent,
    heading_font: args.heading || "Playfair Display",
    body_font: args.body || "DM Sans",
    noise_opacity: args.noise || 0.035,
  };
}

function validate(tokens) {
  const required = ["name", "bg", "bg_alt", "text_heading", "text_body", "accent", "heading_font", "body_font"];
  const missing = required.filter((field) => !tokens[field]);
  if (missing.length) {
    throw new Error(`Tokens obrigatórios ausentes: ${missing.join(", ")}`);
  }
  if (!slug(tokens.name)) {
    throw new Error("Nome inválido. O preset precisa gerar um slug não vazio.");
  }
  const colorFields = ["bg", "bg_alt", "text_heading", "text_body", "text_muted", "accent"];
  const invalidColors = colorFields.filter((field) => tokens[field] && !isCssColorLike(tokens[field]));
  if (invalidColors.length) {
    throw new Error(`Valores de cor inválidos: ${invalidColors.join(", ")}`);
  }
}

function isCssColorLike(value) {
  return /^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\(|rgba\(|hsl\(|hsla\()/.test(String(value).trim());
}

function cssFor(tokens) {
  const name = slug(tokens.name);
  return `:root {
  --style-name: "${name}";
  --style-bg: ${tokens.bg};
  --style-bg-alt: ${tokens.bg_alt};
  --style-surface: rgba(255, 255, 255, 0.07);
  --style-surface-strong: rgba(255, 255, 255, 0.12);
  --style-text-heading: ${tokens.text_heading};
  --style-text-body: ${tokens.text_body};
  --style-text-muted: ${tokens.text_muted || "#b7b7b7"};
  --style-accent: ${tokens.accent};
  --style-accent-soft: color-mix(in srgb, ${tokens.accent} 22%, transparent);
  --style-border: color-mix(in srgb, ${tokens.accent} 42%, transparent);
  --style-heading-font: "${tokens.heading_font}", Georgia, serif;
  --style-body-font: "${tokens.body_font}", Arial, sans-serif;
  --style-noise-opacity: ${tokens.noise_opacity || 0.035};
  --style-vignette-opacity: ${tokens.vignette_opacity || 0.58};
  --style-gradient: radial-gradient(circle at 22% 12%, color-mix(in srgb, ${tokens.accent} 20%, transparent), transparent 34%), linear-gradient(145deg, ${tokens.bg} 0%, ${tokens.bg_alt} 58%, ${tokens.bg} 100%);
}
`;
}

function main() {
  const args = parseArgs(process.argv);
  const tokens = tokenSource(args);
  validate(tokens);
  const name = slug(tokens.name);
  fs.mkdirSync(stylesDir, { recursive: true });
  const outPath = path.join(stylesDir, `${name}.css`);
  if (fs.existsSync(outPath) && !args.force) {
    throw new Error(`Preset já existe: ${outPath}. Use --force para sobrescrever.`);
  }
  fs.writeFileSync(outPath, cssFor(tokens), "utf8");
  console.log(`Preset gerado: ${outPath}`);
}

try {
  main();
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exit(1);
}
