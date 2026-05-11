import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { backendApi } from "@/lib/backendApi";
import { requestContentRefresh } from "@/lib/contentRefresh";
import { readSelectedClientId, subscribeSelectedClientId, writeSelectedClientId } from "@/lib/clientSelection";
import { subscribeOfferMetricEvents } from "@/lib/productMetrics";
import { ptBR } from "@/i18n/pt-BR";
import { ArtifactSummaryCard } from "@/components/ArtifactSummaryCard";
import { DisplayModeToggle } from "@/components/DisplayModeToggle";
import type {
  Agency,
  Approval,
  ClientRecord,
  Client,
  ContentPackage,
  ContentPlan,
  EditorialPauta,
  MarketResearch,
  MonitoringReport,
  PublishingExecution,
  Proposal,
  ReadyResponse,
  PostArtGalleryComparison,
  PostArtGallery,
  PostArtGalleryRecord,
  RenderedAsset,
  Schedule,
  CampaignActionPlan,
  Product,
  SocialIntelligenceSnapshot,
  SocialProfile,
  StrategyRecommendationResult,
  YoutubeStrategyAnalysis,
  YoutubeStrategyVideoState,
  User,
} from "@/types/backend";

type PanelState = {
  ready: ReadyResponse | null;
  user: User | null;
  agencies: Agency[];
  clients: Client[];
  selectedAgencyId: string;
  selectedClientId: string;
  profiles: SocialProfile[];
  snapshot: SocialIntelligenceSnapshot | null;
  clientRecord: ClientRecord | null;
  brandProfile: unknown | null;
  offerProfile: unknown | null;
  creativeProfile: unknown | null;
  primaryProduct: Product | null;
  offerProfiles: unknown[];
  proposals: Proposal[];
  contentPlan: ContentPlan | null;
  contentPlans: ContentPlan[];
  contentPackage: ContentPackage | null;
  contentPackages: ContentPackage[];
  renderedAsset: RenderedAsset | null;
  renderedAssets: RenderedAsset[];
  postArtGallery: PostArtGallery | null;
  postArtGalleryHistory: PostArtGalleryRecord[];
  postArtGalleryComparison: PostArtGalleryComparison | null;
  editorialPautas: EditorialPauta[];
  marketResearch: MarketResearch | null;
  marketResearches: MarketResearch[];
  schedules: Schedule[];
  latestReport: MonitoringReport | null;
  reports: MonitoringReport[];
  monitoringSchedule: Schedule | null;
  monitoringContentPlanPayload: Record<string, unknown> | null;
  monitoringSchedulePayload: Record<string, unknown> | null;
  publishingExecution: PublishingExecution | null;
  publishingExecutions: PublishingExecution[];
  publishingPayload: Record<string, unknown> | null;
  publishingValidation: Record<string, unknown> | null;
  publishingResult: Record<string, unknown> | null;
  approvals: Approval[];
  products: Product[];
  activeProduct: Product | null;
  youtubeStrategyAnalysis: YoutubeStrategyAnalysis | null;
  youtubeStrategyAnalyses: YoutubeStrategyAnalysis[];
  youtubeStrategyVideoStates: YoutubeStrategyVideoState[];
  strategyRecommendation: StrategyRecommendationResult | null;
  loading: boolean;
  error: string | null;
};

type ProposalBriefSummary = {
  summary: string | null;
  targetAudience: string | null;
  buyerPersonas: string[];
  uniqueValueProposition: string | null;
  brandArchetype: string | null;
  objectionsToAddress: string[];
  proofAssets: string[];
  ctaRecommendation: string | null;
  visualDirection: string | null;
  logoTreatment: string | null;
  productImageryDirection: string | null;
  proposalAngle: string | null;
};

type PreviewLightboxState = {
  index: number;
  title: string;
  subtitle: string;
  alt: string;
} | null;

type YoutubeStrategyPayload = {
  overview?: {
    executiveSummary?: string;
    thesis?: string;
    analysisStatus?: string;
    confidence?: number;
  };
  context?: {
    requestedVideoCount?: number;
    analyzedVideoCount?: number;
    funnelStage?: string | null;
    transcriptCoverage?: {
      available?: number;
      missing?: number;
      totalCharacters?: number;
      totalSegments?: number;
    };
  };
  synthesis?: {
    commonStrategies?: string[];
    commonMechanisms?: string[];
    commonTactics?: string[];
    risks?: string[];
    recommendedBusinessTypes?: Array<{
      businessType?: string;
      score?: number;
      reason?: string;
    }>;
    lessSuitableBusinessTypes?: Array<{
      businessType?: string;
      score?: number;
      reason?: string;
    }>;
    nextTests?: string[];
  };
  videos?: Array<{
    title?: string | null;
    originalUrl?: string;
    canonicalUrl?: string;
    processing?: {
      status?: "new" | "reused" | "changed" | string;
      reason?: string;
      transcriptFingerprint?: string;
      previousTranscriptFingerprint?: string | null;
      previousAnalysisId?: string | null;
      previousAnalysisVersion?: number | null;
    };
    transcript?: {
      status?: string;
      language?: string | null;
      segmentCount?: number;
      characterCount?: number;
      reason?: string | null;
    };
    summary?: string;
    thesis?: string;
    strategies?: Array<{
      label?: string;
      rationale?: string;
      evidence?: string[];
    }>;
    mechanisms?: string[];
    tactics?: string[];
    risks?: string[];
    applicability?: Array<{
      businessType?: string;
      score?: number;
      reason?: string;
    }>;
  }>;
  processing?: {
    hasRelevantChange?: boolean;
    reusedVideoCount?: number;
    changedVideoCount?: number;
    newVideoCount?: number;
    videos?: Array<{
      videoId?: string;
      canonicalUrl?: string;
      status?: "new" | "reused" | "changed" | string;
      reason?: string;
      transcriptFingerprint?: string;
      previousTranscriptFingerprint?: string | null;
      previousAnalysisId?: string | null;
      previousAnalysisVersion?: number | null;
    }>;
  };
  strategyLibrary?: {
    version?: number;
    source?: {
      analysisId?: string | null;
      analysisVersion?: number | null;
      title?: string | null;
    };
    assets?: Array<{
      kind?: "primary" | "alternative" | "plan_b" | string;
      strategy?: {
        name?: string;
        summary?: string;
        objective?: string | null;
        funnelStage?: string | null;
        fitScore?: number;
        confidence?: number;
      };
      source?: {
        analysisId?: string | null;
        analysisVersion?: number | null;
        urls?: string[];
        summary?: string | null;
        thesis?: string | null;
      };
      recommendation?: {
        productContext?: string | null;
        serviceContext?: string | null;
        audienceContext?: string | null;
        sourceUrls?: string[];
        evidence?: string[];
        commonStrategies?: string[];
        commonMechanisms?: string[];
        nextTests?: string[];
      };
    }>;
  };
  strategyEvidence?: Array<{
    id?: string;
    clientId?: string;
    sourceAnalysisId?: string | null;
    sourceVersion?: number;
    kind?: "primary" | "alternative" | "plan_b" | string;
    strategyKey?: string;
    strategyName?: string;
    strategySummary?: string;
    sourceUrls?: string[];
    evidence?: string[];
    fitSignals?: string[];
  }>;
  strategyIntelligence?: {
    version?: number;
    title?: string | null;
    source?: {
      analysisId?: string | null;
      analysisVersion?: number | null;
      executiveSummary?: string | null;
      thesis?: string | null;
      confidence?: number | null;
      primaryVideo?: {
        videoId?: string | null;
        title?: string | null;
        originalUrl?: string | null;
        canonicalUrl?: string | null;
        channelName?: string | null;
        channelUrl?: string | null;
        thumbnailUrl?: string | null;
      } | null;
      videos?: Array<{
        videoId?: string | null;
        title?: string | null;
        originalUrl?: string | null;
        canonicalUrl?: string | null;
        channelName?: string | null;
        channelUrl?: string | null;
        thumbnailUrl?: string | null;
      }>;
    } | null;
    assets?: Array<{
      kind?: "primary" | "alternative" | "plan_b" | string;
      strategy?: {
        name?: string;
        summary?: string;
        objective?: string | null;
        funnelStage?: string | null;
        fitScore?: number;
        confidence?: number;
      };
      source?: {
        analysisId?: string | null;
        analysisVersion?: number | null;
        title?: string | null;
        urls?: string[];
        summary?: string | null;
        thesis?: string | null;
      };
      recommendation?: {
        productContext?: string | null;
        serviceContext?: string | null;
        audienceContext?: string | null;
        sourceUrls?: string[];
        evidence?: string[];
        commonStrategies?: string[];
        commonMechanisms?: string[];
        nextTests?: string[];
      };
    }>;
      recommendation?: {
        primary?: {
          id?: string;
          strategyName?: string;
          strategySummary?: string;
          fitScore?: number;
          confidence?: number;
          reason?: string;
          fitSignals?: string[];
          funnelStage?: string | null;
          objective?: string | null;
        } | null;
        alternatives?: Array<{
          id?: string;
          strategyName?: string;
          strategySummary?: string;
          fitScore?: number;
          confidence?: number;
          reason?: string;
          fitSignals?: string[];
        }>;
        contingency?: {
          id?: string;
          strategyName?: string;
          strategySummary?: string;
          fitScore?: number;
          confidence?: number;
          reason?: string;
          fitSignals?: string[];
        } | null;
        planB?: {
          id?: string;
          strategyName?: string;
          strategySummary?: string;
          fitScore?: number;
          confidence?: number;
          reason?: string;
          fitSignals?: string[];
        } | null;
        strategyOptions?: Array<{
          id?: string;
          strategyName?: string;
          strategySummary?: string;
          fitScore?: number;
          confidence?: number;
          reason?: string;
          fitSignals?: string[];
          fitBand?: "recommended" | "secondary" | "not_recommended";
          objective?: string | null;
          funnelStage?: string | null;
          context?: {
            product?: string;
            audience?: string;
          };
        }>;
      };
    };
  };

type ClientRecordPayload = {
  diagnosis?: {
    archetype?: string;
    confidence?: number;
    publicOnly?: boolean;
    marketResearch?: {
      id?: string;
      version?: number;
      status?: string;
      summary?: string;
      competitors?: string[];
    } | null;
    scores?: {
      presence?: number | null;
      consistency?: number | null;
      proof?: number | null;
      conversionReadiness?: number | null;
    };
    mainGaps?: string[];
    opportunityNotes?: string[];
    rawNotes?: string | null;
  };
  narrative?: {
    summary?: string;
    recommendedPositioning?: string;
  };
  offerRecommendation?: {
    mode?: string;
    focus?: string;
  };
};

type MarketResearchPayload = {
  context?: {
    createdFrom?: string;
    clientRecordVersion?: number | null;
    snapshotId?: string | null;
    publicOnly?: boolean;
    confidence?: number;
    note?: string | null;
  };
  market?: {
    segment?: string | null;
    stage?: string;
    summary?: string;
    positioning?: string;
  };
  signals?: {
    profilesCount?: number;
    presenceScore?: number | null;
    consistencyScore?: number | null;
    proofScore?: number | null;
    conversionReadiness?: number | null;
    mainGaps?: string[];
    opportunityNotes?: string[];
  };
  competition?: {
    clientUrl?: string | null;
    competitors?: string[];
    competitorUrls?: string[];
    sourceUrls?: string[];
    competitorCount?: number;
    summary?: string;
  };
  recommendations?: {
    editorialPillars?: string[];
    differentiators?: string[];
    contentAngles?: string[];
    nextPautas?: string[];
  };
  note?: string | null;
};

type ContentPlanPayload = {
  title?: string;
  archetype?: string;
  contentRhythm?: string;
  marketStage?: string | null;
  marketSummary?: string | null;
  marketResearchVersion?: number | null;
};

type ContentPackagePayload = {
  contentPlanId?: string;
  contentPlanVersion?: number;
  note?: string | null;
  items?: string[];
  createdFrom?: string;
  revisedFromContentPlanVersion?: number | null;
  visualDirection?: {
    title?: string;
    owner?: string;
    mechanism?: string;
    firstPass?: string;
    masterAsset?: string;
    supportChannels?: string[];
    productImagePolicy?: string;
    rules?: string[];
    contentRhythm?: string;
    references?: string[];
  };
};

type RenderedAssetPayload = {
  title?: string;
  status?: string;
  clientName?: string;
  clientId?: string;
  contentPackageVersion?: number | null;
  scheduleVersion?: number | null;
  renderEngine?: string;
  assetFormat?: string;
  previewDataUrl?: string | null;
  previewMimeType?: string | null;
  summary?: string;
  workflow?: {
    squad?: string;
    owner?: string;
    trail?: Array<{
      id?: string;
      label?: string;
      role?: string;
      output?: string;
    }>;
  };
};

type MonitoringPayload = {
  title?: string;
  clientRecordVersion?: number | null;
  proposalVersion?: number | null;
  contentPlanVersion?: number | null;
  scheduleVersion?: number | null;
  contentRhythm?: string | null;
  editorialPautas?: Array<{
    id?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    reason?: string;
    format?: string;
    source?: {
      clientRecordVersion?: number;
      proposalVersion?: number;
      marketResearchVersion?: number | null;
    };
  }>;
  scheduleItems?: Array<{
    position?: number;
    date?: string;
    channel?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    format?: string;
    status?: string;
  }>;
  scoreContext?: {
    presence?: number | null;
    consistency?: number | null;
    proof?: number | null;
    conversionReadiness?: number | null;
    confidence?: number | null;
  } | null;
  mainGaps?: unknown;
  opportunityNotes?: unknown;
  metrics?: {
    growth?: Record<string, unknown>;
    signals?: Record<string, unknown>;
  };
  signals?: {
    interpretations?: string[];
  };
  updatedAt?: string;
};

type SchedulePayload = {
  contentPlanVersion?: number;
  cadence?: string;
  editorialPautas?: Array<{
    id?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    reason?: string;
    format?: string;
    source?: {
      clientRecordVersion?: number;
      proposalVersion?: number;
      marketResearchVersion?: number | null;
    };
  }>;
  items?: Array<{
    position?: number;
    date?: string;
    channel?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    format?: string;
    status?: string;
  }>;
};

type PublishingPayload = {
  clientName?: string;
  requestedMode?: "dry_run" | "live" | string;
  confirmed?: boolean;
  notes?: string | null;
  targetPlatforms?: string[];
  contentPlanVersion?: number | null;
  contentPackageVersion?: number | null;
  scheduleVersion?: number | null;
  contentRhythm?: string | null;
  scheduleItems?: Array<{
    position?: number;
    date?: string | null;
    channel?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    format?: string;
    status?: string;
  }>;
  editorialPautas?: Array<{
    id?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    reason?: string;
    format?: string;
  }>;
  visualDirection?: {
    title?: string;
    owner?: string;
    mechanism?: string;
    firstPass?: string;
    masterAsset?: string;
    supportChannels?: string[];
    productImagePolicy?: string;
    rules?: string[];
    contentRhythm?: string;
    references?: string[];
  } | null;
};

const initialSession = backendApi.getSession();
const initialSelectedClientId = readSelectedClientId();

const emptyState: PanelState = {
  ready: null,
  user: null,
  agencies: [],
  clients: [],
  selectedAgencyId: initialSession.agencyId,
  selectedClientId: initialSelectedClientId,
  profiles: [],
  snapshot: null,
  clientRecord: null,
  brandProfile: null,
  offerProfile: null,
  creativeProfile: null,
  primaryProduct: null,
  offerProfiles: [],
  proposals: [],
  contentPlan: null,
  contentPlans: [],
  contentPackage: null,
  contentPackages: [],
  renderedAsset: null,
  renderedAssets: [],
  postArtGallery: null,
  postArtGalleryHistory: [],
  postArtGalleryComparison: null,
  editorialPautas: [],
  marketResearch: null,
  marketResearches: [],
  schedules: [],
  latestReport: null,
  reports: [],
  monitoringSchedule: null,
  monitoringContentPlanPayload: null,
  monitoringSchedulePayload: null,
  publishingExecution: null,
  publishingExecutions: [],
  publishingPayload: null,
  publishingValidation: null,
  publishingResult: null,
  approvals: [],
  products: [],
  activeProduct: null,
  youtubeStrategyAnalysis: null,
  youtubeStrategyAnalyses: [],
  youtubeStrategyVideoStates: [],
  strategyRecommendation: null,
  loading: false,
  error: null,
};

const operationalStages = [
  {
    title: ptBR.backendOps.squad.stages.research.title,
    description: ptBR.backendOps.squad.stages.research.description,
  },
  {
    title: ptBR.backendOps.squad.stages.intelligence.title,
    description: ptBR.backendOps.squad.stages.intelligence.description,
  },
  {
    title: ptBR.backendOps.squad.stages.clientRecord.title,
    description: ptBR.backendOps.squad.stages.clientRecord.description,
  },
  {
    title: ptBR.backendOps.squad.stages.planning.title,
    description: ptBR.backendOps.squad.stages.planning.description,
  },
  {
    title: ptBR.backendOps.squad.stages.content.title,
    description: ptBR.backendOps.squad.stages.content.description,
  },
  {
    title: ptBR.backendOps.squad.stages.governance.title,
    description: ptBR.backendOps.squad.stages.governance.description,
  },
] as const;

