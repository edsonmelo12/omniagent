import type {
  Approval,
  Agency,
  AssistantConsultation,
  ApiEnvelope,
  ClientRecord,
  ClientReportResult,
  ContentPackage,
  EditorialPauta,
  ContentPlan,
  Client,
  CampaignResult,
  MonitoringReport,
  OfferProfile,
  PostArtGalleryRecord,
  PostArtGalleryComparison,
  PublishingCreateResult,
  PublishingResult,
  PostArtGallery,
  RenderedAsset,
  MarketResearch,
  MarketPresenceBaseline,
  MarketPresenceCheckpoint,
  MarketPresenceComparison,
  MarketPresenceIntervention,
  MarketPresenceResult,
  Product,
  ProductResult,
  ProductsResult,
  Proposal,
  ProductEventMetrics,
  ReadyResponse,
  Schedule,
  StrategyRecommendationResult,
  SocialPresenceSnapshotRecord,
  SocialIntelligenceSnapshot,
  SocialProfile,
  SocialPresenceSummary,
  YoutubeStrategyResult,
  User,
} from "@/types/backend";
import { ptBR } from "@/i18n/pt-BR";

export type BootstrapResult = {
  accessToken: string;
  user: User;
  agencies: Agency[];
};

export type LoginResult = BootstrapResult;

export type MeResult = {
  user: User;
  agencies: Agency[];
};

export type ClientsResult = {
  clients: Client[];
};

export type AccessibleClientsResult = {
  agencyId: string | null;
  clients: Client[];
};

export type ClientResult = {
  client: Client;
};

export type DiscoveryResult = {
  client: Client;
  sourceUrls: string[];
  discoveredProfiles: SocialProfile[];
  profiles: SocialProfile[];
};

export type SocialIntelligenceResult = {
  client: Client;
  profiles: SocialProfile[];
  snapshot: SocialIntelligenceSnapshot;
  sources: Array<{ source_url: string; source_type: string; confidence: number; notes: string | null }>;
};

export type SocialPresenceResult = {
  client: Client;
  profiles: SocialProfile[];
  latestSnapshots: SocialPresenceSnapshotRecord[];
  summary: SocialPresenceSummary;
};

export type ClientRecordResult = {
  client: Client;
  latestClientRecord: ClientRecord | null;
  brandProfile: Record<string, unknown> | null;
  latestBrandProfile: Record<string, unknown> | null;
  brandProfiles: Record<string, unknown>[];
  creativeProfile: Record<string, unknown> | null;
  latestCreativeProfile: Record<string, unknown> | null;
  creativeProfiles: Record<string, unknown>[];
  primaryProduct: Product | null;
  offerProfile: OfferProfile | null;
  offerProfiles: OfferProfile[];
  snapshot: SocialIntelligenceSnapshot | null;
  marketResearch: MarketResearch | null;
  profiles: SocialProfile[];
};

export type MarketResearchResult = {
  client: Client;
  latestMarketResearch: MarketResearch | null;
  marketResearches: MarketResearch[];
  clientRecord: ClientRecord | null;
  snapshot: SocialIntelligenceSnapshot | null;
  profiles: SocialProfile[];
};

export type ContentResult = {
  client: Client;
  contentPlan: ContentPlan | null;
  contentPackage: ContentPackage | null;
  contentPlans: ContentPlan[];
  contentPackages: ContentPackage[];
  schedules: Schedule[];
  renderedAsset: RenderedAsset | null;
  renderedAssets: RenderedAsset[];
  postArtGallery: PostArtGallery | null;
  postArtGalleries: PostArtGalleryRecord[];
  postArtGalleryComparison: PostArtGalleryComparison | null;
  clientRecord: ClientRecord | null;
  brandProfile: Record<string, unknown> | null;
  primaryProduct: Product | null;
  offerProfile: OfferProfile | null;
  offerProfiles: OfferProfile[];
  marketResearch: MarketResearch | null;
  editorialPautas: EditorialPauta[];
  proposal: Proposal | null;
  snapshot: SocialIntelligenceSnapshot | null;
};

