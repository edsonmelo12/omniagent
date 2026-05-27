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

function createSingleManifest(format, contract, args) {
  const title = defaultTitle(format);
  const body = defaultBody(format);
  const headlineKey = format === "social-single-post" ? "headline" : "title";
  const coverSlide = {
    type: "cover",
    align: "center",
    eyebrow: args.eyebrow || "Destaque",
    title,
    body,
    textVariant: "light",
    contrast_strategy: "dark-overlay",
    background: {
      type: args.backgroundType || "image",
      src: args.backgroundSrc || "",
      position: "center",
      overlay: "rgba(0,0,0,0.52)",
    },
  };
  const manifest = {
    asset_id: args.assetId || `example-${format}`,
    client: args.client || "Template",
    brand: args.brand || "MARCA",
    style: args.style || contract.default_style || "premium-editorial",
    format,
    title: args.title || title,
    eyebrow: args.eyebrow || "Destaque",
    body: args.body || body,
    cta: args.cta || "Saiba mais",
    footerNote: args.footerNote || "@marca",
    showDivider: true,
    background: coverSlide.background,
    slides: [coverSlide],
    design_tokens: {},
  };

  manifest[headlineKey] = args.headline || title;
  if (args.listHtml) manifest.listHtml = args.listHtml;
  return manifest;
}

function createMultiManifest(format, contract, args) {
  const slidePlan = Array.isArray(contract.slide_plan) ? contract.slide_plan : [];
  const slides = slidePlan.map((step, index) => {
    const isCover = index === 0;
    return {
      type: isCover ? "cover" : step === "cta" ? "cta" : "content",
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

  return {
    asset_id: args.assetId || `example-${format}`,
    client: args.client || "Template",
    brand: args.brand || "MARCA",
    style: args.style || contract.default_style || "editorial-magazine",
    format,
    title: args.title || defaultTitle(format),
    deck_label: args.deckLabel || "sequência",
    topic: args.topic || "Tema do post",
    footer: args.footerNote || "@marca",
    channel: args.channel || (format === "linkedin-carousel" ? "LinkedIn" : "Instagram"),
    objective: args.objective || "Educacional",
    design_tokens: {},
    slides,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const format = String(args.format || "").trim();
  if (!format) {
    console.error("Uso: node scaffold-manifest.mjs --format <format> [--style <preset>] [--asset-id <id>] [--output <path>]");
    process.exit(2);
  }

  const system = readJson(contractPath);
  const contract = system.formats?.[format];
  if (!contract) {
    console.error(`Formato desconhecido: ${format}`);
    process.exit(1);
  }

  const manifest = contract.mode === "single"
    ? createSingleManifest(format, contract, args)
    : createMultiManifest(format, contract, args);

  const outputPath = args.output
    ? path.resolve(process.cwd(), args.output)
    : path.resolve(process.cwd(), "tmp", `${manifest.asset_id}.json`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Manifesto-base gerado: ${outputPath}`);
}

main();
