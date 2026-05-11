#!/usr/bin/env node
// Validate that a client has all required publishing profiles with resolvable secrets
//
// Usage: node validate-client-profiles.mjs --client amiclube
//        node validate-client-profiles.mjs --all

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  return idx === -1 ? null : args[idx + 1] ?? null;
};

const clientSlug = getArg("--client");
const checkAll = args.includes("--all");

if (!clientSlug && !checkAll) {
  console.error("Usage: node validate-client-profiles.mjs --client <slug> | --all");
  process.exit(1);
}

// Expected vault env vars per channel
const CHANNEL_REQUIREMENTS = {
  instagram: {
    label: "Instagram",
    provider: "meta_graph",
    env_vars: ["META_GRAPH_ACCESS_TOKEN", "META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "IMGBB_API_KEY"],
    check_graph_api: true,
  },
  facebook: {
    label: "Facebook",
    provider: "meta_graph",
    env_vars: ["META_GRAPH_ACCESS_TOKEN", "META_FACEBOOK_PAGE_ID", "IMGBB_API_KEY"],
    check_graph_api: true,
  },
  wordpress: {
    label: "WordPress",
    provider: "wordpress_api",
    env_vars: ["WORDPRESS_URL", "WORDPRESS_USER", "WORDPRESS_APP_PASSWORD"],
    check_graph_api: false,
  },
  linkedin: {
    label: "LinkedIn",
    provider: "linkedin_api",
    env_vars: ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_URN"],
    check_graph_api: false,
  },
};

function resolveEnvVar(refName) {
  const val = process.env[refName];
  if (val && val.length > 0) return { status: "ok", value: mask(val) };
  return { status: "missing", value: null };
}

function mask(str) {
  if (!str) return null;
  if (str.length <= 8) return str.slice(0, 2) + "***";
  return str.slice(0, 4) + "..." + str.slice(-4);
}

async function validateClient(client) {
  const results = { client, profiles: [], errors: [], warnings: [] };
  let pgClient = null;

  // Try to connect to database
  try {
    const pgModule = await import("pg").catch(() => null);
    if (pgModule && process.env.DATABASE_URL) {
      pgClient = new pgModule.Client({ connectionString: process.env.DATABASE_URL });
      await pgClient.connect();

      // Get client ID
      const clientRes = await pgClient.query("SELECT id, name, website_url FROM clients WHERE slug = $1", [client]);
      if (clientRes.rows.length === 0) {
        results.errors.push(`Client '${client}' not found in database`);
        await pgClient.end();
        return results;
      }
      results.clientName = clientRes.rows[0].name;
      results.website = clientRes.rows[0].website_url;

      // Get publishing profiles
      const profilesRes = await pgClient.query(
        `SELECT channel, provider, account_label, secret_ref, external_account_id,
                connection_status, publish_mode, approval_mode
         FROM publishing_profiles
         WHERE client_id = $1
         ORDER BY channel`,
        [clientRes.rows[0].id]
      );

      for (const row of profilesRes.rows) {
        const profile = {
          channel: row.channel,
          provider: row.provider,
          label: row.account_label,
          externalId: row.external_account_id,
          secretRef: row.secret_ref,
          connectionStatus: row.connection_status,
          publishMode: row.publish_mode,
          envVars: [],
        };

        // Resolve secrets
        if (row.secret_ref && row.secret_ref.startsWith("env://")) {
          const varName = row.secret_ref.slice(6);
          const resolved = resolveEnvVar(varName);
          profile.envVars.push({ name: varName, ...resolved });
        } else if (row.secret_ref) {
          profile.envVars.push({ name: row.secret_ref, ...resolveEnvVar(row.secret_ref) });
        }

        // Check against known requirements
        const requirements = CHANNEL_REQUIREMENTS[row.channel];
        if (requirements) {
          for (const envVar of requirements.env_vars) {
            const alreadyChecked = profile.envVars.find((e) => e.name === envVar);
            if (!alreadyChecked) {
              profile.envVars.push({ name: envVar, ...resolveEnvVar(envVar) });
            }
          }
        }

        results.profiles.push(profile);
      }

      // Check for missing recommended profiles
      const existingChannels = new Set(profilesRes.rows.map((r) => r.channel));
      const recommendations = [];
      if (!existingChannels.has("instagram"))
        recommendations.push("instagram (Meta Business account needed for Instagram publishing)");
      if (!existingChannels.has("facebook"))
        recommendations.push("facebook (same Meta token as Instagram)");
      if (!existingChannels.has("wordpress"))
        recommendations.push("wordpress (if client has a WordPress site)");

      if (recommendations.length > 0) {
        results.warnings.push(`No profile configured for: ${recommendations.join(", ")}`);
      }

      await pgClient.end();
    } else {
      results.warnings.push("Database not available — checking env vars only");
    }
  } catch (dbErr) {
    if (pgClient) try { await pgClient.end(); } catch {}
    results.warnings.push(`Database error: ${dbErr.message}`);
  }

  // Fallback: check env vars even without database
  if (results.profiles.length === 0) {
    for (const [channel, req] of Object.entries(CHANNEL_REQUIREMENTS)) {
      const profile = { channel, provider: req.provider, label: "(env-only)", envVars: [] };
      for (const envVar of req.env_vars) {
        profile.envVars.push({ name: envVar, ...resolveEnvVar(envVar) });
      }
      // Only add if at least one var is present
      if (profile.envVars.some((e) => e.status === "ok")) {
        results.profiles.push(profile);
      }
    }
  }

  return results;
}

async function main() {
  const slugs = checkAll
    ? await getAllClientSlugs()
    : [clientSlug];

  const allResults = [];
  for (const slug of slugs) {
    const result = await validateClient(slug);
    allResults.push(result);
  }

  // Output as JSON for parsing, plus human-readable summary
  let exitCode = 0;
  for (const result of allResults) {
    const icon = result.errors.length === 0 ? "✅" : "❌";
    const name = result.clientName || result.client;
    console.log(`\n${icon} ${name} (${result.client})`);
    if (result.website) console.log(`   Site: ${result.website}`);

    for (const profile of result.profiles) {
      const statusIcon =
        profile.connectionStatus === "active" ? "✅" :
        profile.connectionStatus === "disconnected" ? "🔌" : "⚠️";
      const missing = profile.envVars.filter((e) => e.status === "missing").length;
      const ok = profile.envVars.filter((e) => e.status === "ok").length;
      const total = profile.envVars.length;

      console.log(`   ${statusIcon} ${profile.label || profile.channel} (${profile.provider})`);
      console.log(`      Status: ${profile.connectionStatus || "unknown"} | Mode: ${profile.publishMode || "unknown"}`);
      console.log(`      Secrets: ${ok}/${total} resolved`);
      for (const ev of profile.envVars) {
        const m = ev.status === "ok" ? `✅ ${ev.name}=${ev.value}` : `❌ ${ev.name} (missing)`;
        console.log(`        ${m}`);
      }
    }

    for (const w of result.warnings) {
      console.log(`   ⚠️  ${w}`);
    }
    for (const e of result.errors) {
      console.log(`   ❌ ${e}`);
      exitCode = 1;
    }
  }

  console.log(`\n${checkAll ? "All clients" : `Client '${clientSlug}'`} validated.`);
  process.exit(exitCode);
}

async function getAllClientSlugs() {
  try {
    const pgModule = await import("pg").catch(() => null);
    if (pgModule && process.env.DATABASE_URL) {
      const c = new pgModule.Client({ connectionString: process.env.DATABASE_URL });
      await c.connect();
      const res = await c.query("SELECT slug FROM clients ORDER BY slug");
      await c.end();
      return res.rows.map((r) => r.slug);
    }
  } catch {}
  return [clientSlug].filter(Boolean);
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
