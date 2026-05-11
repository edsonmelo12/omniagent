import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFallbackStrategyName,
  buildFallbackStrategySummary,
  buildStrategySummary,
} from "../src/modules/strategy-intelligence/strategy-intelligence.service.js";

test("fallback de nome segue a taxonomia orientada ao objetivo", () => {
  assert.equal(buildFallbackStrategyName("primary"), "Objetivo principal para gerar prova");
  assert.equal(buildFallbackStrategyName("alternative"), "Variação alternativa para clarificar o mecanismo");
  assert.equal(buildFallbackStrategyName("plan_b"), "Estratégia de contingência para reduzir risco");
});

test("fallback de resumo segue a mesma lógica de leitura", () => {
  assert.equal(buildFallbackStrategySummary("primary"), "Leitura principal extraída da transcrição.");
  assert.equal(buildFallbackStrategySummary("alternative"), "Variação alternativa extraída da transcrição.");
  assert.equal(buildFallbackStrategySummary("plan_b"), "Estratégia de contingência para reduzir risco e preservar coerência.");
});

test("strategy summary mantém nome por objetivo quando não há rótulo explícito", () => {
  const payload = {
    title: "Amiclube - estrategia do YouTube",
    overview: {},
    synthesis: {
      commonStrategies: [],
      commonMechanisms: ["mecanismo educacional"],
      commonTactics: ["tática de prova social"],
      nextTests: ["testar nova abordagem"],
    },
  };

  const primary = buildStrategySummary("primary", payload, 0);
  const alternative = buildStrategySummary("alternative", payload, 0);
  const planB = buildStrategySummary("plan_b", payload, 0);

  assert.equal(primary.strategyName, "Objetivo principal para gerar prova");
  assert.equal(alternative.strategyName, "Variação alternativa para clarificar o mecanismo");
  assert.equal(planB.strategyName, "Estratégia de contingência para reduzir risco");
  assert.equal(primary.strategySummary, "Leitura principal extraída da transcrição");
  assert.equal(alternative.strategySummary, "mecanismo educacional");
  assert.equal(planB.strategySummary, "testar nova abordagem");
  assert.ok(!primary.strategySummary.includes("Amiclube"));
  assert.ok(!alternative.strategySummary.includes("Amiclube"));
  assert.ok(!planB.strategySummary.includes("Amiclube"));
});
