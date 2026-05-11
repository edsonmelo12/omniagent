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
  console.error("Usage: node validate-creative-dna-acceptance.mjs --client <client-slug> [--assets AC-30-31,AC-30-32] [--version v2]");
  process.exit(2);
}

const root = process.cwd();
const clientDir = path.join(root, "squads", "social-growth", "output", client);
const acceptancePath = path.join(clientDir, "creative-dna-acceptance.json");
const vdcDir = path.join(clientDir, "visual-decision-cards");
const normalize = (value) => String(value || "").trim();
const lower = (value) => normalize(value).toLowerCase();
const assetsFilter = new Set(
  String(readArg("assets", ""))
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean),
);
const versionFilter = lower(readArg("version", ""));

const failures = [];
const warnings = [];
const checked = [];

const readJson = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(root, filePath)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    failures.push(`${label} is not valid JSON: ${path.relative(root, filePath)}`);
    return null;
  }
};

const acceptance = readJson(acceptancePath, "creative DNA acceptance");

const allowed = new Set((acceptance?.styleEnvelope?.allowed || []).map(lower));
const conditional = new Map((acceptance?.styleEnvelope?.conditional || []).map((item) => [lower(item.style), item]));
const blocked = new Map((acceptance?.styleEnvelope?.blockedByDefault || []).map((item) => [lower(item.style), item]));
const mustAvoid = (acceptance?.core?.mustAvoid || []).map(lower).filter(Boolean);

const extractAssetId = (text, fileName) => {
  const match = text.match(/Asset ID\s*:?\*?\*?\s*(AC-\d{2}-\d{2}[A-Z]?)/i) || fileName.match(/(ac-\d{2}-\d{2}[a-z]?)/i);
  return match ? match[1].toUpperCase() : "UNKNOWN";
};

const extractStyle = (text) => {
  const patterns = [
    /Selected Style\*?\*?\s*:?\s*([^\n(]+)/i,
    /Estilo Selecionado\*?\*?\s*:?\s*([^\n(]+)/i,
    /Visual Style\*?\*?\s*:?\s*([^\n(]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return normalize(match[1].replace(/[*`]/g, ""));
  }
  return "";
};

const hasExplicitApproval = (text) => /explicit user approval|aprovação explícita|aprovado explicitamente/i.test(text);
const hasForbiddenSignal = (text, signal) => {
  const lines = text.split(/\r?\n/);
  return lines.some((line) => {
    const value = lower(line);
    if (!value.includes(signal)) return false;
    return !/(avoid|evitar|bloquear|blocked|sem|não|nao|not|proibir|rejeitar)/i.test(value);
  });
};

if (acceptance && fs.existsSync(vdcDir)) {
  const files = fs
    .readdirSync(vdcDir)
    .filter((file) => /vdc/i.test(file) && file.endsWith(".md"))
    .sort();

  for (const file of files) {
    if (versionFilter) {
      const fileLower = lower(file);
      if (!fileLower.includes(`-${versionFilter}`)) continue;
    }
    const filePath = path.join(vdcDir, file);
    const text = fs.readFileSync(filePath, "utf8");
    const assetId = extractAssetId(text, file);
    if (assetsFilter.size > 0 && !assetsFilter.has(assetId)) continue;

    const style = extractStyle(text);
    const styleKey = lower(style);
    const relPath = path.relative(root, filePath);
    const result = { assetId, file: relPath, style, status: "PASS", notes: [] };

    if (!style) {
      result.status = "FAIL";
      result.notes.push("missing selected style");
      failures.push(`${assetId}: missing selected style in ${relPath}`);
    } else if (blocked.has(styleKey) && !hasExplicitApproval(text)) {
      result.status = "FAIL";
      result.notes.push(`blocked style: ${style}`);
      failures.push(`${assetId}: blocked style '${style}' in ${relPath}; ${blocked.get(styleKey).reason}`);
    } else if (conditional.has(styleKey)) {
      const hasJustification = /justificativa|requires|permitido|continuity|difference/i.test(text);
      if (!hasJustification) {
        result.status = "FAIL";
        result.notes.push(`conditional style lacks justification: ${style}`);
        failures.push(`${assetId}: conditional style '${style}' lacks justification in ${relPath}`);
      } else {
        result.status = "ATTENTION";
        result.notes.push(`conditional style accepted with justification: ${style}`);
        warnings.push(`${assetId}: conditional style '${style}' requires reviewer attention`);
      }
    } else if (!allowed.has(styleKey)) {
      result.status = "FAIL";
      result.notes.push(`style outside envelope: ${style}`);
      failures.push(`${assetId}: style '${style}' is outside creative DNA envelope in ${relPath}`);
    }

    for (const risk of mustAvoid) {
      if (hasForbiddenSignal(text, risk) && !hasExplicitApproval(text)) {
        result.status = "FAIL";
        result.notes.push(`forbidden DNA signal present: ${risk}`);
        failures.push(`${assetId}: forbidden DNA signal '${risk}' present in ${relPath}`);
      }
    }

    checked.push(result);
  }
} else if (!fs.existsSync(vdcDir)) {
  failures.push(`visual decision cards directory missing: ${path.relative(root, vdcDir)}`);
}

const output = {
  ok: failures.length === 0,
  client,
  acceptancePath: path.relative(root, acceptancePath),
  checkedCount: checked.length,
  checked,
  warnings,
  failures,
};

console.log(JSON.stringify(output, null, 2));
process.exit(output.ok ? 0 : 1);
