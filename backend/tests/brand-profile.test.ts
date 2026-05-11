import assert from "node:assert/strict";
import test from "node:test";

const { buildBrandProfilePayload } = await import("../src/modules/brand-profile/brand-profile.service.js");

test("gera brand profile com split entre confirmado e inferido", () => {
  const result = buildBrandProfilePayload({
    client: {
      id: "client_1",
      name: "Aurora Labs",
      slug: "aurora-labs",
      website_url: "https://auroralabs.com.br",
      segment: "Software and digital services",
      status: "active",
      notes: "B2B com foco em crescimento orgânico",
    },
    clientRecord: {
      id: "cr_1",
      version: 3,
      payload_json: {
        narrative: {
          summary: "Turn content into a repeatable growth routine",
          recommendedPositioning: "the team that brings method and execution to organic growth",
        },
        offerRecommendation: {
          focus: "Organize offer, image and routine",
        },
        diagnosis: {
          audienceContext: "SMBs and founders that need predictable growth",
          mainGaps: ["proof", "conversion"],
          objections: ["budget pressure"],
        },
      },
    },
    marketResearch: {
      id: "mr_1",
      version: 1,
      payload_json: {
        market: {
          stage: "conversion",
          summary: "Practical execution with measurable results",
          positioning: "business-first organic growth",
          scope: "Brazil",
        },
        publicSignals: {
          summary: "2 fontes públicas e 1 sinal de prova",
          details: ["case study published"],
        },
      },
    },
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
    profiles: [
      { platform: "instagram", handle: "auroralabs", profile_url: "https://instagram.com/auroralabs", confidence: 95 },
    ],
  });

  assert.equal(result.meta.statusLabel, "confirmed");
  assert.equal(result.confirmed.brandName, "Aurora Labs");
  assert.equal(result.confirmed.website, "https://auroralabs.com.br");
  assert.equal(result.confirmed.socialProfiles.length, 1);
  assert.equal(result.inferred.primaryCta, "Enviar DM ou pedir orçamento");
  assert.ok(result.inferred.visualPalette.includes("navy"));
  assert.ok(result.proof.proofGaps.includes("testimonials"));
  assert.ok(result.proof.proofGaps.includes("reviews"));
  assert.ok(result.proof.publicCaseStudies.includes("case study published"));
});
