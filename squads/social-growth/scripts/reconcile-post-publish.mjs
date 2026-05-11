#!/usr/bin/env node
/**
 * Reconcile Post-Publish Status
 * 
 * Após publicação live, sincroniza schedule-plan.md e schedule-status.md
 * com os dados reais da queue (published_at, post_id, url).
 * 
 * Uso:
 *   node reconcile-post-publish.mjs --client <slug>
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] ?? null : null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node reconcile-post-publish.mjs --client <slug>");
  process.exit(1);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const publishingDir = path.join(clientDir, "publishing");

const queuePath = path.join(publishingDir, "social-publish-queue.json");
const schedulePlanPath = path.join(publishingDir, "schedule-plan.md");
const scheduleStatusPath = path.join(publishingDir, "schedule-status.md");

const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
};

const queueData = readJson(queuePath);
if (!queueData) {
  console.error("Queue not found");
  process.exit(1);
}

const queue = queueData.queue || [];
const publishedItems = queue.filter(item => item.status === "published" && item.published_url);

console.log(`\n📦 Reconciliando ${publishedItems.length} itens publicados...\n`);

if (publishedItems.length === 0) {
  console.log("Nenhum item publicado para reconciliar");
  process.exit(0);
}

let schedulePlan = fs.readFileSync(schedulePlanPath, "utf8");
let scheduleStatus = fs.readFileSync(scheduleStatusPath, "utf8");

for (const item of publishedItems) {
  const assetId = item.asset_id;
  const url = item.published_url || "";
  const date = item.publish_date || "";
  
  console.log(`   ${assetId}: ${url}`);
  
  const urlMatch = url.match(/\/posts\/(\d+)/);
  const postId = urlMatch ? urlMatch[1] : "";
  
  schedulePlan = schedulePlan.replace(
    new RegExp(`(\\| ${assetId} \\|.*?\\|) (preview_ready|scheduled|queued)(\\|)`),
    `$1 published|`
  );
  
  const statusLine = `| ${assetId} | ✅ published — ${url} |`;
  if (!scheduleStatus.includes(statusLine)) {
    scheduleStatus = scheduleStatus.replace(
      new RegExp(`(\\| ${assetId} \\|) .*?(\\|)`),
      statusLine
    );
  }
}

fs.writeFileSync(schedulePlanPath, schedulePlan, "utf8");
fs.writeFileSync(scheduleStatusPath, scheduleStatus, "utf8");

console.log("\n✅ Reconciliação concluída");
console.log(`   schedule-plan.md: atualizado`);
console.log(`   schedule-status.md: atualizado`);