export type ContentPlanResult = {
  client: Client;
  contentPlan: ContentPlan;
  contentPackage: ContentPackage;
  contentPlans: ContentPlan[];
  contentPackages: ContentPackage[];
  renderedAsset: RenderedAsset | null;
  renderedAssets: RenderedAsset[];
  postArtGallery: PostArtGallery | null;
  postArtGalleries: PostArtGalleryRecord[];
  postArtGalleryComparison: PostArtGalleryComparison | null;
  clientRecord: ClientRecord | null;
  brandProfile: Record<string, unknown> | null;
  primaryProduct: Product | null;
  offerProfile: OfferProfile | null;
  marketResearch: MarketResearch | null;
  editorialPautas: EditorialPauta[];
  proposal: Proposal | null;
  snapshot: SocialIntelligenceSnapshot | null;
};

export type RenderedAssetsRefreshResult = ContentResult;

export type PostArtGalleryResult = {
  client: Client;
  postArtGallery: PostArtGallery | null;
  postArtGalleries: PostArtGalleryRecord[];
  postArtGalleryComparison: PostArtGalleryComparison | null;
};

export type ScheduleResult = {
  client: Client;
  contentPlan: ContentPlan;
  schedule: Schedule;
  schedules: Schedule[];
  payload: Record<string, unknown>;
  renderedAsset: RenderedAsset | null;
  renderedAssets: RenderedAsset[];
  postArtGallery: PostArtGallery | null;
  postArtGalleries: PostArtGalleryRecord[];
  postArtGalleryComparison: PostArtGalleryComparison | null;
};

export type ProposalResult = {
  client: Client;
  clientRecord: ClientRecord | null;
  snapshot: SocialIntelligenceSnapshot | null;
  marketResearch: MarketResearch | null;
  creativeProfile?: Record<string, unknown> | null;
  brandProfile?: Record<string, unknown> | null;
  primaryProduct?: Product | null;
  offerProfile?: Record<string, unknown> | null;
  proposalBrief?: Record<string, unknown> | null;
  proposal: Proposal | null;
  proposals: Proposal[];
  payload: Record<string, unknown>;
};

export type MonitoringResult = {
  client: Client;
  latestReport: MonitoringReport | null;
  reports: MonitoringReport[];
  clientRecord: ClientRecord | null;
  proposal: Proposal | null;
  snapshot: SocialIntelligenceSnapshot | null;
  contentPlan: ContentPlan | null;
  latestSchedule: Schedule | null;
  schedules: Schedule[];
  contentPlanPayload: Record<string, unknown> | null;
  schedulePayload: Record<string, unknown> | null;
};

export type MonitoringCreateResult = {
  client: Client;
  report: MonitoringReport;
  reports: MonitoringReport[];
  payload: Record<string, unknown>;
};

export type AssistantResult = AssistantConsultation;

export type ApprovalsResult = {
  client: Client;
  approvals: Approval[];
};

export type ApprovalResult = {
  client: Client;
  approval: Approval;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() || "";

const STORAGE_KEYS = {
  accessToken: "opensquad.accessToken",
  agencyId: "opensquad.agencyId",
  sessionMode: "opensquad.sessionMode",
  legacyAccessToken: "socialGrowth.accessToken",
  legacyAgencyId: "socialGrowth.agencyId",
} as const;

type SessionMode = "anonymous" | "authenticated";

class BackendApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

const readAccessToken = () =>
  localStorage.getItem(STORAGE_KEYS.accessToken) ?? localStorage.getItem(STORAGE_KEYS.legacyAccessToken) ?? "";
const readAgencyId = () => localStorage.getItem(STORAGE_KEYS.agencyId) ?? localStorage.getItem(STORAGE_KEYS.legacyAgencyId) ?? "";
const readSessionMode = (): SessionMode => {
  const mode = localStorage.getItem(STORAGE_KEYS.sessionMode);

  if (mode === "anonymous" || mode === "authenticated") {
    return mode;
  }

  return readAccessToken() ? "authenticated" : "anonymous";
};

const writeSession = (accessToken: string, agencyId?: string, mode: SessionMode = "authenticated") => {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.sessionMode, mode);
  if (agencyId) {
    localStorage.setItem(STORAGE_KEYS.agencyId, agencyId);
  }
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.agencyId);
  localStorage.removeItem(STORAGE_KEYS.sessionMode);
  localStorage.removeItem(STORAGE_KEYS.legacyAccessToken);
  localStorage.removeItem(STORAGE_KEYS.legacyAgencyId);
};

