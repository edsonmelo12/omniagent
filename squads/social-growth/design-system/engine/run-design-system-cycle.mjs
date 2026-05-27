#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

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

function main() {
  const args = parseArgs(process.argv);
  const packagePath = args.package
    ? path.resolve(process.cwd(), args.package)
    : path.resolve(rootDir, "..", "output", "content", "content-production-package.md");
  const outputDir = args.outputDir
    ? path.resolve(process.cwd(), args.outputDir)
    : path.resolve(rootDir, "..", "output", "creative");
  const directionPath = args.direction
    ? path.resolve(process.cwd(), args.direction)
    : path.join(outputDir, "visual-direction.json");

  if (!fs.existsSync(packagePath)) {
    console.error(`Pacote de conteúdo não encontrado: ${packagePath}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(directionPath), { recursive: true });

  const directionScript = path.join(rootDir, "engine", "generate-direction-from-package.mjs");
  const composeScript = path.join(rootDir, "engine", "compose.mjs");

  const directionArgs = [
    directionScript,
    "--package", packagePath,
    "--output", directionPath,
  ];

  if (args.assetId) directionArgs.push("--asset-id", args.assetId);
  if (args.client) directionArgs.push("--client", args.client);
  if (args.brand) directionArgs.push("--brand", args.brand);
  if (args.style) directionArgs.push("--style", args.style);
  if (args.topic) directionArgs.push("--topic", args.topic);
  if (args.deckLabel) directionArgs.push("--deck-label", args.deckLabel);
  if (args.footerNote) directionArgs.push("--footer-note", args.footerNote);
  if (args.eyebrow) directionArgs.push("--eyebrow", args.eyebrow);
  if (args.caption) directionArgs.push("--caption", args.caption);
  if (args.backgroundSrc) directionArgs.push("--background-src", args.backgroundSrc);
  if (args.hashtags) directionArgs.push("--hashtags", args.hashtags);
  if (args.format) directionArgs.push("--format", args.format);

  execFileSync("node", directionArgs, { stdio: "inherit" });

  const renderArgs = [
    composeScript,
    "--manifest", directionPath,
  ];

  execFileSync("node", renderArgs, { stdio: "inherit" });

  console.log(`Ciclo concluído: ${directionPath}`);
}

main();
