import test from "node:test";
import assert from "node:assert";
import { 
  assetIntentCreateSchema,
  analyticalVerdictCreateSchema 
} from "../src/modules/atos-analista/atos-analista.schemas.js";

test("Atos Analista - Schemas - Asset Intent", () => {
  const valid = {
    assetId: "00000000-0000-0000-0000-000000000000",
    clientId: "00000000-0000-0000-0000-000000000000",
    primaryObjective: "authority",
    returnHorizon: "short_term",
    funnelStage: "awareness",
    theme: "AI Agents",
    angle: "Educational",
  };

  const result = assetIntentCreateSchema.safeParse(valid);
  assert.strictEqual(result.success, true);
  
  const invalid = { ...valid, primaryObjective: "invalid" };
  const resultInvalid = assetIntentCreateSchema.safeParse(invalid);
  assert.strictEqual(resultInvalid.success, false);
});

test("Atos Analista - Schemas - Analytical Verdict", () => {
  const valid = {
    clientId: "00000000-0000-0000-0000-000000000000",
    targetType: "asset",
    targetId: "00000000-0000-0000-0000-000000000000",
    decision: "scale",
    confidence: "high",
  };

  const result = analyticalVerdictCreateSchema.safeParse(valid);
  assert.strictEqual(result.success, true);
});