export const getSession = () => ({
  accessToken: readAccessToken(),
  agencyId: readAgencyId(),
  mode: readSessionMode(),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForBackendReady = async (attempts = 20, delayMs = 250) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}/ready`, {
        cache: "no-store",
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Ignore transient network errors while the backend is still booting.
    }

    await sleep(delayMs);
  }

  throw new Error(ptBR.backendOps.statuses.offline);
};

const isTransientAuthFailure = (error: unknown) => error instanceof BackendApiError && error.status >= 500 && error.status < 600;

const buildRequestHeaders = (path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers ?? {});
  const accessToken = readAccessToken();
  const agencyId = readAgencyId();

  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  if (agencyId && path.startsWith("/api/v1/")) {
    headers.set("x-agency-id", agencyId);
  }

  if (init.body !== undefined && init.body !== null) {
    headers.set("content-type", "application/json");
  }

  return headers;
};

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = buildRequestHeaders(path, init);

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as ApiEnvelope<T> | { error?: { message?: string } }) : null;

  if (!response.ok) {
    const message = parsed && "error" in parsed && parsed.error?.message ? parsed.error.message : ptBR.backendOps.statuses.requestFailed(response.status);
    throw new BackendApiError(message, response.status);
  }

  if (!parsed || !("data" in parsed)) {
    throw new Error(ptBR.backendOps.statuses.invalidResponse);
  }

  return parsed.data;
};

const requestBlob = async (path: string, init: RequestInit = {}) => {
  const headers = buildRequestHeaders(path, init);
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: ApiEnvelope<unknown> | { error?: { message?: string } } | null = null;

    if (text) {
      try {
        parsed = JSON.parse(text) as ApiEnvelope<unknown> | { error?: { message?: string } };
      } catch {
        parsed = null;
      }
    }

    const message = parsed && "error" in parsed && parsed.error?.message ? parsed.error.message : ptBR.backendOps.statuses.requestFailed(response.status);
    throw new Error(message);
  }

  return response.blob();
};

export const backendApi = {
  health: () => requestJson<{ status: string }>("/health"),
  ready: () => requestJson<ReadyResponse>("/ready"),
  bootstrap: async (payload: {
    agency: { name: string; slug: string };
    user: { name: string; email: string; password: string };
  }) => {
    await waitForBackendReady();

    const result = await requestJson<BootstrapResult>("/api/v1/auth/bootstrap", {
      method: "POST",
      body: JSON.stringify(payload),
    }).catch(async (error) => {
      if (!isTransientAuthFailure(error)) {
        throw error;
      }

      await waitForBackendReady();
      return requestJson<BootstrapResult>("/api/v1/auth/bootstrap", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    });
    writeSession(result.accessToken, result.agencies[0]?.id, "authenticated");
    return result;
  },
  login: async (payload: { email: string; password: string }) => {
    await waitForBackendReady();

    const result = await requestJson<LoginResult>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }).catch(async (error) => {
      if (!isTransientAuthFailure(error)) {
        throw error;
      }

      await waitForBackendReady();
      return requestJson<LoginResult>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    });
    writeSession(result.accessToken, result.agencies[0]?.id, "authenticated");
    return result;
  },
  anonymousLogin: async () => {
    await waitForBackendReady();

    const result = await requestJson<LoginResult>("/api/v1/auth/anonymous", {
      method: "POST",
      body: JSON.stringify({}),
    }).catch(async (error) => {
      if (!isTransientAuthFailure(error)) {
        throw error;
      }

      await waitForBackendReady();
      return requestJson<LoginResult>("/api/v1/auth/anonymous", {
        method: "POST",
        body: JSON.stringify({}),
      });
    });
    writeSession(result.accessToken, result.agencies[0]?.id, "anonymous");
    return result;
  },
  ensureAnonymousSession: async () => {
    const session = getSession();

    if (session.mode === "anonymous" && session.accessToken) {
      return session;
    }

    await backendApi.anonymousLogin();
    return getSession();
  },
  ensureAuthenticatedSession: async () => {
    const session = getSession();

    if (session.accessToken) {
      try {
        const me = await backendApi.me();
        const agencyId = session.agencyId || me.agencies[0]?.id || "";

        if (agencyId && agencyId !== session.agencyId) {
          writeSession(session.accessToken, agencyId, "authenticated");
        }

        return getSession();
      } catch {
        clearSession();
      }
    }

    await backendApi.anonymousLogin();
    return getSession();
  },
  loadAccessibleClients: async () => {
    const loadForSession = async (session: { agencyId: string }) => {
      const agenciesResponse = await backendApi.listAgencies();
      const orderedAgencies = [
        ...(session.agencyId ? agenciesResponse.agencies.filter((agency) => agency.id === session.agencyId) : []),
        ...agenciesResponse.agencies.filter((agency) => agency.id !== session.agencyId),
      ];

      for (const agency of orderedAgencies) {
        const result = await backendApi.listClients(agency.id);
        if (result.clients.length > 0) {
          return {
            agencyId: agency.id,
            clients: result.clients,
          };
        }
      }

      return {
        agencyId: orderedAgencies[0]?.id ?? session.agencyId ?? null,
        clients: [],
      };
    };

    const session = await backendApi.ensureAuthenticatedSession();
    const initialResult = await loadForSession(session);

    if (initialResult.clients.length > 0) {
      return initialResult;
    }

    console.warn("No clients found in authenticated session, falling back to anonymous mode.");
    await backendApi.anonymousLogin();
    const anonymousSession = getSession();
    return loadForSession(anonymousSession);
  },
  me: () => requestJson<MeResult>("/api/v1/me"),
  listAgencies: () => requestJson<{ agencies: Agency[] }>("/api/v1/agencies"),
  createAgency: (payload: { name: string; slug: string; plan?: string }) =>
    requestJson<{ agency: Agency }>("/api/v1/agencies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listClients: (agencyId?: string) => {
    if (agencyId) {
      localStorage.setItem(STORAGE_KEYS.agencyId, agencyId);
    }

    return requestJson<ClientsResult>("/api/v1/clients");
  },
  createClient: (payload: { name: string; slug: string; segment?: string; websiteUrl?: string; notes?: string }) =>
    requestJson<ClientResult>("/api/v1/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  loadClient: (clientId: string) => requestJson<ClientResult>(`/api/v1/clients/${clientId}`),
  deleteClient: (clientId: string) =>
    requestJson<ClientResult>(`/api/v1/clients/${clientId}`, {
      method: "DELETE",
    }),
  updateClient: (
    clientId: string,
    payload: {
      name?: string;
      slug?: string;
      segment?: string;
      websiteUrl?: string;
      notes?: string;
    },
  ) =>
    requestJson<ClientResult>(`/api/v1/clients/${clientId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  discoverProfiles: (clientId: string, payload: { sourceUrls: string[]; discoveredProfiles?: Array<{ platform: string; handle: string; profileUrl: string; discoverySource: string; confidence?: number; notes?: string }> }) =>
    requestJson<DiscoveryResult>(`/api/v1/clients/${clientId}/discovery`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  loadSocialIntelligence: (clientId: string) => requestJson<SocialIntelligenceResult>(`/api/v1/clients/${clientId}/social-intelligence`),
  loadSocialPresence: (clientId: string) => requestJson<SocialPresenceResult>(`/api/v1/clients/${clientId}/social-presence/latest`),
  buildSocialIntelligence: (clientId: string, payload: { publicOnly: boolean; confidence?: number; rawNotes?: string; sourceUrls: string[] }) =>
    requestJson<SocialIntelligenceResult>(`/api/v1/clients/${clientId}/social-intelligence`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  loadClientRecord: (clientId: string) => requestJson<ClientRecordResult>(`/api/v1/clients/${clientId}/client-record`),
  loadMarketResearch: (clientId: string) => requestJson<MarketResearchResult>(`/api/v1/clients/${clientId}/market-research`),
  loadMarketPresence: (clientId: string) => requestJson<MarketPresenceResult>(`/api/v1/clients/${clientId}/market-presence`),
  loadClientReport: (clientId: string) => requestJson<ClientReportResult>(`/api/v1/clients/${clientId}/report`),
  loadProducts: (clientId: string) => requestJson<ProductsResult>(`/api/v1/clients/${clientId}/products`),
  createProduct: (
    clientId: string,
    payload: {
      name: string;
      slug?: string;
      category?: string;
      offerType?: string;
      priceLabel?: string;
      promise: string;
      problemSolved: string;
      audience: string;
      status: "draft" | "validated" | "prioritized" | "in_campaign" | "monitored" | "archived";
      priority?: number;
      landingUrl?: string;
      proofPoints?: string[];
      notes?: string;
    },
  ) =>
    requestJson<ProductResult>(`/api/v1/clients/${clientId}/products`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (productId: string) =>
    requestJson<ProductResult>(`/api/v1/products/${productId}`, {
      method: "DELETE",
    }),
  updateProduct: (
    productId: string,
    payload: Partial<{
      name: string;
      slug: string;
      category: string;
      offerType: string;
      priceLabel: string;
      promise: string;
      problemSolved: string;
      audience: string;
      status: "draft" | "validated" | "prioritized" | "in_campaign" | "monitored" | "archived";
      priority: number;
      landingUrl: string;
      proofPoints: string[];
      notes: string;
    }>,
  ) =>
    requestJson<ProductResult>(`/api/v1/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  activateProduct: (productId: string) =>
    requestJson<ProductResult>(`/api/v1/products/${productId}/focus`, {
      method: "PATCH",
    }),
  createMarketResearch: (
    clientId: string,
    payload: {
      status: "draft" | "review" | "approved";
      publicOnly: boolean;
      confidence?: number;
      sourceUrls: string[];
      competitorUrls: string[];
      note?: string;
    },
  ) =>
    requestJson<{ client: Client; marketResearch: MarketResearch; marketResearches: MarketResearch[]; payload: Record<string, unknown> }>(
      `/api/v1/clients/${clientId}/market-research`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  reviseMarketResearch: (
    clientId: string,
    payload: {
      status: "draft" | "review" | "approved";
      publicOnly: boolean;
      confidence?: number;
      sourceUrls: string[];
      competitorUrls: string[];
      note?: string;
      summaryOverride?: string;
    },
  ) =>
    requestJson<{ client: Client; marketResearch: MarketResearch; marketResearches: MarketResearch[]; payload: Record<string, unknown> }>(
      `/api/v1/clients/${clientId}/market-research`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  createClientRecord: (clientId: string, payload: { status: "draft" | "review" | "approved"; note?: string }) =>
    requestJson<{ clientRecord: ClientRecord; clientRecords: ClientRecord[]; payload: Record<string, unknown>; client: Client }>(`/api/v1/clients/${clientId}/client-record`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviseClientRecord: (clientId: string, payload: { status: "draft" | "review" | "approved"; note?: string; summaryOverride?: string }) =>
    requestJson<{ clientRecord: ClientRecord; clientRecords: ClientRecord[]; payload: Record<string, unknown>; client: Client }>(`/api/v1/clients/${clientId}/client-record`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  createMarketPresenceBaseline: (
    clientId: string,
    payload: {
      scope?: "local" | "regional" | "nacional" | "nicho" | "hibrido";
      marketContext?: string;
      sourceSnapshotId?: string;
      sourceClientRecordId?: string;
      sourceMarketResearchId?: string;
      evidenceUrls?: string[];
      notes?: string;
    },
  ) =>
    requestJson<{ client: Client; baseline: MarketPresenceBaseline; baselines: MarketPresenceBaseline[]; payload: Record<string, unknown> }>(
      `/api/v1/clients/${clientId}/market-presence/baselines`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  createMarketPresenceIntervention: (
    clientId: string,
    payload: {
      baselineId?: string;
      periodStart?: string;
      periodEnd?: string;
      actionsTaken?: string[];
      channelsEdited?: string[];
      contentVolume?: number;
      ctaChanges?: number;
      siteChanges?: number;
      proofChanges?: number;
      notes?: string;
    },
  ) =>
    requestJson<{ client: Client; baseline: MarketPresenceBaseline; intervention: MarketPresenceIntervention; interventions: MarketPresenceIntervention[]; payload: Record<string, unknown> }>(
      `/api/v1/clients/${clientId}/market-presence/interventions`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  createMarketPresenceCheckpoint: (
    clientId: string,
    payload: {
      baselineId?: string;
      interventionId?: string;
      sourceSnapshotId?: string;
      sourceClientRecordId?: string;
      sourceMarketResearchId?: string;
      collectedAt?: string;
      evidenceUrls?: string[];
      notes?: string;
    },
  ) =>
    requestJson<{
      client: Client;
      baseline: MarketPresenceBaseline;
      intervention: MarketPresenceIntervention | null;
      checkpoint: MarketPresenceCheckpoint;
      comparison: MarketPresenceComparison;
      checkpoints: MarketPresenceCheckpoint[];
      comparisons: MarketPresenceComparison[];
      payload: Record<string, unknown>;
    }>(`/api/v1/clients/${clientId}/market-presence/checkpoints`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  compareMarketPresence: (
    clientId: string,
    payload: {
      baselineId: string;
      checkpointId: string;
    },
  ) =>
    requestJson<{
      client: Client;
      baseline: MarketPresenceBaseline;
      checkpoint: MarketPresenceCheckpoint;
      comparison: MarketPresenceComparison;
      comparisons: MarketPresenceComparison[];
      payload: Record<string, unknown>;
    }>(`/api/v1/clients/${clientId}/market-presence/compare`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  loadProposals: (clientId: string) => requestJson<ProposalResult>(`/api/v1/clients/${clientId}/proposals`),
  createProposal: (clientId: string, payload: { status: "draft" | "review" | "approved" }) =>
    requestJson<ProposalResult>(`/api/v1/clients/${clientId}/proposals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviseProposal: (clientId: string, payload: { status: "draft" | "review" | "approved"; thesisOverride?: string; note?: string }) =>
    requestJson<ProposalResult>(`/api/v1/clients/${clientId}/proposals`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  loadContent: (clientId: string) => requestJson<ContentResult>(`/api/v1/clients/${clientId}/content`),
  refreshRenderedAssets: (clientId: string) =>
    requestJson<RenderedAssetsRefreshResult>(`/api/v1/clients/${clientId}/rendered-assets/refresh`, {
      method: "POST",
    }),
  regenerateRenderedAsset: (
    clientId: string,
    renderedAssetId: string,
    payload: { mode?: "auto" | "alternate" | "revision"; revisionNote?: string | null },
  ) =>
    requestJson<RenderedAssetsRefreshResult>(`/api/v1/clients/${clientId}/rendered-assets/${renderedAssetId}/regenerate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  loadRenderedAssetFileBlob: (clientId: string, renderedAssetId: string) =>
    requestBlob(`/api/v1/clients/${clientId}/rendered-assets/${renderedAssetId}/file`),
  loadRenderedAssetAudioBlob: (clientId: string, renderedAssetId: string) =>
    requestBlob(`/api/v1/clients/${clientId}/rendered-assets/${renderedAssetId}/audio`),
  loadRenderedAssetSubtitleBlob: (clientId: string, renderedAssetId: string) =>
    requestBlob(`/api/v1/clients/${clientId}/rendered-assets/${renderedAssetId}/subtitles`),
  generatePostArtGallery: (clientId: string, mode?: "feed_carousel" | "story" | "all") =>
    requestJson<PostArtGalleryResult>(`/api/v1/clients/${clientId}/post-art-gallery`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),
  createContentPlan: (clientId: string, payload: { status: "draft" | "review" | "approved"; objective?: string }) =>
    requestJson<ContentPlanResult>(`/api/v1/clients/${clientId}/content-plan`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviseContentPlan: (clientId: string, payload: { status: "draft" | "review" | "approved"; objective?: string; note?: string }) =>
    requestJson<ContentPlanResult>(`/api/v1/clients/${clientId}/content-plan`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  createSchedule: (clientId: string, payload: { status: "draft" | "review" | "approved"; startDate?: string; endDate?: string }) =>
    requestJson<ScheduleResult>(`/api/v1/clients/${clientId}/schedules`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviseSchedule: (clientId: string, payload: { status: "draft" | "review" | "approved"; startDate?: string; endDate?: string; note?: string }) =>
    requestJson<ScheduleResult>(`/api/v1/clients/${clientId}/schedules`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  loadPublishing: (clientId: string) => requestJson<PublishingResult>(`/api/v1/clients/${clientId}/publishing`),
  executePublishing: (
    clientId: string,
    payload: { mode: "dry_run" | "live"; confirm?: boolean; platforms?: string[]; notes?: string },
  ) =>
    requestJson<PublishingCreateResult>(`/api/v1/clients/${clientId}/publishing`, {
      method: "POST",
      body: JSON.stringify({
        mode: payload.mode,
        confirm: payload.confirm ?? false,
        platforms: payload.platforms ?? [],
        notes: payload.notes,
      }),
    }),
  loadMonitoring: (clientId: string) => requestJson<MonitoringResult>(`/api/v1/clients/${clientId}/monitoring`),
  loadCampaign: (clientId: string) => requestJson<CampaignResult>(`/api/v1/clients/${clientId}/campaign`),
  loadYoutubeStrategyAnalyses: (clientId: string) => requestJson<YoutubeStrategyResult>(`/api/v1/clients/${clientId}/youtube-strategy-analyses`),
  recommendStrategyForClient: (
    clientId: string,
    payload: {
      productId?: string;
      campaignObjective?: string;
      productContext?: string;
      serviceContext?: string;
      audienceContext?: string;
      funnelStage?: string;
    },
  ) =>
    requestJson<StrategyRecommendationResult>(`/api/v1/clients/${clientId}/strategy-recommendations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  analyzeYoutubeStrategy: (
    clientId: string,
    payload: {
      status?: "draft" | "review" | "approved";
      videoUrls: string[];
      notes?: string;
      campaignObjective?: string;
      funnelStage?: string;
    },
  ) =>
    requestJson<YoutubeStrategyResult>(`/api/v1/clients/${clientId}/youtube-strategy-analyses`, {
      method: "POST",
      body: JSON.stringify({
        status: payload.status ?? "draft",
        videoUrls: payload.videoUrls,
        notes: payload.notes,
        campaignObjective: payload.campaignObjective,
        funnelStage: payload.funnelStage,
      }),
    }),
  createMonitoringReport: (clientId: string, payload: { status: "draft" | "review" | "approved"; periodStart?: string; periodEnd?: string }) =>
    requestJson<MonitoringCreateResult>(`/api/v1/clients/${clientId}/monitoring`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviseMonitoringReport: (clientId: string, payload: { status: "draft" | "review" | "approved"; periodStart?: string; periodEnd?: string; note?: string }) =>
    requestJson<MonitoringCreateResult>(`/api/v1/clients/${clientId}/monitoring`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  loadApprovals: (clientId: string) => requestJson<ApprovalsResult>(`/api/v1/clients/${clientId}/approvals`),
  createApproval: (clientId: string, payload: { artifactType: string; artifactId: string; status: "pending" | "approved" | "rejected"; notes?: string }) =>
    requestJson<ApprovalResult>(`/api/v1/clients/${clientId}/approvals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateApprovalStatus: (approvalId: string, payload: { status: "pending" | "approved" | "rejected"; notes?: string }) =>
    requestJson<{ approval: Approval }>(`/api/v1/approvals/${approvalId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  consultClient: (clientId: string, payload?: { question?: string; history?: Array<{ role: "user" | "assistant"; content: string }> }) =>
    requestJson<AssistantResult>(`/api/v1/clients/${clientId}/assistant`, {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    }),
  trackProductEvent: (payload: { eventName: string; clientId?: string; source?: string; properties?: Record<string, unknown> }) =>
    requestJson<{ accepted: boolean }>("/api/v1/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  trackOfferEvent: (payload: { eventName: string; clientId?: string; source?: string; properties?: Record<string, unknown> }) =>
    requestJson<{ accepted: boolean }>("/api/v1/events", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        eventName: payload.eventName.startsWith("offer_") ? payload.eventName : payload.eventName.replace(/^product_/, "offer_"),
      }),
    }),
  loadOfferMetrics: (clientId?: string | null, days = 7) => {
    const params = new URLSearchParams();
    params.set("days", String(days));
    if (clientId) {
      params.set("clientId", clientId);
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return requestJson<ProductEventMetrics>(`/api/v1/events/metrics${suffix}`);
  },
  loadProductMetrics: (clientId?: string | null, days = 7) => {
    const params = new URLSearchParams();
    params.set("days", String(days));
    if (clientId) {
      params.set("clientId", clientId);
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return requestJson<ProductEventMetrics>(`/api/v1/events/metrics${suffix}`);
  },
  getSession,
  clearSession,
};
