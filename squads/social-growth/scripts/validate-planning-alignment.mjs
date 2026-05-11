#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = args.findIndex((value) => value === `--${name}`);
  if (index < 0) return fallback;
  const value = args[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const client = readArg("client");

if (!client) {
  console.error("Usage: node validate-planning-alignment.mjs --client <client-slug>");
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const pautaPath = path.join(clientDir, "pauta-atual.md");
const backlogPath = path.join(clientDir, "editorial-backlog.md");

const failures = [];
const notes = [];

if (!fs.existsSync(pautaPath)) failures.push(`missing pauta file: ${pautaPath}`);
if (!fs.existsSync(backlogPath)) failures.push(`missing backlog file: ${backlogPath}`);

const readText = (filePath) => (fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "");
const pauta = readText(pautaPath);
const backlog = readText(backlogPath);

const pautaBlogIds = Array.from(pauta.matchAll(/\*\*Blog\s*\((AC-\d{2}-\d{2}[a-z]?)\)\s*:?\*\*/gi)).map((m) =>
  m[1].toUpperCase(),
);

const backlogBlogIds = backlog
  .split(/\r?\n/)
  .filter((line) => /^\|/.test(line))
  .map((line) => line.split("|").map((cell) => cell.trim()))
  .filter((cells) => cells.length >= 5 && /^AC-\d{2}-\d{2}[a-z]?$/i.test(cells[1]) && /^Blog$/i.test(cells[4]))
  .map((cells) => cells[1].toUpperCase());

const unique = (arr) => Array.from(new Set(arr));
const pautaUnique = unique(pautaBlogIds);
const backlogUnique = unique(backlogBlogIds);

if (pautaUnique.length === 0) failures.push("no blog IDs found in pauta-atual.md; expected format '**Blog (AC-XX-YY)**'");
if (backlogUnique.length === 0) failures.push("no blog IDs found in editorial-backlog.md under channel Blog");

const missingInPauta = backlogUnique.filter((id) => !pautaUnique.includes(id));
const missingInBacklog = pautaUnique.filter((id) => !backlogUnique.includes(id));

if (missingInPauta.length > 0) failures.push(`blog IDs present in backlog but missing in pauta: ${missingInPauta.join(", ")}`);
if (missingInBacklog.length > 0) failures.push(`blog IDs present in pauta but missing in backlog: ${missingInBacklog.join(", ")}`);

if (pautaUnique.length !== backlogUnique.length) {
  failures.push(`blog ID count mismatch between pauta and backlog (${pautaUnique.length} vs ${backlogUnique.length})`);
}

if (backlogUnique.length !== 8) {
  failures.push(`expected 8 blog IDs for 30-day cycle, found ${backlogUnique.length}`);
}

if (failures.length === 0) {
  notes.push(`planning aligned with ${backlogUnique.length} blog IDs`);
}

const result = {
  ok: failures.length === 0,
  client,
  pautaPath: path.relative(root, pautaPath),
  backlogPath: path.relative(root, backlogPath),
  pautaBlogIds: pautaUnique,
  backlogBlogIds: backlogUnique,
  notes,
  failures,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