export function BackendOpsPanel() {
  const [state, setState] = useState<PanelState>(emptyState);
  const [previewLightbox, setPreviewLightbox] = useState<PreviewLightboxState>(null);
  const [bootstrapAgencyName, setBootstrapAgencyName] = useState<string>(ptBR.backendOps.examples.bootstrapAgencyName);
  const [bootstrapAgencySlug, setBootstrapAgencySlug] = useState<string>(ptBR.backendOps.examples.bootstrapAgencySlug);
  const [bootstrapUserName, setBootstrapUserName] = useState<string>(ptBR.backendOps.examples.bootstrapUserName);
  const [bootstrapUserEmail, setBootstrapUserEmail] = useState<string>(ptBR.backendOps.examples.bootstrapUserEmail);
  const [bootstrapPassword, setBootstrapPassword] = useState<string>(ptBR.backendOps.examples.bootstrapPassword);
  const [loginEmail, setLoginEmail] = useState<string>(ptBR.backendOps.examples.loginEmail);
  const [loginPassword, setLoginPassword] = useState<string>(ptBR.backendOps.examples.loginPassword);
  const [clientName, setClientName] = useState<string>(ptBR.backendOps.examples.clientName);
  const [clientSlug, setClientSlug] = useState<string>(ptBR.backendOps.examples.clientSlug);
  const [clientSegment, setClientSegment] = useState<string>(ptBR.backendOps.examples.clientSegment);
  const [clientWebsiteUrl, setClientWebsiteUrl] = useState<string>(ptBR.backendOps.examples.clientWebsiteUrl);
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState<string>(ptBR.backendOps.examples.sourceUrl);
  const [competitorUrl, setCompetitorUrl] = useState<string>(ptBR.backendOps.examples.competitorUrl);
  const [contentObjective, setContentObjective] = useState<string>(ptBR.backendOps.examples.contentObjective);
  const [scheduleStartDate, setScheduleStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduleEndDate, setScheduleEndDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString().slice(0, 10));
  const [monitoringStartDate, setMonitoringStartDate] = useState(new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString().slice(0, 10));
  const [monitoringEndDate, setMonitoringEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [approvalArtifactType, setApprovalArtifactType] = useState<string>(ptBR.backendOps.examples.approvalArtifactType);
  const [approvalArtifactId, setApprovalArtifactId] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">(ptBR.backendOps.examples.approvalStatus as "pending" | "approved" | "rejected");
  const [approvalUpdateStatus, setApprovalUpdateStatus] = useState<"pending" | "approved" | "rejected">(
    ptBR.backendOps.examples.approvalUpdateStatus,
  );
  const [youtubeVideoUrls, setYoutubeVideoUrls] = useState<string>(ptBR.backendOps.examples.youtubeVideoUrls);
  const [youtubeStrategyNotes, setYoutubeStrategyNotes] = useState<string>("");
  const [youtubeCampaignObjective, setYoutubeCampaignObjective] = useState<string>("");
  const [youtubeFunnelStage, setYoutubeFunnelStage] = useState<string>("consideration");
  const [strategyCampaignObjective, setStrategyCampaignObjective] = useState<string>(ptBR.backendOps.examples.strategyCampaignObjective);
  const [strategyProductContext, setStrategyProductContext] = useState<string>(ptBR.backendOps.examples.strategyProductContext);
  const [strategyServiceContext, setStrategyServiceContext] = useState<string>(ptBR.backendOps.examples.strategyServiceContext);
  const [strategyAudienceContext, setStrategyAudienceContext] = useState<string>(ptBR.backendOps.examples.strategyAudienceContext);
  const [strategyFunnelStage, setStrategyFunnelStage] = useState<string>("consideration");
  const [youtubeDisplayMode, setYoutubeDisplayMode] = useState<"analysis" | "raw">("analysis");
  const [dataDisplayMode, setDataDisplayMode] = useState<"summary" | "raw">("summary");
  const [clientRecordSummaryOverride, setClientRecordSummaryOverride] = useState("");
  const [proposalThesisOverride, setProposalThesisOverride] = useState("");
  const [marketResearchSummaryOverride, setMarketResearchSummaryOverride] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [strategyActionPlanCopyStatus, setStrategyActionPlanCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const strategyRecommendationEnabledRef = useRef(false);
  const previousActiveProductIdRef = useRef<string | null>(null);
  const youtubeAnalysis = useMemo(
    () => (state.youtubeStrategyAnalysis?.payload_json as YoutubeStrategyPayload | null | undefined) ?? null,
    [state.youtubeStrategyAnalysis],
  );
  const youtubeOverview = youtubeAnalysis?.overview ?? {};
  const youtubeContext = youtubeAnalysis?.context ?? {};
  const youtubeSynthesis = youtubeAnalysis?.synthesis ?? {};
  const youtubeVideos = youtubeAnalysis?.videos ?? [];
  const youtubeProcessing = youtubeAnalysis?.processing ?? null;
  const youtubeVideoStates = state.youtubeStrategyVideoStates;
  const youtubeStrategyLibrary = youtubeAnalysis?.strategyLibrary ?? null;
  const youtubeStrategyEvidence = youtubeAnalysis?.strategyEvidence ?? [];
  const youtubeStrategyIntelligence = youtubeAnalysis?.strategyIntelligence ?? null;
  const strategyRecommendation = state.strategyRecommendation;
  const strategyRecommendationPrimary = strategyRecommendation?.recommendation.primary ?? null;
  const strategyRecommendationAlternatives = strategyRecommendation?.recommendation.alternatives ?? [];
  const strategyRecommendationContingency = strategyRecommendation?.recommendation.contingency ?? strategyRecommendation?.recommendation.planB ?? null;
  const strategyRecommendationOptions = strategyRecommendation?.recommendation.strategyOptions ?? [];
  const strategyRecommendationActionPlan = strategyRecommendation?.recommendation.actionPlan ?? null;
  const clientRecordPayload = useMemo(() => parseClientRecordPayload(state.clientRecord?.payload_json), [state.clientRecord]);
  const marketResearchPayload = useMemo(() => parseMarketResearchPayload(state.marketResearch?.payload_json), [state.marketResearch]);
  const proposalBrief = useMemo(() => extractProposalBrief(state.proposals[0]?.payload_json), [state.proposals]);
  const contentPlanPayload = useMemo(() => parseContentPlanPayload(state.contentPlan?.payload_json), [state.contentPlan]);
  const contentPackagePayload = useMemo(() => parseContentPackagePayload(state.contentPackage?.payload_json), [state.contentPackage]);
  const renderedAssetPayload = useMemo(() => parseRenderedAssetPayload(state.renderedAsset?.payload_json), [state.renderedAsset]);
  const monitoringReportPayload = useMemo(() => parseMonitoringPayload(state.latestReport?.payload_json), [state.latestReport]);
  const publishingPayload = useMemo(() => parsePublishingPayload(state.publishingExecution?.payload_json), [state.publishingExecution]);
  const publishingValidation = useMemo(() => parsePublishingObject(state.publishingExecution?.validation_json), [state.publishingExecution]);
  const publishingResult = useMemo(() => parsePublishingObject(state.publishingExecution?.result_json), [state.publishingExecution]);
  const publishingValidationDetails = publishingValidation as { blockers?: string[]; warnings?: string[] } | null;
  const publishingResultDetails = publishingResult as {
    deliveryMode?: string;
    status?: string;
    publishedAt?: string | null;
    executionSummary?: {
      blockers?: string[];
      warnings?: string[];
    };
    notes?: string | null;
  } | null;
  const postArtGallery = state.postArtGallery;
  const postArtGalleryHistory = state.postArtGalleryHistory;
  const postArtGalleryComparison = state.postArtGalleryComparison;
  const postArtGalleryVariants = postArtGallery?.variants ?? [];
  const postArtGalleryAverageScore =
    postArtGalleryVariants.length > 0
      ? Math.round(postArtGalleryVariants.reduce((sum, variant) => sum + variant.quality.totalScore, 0) / postArtGalleryVariants.length)
      : 0;
  const postArtGalleryBestVariant = postArtGalleryVariants.reduce<typeof postArtGalleryVariants[number] | null>((best, variant) => {
    if (!best) {
      return variant;
    }

    return variant.quality.totalScore > best.quality.totalScore ? variant : best;
  }, null);
  const previewGalleryVariants = postArtGalleryVariants;
  const currentPreviewVariant = previewLightbox ? previewGalleryVariants[previewLightbox.index] ?? null : null;
  const derivedPostArtGalleryComparison = useMemo(() => {
    if (postArtGalleryComparison) {
      return postArtGalleryComparison;
    }

    if (postArtGalleryHistory.length < 2) {
      return null;
    }

    const [latest, previous] = postArtGalleryHistory;
    const latestPayload = latest.payload_json as { variants?: unknown[] } | null;
    const previousPayload = previous.payload_json as { variants?: unknown[] } | null;

    return {
      comparedAt: latest.updated_at,
      latestVersion: latest.version,
      previousVersion: previous.version,
      latestMode: latest.mode,
      previousMode: previous.mode,
      latestScore: latest.overall_score,
      previousScore: previous.overall_score,
      scoreDelta: latest.overall_score - previous.overall_score,
      latestVariantCount: Array.isArray(latestPayload?.variants) ? latestPayload.variants.length : 0,
      previousVariantCount: Array.isArray(previousPayload?.variants) ? previousPayload.variants.length : 0,
      variantDelta:
        (Array.isArray(latestPayload?.variants) ? latestPayload.variants.length : 0) -
        (Array.isArray(previousPayload?.variants) ? previousPayload.variants.length : 0),
      summary:
        latest.overall_score === previous.overall_score
          ? `Versões ${latest.version} e ${previous.version} estão estáveis em score.`
          : latest.overall_score > previous.overall_score
            ? `Versão ${latest.version} melhorou em relação à ${previous.version}.`
            : `Versão ${latest.version} caiu em relação à ${previous.version}.`,
      highlights: [
        latest.overall_score === previous.overall_score
          ? "Score estável."
          : latest.overall_score > previous.overall_score
            ? `Score subiu ${latest.overall_score - previous.overall_score} ponto(s).`
            : `Score caiu ${previous.overall_score - latest.overall_score} ponto(s).`,
        latest.mode === previous.mode ? `Modo mantido em ${latest.mode}.` : `Modo mudou de ${previous.mode} para ${latest.mode}.`,
        Array.isArray(latestPayload?.variants) && Array.isArray(previousPayload?.variants)
          ? `Variantes: ${previousPayload.variants.length} -> ${latestPayload.variants.length}.`
          : "Comparação de variantes indisponível.",
      ],
      improvements: latest.overall_score >= previous.overall_score ? ["Qualidade média sustentada ou melhorada."] : [],
      regressions: latest.overall_score < previous.overall_score ? ["Queda de qualidade média na nova versão."] : [],
    };
  }, [postArtGalleryComparison, postArtGalleryHistory]);
  const publishingPlatformCount = Array.isArray(state.publishingExecution?.platforms)
    ? (state.publishingExecution?.platforms as unknown[]).length
    : 0;
  const monitoringSchedulePayloadPreview = useMemo(
    () => parseSchedulePayload(state.monitoringSchedule?.payload_json),
    [state.monitoringSchedule],
  );

  const selectedAgencyId = state.selectedAgencyId || state.agencies[0]?.id || "";
  const selectedAgency = useMemo(
    () => state.agencies.find((agency) => agency.id === selectedAgencyId) ?? null,
    [state.agencies, selectedAgencyId],
  );
  const selectedClient = useMemo(
    () => state.clients.find((client) => client.id === state.selectedClientId) ?? state.clients[0] ?? null,
    [state.clients, state.selectedClientId],
  );

  useEffect(() => {
    if (strategyActionPlanCopyStatus === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStrategyActionPlanCopyStatus("idle");
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [strategyActionPlanCopyStatus]);

  useEffect(() => {
    if (!previewLightbox) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewLightbox(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setPreviewLightbox((current) => {
          if (!current || previewGalleryVariants.length === 0) return current;
          const nextIndex = (current.index - 1 + previewGalleryVariants.length) % previewGalleryVariants.length;
          return { ...current, index: nextIndex };
        });
        return;
      }

      if (event.key === "ArrowRight") {
        setPreviewLightbox((current) => {
          if (!current || previewGalleryVariants.length === 0) return current;
          const nextIndex = (current.index + 1) % previewGalleryVariants.length;
          return { ...current, index: nextIndex };
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewLightbox, previewGalleryVariants.length]);

  const setError = (error: unknown) => {
    setState((prev) => ({
      ...prev,
      error: error instanceof Error ? error.message : ptBR.backendOps.statuses.unexpectedError,
    }));
  };

  const copyStrategyActionPlan = useCallback(async () => {
    if (!strategyRecommendation || !strategyRecommendationActionPlan) {
      return;
    }

    const text = formatStrategyActionPlanForClipboard({
      clientName: selectedClient?.name ?? ptBR.backendOps.placeholders.noClient,
      objective: strategyCampaignObjective,
      productContext: strategyProductContext,
      serviceContext: strategyServiceContext,
      audienceContext: strategyAudienceContext,
      actionPlan: strategyRecommendationActionPlan,
    });

    try {
      await navigator.clipboard.writeText(text);
      setStrategyActionPlanCopyStatus("copied");
    } catch {
      setStrategyActionPlanCopyStatus("error");
    }
  }, [selectedClient, strategyRecommendation, strategyRecommendationActionPlan, strategyCampaignObjective, strategyProductContext, strategyServiceContext, strategyAudienceContext]);

  const reloadWorkspace = async (agencyIdOverride?: string, clientIdOverride?: string) => {
    const agencyId = agencyIdOverride ?? selectedAgencyId;

    if (!agencyId) {
      setState((prev) => ({
        ...prev,
        clients: [],
        selectedClientId: "",
        profiles: [],
        snapshot: null,
        clientRecord: null,
        brandProfile: null,
        offerProfile: null,
        creativeProfile: null,
        primaryProduct: null,
        offerProfiles: [],
        proposals: [],
        contentPlan: null,
        contentPlans: [],
        contentPackage: null,
        contentPackages: [],
        renderedAsset: null,
        renderedAssets: [],
        postArtGallery: null,
        postArtGalleryHistory: [],
        postArtGalleryComparison: null,
        editorialPautas: [],
        marketResearch: null,
        marketResearches: [],
        schedules: [],
        latestReport: null,
        reports: [],
        monitoringSchedule: null,
        monitoringContentPlanPayload: null,
        monitoringSchedulePayload: null,
        products: [],
        activeProduct: null,
        publishingExecution: null,
        publishingExecutions: [],
        publishingPayload: null,
        publishingValidation: null,
        publishingResult: null,
        youtubeStrategyAnalysis: null,
        youtubeStrategyAnalyses: [],
        youtubeStrategyVideoStates: [],
        strategyRecommendation: null,
        error: null,
      }));
      return;
    }

    const clientsResponse = await backendApi.listClients(agencyId);
    const clients = clientsResponse.clients;
    const selectedClientId = clientIdOverride ?? state.selectedClientId ?? clients[0]?.id ?? "";

    let profiles: SocialProfile[] = [];
    let snapshot: SocialIntelligenceSnapshot | null = null;
    let clientRecord: ClientRecord | null = null;
    let brandProfile: unknown | null = null;
    let offerProfile: unknown | null = null;
    let creativeProfile: unknown | null = null;
    let primaryProduct: Product | null = null;
    let offerProfiles: unknown[] = [];
    let proposals: Proposal[] = [];
    let contentPlan: ContentPlan | null = null;
    let contentPlans: ContentPlan[] = [];
    let contentPackage: ContentPackage | null = null;
    let contentPackages: ContentPackage[] = [];
    let renderedAsset: RenderedAsset | null = null;
    let renderedAssets: RenderedAsset[] = [];
    let postArtGallery: PostArtGallery | null = null;
    let postArtGalleryHistory: PostArtGalleryRecord[] = [];
    let postArtGalleryComparison: PostArtGalleryComparison | null = null;
    let editorialPautas: EditorialPauta[] = [];
    let marketResearch: MarketResearch | null = null;
    let marketResearches: MarketResearch[] = [];
    let schedules: Schedule[] = [];
    let latestReport: MonitoringReport | null = null;
    let reports: MonitoringReport[] = [];
    let monitoringSchedule: Schedule | null = null;
    let monitoringContentPlanPayload: Record<string, unknown> | null = null;
    let monitoringSchedulePayload: Record<string, unknown> | null = null;
    let publishingExecution: PublishingExecution | null = null;
    let publishingExecutions: PublishingExecution[] = [];
    let publishingPayload: Record<string, unknown> | null = null;
    let publishingValidation: Record<string, unknown> | null = null;
    let publishingResult: Record<string, unknown> | null = null;
    let approvals: Approval[] = [];
    let products: Product[] = [];
    let activeProduct: Product | null = null;
    let youtubeStrategyAnalysis: YoutubeStrategyAnalysis | null = null;
    let youtubeStrategyAnalyses: YoutubeStrategyAnalysis[] = [];
    let youtubeStrategyVideoStates: YoutubeStrategyVideoState[] = [];

    if (selectedClientId) {
      try {
        const clientRecordResponse = await backendApi.loadClientRecord(selectedClientId);
        clientRecord = clientRecordResponse.latestClientRecord;
        brandProfile = clientRecordResponse.brandProfile;
        offerProfile = clientRecordResponse.offerProfile;
        creativeProfile = clientRecordResponse.creativeProfile;
        primaryProduct = clientRecordResponse.primaryProduct;
        offerProfiles = clientRecordResponse.offerProfiles;
        profiles = clientRecordResponse.profiles;
        snapshot = clientRecordResponse.snapshot;
        marketResearch = clientRecordResponse.marketResearch;
        editorialPautas = [];
        marketResearches = clientRecordResponse.marketResearch ? [clientRecordResponse.marketResearch] : [];
      } catch {
        clientRecord = null;
        profiles = [];
        snapshot = null;
        marketResearch = null;
        editorialPautas = [];
        marketResearches = [];
      }

      const hasSocialIntelligence = Boolean(snapshot || profiles.length > 0);

      if (hasSocialIntelligence) {
        try {
          const intelligence = await backendApi.loadSocialIntelligence(selectedClientId);
          profiles = intelligence.profiles;
          snapshot = intelligence.snapshot;
        } catch {
          // Keep the client-record fallback when the social intelligence snapshot is unavailable.
        }
      }

      try {
        const proposalResponse = await backendApi.loadProposals(selectedClientId);
        proposals = proposalResponse.proposals;
      } catch {
        proposals = [];
      }

      try {
        const researchResponse = await backendApi.loadMarketResearch(selectedClientId);
        marketResearch = researchResponse.latestMarketResearch;
        marketResearches = researchResponse.marketResearches;
      } catch {
        marketResearch = null;
        marketResearches = [];
      }

      try {
        const contentResponse = await backendApi.loadContent(selectedClientId);
        contentPlan = contentResponse.contentPlan;
        contentPackage = contentResponse.contentPackage;
        contentPlans = contentResponse.contentPlans;
        contentPackages = contentResponse.contentPackages;
        renderedAsset = contentResponse.renderedAsset;
        renderedAssets = contentResponse.renderedAssets;
        postArtGallery = contentResponse.postArtGallery;
        postArtGalleryHistory = contentResponse.postArtGalleries;
        postArtGalleryComparison = contentResponse.postArtGalleryComparison;
        editorialPautas = contentResponse.editorialPautas;
        schedules = contentResponse.schedules;
        if (!brandProfile) {
          brandProfile = contentResponse.brandProfile;
        }
        if (!offerProfile) {
          offerProfile = contentResponse.offerProfile;
        }
        if (!creativeProfile) {
          creativeProfile = (contentResponse as { creativeProfile?: unknown | null }).creativeProfile ?? creativeProfile;
        }
        if (!primaryProduct) {
          primaryProduct = contentResponse.primaryProduct;
        }
        if (offerProfiles.length === 0) {
          offerProfiles = contentResponse.offerProfiles;
        }
      } catch {
        contentPlan = null;
        contentPackage = null;
        contentPlans = [];
        contentPackages = [];
        renderedAsset = null;
        renderedAssets = [];
        postArtGallery = null;
        postArtGalleryHistory = [];
        postArtGalleryComparison = null;
        editorialPautas = [];
        schedules = [];
      }

      try {
        const monitoringResponse = await backendApi.loadMonitoring(selectedClientId);
        latestReport = monitoringResponse.latestReport;
        reports = monitoringResponse.reports;
        monitoringSchedule = monitoringResponse.latestSchedule;
        monitoringContentPlanPayload = monitoringResponse.contentPlanPayload;
        monitoringSchedulePayload = monitoringResponse.schedulePayload;
      } catch {
        latestReport = null;
        reports = [];
        monitoringSchedule = null;
        monitoringContentPlanPayload = null;
        monitoringSchedulePayload = null;
      }

      try {
        const publishingResponse = await backendApi.loadPublishing(selectedClientId);
        publishingExecution = publishingResponse.latestExecution;
        publishingExecutions = publishingResponse.executions;
        publishingPayload = publishingResponse.contentPackagePayload ?? null;
      } catch {
        publishingExecution = null;
        publishingExecutions = [];
        publishingPayload = null;
      }

      try {
        const approvalsResponse = await backendApi.loadApprovals(selectedClientId);
        approvals = approvalsResponse.approvals;
      } catch {
        approvals = [];
      }

      try {
        const productsResponse = await backendApi.loadProducts(selectedClientId);
        products = productsResponse.products;
        activeProduct = products.find((product) => product.is_active) ?? products[0] ?? null;
      } catch {
        products = [];
        activeProduct = null;
      }

      try {
        const youtubeStrategyResponse = await backendApi.loadYoutubeStrategyAnalyses(selectedClientId);
        youtubeStrategyAnalysis = youtubeStrategyResponse.latestAnalysis;
        youtubeStrategyAnalyses = youtubeStrategyResponse.analyses;
        youtubeStrategyVideoStates = youtubeStrategyResponse.videoStates ?? [];
      } catch {
        youtubeStrategyAnalysis = null;
        youtubeStrategyAnalyses = [];
        youtubeStrategyVideoStates = [];
      }
    }

    setState((prev) => ({
      ...prev,
      clients,
      selectedClientId,
      profiles,
      snapshot,
      clientRecord,
      proposals,
      creativeProfile,
      contentPlan,
      contentPlans,
      contentPackage,
      contentPackages,
      renderedAsset,
      renderedAssets,
      postArtGallery,
      postArtGalleryHistory,
      postArtGalleryComparison,
      editorialPautas,
      marketResearch,
      marketResearches,
      schedules,
      latestReport,
      reports,
      monitoringSchedule,
      monitoringContentPlanPayload,
      monitoringSchedulePayload,
      publishingExecution,
      publishingExecutions,
      publishingPayload,
      publishingValidation,
      publishingResult,
      approvals,
      products,
      activeProduct,
      youtubeStrategyAnalysis,
      youtubeStrategyAnalyses,
      youtubeStrategyVideoStates,
      strategyRecommendation: null,
      selectedAgencyId: agencyId,
      error: null,
    }));
  };

  const refreshStatus = async () => {
    try {
      const currentSession = await backendApi.ensureAuthenticatedSession();
      const [ready, session, accessibleClients] = await Promise.all([
        backendApi.ready(),
        currentSession.accessToken ? backendApi.me().catch(() => null) : Promise.resolve(null),
        backendApi.loadAccessibleClients().catch(() => null),
      ]);

      setState((prev) => ({
        ...prev,
        ready,
        user: session?.user ?? prev.user,
        agencies: session?.agencies ?? prev.agencies,
        selectedAgencyId: accessibleClients?.agencyId ?? session?.agencies?.[0]?.id ?? prev.selectedAgencyId,
        error: null,
      }));

      const agencyId = accessibleClients?.agencyId ?? session?.agencies?.[0]?.id ?? currentSession.agencyId ?? prevSelectedAgencyIdFromSession();
      if (agencyId) {
        await reloadWorkspace(agencyId);
      }
    } catch (error) {
      setError(error);
    }
  };

  const prevSelectedAgencyIdFromSession = () => backendApi.getSession().agencyId;

  useEffect(() => {
    void refreshStatus();
  }, []);

  useEffect(() => {
    return subscribeSelectedClientId((clientId) => {
      setState((prev) => ({ ...prev, selectedClientId: clientId }));
      if (clientId && selectedAgencyId) {
        void reloadWorkspace(selectedAgencyId, clientId);
      }
    });
  }, [selectedAgencyId]);

  useEffect(() => {
    const selected = state.clients.find((client) => client.id === state.selectedClientId) ?? state.clients[0] ?? null;
    if (selected && selected.id !== state.selectedClientId) {
      setState((prev) => ({ ...prev, selectedClientId: selected.id }));
    }
  }, [state.clients, state.selectedClientId]);

  useEffect(() => {
    const unsubscribe = subscribeOfferMetricEvents((event) => {
      if (event.eventName !== "product_focus_changed" && event.eventName !== "offer_focus_changed") return;
      if (event.clientId && event.clientId !== selectedClient?.id) return;
      if (!selectedAgencyId || !selectedClient?.id) return;

      void reloadWorkspace(selectedAgencyId, selectedClient.id);
    });

    return unsubscribe;
  }, [selectedAgencyId, selectedClient?.id]);

  const submitBootstrap = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await backendApi.bootstrap({
        agency: { name: bootstrapAgencyName, slug: bootstrapAgencySlug },
        user: { name: bootstrapUserName, email: bootstrapUserEmail, password: bootstrapPassword },
      });
      await refreshStatus();
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitLogin = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await backendApi.login({ email: loginEmail, password: loginPassword });
      await refreshStatus();
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitCreateClient = async () => {
    if (!selectedAgencyId) {
      setState((prev) => ({ ...prev, error: ptBR.backendOps.statuses.selectAgencyFirst }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await backendApi.createClient({
        name: clientName,
        slug: clientSlug,
        segment: clientSegment || undefined,
        websiteUrl: clientWebsiteUrl || undefined,
        notes: notes || undefined,
      });
      await reloadWorkspace(selectedAgencyId);
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitDiscovery = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.discoverProfiles(selectedClient.id, {
        sourceUrls: sourceUrl ? [sourceUrl] : [],
        discoveredProfiles: [],
      });
      setState((prev) => ({
        ...prev,
        profiles: result.profiles,
        error: null,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitIntelligence = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.buildSocialIntelligence(selectedClient.id, {
        publicOnly: true,
        sourceUrls: sourceUrl ? [sourceUrl] : [],
      });
      setState((prev) => ({
        ...prev,
        profiles: result.profiles,
        snapshot: result.snapshot,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitClientRecord = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createClientRecord(selectedClient.id, { status: "draft", note: notes || undefined });
      setState((prev) => ({
        ...prev,
        clientRecord: result.clientRecord,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitMarketResearch = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createMarketResearch(selectedClient.id, {
        status: "draft",
        publicOnly: true,
        sourceUrls: sourceUrl ? [sourceUrl] : [],
        competitorUrls: competitorUrl ? [competitorUrl] : [],
        note: notes || undefined,
      });
      setState((prev) => ({
        ...prev,
        marketResearch: result.marketResearch,
        marketResearches: result.marketResearches,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitReviseMarketResearch = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.reviseMarketResearch(selectedClient.id, {
        status: "draft",
        publicOnly: true,
        sourceUrls: sourceUrl ? [sourceUrl] : [],
        competitorUrls: competitorUrl ? [competitorUrl] : [],
        note: revisionNote || undefined,
        summaryOverride: marketResearchSummaryOverride || undefined,
      });
      setState((prev) => ({
        ...prev,
        marketResearch: result.marketResearch,
        marketResearches: result.marketResearches,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitReviseClientRecord = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.reviseClientRecord(selectedClient.id, {
        status: "draft",
        note: revisionNote || undefined,
        summaryOverride: clientRecordSummaryOverride || undefined,
      });
      setState((prev) => ({
        ...prev,
        clientRecord: result.clientRecord,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitProposal = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createProposal(selectedClient.id, { status: "draft" });
      setState((prev) => ({
        ...prev,
        proposals: result.proposals,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitReviseProposal = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.reviseProposal(selectedClient.id, {
        status: "draft",
        note: revisionNote || undefined,
        thesisOverride: proposalThesisOverride || undefined,
      });
      setState((prev) => ({
        ...prev,
        proposals: result.proposals,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitContentPlan = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createContentPlan(selectedClient.id, {
        status: "draft",
        objective: contentObjective || undefined,
      });
      setState((prev) => ({
        ...prev,
        contentPlan: result.contentPlan,
        contentPlans: result.contentPlans,
        contentPackage: result.contentPackage,
        contentPackages: result.contentPackages,
        postArtGallery: null,
        postArtGalleryHistory: [],
        postArtGalleryComparison: null,
        editorialPautas: result.editorialPautas,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitReviseContentPlan = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.reviseContentPlan(selectedClient.id, {
        status: "draft",
        objective: contentObjective || undefined,
        note: revisionNote || undefined,
      });
      setState((prev) => ({
        ...prev,
        contentPlan: result.contentPlan,
        contentPackage: result.contentPackage,
        contentPlans: result.contentPlans,
        contentPackages: result.contentPackages,
        postArtGallery: null,
        postArtGalleryHistory: [],
        postArtGalleryComparison: null,
        editorialPautas: result.editorialPautas,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitSchedule = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createSchedule(selectedClient.id, {
        status: "draft",
        startDate: scheduleStartDate,
        endDate: scheduleEndDate,
      });
      setState((prev) => ({
        ...prev,
        schedules: result.schedules,
        postArtGallery: null,
        postArtGalleryHistory: [],
        postArtGalleryComparison: null,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitReviseSchedule = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.reviseSchedule(selectedClient.id, {
        status: "draft",
        startDate: scheduleStartDate,
        endDate: scheduleEndDate,
        note: revisionNote || undefined,
      });
      setState((prev) => ({
        ...prev,
        schedules: result.schedules,
        postArtGallery: null,
        postArtGalleryHistory: [],
        postArtGalleryComparison: null,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitRefreshRenderedAssets = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await backendApi.refreshRenderedAssets(selectedClient.id);
      await reloadWorkspace(selectedAgencyId, selectedClient.id);
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitGeneratePostArtGallery = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.generatePostArtGallery(selectedClient.id, "feed_carousel");
      setState((prev) => ({
        ...prev,
        postArtGallery: result.postArtGallery,
        postArtGalleryHistory: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
      }));
      requestContentRefresh(selectedClient.id);
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitGenerateStoryGallery = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.generatePostArtGallery(selectedClient.id, "story");
      setState((prev) => ({
        ...prev,
        postArtGallery: result.postArtGallery,
        postArtGalleryHistory: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
      }));
      requestContentRefresh(selectedClient.id);
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitPublishingDryRun = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await backendApi.executePublishing(selectedClient.id, {
        mode: "dry_run",
        confirm: false,
      });
      await reloadWorkspace(selectedAgencyId, selectedClient.id);
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitPublishingLive = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await backendApi.executePublishing(selectedClient.id, {
        mode: "live",
        confirm: true,
      });
      await reloadWorkspace(selectedAgencyId, selectedClient.id);
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitMonitoring = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createMonitoringReport(selectedClient.id, {
        status: "draft",
        periodStart: monitoringStartDate,
        periodEnd: monitoringEndDate,
      });
      setState((prev) => ({
        ...prev,
        latestReport: result.report,
        reports: result.reports,
        monitoringSchedule: state.monitoringSchedule,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitReviseMonitoring = async () => {
    if (!selectedClient) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.reviseMonitoringReport(selectedClient.id, {
        status: "draft",
        periodStart: monitoringStartDate,
        periodEnd: monitoringEndDate,
        note: revisionNote || undefined,
      });
      setState((prev) => ({
        ...prev,
        latestReport: result.report,
        reports: result.reports,
        monitoringSchedule: state.monitoringSchedule,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitApproval = async () => {
    if (!selectedClient || !approvalArtifactId.trim()) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.createApproval(selectedClient.id, {
        artifactType: approvalArtifactType,
        artifactId: approvalArtifactId.trim(),
        status: approvalStatus,
        notes: notes || undefined,
      });
      setState((prev) => ({
        ...prev,
        approvals: [result.approval, ...prev.approvals],
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitUpdateApproval = async () => {
    const latestApproval = state.approvals[0];
    if (!latestApproval) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.updateApprovalStatus(latestApproval.id, {
        status: approvalUpdateStatus,
        notes: revisionNote || undefined,
      });
      setState((prev) => ({
        ...prev,
        approvals: [result.approval, ...prev.approvals.filter((approval) => approval.id !== latestApproval.id)],
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitYoutubeStrategyAnalysis = async () => {
    if (!selectedClient) return;

    const videoUrls = youtubeVideoUrls
      .split(/[\n,]+/g)
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, 10);

    if (videoUrls.length === 0) {
      setState((prev) => ({
        ...prev,
        error: "Informe pelo menos um link do YouTube.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.analyzeYoutubeStrategy(selectedClient.id, {
        status: "draft",
        videoUrls,
        notes: youtubeStrategyNotes || undefined,
        campaignObjective: youtubeCampaignObjective || undefined,
        funnelStage: youtubeFunnelStage || undefined,
      });
      setState((prev) => ({
        ...prev,
        youtubeStrategyAnalysis: result.latestAnalysis,
        youtubeStrategyAnalyses: result.analyses,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const submitStrategyRecommendation = useCallback(async () => {
    if (!selectedClient) return;

    strategyRecommendationEnabledRef.current = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await backendApi.recommendStrategyForClient(selectedClient.id, {
        productId: state.activeProduct?.id,
        campaignObjective: strategyCampaignObjective || undefined,
        productContext:
          strategyProductContext || state.activeProduct?.promise || state.activeProduct?.problem_solved || state.activeProduct?.name || undefined,
        serviceContext: strategyServiceContext || undefined,
        audienceContext: strategyAudienceContext || state.activeProduct?.audience || selectedClient.segment || undefined,
        funnelStage: strategyFunnelStage || undefined,
      });

      setState((prev) => ({
        ...prev,
        strategyRecommendation: result,
      }));
    } catch (error) {
      setError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    selectedClient,
    state.activeProduct,
    strategyCampaignObjective,
    strategyProductContext,
    strategyServiceContext,
    strategyAudienceContext,
    strategyFunnelStage,
  ]);

  useEffect(() => {
    const currentProductId = state.activeProduct?.id ?? null;
    const previousProductId = previousActiveProductIdRef.current;
    previousActiveProductIdRef.current = currentProductId;

    if (!strategyRecommendationEnabledRef.current) return;
    if (!selectedClient) return;
    if (!currentProductId) return;
    if (previousProductId === currentProductId) return;

    void submitStrategyRecommendation();
  }, [selectedClient, state.activeProduct?.id, submitStrategyRecommendation]);

  return (
    <section style={panelStyle}>
      <PanelHeader
        title={ptBR.backendOps.title}
        subtitle={ptBR.backendOps.subtitle}
        ready={state.ready}
        user={state.user}
      />

      {state.error && <InlineAlert message={state.error} />}

      <Block title={ptBR.backendOps.session}>
        <div style={grid2}>
          <ActionCard title={ptBR.backendOps.buttons.bootstrap} onClick={submitBootstrap} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.login} onClick={submitLogin} loading={state.loading} />
        </div>

        <div style={stack}>
          <Field label={ptBR.backendOps.fields.agencyName} value={bootstrapAgencyName} onChange={setBootstrapAgencyName} />
          <Field label={ptBR.backendOps.fields.agencySlug} value={bootstrapAgencySlug} onChange={setBootstrapAgencySlug} />
          <Field label={ptBR.backendOps.fields.userName} value={bootstrapUserName} onChange={setBootstrapUserName} />
          <Field label={ptBR.backendOps.fields.userEmail} value={bootstrapUserEmail} onChange={setBootstrapUserEmail} />
          <Field label={ptBR.backendOps.fields.password} value={bootstrapPassword} onChange={setBootstrapPassword} type="password" />
          <div style={grid2}>
            <Field label={ptBR.backendOps.fields.loginEmail} value={loginEmail} onChange={setLoginEmail} />
            <Field label={ptBR.backendOps.fields.loginPassword} value={loginPassword} onChange={setLoginPassword} type="password" />
          </div>
        </div>
      </Block>

      <Block title={ptBR.backendOps.workspace}>
        <div style={grid2}>
          <Field label={ptBR.backendOps.fields.agencyId} value={selectedAgencyId} onChange={(value) => setState((prev) => ({ ...prev, selectedAgencyId: value }))} />
          <Field
            label={ptBR.backendOps.fields.selectedClientId}
            value={state.selectedClientId}
            onChange={(value) => {
              setState((prev) => ({ ...prev, selectedClientId: value }));
              writeSelectedClientId(value);
              if (selectedAgencyId) {
                void reloadWorkspace(selectedAgencyId, value);
              }
            }}
          />
        </div>

        <div style={grid2}>
          <ActionCard title={ptBR.backendOps.buttons.refreshWorkspace} onClick={() => void reloadWorkspace(selectedAgencyId)} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.reloadSession} onClick={refreshStatus} loading={state.loading} />
        </div>

        <div style={stack}>
          <Field label={ptBR.backendOps.fields.clientName} value={clientName} onChange={setClientName} />
          <Field label={ptBR.backendOps.fields.clientSlug} value={clientSlug} onChange={setClientSlug} />
          <Field label={ptBR.backendOps.fields.segment} value={clientSegment} onChange={setClientSegment} />
          <Field label={ptBR.backendOps.fields.websiteUrl} value={clientWebsiteUrl} onChange={setClientWebsiteUrl} />
          <Field label={ptBR.backendOps.fields.sourceUrl} value={sourceUrl} onChange={setSourceUrl} />
          <Field label={ptBR.backendOps.fields.competitorUrl} value={competitorUrl} onChange={setCompetitorUrl} />
          <Field label={ptBR.backendOps.fields.note} value={notes} onChange={setNotes} />
          <ActionCard title={ptBR.backendOps.buttons.createClient} onClick={submitCreateClient} loading={state.loading} />
        </div>
      </Block>

      <Block title={ptBR.backendOps.pulse} subtitle={ptBR.backendOps.pulseSubtitle}>
        <div style={summaryGrid}>
          <Metric label={ptBR.backendOps.metrics.agency} value={selectedAgency?.name ?? ptBR.backendOps.placeholders.noAgency} />
          <Metric label={ptBR.backendOps.metrics.client} value={selectedClient?.name ?? ptBR.backendOps.placeholders.noClient} />
          <Metric label={ptBR.backendOps.metrics.marketResearch} value={`v${state.marketResearch?.version ?? 0}`} />
          <Metric label={ptBR.backendOps.metrics.clientRecord} value={`v${state.clientRecord?.version ?? 0}`} />
          <Metric label={ptBR.backendOps.metrics.monitoring} value={translateStatusLabel(state.latestReport?.status ?? "none")} />
          <Metric label={ptBR.backendOps.metrics.monitoringSchedule} value={state.monitoringSchedule?.version ?? 0} />
          <Metric label={ptBR.backendOps.metrics.youtubeStrategies} value={state.youtubeStrategyAnalyses.length} />
        </div>
      </Block>

      <Block title={ptBR.backendOps.squad.title} subtitle={ptBR.backendOps.squad.subtitle}>
        <div style={stageGridStyle}>
          {operationalStages.map((stage, index) => (
            <div key={stage.title} style={stageCardStyle}>
              <div style={stageIndexStyle}>{String(index + 1).padStart(2, "0")}</div>
              <div style={stageTextStyle}>
                <div style={stageTitleStyle}>{stage.title}</div>
                <div style={stageDescriptionStyle}>{stage.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title={ptBR.backendOps.flow} subtitle={ptBR.backendOps.flowSubtitle}>
        <div style={grid2}>
          <ActionCard title={ptBR.backendOps.buttons.createMarketResearch} onClick={submitMarketResearch} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.discoverProfiles} onClick={submitDiscovery} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.buildIntelligence} onClick={submitIntelligence} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.createClientRecord} onClick={submitClientRecord} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.createProposal} onClick={submitProposal} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.createContentPlan} onClick={submitContentPlan} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.createSchedule} onClick={submitSchedule} loading={state.loading} />
          <ActionCard title="Regerar render final" onClick={submitRefreshRenderedAssets} loading={state.loading} tone="success" />
          <ActionCard title="Gerar feed/carrossel" onClick={submitGeneratePostArtGallery} loading={state.loading} tone="success" />
          <ActionCard title="Gerar stories" onClick={submitGenerateStoryGallery} loading={state.loading} tone="success" />
          <ActionCard title={ptBR.backendOps.buttons.createMonitoring} onClick={submitMonitoring} loading={state.loading} />
          <ActionCard title={ptBR.backendOps.buttons.createApproval} onClick={submitApproval} loading={state.loading} />
        </div>

        <div style={summaryGrid}>
          <Metric label={ptBR.backendOps.metrics.clients} value={state.clients.length} />
          <Metric label={ptBR.backendOps.metrics.profiles} value={state.profiles.length} />
          <Metric label={ptBR.backendOps.metrics.marketResearch} value={state.marketResearch?.version ?? 0} />
          <Metric label={ptBR.backendOps.metrics.clientRecord} value={state.clientRecord?.version ?? 0} />
          <Metric label={ptBR.backendOps.metrics.proposal} value={state.proposals[0]?.version ?? 0} />
        </div>

        <div style={summaryGrid}>
          <Metric label={ptBR.backendOps.metrics.contentPlan} value={state.contentPlan?.version ?? 0} />
          <Metric label={ptBR.backendOps.metrics.contentEditorial} value={state.editorialPautas.length} />
          <Metric label={ptBR.backendOps.metrics.schedules} value={state.schedules.length} />
          <Metric label={ptBR.backendOps.metrics.reports} value={state.reports.length} />
          <Metric label={ptBR.backendOps.metrics.approvals} value={state.approvals.length} />
        </div>
      </Block>

      <Block title="Artes dos posts" subtitle="Galerias de feed, carrossel e stories geradas a partir da direção visual e da agenda atual">
        <div style={summaryGrid}>
          <Metric label="Score médio" value={postArtGalleryAverageScore} />
          <Metric label="Variantes" value={postArtGalleryVariants.length} />
          <Metric label="Melhor peça" value={postArtGalleryBestVariant?.label ?? "n/a"} />
          <Metric label="Modo" value={postArtGallery?.mode ?? "não gerado"} />
          <Metric label="Histórico" value={postArtGalleryHistory.length} />
        </div>

        {postArtGallery ? (
          <div style={dataSummaryStack}>
            <ArtifactSummaryCard
              title={postArtGallery.title}
              subtitle={postArtGallery.summary}
              metrics={[
                { label: "Score", value: postArtGallery.overallScore },
                { label: "Package", value: postArtGallery.contentPackageVersion ?? "n/a" },
                { label: "Schedule", value: postArtGallery.scheduleVersion ?? "n/a" },
                { label: "Modo", value: postArtGallery.mode },
              ]}
              bullets={[
                `Gerado em ${new Date(postArtGallery.generatedAt).toLocaleString("pt-BR")}`,
                postArtGalleryBestVariant ? `Melhor variante: ${postArtGalleryBestVariant.label} (${postArtGalleryBestVariant.quality.totalScore} pts)` : "Nenhuma variante disponível.",
                postArtGallery.mode === "story" ? "Formato inicial: stories." : "Formato inicial: feed + carrossel.",
              ]}
            />

            {derivedPostArtGalleryComparison ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Comparação recente</div>
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                  <Metric label="Versões" value={`${derivedPostArtGalleryComparison.previousVersion} → ${derivedPostArtGalleryComparison.latestVersion}`} />
                  <Metric label="Delta score" value={`${derivedPostArtGalleryComparison.scoreDelta > 0 ? "+" : ""}${derivedPostArtGalleryComparison.scoreDelta}`} />
                  <Metric label="Delta variantes" value={`${derivedPostArtGalleryComparison.variantDelta > 0 ? "+" : ""}${derivedPostArtGalleryComparison.variantDelta}`} />
                  <Metric label="Modo" value={derivedPostArtGalleryComparison.latestMode} />
                </div>
                <InfoListCard
                  title={derivedPostArtGalleryComparison.summary}
                  items={[
                    ...derivedPostArtGalleryComparison.highlights,
                    ...derivedPostArtGalleryComparison.improvements.slice(0, 2),
                    ...derivedPostArtGalleryComparison.regressions.slice(0, 2),
                  ]}
                />
              </div>
            ) : null}

            {postArtGalleryHistory.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Histórico recente</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {postArtGalleryHistory.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      style={{
                        display: "grid",
                        gap: 4,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.18)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <strong style={{ fontSize: 13 }}>{record.title}</strong>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          v{record.version} · {record.mode} · {record.overall_score} pts
                        </span>
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>{record.summary}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                        {new Date(record.created_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={grid2}>
              {postArtGalleryVariants.map((variant, index) => (
                <div
                  key={variant.id}
                  style={{
                    display: "grid",
                    gap: 12,
                    padding: 14,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: "1 1 360px" }}>
                      <ArtifactSummaryCard
                        title={`${variant.label} · ${variant.format}`}
                        subtitle={variant.title}
                        metrics={[
                          { label: "Score", value: variant.quality.totalScore },
                          { label: "Copy", value: variant.quality.copyScore },
                          { label: "Visual", value: variant.quality.visualScore },
                          { label: "Clareza", value: variant.quality.clarityScore },
                        ]}
                        bullets={[
                          ...variant.quality.strengths.slice(0, 2),
                          ...variant.quality.suggestions.slice(0, 2),
                        ]}
                      />
                      <div
                        style={{
                          marginTop: 12,
                          display: "grid",
                          gap: 8,
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Copy</div>
                        <div style={{ display: "grid", gap: 6, fontSize: 12, lineHeight: 1.55, color: "var(--text-secondary)" }}>
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>Título:</strong> {variant.title}
                          </div>
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>Subtítulo:</strong> {variant.subtitle}
                          </div>
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>Legenda:</strong> {variant.caption}
                          </div>
                          <div>
                            <strong style={{ color: "var(--text-primary)" }}>CTA:</strong> {variant.cta}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        alignSelf: "start",
                        flex: "1 1 320px",
                      }}
                    >
                      {variant.previewDataUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewLightbox({
                              index,
                              title: `${variant.label} · ${variant.format}`,
                              subtitle: `${variant.title} · ${variant.channel}`,
                              alt: `${variant.label} preview`,
                            })
                          }
                          aria-label={`Abrir preview ampliado de ${variant.label}`}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            cursor: "zoom-in",
                          }}
                        >
                          <img
                            src={variant.previewDataUrl}
                            alt={`${variant.label} preview`}
                            style={{ display: "block", width: "100%", height: "auto" }}
                          />
                        </button>
                      ) : (
                        <div style={{ padding: 16, fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                          Preview não disponível.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <InfoListCard
            title="Leitura rápida"
            items={[
              "Clique em 'Gerar feed/carrossel' ou 'Gerar stories' para criar um lote inicial.",
              "A análise inclui score de copy, visual, clareza, acessibilidade e histórico por versão.",
            ]}
          />
        )}
      </Block>

      {previewLightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentPreviewVariant ? `${currentPreviewVariant.label} preview` : previewLightbox.title}
          onClick={() => setPreviewLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(2, 6, 23, 0.82)",
            backdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1100px, 96vw)",
              maxHeight: "92vh",
              overflow: "auto",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(8, 15, 28, 0.96)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
              display: "grid",
              gap: 14,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
                  {currentPreviewVariant ? `${currentPreviewVariant.label} · ${currentPreviewVariant.format}` : previewLightbox.title}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                  {currentPreviewVariant ? `${currentPreviewVariant.title} · ${currentPreviewVariant.channel}` : previewLightbox.subtitle}
                </div>
                {previewGalleryVariants.length > 1 ? (
                  <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-tertiary)" }}>
                    {previewLightbox.index + 1} / {previewGalleryVariants.length}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewLightbox((current) => {
                        if (!current || previewGalleryVariants.length === 0) return current;
                        const nextIndex = (current.index - 1 + previewGalleryVariants.length) % previewGalleryVariants.length;
                        return { ...current, index: nextIndex };
                      })
                    }
                    disabled={previewGalleryVariants.length < 2}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-primary)",
                      borderRadius: 999,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      opacity: previewGalleryVariants.length < 2 ? 0.45 : 1,
                    }}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewLightbox((current) => {
                        if (!current || previewGalleryVariants.length === 0) return current;
                        const nextIndex = (current.index + 1) % previewGalleryVariants.length;
                        return { ...current, index: nextIndex };
                      })
                    }
                    disabled={previewGalleryVariants.length < 2}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-primary)",
                      borderRadius: 999,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      opacity: previewGalleryVariants.length < 2 ? 0.45 : 1,
                    }}
                  >
                    Próximo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLightbox(null)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-primary)",
                      borderRadius: 999,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Fechar
                  </button>
              </div>
            </div>
            <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              {currentPreviewVariant?.previewDataUrl ? (
                <img src={currentPreviewVariant.previewDataUrl} alt={previewLightbox.alt} style={{ display: "block", width: "100%", height: "auto" }} />
              ) : (
                <div style={{ padding: 24, fontSize: 13, color: "var(--text-secondary)" }}>Preview não disponível.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <Block title={ptBR.backendOps.youtubeStrategy.title} subtitle={ptBR.backendOps.youtubeStrategy.subtitle}>
        <div style={stack}>
          <TextAreaField label={ptBR.backendOps.fields.youtubeVideoUrls} value={youtubeVideoUrls} onChange={setYoutubeVideoUrls} rows={5} />
          <Field
            label={ptBR.backendOps.fields.youtubeCampaignObjective}
            value={youtubeCampaignObjective}
            onChange={setYoutubeCampaignObjective}
          />
          <Select
            label={ptBR.backendOps.fields.youtubeFunnelStage}
            value={youtubeFunnelStage}
            options={[
              { label: ptBR.backendOps.selects.youtubeFunnelStage.awareness, value: "awareness" },
              { label: ptBR.backendOps.selects.youtubeFunnelStage.consideration, value: "consideration" },
              { label: ptBR.backendOps.selects.youtubeFunnelStage.decision, value: "decision" },
              { label: ptBR.backendOps.selects.youtubeFunnelStage.retention, value: "retention" },
              { label: ptBR.backendOps.selects.youtubeFunnelStage.scale, value: "scale" },
            ]}
            onChange={setYoutubeFunnelStage}
          />
          <Field label={ptBR.backendOps.fields.youtubeStrategyNotes} value={youtubeStrategyNotes} onChange={setYoutubeStrategyNotes} />
          <ActionCard title={ptBR.backendOps.buttons.analyzeYoutubeStrategy} onClick={submitYoutubeStrategyAnalysis} loading={state.loading} />
        </div>
        <DisplayModeToggle
          label={ptBR.backendOps.youtubeStrategy.modeLabel}
          value={youtubeDisplayMode}
          options={[
            { label: ptBR.backendOps.youtubeStrategy.modeAnalysis, value: "analysis" },
            { label: ptBR.backendOps.youtubeStrategy.modeRaw, value: "raw" },
          ]}
          onChange={setYoutubeDisplayMode}
        />

        {youtubeDisplayMode === "analysis" ? (
          <>
            <div style={analysisSummaryGrid}>
              <Metric label="Status" value={formatAnalysisStatus(youtubeOverview.analysisStatus ?? state.youtubeStrategyAnalysis?.status ?? "none")} />
              <Metric label="Confiança" value={`${Math.round(youtubeOverview.confidence ?? 0)}%`} />
              <Metric label="Vídeos" value={youtubeContext.analyzedVideoCount ?? state.youtubeStrategyAnalyses.length} />
              <Metric label="Transcrição" value={`${youtubeContext.transcriptCoverage?.available ?? 0}/${youtubeContext.requestedVideoCount ?? 0}`} />
            </div>

            <div style={analysisSplitGrid}>
              <ArtifactSummaryCard
                title="Processamento"
                subtitle="Cada vídeo é comparado pelo `videoId` e pelo fingerprint da transcrição antes de gerar nova versão."
                metrics={[
                  { label: "Mudança relevante", value: youtubeProcessing?.hasRelevantChange ? 1 : 0 },
                  { label: "Reutilizados", value: youtubeProcessing?.reusedVideoCount ?? 0 },
                  { label: "Reprocessados", value: youtubeProcessing?.changedVideoCount ?? 0 },
                ]}
                bullets={
                  youtubeProcessing?.videos?.length
                    ? youtubeProcessing.videos.slice(0, 4).flatMap((item, index) => [
                        `${index + 1}. ${translateYoutubeProcessingStatus(item.status ?? "new")} · ${item.videoId ?? "video desconhecido"}`,
                        item.reason ?? "Sem justificativa disponível.",
                        item.previousAnalysisVersion != null
                          ? `Versão anterior: v${item.previousAnalysisVersion}`
                          : "Sem versão anterior registrada.",
                      ])
                    : ["Nenhum estado de processamento disponível."]
                }
                emptyBulletLabel="Nenhum estado de processamento disponível."
              />
              <InfoListCard
                title="Regras aplicadas"
                items={[
                  "Link normalizado por `videoId`.",
                  "Fingerprint da transcrição é comparado com o estado persistido.",
                  "Mesmo conteúdo reutiliza a análise existente.",
                  "Mudança relevante cria nova versão e atualiza a estratégia.",
                ]}
              />
            </div>

            <InfoListCard
              title="Histórico por vídeo"
              items={
                youtubeVideoStates.length > 0
                  ? youtubeVideoStates.slice(0, 5).flatMap((item, index) => [
                      `${index + 1}. ${item.video_id} · v${item.last_analysis_version ?? 0} · ${translateYoutubeProcessingStatus(
                        youtubeProcessing?.videos?.find((video) => video.videoId === item.video_id)?.status ?? "reused",
                      )}`,
                      `Último processamento: ${new Date(item.last_processed_at).toLocaleString("pt-BR")}`,
                      `Assinatura atual: ${item.transcript_hash.slice(0, 12)}…`,
                    ])
                  : []
              }
              emptyLabel="Nenhum histórico por vídeo disponível."
            />

            <div style={analysisHeroCard}>
              <div style={analysisHeroEyebrow}>Resumo executivo</div>
              <div style={analysisHeroTitle}>{youtubeOverview.executiveSummary ?? "Ainda não há análise disponível."}</div>
              <div style={analysisHeroBody}>{youtubeOverview.thesis ?? "Cole links do YouTube e execute a análise para extrair a tese principal."}</div>
            </div>

            {youtubeStrategyIntelligence?.recommendation?.primary ? (
              <>
                <ArtifactSummaryCard
                  title={ptBR.backendOps.youtubeStrategy.strategyTitle}
                  subtitle={ptBR.backendOps.youtubeStrategy.strategySubtitle}
                  metrics={[
                    { label: ptBR.backendOps.youtubeStrategy.version, value: youtubeStrategyIntelligence.version ?? 0 },
                    { label: "Biblioteca", value: youtubeStrategyLibrary?.assets?.length ?? youtubeStrategyIntelligence.assets?.length ?? 0 },
                    { label: "Evidências", value: youtubeStrategyEvidence.length },
                    { label: ptBR.backendOps.youtubeStrategy.assets, value: youtubeStrategyIntelligence.assets?.length ?? 0 },
                    { label: ptBR.backendOps.youtubeStrategy.fitScore, value: youtubeStrategyIntelligence.recommendation?.primary?.fitScore ?? 0 },
                  ]}
                  bullets={[
                    `Escolha: ${youtubeStrategyIntelligence.recommendation.primary.strategyName ?? ptBR.backendOps.youtubeStrategy.primaryFallback}`,
                    `Aplicação: ${youtubeStrategyIntelligence.recommendation.primary.strategySummary ?? ptBR.backendOps.youtubeStrategy.primarySummaryFallback}`,
                  ]}
                />
                <BadgeCloudCard
                  title={ptBR.backendOps.youtubeStrategy.namingTitle}
                  subtitle={ptBR.backendOps.youtubeStrategy.namingSubtitle}
                  badges={[
                    "Autoridade para gerar prova",
                    "Educação para clarificar o mecanismo",
                    "Conversão para demonstrar valor",
                    "Escala para sistematizar execução",
                    "Estratégia de contingência",
                  ]}
                />
                  <InfoListCard
                    title={ptBR.backendOps.youtubeStrategy.sourceTitle}
                    items={
                      youtubeStrategyIntelligence.source
                        ? [
                            youtubeStrategyIntelligence.title ? `Título: ${youtubeStrategyIntelligence.title}` : "Título: não informado",
                            youtubeStrategyIntelligence.source.primaryVideo?.canonicalUrl
                              ? `Link canônico: ${youtubeStrategyIntelligence.source.primaryVideo.canonicalUrl}`
                              : "Link canônico: não informado",
                          youtubeStrategyIntelligence.source.primaryVideo?.channelName
                            ? `Canal: ${youtubeStrategyIntelligence.source.primaryVideo.channelName}`
                            : "Canal: não informado",
                          youtubeStrategyIntelligence.source.analysisId
                            ? `Análise: ${youtubeStrategyIntelligence.source.analysisId} · v${youtubeStrategyIntelligence.source.analysisVersion ?? 0}`
                            : "Análise: não informada",
                        ]
                      : ["Fonte não consolidada."]
                  }
                  emptyLabel="Fonte não consolidada."
                />
                <InfoListCard
                  title="Evidências da biblioteca"
                  items={
                    youtubeStrategyEvidence.length > 0
                      ? youtubeStrategyEvidence.slice(0, 4).flatMap((item, index) => [
                          `${index + 1}. ${item.strategyName ?? "Estratégia sem nome"} · v${item.sourceVersion ?? 0}`,
                          item.strategySummary ?? "Sem resumo disponível.",
                          ...(item.fitSignals ?? []).slice(0, 2).map((signal) => `${ptBR.backendOps.youtubeStrategy.fitSignals}: ${signal}`),
                        ])
                      : ["Nenhuma evidência consolidada."]
                  }
                />
                <InfoListCard
                  title="Leitura rápida"
                  items={[
                    `1. Escolha: ${youtubeStrategyIntelligence.recommendation.primary.strategyName ?? ptBR.backendOps.youtubeStrategy.primaryFallback}`,
                    `2. Justificativa: ${youtubeStrategyIntelligence.recommendation.primary.fitSignals?.[0] ?? "fit contextual a partir da análise"}`,
                    `3. Funil: ${youtubeStrategyIntelligence.recommendation.primary.funnelStage ?? youtubeFunnelStage}`,
                    `4. Aplicação: ${youtubeStrategyIntelligence.recommendation.contingency?.strategyName ?? ptBR.backendOps.youtubeStrategy.contingencyFallback} como fallback quando o contexto for ambíguo.`,
                  ]}
                />
                <div style={analysisSplitGrid}>
                  <ArtifactSummaryCard
                    title="Gama de estratégias"
                    subtitle="Opções ranqueadas pelo contexto do cliente e objetivo da campanha."
                    metrics={[
                      { label: "Opções", value: youtubeStrategyIntelligence.recommendation.strategyOptions?.length ?? 0 },
                      { label: "Primária", value: youtubeStrategyIntelligence.recommendation.primary ? 1 : 0 },
                      { label: "Contingência", value: youtubeStrategyIntelligence.recommendation.contingency ? 1 : 0 },
                    ]}
                    bullets={
                      (youtubeStrategyIntelligence.recommendation.strategyOptions ?? []).length > 0
                        ? (youtubeStrategyIntelligence.recommendation.strategyOptions ?? []).slice(0, 4).flatMap((option, index) => {
                            const band =
                              option.fitBand === "recommended"
                                ? "alta aderência"
                                : option.fitBand === "secondary"
                                  ? "boa aderência"
                                  : "aderência parcial";

                            return [
                              `${index + 1}. ${option.strategyName ?? "Estratégia sem nome"} · ${Math.round(option.fitScore ?? 0)} pts · ${band}`,
                              option.strategySummary ?? "Sem resumo disponível.",
                              ...(option.fitSignals ?? []).slice(0, 2).map((signal) => `${ptBR.backendOps.youtubeStrategy.fitSignals}: ${signal}`),
                            ];
                          })
                        : ["Nenhuma opção contextual disponível."]
                    }
                  />
                  <InfoListCard
                    title="Como aplicar"
                    items={[
                      `Objetivo atual: ${youtubeCampaignObjective || "não informado"}`,
                      `Prioridade de uso: ${youtubeStrategyIntelligence.recommendation.primary?.strategyName ?? ptBR.backendOps.youtubeStrategy.primaryFallback}`,
                      `Fallback seguro: ${youtubeStrategyIntelligence.recommendation.contingency?.strategyName ?? ptBR.backendOps.youtubeStrategy.contingencyFallback}`,
                    ]}
                  />
                </div>
                <div style={analysisComparisonGrid}>
                  <ArtifactSummaryCard
                    title={ptBR.backendOps.youtubeStrategy.primary}
                    subtitle={youtubeStrategyIntelligence.recommendation.primary.strategySummary ?? ptBR.backendOps.youtubeStrategy.primarySummaryFallback}
                    metrics={[
                      { label: ptBR.backendOps.youtubeStrategy.fitScore, value: youtubeStrategyIntelligence.recommendation.primary.fitScore ?? 0 },
                      { label: ptBR.backendOps.youtubeStrategy.version, value: youtubeStrategyIntelligence.version ?? 0 },
                      { label: ptBR.backendOps.youtubeStrategy.fitSignals, value: youtubeStrategyIntelligence.recommendation.primary.fitSignals?.length ?? 0 },
                    ]}
                    bullets={[
                      youtubeStrategyIntelligence.recommendation.primary.strategyName ?? ptBR.backendOps.youtubeStrategy.primaryFallback,
                      ...(youtubeStrategyIntelligence.recommendation.primary.fitSignals ?? []).slice(0, 3).map((signal) => `${ptBR.backendOps.youtubeStrategy.fitSignals}: ${signal}`),
                    ]}
                    emptyBulletLabel="Nenhum sinal disponível."
                  />
                  <ArtifactSummaryCard
                    title={ptBR.backendOps.youtubeStrategy.alternatives}
                    subtitle="Top alternativas ordenadas por aderência."
                    metrics={[
                      { label: ptBR.backendOps.youtubeStrategy.assets, value: youtubeStrategyIntelligence.recommendation.alternatives?.length ?? 0 },
                      {
                        label: ptBR.backendOps.youtubeStrategy.fitSignals,
                        value: youtubeStrategyIntelligence.recommendation.alternatives?.reduce((total, item) => total + (item.fitSignals?.length ?? 0), 0) ?? 0,
                      },
                      {
                        label: ptBR.backendOps.youtubeStrategy.fitScore,
                        value: Math.max(0, ...(youtubeStrategyIntelligence.recommendation.alternatives ?? []).map((item) => item.fitScore ?? 0)),
                      },
                    ]}
                    bullets={
                      (youtubeStrategyIntelligence.recommendation.alternatives ?? []).length > 0
                        ? (youtubeStrategyIntelligence.recommendation.alternatives ?? []).slice(0, 2).flatMap((alternative, index) => [
                            `${index + 1}. ${alternative.strategyName ?? ptBR.backendOps.youtubeStrategy.alternativeFallback} · ${alternative.strategySummary ?? ptBR.backendOps.youtubeStrategy.alternativeSummaryFallback}`,
                            ...(alternative.fitSignals ?? []).slice(0, 2).map((signal) => `${ptBR.backendOps.youtubeStrategy.fitSignals}: ${signal}`),
                          ])
                        : ["Nenhuma alternativa disponível."]
                    }
                  />
                  <ArtifactSummaryCard
                    title={ptBR.backendOps.youtubeStrategy.contingency}
                    subtitle="Opção mais segura para contexto ambíguo ou risco elevado."
                    metrics={[
                      { label: ptBR.backendOps.youtubeStrategy.fitScore, value: youtubeStrategyIntelligence.recommendation.contingency?.fitScore ?? 0 },
                      { label: ptBR.backendOps.youtubeStrategy.version, value: youtubeStrategyIntelligence.version ?? 0 },
                      { label: ptBR.backendOps.youtubeStrategy.fitSignals, value: youtubeStrategyIntelligence.recommendation.contingency?.fitSignals?.length ?? 0 },
                    ]}
                    bullets={
                      youtubeStrategyIntelligence.recommendation.contingency
                        ? [
                            youtubeStrategyIntelligence.recommendation.contingency.strategyName ?? ptBR.backendOps.youtubeStrategy.contingencyFallback,
                            youtubeStrategyIntelligence.recommendation.contingency.strategySummary ?? ptBR.backendOps.youtubeStrategy.contingencySummaryFallback,
                            ...(youtubeStrategyIntelligence.recommendation.contingency.fitSignals ?? []).slice(0, 3).map(
                              (signal) => `${ptBR.backendOps.youtubeStrategy.fitSignals}: ${signal}`,
                            ),
                          ]
                        : [ptBR.backendOps.youtubeStrategy.contingencySummaryFallback]
                    }
                    emptyBulletLabel="Nenhum sinal disponível."
                  />
                </div>
              </>
            ) : null}

            <div style={analysisSplitGrid}>
              <InfoListCard title="Estratégias recorrentes" items={youtubeSynthesis.commonStrategies ?? []} emptyLabel="Nenhuma estratégia recorrente detectada." />
              <InfoListCard title="Mecanismos comuns" items={youtubeSynthesis.commonMechanisms ?? []} emptyLabel="Nenhum mecanismo consolidado." />
            </div>

            <div style={analysisSplitGrid}>
              <InfoListCard title="Táticas observadas" items={youtubeSynthesis.commonTactics ?? []} emptyLabel="Nenhuma tática consolidada." />
              <InfoListCard title="Riscos" items={youtubeSynthesis.risks ?? []} emptyLabel="Nenhum risco registrado." tone="warning" />
            </div>

            <div style={analysisRankGrid}>
              <RankedListCard title="Mais aplicáveis" items={youtubeSynthesis.recommendedBusinessTypes ?? []} />
              <RankedListCard title="Menos indicados" items={youtubeSynthesis.lessSuitableBusinessTypes ?? []} tone="subtle" />
            </div>

            <div style={analysisSplitGrid}>
              <InfoListCard title="Próximos testes" items={youtubeSynthesis.nextTests ?? []} emptyLabel="Nenhum teste sugerido." />
              <InfoListCard
                title="Cobertura"
                items={[
                  `Vídeos com transcrição: ${youtubeContext.transcriptCoverage?.available ?? 0}`,
                  `Vídeos sem transcrição: ${youtubeContext.transcriptCoverage?.missing ?? 0}`,
                  `Caracteres analisados: ${youtubeContext.transcriptCoverage?.totalCharacters ?? 0}`,
                  `Segmentos analisados: ${youtubeContext.transcriptCoverage?.totalSegments ?? 0}`,
                ]}
              />
            </div>

            <div style={analysisVideoStack}>
              {youtubeVideos.slice(0, 3).map((video, index) => (
                <VideoAnalysisCard key={`${video.originalUrl ?? index}`} video={video} index={index + 1} />
              ))}
            </div>
          </>
        ) : (
          <div style={rawPayloadStack}>
            <div style={rawPayloadNote}>{ptBR.backendOps.youtubeStrategy.rawModeSubtitle}</div>
            <JsonPreview title={ptBR.backendOps.previews.youtubeStrategy} value={state.youtubeStrategyAnalysis} />
            <JsonPreview title={ptBR.backendOps.previews.youtubeStrategies} value={state.youtubeStrategyAnalyses} />
          </div>
        )}
      </Block>

      <Block title={ptBR.backendOps.strategyRecommendation.title} subtitle={ptBR.backendOps.strategyRecommendation.subtitle}>
        <div style={stack}>
          <InfoListCard
            title="Oferta foco"
            items={
              state.activeProduct
                ? [
                    state.activeProduct.name,
                    state.activeProduct.promise,
                    state.activeProduct.audience,
                    state.activeProduct.status,
                ]
                : ["Nenhuma oferta ativa encontrada; a recomendação usará apenas o contexto geral."]
            }
          />
          <Field
            label={ptBR.backendOps.fields.strategyCampaignObjective}
            value={strategyCampaignObjective}
            onChange={setStrategyCampaignObjective}
          />
          <Select
            label={ptBR.backendOps.fields.strategyFunnelStage}
            value={strategyFunnelStage}
            options={[
              { label: ptBR.backendOps.selects.strategyFunnelStage.awareness, value: "awareness" },
              { label: ptBR.backendOps.selects.strategyFunnelStage.consideration, value: "consideration" },
              { label: ptBR.backendOps.selects.strategyFunnelStage.decision, value: "decision" },
              { label: ptBR.backendOps.selects.strategyFunnelStage.retention, value: "retention" },
              { label: ptBR.backendOps.selects.strategyFunnelStage.scale, value: "scale" },
            ]}
            onChange={setStrategyFunnelStage}
          />
          <TextAreaField label={ptBR.backendOps.fields.strategyProductContext} value={strategyProductContext} onChange={setStrategyProductContext} />
          <TextAreaField label={ptBR.backendOps.fields.strategyServiceContext} value={strategyServiceContext} onChange={setStrategyServiceContext} />
          <TextAreaField label={ptBR.backendOps.fields.strategyAudienceContext} value={strategyAudienceContext} onChange={setStrategyAudienceContext} />
          <ActionCard title={ptBR.backendOps.buttons.recommendStrategy} onClick={submitStrategyRecommendation} loading={state.loading} />
        </div>

        {strategyRecommendation ? (
          <>
            <div style={summaryGrid}>
              <Metric label={ptBR.backendOps.youtubeStrategy.version} value={strategyRecommendation.latestVersion} />
              <Metric label={ptBR.backendOps.youtubeStrategy.assets} value={strategyRecommendation.assets.length} />
              <Metric label={ptBR.backendOps.youtubeStrategy.fitScore} value={strategyRecommendationPrimary?.fitScore ?? 0} />
              <Metric label={ptBR.backendOps.metrics.client} value={selectedClient?.name ?? ptBR.backendOps.placeholders.noClient} />
            </div>

            <div style={analysisSplitGrid}>
              <ArtifactSummaryCard
                title={ptBR.backendOps.youtubeStrategy.primary}
                subtitle={strategyRecommendationPrimary?.strategySummary ?? ptBR.backendOps.youtubeStrategy.primarySummaryFallback}
                metrics={[
                  { label: ptBR.backendOps.youtubeStrategy.fitScore, value: strategyRecommendationPrimary?.fitScore ?? 0 },
                  { label: ptBR.backendOps.youtubeStrategy.fitSignals, value: strategyRecommendationPrimary?.fitSignals?.length ?? 0 },
                  { label: ptBR.backendOps.youtubeStrategy.version, value: strategyRecommendationPrimary?.version ?? 0 },
                ]}
                bullets={
                  strategyRecommendationPrimary
                    ? [
                        strategyRecommendationPrimary.strategyName,
                        strategyRecommendationPrimary.reason,
                        `Funil: ${strategyRecommendationPrimary.funnelStage ?? strategyFunnelStage}`,
                      ]
                    : [ptBR.backendOps.youtubeStrategy.primarySummaryFallback]
                }
                emptyBulletLabel={ptBR.backendOps.youtubeStrategy.primarySummaryFallback}
              />
              <ArtifactSummaryCard
                title={ptBR.backendOps.youtubeStrategy.alternatives}
                subtitle="Opções próximas em aderência."
                metrics={[
                  { label: ptBR.backendOps.youtubeStrategy.assets, value: strategyRecommendationAlternatives.length },
                  {
                    label: ptBR.backendOps.youtubeStrategy.fitSignals,
                    value: strategyRecommendationAlternatives.reduce((total, item) => total + item.fitSignals.length, 0),
                  },
                  {
                    label: ptBR.backendOps.youtubeStrategy.fitScore,
                    value: Math.max(0, ...strategyRecommendationAlternatives.map((item) => item.fitScore)),
                  },
                ]}
                bullets={
                  strategyRecommendationAlternatives.length > 0
                    ? strategyRecommendationAlternatives.slice(0, 2).flatMap((alternative, index) => [
                        `${index + 1}. ${alternative.strategyName} · ${alternative.strategySummary}`,
                        alternative.reason,
                      ])
                    : [ptBR.backendOps.youtubeStrategy.alternativeSummaryFallback]
                }
                emptyBulletLabel={ptBR.backendOps.youtubeStrategy.alternativeSummaryFallback}
              />
                  <ArtifactSummaryCard
                    title={ptBR.backendOps.youtubeStrategy.contingency}
                    subtitle={strategyRecommendationContingency?.strategySummary ?? ptBR.backendOps.youtubeStrategy.contingencySummaryFallback}
                    metrics={[
                      { label: ptBR.backendOps.youtubeStrategy.fitScore, value: strategyRecommendationContingency?.fitScore ?? 0 },
                      { label: ptBR.backendOps.youtubeStrategy.fitSignals, value: strategyRecommendationContingency?.fitSignals?.length ?? 0 },
                      { label: ptBR.backendOps.youtubeStrategy.version, value: strategyRecommendationContingency?.version ?? 0 },
                    ]}
                    bullets={
                      strategyRecommendationContingency
                        ? [
                            strategyRecommendationContingency.strategyName,
                            strategyRecommendationContingency.reason,
                            `Contexto: ${strategyRecommendationContingency.objective ?? strategyCampaignObjective}`,
                          ]
                        : [ptBR.backendOps.youtubeStrategy.contingencySummaryFallback]
                    }
                    emptyBulletLabel={ptBR.backendOps.youtubeStrategy.contingencySummaryFallback}
                  />
            </div>

            <div style={analysisSplitGrid}>
              <div style={stack}>
                <ActionCard
                  title={ptBR.backendOps.buttons.copyStrategyActionPlan}
                  onClick={copyStrategyActionPlan}
                  loading={false}
                  tone="warm"
                />
                {strategyActionPlanCopyStatus === "copied" ? (
                  <InlineAlert message={ptBR.backendOps.strategyActionPlan.copySuccess} />
                ) : null}
                {strategyActionPlanCopyStatus === "error" ? (
                  <InlineAlert message={ptBR.backendOps.strategyActionPlan.copyError} />
                ) : null}
              </div>
              <ArtifactSummaryCard
                title={ptBR.backendOps.strategyActionPlan.title}
                subtitle={strategyRecommendationActionPlan?.summary ?? ptBR.backendOps.strategyActionPlan.subtitle}
                metrics={[
                  { label: ptBR.backendOps.strategyActionPlan.weeklyCadence, value: strategyRecommendationActionPlan?.weeklyAgenda.length ?? 0 },
                  { label: ptBR.backendOps.strategyActionPlan.weeklyActions, value: strategyRecommendationActionPlan?.weeklyActions.length ?? 0 },
                  { label: ptBR.backendOps.strategyActionPlan.nextTests, value: strategyRecommendationActionPlan?.nextTests.length ?? 0 },
                  {
                    label: ptBR.backendOps.strategyActionPlan.variants,
                    value: strategyRecommendationActionPlan?.weeklyAgenda.reduce((total, item) => total + item.variants.length, 0) ?? 0,
                  },
                ]}
                bullets={
                  strategyRecommendationActionPlan
                    ? [
                        `${ptBR.backendOps.strategyActionPlan.focus}: ${strategyRecommendationActionPlan.focus}`,
                        `${ptBR.backendOps.strategyActionPlan.weeklyCadence}: ${strategyRecommendationActionPlan.weeklyCadence}`,
                        `${ptBR.backendOps.strategyActionPlan.contentMix}: ${strategyRecommendationActionPlan.contentMix
                          .map((item) => `${item.format} (${item.frequency})`)
                          .join(" · ")}`,
                        `${ptBR.backendOps.strategyActionPlan.weeklyAgenda}: ${strategyRecommendationActionPlan.weeklyAgenda
                          .map(
                            (item) =>
                              `${item.day}: ${item.title} · ${ptBR.backendOps.strategyActionPlan.hook}: ${item.hook} · ${ptBR.backendOps.strategyActionPlan.copy}: ${item.copy} · ${ptBR.backendOps.strategyActionPlan.caption}: ${item.caption} · ${ptBR.backendOps.strategyActionPlan.structure}: ${item.structure} · ${ptBR.backendOps.strategyActionPlan.finalCta}: ${item.finalCta} · ${ptBR.backendOps.strategyActionPlan.variants}: ${item.variants
                                .map(
                                  (variant) =>
                                    `${variant.label === "A" ? ptBR.backendOps.strategyActionPlan.variantA : ptBR.backendOps.strategyActionPlan.variantB} (${variant.angle}): ${variant.hook} · ${variant.finalCta}`,
                                )
                                .join(" / ")}`,
                          )
                          .join(" · ")}`,
                        `${ptBR.backendOps.strategyActionPlan.productionPriorities}: ${strategyRecommendationActionPlan.productionPriorities.join(" · ")}`,
                        `${ptBR.backendOps.strategyActionPlan.weeklyActions}: ${strategyRecommendationActionPlan.weeklyActions.join(" · ")}`,
                        `${ptBR.backendOps.strategyActionPlan.ctaFocus}: ${strategyRecommendationActionPlan.ctaFocus}`,
                        `${ptBR.backendOps.strategyActionPlan.nextTests}: ${strategyRecommendationActionPlan.nextTests.join(" · ")}`,
                      ]
                    : [ptBR.backendOps.strategyActionPlan.subtitle]
                }
                emptyBulletLabel={ptBR.backendOps.strategyActionPlan.subtitle}
              />
              <InfoListCard
                title="Leitura rápida"
                items={[
                  `Objetivo: ${strategyCampaignObjective || "não informado"}`,
                  `Estágio: ${strategyFunnelStage}`,
                  `Produto: ${strategyProductContext || "não informado"}`,
                  `Serviço: ${strategyServiceContext || "não informado"}`,
                  `Público: ${strategyAudienceContext || "não informado"}`,
                ]}
              />
              <ArtifactSummaryCard
                title="Biblioteca de estratégias"
                subtitle="Cases extraídos do YouTube e ranqueados para o contexto atual."
                  metrics={[
                    { label: "Opções", value: strategyRecommendationOptions.length },
                    { label: "Primária", value: strategyRecommendationPrimary ? 1 : 0 },
                    { label: "Contingência", value: strategyRecommendationContingency ? 1 : 0 },
                  ]}
                bullets={
                  strategyRecommendationOptions.length > 0
                    ? strategyRecommendationOptions.slice(0, 4).flatMap((option, index) => {
                        const band =
                          option.fitBand === "recommended"
                            ? "alta aderência"
                            : option.fitBand === "secondary"
                              ? "boa aderência"
                              : "aderência parcial";

                        return [
                          `${index + 1}. ${option.strategyName} · ${Math.round(option.fitScore)} pts · ${band}`,
                          option.strategySummary,
                        ];
                      })
                    : ["Nenhuma opção de estratégia disponível."]
                }
              />
            </div>
          </>
        ) : (
          <InfoListCard
            title="Leitura rápida"
            items={[
              "Informe o contexto da campanha para ranquear a melhor estratégia orgânica.",
              "A recomendação usa objetivo, estágio do funil e contexto do cliente.",
            ]}
          />
        )}
      </Block>

      <Block title={ptBR.backendOps.governance} subtitle={ptBR.backendOps.governanceSubtitle}>
        <div style={stack}>
          <Field label={ptBR.backendOps.fields.contentObjective} value={contentObjective} onChange={setContentObjective} />
          <Field label={ptBR.backendOps.fields.revisionNote} value={revisionNote} onChange={setRevisionNote} />
          <Field
            label={ptBR.backendOps.fields.marketResearchSummaryOverride}
            value={marketResearchSummaryOverride}
            onChange={setMarketResearchSummaryOverride}
          />
          <Field label={ptBR.backendOps.fields.clientRecordSummaryOverride} value={clientRecordSummaryOverride} onChange={setClientRecordSummaryOverride} />
          <Field label={ptBR.backendOps.fields.proposalThesisOverride} value={proposalThesisOverride} onChange={setProposalThesisOverride} />
          <div style={grid2}>
            <ActionCard title={ptBR.backendOps.buttons.reviseMarketResearch} tone="warm" onClick={submitReviseMarketResearch} loading={state.loading} />
            <ActionCard title={ptBR.backendOps.buttons.reviseContentPlan} tone="warm" onClick={submitReviseContentPlan} loading={state.loading} />
            <ActionCard title={ptBR.backendOps.buttons.reviseSchedule} tone="warm" onClick={submitReviseSchedule} loading={state.loading} />
          </div>
          <div style={grid2}>
            <Field label={ptBR.backendOps.fields.scheduleStart} value={scheduleStartDate} onChange={setScheduleStartDate} />
            <Field label={ptBR.backendOps.fields.scheduleEnd} value={scheduleEndDate} onChange={setScheduleEndDate} />
          </div>
          <div style={grid2}>
            <Field label={ptBR.backendOps.fields.monitoringStart} value={monitoringStartDate} onChange={setMonitoringStartDate} />
            <Field label={ptBR.backendOps.fields.monitoringEnd} value={monitoringEndDate} onChange={setMonitoringEndDate} />
          </div>
          <div style={grid2}>
            <Field label={ptBR.backendOps.fields.approvalArtifactId} value={approvalArtifactId} onChange={setApprovalArtifactId} />
            <Select
              label={ptBR.backendOps.fields.approvalStatus}
              value={approvalStatus}
              options={[
                { label: ptBR.backendOps.statuses.pending, value: "pending" },
                { label: ptBR.backendOps.statuses.approved, value: "approved" },
                { label: ptBR.backendOps.statuses.rejected, value: "rejected" },
              ]}
              onChange={(value) => setApprovalStatus(value as "pending" | "approved" | "rejected")}
            />
          </div>
          <div style={grid2}>
            <ActionCard title={ptBR.backendOps.buttons.reviseClientRecord} tone="warm" onClick={submitReviseClientRecord} loading={state.loading} />
            <ActionCard title={ptBR.backendOps.buttons.reviseProposal} tone="warm" onClick={submitReviseProposal} loading={state.loading} />
          </div>
          <div style={grid2}>
            <ActionCard title={ptBR.backendOps.buttons.reviseMonitoring} tone="warm" onClick={submitReviseMonitoring} loading={state.loading} />
            <ActionCard title={ptBR.backendOps.buttons.updateApproval} tone="success" onClick={submitUpdateApproval} loading={state.loading} />
          </div>
          <Select
            label={ptBR.backendOps.fields.approvalArtifactType}
            value={approvalArtifactType}
            options={[
              { label: ptBR.backendOps.selects.artifactClientRecord, value: "client_record" },
              { label: ptBR.backendOps.selects.artifactMarketResearch, value: "market_research" },
              { label: ptBR.backendOps.selects.artifactProposal, value: "proposal" },
              { label: ptBR.backendOps.selects.artifactContentPlan, value: "content_plan" },
              { label: ptBR.backendOps.selects.artifactContentPackage, value: "content_production_package" },
              { label: ptBR.backendOps.selects.artifactSchedule, value: "schedule" },
            ]}
            onChange={setApprovalArtifactType}
          />
          <Select
            label={ptBR.backendOps.fields.approvalUpdateStatus}
            value={approvalUpdateStatus}
            options={[
              { label: ptBR.backendOps.statuses.pending, value: "pending" },
              { label: ptBR.backendOps.statuses.approved, value: "approved" },
              { label: ptBR.backendOps.statuses.rejected, value: "rejected" },
            ]}
            onChange={(value) => setApprovalUpdateStatus(value as "pending" | "approved" | "rejected")}
          />
        </div>
      </Block>

      <Block title="Publicação" subtitle="Execução local com validação, registro e saída simulada">
        <div style={grid2}>
          <ActionCard title="Executar dry-run" onClick={submitPublishingDryRun} loading={state.loading} tone="warm" />
          <ActionCard title="Executar live" onClick={submitPublishingLive} loading={state.loading} tone="success" />
        </div>

        <div style={summaryGrid}>
          <Metric label="Execução atual" value={state.publishingExecution ? translateStatusLabel(state.publishingExecution.status) : "nenhuma"} />
          <Metric label="Modo" value={state.publishingExecution?.mode ?? "n/a"} />
          <Metric label="Canais" value={publishingPlatformCount} />
          <Metric label="Histórico" value={state.publishingExecutions.length} />
          <Metric label="Bloqueios" value={publishingValidationDetails?.blockers?.length ?? 0} />
          <Metric label="Avisos" value={publishingValidationDetails?.warnings?.length ?? 0} />
        </div>

        <ArtifactSummaryCard
          title="Fila de publicação"
          subtitle={publishingPayload?.contentRhythm ?? ptBR.backendOps.dataCards.noInsights}
          metrics={[
            { label: "Plano", value: publishingPayload?.contentPlanVersion ?? "n/a" },
            { label: "Pacote", value: publishingPayload?.contentPackageVersion ?? "n/a" },
            { label: "Agenda", value: publishingPayload?.scheduleVersion ?? "n/a" },
            { label: "Plataformas", value: publishingPayload?.targetPlatforms?.length ?? 0 },
          ]}
          bullets={[
            ...(publishingValidationDetails?.warnings ?? []),
            ...(publishingValidationDetails?.blockers ?? []),
          ].slice(0, 4)}
        />

        <ArtifactSummaryCard
          title="Resultado da execução"
          subtitle={publishingResultDetails?.deliveryMode ?? ptBR.backendOps.dataCards.noInsights}
          metrics={[
            { label: "Status", value: publishingResultDetails?.status ?? "n/a" },
            { label: "Publicada", value: publishingResultDetails?.publishedAt ? "sim" : "não" },
            { label: "Avisos", value: publishingResultDetails?.executionSummary?.warnings?.length ?? 0 },
          ]}
          bullets={[
            ...(publishingResultDetails?.executionSummary?.blockers ?? []),
            publishingResultDetails?.notes ? `Notas: ${publishingResultDetails.notes}` : null,
          ].filter((item): item is string => Boolean(item))}
        />
      </Block>

      <Block title={ptBR.backendOps.data} subtitle={ptBR.backendOps.dataSubtitle}>
        <DisplayModeToggle
          label={ptBR.backendOps.dataMode.label}
          value={dataDisplayMode}
          options={[
            { label: ptBR.backendOps.dataMode.summary, value: "summary" },
            { label: ptBR.backendOps.dataMode.raw, value: "raw" },
          ]}
          onChange={setDataDisplayMode}
        />
        <Select
          label={ptBR.backendOps.fields.agency}
          value={selectedAgencyId}
          options={state.agencies.map((agency) => ({ label: `${agency.name} (${translateAgencyRole(agency.role)})`, value: agency.id }))}
          onChange={(value) => setState((prev) => ({ ...prev, selectedAgencyId: value }))}
        />

          <Select
            label={ptBR.backendOps.fields.client}
            value={selectedClient?.id ?? ""}
            options={state.clients.map((client) => ({ label: client.name, value: client.id }))}
            onChange={(value) => {
              setState((prev) => ({ ...prev, selectedClientId: value }));
              writeSelectedClientId(value);
              if (selectedAgencyId) {
                void reloadWorkspace(selectedAgencyId, value);
              }
            }}
          />
        {dataDisplayMode === "summary" ? (
          <div style={dataSummaryStack}>
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.snapshot}
              subtitle={ptBR.backendOps.dataCards.snapshotSubtitle}
              metrics={[
                { label: ptBR.backendOps.dataCards.confidence, value: state.snapshot?.confidence ?? 0 },
                { label: ptBR.backendOps.dataCards.presence, value: state.snapshot?.presence_score ?? "n/a" },
                { label: ptBR.backendOps.dataCards.consistency, value: state.snapshot?.consistency_score ?? "n/a" },
                { label: ptBR.backendOps.dataCards.proof, value: state.snapshot?.proof_score ?? "n/a" },
                { label: ptBR.backendOps.dataCards.readiness, value: state.snapshot?.conversion_readiness ?? "n/a" },
              ]}
              bullets={formatCompactList(state.snapshot?.main_gaps_json, ptBR.backendOps.dataCards.noInsights)}
            />
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.marketResearch}
              subtitle={marketResearchPayload?.market?.summary ?? ptBR.backendOps.dataCards.noInsights}
              metrics={[
                { label: ptBR.backendOps.dataCards.stage, value: marketResearchPayload?.market?.stage ?? "n/a" },
                { label: ptBR.backendOps.dataCards.competitors, value: marketResearchPayload?.competition?.competitorCount ?? 0 },
                { label: ptBR.backendOps.dataCards.angles, value: marketResearchPayload?.recommendations?.contentAngles?.length ?? 0 },
              ]}
              bullets={marketResearchPayload?.recommendations?.differentiators ?? []}
            />
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.clientRecord}
              subtitle={clientRecordPayload?.narrative?.summary ?? ptBR.backendOps.dataCards.noInsights}
              metrics={[
                { label: ptBR.backendOps.dataCards.archetype, value: clientRecordPayload?.diagnosis?.archetype ?? "n/a" },
                { label: ptBR.backendOps.dataCards.gaps, value: clientRecordPayload?.diagnosis?.mainGaps?.length ?? 0 },
                { label: ptBR.backendOps.dataCards.opportunities, value: clientRecordPayload?.diagnosis?.opportunityNotes?.length ?? 0 },
              ]}
              bullets={compactClientRecordBulletList(clientRecordPayload)}
            />
            <ArtifactSummaryCard
              title="Marca do cliente"
              subtitle={extractProfileText(state.brandProfile, "Sem brand profile consolidado")}
              metrics={[
                { label: "Versão", value: extractProfileMetric(state.brandProfile, "version") ?? "n/a" },
                { label: "Status", value: extractProfileMetric(state.brandProfile, "status") ?? "n/a" },
                { label: "Confiança", value: extractProfileMetric(state.brandProfile, "confidence") ?? "n/a" },
              ]}
              bullets={extractProfileBullets(state.brandProfile)}
            />
            <ArtifactSummaryCard
              title="Oferta ativa"
              subtitle={extractProfileText(state.offerProfile, "Sem offer profile consolidado")}
              metrics={[
                { label: "Produto", value: state.primaryProduct?.name ?? state.activeProduct?.name ?? "n/a" },
                { label: "Status", value: state.primaryProduct?.status ?? state.activeProduct?.status ?? "n/a" },
                { label: "Versão", value: extractProfileMetric(state.offerProfile, "version") ?? "n/a" },
              ]}
              bullets={extractProfileBullets(state.offerProfile)}
            />
            <ArtifactSummaryCard
              title="Direção criativa"
              subtitle={extractProfileText(state.creativeProfile, "Sem creative profile consolidado")}
              metrics={[
                { label: "Versão", value: extractProfileMetric(state.creativeProfile, "version") ?? "n/a" },
                { label: "Status", value: extractProfileMetric(state.creativeProfile, "status") ?? "n/a" },
                { label: "Confiança", value: extractProfileMetric(state.creativeProfile, "confidence") ?? "n/a" },
              ]}
              bullets={extractProfileBullets(state.creativeProfile)}
            />
            <ArtifactSummaryCard
              title="Brief comercial da proposta"
              subtitle={proposalBrief?.summary ?? "Sem brief comercial consolidado"}
              metrics={[
                { label: "Público", value: proposalBrief?.targetAudience ?? "n/a" },
                { label: "UVP", value: proposalBrief?.uniqueValueProposition ?? "n/a" },
                { label: "CTA", value: proposalBrief?.ctaRecommendation ?? "n/a" },
              ]}
              bullets={[
                ...(proposalBrief?.buyerPersonas ?? []),
                ...(proposalBrief?.proofAssets ?? []),
                proposalBrief?.brandArchetype ?? null,
                proposalBrief?.visualDirection ?? null,
              ].filter((item): item is string => Boolean(item))}
            />
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.contentPlan}
              subtitle={contentPlanPayload?.marketSummary ?? ptBR.backendOps.dataCards.noInsights}
              metrics={[
                { label: ptBR.backendOps.dataCards.rhythm, value: contentPlanPayload?.contentRhythm ?? "n/a" },
                { label: ptBR.backendOps.dataCards.stage, value: contentPlanPayload?.marketStage ?? "n/a" },
                { label: ptBR.backendOps.dataCards.pautas, value: state.editorialPautas.length },
              ]}
              bullets={state.editorialPautas.slice(0, 4).map((pauta) => pauta.title)}
            />
            <ArtifactSummaryCard
              title="Direção visual do pacote"
              subtitle={contentPackagePayload?.visualDirection?.productImagePolicy ?? ptBR.backendOps.dataCards.noInsights}
              metrics={[
                { label: "Mecanismo", value: contentPackagePayload?.visualDirection?.mechanism ?? "n/a" },
                { label: "Canal mestre", value: contentPackagePayload?.visualDirection?.masterAsset ?? "n/a" },
                { label: "Suporte", value: contentPackagePayload?.visualDirection?.supportChannels?.length ?? 0 },
                { label: "Primeiro passe", value: contentPackagePayload?.visualDirection?.firstPass ?? "n/a" },
              ]}
              bullets={contentPackagePayload?.visualDirection?.rules ?? [ptBR.backendOps.dataCards.noInsights]}
            />
            {renderedAssetPayload ? (
              <div style={previewStyle}>
                <div style={blockTitleStyle}>Render final</div>
                <ArtifactSummaryCard
                  title="Manifesto renderizado"
                  subtitle={renderedAssetPayload.summary ?? "Render finalizado a partir da direção visual e da agenda"}
                  metrics={[
                    { label: "Engine", value: renderedAssetPayload.renderEngine ?? "playwright" },
                    { label: "Formato", value: renderedAssetPayload.assetFormat ?? "png" },
                    { label: "Package", value: renderedAssetPayload.contentPackageVersion ?? "n/a" },
                    { label: "Schedule", value: renderedAssetPayload.scheduleVersion ?? "n/a" },
                  ]}
                  bullets={
                    renderedAssetPayload.workflow?.trail?.map((agent) => `${agent.label ?? agent.id ?? "agent"} · ${agent.output ?? "n/a"}`) ?? [
                      "Render sem trilha de workflow disponível.",
                    ]
                  }
                />
                <div
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  {renderedAssetPayload.previewDataUrl ? (
                    <img
                      src={renderedAssetPayload.previewDataUrl}
                      alt="Preview do render final"
                      style={{ display: "block", width: "100%", height: "auto" }}
                    />
                  ) : (
                    <div style={{ padding: 16, fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                      Preview não disponível para este render.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.monitoringReport}
              subtitle={monitoringReportPayload?.title ?? ptBR.backendOps.dataCards.noInsights}
              metrics={[
                { label: ptBR.backendOps.dataCards.rhythm, value: monitoringReportPayload?.contentRhythm ?? "n/a" },
                { label: ptBR.backendOps.dataCards.items, value: monitoringReportPayload?.scheduleItems?.length ?? 0 },
                { label: ptBR.backendOps.dataCards.signals, value: monitoringReportPayload?.signals?.interpretations?.length ?? 0 },
              ]}
              bullets={monitoringReportPayload?.signals?.interpretations ?? []}
            />
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.monitoringSchedule}
              subtitle={monitoringSchedulePayloadPreview?.cadence ?? ptBR.backendOps.dataCards.noInsights}
              metrics={[
                { label: ptBR.backendOps.dataCards.items, value: monitoringSchedulePayloadPreview?.items?.length ?? 0 },
                { label: ptBR.backendOps.dataCards.pautas, value: monitoringSchedulePayloadPreview?.editorialPautas?.length ?? 0 },
                { label: ptBR.backendOps.dataCards.version, value: state.monitoringSchedule?.version ?? 0 },
              ]}
              bullets={monitoringSchedulePayloadPreview?.items?.slice(0, 4).map((item) => item.title ?? "Item sem título") ?? []}
            />
            <ArtifactSummaryCard
              title={ptBR.backendOps.previews.approvals}
              subtitle={ptBR.backendOps.dataCards.approvalsSubtitle}
              metrics={[
                { label: ptBR.backendOps.dataCards.total, value: state.approvals.length },
                { label: ptBR.backendOps.dataCards.pending, value: state.approvals.filter((approval) => approval.status === "pending").length },
                { label: ptBR.backendOps.dataCards.closed, value: state.approvals.filter((approval) => approval.status !== "pending").length },
              ]}
              bullets={state.approvals.slice(0, 4).map((approval) => `${approval.artifact_type} · ${approval.status}`)}
            />
          </div>
        ) : null}
        {dataDisplayMode === "raw" ? (
          <>
            <JsonPreview title={ptBR.backendOps.previews.snapshot} value={state.snapshot} />
            <JsonPreview title={ptBR.backendOps.previews.marketResearch} value={state.marketResearch} />
            <JsonPreview title={ptBR.backendOps.previews.clientRecord} value={state.clientRecord} />
            <JsonPreview title="Brand profile" value={state.brandProfile} />
            <JsonPreview title="Offer profile" value={state.offerProfile} />
            <JsonPreview title="Creative profile" value={state.creativeProfile} />
            <JsonPreview title={ptBR.backendOps.previews.proposals} value={state.proposals} />
            <JsonPreview title="Proposal brief" value={proposalBrief} />
            <JsonPreview title={ptBR.backendOps.previews.contentPlan} value={state.contentPlan} />
            <JsonPreview title={ptBR.backendOps.previews.editorialPautas} value={state.editorialPautas} />
            <JsonPreview title={ptBR.backendOps.previews.contentPackage} value={state.contentPackage} />
            <JsonPreview title={ptBR.backendOps.previews.contentPackages} value={state.contentPackages} />
            <JsonPreview title="Rendered asset" value={state.renderedAsset} />
            <JsonPreview title="Rendered assets" value={state.renderedAssets} />
            <JsonPreview title="Post art gallery" value={state.postArtGallery} />
            <JsonPreview title={ptBR.backendOps.previews.schedules} value={state.schedules} />
            <JsonPreview title="Publishing" value={state.publishingExecution} />
            <JsonPreview title="Publishing executions" value={state.publishingExecutions} />
            <JsonPreview title={ptBR.backendOps.previews.monitoringReport} value={state.latestReport} />
            <JsonPreview title={ptBR.backendOps.previews.monitoringSchedule} value={state.monitoringSchedule} />
            <JsonPreview title={ptBR.backendOps.previews.monitoringContentPlanPayload} value={state.monitoringContentPlanPayload} />
            <JsonPreview title={ptBR.backendOps.previews.monitoringSchedulePayload} value={state.monitoringSchedulePayload} />
            <JsonPreview title={ptBR.backendOps.previews.approvals} value={state.approvals} />
          </>
        ) : null}
      </Block>
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  ready,
  user,
}: {
  title: string;
  subtitle: string;
  ready: ReadyResponse | null;
  user: User | null;
}) {
  return (
    <div style={headerStyle}>
      <div>
        <div style={titleStyle}>{title}</div>
        <div style={subtitleStyle}>{subtitle}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={statusStyle}>{ready?.databaseConnected ? ptBR.backendOps.statuses.ready : ptBR.backendOps.statuses.offline}</div>
        <div style={subtitleStyle}>{user ? `${user.name} · ${user.email}` : ptBR.backendOps.statuses.noSession}</div>
      </div>
    </div>
  );
}

function Block({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={blockStyle}>
      <div style={blockHeaderStyle}>
        <div style={blockTitleStyle}>{title}</div>
        {subtitle ? <div style={blockSubtitleStyle}>{subtitle}</div> : null}
      </div>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} style={textareaStyle} />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle}>
        <option value="">{ptBR.backendOps.selects.select}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionCard({
  title,
  onClick,
  loading,
  tone = "primary",
}: {
  title: string;
  onClick: () => void;
  loading: boolean;
  tone?: "primary" | "warm" | "success";
}) {
  return (
    <button type="button" onClick={onClick} style={actionButtonStyle(tone)}>
      {loading ? ptBR.backendOps.statuses.loading : title}
    </button>
  );
}

function translateAgencyRole(role?: string): string {
  switch (role) {
    case "owner":
      return ptBR.backendOps.selects.roleOwner;
    case "admin":
      return ptBR.backendOps.selects.roleAdmin;
    case "member":
      return ptBR.backendOps.selects.roleMember;
    default:
      return role ?? ptBR.backendOps.selects.roleMember;
  }
}

function translateStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return ptBR.backendOps.statuses.pending;
    case "approved":
      return ptBR.backendOps.statuses.approved;
    case "rejected":
      return ptBR.backendOps.statuses.rejected;
    case "draft":
      return ptBR.backendOps.statuses.draft;
    case "published":
      return ptBR.backendOps.statuses.published;
    case "dry_run_passed":
      return "Dry-run aprovado";
    case "blocked":
      return "Bloqueado";
    case "queued":
      return "Na fila";
    case "failed":
      return "Falhou";
    case "archived":
      return ptBR.backendOps.statuses.archived;
    case "none":
      return ptBR.backendOps.statuses.none;
    default:
      return status;
  }
}

function formatAnalysisStatus(status: string): string {
  switch (status) {
    case "complete":
      return "Concluída";
    case "partial":
      return "Parcial";
    case "failed":
      return "Falhou";
    case "running":
      return "Em execução";
    case "queued":
      return "Na fila";
    case "none":
      return "Sem análise";
    default:
      return status;
  }
}

function translateTranscriptStatus(status: string): string {
  switch (status) {
    case "available":
      return "Transcrição disponível";
    case "missing":
      return "Transcrição ausente";
    case "unavailable":
      return "Transcrição indisponível";
    case "error":
      return "Erro na transcrição";
    default:
      return status;
  }
}

function translateYoutubeProcessingStatus(status: string): string {
  switch (status) {
    case "reused":
      return "Reutilizado";
    case "changed":
      return "Reprocessado";
    case "new":
      return "Novo";
    default:
      return status;
  }
}

function parseClientRecordPayload(payload: unknown): ClientRecordPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as ClientRecordPayload;
}

function parseMarketResearchPayload(payload: unknown): MarketResearchPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as MarketResearchPayload;
}

function parseContentPlanPayload(payload: unknown): ContentPlanPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as ContentPlanPayload;
}

function parseContentPackagePayload(payload: unknown): ContentPackagePayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as ContentPackagePayload;
}

function parseRenderedAssetPayload(payload: unknown): RenderedAssetPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as RenderedAssetPayload;
}

function parseMonitoringPayload(payload: unknown): MonitoringPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as MonitoringPayload;
}

function parseSchedulePayload(payload: unknown): SchedulePayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as SchedulePayload;
}

function parsePublishingPayload(payload: unknown): PublishingPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as PublishingPayload;
}

function parsePublishingObject(payload: unknown): Record<string, unknown> | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function extractProfileText(profile: unknown, fallback: string): string {
  const record = asRecord(profile);

  if (!record) {
    return fallback;
  }

  const directSummary = asString(record.summary);
  if (directSummary) {
    return directSummary;
  }

  const confirmed = asRecord(record.confirmed_json);
  const inferred = asRecord(record.inferred_json);
  const proof = asRecord(record.proof_json);

  return (
    asString(inferred?.summary) ??
    asString(confirmed?.summary) ??
    asString(proof?.summary) ??
    fallback
  );
}

function extractProfileMetric(profile: unknown, key: "version" | "status" | "confidence"): string | number | null {
  const record = asRecord(profile);

  if (!record) {
    return null;
  }

  const value = record[key];

  if (key === "version" || key === "confidence") {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  return asString(value);
}

function extractProfileBullets(profile: unknown): string[] {
  const record = asRecord(profile);

  if (!record) {
    return [];
  }

  const confirmed = asRecord(record.confirmed_json);
  const inferred = asRecord(record.inferred_json);
  const proof = asRecord(record.proof_json);
  const arrays = [confirmed?.proofPoints, inferred?.proofGaps, proof?.proofPoints, proof?.proofGaps];

  return arrays
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 4);
}

function extractProposalBrief(payload: unknown): ProposalBriefSummary | null {
  const record = asRecord(payload);
  const brief = asRecord(record?.proposalBrief);

  if (!brief) {
    return null;
  }

  return {
    summary: asString(brief.summary),
    targetAudience: asString(brief.targetAudience),
    buyerPersonas: Array.isArray(brief.buyerPersonas)
      ? brief.buyerPersonas.map((item) => asString(item)).filter((item): item is string => Boolean(item))
      : [],
    uniqueValueProposition: asString(brief.uniqueValueProposition),
    brandArchetype: asString(brief.brandArchetype),
    objectionsToAddress: Array.isArray(brief.objectionsToAddress)
      ? brief.objectionsToAddress.map((item) => asString(item)).filter((item): item is string => Boolean(item))
      : [],
    proofAssets: Array.isArray(brief.proofAssets)
      ? brief.proofAssets.map((item) => asString(item)).filter((item): item is string => Boolean(item))
      : [],
    ctaRecommendation: asString(brief.ctaRecommendation),
    visualDirection: asString(brief.visualDirection),
    logoTreatment: asString(brief.logoTreatment),
    productImageryDirection: asString(brief.productImageryDirection),
    proposalAngle: asString(brief.proposalAngle),
  };
}

function formatCompactList(value: unknown, fallback: string): string[] {
  if (!Array.isArray(value)) {
    return [fallback];
  }

  const items = value
    .map((item) => (typeof item === "string" ? item : null))
    .filter((item): item is string => Boolean(item))
    .slice(0, 4);

  return items.length > 0 ? items : [fallback];
}

function formatStrategyActionPlanForClipboard(input: {
  clientName: string;
  objective: string;
  productContext: string;
  serviceContext: string;
  audienceContext: string;
  actionPlan: CampaignActionPlan;
}) {
  const lines: string[] = [
    `Plano de campanha - ${input.clientName}`,
    "",
    `Objetivo: ${input.objective || "não informado"}`,
    `Foco: ${input.actionPlan.focus}`,
    `Estágio: ${input.actionPlan.stage}`,
    `Cadência semanal: ${input.actionPlan.weeklyCadence}`,
    `CTA central: ${input.actionPlan.ctaFocus}`,
    "",
    "Contexto",
    `- Produto: ${input.productContext || "não informado"}`,
    `- Serviço: ${input.serviceContext || "não informado"}`,
    `- Público: ${input.audienceContext || "não informado"}`,
    "",
    "Mistura de formatos",
    ...input.actionPlan.contentMix.map((item) => `- ${item.format} (${item.frequency}) - ${item.purpose}`),
    "",
    "Ações da semana",
    ...input.actionPlan.weeklyActions.map((item) => `- ${item}`),
    "",
    "Agenda semanal",
    ...input.actionPlan.weeklyAgenda.flatMap((item) => [
      `${item.day} - ${item.title}`,
      `  Formato: ${item.format}`,
      `  Gancho: ${item.hook}`,
      `  Estrutura: ${item.structure}`,
      `  Texto-base: ${item.copy}`,
      `  Legenda: ${item.caption}`,
      `  Entregável: ${item.deliverable}`,
      `  Objetivo: ${item.objective}`,
      `  CTA final: ${item.finalCta}`,
      `  Variações A/B`,
      ...item.variants.map((variant) => `    ${variant.label} - ${variant.angle}`),
      ...item.variants.flatMap((variant) => [
        `    ${variant.label} Gancho: ${variant.hook}`,
        `    ${variant.label} Texto-base: ${variant.copy}`,
        `    ${variant.label} CTA final: ${variant.finalCta}`,
      ]),
    ]),
    "",
    "Prioridades de produção",
    ...input.actionPlan.productionPriorities.map((item) => `- ${item}`),
    "",
    "Próximos testes",
    ...input.actionPlan.nextTests.map((item) => `- ${item}`),
    "",
    "Notas de distribuição",
    ...input.actionPlan.distributionNotes.map((item) => `- ${item}`),
  ];

  return lines.join("\n");
}

function compactClientRecordBulletList(payload: ClientRecordPayload | null): string[] {
  if (!payload) {
    return [];
  }

  const bullets: string[] = [];

  if (payload.diagnosis?.marketResearch?.summary) {
    bullets.push(payload.diagnosis.marketResearch.summary);
  }

  if (payload.diagnosis?.mainGaps?.length) {
    bullets.push(...payload.diagnosis.mainGaps.slice(0, 3));
  }

  if (payload.diagnosis?.opportunityNotes?.length) {
    bullets.push(...payload.diagnosis.opportunityNotes.slice(0, 2));
  }

  return bullets.slice(0, 5);
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={metricStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
    </div>
  );
}

function JsonPreview({ title, value }: { title: string; value: unknown }) {
  return (
    <div style={previewStyle}>
      <div style={blockTitleStyle}>{title}</div>
      <pre style={preStyle}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

function InlineAlert({ message }: { message: string }) {
  return <div style={alertStyle}>{message}</div>;
}

function VideoAnalysisCard({
  video,
  index,
}: {
  video: NonNullable<YoutubeStrategyPayload["videos"]>[number];
  index: number;
}) {
  return (
    <div style={videoCardStyle}>
      <div style={videoCardTopRow}>
        <div style={videoIndexStyle}>{String(index).padStart(2, "0")}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={videoTitleStyle}>{video.title ?? "Vídeo sem título retornado"}</div>
          <div style={videoMetaStyle}>{video.transcript?.language ?? "idioma desconhecido"} · {video.transcript?.segmentCount ?? 0} segmentos · {video.transcript?.characterCount ?? 0} caracteres</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <div style={videoTranscriptBadge(video.transcript?.status ?? "missing")}>{translateTranscriptStatus(video.transcript?.status ?? "missing")}</div>
          {video.processing?.status ? (
            <div style={videoProcessingBadge(video.processing.status)}>{translateYoutubeProcessingStatus(video.processing.status)}</div>
          ) : null}
        </div>
      </div>
      <div style={videoBodyGrid}>
        <div style={videoMiniCard}>
          <div style={videoMiniLabel}>Tese</div>
          <div style={videoMiniText}>{video.thesis ?? "Não inferida"}</div>
        </div>
        <div style={videoMiniCard}>
          <div style={videoMiniLabel}>Resumo</div>
          <div style={videoMiniText}>{video.summary ?? "Sem resumo disponível."}</div>
        </div>
      </div>
      {video.processing?.reason ? <div style={videoProcessingNote}>{video.processing.reason}</div> : null}
      <div style={videoTagRow}>
        {(video.strategies ?? []).slice(0, 3).map((strategy) => (
          <span key={`${strategy.label}-${strategy.rationale ?? ""}`} style={pillStyle}>{strategy.label}</span>
        ))}
      </div>
      <div style={videoUrlRow}>
        <a href={video.originalUrl ?? video.canonicalUrl ?? "#"} target="_blank" rel="noreferrer" style={videoLinkStyle}>
          Abrir fonte
        </a>
      </div>
    </div>
  );
}

function InfoListCard({
  title,
  items,
  emptyLabel = "Sem itens.",
  tone = "default",
}: {
  title: string;
  items: string[];
  emptyLabel?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div style={infoCardStyle(tone)}>
      <div style={infoCardTitleStyle}>{title}</div>
      {items.length > 0 ? (
        <ul style={infoListStyle}>
          {items.slice(0, 5).map((item) => (
            <li key={item} style={infoListItemStyle(tone)}>{item}</li>
          ))}
        </ul>
      ) : (
        <div style={infoEmptyStyle}>{emptyLabel}</div>
      )}
    </div>
  );
}

function BadgeCloudCard({
  title,
  subtitle,
  badges,
}: {
  title: string;
  subtitle: string;
  badges: string[];
}) {
  return (
    <div style={infoCardStyle("default")}>
      <div style={infoCardTitleStyle}>{title}</div>
      <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>{subtitle}</div>
      {badges.length > 0 ? (
        <div style={badgeCloudStyle}>
          {badges.map((badge) => (
            <span key={badge} style={badgeChipStyle(badge)}>
              {badge}
            </span>
          ))}
        </div>
      ) : (
        <div style={infoEmptyStyle}>Nenhum nome disponível.</div>
      )}
    </div>
  );
}

function RankedListCard({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: Array<{ businessType?: string; score?: number; reason?: string }>;
  tone?: "default" | "subtle";
}) {
  return (
    <div style={rankCardStyle(tone)}>
      <div style={infoCardTitleStyle}>{title}</div>
      <div style={rankListStyle}>
        {items.slice(0, 3).map((item, index) => (
          <div key={`${item.businessType ?? title}-${index}`} style={rankItemStyle(tone)}>
            <div style={rankItemHeaderStyle}>
              <span style={rankIndexStyle}>{String(index + 1)}</span>
              <span style={rankBusinessTypeStyle}>{item.businessType ?? "N/A"}</span>
              <span style={rankScoreStyle}>{item.score ?? 0}</span>
            </div>
            <div style={rankReasonStyle}>{item.reason ?? "Sem justificativa."}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  width: 420,
  minWidth: 420,
  height: "100%",
  overflowY: "auto",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.08), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  padding: 16,
  display: "grid",
  gap: 16,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  padding: "14px 15px",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: 0.4,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  marginTop: 4,
  lineHeight: 1.45,
};

const statusStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--accent-cyan)",
};

const blockStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  background: "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
  padding: 15,
  display: "grid",
  gap: 12,
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const analysisSummaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
  gap: 10,
};

const analysisHeroCard: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(0, 212, 255, 0.18)",
  background: "linear-gradient(180deg, rgba(0, 212, 255, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%)",
};

const analysisHeroEyebrow: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  color: "var(--accent-cyan)",
};

const analysisHeroTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  lineHeight: 1.45,
  color: "var(--text-primary)",
};

const analysisHeroBody: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.6,
  color: "var(--text-secondary)",
};

const analysisSplitGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 10,
};

const analysisRankGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 10,
};

const analysisComparisonGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const analysisVideoStack: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const badgeCloudStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const badgeChipStyle = (label: string): React.CSSProperties => {
  const normalized = label.toLowerCase();
  const palette =
    normalized.includes("autoridade")
      ? { border: "rgba(0, 212, 255, 0.22)", background: "rgba(0, 212, 255, 0.12)", color: "var(--accent-cyan)" }
      : normalized.includes("educa")
        ? { border: "rgba(84, 214, 144, 0.24)", background: "rgba(84, 214, 144, 0.12)", color: "#73e0a4" }
        : normalized.includes("convers")
          ? { border: "rgba(255, 196, 61, 0.24)", background: "rgba(255, 196, 61, 0.12)", color: "#ffd36d" }
          : normalized.includes("escala")
            ? { border: "rgba(155, 114, 255, 0.24)", background: "rgba(155, 114, 255, 0.12)", color: "#c4a3ff" }
            : { border: "rgba(255, 120, 120, 0.24)", background: "rgba(255, 120, 120, 0.12)", color: "#ff9b9b" };

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    borderRadius: 999,
    border: `1px solid ${palette.border}`,
    background: palette.background,
    color: palette.color,
    fontSize: 11,
    lineHeight: 1.2,
    fontWeight: 700,
  };
};

const videoCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.2)",
  display: "grid",
  gap: 10,
};

const videoCardTopRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const videoIndexStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 9,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg, rgba(0, 212, 255, 0.22) 0%, rgba(0, 212, 255, 0.1) 100%)",
  color: "var(--accent-cyan)",
  fontWeight: 800,
  fontSize: 12,
  flex: "0 0 auto",
};

const videoTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-primary)",
  lineHeight: 1.45,
};

const videoMetaStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-secondary)",
  marginTop: 4,
};

const videoTranscriptBadge = (status: string): React.CSSProperties => ({
  flex: "0 0 auto",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  padding: "6px 8px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
  color: status === "available" ? "var(--accent-cyan)" : "rgba(255,255,255,0.72)",
  background: status === "available" ? "rgba(0, 212, 255, 0.08)" : "rgba(255,255,255,0.04)",
});

const videoProcessingBadge = (status: string): React.CSSProperties => {
  const normalized = status.toLowerCase();

  return {
    flex: "0 0 auto",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    padding: "6px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    color:
      normalized === "reused"
        ? "var(--accent-cyan)"
        : normalized === "changed"
          ? "#ffcc66"
          : "rgba(255,255,255,0.72)",
    background:
      normalized === "reused"
        ? "rgba(0, 212, 255, 0.08)"
        : normalized === "changed"
          ? "rgba(255, 196, 61, 0.08)"
          : "rgba(255,255,255,0.04)",
  };
};

const videoProcessingNote: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
};

const videoBodyGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const videoMiniCard: React.CSSProperties = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const videoMiniLabel: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  color: "var(--text-secondary)",
};

const videoMiniText: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.55,
  color: "var(--text-primary)",
};

const videoTagRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(0, 212, 255, 0.08)",
  border: "1px solid rgba(0, 212, 255, 0.14)",
  color: "var(--accent-cyan)",
  fontSize: 11,
  fontWeight: 600,
};

const videoUrlRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
};

const rawPayloadStack: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const rawPayloadNote: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
  padding: "2px 2px 0",
};

const dataSummaryStack: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const videoLinkStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
};

const infoCardStyle = (tone: "default" | "warning"): React.CSSProperties => ({
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: tone === "warning" ? "rgba(255, 191, 0, 0.06)" : "rgba(0,0,0,0.18)",
  display: "grid",
  gap: 10,
});

const infoCardTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.9,
  color: "rgba(225, 229, 240, 0.92)",
};

const infoListStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: 8,
};

const infoListItemStyle = (tone: "default" | "warning"): React.CSSProperties => ({
  position: "relative",
  paddingLeft: 14,
  fontSize: 12,
  lineHeight: 1.55,
  color: tone === "warning" ? "rgba(255, 236, 179, 0.95)" : "var(--text-primary)",
});

const infoEmptyStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.55,
  color: "var(--text-secondary)",
};

const rankCardStyle = (tone: "default" | "subtle"): React.CSSProperties => ({
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: tone === "subtle" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.18)",
  display: "grid",
  gap: 10,
});

const rankListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const rankItemStyle = (tone: "default" | "subtle"): React.CSSProperties => ({
  padding: 12,
  borderRadius: 14,
  background: tone === "subtle" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "grid",
  gap: 6,
});

const rankItemHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const rankIndexStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 10,
  fontWeight: 800,
  color: "var(--accent-cyan)",
  background: "rgba(0, 212, 255, 0.08)",
};

const rankBusinessTypeStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--text-primary)",
  flex: 1,
};

const rankScoreStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--accent-cyan)",
};

const rankReasonStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
};

const blockHeaderStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
};

const blockTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.9,
  color: "rgba(225, 229, 240, 0.92)",
};

const blockSubtitleStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const stack: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: 0.7,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "rgba(0,0,0,0.22)",
  color: "var(--text-primary)",
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 112,
  resize: "vertical",
};

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
};

const stageGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const stageCardStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.18)",
};

const stageIndexStyle: React.CSSProperties = {
  flex: "0 0 auto",
  width: 32,
  height: 32,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg, rgba(0, 212, 255, 0.18) 0%, rgba(0, 212, 255, 0.08) 100%)",
  color: "var(--accent-cyan)",
  fontSize: 12,
  fontWeight: 800,
};

const stageTextStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const stageTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-primary)",
};

const stageDescriptionStyle: React.CSSProperties = {
  fontSize: 11,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
};

const metricStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  background: "rgba(0,0,0,0.18)",
  padding: 12,
  minHeight: 88,
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: 0.7,
};

const metricValueStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 18,
  fontWeight: 800,
  lineHeight: 1.2,
  color: "var(--accent-cyan)",
};

const previewStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  background: "rgba(0,0,0,0.18)",
  padding: 12,
  display: "grid",
  gap: 8,
};

const preStyle: React.CSSProperties = {
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: 11,
  lineHeight: 1.55,
  color: "var(--text-primary)",
};

const alertStyle: React.CSSProperties = {
  border: "1px solid rgba(255,82,82,0.35)",
  background: "rgba(255,82,82,0.08)",
  color: "#ffc7c7",
  borderRadius: 14,
  padding: "10px 12px",
  fontSize: 12,
};

function actionButtonStyle(tone: "primary" | "warm" | "success"): React.CSSProperties {
  const toneMap = {
    primary: {
      border: "1px solid rgba(0, 212, 255, 0.32)",
      background: "linear-gradient(180deg, rgba(0, 212, 255, 0.18) 0%, rgba(0, 212, 255, 0.08) 100%)",
      glow: "0 12px 26px rgba(0, 212, 255, 0.12)",
    },
    warm: {
      border: "1px solid rgba(255, 171, 0, 0.32)",
      background: "linear-gradient(180deg, rgba(255, 171, 0, 0.16) 0%, rgba(255, 171, 0, 0.08) 100%)",
      glow: "0 12px 26px rgba(255, 171, 0, 0.12)",
    },
    success: {
      border: "1px solid rgba(0, 230, 118, 0.32)",
      background: "linear-gradient(180deg, rgba(0, 230, 118, 0.16) 0%, rgba(0, 230, 118, 0.08) 100%)",
      glow: "0 12px 26px rgba(0, 230, 118, 0.12)",
    },
  }[tone];

  return {
    width: "100%",
    borderRadius: 12,
    border: toneMap.border,
    background: toneMap.background,
    color: "var(--text-primary)",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: toneMap.glow,
  };
}
