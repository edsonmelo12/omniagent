type GraphError = {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
};

type GraphResponse = {
  error?: GraphError;
  [key: string]: unknown;
};

const requiredScopes = [
  "instagram_content_publish",
  "instagram_basic",
  "pages_show_list",
  "pages_read_engagement",
] as const;

const readEnv = (name: string) => {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const apiVersion = readEnv("META_GRAPH_API_VERSION") ?? "v25.0";
const accessToken = readEnv("META_GRAPH_ACCESS_TOKEN");
const igBusinessId = readEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID");
const appId = readEnv("META_APP_ID");
const appSecret = readEnv("META_APP_SECRET");

const toErrorSummary = (error?: GraphError | null) => {
  if (!error) return null;
  const details = [
    error.message ? error.message.trim() : "",
    error.type ? `type=${error.type}` : "",
    typeof error.code === "number" ? `code=${error.code}` : "",
    typeof error.error_subcode === "number" ? `subcode=${error.error_subcode}` : "",
  ].filter((item) => item.length > 0);
  return details.length > 0 ? details.join(" | ") : "unknown error";
};

const graphGet = async (path: string, params: Record<string, string>) => {
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const json = (await response.json().catch(() => ({}))) as GraphResponse;
  return {
    ok: response.ok,
    status: response.status,
    json,
  };
};

const run = async () => {
  if (!accessToken) {
    console.error("META_GRAPH_ACCESS_TOKEN ausente.");
    process.exit(1);
  }

  if (!igBusinessId) {
    console.error("META_INSTAGRAM_BUSINESS_ACCOUNT_ID ausente.");
    process.exit(1);
  }

  const checks: Record<string, unknown> = {
    apiVersion,
    igBusinessId,
    account: null,
    mePermissions: null,
    debugToken: null,
    requiredScopes: {},
    readyForPublish: false,
    notes: [] as string[],
  };

  const account = await graphGet(igBusinessId, {
    fields: "id,username",
    access_token: accessToken,
  });
  checks.account = {
    ok: account.ok,
    status: account.status,
    error: toErrorSummary(account.json.error),
    id: account.json.id ?? null,
    username: account.json.username ?? null,
  };

  const perms = await graphGet("me/permissions", {
    access_token: accessToken,
  });
  const permItems = Array.isArray(perms.json.data) ? perms.json.data : [];
  const grantedByMePermissions = new Map<string, string>();
  for (const item of permItems) {
    if (item && typeof item === "object") {
      const permission = (item as Record<string, unknown>).permission;
      const status = (item as Record<string, unknown>).status;
      if (typeof permission === "string" && typeof status === "string") {
        grantedByMePermissions.set(permission, status);
      }
    }
  }
  checks.mePermissions = {
    ok: perms.ok,
    status: perms.status,
    error: toErrorSummary(perms.json.error),
    total: permItems.length,
    granted: Array.from(grantedByMePermissions.entries())
      .filter(([, status]) => status === "granted")
      .map(([permission]) => permission)
      .sort(),
  };

  let grantedByDebugToken = new Set<string>();
  if (appId && appSecret) {
    const appAccessToken = `${appId}|${appSecret}`;
    const debug = await graphGet("debug_token", {
      input_token: accessToken,
      access_token: appAccessToken,
    });
    const data = (debug.json.data && typeof debug.json.data === "object")
      ? (debug.json.data as Record<string, unknown>)
      : null;
    const scopes = Array.isArray(data?.scopes) ? data?.scopes : [];
    grantedByDebugToken = new Set(scopes.filter((item): item is string => typeof item === "string"));
    checks.debugToken = {
      ok: debug.ok,
      status: debug.status,
      error: toErrorSummary(debug.json.error),
      isValid: typeof data?.is_valid === "boolean" ? data.is_valid : null,
      expiresAt: typeof data?.expires_at === "number" ? new Date(data.expires_at * 1000).toISOString() : null,
      scopes: Array.from(grantedByDebugToken).sort(),
    };
  } else {
    (checks.notes as string[]).push("META_APP_ID/META_APP_SECRET ausentes; debug_token não executado.");
  }

  const scopeSource = grantedByDebugToken.size > 0
    ? grantedByDebugToken
    : new Set(
        Array.from(grantedByMePermissions.entries())
          .filter(([, status]) => status === "granted")
          .map(([permission]) => permission),
      );

  const requiredScopesResult: Record<string, string> = {};
  for (const scope of requiredScopes) {
    requiredScopesResult[scope] = scopeSource.has(scope) ? "granted" : "missing";
  }
  checks.requiredScopes = requiredScopesResult;

  const hasCriticalScope = requiredScopesResult.instagram_content_publish === "granted";
  const accountOk = account.ok && typeof account.json.id === "string";
  checks.readyForPublish = Boolean(accountOk && hasCriticalScope);

  if (!hasCriticalScope) {
    (checks.notes as string[]).push("Token atual não possui instagram_content_publish.");
  }
  if (!accountOk) {
    (checks.notes as string[]).push("Conta IG não acessível com o token informado.");
  }

  console.log(JSON.stringify(checks, null, 2));
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
