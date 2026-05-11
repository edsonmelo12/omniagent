import { createClient, findClientBySlug, updateClient } from "../src/modules/clients/clients.repository.js";
import { createClientRecordVersion, findLatestClientRecordByClientId } from "../src/modules/client-record/client-record.repository.js";
import {
  createProductRecord,
  listProductsByClientId,
  updateProductRecord,
} from "../src/modules/client-products/client-products.repository.js";
import { createMarketResearchVersion } from "../src/modules/market-research/market-research.repository.js";
import { createSnapshot, createSnapshotSources } from "../src/modules/social-intelligence/social-intelligence.repository.js";
import { saveSocialProfiles } from "../src/modules/social-discovery/social-discovery.repository.js";
import { findAgencyBySlug } from "../src/modules/tenancy/tenancy.repository.js";
import { buildRecommendationFromLibrary } from "../src/modules/strategy-intelligence/strategy-intelligence.service.js";
import { listStrategyLibraryStrategies } from "../src/modules/strategy-intelligence/strategy-intelligence.repository.js";

const AGENCY_SLUG = "social-growth";
const CLIENT_SLUG = "dallas-rent-a-car";

const CLIENT = {
  name: "Dallas Rent a Car",
  slug: CLIENT_SLUG,
  websiteUrl: "https://www.dallasrentacar.com.br/",
  segment: "local/regional mobility and fleet outsourcing",
  notes: "B2B mobility in Belem/PA with monthly rental, terceirizacao de frota, 24h assistance and carro reserva.",
};

const PRODUCT = {
  name: "Aluguel mensal e terceirização de frota",
  slug: "aluguel-mensal-terceirizacao-frota",
  category: "mobility",
  offerType: "b2b_service",
  priceLabel: null as string | null,
  promise: "Mobilidade corporativa sem burocracia.",
  problemSolved: "Evita o custo e a complexidade de manter frota própria.",
  audience: "Empresas e gestores que precisam de previsibilidade, suporte e continuidade operacional.",
  status: "prioritized",
  priority: 100,
  landingUrl: "https://www.dallasrentacar.com.br/",
  proofPoints: ["since 1987", "24h assistance", "carro reserva", "fleet groups"],
  notes: "Core offer for the Dallas bootstrap record.",
};

const SOCIAL_PROFILES = [
  {
    platform: "instagram",
    handle: "@dallasrentacar",
    profileUrl: "https://www.instagram.com/dallasrentacar/",
    discoverySource: "official site",
    confidence: 100,
  },
  {
    platform: "facebook",
    handle: "Dallas Rent a Car Belem",
    profileUrl: "https://www.facebook.com/dallasrentacarbelem/",
    discoverySource: "official site",
    confidence: 100,
  },
] as const;

const RESEARCH_SOURCE_URLS = [
  "https://www.dallasrentacar.com.br/",
  "https://dallasrentacar.com.br/quem-somos/",
  "https://dallasrentacar.com.br/contato/",
  "https://dallasrentacar.com.br/grupo-a-reserva/",
  "https://dallasrentacar.com.br/alugar-carro-belem-grupo-b-reserva-app/",
];

const RESEARCH_COMPETITOR_URLS = [
  "https://frotas.localiza.com/en-us/",
  "https://empresas.unidas.com.br/",
  "https://frotas.unidas.com.br/",
  "https://www.oklocadoradeveiculos.com/",
];

const SNAPSHOT = {
  publicOnly: true,
  confidence: 61,
  presenceScore: 55,
  consistencyScore: 40,
  proofScore: 68,
  conversionReadiness: 60,
  mainGaps: [
    "public social inspection remains partial",
    "website freshness is anchored by older posts",
    "proof-led content is not yet recurring",
  ],
  opportunityNotes: [
    "turn company history and 24h support into recurring proof-based content",
    "organize content by monthly rental, fleet outsourcing and executive mobility",
    "refresh the site so the public proof feels current",
  ],
  rawNotes: "Bootstrap snapshot for Dallas Rent a Car using the 2026-04-08 squad test run.",
  sources: [
    {
      sourceUrl: "https://www.dallasrentacar.com.br/",
      sourceType: "website",
      confidence: 100,
      notes: "official site",
    },
    {
      sourceUrl: "https://dallasrentacar.com.br/quem-somos/",
      sourceType: "website",
      confidence: 95,
      notes: "about page",
    },
    {
      sourceUrl: "https://www.instagram.com/dallasrentacar/",
      sourceType: "instagram",
      confidence: 90,
      notes: "discovered via official site",
    },
    {
      sourceUrl: "https://www.facebook.com/dallasrentacarbelem/",
      sourceType: "facebook",
      confidence: 90,
      notes: "discovered via official site",
    },
  ],
};

