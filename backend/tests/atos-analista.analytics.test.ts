import test from "node:test";
import assert from "node:assert";
import { calculatePortfolioBalance, detectPatterns } from "../src/modules/atos-analista/atos-analista.analytics.js";

test("Atos Analytics - Portfolio Balance", () => {
  const intents: any[] = [
    { primary_objective: "authority", return_horizon: "long_term", funnel_stage: "awareness" },
    { primary_objective: "authority", return_horizon: "long_term", funnel_stage: "consideration" },
    { primary_objective: "conversion", return_horizon: "short_term", funnel_stage: "decision" },
  ];

  const balance = calculatePortfolioBalance(intents);

  assert.strictEqual(balance.byObjective["authority"], 2);
  assert.strictEqual(balance.byObjective["conversion"], 1);
  assert.strictEqual(balance.byHorizon["long_term"], 2);
  assert.strictEqual(balance.byHorizon["short_term"], 1);
});

test("Atos Analytics - Pattern Detection", () => {
  const assets: any[] = [
    {
      format: "post",
      intent: { theme: "AI", angle: "Educational", primary_objective: "authority" },
      verdict: { decision: "scale" }
    },
    {
      format: "post",
      intent: { theme: "AI", angle: "Educational", primary_objective: "authority" },
      verdict: { decision: "repeat_with_adjustment" }
    },
    {
      format: "reel",
      intent: { theme: "Robots", angle: "Inspirational", primary_objective: "distribution" }
    }
  ];

  const patterns = detectPatterns(assets);
  
  const aiPattern = patterns.find(p => p.key === "AI");
  assert.ok(aiPattern);
  assert.strictEqual(aiPattern.count, 2);
  assert.strictEqual(aiPattern.decisions["scale"], 1);
  
  const postPattern = patterns.find(p => p.key === "post");
  assert.strictEqual(postPattern?.count, 2);
});
