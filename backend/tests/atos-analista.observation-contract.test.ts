import test from "node:test";
import assert from "node:assert/strict";
import {
  assertObservationSummarySafeForAtos,
  sanitizeObservationSummaryForAtos,
} from "../src/modules/atos-analista/atos-analista.observation-contract.js";

test("Atos observation contract - removes blocked fields and masks landing page", () => {
  const input = {
    client_id: "client-1",
    social_signals: {
      impressions: 123,
      user_id: "usr_123",
    },
    qualitative_signals: {
      signalTypes: ["manual_note"],
      summaryPreview: ["conteudo bruto sensivel"],
    },
    site_signals: {
      landing_page: "https://example.com/blog/post?utm_source=ig&email=john@example.com",
    },
  };

  const sanitized = sanitizeObservationSummaryForAtos(input) as {
    social_signals: Record<string, unknown>;
    qualitative_signals: Record<string, unknown>;
    site_signals: Record<string, unknown>;
  };

  assert.equal("user_id" in sanitized.social_signals, false);
  assert.equal("summaryPreview" in sanitized.qualitative_signals, false);
  assert.equal(
    sanitized.site_signals.landing_page,
    "https://example.com/blog/post?utm_source=ig",
  );
  assert.doesNotThrow(() => assertObservationSummarySafeForAtos(sanitized));
});

test("Atos observation contract - detects blocked field in unsafe payload", () => {
  const unsafe = {
    social_signals: {
      comments: 12,
      user_pseudo_id: "abc-123",
    },
  };

  assert.throws(() => assertObservationSummarySafeForAtos(unsafe), /blocked fields/);
});

