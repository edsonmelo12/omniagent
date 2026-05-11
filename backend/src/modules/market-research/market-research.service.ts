import { createError } from "../../shared/http/errors.js";
import { env } from "../../app/env.js";
import { findClientById } from "../clients/clients.repository.js";
import { assertCampaignStage } from "../campaign/campaign.service.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { resolveGeographicCoverage } from "./market-geography.js";
import { collectMarketResearchPublicSignals } from "./market-research.search.js";
import {
  createMarketResearchVersion,
  findLatestMarketResearchByClientId,
  listMarketResearchesByClientId,
  updateMarketResearchVersion,
} from "./market-research.repository.js";

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const chooseMarketStage = (
  snapshot: {
    presence_score: number | null;
    consistency_score: number | null;
    proof_score: number | null;
    conversion_readiness: number | null;
  } | null,
  profilesCount: number,
) => {
  if (!snapshot) {
    return "presence";
  }

  const presence = snapshot.presence_score ?? 0;
  const consistency = snapshot.consistency_score ?? 0;
  const proof = snapshot.proof_score ?? 0;
  const conversion = snapshot.conversion_readiness ?? 0;

  if (profilesCount >= 4 && presence >= 80 && consistency >= 75 && proof >= 65 && conversion >= 70) {
    return "scale";
  }

  if (conversion >= 65) {
    return "conversion";
  }

  if (proof >= 60 || consistency >= 70) {
    return "authority";
  }

  return "presence";
};

const summarizeMarketStage = (stage: string) => {
  if (stage === "scale") {
    return "The brand can compete with a stronger distribution and conversion system.";
  }

  if (stage === "conversion") {
    return "The brand needs clearer offer framing and conversion cues.";
  }

  if (stage === "authority") {
    return "The brand needs stronger proof to separate itself from competitors.";
  }

  return "The brand still needs a clearer public footprint before deeper market differentiation.";
};

