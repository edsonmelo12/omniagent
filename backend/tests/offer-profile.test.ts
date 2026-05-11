import assert from "node:assert/strict";
import test from "node:test";

const { buildOfferProfilePayload, getOfferProfileSignals } = await import("../src/modules/offer-profile/offer-profile.service.js");

test("gera offer profile a partir do produto e preserva separação da marca", () => {
  const payload = buildOfferProfilePayload({
    client: {
      id: "client_1",
      name: "Portal de Mídias",
      segment: "Agência",
      website_url: "https://portaldemidias.com",
      status: "active",
    },
    product: {
      id: "product_1",
      client_id: "client_1",
      name: "Plano de Mídia para Clínicas",
      slug: "plano-de-midia-clinicas",
      category: "Serviços",
      offer_type: "service",
      price_label: "Sob consulta",
      promise: "gerar leads qualificados com previsibilidade",
      problem_solved: "demanda irregular",
      audience: "clínicas que precisam de demanda previsível",
      status: "prioritized",
      priority: 10,
      landing_url: "https://portaldemidias.com/clinicas",
      proof_points_json: ["cases", "testimonials"],
      notes: null,
      is_active: true,
      created_at: "2026-04-09T00:00:00.000Z",
      updated_at: "2026-04-09T00:00:00.000Z",
    },
    brandProfile: {
      primaryCta: "Enviar DM ou pedir orçamento",
      toneOfVoice: "direct, practical and business-oriented",
      uniqueValueProposition: "turn content into a repeatable growth routine",
      promise: "turn content into a repeatable growth routine",
    },
  });

  assert.equal(payload.status, "approved");
  assert.equal(payload.confidence, 72);
  assert.equal(payload.confirmed.productName, "Plano de Mídia para Clínicas");
  assert.equal(payload.inferred.primaryCta, "Solicitar conversa");
  assert.equal(payload.inferred.toneOfVoice, "clear, consultative and practical");
  assert.ok(!payload.proof.proofGaps.includes("testimonials"));
  assert.ok(!payload.proof.proofGaps.includes("cases"));
});

test("normaliza offer profile row em signals", () => {
  const signals = getOfferProfileSignals({
    id: "op_1",
    client_id: "client_1",
    client_product_id: "product_1",
    source_client_record_id: null,
    source_market_research_id: null,
    version: 2,
    status: "approved",
    confidence: 80,
    confirmed_json: {
      productId: "product_1",
      productName: "Plano de Mídia para Clínicas",
      category: "Serviços",
      offerType: "service",
      priceLabel: "Sob consulta",
      audience: "clínicas que precisam de demanda previsível",
      promise: "gerar leads qualificados com previsibilidade",
      problemSolved: "demanda irregular",
      landingUrl: "https://portaldemidias.com/clinicas",
      proofPoints: ["cases", "testimonials"],
      summary: "Plano de mídia resolve captação de leads para clínicas",
    },
    inferred_json: {
      summary: "Plano de mídia resolve captação de leads para clínicas",
      primaryCta: "Solicitar conversa",
      toneOfVoice: "clear, consultative and practical",
      proofGaps: [],
    },
    proof_json: {},
    created_at: "2026-04-09T00:00:00.000Z",
    updated_at: "2026-04-09T00:00:00.000Z",
  });

  assert.equal(signals?.productName, "Plano de Mídia para Clínicas");
  assert.equal(signals?.primaryCta, "Solicitar conversa");
  assert.equal(signals?.proofPoints.length, 2);
  assert.equal(signals?.proofGaps.length, 0);
});
