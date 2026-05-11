import assert from "node:assert/strict";
import test from "node:test";

import { buildCampaignActionPlan } from "../src/modules/strategy-intelligence/strategy-intelligence.service.js";

test("gera um plano de campanha operacional para decisão e conversao", () => {
  const plan = buildCampaignActionPlan(
    {
      strategyName: "Conversão para demonstrar valor",
      strategySummary: "Conduz o público para uma ação clara",
      objective: "aplicar a estratégia mais coerente",
      funnelStage: "conversion",
    } as never,
    {
      campaignObjective: "gerar leads e fechar vendas",
      productContext: "serviço consultivo de alta confiança",
      serviceContext: "consultoria estratégica",
      audienceContext: "decisores que querem reduzir risco",
      funnelStage: "decision",
    },
    null,
  );

  assert.equal(plan.stage, "decision");
  assert.equal(plan.ctaFocus, "marcar conversa, pedir proposta ou comprar");
  assert.ok(plan.weeklyCadence.includes("4 a 5"));
  assert.equal(plan.weeklyAgenda.length, 5);
  assert.ok(plan.weeklyAgenda[0]?.title.toLowerCase().includes("case") || plan.weeklyAgenda[0]?.title.toLowerCase().includes("solução"));
  assert.ok((plan.weeklyAgenda[0]?.hook ?? "").length > 0);
  assert.ok((plan.weeklyAgenda[0]?.structure ?? "").length > 0);
  assert.ok((plan.weeklyAgenda[0]?.copy ?? "").length > 0);
  assert.ok((plan.weeklyAgenda[0]?.caption ?? "").length > 0);
  assert.ok((plan.weeklyAgenda[0]?.finalCta ?? "").length > 0);
  assert.equal(plan.weeklyAgenda[0]?.variants.length, 2);
  assert.ok((plan.weeklyAgenda[0]?.variants[0]?.hook ?? "").length > 0);
  assert.ok((plan.weeklyAgenda[0]?.variants[1]?.copy ?? "").length > 0);
  assert.ok(plan.contentMix.some((item) => item.format.includes("case")));
  assert.ok(plan.weeklyActions.some((item) => item.includes("objeção")));
});

test("favorece alcance e formatos curtos quando o foco e awareness", () => {
  const plan = buildCampaignActionPlan(
    {
      strategyName: "Tendência para ampliar alcance",
      strategySummary: "Usa timing e formato para ganhar distribuição",
      objective: "aplicar a estratégia mais coerente",
      funnelStage: "awareness",
    } as never,
    {
      campaignObjective: "crescer alcance e gerar descoberta",
      productContext: "creator business com conteúdo recorrente",
      serviceContext: "conteúdo para audiência",
      audienceContext: "público novo",
      funnelStage: "awareness",
    },
    null,
  );

  assert.equal(plan.stage, "awareness");
  assert.equal(plan.focus, "alcance e distribuição");
  assert.ok(plan.weeklyCadence.includes("5 peças por semana"));
  assert.equal(plan.weeklyAgenda[0]?.day, "Segunda");
  assert.ok(plan.weeklyAgenda[0]?.title.toLowerCase().includes("problema"));
  assert.ok((plan.weeklyAgenda[0]?.hook ?? "").toLowerCase().includes("dor"));
  assert.ok((plan.weeklyAgenda[0]?.copy ?? "").toLowerCase().includes("postar"));
  assert.ok(plan.weeklyAgenda[0]?.variants.some((variant) => variant.label === "B" && variant.finalCta.length > 0));
  assert.ok(plan.weeklyAgenda.some((item) => item.format.includes("reel")));
  assert.ok(plan.contentMix[0]?.format.includes("reel"));
  assert.ok(plan.nextTests.length >= 3);
});
