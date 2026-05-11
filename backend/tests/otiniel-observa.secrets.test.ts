import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { resolveSecretRef } from "../src/modules/otiniel-observa/otiniel-observa.secrets.js";

const originalEnv = {
  PUBLISHING_SECRET_ENV_PREFIX: process.env.PUBLISHING_SECRET_ENV_PREFIX,
  PUBLISHING_SECRET_OVERRIDES_JSON: process.env.PUBLISHING_SECRET_OVERRIDES_JSON,
  OMNI_SECRET__CLIENTS_DEMO_GA4_OAUTH: process.env.OMNI_SECRET__CLIENTS_DEMO_GA4_OAUTH,
  DEMO_TEST_SECRET: process.env.DEMO_TEST_SECRET,
};

test.afterEach(() => {
  process.env.PUBLISHING_SECRET_ENV_PREFIX = originalEnv.PUBLISHING_SECRET_ENV_PREFIX;
  process.env.PUBLISHING_SECRET_OVERRIDES_JSON = originalEnv.PUBLISHING_SECRET_OVERRIDES_JSON;
  process.env.OMNI_SECRET__CLIENTS_DEMO_GA4_OAUTH = originalEnv.OMNI_SECRET__CLIENTS_DEMO_GA4_OAUTH;
  process.env.DEMO_TEST_SECRET = originalEnv.DEMO_TEST_SECRET;
});

test("resolve env secret refs", async () => {
  process.env.DEMO_TEST_SECRET = "demo-value";

  const result = await resolveSecretRef("env://DEMO_TEST_SECRET");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value, "demo-value");
    assert.equal(result.backend, "env");
    assert.equal(result.envKey, "DEMO_TEST_SECRET");
  }
});

test("resolve bridged secret refs via prefix", async () => {
  process.env.PUBLISHING_SECRET_ENV_PREFIX = "OMNI_SECRET__";
  process.env.OMNI_SECRET__CLIENTS_DEMO_GA4_OAUTH = "{\"accessToken\":\"token-123\"}";

  const result = await resolveSecretRef("secret://clients/demo/ga4/oauth");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value, "{\"accessToken\":\"token-123\"}");
    assert.equal(result.backend, "bridge");
    assert.equal(result.envKey, "OMNI_SECRET__CLIENTS_DEMO_GA4_OAUTH");
  }
});

test("resolve bridged secret refs via override mapping", async () => {
  process.env.PUBLISHING_SECRET_OVERRIDES_JSON = JSON.stringify({
    "secret://clients/demo/meta/oauth": "override-secret",
  });

  const result = await resolveSecretRef("secret://clients/demo/meta/oauth");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value, "override-secret");
    assert.equal(result.backend, "inline");
    assert.equal(result.envKey, null);
  }
});

test("reject empty secret refs", async () => {
  const result = await resolveSecretRef("   ");

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errorCode, "SECRET_REF_EMPTY");
  }
});

test("resolve file secret refs", async () => {
  const dir = mkdtempSync(join(tmpdir(), "otiniel-secret-"));
  const filePath = join(dir, "ga4.json");
  writeFileSync(filePath, '{"type":"service_account","client_email":"demo@example.com"}', "utf8");

  try {
    const result = await resolveSecretRef(`file://${filePath}`);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.backend, "file");
      assert.equal(result.envKey, filePath);
      assert.equal(result.value, '{"type":"service_account","client_email":"demo@example.com"}');
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
