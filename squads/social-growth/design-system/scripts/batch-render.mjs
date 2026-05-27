#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const engineDir = path.resolve(__dirname, "..", "engine");
const rootDir = path.resolve(__dirname, "..", "..", "..", "..");

const requiredManifestFields = ["asset_id", "client", "style", "format"];

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function resolveManifests(manifestArg) {
  if (!manifestArg) {
    const dir = path.resolve(rootDir, "squads", "social-growth", "design-system", "manifests");
    const skipPatterns = ["post-preview", "example", "batch-render-report"];
    return fs.readdirSync(dir)
      .filter((f) => f.endsWith(".json") && !skipPatterns.some((p) => f.includes(p)))
      .map((f) => path.join(dir, f));
  }
  if (fs.statSync(manifestArg).isDirectory()) {
    return fs.readdirSync(manifestArg)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(manifestArg, f));
  }
  if (manifestArg.endsWith(".json")) {
    return [manifestArg];
  }
  const list = fs.readFileSync(manifestArg, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return list;
}

function validateManifest(manifest) {
  const missing = requiredManifestFields.filter((field) => !manifest[field]);
  if (missing.length) {
    return { valid: false, error: `Campos ausentes: ${missing.join(", ")}` };
  }
  const styleDir = path.resolve(rootDir, "squads", "social-growth", "design-system", "styles");
  const templateDir = path.resolve(rootDir, "squads", "social-growth", "design-system", "templates");
  if (!fs.existsSync(path.join(styleDir, `${manifest.style}.css`))) {
    return { valid: false, error: `Preset de estilo não encontrado: ${manifest.style}` };
  }
  if (!fs.existsSync(path.join(templateDir, `${manifest.format}.hbs`))) {
    return { valid: false, error: `Template não encontrado: ${manifest.format}` };
  }
  return { valid: true };
}

function renderManifest(manifestPath, args) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    return { asset_id: manifest.asset_id, status: "INVALID", error: validation.error };
  }

  const client = slug(manifest.client);
  const asset = slug(manifest.asset_id);
  const style = manifest.style;
  const format = manifest.format;

  const previewDir = path.resolve(rootDir, "squads", "social-growth", "output", client, "social", "previews");
  fs.mkdirSync(previewDir, { recursive: true });

  const previewPath = path.join(previewDir, `${asset}-${style}-${format}.html`);

  const composePath = path.join(engineDir, "compose.mjs");
  const result = spawnSync("node", [composePath, "--manifest", manifestPath, "--out", previewPath], {
    cwd: rootDir,
    encoding: "utf8",
    timeout: 30000,
  });

  if (result.error || result.status !== 0) {
    return {
      asset_id: manifest.asset_id,
      status: "FAIL",
      error: (result.stderr || result.error?.message || "Erro desconhecido").trim(),
    };
  }

  return {
    asset_id: manifest.asset_id,
    style,
    format,
    status: "OK",
    html: previewPath,
    output: result.stdout?.trim() || "",
  };
}

function main() {
  const args = parseArgs(process.argv);
  const manifestPaths = resolveManifests(args.manifests || args.manifest);

  if (!manifestPaths.length) {
    console.error("Nenhum manifesto encontrado. Forneça --manifest <caminho> ou --manifests <arquivo-lista>");
    process.exit(1);
  }

  console.log(`\n═══ Batch Render ═══`);
  console.log(`Manifestos: ${manifestPaths.length}\n`);

  const results = manifestPaths.map((mp) => {
    const label = path.basename(mp);
    process.stdout.write(`  ${label}... `);
    const res = renderManifest(mp, args);
    console.log(res.status);
    return res;
  });

  const ok = results.filter((r) => r.status === "OK");
  const failed = results.filter((r) => r.status !== "OK");

  console.log(`\n═══ Resultado ═══`);
  console.log(`  OK:     ${ok.length}`);
  console.log(`  Falha:  ${failed.length}`);
  console.log();

  if (failed.length) {
    console.log("Falhas:");
    failed.forEach((f) => {
      console.log(`  - ${f.asset_id}: ${f.error}`);
    });
    console.log();
  }

  if (ok.length) {
    console.log("HTMLs gerados:");
    ok.forEach((r) => {
      console.log(`  ${r.asset_id} (${r.style}/${r.format}) → ${r.html}`);
    });
    console.log();
  }

  const reportPath = path.resolve(
    rootDir,
    "squads",
    "social-growth",
    "design-system",
    "manifests",
    "batch-render-report.json"
  );
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Relatório salvo em: ${reportPath}`);
}

try {
  main();
} catch (error) {
  console.error(`Erro: ${error.message}`);
  process.exit(1);
}
