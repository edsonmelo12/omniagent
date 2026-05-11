import assert from "node:assert/strict";
import test from "node:test";

const { buildCreativeProfilePayload, getCreativeProfileSignals } = await import("../src/modules/creative-profile/creative-profile.service.js");

test("gera campos comerciais e criativos para alimentar proposta", () => {
  const payload = buildCreativeProfilePayload({
    client: {
      id: "client_1",
      name: "Portal de Mídias",
      slug: "portal-de-midias",
      website_url: "https://portaldemidias.com",
      segment: "Agência de marketing para clínicas",
      status: "active",
      notes: "Foco em performance",
    },
    clientRecord: {
      id: "cr_1",
      payload_json: {
        narrative: {
          summary: "Marca preparada para escalar com foco em leads qualificados",
          audience: "clínicas que precisam de demanda previsível",
          recommendedPositioning: "operador consultivo com execução previsível",
        },
        diagnosis: {
          archetype: "consultive specialist",
          objections: ["budget pressure", "lack of proof"],
        },
      },
      version: 2,
    } as any,
    marketResearch: {
      id: "mr_1",
      payload_json: {
        market: {
          stage: "conversion",
          summary: "Mercado com compra guiada por prova e clareza",
          positioning: "transformar atenção em conversas qualificadas",
        },
      },
      version: 1,
    } as any,
    socialSnapshot: {
      id: "snap_1",
      public_only: true,
      confidence: 82,
      presence_score: 80,
      consistency_score: 78,
      proof_score: 62,
      conversion_readiness: 71,
      main_gaps_json: ["proof"],
      opportunity_notes_json: ["stronger CTA"],
      raw_notes: "No public testimonials confirmed yet.",
    },
    socialProfiles: [
      { platform: "instagram", handle: "auroralabs", profile_url: "https://instagram.com/auroralabs", confidence: 95 },
    ],
    brandProfile: {
      id: "bp_1",
      confidence: 84,
      confirmed_json: {
        brandName: "Portal de Mídias",
        website: "https://portaldemidias.com",
        logoUrl: "https://portaldemidias.com/logo.svg",
      },
      inferred_json: {
        toneOfVoice: "clear, consultative and practical",
        visualStyle: "minimal proof-led",
        uniqueValueProposition: "transformar atenção em conversas qualificadas",
      },
      proof_json: {
        proofPoints: ["cases"],
        proofGaps: ["testimonials"],
      },
    } as any,
    offerProfileRow: {
      id: "op_1",
      confirmed_json: {
        productId: "product_1",
        productName: "Plano de Mídia para Clínicas",
        summary: "Plano de mídia resolve captação de leads para clínicas",
        audience: "clínicas que precisam de demanda previsível",
        proofPoints: ["cases"],
      },
      inferred_json: {
        primaryCta: "Solicitar conversa",
        toneOfVoice: "clear, consultative and practical",
        proofGaps: [],
      },
      proof_json: {},
    } as any,
    offerProfile: {
      productId: "product_1",
      productName: "Plano de Mídia para Clínicas",
      offerType: "service",
      category: "Serviços",
      priceLabel: "Sob consulta",
      audience: "clínicas que precisam de demanda previsível",
      promise: "gerar leads qualificados com previsibilidade",
      problemSolved: "demanda irregular",
      landingUrl: "https://portaldemidias.com/clinicas",
      primaryCta: "Solicitar conversa",
      toneOfVoice: "clear, consultative and practical",
      proofPoints: ["cases"],
      proofGaps: [],
      summary: "Plano de mídia resolve captação de leads para clínicas",
    } as any,
    primaryProduct: {
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
      proof_points_json: ["cases"],
      notes: null,
      is_active: true,
      created_at: "2026-04-09T00:00:00.000Z",
      updated_at: "2026-04-09T00:00:00.000Z",
    } as any,
  });

  assert.equal(payload.confirmed.targetAudience, "clínicas que precisam de demanda previsível");
  assert.ok(payload.confirmed.buyerPersonas.includes("proprietário de clínica ou operação de saúde"));
  assert.equal(payload.confirmed.uniqueValueProposition, "operador consultivo com execução previsível");
  assert.equal(payload.confirmed.brandArchetype, "performance partner");
  assert.equal(payload.confirmed.logoUrl, "https://portaldemidias.com/logo.svg");
  assert.ok(typeof payload.confirmed.mood === "string" && payload.confirmed.mood.length > 0);
  assert.ok(typeof payload.confirmed.brandFeel === "string" && payload.confirmed.brandFeel.length > 0);
  assert.ok(typeof payload.confirmed.backgroundTreatment === "string" && payload.confirmed.backgroundTreatment.length > 0);
  assert.ok(typeof payload.confirmed.overlayGuidance === "string" && payload.confirmed.overlayGuidance.length > 0);
  assert.ok(typeof payload.confirmed.imageStory === "string" && payload.confirmed.imageStory.length > 0);
  assert.ok(payload.confirmed.messagePillars.includes("clínicas que precisam de demanda previsível"));
  assert.ok(payload.inferred.proposalAngle.includes("conversão"));
  assert.ok(payload.inferred.productImageryTreatment.includes("proof-first"));
  assert.ok(payload.inferred.logoUsage.includes("logo"));
});