const buildCompetitorSignal = async (input: { url: string; role: "client" | "competitor" | "source" }) => {
  const response = await fetch(input.url, {
    headers: {
      "user-agent": "Mozilla/5.0 SocialGrowth/1.0",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    return {
      url: input.url,
      role: input.role,
      title: null,
      description: null,
      headings: [],
      notes: "Unavailable",
    };
  }

  const html = await response.text();
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim() ??
    null;
  const headings = [...html.matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/gi)].slice(0, 4).map((match) => match[1].trim()).filter(Boolean);

  return {
    url: input.url,
    role: input.role,
    title,
    description,
    headings,
    notes: title ?? description ?? "No public meta description found",
  };
};

const appendNotes = (baseNotes: string | undefined, additions: Array<string | null | undefined>) => {
  const content = additions.filter((addition): addition is string => typeof addition === "string" && addition.trim().length > 0).join("\n");

  if (!baseNotes) {
    return content || undefined;
  }

  if (!content) {
    return baseNotes;
  }

  return `${baseNotes}\n\n${content}`;
};

const buildRecommendations = (stage: string) => {
  if (stage === "scale") {
    return {
      editorialPillars: ["prova", "casos", "comparativos", "conversao"],
      differentiators: ["cadencia consistente", "prova social", "oferta clara", "leads com contexto"],
      contentAngles: ["case study-led content", "behind-the-scenes execution", "before/after proof", "sales enablement"],
    };
  }

  if (stage === "conversion") {
    return {
      editorialPillars: ["oferta", "objecoes", "CTA", "prova"],
      differentiators: ["mensagem direta", "clareza comercial", "conteudo que conduz o lead"],
      contentAngles: ["pain-point posts", "CTA variations", "objection handling", "lead magnet framing"],
    };
  }

  if (stage === "authority") {
    return {
      editorialPillars: ["autoridade", "prova", "didatica", "posicionamento"],
      differentiators: ["evidencia", "consistencia", "frameworks proprios"],
      contentAngles: ["expert takeaways", "framework explainers", "proof posts", "comparison posts"],
    };
  }

  return {
    editorialPillars: ["presenca", "perfil", "cadencia", "posicionamento"],
    differentiators: ["higiene de perfil", "regularidade", "clareza basica"],
    contentAngles: ["profile cleanup", "intro posts", "foundational content", "narrative consistency"],
  };
};

const buildWeights = () => ({
  client: 35,
  market: 35,
  competition: 30,
});

const buildMarketResearchPayload = async (input: {
  client: {
    id: string;
    name: string;
    slug: string;
    website_url: string | null;
    segment: string | null;
    notes: string | null;
    status: string;
  };
  clientRecord:
    | {
        id: string;
        version: number;
        payload_json: unknown;
      }
    | null;
  snapshot: {
    id: string;
    public_only: boolean;
    confidence: number;
    presence_score: number | null;
    consistency_score: number | null;
    proof_score: number | null;
    conversion_readiness: number | null;
    main_gaps_json: unknown;
    opportunity_notes_json: unknown;
    raw_notes: string | null;
  } | null;
  profilesCount: number;
  sourceUrls: string[];
  competitorUrls: string[];
  marketContext?: string;
  note?: string;
  publicOnly: boolean;
  confidence: number;
  publicSignals: {
    queries: string[];
    sources: Array<{
      sourceUrl: string;
      sourceType: string;
      confidence: number;
      notes: string;
    }>;
    summary: string | null;
  };
}) => {
  const stage = chooseMarketStage(input.snapshot, input.profilesCount);
  const sourceSignals = await Promise.all(
    [...new Set([...input.sourceUrls, ...input.competitorUrls, ...input.publicSignals.sources.map((source) => source.sourceUrl)].filter(Boolean))].map(async (url) =>
      buildCompetitorSignal({ url, role: input.competitorUrls.includes(url) ? "competitor" : "source" }).catch(() => ({
        url,
        role: input.competitorUrls.includes(url) ? "competitor" : "source",
        title: null,
        description: null,
        headings: [],
        notes: "Unavailable",
      })),
    ),
  );
  const clientSignal = input.client.website_url
    ? await buildCompetitorSignal({ url: input.client.website_url, role: "client" }).catch(() => ({
        url: input.client.website_url as string,
        role: "client" as const,
        title: null,
        description: null,
        headings: [],
        notes: "Unavailable",
      }))
    : null;
  const gaps = Array.isArray(input.snapshot?.main_gaps_json) ? input.snapshot.main_gaps_json.map(String) : [];
  const opportunities = Array.isArray(input.snapshot?.opportunity_notes_json)
    ? input.snapshot.opportunity_notes_json.map(String)
    : [];
  const recommendations = buildRecommendations(stage);
  const weights = buildWeights();
  const coverage = resolveGeographicCoverage({
    defaultCountry: "Brasil",
    sources: [
      { label: "client.name", value: input.client.name },
      { label: "client.segment", value: input.client.segment },
      { label: "client.website_url", value: input.client.website_url },
      { label: "client.notes", value: input.client.notes },
      { label: "clientRecord.payload_json", value: input.clientRecord?.payload_json ?? null },
      { label: "snapshot.raw_notes", value: input.snapshot?.raw_notes ?? null },
      { label: "research.marketContext", value: input.marketContext ?? null },
      { label: "research.note", value: input.note ?? null },
    ],
  });
  const marketContext = `${input.client.segment ?? "mercado"}${input.client.website_url ? ` · ${input.client.website_url}` : ""}`;
  const competitiveDensity = input.competitorUrls.length + sourceSignals.filter((signal) => signal.role === "competitor").length;
  const benchmarkSummary =
    competitiveDensity > 0
      ? `${competitiveDensity} ponto(s) de benchmark monitorados para comparar oferta, prova e posicionamento.`
      : "Sem concorrentes explícitos, a análise se apoia na presença pública e nos sinais do cliente.";
  const notes = appendNotes(input.note, [
    input.publicSignals.summary,
    input.publicSignals.sources.length > 0
      ? `Sinais públicos adicionados via Brave Search: ${input.publicSignals.sources.length} fonte(s) em ${input.publicSignals.queries.length} consulta(s).`
      : null,
  ]);

  return {
    title: `${input.client.name} market research`,
    client: {
      id: input.client.id,
      name: input.client.name,
      slug: input.client.slug,
      websiteUrl: input.client.website_url,
      segment: input.client.segment,
      status: input.client.status,
    },
    context: {
      createdFrom: input.clientRecord ? "client-record-and-intelligence" : "intelligence-only",
      clientRecordVersion: input.clientRecord?.version ?? null,
      snapshotId: input.snapshot?.id ?? null,
      publicOnly: input.publicOnly,
      confidence: clampScore(input.confidence),
      note: notes ?? null,
    },
    market: {
      context: marketContext,
      segment: input.client.segment,
      stage,
      maturity: stage,
      coverage,
      density: competitiveDensity,
      weights,
      summary: summarizeMarketStage(stage),
      positioning:
        stage === "scale"
          ? "scale the current momentum"
          : stage === "conversion"
            ? "turn attention into lead flow"
            : stage === "authority"
              ? "build trust and evidence-led authority"
              : "establish visible presence first",
    },
    signals: {
      profilesCount: input.profilesCount,
      presenceScore: input.snapshot?.presence_score ?? null,
      consistencyScore: input.snapshot?.consistency_score ?? null,
      proofScore: input.snapshot?.proof_score ?? null,
      conversionReadiness: input.snapshot?.conversion_readiness ?? null,
      mainGaps: gaps,
      opportunityNotes: opportunities,
    },
    competition: {
      clientUrl: clientSignal,
      competitors: sourceSignals,
      competitorUrls: input.competitorUrls,
      sourceUrls: input.sourceUrls,
      competitorCount: input.competitorUrls.length,
      benchmarkSummary,
      summary:
        input.competitorUrls.length > 0
          ? `${input.competitorUrls.length} competitor signal(s) mapped for the current client.`
          : "No explicit competitors were provided, so the analysis leans on the client's public footprint and social signals.",
    },
    recommendations: {
      editorialPillars: recommendations.editorialPillars,
      differentiators: recommendations.differentiators,
      contentAngles: recommendations.contentAngles,
      weights,
      nextPautas:
        stage === "scale"
          ? ["Case studies", "Comparison posts", "Proof-led narratives"]
          : stage === "conversion"
            ? ["CTA-first posts", "Offer framing", "Objection handling"]
            : stage === "authority"
              ? ["Framework posts", "Evidence posts", "Expert columns"]
              : ["Profile setup", "Foundational positioning", "Introductory content"],
    },
    publicSignals: {
      queryCount: input.publicSignals.queries.length,
      sourceCount: input.publicSignals.sources.length,
      summary: input.publicSignals.summary,
    },
    note: notes ?? null,
  };
};

const loadResearchContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const latestMarketResearch = await findLatestMarketResearchByClientId(input.clientId);
  const marketResearches = await listMarketResearchesByClientId(input.clientId);
  const clientRecord = await findLatestClientRecordByClientId(input.clientId);
  const snapshot = await listLatestSnapshotByClientId(input.clientId);
  const profiles = await listSocialProfilesByClientId(input.clientId);

  return {
    client,
    latestMarketResearch,
    marketResearches,
    clientRecord,
    snapshot,
    profiles,
  };
};

