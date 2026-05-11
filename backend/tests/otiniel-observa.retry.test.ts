import assert from "node:assert/strict";
import test from "node:test";
import {
  isTransientObservationError,
  runWithTransientRetries,
} from "../src/modules/otiniel-observa/otiniel-observa.orchestration.js";

test("reconhece falhas transitórias por codigo e mensagem", () => {
  assert.equal(isTransientObservationError({ code: "ETIMEDOUT", message: "socket timed out" }), true);
  assert.equal(isTransientObservationError({ statusCode: 503, message: "service unavailable" }), true);
  assert.equal(isTransientObservationError({ message: "permanent validation error" }), false);
});

test("retrya operacao transitória ate recuperar", async () => {
  let attempts = 0;

  const result = await runWithTransientRetries(async () => {
    attempts += 1;
    if (attempts < 3) {
      throw Object.assign(new Error("temporary rate limit"), { code: "RATE_LIMITED" });
    }

    return "ok";
  });

  assert.equal(result.value, "ok");
  assert.equal(result.attempts, 3);
  assert.equal(result.failures.length, 2);
  assert(result.failures.every((failure) => failure.retryable));
});

test("nao retrya erro permanente", async () => {
  let attempts = 0;

  await assert.rejects(
    runWithTransientRetries(async () => {
      attempts += 1;
      throw new Error("permanent failure");
    }),
  );

  assert.equal(attempts, 1);
});
