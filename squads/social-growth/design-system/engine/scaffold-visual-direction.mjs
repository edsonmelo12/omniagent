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

function pickStyle(contract, overrideStyle) {
  return String(overrideStyle || contract.default_style || "premium-editorial").trim();
}

function defaultTitle(format) {
  return {
    "facebook-post": "Título principal do post",
    "social-single-post": "Título principal do post",
    "instagram-carousel": "Título principal da capa",
    "linkedin-carousel": "Título principal da capa",
    "reels-sequence": "Gancho do primeiro frame",
    "stories-sequence": "Mensagem principal",
    "pinterest-pin": "Título principal do pin",
  }[format] || "Título principal";
}

function defaultBody(format) {
  return {
    "facebook-post": "Texto de apoio com uma ideia principal e leitura rápida.",
    "social-single-post": "Texto de apoio com uma ideia principal e leitura rápida.",
    "instagram-carousel": "Contextualize o problema e avance uma ideia por slide.",
    "linkedin-carousel": "Expanda o raciocínio com mais clareza e prova.",
    "reels-sequence": "Texto curto, com ritmo e foco em retenção.",
    "stories-sequence": "Uma frase curta que leva à ação.",
    "pinterest-pin": "Resumo direto do valor da peça.",
  }[format] || "Texto de apoio";
}

function buildCoverSlide(format, args) {
  return {
    type: "cover",
    align: "center",
    eyebrow: args.eyebrow || "Destaque",
    title: args.title || defaultTitle(format),
    body: args.body || defaultBody(format),
    textVariant: "light",
    contrast_strategy: "dark-overlay",
    background: {
      type: args.backgroundType || "image",
      src: args.backgroundSrc || "",
      position: "center",
      overlay: "rgba(0,0,0,0.52)",
    },
  };
}

function buildMultiSlides(format, contract, args) {
  const slidePlan = Array.isArray(contract.slide_plan) ? contract.slide_plan : [];
  return slidePlan.map((step, index) => {
    const isCover = index === 0;
    const type = isCover ? "cover" : step === "cta" ? "cta" : "content";
    return {
      type,
      align: isCover || step === "cta" ? "center" : "left",
      eyebrow: isCover ? (args.eyebrow || "Destaque") : step.toUpperCase(),
      title: isCover ? (args.title || defaultTitle(format)) : `${step} ${index}`,
      body: isCover ? (args.body || defaultBody(format)) : `Desenvolva o ponto ${index + 1} com clareza.`,
      textVariant: "light",
      contrast_strategy: isCover ? "dark-overlay" : "zone-isolation",
      background: isCover ? {
        type: "image",
        src: args.backgroundSrc || "",
        position: "center",
        overlay: "rgba(0,0,0,0.52)",
      } : {
        type: "solid",
        color: index % 2 === 0 ? "#F5F0E8" : "#E8D5C4",
      },
    };
  });
}

function buildDirection(format, contract, args) {
  const style = pickStyle(contract, args.style);
  const title = args.title || defaultTitle(format);
  const deckLabel = args.deckLabel || (format.includes("carousel") ? "carrossel" : "post");
  const isSingle = contract.mode === "single";
  const slides = isSingle ? [buildCoverSlide(format, args)] : buildMultiSlides(format, contract, args);

  const direction = {
    asset_id: args.assetId || `example-${format}`,
    client: args.client || "Template",
    brand: args.brand || "MARCA",
    style,
    format,
    title,
    deck_label: deckLabel,
    topic: args.topic || "Tema do post",
    footer: args.footerNote || args.footer || "@marca",
    footerNote: args.footerNote || args.footer || "@marca",
    design_tokens: {},
    design_system: true,
    engine_version: "compose.mjs",
    canvas: contract.canvas,
    preview: {
      width: Math.round(contract.canvas.width / 2.5714285714),
      height: Math.round(contract.canvas.height / 2.5714285714),
    },
    slides,
  };

  if (isSingle) {
    direction.caption = args.caption || `${direction.title}. ${direction.topic}.`;
    direction.hashtags = args.hashtags ? String(args.hashtags).split(/\s+/).filter(Boolean) : [];
  }

  return direction;
}

function main() {
  const args = parseArgs(process.argv);
  const format = String(args.format || "").trim();
  if (!format) {
    console.error("Uso: node scaffold-visual-direction.mjs --format <format> [--style <preset>] [--asset-id <id>] [--output <path>]");
    process.exit(2);
  }

  const system = readJson(contractPath);
  const contract = system.formats?.[format];
  if (!contract) {
    console.error(`Formato desconhecido: ${format}`);
    process.exit(1);
  }

  const direction = buildDirection(format, contract, args);
  const outputPath = args.output
    ? path.resolve(process.cwd(), args.output)
    : path.resolve(process.cwd(), "tmp", `${direction.asset_id}-visual-direction.json`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(direction, null, 2)}\n`, "utf8");
  console.log(`Visual direction gerada: ${outputPath}`);
}

main();