export const getMarketResearchContext = loadResearchContext;

export const createMarketResearch = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  status: string;
  publicOnly: boolean;
  confidence?: number;
  sourceUrls?: string[];
  competitorUrls?: string[];
  marketContext?: string;
  note?: string;
}) => {
  const context = await loadResearchContext(input);
  const hasSignals =
    context.profiles.length > 0 ||
    Boolean(context.snapshot) ||
    Boolean(context.client.website_url) ||
    (input.sourceUrls?.length ?? 0) > 0 ||
    (input.competitorUrls?.length ?? 0) > 0 ||
    Boolean(env.BRAVE_SEARCH_API_KEY);

  if (!hasSignals) {
    throw createError("FAILED_PRECONDITION", "Market research requires at least one public signal", 422);
  }

  const publicSignals = await collectMarketResearchPublicSignals({
    client: context.client,
    profiles: context.profiles,
    braveSearchApiKey: env.BRAVE_SEARCH_API_KEY,
  });

  await assertCampaignStage({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    allowedStages: ["research"],
  });

  const payload = await buildMarketResearchPayload({
    client: context.client,
    clientRecord: context.clientRecord
      ? { id: context.clientRecord.id, version: context.clientRecord.version, payload_json: context.clientRecord.payload_json }
      : null,
    snapshot: context.snapshot,
    profilesCount: context.profiles.length,
    sourceUrls: input.sourceUrls ?? [],
    competitorUrls: input.competitorUrls ?? [],
    marketContext: input.marketContext,
    note: input.note,
    publicOnly: input.publicOnly,
    confidence: input.confidence ?? context.snapshot?.confidence ?? 75,
    publicSignals,
  });

  const marketResearch = await createMarketResearchVersion({
    clientId: input.clientId,
    status: input.status,
    payload,
  });

  const marketResearches = await listMarketResearchesByClientId(input.clientId);

  return {
    client: context.client,
    clientRecord: context.clientRecord,
    snapshot: context.snapshot,
    profiles: context.profiles,
    marketResearch,
    marketResearches,
    payload,
  };
};

