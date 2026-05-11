import assert from "node:assert/strict";
import test from "node:test";

const { buildEditorialPautas, buildVisualDirectionPayload } = await import("../src/modules/content/content.service.js");

const brandProfile = {
  version: 2,
  status: "approved",
  confidence: 87,
  summary: "Aurora Labs · direct, practical and business-oriented",
  brandName: "Aurora Labs",
  website: "https://auroralabs.com.br",
  category: "Software and digital services",
  audience: "SMBs and founders that need predictable growth",
  uniqueValueProposition: "turn content into a repeatable growth routine",
  promise: "turn content into a repeatable growth routine",
  toneOfVoice: "direct, practical and business-oriented",
  visualPalette: ["navy", "white", "green accent"],
  primaryCta: "Enviar DM ou pedir orçamento",
  proofGaps: ["testimonials", "reviews"],
  confirmedTestimonials: [],
  publicCaseStudies: ["case study published"],
  processProof: ["bastidor de execução"],
  beforeAfterEvidence: [],
};

const offerProfile = {
  version: 1,
  status: "approved",
  confidence: 74,
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
  proofPoints: ["cases", "testimonials"],
  proofGaps: [],
};

test("usa brand profile para endurecer prova e CTA do conteúdo", () => {
  const pautas = buildEditorialPautas({
    clientName: "Aurora Labs",
    archetype: "conversao",
    marketStage: "conversion",
    marketSummary: "Practical execution with measurable results",
    brandProfile,
    offerProfile,
    editorialPillars: ["proof", "educational", "commercial", "community"],
    differentiators: ["digital growth"],
    contentAngles: ["proof", "authority", "conversion", "community"],
    clientRecordVersion: 4,
    proposalVersion: 2,
    marketResearchVersion: 1,
  });

  assert.equal(pautas[0].objective, "Aumentar prova percebida da oferta com evidência concreta");
  assert.ok(pautas[0].proof.length > 0);
  assert.equal(pautas[0].cta, offerProfile.primaryCta);
});

test("carrega brand context na direção visual", () => {
  const pautas = buildEditorialPautas({
    clientName: "Aurora Labs",
    archetype: "conversao",
    marketStage: "conversion",
    marketSummary: "Practical execution with measurable results",
    brandProfile,
    offerProfile,
    editorialPillars: ["proof", "educational", "commercial", "community"],
    differentiators: ["digital growth"],
    contentAngles: ["proof", "authority", "conversion", "community"],
    clientRecordVersion: 4,
    proposalVersion: 2,
    marketResearchVersion: 1,
  });

  const direction = buildVisualDirectionPayload({
    clientName: "Aurora Labs",
    contentRhythm: "3x weekly authority-driven cadence",
    editorialPautas: pautas,
    brandProfile,
    offerProfile,
  });

  assert.equal(direction.brandContext?.primaryCta, brandProfile.primaryCta);
  assert.ok(direction.productImagePolicy.includes("clínicas"));
  assert.equal(direction.offerContext?.primaryCta, offerProfile.primaryCta);
  assert.ok(direction.brandContext?.proofGaps.includes("testimonials"));
  assert.equal(direction.creativeSignals[0]?.cta, offerProfile.primaryCta);
});
