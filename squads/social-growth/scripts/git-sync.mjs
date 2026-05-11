#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const HOME = process.env.HOME || "/home/edsonrmjunior";
const BASE = process.cwd();
const LOG_DIR = path.join(BASE, "squads", "social-growth", "logs");
const ENV_FILE = path.join(HOME, "Local Sites", ".env");
const REMOTE_ORIGINAL = "https://github.com/edsonmelo12/omniagent.git";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const result = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    result[key.trim()] = rest.join("=").trim();
  });
  return result;
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: BASE, stdio: ["ignore", "pipe", "pipe"], ...opts }).toString().trim();
  } catch (e) {
    if (opts.ignoreError) return "";
    throw e;
  }
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  return line;
}

function nowLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function main() {
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = path.join(LOG_DIR, `git-sync-${timestamp}.log`);
  const logLines = [];

  const writeLog = (msg) => {
    const line = log(msg);
    logLines.push(line);
  };

  writeLog(`=== Git Sync Start === dry_run=${dryRun}`);

  const env = loadEnv(ENV_FILE);
  const token = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    writeLog("ERROR: GITHUB_TOKEN not found in env file or environment");
    fs.writeFileSync(logFile, logLines.join("\n") + "\n");
    process.exit(1);
  }

  const owner = env.GITHUB_USER || "edsonmelo12";
  const defaultBranch = env.GIT_BRANCH || "main";
  const remoteAuthed = `https://${owner}:${token}@github.com/${owner}/omniagent.git`;

  const statusOut = run("git status --porcelain", { ignoreError: true });
  if (!statusOut) {
    writeLog("No changes to commit. Skipping.");
    fs.writeFileSync(logFile, logLines.join("\n") + "\n");
    console.log(logLines.join("\n"));
    return;
  }

  const changedCount = statusOut.split("\n").filter(Boolean).length;
  writeLog(`Changes detected: ${changedCount} file(s)`);

  if (dryRun) {
    writeLog("DRY RUN: would commit and push the following:");
    statusOut.split("\n").forEach((l) => writeLog(`  ${l}`));
    fs.writeFileSync(logFile, logLines.join("\n") + "\n");
    console.log(logLines.join("\n"));
    return;
  }

  const localNow = nowLocal();
  const commitMsg = `sync: ${localNow} (${changedCount} arquivos)`;

  const originalUrl = run("git remote get-url origin", { ignoreError: true }) || REMOTE_ORIGINAL;

  try {
    run(`git remote set-url origin ${remoteAuthed}`);
    run("git add -A");
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { ignoreError: true });
    run(`git push origin ${defaultBranch}`);
    writeLog(`Push OK: ${owner}/omniagent.git (${defaultBranch})`);
    writeLog(`Commit: ${commitMsg}`);
  } catch (err) {
    writeLog(`ERROR: ${err.message}`);
    fs.writeFileSync(logFile, logLines.join("\n") + "\n");
    process.exit(1);
  } finally {
    run(`git remote set-url origin ${originalUrl}`);
  }

  writeLog("=== Git Sync Complete ===");
  fs.writeFileSync(logFile, logLines.join("\n") + "\n");
  console.log(logLines.join("\n"));
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(1);
});