const RESEARCH = {
  status: "approved",
  publicOnly: true,
  confidence: 61,
  sourceUrls: RESEARCH_SOURCE_URLS,
  competitorUrls: RESEARCH_COMPETITOR_URLS,
  marketContext: "local/regional mobility and fleet outsourcing in Belem/PA",
  note: "Bootstrap market research for Dallas Rent a Car using the 2026-04-08 squad test run.",
  payload: {
    title: "Dallas Rent a Car market research",
    client: {
      name: CLIENT.name,
      slug: CLIENT.slug,
      websiteUrl: CLIENT.websiteUrl,
      segment: CLIENT.segment,
      status: "active",
    },
    context: {
      createdFrom: "bootstrap-dallas-client",
      clientRecordVersion: null,
      snapshotId: null,
      publicOnly: true,
      confidence: 61,
      note: "Bootstrap market research created from the Dallas squad test run.",
    },
    market: {
      context: CLIENT.segment,
      segment: CLIENT.segment,
      stage: "authority",
      maturity: "authority",
      coverage: {
        country: "Brasil",
        region: "Norte",
        city: "Belem, PA",
      },
      density: 3,
      weights: {
        client: 35,
        market: 35,
        competition: 30,
      },
      summary: "The brand needs stronger proof to separate itself from competitors.",
      positioning: "build trust and evidence-led authority",
    },
    signals: {
      profilesCount: 2,
      presenceScore: SNAPSHOT.presenceScore,
      consistencyScore: SNAPSHOT.consistencyScore,
      proofScore: SNAPSHOT.proofScore,
      conversionReadiness: SNAPSHOT.conversionReadiness,
      mainGaps: SNAPSHOT.mainGaps,
      opportunityNotes: SNAPSHOT.opportunityNotes,
    },
    competition: {
      clientUrl: {
        url: CLIENT.websiteUrl,
        role: "client",
        title: "Dallas Rent a Car",
        description: "Mobilidade corporativa sem burocracia.",
        headings: ["Since 1987", "24h assistance", "carro reserva"],
        notes: "official site",
      },
      competitors: [
        {
          url: "https://frotas.localiza.com/en-us/",
          role: "competitor",
          title: "Localiza Frotas",
          description: null,
          headings: [],
          notes: "national benchmark",
        },
        {
          url: "https://empresas.unidas.com.br/",
          role: "competitor",
          title: "Unidas Empresas",
          description: null,
          headings: [],
          notes: "corporate benchmark",
        },
        {
          url: "https://www.oklocadoradeveiculos.com/",
          role: "competitor",
          title: "OK Locadora",
          description: null,
          headings: [],
          notes: "local benchmark",
        },
      ],
      competitorUrls: RESEARCH_COMPETITOR_URLS,
      sourceUrls: RESEARCH_SOURCE_URLS,
      competitorCount: 3,
      benchmarkSummary: "3 ponto(s) de benchmark monitorados para comparar oferta, prova e posicionamento.",
      summary: "3 competitor signal(s) mapped for the current client.",
    },
    recommendations: {
      editorialPillars: [
        "proof",
        "corporate mobility",
        "local trust",
        "comparison and education",
      ],
      differentiators: [
        "company history since 1987",
        "24h assistance",
        "carro reserva",
        "fleet outsourcing",
      ],
      contentAngles: [
        "proof-led content",
        "before/after fleet comparison",
        "regional mobility support",
        "operational reliability",
      ],
      weights: {
        client: 35,
        market: 35,
        competition: 30,
      },
      nextPautas: [
        "Proof-led posts",
        "Comparison posts",
        "Authority carousels",
      ],
    },
    publicSignals: {
      queryCount: 0,
      sourceCount: 4,
      summary: "Bootstrap data created from the Dallas squad test run.",
    },
    note: "Bootstrap market research for Dallas Rent a Car",
  },
};

