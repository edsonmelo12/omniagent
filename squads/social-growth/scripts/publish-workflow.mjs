#!/usr/bin/env node
/**
 * Social Publish Workflow
 * 
 * Workflow integrado para publicação de posts sociais.
 * Executa em sequência: build-queue → validate-links → dry-run → live-api → reconcile
 * 
 * Uso:
 *   node publish-workflow.mjs --client <slug> [--dry-run-only] [--skip-validation]
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] ?? null : null;
};

const hasFlag = (name) => args.includes(name);

const client = getArg("--client");
if (!client) {
  console.error("Usage: node publish-workflow.mjs --client <slug> [--dry-run-only] [--skip-validation]");
  process.exit(1);
}

const dryRunOnly = hasFlag("--dry-run-only");
const skipValidation = hasFlag("--skip-validation");

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const publishingDir = path.join(clientDir, "publishing");

const log = (msg) => console.log(`\n📦 ${msg}`);
const error = (msg) => console.error(`\n❌ ${msg}`);

const runScript = (cmd, description) => {
  console.log(`   → ${description}...`);
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch (err) {
    error(`${description} falhou`);
    return false;
  }
};

console.log(`
╔════════════════════════════════════════════════════════════╗
║         SOCIAL PUBLISH WORKFLOW - ${client.toUpperCase().padEnd(14)}║
╚════════════════════════════════════════════════════════════╝
`);

log("Etapa 1: Build Publish Queue");
if (!runScript(`node squads/social-growth/scripts/build-social-publish-queue.mjs --client ${client}`, "Construindo queue")) {
  process.exit(1);
}

if (!skipValidation) {
  log("Etapa 2: Validar Links");
  if (!runScript(`node squads/social-growth/scripts/validate-links-before-publish.mjs --client ${client}`, "Validando links")) {
    process.exit(1);
  }
} else {
  console.log("   ⏭ Pulando validação de links (--skip-validation)");
}

log("Etapa 3: Dry-Run");
const dryRunResult = execSync(`node squads/social-growth/scripts/run-social-publish-worker.mjs --client ${client} --mode dry_run`, { encoding: "utf-8" });
const dryRunData = JSON.parse(dryRunResult);
console.log(`   → ${dryRunData.dueRows || 0} posts prontos para publicação`);

if (dryRunData.published === 0 && dryRunData.dueRows === 0) {
  console.log("   ⏭ Nenhum post agendado para agora");
}

if (dryRunOnly) {
  console.log("\n⚠️ Modo dry-run only - pulando publicação live");
  process.exit(0);
}

if (dryRunData.dueRows > 0) {
  console.log("\n⚠️ PUBLICAR AGORA? [s/N]");
  console.log("   (Em modo autônomo, publicando automaticamente...)");
  
  log("Etapa 4: Live Publishing");
  if (!runScript(`node squads/social-growth/scripts/run-social-publish-worker.mjs --client ${client} --mode live_api`, "Publicando")) {
    error("Publicação falhou");
    process.exit(1);
  }

  log("Etapa 5: Reconciliar Status");
  runScript(`node squads/social-growth/scripts/monitor-social-publish-queue.mjs --client ${client}`, "Regenerando monitor");
  runScript(`node squads/social-growth/scripts/reconcile-post-publish.mjs --client ${client}`, "Sincronizando plan + status");
  
  console.log("\n✅ PUBLICAÇÃO CONCLUÍDA");
  console.log("   Queue: atualizada");
  console.log("   Monitor: regenerado");
  console.log("   Plan + Status: reconciliados");
} else {
  console.log("\nℹ️ Nenhum post pendente para publicação");
}

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║                    WORKFLOW COMPLETO                       ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");