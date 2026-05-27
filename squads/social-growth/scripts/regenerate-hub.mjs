#!/usr/bin/env node
// Backward-compatible wrapper around the canonical campaign hub renderer.
// Usage: node regenerate-hub.mjs --client amiclube
import { spawnSync } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
const clientIdx = args.indexOf("--client");
const client = clientIdx >= 0 ? args[clientIdx + 1] : null;
if (!client) {
  console.error("Usage: node regenerate-hub.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const scriptPath = path.join(root, "squads", "social-growth", "scripts", "render-campaign-hub-canonical.mjs");
const result = spawnSync(process.execPath, [scriptPath, "--client", client], {
  cwd: root,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
