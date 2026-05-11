import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import {
  createBrandProfileVersion,
  findLatestBrandProfileByClientId,
  listBrandProfilesByClientId,
  updateBrandProfileVersion,
  type BrandProfileRow,
} from "./brand-profile.repository.js";

type PayloadRecord = Record<string, unknown>;

const asRecord = (value: unknown): PayloadRecord | null => (typeof value === "object" && value !== null ? (value as PayloadRecord) : null);
const asString = (value: unknown): string | null => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => asString(item)).filter((item): item is string => Boolean(item)) : [];

const getRecordString = (record: PayloadRecord | null, path: string[]) => {
  let current: unknown = record;

  for (const key of path) {
    const next = asRecord(current);
    if (!next) return null;
    current = next[key];
  }

  return asString(current);
};

const getRecordArray = (record: PayloadRecord | null, path: string[]) => {
  let current: unknown = record;

  for (const key of path) {
    const next = asRecord(current);
    if (!next) return [];
    current = next[key];
  }

  return asStringArray(current);
};

const lowerTokens = (value: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const hasAnyToken = (value: string | null, patterns: string[]) => {
  const tokens = lowerTokens(value);
  return patterns.some((pattern) => tokens.includes(pattern));
};

const inferPalette = (input: {
  segment: string | null;
  tone: string | null;
  positioning: string | null;
}) => {
  const context = [input.segment, input.tone, input.positioning].filter(Boolean).join(" ");
  const tokens = lowerTokens(context);

  if (tokens.some((token) => ["artisan", "craft", "handmade", "bijou", "fashion", "beauty"].includes(token))) {
    return ["warm neutrals", "terracotta", "cream"];
  }

  if (tokens.some((token) => ["premium", "luxury", "executive", "corporate", "sober"].includes(token))) {
    return ["black", "ivory", "gold"];
  }

  if (tokens.some((token) => ["software", "tech", "saas", "b2b", "consultoria", "business", "servico"].includes(token))) {
    return ["navy", "white", "green accent"];
  }

  return ["neutral palette", "brand accent", "soft contrast"];
};

const inferTone = (input: {
  tone: string | null;
  positioning: string | null;
  segment: string | null;
}) => {
  const source = [input.tone, input.positioning, input.segment].filter(Boolean).join(" ");
  const tokens = lowerTokens(source);

  if (tokens.some((token) => ["direct", "practical", "objective", "business", "results"].includes(token))) {
    return "direct, practical and business-oriented";
  }

  if (tokens.some((token) => ["premium", "luxury", "elegant", "sophisticated"].includes(token))) {
    return "elegant, calm and premium";
  }

  if (tokens.some((token) => ["friendly", "warm", "human", "creative"].includes(token))) {
    return "warm, human and accessible";
  }

  return "clear, credible and operational";
};

const inferPrimaryCta = (input: {
  marketStage: string | null;
  offerPriority: string | null;
  segment: string | null;
}) => {
  const source = [input.marketStage, input.offerPriority, input.segment].filter(Boolean).join(" ");
  const tokens = lowerTokens(source);

  if (tokens.some((token) => ["conversion", "lead", "sale", "leadgen"].includes(token))) {
    return "Enviar DM ou pedir orçamento";
  }

  if (tokens.some((token) => ["authority", "consideration"].includes(token))) {
    return "Seguir o perfil ou salvar o post";
  }

  if (tokens.some((token) => ["scale", "distribution"].includes(token))) {
    return "Ver o próximo passo ou agendar conversa";
  }

  return "Enviar mensagem ou visitar o perfil";
};

const collectProofSignals = (input: {
  clientRecordPayload: PayloadRecord | null;
  snapshot: { main_gaps_json: unknown; opportunity_notes_json: unknown; raw_notes: string | null } | null;
  marketResearchPayload: PayloadRecord | null;
}) => {
  const recordProof = getRecordArray(input.clientRecordPayload, ["diagnosis", "proofPoints"]);
  const recordCases = getRecordArray(input.clientRecordPayload, ["diagnosis", "cases"]);
  const marketSignals = [
    getRecordString(input.marketResearchPayload, ["publicSignals", "summary"]),
    ...getRecordArray(input.marketResearchPayload, ["publicSignals", "details"]),
  ].filter((value): value is string => Boolean(value));

  const proofGaps = new Set<string>(["testimonials", "reviews", "cases", "before-after", "process proof"]);
  const lowerProofSignals = [...recordProof, ...recordCases, ...marketSignals];

  const hasTestimonialsEvidence = lowerProofSignals.some((item) =>
    hasAnyToken(item, ["testemunho", "testimonial", "testimonials", "depoimento"]),
  );
  const hasReviewsEvidence = lowerProofSignals.some((item) => hasAnyToken(item, ["review", "reviews", "avaliac", "rating"]));
  const hasCaseStudiesEvidence = lowerProofSignals.some((item) => hasAnyToken(item, ["case", "cases", "case study", "case studies", "caso", "casos"]));
  const hasProcessProofEvidence = lowerProofSignals.some((item) => hasAnyToken(item, ["bastidor", "process", "processo", "rotina", "make", "produção"]));
  const hasBeforeAfterEvidence = lowerProofSignals.some((item) => hasAnyToken(item, ["antes", "depois", "before", "after"]));

  if (hasTestimonialsEvidence) {
    proofGaps.delete("testimonials");
  }

  if (hasReviewsEvidence) {
    proofGaps.delete("reviews");
  }

  if (hasCaseStudiesEvidence) {
    proofGaps.delete("cases");
  }

  if (hasProcessProofEvidence) {
    proofGaps.delete("process proof");
  }

  if (hasBeforeAfterEvidence) {
    proofGaps.delete("before-after");
  }

  return {
    confirmedTestimonials: lowerProofSignals.filter((item) => hasAnyToken(item, ["testemunho", "testimonial", "testimonials", "depoimento"])),
    confirmedReviews: lowerProofSignals.filter((item) => hasAnyToken(item, ["review", "reviews", "avaliac", "rating"])),
    publicCaseStudies: lowerProofSignals.filter((item) => hasAnyToken(item, ["case", "cases", "case study", "case studies", "caso", "casos"])),
    beforeAfterEvidence: lowerProofSignals.filter((item) => hasAnyToken(item, ["antes", "depois", "before", "after"])),
    processProof: lowerProofSignals.filter((item) => hasAnyToken(item, ["process", "processo", "bastidor", "rotina"])),
    institutionalProof: [],
    creatorOrFounderProof: [],
    proofGaps: Array.from(proofGaps),
  };
};

const buildBrandSummary = (input: {
  client: { name: string; website_url: string | null; segment: string | null; notes: string | null; status: string };
  profilesCount: number;
  socialSnapshot: { confidence: number | null; public_only: boolean | null } | null;
  brandTone: string | null;
  marketStage: string | null;
}) => {
  const confidenceSource = input.socialSnapshot?.confidence ?? 0;
  const statusLabel =
    confidenceSource >= 80
      ? "confirmed"
      : confidenceSource >= 50 || input.profilesCount > 0
        ? "partial"
        : "needs confirmation";

  return {
    statusLabel,
    summary: `${input.client.name} tem ${input.profilesCount} perfil(is) social(is) conectado(s) e um rascunho de marca com foco em ${input.marketStage ?? "posicionamento"}.`,
    confidenceScore: confidenceSource || (input.profilesCount > 0 ? 60 : 35),
    publicOnly: input.socialSnapshot?.public_only ?? true,
    brandTone: input.brandTone,
  };
};

export const buildBrandProfilePayload = (input: {
  client: {
    id: string;
    name: string;
    slug: string;
    website_url: string | null;
    segment: string | null;
    status: string;
    notes: string | null;
  };
  clientRecord: { id: string; payload_json: unknown; version: number } | null;
  marketResearch: { id: string; payload_json: unknown; version: number } | null;
  socialSnapshot: {
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
  profiles: Array<{ platform: string; handle: string; profile_url: string; confidence: number }>;
}) => {
  const clientRecordPayload = asRecord(input.clientRecord?.payload_json);
  const marketResearchPayload = asRecord(input.marketResearch?.payload_json);

  const marketStage =
    getRecordString(marketResearchPayload, ["market", "stage"]) ??
    getRecordString(marketResearchPayload, ["market", "maturity"]) ??
    getRecordString(clientRecordPayload, ["diagnosis", "marketStage"]) ??
    null;
  const marketSummary = getRecordString(marketResearchPayload, ["market", "summary"]);
  const marketPositioning = getRecordString(marketResearchPayload, ["market", "positioning"]);
  const offerPriority =
    getRecordString(clientRecordPayload, ["offerRecommendation", "focus"]) ??
    getRecordString(clientRecordPayload, ["narrative", "recommendedPositioning"]) ??
    null;
  const tone = getRecordString(clientRecordPayload, ["voice", "tone"]) ?? getRecordString(clientRecordPayload, ["narrative", "tone"]) ?? null;
  const positioning = getRecordString(clientRecordPayload, ["narrative", "recommendedPositioning"]) ?? marketPositioning;
  const audience =
    getRecordString(clientRecordPayload, ["diagnosis", "audienceContext"]) ??
    getRecordString(clientRecordPayload, ["narrative", "audience"]) ??
    input.client.segment ??
    null;
  const mainGaps = getRecordArray(clientRecordPayload, ["diagnosis", "mainGaps"]);
  const opportunityNotes = getRecordArray(clientRecordPayload, ["diagnosis", "opportunityNotes"]);
  const brandPromise = getRecordString(clientRecordPayload, ["narrative", "summary"]) ?? positioning ?? null;
  const differentiators =
    getRecordArray(clientRecordPayload, ["diagnosis", "differentiators"]).length > 0
      ? getRecordArray(clientRecordPayload, ["diagnosis", "differentiators"])
      : getRecordArray(marketResearchPayload, ["recommendations", "differentiators"]);
  const socialProfileRows = input.profiles.map((profile) => ({
    platform: profile.platform,
    handle: profile.handle,
    profileUrl: profile.profile_url,
    confidence: profile.confidence,
  }));

  const inferredPalette = inferPalette({
    segment: input.client.segment,
    tone,
    positioning,
  });
  const inferredTone = inferTone({
    tone,
    positioning,
    segment: input.client.segment,
  });
  const inferredPrimaryCta = inferPrimaryCta({
    marketStage,
    offerPriority,
    segment: input.client.segment,
  });
  const proof = collectProofSignals({
    clientRecordPayload,
    snapshot: input.socialSnapshot,
    marketResearchPayload,
  });
  const summary = buildBrandSummary({
    client: input.client,
    profilesCount: socialProfileRows.length,
    socialSnapshot: input.socialSnapshot ? { confidence: input.socialSnapshot.confidence, public_only: input.socialSnapshot.public_only } : null,
    brandTone: inferredTone,
    marketStage,
  });

  return {
    summary: summary.summary,
    meta: {
      statusLabel: summary.statusLabel,
      confidenceScore: summary.confidenceScore,
      publicOnly: summary.publicOnly,
      sourceIds: {
        clientRecordId: input.clientRecord?.id ?? null,
        marketResearchId: input.marketResearch?.id ?? null,
        snapshotId: input.socialSnapshot?.id ?? null,
      },
    },
    confirmed: {
      brandName: input.client.name,
      website: input.client.website_url,
      category: input.client.segment,
      socialProfiles: socialProfileRows,
      operatingRegion: getRecordString(marketResearchPayload, ["market", "scope"]) ?? null,
      marketSummary,
    },
    inferred: {
      audience,
      pains:
        getRecordArray(clientRecordPayload, ["diagnosis", "mainGaps"]).length > 0
          ? getRecordArray(clientRecordPayload, ["diagnosis", "mainGaps"])
          : mainGaps,
      desiredOutcomes: getRecordArray(clientRecordPayload, ["narrative", "desiredOutcomes"]),
      objections: getRecordArray(clientRecordPayload, ["diagnosis", "objections"]),
      uniqueValueProposition: getRecordString(clientRecordPayload, ["narrative", "recommendedPositioning"]) ?? marketPositioning,
      primaryCta: inferredPrimaryCta,
      toneOfVoice: inferredTone,
      visualPalette: inferredPalette,
      visualStyle: getRecordString(marketResearchPayload, ["market", "visualStyle"]) ?? "clean, editorial and proof-led",
      motionStylePreference: "short-form vertical video with readable captions",
      differentiators,
      promise: brandPromise,
      opportunityNotes,
    },
    proof,
  };
};

const buildBrandProfileVersionInput = (input: {
  client: {
    id: string;
    name: string;
    slug: string;
    website_url: string | null;
    segment: string | null;
    status: string;
    notes: string | null;
  };
  clientRecord: { id: string; payload_json: unknown; version: number } | null;
  marketResearch: { id: string; payload_json: unknown; version: number } | null;
  socialSnapshot: {
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
  profiles: Array<{ platform: string; handle: string; profile_url: string; confidence: number }>;
  status: string;
}) => {
  const payload = buildBrandProfilePayload(input);

  return {
    clientId: input.client.id,
    sourceSnapshotId: input.socialSnapshot?.id ?? null,
    sourceClientRecordId: input.clientRecord?.id ?? null,
    sourceMarketResearchId: input.marketResearch?.id ?? null,
    status: input.status,
    confidence: payload.meta.confidenceScore,
    confirmed: payload.confirmed,
    inferred: payload.inferred,
    proof: payload.proof,
  };
};

export const getBrandProfileContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [latestBrandProfile, latestClientRecord, marketResearch, socialSnapshot, profiles, brandProfiles] = await Promise.all([
    findLatestBrandProfileByClientId(input.clientId),
    findLatestClientRecordByClientId(input.clientId),
    findLatestMarketResearchByClientId(input.clientId),
    listLatestSnapshotByClientId(input.clientId),
    listSocialProfilesByClientId(input.clientId),
    listBrandProfilesByClientId(input.clientId),
  ]);

  const draftPayload = buildBrandProfilePayload({
    client: {
      id: client.id,
      name: client.name,
      slug: client.slug,
      website_url: client.website_url,
      segment: client.segment,
      status: client.status,
      notes: client.notes,
    },
    clientRecord: latestClientRecord
      ? { id: latestClientRecord.id, payload_json: latestClientRecord.payload_json, version: latestClientRecord.version }
      : null,
    marketResearch: marketResearch
      ? { id: marketResearch.id, payload_json: marketResearch.payload_json, version: marketResearch.version }
      : null,
    socialSnapshot,
    profiles,
  });

  return {
    client,
    latestBrandProfile,
    brandProfile: latestBrandProfile ?? {
      id: null,
      client_id: client.id,
      source_snapshot_id: socialSnapshot?.id ?? null,
      source_client_record_id: latestClientRecord?.id ?? null,
      source_market_research_id: marketResearch?.id ?? null,
      version: 0,
      status: "draft",
      confidence: draftPayload.meta.confidenceScore,
      confirmed_json: draftPayload.confirmed,
      inferred_json: draftPayload.inferred,
      proof_json: draftPayload.proof,
      created_at: null,
      updated_at: null,
      draft: true,
    },
    brandProfiles,
    payload: draftPayload,
    sources: {
      clientRecord: latestClientRecord,
      marketResearch,
      socialSnapshot,
      profiles,
    },
  };
};

export const createBrandProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  status: string;
  note?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [latestClientRecord, marketResearch, socialSnapshot, profiles] = await Promise.all([
    findLatestClientRecordByClientId(input.clientId),
    findLatestMarketResearchByClientId(input.clientId),
    listLatestSnapshotByClientId(input.clientId),
    listSocialProfilesByClientId(input.clientId),
  ]);

  const versionInput = buildBrandProfileVersionInput({
    client: {
      id: client.id,
      name: client.name,
      slug: client.slug,
      website_url: client.website_url,
      segment: client.segment,
      status: client.status,
      notes: client.notes,
    },
    clientRecord: latestClientRecord
      ? { id: latestClientRecord.id, payload_json: latestClientRecord.payload_json, version: latestClientRecord.version }
      : null,
    marketResearch: marketResearch
      ? { id: marketResearch.id, payload_json: marketResearch.payload_json, version: marketResearch.version }
      : null,
    socialSnapshot,
    profiles,
    status: input.status,
  });

  const brandProfile = await createBrandProfileVersion(versionInput);
  const brandProfiles = await listBrandProfilesByClientId(input.clientId);

  return {
    client,
    brandProfile,
    brandProfiles,
    payload: {
      ...versionInput.confirmed,
      ...versionInput.inferred,
      ...versionInput.proof,
      note: input.note ?? null,
      createdFrom: "evidence-draft",
    },
  };
};

export const reviseBrandProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  status: string;
  note?: string;
  summaryOverride?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const latestBrandProfile = await findLatestBrandProfileByClientId(input.clientId);
  const [latestClientRecord, marketResearch, socialSnapshot, profiles] = await Promise.all([
    findLatestClientRecordByClientId(input.clientId),
    findLatestMarketResearchByClientId(input.clientId),
    listLatestSnapshotByClientId(input.clientId),
    listSocialProfilesByClientId(input.clientId),
  ]);

  const versionInput = buildBrandProfileVersionInput({
    client: {
      id: client.id,
      name: client.name,
      slug: client.slug,
      website_url: client.website_url,
      segment: client.segment,
      status: client.status,
      notes: client.notes,
    },
    clientRecord: latestClientRecord
      ? { id: latestClientRecord.id, payload_json: latestClientRecord.payload_json, version: latestClientRecord.version }
      : null,
    marketResearch: marketResearch
      ? { id: marketResearch.id, payload_json: marketResearch.payload_json, version: marketResearch.version }
      : null,
    socialSnapshot,
    profiles,
    status: input.status,
  });

  const mergedConfirmed = {
    ...versionInput.confirmed,
    summaryOverride: input.summaryOverride ?? null,
    note: input.note ?? null,
    revisedFromBrandProfileVersion: latestBrandProfile?.version ?? null,
    createdFrom: "manual-edit",
  };

  const brandProfile = await updateBrandProfileVersion({
    clientId: input.clientId,
    sourceSnapshotId: versionInput.sourceSnapshotId,
    sourceClientRecordId: versionInput.sourceClientRecordId,
    sourceMarketResearchId: versionInput.sourceMarketResearchId,
    status: input.status,
    confidence: versionInput.confidence,
    confirmed: mergedConfirmed,
    inferred: versionInput.inferred,
    proof: versionInput.proof,
  });

  const brandProfiles = await listBrandProfilesByClientId(input.clientId);

  return {
    client,
    brandProfile,
    brandProfiles,
    payload: {
      ...mergedConfirmed,
      ...versionInput.inferred,
      ...versionInput.proof,
    },
  };
};

export const listBrandProfiles = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const brandProfiles = await listBrandProfilesByClientId(input.clientId);

  return {
    client,
    brandProfiles,
  };
};

export type { BrandProfileRow };
