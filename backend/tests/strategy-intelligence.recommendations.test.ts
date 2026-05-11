import assert from "node:assert/strict";
import test from "node:test";

import { buildContextualStrategyOptions, buildRecommendationFromAssets, buildRecommendationFromLibrary } from "../src/modules/strategy-intelligence/strategy-intelligence.service.js";

test("prioriza conversao para oferta consultiva com objetivo de leads", () => {
  const result = buildContextualStrategyOptions({
    campaignObjective: "gerar leads e vendas",
    productContext: "serviço consultivo com diagnóstico e fechamento",
    serviceContext: "consultoria estratégica",
    audienceContext: "empresas que querem previsibilidade",
  });

  assert.equal(result.primary?.strategyName, "Conversão para demonstrar valor");
  assert.ok(result.secondary.some((item) => item.strategyName === "Autoridade para gerar prova"));
  assert.ok(result.notRecommended.length > 0);
  assert.ok((result.notRecommended[0]?.fitScore ?? 0) <= (result.secondary[0]?.fitScore ?? 0));
});

test("prioriza tendencia para cliente de ecommerce com objetivo de alcance", () => {
  const result = buildContextualStrategyOptions({
    campaignObjective: "crescer alcance e gerar descoberta",
    productContext: "e-commerce de moda com checkout simples",
    serviceContext: "varejo digital",
    audienceContext: "consumidores buscando novidades",
    clientSegment: "e-commerce e varejo",
  });

  assert.equal(result.primary?.strategyName, "Tendência para ampliar alcance");
  assert.ok(result.secondary.some((item) => item.strategyName === "Prova social para reduzir fricção"));
  assert.ok((result.strategyOptions[0]?.fitScore ?? 0) >= (result.strategyOptions[1]?.fitScore ?? 0));
});

test("prioriza comunidade em retenção para creator-led business", () => {
  const result = buildContextualStrategyOptions({
    funnelStage: "retention",
    campaignObjective: "aumentar recorrencia e engajamento",
    productContext: "creator business com newsletter e comunidade",
    serviceContext: "conteudo recorrente",
    audienceContext: "audiencia fiel e engajada",
    clientSegment: "creator business",
  });

  assert.equal(result.primary?.strategyName, "Comunidade para gerar recorrência");
  assert.ok(result.secondary.some((item) => item.strategyName === "Escala para sistematizar execução"));
  assert.ok(result.strategyOptions[0]?.fitScore ?? 0 >= 75);
});

test("ranqueia estratégias da biblioteca persistida conforme contexto da campanha", () => {
  const assets = [
    {
      id: "asset-primary",
      client_id: "client-1",
      version: 3,
      kind: "primary",
      source_analysis_id: "analysis-1",
      status: "active",
      payload_json: {
        strategy: {
          name: "Autoridade para gerar prova",
          summary: "Posiciona o cliente como referência antes de pedir conversao.",
          objective: "autoridade",
          funnelStage: "consideration",
          fitScore: 92,
          confidence: 88,
        },
        recommendation: {
          productContext: "serviço consultivo",
          serviceContext: "consultoria estratégica",
          audienceContext: "decisores",
          sourceUrls: ["https://youtube.com/watch?v=1"],
          fitSignals: ["perfil consultivo", "estágio consideration"],
          evidence: ["case real"],
        },
      },
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-01T00:00:00.000Z",
    },
    {
      id: "asset-alternative",
      client_id: "client-1",
      version: 3,
      kind: "alternative",
      source_analysis_id: "analysis-1",
      status: "active",
      payload_json: {
        strategy: {
          name: "Educação para clarificar o mecanismo",
          summary: "Explica o raciocínio e simplifica a decisão.",
          objective: "clareza",
          funnelStage: "awareness",
          fitScore: 84,
          confidence: 80,
        },
        recommendation: {
          productContext: "serviço consultivo",
          serviceContext: "consultoria estratégica",
          audienceContext: "decisores",
          sourceUrls: ["https://youtube.com/watch?v=1"],
          fitSignals: ["passo a passo", "clareza"],
          evidence: ["case real"],
        },
      },
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-01T00:00:00.000Z",
    },
  ] as never;

  const result = buildRecommendationFromAssets(
    assets,
    {
      campaignObjective: "gerar leads e convencer decisores",
      productContext: "serviço consultivo",
      serviceContext: "consultoria estratégica",
      audienceContext: "decisores",
      funnelStage: "consideration",
    },
    null,
  );

  assert.equal(result.strategyOptions.length, 2);
  assert.equal(result.primary?.strategyName, "Autoridade para gerar prova");
  assert.equal(result.strategyOptions[0]?.id, "asset-primary");
  assert.equal(result.strategyOptions[0]?.fitBand, "recommended");
  assert.equal(result.strategyOptions[1]?.strategyName, "Educação para clarificar o mecanismo");
  assert.equal(result.actionPlan.stage, "consideration");
});

test("ranqueia a biblioteca global sem depender do cliente de origem", () => {
  const strategies = [
    {
      id: "library-1",
      strategy_key: "autoridade-para-gerar-prova__autoridade__consideration",
      strategy_name: "Autoridade para gerar prova",
      strategy_summary: "Posiciona o cliente como referência antes de pedir conversao.",
      canonical_objective: "autoridade",
      canonical_funnel_stage: "consideration",
      fit_band: "recommended",
      fit_signals: ["bom encaixe para oferta consultiva", "estágio de consideração"],
      source_count: 11,
      last_source_analysis_id: "analysis-1",
      last_source_client_id: "client-1",
      last_seen_at: "2026-04-01T12:37:59.617171+00:00",
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-01T00:00:00.000Z",
    },
    {
      id: "library-2",
      strategy_key: "educacao-para-clarificar-o-mecanismo__clareza__awareness",
      strategy_name: "Educação para clarificar o mecanismo",
      strategy_summary: "Explica o raciocínio e simplifica a decisão.",
      canonical_objective: "clareza",
      canonical_funnel_stage: "awareness",
      fit_band: "secondary",
      fit_signals: ["passo a passo", "didático"],
      source_count: 5,
      last_source_analysis_id: "analysis-2",
      last_source_client_id: "client-2",
      last_seen_at: "2026-04-01T11:00:00.000Z",
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-01T00:00:00.000Z",
    },
  ] as never;

  const result = buildRecommendationFromLibrary(
    strategies,
    {
      campaignObjective: "gerar leads e convencer decisores",
      productContext: "serviço consultivo",
      serviceContext: "consultoria estratégica",
      audienceContext: "decisores",
      funnelStage: "consideration",
    },
    null,
  );

  assert.equal(result.primary?.strategyName, "Autoridade para gerar prova");
  assert.equal(result.strategyOptions[0]?.strategyKey, "autoridade-para-gerar-prova__autoridade__consideration");
  assert.equal(result.strategyOptions[0]?.sourceCount, 11);
  assert.equal(result.strategyOptions[1]?.strategyName, "Educação para clarificar o mecanismo");
  assert.equal(result.planB?.strategyName, "Educação para clarificar o mecanismo");
});