test("normaliza campos adicionais de creative profile", () => {
  const signals = getCreativeProfileSignals({
    id: "cp_1",
    client_id: "client_1",
    source_brand_profile_id: "bp_1",
    source_offer_profile_id: "op_1",
    source_snapshot_id: "snap_1",
    source_client_record_id: "cr_1",
    source_market_research_id: "mr_1",
    version: 2,
    status: "approved",
    confidence: 86,
    confirmed_json: {
      summary: "Portal de Mídias fala com clínicas que precisam de demanda previsível com uma proposta de valor de operador consultivo com execução previsível.",
      targetAudience: "clínicas que precisam de demanda previsível",
      buyerPersonas: ["proprietário de clínica ou operação de saúde", "decisor em fase de compra"],
      uniqueValueProposition: "operador consultivo com execução previsível",
      brandArchetype: "performance partner",
      logoUrl: "https://portaldemidias.com/logo.svg",
      logoTreatment: "logo como ancoragem de confiança, com presença compacta e não dominante",
      mood: "clear, helpful and editorial",
      brandFeel: "editorial, direct and useful",
      backgroundTreatment: "supportive image background with subtle dark overlay and preserved texture",
      overlayGuidance: "use a subtle dark overlay that keeps the ambient image visible",
      imageStory: "Suggest a clear editorial context for clinics that supports the message without competing with it.",
      productImageryDirection: "proof-first product imagery with cases, before/after structures and explicit CTA framing",
      proposalAngle: "proposta orientada a conversão com prova, CTA e redução de objeções",
    },
    inferred_json: {
      targetAudience: "clínicas que precisam de demanda previsível",
      buyerPersonas: ["proprietário de clínica ou operação de saúde"],
      uniqueValueProposition: "operador consultivo com execução previsível",
      brandArchetype: "performance partner",
      logoTreatment: "logo como ancoragem de confiança, com presença compacta e não dominante",
      mood: "clear, helpful and editorial",
      brandFeel: "editorial, direct and useful",
      backgroundTreatment: "supportive image background with subtle dark overlay and preserved texture",
      overlayGuidance: "use a subtle dark overlay that keeps the ambient image visible",
      imageStory: "Suggest a clear editorial context for clinics that supports the message without competing with it.",
      productImageryDirection: "proof-first product imagery with cases, before/after structures and explicit CTA framing",
      proposalAngle: "proposta orientada a conversão com prova, CTA e redução de objeções",
    },
    proof_json: {
      brandProof: {
        proofPoints: ["cases"],
        proofGaps: ["testimonials"],
      },
    },
    created_at: "2026-04-09T00:00:00.000Z",
    updated_at: "2026-04-09T00:00:00.000Z",
  } as any);

  assert.equal(signals?.targetAudience, "clínicas que precisam de demanda previsível");
  assert.deepEqual(signals?.buyerPersonas, ["proprietário de clínica ou operação de saúde", "decisor em fase de compra"]);
  assert.equal(signals?.uniqueValueProposition, "operador consultivo com execução previsível");
  assert.equal(signals?.brandArchetype, "performance partner");
  assert.equal(signals?.logoUrl, "https://portaldemidias.com/logo.svg");
  assert.equal(signals?.logoTreatment, "logo como ancoragem de confiança, com presença compacta e não dominante");
  assert.equal(signals?.mood, "clear, helpful and editorial");
  assert.equal(signals?.brandFeel, "editorial, direct and useful");
  assert.equal(signals?.backgroundTreatment, "supportive image background with subtle dark overlay and preserved texture");
  assert.equal(signals?.overlayGuidance, "use a subtle dark overlay that keeps the ambient image visible");
  assert.equal(
    signals?.imageStory,
    "Suggest a clear editorial context for clinics that supports the message without competing with it.",
  );
  assert.equal(signals?.productImageryDirection, "proof-first product imagery with cases, before/after structures and explicit CTA framing");
  assert.equal(signals?.proposalAngle, "proposta orientada a conversão com prova, CTA e redução de objeções");
});
