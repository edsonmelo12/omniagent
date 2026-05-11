import assert from "node:assert/strict";
import test from "node:test";

import { buildProposalCommercialBrief } from "../src/modules/proposals/proposals.service.js";

test("gera brief comercial da proposta a partir da inteligência criativa", () => {
  const brief = buildProposalCommercialBrief({
    client: {
      name: "Portal de Mídias",
      segment: "Agência de marketing para clínicas",
      website_url: "https://portaldemidias.com",
    },
    clientRecord: {
      payload_json: {
        narrative: {
          audience: "clínicas que precisam de demanda previsível",
          recommendedPositioning: "operador consultivo com execução previsível",
        },
        diagnosis: {
          archetype: "performance partner",
          objections: ["budget pressure", "lack of proof"],
        },
      },
    },
    marketResearch: {
      payload_json: {
        market: {
          stage: "conversion",
          positioning: "transformar atenção em conversas qualificadas",
        },
      },
    },
    snapshot: {
      proof_score: 62,
      consistency_score: 78,
      conversion_readiness: 71,
    },
    creativeProfile: {
      id: "cp_1",
      version: 2,
      confidence: 86,
      targetAudience: "clínicas que precisam de demanda previsível",
      buyerPersonas: ["proprietário de clínica", "decisor em fase de compra"],
      uniqueValueProposition: "operador consultivo com execução previsível",
      brandArchetype: "performance partner",
      objectionsToAddress: ["budget pressure", "lack of proof"],
      proofAssets: ["cases", "testimonials"],
      ctaRecommendation: "Solicitar conversa",
      visualDirection: "proof-led editorial",
      logoTreatment: "logo confirmado",
      productImageryDirection: "proof-first product imagery",
      proposalAngle: "proposta orientada a conversão com prova, CTA e redução de objeções",
      sources: {
        creativeProfileId: "cp_1",
        offerProfileId: "op_1",
        brandProfileId: "bp_1",
        primaryProductId: "product_1",
      },
    } as never,
    offerProfile: {
      productId: "product_1",
      productName: "Plano de Mídia para Clínicas",
      summary: "Plano de mídia resolve captação de leads para clínicas",
      audience: "clínicas que precisam de demanda previsível",
      proofPoints: ["cases"],
      confidence: 72,
      primaryCta: "Solicitar conversa",
    } as never,
    brandProfile: {
      id: "bp_1",
      confidence: 84,
    } as never,
    primaryProduct: {
      id: "product_1",
      name: "Plano de Mídia para Clínicas",
      category: "Serviços",
      offer_type: "service",
      audience: "clínicas que precisam de demanda previsível",
      promise: "gerar leads qualificados com previsibilidade",
    } as never,
  });

  assert.equal(brief.targetAudience, "clínicas que precisam de demanda previsível");
  assert.deepEqual(brief.buyerPersonas, ["proprietário de clínica", "decisor em fase de compra"]);
  assert.equal(brief.uniqueValueProposition, "operador consultivo com execução previsível");
  assert.equal(brief.brandArchetype, "performance partner");
  assert.equal(brief.ctaRecommendation, "Solicitar conversa");
  assert.equal(brief.proposalAngle, "proposta orientada a conversão com prova, CTA e redução de objeções");
  assert.equal(brief.sources.creativeProfileId, "cp_1");
  assert.ok(brief.proofAssets.includes("cases"));
});