const buildClientRecordPayload = (input: {
  client: {
    id: string;
    name: string;
    slug: string;
    website_url: string | null;
    segment: string | null;
    status: string;
  };
  snapshot: {
    confidence: number;
    public_only: boolean;
    presence_score: number | null;
    consistency_score: number | null;
    proof_score: number | null;
    conversion_readiness: number | null;
    main_gaps_json: unknown;
    opportunity_notes_json: unknown;
    raw_notes: string | null;
  } | null;
  marketResearch: {
    id: string;
    version: number;
    status: string;
    payload_json: unknown;
  } | null;
  strategyIntelligence: {
    library: Array<{
      id: string;
      strategyKey: string;
      strategyName: string;
      strategySummary: string;
      fitBand: string;
      sourceCount: number;
      canonicalObjective: string | null;
      canonicalFunnelStage: string | null;
      fitSignals: unknown;
    }>;
    recommendation: unknown;
  };
}) => {
  const marketPayload =
    input.marketResearch && typeof input.marketResearch.payload_json === "object" && input.marketResearch.payload_json !== null
      ? (input.marketResearch.payload_json as Record<string, unknown>)
      : null;
  const market = marketPayload?.market && typeof marketPayload.market === "object" && marketPayload.market !== null ? (marketPayload.market as Record<string, unknown>) : null;
  const competition =
    marketPayload?.competition && typeof marketPayload.competition === "object" && marketPayload.competition !== null
      ? (marketPayload.competition as Record<string, unknown>)
      : null;
  const recommendations =
    marketPayload?.recommendations && typeof marketPayload.recommendations === "object" && marketPayload.recommendations !== null
      ? (marketPayload.recommendations as Record<string, unknown>)
      : null;

  return {
    client: {
      id: input.client.id,
      name: input.client.name,
      slug: input.client.slug,
      websiteUrl: input.client.website_url,
      segment: input.client.segment,
      status: input.client.status,
    },
    diagnosis: {
      archetype: "autoridade",
      confidence: input.snapshot?.confidence ?? 0,
      publicOnly: input.snapshot?.public_only ?? true,
      marketResearch: input.marketResearch
        ? {
            id: input.marketResearch.id,
            version: input.marketResearch.version,
            status: input.marketResearch.status,
            summary: typeof market?.summary === "string" ? market.summary : null,
            positioning: typeof market?.positioning === "string" ? market.positioning : null,
            competitors: Array.isArray(competition?.competitorUrls) ? (competition.competitorUrls as string[]) : [],
            benchmarkSummary: typeof competition?.benchmarkSummary === "string" ? competition.benchmarkSummary : null,
            weights: typeof market?.weights === "object" ? market.weights : null,
          }
        : null,
      scores: {
        presence: input.snapshot?.presence_score ?? null,
        consistency: input.snapshot?.consistency_score ?? null,
        proof: input.snapshot?.proof_score ?? null,
        conversionReadiness: input.snapshot?.conversion_readiness ?? null,
      },
      mainGaps: Array.isArray(input.snapshot?.main_gaps_json) ? input.snapshot?.main_gaps_json : [],
      opportunityNotes: Array.isArray(input.snapshot?.opportunity_notes_json) ? input.snapshot?.opportunity_notes_json : [],
      rawNotes: input.snapshot?.raw_notes ?? null,
    },
    narrative: {
      summary: "A Dallas já tem operação e credenciais para sustentar uma proposta forte. O próximo passo é transformar essa força em autoridade pública recorrente nas redes.",
      recommendedPositioning: "Construir confiança e autoridade",
    },
    offerRecommendation: {
      mode: "autoridade",
      focus: "Prova, cases e narrativa de autoridade",
    },
    strategyIntelligence: input.strategyIntelligence,
    source: "bootstrap-dallas-client",
    recommendations: recommendations ?? null,
  };
};

