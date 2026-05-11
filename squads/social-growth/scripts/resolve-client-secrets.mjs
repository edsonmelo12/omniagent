#!/usr/bin/env node
// Resolve client publishing secrets from database publishing_profiles
// Writes a temporary .env file for the publisher scripts
//
// Usage: node resolve-client-secrets.mjs --client <client-slug>

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx === -1 ? null : args[idx + 1] ?? null;
};

const client = getArg("--client");
if (!client) {
  console.error("Usage: node resolve-client-secrets.mjs --client <client-slug>");
  process.exit(1);
}

const root = process.cwd();
const envPath = path.join(root, "squads", "social-growth", `.env.publish.${client}`);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

[
  path.join(root, ".env"),
  path.join(root, "backend", ".env"),
  path.join(root, "social-studio", ".env"),
].forEach(loadEnvFile);

// Environment variable mapping for each channel/provider
// These are the env vars that publishing scripts expect
const CHANNEL_ENV_MAP = {
  instagram: {
    meta_graph: {
      INSTAGRAM_ACCESS_TOKEN: "META_GRAPH_ACCESS_TOKEN",
      INSTAGRAM_USER_ID: "META_INSTAGRAM_BUSINESS_ACCOUNT_ID",
      IMGBB_API_KEY: "IMGBB_API_KEY",
    },
  },
  facebook: {
    meta_graph: {
      FACEBOOK_ACCESS_TOKEN: "META_GRAPH_ACCESS_TOKEN",
      FACEBOOK_PAGE_ID: "META_FACEBOOK_PAGE_ID",
      IMGBB_API_KEY: "IMGBB_API_KEY",
    },
  },
  wordpress: {
    wordpress_api: {
      WORDPRESS_URL: "WORDPRESS_URL",
      WORDPRESS_USER: "WORDPRESS_USER",
      WORDPRESS_APP_PASSWORD: "WORDPRESS_APP_PASSWORD",
    },
  },
  linkedin: {
    linkedin_api: {
      LINKEDIN_ACCESS_TOKEN: "LINKEDIN_ACCESS_TOKEN",
      LINKEDIN_URN: "LINKEDIN_URN",
    },
  },
};

function resolveSecret(secretRef) {
  // Supports env:// scheme: env://VAR_NAME reads from process.env.VAR_NAME
  if (secretRef.startsWith("env://")) {
    const varName = secretRef.slice(6);
    return process.env[varName] || null;
  }
  // Plain logical ref: try as direct env var name
  return process.env[secretRef] || null;
}

async function main() {
  const envVars = {};

  // For each known channel, try to resolve secrets
  for (const [channel, providers] of Object.entries(CHANNEL_ENV_MAP)) {
    for (const [provider, mapping] of Object.entries(providers)) {
      // Construct the expected secret_ref pattern
      const patterns = [
        `env://${channel.toUpperCase()}_${provider.toUpperCase()}_TOKEN`,
        `env://${channel.toUpperCase()}_ACCESS_TOKEN`,
        `clients/${client}/${channel}/main`,
        `clients/${client}/${channel}/default`,
      ];

      for (const [envKey, refName] of Object.entries(mapping)) {
        // Check if the env var is already set (from environment)
        if (process.env[envKey]) {
          envVars[envKey] = process.env[envKey];
          continue;
        }

        // Try each pattern
        for (const pattern of patterns) {
          const resolved = resolveSecret(pattern);
          if (resolved) {
            envVars[envKey] = resolved;
            break;
          }
        }
      }
    }
  }

  // Also try to read from publishing_profiles via pg client if available
  // This is a fallback for database-backed setups
  try {
    const pgModule = await import("pg").catch(() => null);
    if (pgModule && process.env.DATABASE_URL) {
      const client_ = new pgModule.Client({ connectionString: process.env.DATABASE_URL });
      await client_.connect();

      const res = await client_.query(
        `SELECT channel, provider, secret_ref, account_label, external_account_id
         FROM publishing_profiles
         WHERE client_id = (SELECT id FROM clients WHERE slug = $1)
         AND connection_status = 'active'`,
        [client]
      );

      // Which env vars represent the token/secret vs configuration metadata
      const TOKEN_KEYS = new Set(["INSTAGRAM_ACCESS_TOKEN", "FACEBOOK_ACCESS_TOKEN", "WORDPRESS_APP_PASSWORD", "LINKEDIN_ACCESS_TOKEN"]);
      // IMGBB_API_KEY is a global application key, not per-client. Must be set in .env separately.

      for (const row of res.rows) {
        const channelMap = CHANNEL_ENV_MAP[row.channel]?.[row.provider];
        if (!channelMap) continue;

        const resolved = resolveSecret(row.secret_ref);

        for (const [envKey, refName] of Object.entries(channelMap)) {
          if (envVars[envKey]) continue; // already resolved

          if (TOKEN_KEYS.has(envKey)) {
            // Token keys resolve from secret_ref
            if (resolved) envVars[envKey] = resolved;
          } else {
            // Config keys resolve from their named env var, then from external_account_id
            envVars[envKey] = process.env[refName] || row.external_account_id || null;
          }
        }
      }

      await client_.end();
    }
  } catch (dbErr) {
    // Database not available — use env vars only
    console.warn("⚠️  Database lookup unavailable, using environment variables only");
  }

  // Write .env file
  const lines = Object.entries(envVars).map(([k, v]) => `${k}=${v}`);
  fs.mkdirSync(path.dirname(envPath), { recursive: true });
  fs.writeFileSync(envPath, lines.join("\n") + "\n", "utf8");

  console.log(
    JSON.stringify({
      status: "OK",
      client,
      resolvedVars: Object.keys(envVars),
      envFile: path.relative(root, envPath),
    })
  );
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