export const reviseMarketResearch = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  status: string;
  publicOnly: boolean;
  confidence?: number;
  sourceUrls?: string[];
  competitorUrls?: string[];
  marketContext?: string;
  note?: string;
  summaryOverride?: string;
}) => {
  const context = await loadResearchContext(input);
  const latestMarketResearch = context.latestMarketResearch;

  if (!latestMarketResearch || typeof latestMarketResearch.payload_json !== "object" || latestMarketResearch.payload_json === null) {
    throw createError("FAILED_PRECONDITION", "Market research is required before revision", 422);
  }

  await assertCampaignStage({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    allowedStages: ["research"],
  });

  const previousPayload = latestMarketResearch.payload_json as Record<string, unknown>;
  const incomingSourceUrls = input.sourceUrls ?? [];
  const incomingCompetitorUrls = input.competitorUrls ?? [];
  const publicSignals = await collectMarketResearchPublicSignals({
    client: context.client,
    profiles: context.profiles,
    braveSearchApiKey: env.BRAVE_SEARCH_API_KEY,
  });
  const previousMarket = typeof previousPayload.market === "object" && previousPayload.market !== null ? (previousPayload.market as Record<string, unknown>) : null;
  const previousCompetition =
    typeof previousPayload.competition === "object" && previousPayload.competition !== null
      ? (previousPayload.competition as Record<string, unknown>)
      : {};
  const previousSourceUrls = Array.isArray(previousCompetition.sourceUrls) ? (previousCompetition.sourceUrls as string[]) : [];
  const previousCompetitorUrls = Array.isArray(previousCompetition.competitorUrls) ? (previousCompetition.competitorUrls as string[]) : [];
  const nextSourceUrls = incomingSourceUrls.length > 0 ? incomingSourceUrls : previousSourceUrls;
  const nextCompetitorUrls = incomingCompetitorUrls.length > 0 ? incomingCompetitorUrls : previousCompetitorUrls;
  const basePayload = await buildMarketResearchPayload({
    client: context.client,
    clientRecord: context.clientRecord
      ? { id: context.clientRecord.id, version: context.clientRecord.version, payload_json: context.clientRecord.payload_json }
      : null,
    snapshot: context.snapshot,
    profilesCount: context.profiles.length,
    sourceUrls: nextSourceUrls,
    competitorUrls: nextCompetitorUrls,
    marketContext: input.marketContext ?? (typeof previousMarket?.context === "string" ? previousMarket.context : undefined),
    note: input.note ?? (previousPayload.note as string | undefined),
    publicOnly: input.publicOnly,
    confidence: input.confidence ?? context.snapshot?.confidence ?? 75,
    publicSignals,
  });

  const payload = {
    ...previousPayload,
    ...basePayload,
    note: basePayload.note ?? null,
    summaryOverride: input.summaryOverride ?? null,
    revisedFromMarketResearchVersion: latestMarketResearch.version,
    createdFrom: "manual-edit",
  };

  const marketResearch = await updateMarketResearchVersion({
    clientId: input.clientId,
    status: input.status,
    payload,
  });

  const marketResearches = await listMarketResearchesByClientId(input.clientId);

  return {
    client: context.client,
    clientRecord: context.clientRecord,
    snapshot: context.snapshot,
    profiles: context.profiles,
    marketResearch,
    marketResearches,
    payload,
  };
};
