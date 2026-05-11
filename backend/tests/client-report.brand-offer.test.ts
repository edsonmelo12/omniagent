import assert from "node:assert/strict";
import test from "node:test";

const { buildClientReportPayload } = await import("../src/modules/client-report/client-report.service.js");

test("separa brand summary e offer summary no report do cliente", () => {
  const report = buildClientReportPayload({
    client: {
      id: "client_1",
      name: "Portal de Mídias",
      slug: "portal-de-midias",
      website_url: "https://portaldemidias.com",
      segment: "Agência de marketing",
      notes: "Foco em performance",
      status: "active",
    },
    clientRecord: {
      id: "cr_1",
      payload_json: {
        narrative: {
          summary: "Marca preparada para escalar",
          recommendedPositioning: "escala com previsibilidade",
        },
      },
    },
    marketResearch: {
      id: "mr_1",
      payload_json: {
        market: {
          summary: "Mercado de serviços com demanda recorrente",
          stage: "conversion",
        },
      },
    },
    marketPresence: {
      latestBaseline: null,
      latestCheckpoint: null,
      latestComparison: null,
      profiles: [],
      baselines: [],
      checkpoints: [],
      comparisons: [],
    },
    socialPresence: {
      summary: { networks: [] },
    },
    proposal: {
      id: "proposal_1",
      version: 4,
      payload_json: {
        presentationHeader: {
          objective: "Gerar leads qualificados",
        },
      },
      thesis: "Oferta de mídia para clínicas",
    },
    monitoring: null,
    brandProfile: {
      id: "bp_1",
      version: 2,
      status: "approved",
      confirmed_json: {
        brandName: "Portal de Mídias",
        website: "https://portaldemidias.com",
      },
      inferred_json: {
        summary: "Portal de Mídias · clear and credible",
        primaryCta: "Enviar DM ou pedir orçamento",
      },
      proof_json: {
        proofGaps: ["testimonials"],
      },
      confidence: 80,
    },
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
    },
    offerProfile: {
      id: "op_1",
      version: 1,
      status: "approved",
      confidence: 72,
      summary: "Plano de mídia resolve captação de leads para clínicas",
      productId: "product_1",
      productName: "Plano de Mídia para Clínicas",
      category: "Serviços",
      offerType: "service",
      priceLabel: "Sob consulta",
      audience: "clínicas que precisam de demanda previsível",
      promise: "gerar leads qualificados com previsibilidade",
      problemSolved: "demanda irregular",
      landingUrl: "https://portaldemidias.com/clinicas",
      primaryCta: "Solicitar conversa",
      toneOfVoice: "clear, consultative and practical",
      proofPoints: ["cases"],
      proofGaps: [],
    },
    offerProfiles: [],
  });

  assert.equal(report.brandSummary, "Portal de Mídias · clear and credible");
  assert.equal(report.offerSummary, "Plano de mídia resolve captação de leads para clínicas");
  assert.equal(report.sourceIds.brandProfileId, "bp_1");
  assert.equal(report.sourceIds.offerProfileId, "op_1");
  assert.equal(report.sourceCoverage.offerProfiles, 0);
});
