export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    requestId?: string;
    agencyId?: string | null;
  };
};

export type Agency = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  role?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  status?: string;
};

export type Client = {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  website_url: string | null;
  segment: string | null;
  status: string;
  notes: string | null;
  parent_client_id: string | null;
  parent_client_name: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialProfile = {
  id: string;
  client_id: string;
  platform: string;
  handle: string;
  profile_url: string;
  discovery_source: string;
  status: string;
  confidence: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  category: string | null;
  offer_type: string | null;
  price_label: string | null;
  promise: string;
  problem_solved: string;
  audience: string;
  status: "draft" | "validated" | "prioritized" | "in_campaign" | "monitored" | "archived";
  priority: number;
  landing_url: string | null;
  proof_points: unknown;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OfferProfile = {
  id: string;
  version: number;
  status: string;
  confidence: number;
  summary: string | null;
  productId: string;
  productName: string;
  category: string | null;
  offerType: string | null;
  priceLabel: string | null;
  audience: string | null;
  promise: string | null;
  problemSolved: string | null;
  landingUrl: string | null;
  primaryCta: string | null;
  toneOfVoice: string | null;
  proofPoints: string[];
  proofGaps: string[];
};

export type CreativeProfile = {
  id: string | null;
  version: number;
  status: string;
  confidence: number;
  summary: string | null;
  brandName: string | null;
  website: string | null;
  targetAudience: string | null;
  buyerPersonas: string[];
  uniqueValueProposition: string | null;
  brandArchetype: string | null;
  primaryChannel: string | null;
  supportChannels: string[];
  cycleLength: string | null;
  offer: string | null;
  audience: string | null;
  tone: string | null;
  positioning: string | null;
  goalForCycle: string | null;
  visualIdentity: string | null;
  mood: string | null;
  brandFeel: string | null;
  palette: string[];
  darkPaletteAnchor: string | null;
  titleColorAnchor: string | null;
  logoUrl: string | null;
  logoTreatment: string | null;
  backgroundTreatment: string | null;
  overlayGuidance: string | null;
  imageStory: string | null;
  imageRecommendation: string | null;
  productImageryDirection: string | null;
  imageRiskLevel: string | null;
  layoutFamily: string | null;
  ctaStyle: string | null;
  proposalAngle: string | null;
  typographyDirection: string | null;
  preferredSourceClass: string | null;
  primaryMessage: string | null;
  proofPoints: string[];
  messagePillars?: string[];
  audienceSegments?: string[];
  personaHypotheses?: string[];
  productImageryTreatment?: string | null;
  draft?: boolean;
  client_id?: string;
};

export type BrandSocialProfileSnapshot = {
  platform: string;
  handle: string | null;
  profileUrl: string | null;
  status: string | null;
  confidence: number | null;
};

export type BrandSnapshot = {
  brandName: string | null;
  website: string | null;
  websiteTitle: string | null;
  websiteDescription: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  visualPalette: string[];
  socialProfiles: BrandSocialProfileSnapshot[];
  summary: string | null;
};

export type OfferSnapshot = {
  productId: string | null;
  productName: string | null;
  category: string | null;
  offerType: string | null;
  priceLabel: string | null;
  audience: string | null;
  promise: string | null;
  problemSolved: string | null;
  landingUrl: string | null;
  primaryCta: string | null;
  toneOfVoice: string | null;
  proofPoints: string[];
  proofGaps: string[];
  summary: string | null;
};

export type ClientBriefSnapshot = {
  summary: string | null;
  recommendedPositioning: string | null;
  archetype: string | null;
  note: string | null;
  websiteUrl: string | null;
  segment: string | null;
  status: string | null;
  contactEmail: string | null;
  visualPalette: string[];
  productsByDemand: boolean | null;
};

export type SocialProfileSnapshot = {
  platform: string;
  handle: string | null;
  profileUrl: string | null;
  status: string | null;
  confidence: number | null;
};

export type SocialIntelligenceSnapshot = {
  id: string;
  client_id: string;
  collected_at: string;
  public_only: boolean;
  confidence: number;
  presence_score: number | null;
  consistency_score: number | null;
  proof_score: number | null;
  conversion_readiness: number | null;
  main_gaps_json: unknown;
  opportunity_notes_json: unknown;
  raw_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialPresenceObservationStatus = "captured" | "partial" | "unavailable";

export type SocialPresenceNetworkSummary = {
  platform: string;
  handle: string | null;
  profileUrl: string;
  collectedAt: string;
  followersCount: number | null;
  followersDelta: number | null;
  postsCount: number | null;
  postsDelta: number | null;
  latestPostAt: string | null;
  observationStatus: SocialPresenceObservationStatus;
  confidence: number;
  notes: string | null;
};

export type SocialPresenceSummary = {
  summary: string;
  totalFollowers: number | null;
  totalPosts: number | null;
  lastCapturedAt: string | null;
  latestPostAt: string | null;
  networks: SocialPresenceNetworkSummary[];
};

export type SocialPresenceSnapshotRecord = {
  id: string;
  agency_id: string;
  client_id: string;
  platform: string;
  handle: string | null;
  profile_url: string;
  source_snapshot_id: string | null;
  collected_at: string;
  followers_count: number | null;
  posts_count: number | null;
  latest_post_at: string | null;
  observation_status: string;
  confidence: number;
  notes: string | null;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ClientRecord = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type MarketResearch = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type MarketPresenceBaseline = {
  id: string;
  client_id: string;
  version: number;
  scope: string;
  market_context: string;
  source_snapshot_id: string | null;
  source_client_record_id: string | null;
  source_market_research_id: string | null;
  collected_at: string;
  presence_score: number;
  consistency_score: number;
  proof_score: number;
  conversion_score: number;
  confidence_score: number;
  profiles_count: number;
  source_count: number;
  evidence_count: number;
  last_post_date: string | null;
  notes: string | null;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type MarketPresenceIntervention = {
  id: string;
  client_id: string;
  baseline_id: string;
  period_start: string;
  period_end: string;
  actions_taken_json: unknown;
  channels_edited_json: unknown;
  content_volume: number;
  cta_changes: number;
  site_changes: number;
  proof_changes: number;
  notes: string | null;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type MarketPresenceCheckpoint = {
  id: string;
  client_id: string;
  version: number;
  baseline_id: string;
  intervention_id: string | null;
  source_snapshot_id: string | null;
  source_client_record_id: string | null;
  source_market_research_id: string | null;
  collected_at: string;
  presence_score: number;
  consistency_score: number;
  proof_score: number;
  conversion_score: number;
  confidence_score: number;
  profiles_count: number;
  source_count: number;
  evidence_count: number;
  last_post_date: string | null;
  notes: string | null;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type MarketPresenceComparison = {
  id: string;
  client_id: string;
  baseline_id: string;
  checkpoint_id: string;
  presence_delta: number;
  consistency_delta: number;
  proof_delta: number;
  conversion_delta: number;
  maturity_delta: number;
  profiles_delta: number;
  source_delta: number;
  evidence_delta: number;
  reading: string;
  attribution: string;
  analogy: string;
  executive_summary: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type EditorialPauta = {
  id: string;
  title: string;
  pillar: string;
  angle: string;
  objective: string;
  reason: string;
  format: string;
  source: {
    clientRecordVersion: number;
    proposalVersion: number;
    marketResearchVersion: number | null;
  };
};

export type ContentPlan = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ContentPackage = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type Schedule = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type RenderedAsset = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  content_production_package_id: string | null;
  content_production_package_version: number | null;
  schedule_id: string | null;
  schedule_version: number | null;
  render_engine: string;
  asset_format: string;
  asset_path: string | null;
  asset_mime_type: string | null;
  asset_width: number | null;
  asset_height: number | null;
  preview_data_url: string | null;
  preview_mime_type: string | null;
  html_content: string | null;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type PostArtGalleryRecord = {
  id: string;
  client_id: string;
  version: number;
  mode: "feed_carousel" | "story" | "all" | string;
  title: string;
  summary: string;
  overall_score: number;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type PostArtGalleryComparison = {
  comparedAt: string;
  latestVersion: number;
  previousVersion: number;
  latestMode: string;
  previousMode: string;
  latestScore: number;
  previousScore: number;
  scoreDelta: number;
  latestVariantCount: number;
  previousVariantCount: number;
  variantDelta: number;
  summary: string;
  highlights: string[];
  improvements: string[];
  regressions: string[];
};

export type PostArtGallery = {
  mode: "feed_carousel" | "story" | "all";
  title: string;
  summary: string;
  clientId: string;
  clientName: string;
  contentPackageVersion: number | null;
  scheduleVersion: number | null;
  overallScore: number;
  generatedAt: string;
  variants: Array<{
    id: string;
    label: string;
    format: string;
    title: string;
    subtitle: string;
    caption: string;
    cta: string;
    channel: string;
    previewDataUrl: string;
    previewMimeType: string;
    sourceItem: {
      position: number;
      title: string;
      channel: string;
      format: string;
      pillar: string;
      angle: string;
      objective: string;
      status: string;
    } | null;
    quality: {
      totalScore: number;
      copyScore: number;
      visualScore: number;
      clarityScore: number;
      accessibilityScore: number;
      strengths: string[];
      risks: string[];
      suggestions: string[];
    };
  }>;
};

export type PublishingExecution = {
  id: string;
  client_id: string;
  schedule_id: string | null;
  mode: "dry_run" | "live" | string;
  status: string;
  platforms: unknown;
  payload_json: unknown;
  validation_json: unknown;
  result_json: unknown;
  requested_by: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Proposal = {
  id: string;
  client_id: string;
  version: number;
  archetype: string;
  thesis: string;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ClientReportResult = {
  client: Client;
  clientRecord: ClientRecord | null;
  marketResearch: MarketResearch | null;
  marketPresence: MarketPresenceResult;
  brandProfile: Record<string, unknown> | null;
  primaryProduct: Product | null;
  offerProfile: OfferProfile | null;
  offerProfiles: OfferProfile[];
  creativeProfile: CreativeProfile | null;
  creativeProfiles: CreativeProfile[];
  proposal: Proposal | null;
  monitoring: MonitoringReport | null;
  report: {
    headline: string;
    clientSummary: string;
    recommendedPositioning: string | null;
    marketSummary: string;
    marketStage: string;
    competitionSummary: string;
    beforeAfterSummary: string;
    commercialSummary: string;
    brandSummary: string;
    brandSnapshot: BrandSnapshot | null;
    briefSnapshot: ClientBriefSnapshot | null;
    offerSummary: string;
    offerSnapshot: OfferSnapshot | null;
    creativeSummary: string;
    creativeSnapshot: CreativeProfile | null;
    creativeAudience: string | null;
    creativePersonas: string[];
    creativeUVP: string | null;
    creativeLogoUrl: string | null;
    creativeProductImagery: string | null;
    operationalSummary: string;
    geographyCoverage: {
      scope: "local" | "regional" | "nacional" | "nicho";
      level: "cidade" | "região" | "país" | "nicho";
      value: string;
      city: string | null;
      region: string | null;
      country: string;
      basis: string[];
      confidence: number;
      fallback: boolean;
      summary: string;
    };
    weights: {
      client: number;
      market: number;
      competition: number;
    };
    growth: {
      summary: string;
      missing: string[];
    };
    sourceCoverage: {
      profiles: number;
      baselines: number;
      checkpoints: number;
      comparisons: number;
      proposals: number;
      monitoringReports: number;
      publicSignals: number;
      socialPresence: number;
      offerProfiles: number;
      creativeProfiles: number;
    };
    publicSignals: {
      summary: string | null;
      queryCount: number;
      sourceCount: number;
    };
    socialProfiles: SocialProfileSnapshot[];
    socialPresence: SocialPresenceSummary;
    keySignals: string[];
    missingMetrics: string[];
    sourceIds: {
      clientRecordId: string | null;
      marketResearchId: string | null;
      baselineId: string | null;
      checkpointId: string | null;
      comparisonId: string | null;
      proposalId: string | null;
      monitoringId: string | null;
      brandProfileId: string | null;
      primaryProductId: string | null;
      offerProfileId: string | null;
      creativeProfileId: string | null;
    };
  };
};

export type MonitoringReport = {
  id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type CampaignStage =
  | "intake"
  | "client_record"
  | "research"
  | "strategy"
  | "content_plan"
  | "content_production_package"
  | "schedule"
  | "approval"
  | "publish"
  | "monitoring"
  | "adjustment";

export type CampaignState = {
  stage: CampaignStage;
  nextStage: CampaignStage | null;
  nextValidStage: CampaignStage | null;
  clientRecordChangeScope: "none" | "identity" | "research" | "strategy" | "mixed";
  clientRecordChangedSections: string[];
  clientRecordChangedPaths: string[];
  clientRecordChangeDetails: Array<{
    path: string;
    section: string;
    impact: "none" | "research" | "strategy";
  }>;
  blockers: string[];
  reopenStages: CampaignStage[];
  completedStages: CampaignStage[];
  approvalsPending: number;
  approvalsApproved: number;
  currentApprovals: Array<{
    id: string;
    artifactType: string;
    status: string;
  }>;
  hasSnapshot: boolean;
  hasProfiles: boolean;
  hasClientRecord: boolean;
  clientRecordStatus: string | null;
  hasMarketResearch: boolean;
  marketResearchStatus: string | null;
  hasProposal: boolean;
  proposalStatus: string | null;
  hasContentPlan: boolean;
  contentPlanStatus: string | null;
  hasContentPackage: boolean;
  contentPackageStatus: string | null;
  hasSchedule: boolean;
  scheduleStatus: string | null;
  hasPublishingExecution: boolean;
  publishExecutionStatus: string | null;
  publishExecutionMode: string | null;
  hasMonitoring: boolean;
  monitoringStatus: string | null;
};

export type YoutubeStrategyAnalysis = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ProductsResult = {
  client: Client;
  offer?: Product;
  offers?: Product[];
  products: Product[];
};

export type ProductResult = {
  client: Client;
  offer?: Product;
  offers?: Product[];
  product: Product;
  products: Product[];
};

export type AssistantConsultationContext = {
  missingArtifacts: string[];
  pendingApprovals: number;
  approvedApprovals: number;
  contentRhythm: string | null;
  scheduleItems: number;
  editorialPautas: string[];
  monitoringObservations: string[];
  campaignState?: CampaignState;
  campaignBlockers?: string[];
  organicLaunchReadiness?: "bloqueado" | "em preparação" | "pronto";
  organicLaunchReason?: string;
  organicLaunchNextStep?: string;
  productCount?: number;
  activeProductName?: string | null;
  activeProductStatus?: string | null;
};

export type CampaignResult = {
  client: Client;
  state: CampaignState;
  context: {
    hasSnapshot: boolean;
    hasProfiles: boolean;
    hasClientRecord: boolean;
    hasMarketResearch: boolean;
    hasProposal: boolean;
    hasContentPlan: boolean;
    hasContentPackage: boolean;
    hasSchedule: boolean;
    hasPublishingExecution: boolean;
    hasMonitoring: boolean;
  };
};

export type PublishingResult = {
  client: Client;
  latestExecution: PublishingExecution | null;
  executions: PublishingExecution[];
  clientRecord: ClientRecord | null;
  contentPlan: ContentPlan | null;
  contentPackage: ContentPackage | null;
  schedule: Schedule | null;
  approvals: Approval[];
  schedulePayload: Record<string, unknown> | null;
  contentPackagePayload: Record<string, unknown> | null;
};

export type PublishingCreateResult = {
  client: Client;
  execution: PublishingExecution;
  executions: PublishingExecution[];
  payload: Record<string, unknown>;
  validation: Record<string, unknown>;
  result: Record<string, unknown>;
};

export type MarketPresenceResult = {
  client: Client;
  latestBaseline: MarketPresenceBaseline | null;
  latestIntervention: MarketPresenceIntervention | null;
  latestCheckpoint: MarketPresenceCheckpoint | null;
  latestComparison: MarketPresenceComparison | null;
  baselines: MarketPresenceBaseline[];
  interventions: MarketPresenceIntervention[];
  checkpoints: MarketPresenceCheckpoint[];
  comparisons: MarketPresenceComparison[];
  snapshot: SocialIntelligenceSnapshot | null;
  clientRecord: ClientRecord | null;
  marketResearch: MarketResearch | null;
  profiles: SocialProfile[];
};

export type AssistantConsultation = {
  client: Client;
  question: string;
  answer: string;
  summary: string;
  threadSummary: string;
  recommendations: string[];
  risks: string[];
  nextQuestions: string[];
  sources: string[];
  context: AssistantConsultationContext;
};

export type Approval = {
  id: string;
  client_id: string;
  artifact_type: string;
  artifact_id: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductEventMetrics = {
  scope: {
    agencyId: string | null;
    clientId: string | null;
  };
  windowDays: number;
  funnelStage: {
    key: "discovery" | "activation" | "adoption" | "retention" | "reactivation";
    label: string;
  };
  executiveSummary: {
    trend: string;
    signal: string;
    action: string;
    tone: "neutral" | "positive" | "warning";
  };
  shiftRate: {
    shiftCount: number;
    snapshotCount: number;
    ratePercent: number | null;
  };
  summaryHistory: Array<{
    funnelStageKey: "discovery" | "activation" | "adoption" | "retention" | "reactivation";
    funnelStageLabel: string;
    trend: string;
    signal: string;
    action: string;
    tone: "neutral" | "positive" | "warning";
    totalEvents: number;
    previousTotalEvents: number;
    totalEventsDelta: number;
    totalEventsPercent: number | null;
    createdAt: string;
  }>;
  currentPeriod: {
    start: string;
    end: string;
    aggregate: {
      totalEvents: number;
      counts: Record<string, number>;
      lastEvent: {
        eventName: string;
        clientId: string | null;
        source: string | null;
        timestamp: string;
      } | null;
    };
  };
  previousPeriod: {
    start: string;
    end: string;
    aggregate: {
      totalEvents: number;
      counts: Record<string, number>;
      lastEvent: {
        eventName: string;
        clientId: string | null;
        source: string | null;
        timestamp: string;
      } | null;
    };
  };
  change: {
    totalEventsDelta: number;
    totalEventsPercent: number | null;
  };
  topClients: Array<{
    clientId: string | null;
    clientName: string | null;
    eventCount: number;
    lastEventAt: string | null;
  }>;
};

export type ProductEventExecutiveSnapshot = ProductEventMetrics["summaryHistory"][number];

export type ReadyResponse = {
  status: "ready" | "not-ready";
  databaseConnected: boolean;
};

export type YoutubeStrategyResult = {
  client: Client;
  latestAnalysis: YoutubeStrategyAnalysis | null;
  analyses: YoutubeStrategyAnalysis[];
  evidence?: StrategyEvidenceItem[];
  videoStates?: YoutubeStrategyVideoState[];
  payload: Record<string, unknown>;
};

export type YoutubeStrategyVideoState = {
  id: string;
  client_id: string;
  video_id: string;
  canonical_url: string;
  transcript_hash: string;
  transcript_status: string;
  transcript_character_count: number;
  transcript_segment_count: number;
  last_analysis_id: string | null;
  last_analysis_version: number | null;
  last_processed_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export type StrategyEvidenceItem = {
  id: string;
  clientId: string;
  sourceAnalysisId: string | null;
  sourceVersion: number;
  kind: string;
  strategyKey: string;
  strategyName: string;
  strategySummary: string;
  sourceTitle?: string | null;
  sourceVideoId?: string | null;
  sourceOriginalUrl?: string | null;
  sourceCanonicalUrl?: string | null;
  sourceChannelName?: string | null;
  sourceChannelUrl?: string | null;
  sourceThumbnailUrl?: string | null;
  sourceUrls: string[];
  evidence: string[];
  fitSignals: string[];
};

export type StrategyRecommendationAsset = {
  id: string;
  kind: "primary" | "alternative" | "plan_b" | string;
  version: number;
  strategyName: string;
  strategySummary: string;
  fitScore: number;
  confidence: number;
  sourceAnalysisId: string | null;
  reason: string;
  fitSignals: string[];
  productContext: string | null;
  serviceContext: string | null;
  audienceContext: string | null;
  funnelStage: string | null;
  objective: string | null;
  sourceUrls: string[];
  evidence: string[];
};

export type StrategyRecommendationOption = {
  id: string;
  kind: string;
  version: number;
  strategyName: string;
  strategySummary: string;
  fitScore: number;
  confidence: number;
  sourceAnalysisId: string | null;
  reason: string;
  fitSignals: string[];
  productContext: string | null;
  serviceContext: string | null;
  audienceContext: string | null;
  funnelStage: string | null;
  objective: string | null;
  sourceUrls: string[];
  evidence: string[];
  fitBand: "recommended" | "secondary" | "not_recommended";
};

export type CampaignActionFormat = {
  format: string;
  frequency: string;
  purpose: string;
};

export type CampaignActionPlan = {
  focus: string;
  stage: string;
  summary: string;
  weeklyCadence: string;
  contentMix: CampaignActionFormat[];
  weeklyAgenda: CampaignAgendaItem[];
  weeklyActions: string[];
  productionPriorities: string[];
  ctaFocus: string;
  nextTests: string[];
  distributionNotes: string[];
};

export type CampaignAgendaItem = {
  day: string;
  title: string;
  hook: string;
  structure: string;
  copy: string;
  caption: string;
  format: string;
  deliverable: string;
  objective: string;
  finalCta: string;
  variants: CampaignAgendaVariant[];
};

export type CampaignAgendaVariant = {
  label: "A" | "B";
  angle: string;
  hook: string;
  copy: string;
  finalCta: string;
};

export type StrategyRecommendationResult = {
  title?: string | null;
  latestVersion: number;
  assets: StrategyRecommendationAsset[];
  evidence: StrategyEvidenceItem[];
  activeProduct: Product | null;
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
  recommendation: {
    primary: StrategyRecommendationAsset | null;
    alternatives: StrategyRecommendationAsset[];
    contingency: StrategyRecommendationAsset | null;
    planB: StrategyRecommendationAsset | null;
    strategyOptions: StrategyRecommendationOption[];
    actionPlan: CampaignActionPlan;
  };
  payload: Record<string, unknown>;
};
