#!/usr/bin/env node
/**
 * Validate Social Links Before Publish
 * 
 * Valida se todos os link_target na queue retornam HTTP 200.
 * Se algum link falhar, marca o item como blocked e retorna falha.
 * 
 * Uso:
 *   node validate-links-before-publish.mjs --client <slug>
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] ?? null : null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node validate-links-before-publish.mjs --client <slug>");
  process.exit(1);
}

const root = process.cwd();
const queuePath = path.join(root, "squads", "social-growth", "output", client, "publishing", "social-publish-queue.json");

if (!fs.existsSync(queuePath)) {
  console.error(`Queue not found: ${queuePath}`);
  process.exit(1);
}

const queueData = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const queue = queueData.queue || [];

const checkLink = (url) => {
  return new Promise((resolve) => {
    if (!url) { resolve({ valid: true, status: 0 }); return; }
    const req = https.request(url, { method: "HEAD" }, (res) => {
      resolve({ valid: res.statusCode < 400, status: res.statusCode });
    });
    req.on("error", (err) => resolve({ valid: false, error: err.code }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ valid: false, error: "timeout" }); });
    req.end();
  });
};

const validate = async () => {
  const blocked = [];
  const validated = [];
  
  for (const item of queue) {
    if (!item.link_target) {
      validated.push(item.asset_id);
      continue;
    }
    const result = await checkLink(item.link_target);
    if (result.valid) {
      validated.push(item.asset_id);
    } else {
      blocked.push({ asset_id: item.asset_id, link: item.link_target, error: result.error || result.status });
    }
  }
  
  if (blocked.length > 0) {
    console.log(`\n❌ ${blocked.length} link(s) broken:`);
    for (const b of blocked) {
      console.log(`   - ${b.asset_id}: ${b.link} (${b.error})`);
      
      const idx = queue.findIndex(q => q.asset_id === b.asset_id);
      if (idx !== -1) {
        queue[idx].status = "blocked";
        queue[idx].last_result = `link_validation_failed: ${b.error}`;
      }
    }
    fs.writeFileSync(queuePath, JSON.stringify(queueData, null, 2), "utf8");
    console.log(`\n⚠️ Updated queue - ${blocked.length} item(s) blocked.\n`);
    process.exit(1);
  }
  
  console.log(`✅ All ${validated.length} links validated successfully.`);
};

validate();