const main = async () => {
  const agency = await findAgencyBySlug(AGENCY_SLUG);
  if (!agency) {
    throw new Error(`Agency not found: ${AGENCY_SLUG}`);
  }

  const existingClient = await findClientBySlug(agency.id, CLIENT.slug);
  const client = existingClient
    ? await updateClient(existingClient.id, {
        name: CLIENT.name,
        slug: CLIENT.slug,
        websiteUrl: CLIENT.websiteUrl,
        segment: CLIENT.segment,
        notes: CLIENT.notes,
      })
    : await createClient({
        agencyId: agency.id,
        name: CLIENT.name,
        slug: CLIENT.slug,
        websiteUrl: CLIENT.websiteUrl,
        segment: CLIENT.segment,
        notes: CLIENT.notes,
      });

  if (!client) {
    throw new Error("Failed to create or update Dallas client");
  }

  const latestClientRecord = await findLatestClientRecordByClientId(client.id);
  if (latestClientRecord && typeof latestClientRecord.payload_json === "object" && latestClientRecord.payload_json !== null) {
    const payload = latestClientRecord.payload_json as Record<string, unknown>;
    if (payload.source === "bootstrap-dallas-client") {
      console.log(`Dallas client already bootstrapped: ${client.id}`);
      return;
    }
  }

  const products = await listProductsByClientId(client.id);
  const existingProduct = products.find((product) => product.slug === PRODUCT.slug);
  const product = existingProduct
    ? await updateProductRecord(existingProduct.id, {
        name: PRODUCT.name,
        slug: PRODUCT.slug,
        category: PRODUCT.category ?? undefined,
        offerType: PRODUCT.offerType ?? undefined,
        priceLabel: PRODUCT.priceLabel ?? undefined,
        promise: PRODUCT.promise,
        problemSolved: PRODUCT.problemSolved,
        audience: PRODUCT.audience,
        status: PRODUCT.status,
        priority: PRODUCT.priority,
        landingUrl: PRODUCT.landingUrl ?? undefined,
        proofPoints: PRODUCT.proofPoints,
        notes: PRODUCT.notes ?? undefined,
      })
    : await createProductRecord({
        clientId: client.id,
        name: PRODUCT.name,
        slug: PRODUCT.slug,
        category: PRODUCT.category ?? undefined,
        offerType: PRODUCT.offerType ?? undefined,
        priceLabel: PRODUCT.priceLabel ?? undefined,
        promise: PRODUCT.promise,
        problemSolved: PRODUCT.problemSolved,
        audience: PRODUCT.audience,
        status: PRODUCT.status,
        priority: PRODUCT.priority,
        landingUrl: PRODUCT.landingUrl ?? undefined,
        proofPoints: PRODUCT.proofPoints,
        notes: PRODUCT.notes ?? undefined,
      });

  await saveSocialProfiles(
    SOCIAL_PROFILES.map((profile) => ({
      clientId: client.id,
      platform: profile.platform,
      handle: profile.handle,
      profileUrl: profile.profileUrl,
      discoverySource: profile.discoverySource,
      confidence: profile.confidence,
    })),
  );

  const snapshot = await createSnapshot({
    clientId: client.id,
    publicOnly: SNAPSHOT.publicOnly,
    confidence: SNAPSHOT.confidence,
    presenceScore: SNAPSHOT.presenceScore,
    consistencyScore: SNAPSHOT.consistencyScore,
    proofScore: SNAPSHOT.proofScore,
    conversionReadiness: SNAPSHOT.conversionReadiness,
    mainGaps: SNAPSHOT.mainGaps,
    opportunityNotes: SNAPSHOT.opportunityNotes,
    rawNotes: SNAPSHOT.rawNotes,
  });

  await createSnapshotSources(snapshot.id, SNAPSHOT.sources);

  const marketResearch = await createMarketResearchVersion({
    clientId: client.id,
    status: RESEARCH.status,
    payload: RESEARCH.payload,
  });

  const library = await listStrategyLibraryStrategies();
  const recommendation = buildRecommendationFromLibrary(
    library,
    {
      campaignObjective: "aumentar autoridade e gerar leads qualificados",
      productContext: `${CLIENT.segment} · ${CLIENT.websiteUrl}`,
      serviceContext: "mobilidade corporativa local/regional · monthly rental · fleet outsourcing",
      audienceContext: "empresas que precisam de previsibilidade e suporte operacional",
      clientSegment: CLIENT.segment,
      funnelStage: "consideration",
    },
    product ?? null,
  );

  const clientRecord = await createClientRecordVersion({
    clientId: client.id,
    status: "approved",
    payload: buildClientRecordPayload({
      client,
      snapshot: {
        confidence: SNAPSHOT.confidence,
        public_only: SNAPSHOT.publicOnly,
        presence_score: SNAPSHOT.presenceScore,
        consistency_score: SNAPSHOT.consistencyScore,
        proof_score: SNAPSHOT.proofScore,
        conversion_readiness: SNAPSHOT.conversionReadiness,
        main_gaps_json: SNAPSHOT.mainGaps,
        opportunity_notes_json: SNAPSHOT.opportunityNotes,
        raw_notes: SNAPSHOT.rawNotes,
      },
      marketResearch,
      strategyIntelligence: {
        library,
        recommendation,
      },
    }),
  });

  console.log(
    JSON.stringify(
      {
        agency: {
          id: agency.id,
          slug: agency.slug,
        },
        client: {
          id: client.id,
          name: client.name,
          slug: client.slug,
        },
        product: product
          ? {
              id: product.id,
              slug: product.slug,
              status: product.status,
            }
          : null,
        snapshotId: snapshot.id,
        marketResearchId: marketResearch.id,
        clientRecordId: clientRecord.id,
        strategyPrimary: recommendation.primary?.strategyName ?? null,
        strategyPlanB: recommendation.planB?.strategyName ?? null,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
