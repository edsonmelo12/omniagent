import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSquadSocket } from "@/hooks/useSquadSocket";
import { useSquadStore } from "@/store/useSquadStore";
import { backendApi } from "@/lib/backendApi";
import { getClientRelationshipLabel } from "@/lib/clientRelationships";
import { recordOfferMetric } from "@/lib/productMetrics";
import { readSelectedClientId, subscribeSelectedClientId, writeSelectedClientId } from "@/lib/clientSelection";
import { formatElapsed } from "@/lib/formatTime";
import { lazyNamed } from "@/lib/lazyNamedComponent";
import { ptBR } from "@/i18n/pt-BR";
import { subscribeContentRefresh } from "@/lib/contentRefresh";
import type { SquadInfo, SquadState } from "@/types/state";
import type {
  CampaignResult,
  Client,
  ClientReportResult,
  ContentPackage,
  MarketPresenceResult,
  PostArtGallery,
  PostArtGalleryComparison,
  PostArtGalleryRecord,
  PublishingExecution,
  PublishingResult,
  RenderedAsset,
  Schedule,
  SocialPresenceSnapshotRecord,
  SocialIntelligenceSnapshot,
  SocialProfile,
} from "@/types/backend";
import type { SocialPresenceResult } from "@/lib/backendApi";
import { AppIcon } from "@/components/AppIcon";
import { ArtifactSummaryCard } from "@/components/ArtifactSummaryCard";
import { LoadingPanel } from "@/components/LoadingPanel";
import { EmptyStateNotice } from "@/components/EmptyStateNotice";
import { PublicSignalsBadge } from "@/components/PublicSignalsBadge";

const OfficeScene = lazyNamed(() => import("@/office/OfficeScene"), "OfficeScene");

const BackendOpsPanel = lazyNamed(() => import("@/components/BackendOpsPanel"), "BackendOpsPanel");

const AssistantConsultantPanel = lazyNamed(() => import("@/components/AssistantConsultantPanel"), "AssistantConsultantPanel");

const OfferMetricsPanel = lazyNamed(() => import("@/components/ProductMetricsPanel"), "OfferMetricsPanel");

const ClientProductsPanel = lazyNamed(() => import("@/components/ClientProductsPanel"), "ClientProductsPanel");


const NAV_ITEMS = [
  { key: "dashboard", icon: "space_dashboard", label: ptBR.dashboard.sidebar.dashboard, active: true },
  { key: "clients", icon: "switch_account", label: ptBR.dashboard.sidebar.clientManager, active: false },
  { key: "agents", icon: "smart_toy", label: ptBR.dashboard.sidebar.aiAgents, active: false },
  { key: "content", icon: "auto_awesome", label: ptBR.dashboard.sidebar.contentStudio, active: false },
  { key: "analytics", icon: "insights", label: ptBR.dashboard.sidebar.analytics, active: false },
  { key: "settings", icon: "settings", label: ptBR.dashboard.sidebar.settings, active: false },
] as const;

const SUPPORT_ITEMS = [
  { key: "support", icon: "help", label: ptBR.dashboard.sidebar.support },
  { key: "notifications", icon: "notifications", label: ptBR.dashboard.sidebar.notifications },
] as const;

type FeedItem = {
  icon: string;
  label: string;
  description: string;
  accent?: "success" | "warning" | "neutral";
};

type RenderedAssetRegenerationObjectiveKey = "conversion" | "positioning" | "creative";

type RenderedAssetRegenerationMemory = {
  objectiveKey: RenderedAssetRegenerationObjectiveKey;
  note: string;
  updatedAt: string;
};

const RENDERED_ASSET_REGENERATION_MEMORY_KEY_PREFIX = "omniagent.rendered-asset-regeneration:";
const CLIENT_REPORT_VIEW_KEY_PREFIX = "omniagent.client-report-view:";
const CLIENT_REPORT_FOCUS_KEY_PREFIX = "omniagent.client-report-focus:";
const DASHBOARD_TIMELINE_SCOPE_KEY = "omniagent.dashboard-timeline-scope";
const DASHBOARD_CONSOLE_OPEN_KEY = "omniagent.dashboard-console-open";
const DASHBOARD_SEARCH_KEY = "omniagent.dashboard-search";
const DASHBOARD_CLIENT_MENU_OPEN_KEY = "omniagent.dashboard-client-menu-open";
const DASHBOARD_MAIN_SCROLL_KEY = "omniagent.dashboard-main-scroll";
const DASHBOARD_LAST_ACTION_KEY = "omniagent.dashboard-last-action";
const AMICLUBE_SLIDE_INDEX_KEY_PREFIX = "omniagent.amiclube-slide-index:";

type ClientContext = {
  loading: boolean;
  profiles: number;
  socialProfiles: SocialProfile[];
  socialPresence: SocialPresenceResult | null;
  snapshotScore: number | null;
  socialSnapshot: SocialIntelligenceSnapshot | null;
  clientReport: ClientReportResult | null;
  marketPresence: MarketPresenceResult | null;
  publishing: PublishingResult | null;
  clientRecordStatus: string | null;
  campaignState: CampaignResult["state"] | null;
  productCount: number;
  activeProductName: string | null;
  activeProductStatus: string | null;
  proposals: number;
  proposalBrief: ProposalBriefSummary | null;
  contentPlans: number;
  contentPackages: number;
  contentPackage: ContentPackage | null;
  renderedAsset: RenderedAsset | null;
  renderedAssets: RenderedAsset[];
  postArtGallery: PostArtGallery | null;
  postArtGalleries: PostArtGalleryRecord[];
  postArtGalleryComparison: PostArtGalleryComparison | null;
  schedulesList: Schedule[];
  schedules: number;
  reports: number;
  approvals: number;
  pendingApprovals: number;
  approvedApprovals: number;
  updatedAt: string | null;
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

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const extractProposalBrief = (payload: unknown): ProposalBriefSummary | null => {
  const record = toRecord(payload);
  const brief = toRecord(record?.proposalBrief);

  if (!brief) {
    return null;
  }

  return {
    summary: typeof brief.summary === "string" ? brief.summary : null,
    targetAudience: typeof brief.targetAudience === "string" ? brief.targetAudience : null,
    buyerPersonas: Array.isArray(brief.buyerPersonas) ? brief.buyerPersonas.map((value) => String(value)) : [],
    uniqueValueProposition: typeof brief.uniqueValueProposition === "string" ? brief.uniqueValueProposition : null,
    brandArchetype: typeof brief.brandArchetype === "string" ? brief.brandArchetype : null,
    objectionsToAddress: Array.isArray(brief.objectionsToAddress) ? brief.objectionsToAddress.map((value) => String(value)) : [],
    proofAssets: Array.isArray(brief.proofAssets) ? brief.proofAssets.map((value) => String(value)) : [],
    ctaRecommendation: typeof brief.ctaRecommendation === "string" ? brief.ctaRecommendation : null,
    visualDirection: typeof brief.visualDirection === "string" ? brief.visualDirection : null,
    logoTreatment: typeof brief.logoTreatment === "string" ? brief.logoTreatment : null,
    productImageryDirection: typeof brief.productImageryDirection === "string" ? brief.productImageryDirection : null,
    proposalAngle: typeof brief.proposalAngle === "string" ? brief.proposalAngle : null,
  };
};

type DashboardPageProps = {
  onOpenClients?: () => void;
  onCreateClient?: () => void;
  onLogout?: () => void;
};

export function DashboardPage({ onOpenClients, onCreateClient, onLogout }: DashboardPageProps = {}) {
  useSquadSocket();

  const squads = useSquadStore((state) => state.squads);
  const activeStates = useSquadStore((state) => state.activeStates);
  const selectedSquad = useSquadStore((state) => state.selectedSquad);
  const selectSquad = useSquadStore((state) => state.selectSquad);
  const isConnected = useSquadStore((state) => state.isConnected);
  const socialGrowthState = activeStates.get("social-growth") ?? null;

  const [search, setSearch] = useState(() => readDashboardSearch() ?? "");
  const [consoleOpen, setConsoleOpen] = useState(() => readDashboardConsoleOpen() ?? false);
  const [timelineScope, setTimelineScope] = useState<"day" | "week">(() => readDashboardTimelineScope() ?? "day");
  const [clients, setClients] = useState<Client[]>([]);
  const [clientListRefreshKey, setClientListRefreshKey] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState(() => readSelectedClientId());
  const [clientMenuOpen, setClientMenuOpen] = useState(() => readDashboardClientMenuOpen() ?? false);
  const [clientContext, setClientContext] = useState<ClientContext | null>(null);
  const [clientContextRefreshKey, setClientContextRefreshKey] = useState(0);
  const [renderedAssetVideoUrl, setRenderedAssetVideoUrl] = useState<string | null>(null);
  const [renderedAssetVideoPlaying, setRenderedAssetVideoPlaying] = useState(false);
  const [campaignRemotionVideoUrl, setCampaignRemotionVideoUrl] = useState<string | null>(null);
  const [renderedAssetDownload, setRenderedAssetDownload] = useState<"video" | "audio" | "subtitles" | null>(null);
  const [renderedAssetPlayback, setRenderedAssetPlayback] = useState<{ title: string; url: string; mimeType: string } | null>(null);
  const [renderedAssetRegenerationDialog, setRenderedAssetRegenerationDialog] = useState<{
    asset: RenderedAsset;
    mode: "auto" | "alternate" | "revision";
  } | null>(null);
  const [renderedAssetRegenerationObjectiveKey, setRenderedAssetRegenerationObjectiveKey] =
    useState<RenderedAssetRegenerationObjectiveKey>("conversion");
  const [renderedAssetRegenerationNote, setRenderedAssetRegenerationNote] = useState("");
  const [renderedAssetRegenerationBusy, setRenderedAssetRegenerationBusy] = useState(false);
  const [renderedAssetMessage, setRenderedAssetMessage] = useState<string | null>(null);
  const [clientReportView, setClientReportView] = useState<"client" | "market" | "before-after">("client");
  const [clientReportFocus, setClientReportFocus] = useState<"overview" | "client" | "market" | "social" | "campaign">("overview");
  const [amiclubeCreativeSlideIndex, setAmiclubeCreativeSlideIndex] = useState(0);
  const [marketPresenceBusy, setMarketPresenceBusy] = useState(false);
  const [marketPresenceMessage, setMarketPresenceMessage] = useState<string | null>(null);
  const [lastDashboardAction, setLastDashboardAction] = useState(() => readDashboardLastAction() ?? "Sem ação recente");
  const [now, setNow] = useState(() => Date.now());
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1440));
  const searchRef = useRef<HTMLInputElement | null>(null);
  const consoleRef = useRef<HTMLDetailsElement | null>(null);
  const clientMenuRef = useRef<HTMLDivElement | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const renderedAssetSectionRef = useRef<HTMLDivElement | null>(null);
  const mainScrollWriteTimerRef = useRef<number | null>(null);
  const renderedAssetVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  useEffect(() => {
    writeDashboardTimelineScope(timelineScope);
  }, [timelineScope]);

  useEffect(() => {
    writeDashboardConsoleOpen(consoleOpen);
  }, [consoleOpen]);

  useEffect(() => {
    writeDashboardSearch(search);
  }, [search]);

  useEffect(() => {
    writeDashboardClientMenuOpen(clientMenuOpen);
  }, [clientMenuOpen]);

  useEffect(() => {
    writeDashboardLastAction(lastDashboardAction);
  }, [lastDashboardAction]);

  useEffect(() => {
    const storedScrollTop = readDashboardMainScroll();
    if (storedScrollTop === null) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTop = storedScrollTop;
      }
    });
  }, [selectedClientId]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (clientMenuRef.current && !clientMenuRef.current.contains(event.target as Node)) {
        setClientMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    return subscribeSelectedClientId((clientId) => {
      setSelectedClientId(clientId);
    });
  }, []);

  useEffect(() => {
    let disposed = false;

    const loadClients = async () => {
      try {
        const { agencyId, clients: nextClients } = await backendApi.loadAccessibleClients();
        if (disposed) return;

        setClients(nextClients);

        const storedSelection = readSelectedClientId();
        const nextSelectedId =
          nextClients.find((client) => client.id === storedSelection)?.id ??
          nextClients.find((client) => client.id === selectedClientId)?.id ??
          nextClients[0]?.id ??
          "";

        setSelectedClientId(nextSelectedId);
        writeSelectedClientId(nextSelectedId);

        if (!nextClients.length) {
          recordOfferMetric({
            eventName: "client_list_empty",
            clientId: selectedClientId ?? null,
            source: "dashboard",
          });
          if (agencyId) {
            void backendApi.trackOfferEvent({
              eventName: "client_list_empty",
              clientId: selectedClientId ?? undefined,
              source: "dashboard",
              properties: {
                agencyId,
              },
            });
          }
        }
      } catch (error) {
        if (!disposed) {
          setClients([]);
          recordOfferMetric({
            eventName: "client_list_load_failed",
            clientId: selectedClientId ?? null,
            source: "dashboard",
          });
          void backendApi.trackOfferEvent({
            eventName: "client_list_load_failed",
            clientId: selectedClientId ?? undefined,
            source: "dashboard",
            properties: {
              reason: error instanceof Error ? error.message : "unknown",
            },
          });
        }
      }
    };

    void loadClients();
    return () => {
      disposed = true;
    };
  }, [clientListRefreshKey]);

  const squadList = useMemo(() => {
    return Array.from(squads.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [squads]);

  const visibleSquads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return squadList;

    return squadList.filter((squad) => {
      return (
        squad.name.toLowerCase().includes(term) ||
        squad.description.toLowerCase().includes(term) ||
        squad.code.toLowerCase().includes(term)
      );
    });
  }, [search, squadList]);

  const activeSquads = useMemo(() => {
    return visibleSquads
      .map((squad) => ({ squad, state: activeStates.get(squad.code) }))
      .filter((entry): entry is { squad: SquadInfo; state: SquadState } => !!entry.state)
      .sort((a, b) => {
        const aPriority = a.squad.code === selectedSquad ? -1 : 0;
        const bPriority = b.squad.code === selectedSquad ? -1 : 0;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.squad.name.localeCompare(b.squad.name);
      });
  }, [activeStates, selectedSquad, visibleSquads]);

  const heroSquad = useMemo(() => {
    if (selectedSquad) {
      const selected = squadList.find((squad) => squad.code === selectedSquad);
      if (selected) return selected;
    }
    return activeSquads[0]?.squad ?? squadList[0] ?? null;
  }, [activeSquads, squadList, selectedSquad]);

  const heroState = heroSquad ? activeStates.get(heroSquad.code) ?? null : null;
  const activeCount = activeStates.size;
  const totalCount = squadList.length;
  const connectedLabel = isConnected ? "Conectado" : "Desconectado";

  const heroProgress = heroState ? heroState.step.current / Math.max(heroState.step.total, 1) : 0;
  const selectedElapsed = heroState?.startedAt
    ? formatElapsed(now - new Date(heroState.startedAt).getTime())
    : null;

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? clients[0] ?? null,
    [clients, selectedClientId],
  );
  const renderedAssetRegenerationMemory = selectedClient?.id ? readRenderedAssetRegenerationMemory(selectedClient.id) : null;
  const hasRenderedAssetLastRevision = Boolean(renderedAssetRegenerationMemory?.note?.trim());
  const selectedClientRelationshipLabel = getClientRelationshipLabel(selectedClient);

  useEffect(() => {
    if (!selectedClient?.id) {
      setClientReportView("client");
      setClientReportFocus("overview");
      return;
    }

    const storedView = readClientReportView(selectedClient.id);
    setClientReportView(storedView ?? "client");
    setClientReportFocus(readClientReportFocus(selectedClient.id) ?? "overview");
  }, [selectedClient?.id]);

  const heroContextTitle = selectedClient?.name ?? heroSquad?.name ?? ptBR.dashboard.hero.titleFallback;
  const heroContextSubtitle = selectedClient
    ? `${selectedClient.segment ?? ptBR.dashboard.client.empty} · ${selectedClient.website_url ?? "—"}`
    : ptBR.dashboard.hero.subtitle(activeCount, totalCount, isConnected);
  const heroContextMetaOne = selectedClient
    ? `${ptBR.dashboard.client.segment}: ${selectedClient.segment ?? "—"}`
    : heroSquad?.description ?? "Nenhuma célula em foco";
  const heroContextMetaTwo = clientContext
    ? `${clientContext.activeProductName ?? "Sem oferta foco"} · ${clientContext.clientRecordStatus ? formatArtifactStatus(clientContext.clientRecordStatus) : "Sem registro"} · ${clientContext.proposals} propostas`
    : heroState
      ? `Etapa ${heroState.step.current}/${heroState.step.total}`
      : "Sem etapa em andamento";
  const heroContextMetaThree = clientContext?.updatedAt
    ? `${ptBR.dashboard.hero.clientUpdated} ${formatClock(clientContext.updatedAt)}`
    : selectedElapsed
      ? `${selectedElapsed} em ciclo`
      : connectedLabel;
  const sidebarContextEyebrow = selectedClient ? ptBR.dashboard.client.activeLabel : ptBR.dashboard.hero.eyebrow;
  const sidebarContextValue = selectedClient?.name ?? ptBR.dashboard.hero.portfolio;
  const topbarContextChips = useMemo(
    () => [
      { label: "Cliente", value: selectedClient?.name ?? "Nenhum cliente" },
      { label: "Squad", value: heroSquad?.name ?? selectedSquad ?? "Nenhum squad" },
      { label: "Filtro", value: search.trim() ? search.trim() : "Sem filtro" },
      { label: "Última ação", value: lastDashboardAction },
    ],
    [heroSquad?.name, lastDashboardAction, search, selectedClient?.name, selectedSquad],
  );
  useEffect(() => {
    let cancelled = false;

    const loadClientContext = async () => {
      if (!selectedClient?.id) {
        setClientContext(null);
        return;
      }

      setClientContext({
        loading: true,
        profiles: 0,
        socialProfiles: [],
        socialPresence: null,
        snapshotScore: null,
        socialSnapshot: null,
        clientReport: null,
        marketPresence: null,
        publishing: null,
        clientRecordStatus: null,
        campaignState: null,
        productCount: 0,
        activeProductName: null,
        activeProductStatus: null,
        proposals: 0,
        proposalBrief: null,
        contentPlans: 0,
        contentPackages: 0,
        contentPackage: null,
        renderedAsset: null,
        renderedAssets: [],
        postArtGallery: null,
        postArtGalleries: [],
        postArtGalleryComparison: null,
        schedulesList: [],
        schedules: 0,
        reports: 0,
        approvals: 0,
        pendingApprovals: 0,
        approvedApprovals: 0,
        updatedAt: selectedClient.updated_at,
      });

      try {
        const [clientRecord, products, proposals, content, monitoring, approvals, campaign, marketPresence, clientReport, publishing, socialPresence] = await Promise.all([
          backendApi.loadClientRecord(selectedClient.id).catch(() => null),
          backendApi.loadProducts(selectedClient.id).catch(() => null),
          backendApi.loadProposals(selectedClient.id).catch(() => null),
          backendApi.loadContent(selectedClient.id).catch(() => null),
          backendApi.loadMonitoring(selectedClient.id).catch(() => null),
          backendApi.loadApprovals(selectedClient.id).catch(() => null),
          backendApi.loadCampaign(selectedClient.id).catch(() => null),
          backendApi.loadMarketPresence(selectedClient.id).catch(() => null),
          backendApi.loadClientReport(selectedClient.id).catch(() => null),
          backendApi.loadPublishing(selectedClient.id).catch(() => null),
          backendApi.loadSocialPresence(selectedClient.id).catch(() => null),
        ]);

        const hasSocialIntelligence = Boolean(clientRecord?.snapshot || (clientRecord?.profiles?.length ?? 0) > 0);
        const social = hasSocialIntelligence ? await backendApi.loadSocialIntelligence(selectedClient.id).catch(() => null) : null;

        if (cancelled) return;

        const snapshotScore = social?.snapshot
          ? averageDefinedValues([
              social.snapshot.presence_score,
              social.snapshot.consistency_score,
              social.snapshot.proof_score,
              social.snapshot.conversion_readiness,
            ])
          : null;
        const approvalsList = approvals?.approvals ?? [];
        const activeProduct = products?.products.find((product) => product.is_active) ?? products?.products[0] ?? null;
        const proposalBrief = extractProposalBrief(proposals?.proposals[0]?.payload_json ?? null);

        setClientContext({
          loading: false,
          profiles: social?.profiles.length ?? 0,
          socialProfiles: social?.profiles ?? [],
          socialPresence,
          snapshotScore,
          socialSnapshot: social?.snapshot ?? null,
          clientReport,
          marketPresence,
          publishing,
          clientRecordStatus: clientRecord?.latestClientRecord?.status ?? null,
          campaignState: campaign?.state ?? null,
          productCount: products?.products.length ?? 0,
          activeProductName: activeProduct?.name ?? null,
          activeProductStatus: activeProduct?.status ?? null,
          proposals: proposals?.proposals.length ?? 0,
          proposalBrief,
          contentPlans: content?.contentPlans.length ?? 0,
          contentPackages: content?.contentPackages.length ?? 0,
          contentPackage: content?.contentPackage ?? null,
          renderedAsset: content?.renderedAsset ?? null,
          renderedAssets: content?.renderedAssets ?? [],
          postArtGallery: content?.postArtGallery ?? null,
          postArtGalleries: content?.postArtGalleries ?? [],
          postArtGalleryComparison: content?.postArtGalleryComparison ?? null,
          schedulesList: content?.schedules ?? [],
          schedules: content?.schedules.length ?? 0,
          reports: monitoring?.reports.length ?? 0,
          approvals: approvalsList.length,
          pendingApprovals: approvalsList.filter((approval) => approval.status === "pending").length,
          approvedApprovals: approvalsList.filter((approval) => approval.status === "approved").length,
          updatedAt:
            approvals?.client.updated_at ??
            monitoring?.client.updated_at ??
            content?.client.updated_at ??
            proposals?.client.updated_at ??
            clientRecord?.client.updated_at ??
            social?.client.updated_at ??
            selectedClient.updated_at,
        });
      } catch {
        if (!cancelled) {
          setClientContext(null);
          recordOfferMetric({
            eventName: "client_context_load_failed",
            clientId: selectedClient?.id ?? null,
            source: "dashboard",
          });
          void backendApi.trackOfferEvent({
            eventName: "client_context_load_failed",
            clientId: selectedClient?.id ?? undefined,
            source: "dashboard",
            properties: {
              selectedClientId: selectedClient?.id ?? null,
            },
          });
        }
      }
    };

    void loadClientContext();

    return () => {
      cancelled = true;
    };
  }, [clientContextRefreshKey, selectedClient?.id, selectedClient?.updated_at]);

  const refreshClientContext = useCallback(() => {
    setClientContextRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    return subscribeContentRefresh((clientId) => {
      if (!selectedClientId) return;
      if (clientId && clientId !== selectedClientId) return;
      refreshClientContext();
    });
  }, [refreshClientContext, selectedClientId]);

  useEffect(() => {
    const renderedAssetStatus = clientContext?.renderedAsset?.status ?? null;

    if (renderedAssetStatus !== "queued" && renderedAssetStatus !== "rendering") {
      return;
    }

    const timer = window.setInterval(() => {
      refreshClientContext();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [clientContext?.renderedAsset?.status, refreshClientContext]);

  useEffect(() => {
    if (!selectedClient?.id) return;

    const handleFocus = () => {
      refreshClientContext();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshClientContext();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshClientContext, selectedClient?.id]);

  const handleMarketPresenceBaseline = async () => {
    if (!selectedClient?.id || marketPresenceBusy) return;

    setMarketPresenceBusy(true);
    setMarketPresenceMessage(null);

    try {
      await backendApi.createMarketPresenceBaseline(selectedClient.id, {
        notes: "Baseline criada a partir do dashboard.",
      });
      setMarketPresenceMessage("Baseline criada.");
      setLastDashboardAction("Baseline de presença criada");
      refreshClientContext();
    } catch (error) {
      setMarketPresenceMessage(error instanceof Error ? error.message : "Falha ao criar baseline.");
    } finally {
      setMarketPresenceBusy(false);
    }
  };

  const handleMarketPresenceCheckpoint = async () => {
    if (!selectedClient?.id || marketPresenceBusy) return;

    setMarketPresenceBusy(true);
    setMarketPresenceMessage(null);

    try {
      await backendApi.createMarketPresenceCheckpoint(selectedClient.id, {
        notes: "Checkpoint criado a partir do dashboard.",
      });
      setMarketPresenceMessage("Checkpoint criado.");
      setLastDashboardAction("Checkpoint de presença criado");
      refreshClientContext();
    } catch (error) {
      setMarketPresenceMessage(error instanceof Error ? error.message : "Falha ao criar checkpoint.");
    } finally {
      setMarketPresenceBusy(false);
    }
  };

  const handleMarketPresenceCompare = async () => {
    const marketPresence = clientContext?.marketPresence;
    const baseline = marketPresence?.latestBaseline ?? marketPresence?.baselines[0] ?? null;
    const checkpoint = marketPresence?.latestCheckpoint ?? marketPresence?.checkpoints[0] ?? null;

    if (!selectedClient?.id || !baseline || !checkpoint || marketPresenceBusy) return;

    setMarketPresenceBusy(true);
    setMarketPresenceMessage(null);

    try {
      const result = await backendApi.compareMarketPresence(selectedClient.id, {
        baselineId: baseline.id,
        checkpointId: checkpoint.id,
      });
      setMarketPresenceMessage(`${result.comparison.reading}: ${result.comparison.analogy}`);
      setLastDashboardAction("Presença longitudinal comparada");
      refreshClientContext();
    } catch (error) {
      setMarketPresenceMessage(error instanceof Error ? error.message : "Falha ao comparar presença.");
    } finally {
      setMarketPresenceBusy(false);
    }
  };

  const clientEngagement = clientContext?.snapshotScore ?? null;
  const clientSocialSnapshot = clientContext?.socialSnapshot ?? null;
  const clientSocialBreakdown = clientSocialSnapshot
    ? `P ${clientSocialSnapshot.presence_score ?? 0} · C ${clientSocialSnapshot.consistency_score ?? 0} · Pr ${clientSocialSnapshot.proof_score ?? 0} · Cv ${clientSocialSnapshot.conversion_readiness ?? 0}`
    : null;
  const marketPresence = clientContext?.marketPresence ?? null;
  const marketPresenceBaseline = marketPresence?.latestBaseline ?? marketPresence?.baselines[0] ?? null;
  const marketPresenceCheckpoint = marketPresence?.latestCheckpoint ?? marketPresence?.checkpoints[0] ?? null;
  const marketPresenceComparison = marketPresence?.latestComparison ?? marketPresence?.comparisons[0] ?? null;
  const clientReport = clientContext?.clientReport ?? null;
  const clientReportData = clientReport?.report ?? null;
  const brandSnapshot = clientReportData?.brandSnapshot ?? null;
  const briefSnapshot = clientReportData?.briefSnapshot ?? null;
  const offerSnapshot = clientReportData?.offerSnapshot ?? null;
  const creativeSnapshot = clientReportData?.creativeSnapshot ?? null;
  const socialProfilesSnapshot = clientReportData?.socialProfiles ?? [];
  const clientSocialPresence = clientReportData?.socialPresence ?? null;
  const clientSocialPresenceContext = clientContext?.socialPresence ?? null;
  const clientSocialPresenceSummary = clientSocialPresenceContext?.summary ?? clientSocialPresence ?? null;
  const clientSocialPresenceLatestSnapshots = clientSocialPresenceContext?.latestSnapshots ?? [];
  const clientSocialPresenceCoverageCount =
    clientSocialPresenceLatestSnapshots.length > 0
      ? clientSocialPresenceLatestSnapshots.length
      : clientSocialPresenceSummary?.networks.length ?? (clientSocialSnapshot ? 1 : 0);
  const clientSocialNetworksForDisplay = useMemo(
    () =>
      clientSocialPresenceContext?.latestSnapshots.length
        ? clientSocialPresenceContext.latestSnapshots.map((snapshot: SocialPresenceSnapshotRecord) => ({
            platform: snapshot.platform,
            handle: snapshot.handle,
            profileUrl: snapshot.profile_url,
            collectedAt: snapshot.collected_at,
            followersCount: snapshot.followers_count,
            followersDelta: null,
            postsCount: snapshot.posts_count,
            postsDelta: null,
            latestPostAt: snapshot.latest_post_at,
            observationStatus:
              snapshot.observation_status === "captured" ||
              snapshot.observation_status === "partial" ||
              snapshot.observation_status === "unavailable"
                ? snapshot.observation_status
                : "partial",
            confidence: snapshot.confidence,
            notes: snapshot.notes,
          }))
        : clientSocialPresenceSummary?.networks.length
        ? clientSocialPresenceSummary.networks
        : (clientContext?.socialProfiles ?? []).map((profile) => ({
            platform: profile.platform,
            handle: profile.handle,
            profileUrl: profile.profile_url,
            collectedAt: profile.updated_at ?? profile.created_at,
            followersCount: null,
            followersDelta: null,
            postsCount: null,
            postsDelta: null,
            latestPostAt: null,
            observationStatus:
              profile.status.toLowerCase().includes("partial") || profile.status.toLowerCase().includes("pending")
                ? "partial"
                : profile.status.toLowerCase().includes("unavailable")
                  ? "unavailable"
                  : "captured",
            confidence: profile.confidence,
            notes: `Perfil monitorado via ${profile.discovery_source}`,
          })),
    [clientContext?.socialProfiles, clientSocialPresence?.networks, clientSocialPresenceContext?.latestSnapshots],
  );
  const publishing = clientContext?.publishing ?? null;
  const contentPackagePayload = useMemo(() => parseContentPackagePayload(clientContext?.contentPackage?.payload_json), [clientContext?.contentPackage]);
  const renderedAssetPayload = useMemo(() => parseRenderedAssetPayload(clientContext?.renderedAsset?.payload_json), [clientContext?.renderedAsset]);
  const campaignGalleryVariants = useMemo(() => clientContext?.postArtGallery?.variants ?? [], [clientContext?.postArtGallery]);
  const normalizeCampaignKey = (value: string | null | undefined) =>
    value
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^\p{L}\p{N}]+/gu, " ") ?? "";
  const findCampaignVariantForItem = (
    item: { position?: number; title?: string | null },
    variants: typeof campaignGalleryVariants,
  ) => {
    const itemTitleKey = normalizeCampaignKey(item.title);

    return (
      variants.find((variant) => {
        const sourceItemTitleKey = normalizeCampaignKey(variant.sourceItem?.title);
        const variantTitleKey = normalizeCampaignKey(variant.title);
        const positionMatch = typeof item.position === "number" ? variant.sourceItem?.position === item.position : false;

        return positionMatch || (itemTitleKey.length > 0 && (sourceItemTitleKey === itemTitleKey || variantTitleKey === itemTitleKey));
      }) ?? null
    );
  };
  const contentSchedulePayload = useMemo(
    () => parsePublishingSchedulePayload(clientContext?.schedulesList?.[0]?.payload_json),
    [clientContext?.schedulesList],
  );
  const publishingSchedulePayload = useMemo(() => parsePublishingSchedulePayload(publishing?.schedulePayload), [publishing?.schedulePayload]);
  const effectiveSchedulePayload = publishingSchedulePayload ?? contentSchedulePayload;
  const campaignPreviewAsset = useMemo(() => {
    const currentAsset = clientContext?.renderedAsset ?? null;

    if (
      currentAsset &&
      currentAsset.status === "ready" &&
      currentAsset.render_engine === "remotion" &&
      currentAsset.asset_mime_type?.startsWith("video/")
    ) {
      return currentAsset;
    }

    return (
      (clientContext?.renderedAssets ?? []).find(
        (asset) => asset.status === "ready" && asset.render_engine === "remotion" && asset.asset_mime_type?.startsWith("video/"),
      ) ?? null
    );
  }, [clientContext?.renderedAsset, clientContext?.renderedAssets]);
  const campaignRemotionPayload = useMemo(() => {
    if (!campaignPreviewAsset) {
      return null;
    }

    return campaignPreviewAsset.id === clientContext?.renderedAsset?.id ? renderedAssetPayload : parseRenderedAssetPayload(campaignPreviewAsset.payload_json);
  }, [campaignPreviewAsset, clientContext?.renderedAsset?.id, renderedAssetPayload]);
  const campaignRemotionPreview = useMemo(() => {
    if (!campaignPreviewAsset || !campaignRemotionPayload) {
      return null;
    }

    return {
      asset: campaignPreviewAsset,
      payload: campaignRemotionPayload,
    };
  }, [campaignPreviewAsset, campaignRemotionPayload]);
  const creativeWorkflowTrail =
    effectiveSchedulePayload?.workflow?.agentTrail ??
    renderedAssetPayload?.workflow?.trail ??
    contentPackagePayload?.visualDirection?.workflow?.agentTrail ??
    [];
  const creativeWorkflowSummary =
    creativeWorkflowTrail.length > 0
      ? creativeWorkflowTrail.map((agent) => agent.label).join(" → ")
      : "creator → visual-director → creative-renderer → reviewer → scheduler";
  const isAmiclubeCompact = viewportWidth < 1120;
  const renderedAssetDownloadBaseName = useMemo(() => {
    const source =
      renderedAssetPayload?.title?.trim() ||
      selectedClient?.name?.trim() ||
      clientContext?.renderedAsset?.id ||
      "rendered-asset";

    return source
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "rendered-asset";
  }, [clientContext?.renderedAsset?.id, renderedAssetPayload?.title, selectedClient?.name]);
  const getRenderedAssetDownloadBaseName = useCallback(
    (asset: RenderedAsset, title?: string | null) => {
      const source = title?.trim() || selectedClient?.name?.trim() || `render-v${asset.version}`;

      return (
        source
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `render-v${asset.version}`
      );
    },
    [selectedClient?.name],
  );
  const renderedAssetOutputFiles = useMemo(
    () => [
      { label: "MP4", fileName: `${renderedAssetDownloadBaseName}.mp4`, description: "Vídeo final com legenda e trilha" },
      { label: "WAV", fileName: `${renderedAssetDownloadBaseName}.wav`, description: "Trilha ambiente gerada localmente" },
      { label: "SRT", fileName: `${renderedAssetDownloadBaseName}.srt`, description: "Legenda sincronizada por cena" },
    ],
    [renderedAssetDownloadBaseName],
  );
  const recentRenderedAssets = useMemo(() => clientContext?.renderedAssets.slice(0, 4) ?? [], [clientContext?.renderedAssets]);

  const downloadRenderedAssetBlob = useCallback((blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }, []);

  const handleRenderedAssetDownload = useCallback(
    async (asset: RenderedAsset, kind: "video" | "audio" | "subtitles", title?: string | null) => {
      const renderedAsset = asset;

      if (!renderedAsset || renderedAsset.status !== "ready") {
        return;
      }

      setRenderedAssetDownload(kind);

      try {
        let blob: Blob;
        let extension: string;

        if (kind === "video") {
          blob = await backendApi.loadRenderedAssetFileBlob(renderedAsset.client_id, renderedAsset.id);
          extension = "mp4";
        } else if (kind === "audio") {
          blob = await backendApi.loadRenderedAssetAudioBlob(renderedAsset.client_id, renderedAsset.id);
          extension = "wav";
        } else {
          blob = await backendApi.loadRenderedAssetSubtitleBlob(renderedAsset.client_id, renderedAsset.id);
          extension = "srt";
        }

        downloadRenderedAssetBlob(blob, `${getRenderedAssetDownloadBaseName(renderedAsset, title)}.${extension}`);
      } catch {
        return;
      } finally {
        setRenderedAssetDownload(null);
      }
    },
    [downloadRenderedAssetBlob, getRenderedAssetDownloadBaseName],
  );
  const openRenderedAssetRegenerationDialog = useCallback(
    (asset: RenderedAsset, mode: "auto" | "alternate" | "revision") => {
      if (!selectedClient?.id || renderedAssetRegenerationBusy || asset.status !== "ready") {
        return;
      }

      const assetPayload = parseRenderedAssetPayload(asset.payload_json);
      const storedMemory = readRenderedAssetRegenerationMemory(selectedClient.id);
      const defaultObjectiveKey = storedMemory?.objectiveKey ?? getRenderedAssetRegenerationDefaultObjectiveKey(assetPayload);
      setRenderedAssetRegenerationDialog({ asset, mode });
      setRenderedAssetRegenerationObjectiveKey(defaultObjectiveKey);
      setRenderedAssetRegenerationNote(
        mode === "revision"
          ? storedMemory?.note?.trim() || assetPayload?.regeneration?.note?.trim() || ""
          : "",
      );
      setRenderedAssetMessage(null);
    },
    [renderedAssetRegenerationBusy, selectedClient?.id],
  );

  const handleClientReportViewChange = useCallback(
    (view: "client" | "market" | "before-after") => {
      setClientReportView(view);
      setLastDashboardAction(`Relatório: ${view}`);
      if (selectedClient?.id) {
        writeClientReportView(selectedClient.id, view);
      }
    },
    [selectedClient?.id],
  );

  const handleClientReportFocusChange = useCallback(
    (focus: "overview" | "client" | "market" | "social" | "campaign") => {
      setClientReportFocus(focus);
      setLastDashboardAction(`Recorte do relatório: ${focus}`);
      if (selectedClient?.id) {
        writeClientReportFocus(selectedClient.id, focus);
      }
    },
    [selectedClient?.id],
  );

  const closeRenderedAssetRegenerationDialog = useCallback(() => {
    if (renderedAssetRegenerationBusy) {
      return;
    }

    setRenderedAssetRegenerationDialog(null);
    setRenderedAssetRegenerationNote("");
  }, [renderedAssetRegenerationBusy]);

  const confirmRenderedAssetRegeneration = useCallback(async () => {
    if (!selectedClient?.id || !renderedAssetRegenerationDialog || renderedAssetRegenerationBusy) {
      return;
    }

    const { asset, mode } = renderedAssetRegenerationDialog;
    const revisionNote = mode === "revision" ? renderedAssetRegenerationNote.trim() : null;

    if (mode === "revision" && !revisionNote) {
      setRenderedAssetMessage("Informe um ajuste para revisar o briefing.");
      return;
    }

    setRenderedAssetRegenerationBusy(true);
    setRenderedAssetMessage(null);

    try {
      await backendApi.regenerateRenderedAsset(selectedClient.id, asset.id, { mode, revisionNote });
      if (mode === "revision") {
        writeRenderedAssetRegenerationMemory(selectedClient.id, {
          objectiveKey: renderedAssetRegenerationObjectiveKey,
          note: revisionNote ?? "",
          updatedAt: new Date().toISOString(),
        });
      }
      setLastDashboardAction(
        mode === "revision"
          ? "Render regenerado com revisão"
          : mode === "alternate"
            ? "Render regenerado com direção alternativa"
            : "Render regenerado com mesma direção",
      );
      setRenderedAssetMessage(
        mode === "revision"
          ? "Nova versão gerada com revisão de briefing."
          : mode === "alternate"
            ? "Nova versão gerada com direção de arte alternativa."
            : "Nova versão gerada com a mesma direção de arte.",
      );
      setRenderedAssetRegenerationDialog(null);
      setRenderedAssetRegenerationNote("");
      refreshClientContext();
    } catch (error) {
      setRenderedAssetMessage(error instanceof Error ? error.message : "Falha ao regenerar o render.");
    } finally {
      setRenderedAssetRegenerationBusy(false);
    }
  }, [
    refreshClientContext,
    renderedAssetRegenerationBusy,
    renderedAssetRegenerationDialog,
    renderedAssetRegenerationNote,
    renderedAssetRegenerationObjectiveKey,
    selectedClient?.id,
  ]);

  const handleRenderedAssetRegenerationFromLastRevision = useCallback(
    async (asset: RenderedAsset) => {
      if (!selectedClient?.id || renderedAssetRegenerationBusy || asset.status !== "ready") {
        return;
      }

      const storedMemory = readRenderedAssetRegenerationMemory(selectedClient.id);
      const revisionNote = storedMemory?.note?.trim();

      if (!storedMemory || !revisionNote) {
        setRenderedAssetMessage("Ainda não há uma revisão salva para reutilizar.");
        return;
      }

      setRenderedAssetRegenerationBusy(true);
      setRenderedAssetMessage(null);

      try {
      await backendApi.regenerateRenderedAsset(selectedClient.id, asset.id, { mode: "revision", revisionNote });
      writeRenderedAssetRegenerationMemory(selectedClient.id, {
        objectiveKey: storedMemory.objectiveKey,
        note: revisionNote,
        updatedAt: new Date().toISOString(),
      });
      setLastDashboardAction("Render regenerado com última revisão");
      setRenderedAssetMessage("Nova versão gerada com base na última revisão salva.");
        refreshClientContext();
      } catch (error) {
        setRenderedAssetMessage(error instanceof Error ? error.message : "Falha ao regenerar o render.");
      } finally {
        setRenderedAssetRegenerationBusy(false);
      }
    },
    [refreshClientContext, renderedAssetRegenerationBusy, selectedClient?.id],
  );

  useEffect(() => {
    const renderedAsset = clientContext?.renderedAsset;
    let disposed = false;
    let objectUrl: string | null = null;

    if (!renderedAsset || renderedAsset.status !== "ready" || !renderedAsset.asset_mime_type?.startsWith("video/")) {
      setRenderedAssetVideoUrl(null);
      setRenderedAssetVideoPlaying(false);
      return () => undefined;
    }

    const loadVideo = async () => {
      try {
        const blob = await backendApi.loadRenderedAssetFileBlob(renderedAsset.client_id, renderedAsset.id);
        if (disposed) return;

        objectUrl = URL.createObjectURL(blob);
        setRenderedAssetVideoUrl(objectUrl);
      } catch {
        if (!disposed) {
          setRenderedAssetVideoUrl(null);
        }
      }
    };

    void loadVideo();

    return () => {
      disposed = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setRenderedAssetVideoPlaying(false);
    };
  }, [clientContext?.renderedAsset?.asset_mime_type, clientContext?.renderedAsset?.id, clientContext?.renderedAsset?.status]);

  useEffect(() => {
    if (!renderedAssetRegenerationDialog) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !renderedAssetRegenerationBusy) {
        closeRenderedAssetRegenerationDialog();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeRenderedAssetRegenerationDialog, renderedAssetRegenerationBusy, renderedAssetRegenerationDialog]);

  useEffect(() => {
    const renderedAsset = campaignPreviewAsset;
    let disposed = false;
    let objectUrl: string | null = null;

    if (!renderedAsset || renderedAsset.status !== "ready" || !renderedAsset.asset_mime_type?.startsWith("video/")) {
      setCampaignRemotionVideoUrl(null);
      return () => undefined;
    }

    const loadVideo = async () => {
      try {
        const blob = await backendApi.loadRenderedAssetFileBlob(renderedAsset.client_id, renderedAsset.id);
        if (disposed) return;

        objectUrl = URL.createObjectURL(blob);
        setCampaignRemotionVideoUrl(objectUrl);
      } catch {
        if (!disposed) {
          setCampaignRemotionVideoUrl(null);
        }
      }
    };

    void loadVideo();

    return () => {
      disposed = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [campaignPreviewAsset?.asset_mime_type, campaignPreviewAsset?.id, campaignPreviewAsset?.status]);
  const toggleRenderedAssetVideoPlayback = useCallback(async () => {
    const video = renderedAssetVideoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        return;
      }
    } else {
      video.pause();
    }
  }, []);
  const openRenderedAssetPlayback = useCallback(
    async (asset: RenderedAsset, title?: string | null) => {
      if (!asset.asset_mime_type?.startsWith("video/") || asset.status !== "ready") {
        return;
      }

      try {
        const blob = await backendApi.loadRenderedAssetFileBlob(asset.client_id, asset.id);
        const url = URL.createObjectURL(blob);
        setRenderedAssetPlayback((current) => {
          if (current?.url) {
            URL.revokeObjectURL(current.url);
          }
          return { title: title?.trim() || `Render v${asset.version}`, url, mimeType: asset.asset_mime_type ?? "video/mp4" };
        });
      } catch {
        return;
      }
    },
    [],
  );
  const openCampaignArtPreview = useCallback((title: string, previewDataUrl: string, previewMimeType?: string | null) => {
    setRenderedAssetPlayback({ title, url: previewDataUrl, mimeType: previewMimeType ?? "image/png" });
  }, []);
  const closeRenderedAssetPlayback = useCallback(() => {
    setRenderedAssetPlayback((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }
      return null;
    });
  }, []);
  const scrollToRenderedAssetSection = useCallback(() => {
    renderedAssetSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  useEffect(() => {
    return () => {
      if (renderedAssetPlayback?.url) {
        URL.revokeObjectURL(renderedAssetPlayback.url);
      }
    };
  }, [renderedAssetPlayback?.url]);
  const socialGrowthAgentMap = useMemo(
    () => new Map((socialGrowthState?.agents ?? []).map((agent) => [agent.id, agent] as const)),
    [socialGrowthState],
  );
  const featuredCreativeItem = effectiveSchedulePayload?.items?.[0] ?? null;
  const featuredCreativeTitle =
    featuredCreativeItem?.title?.trim() || "Se o seu amigurumi nao vende, talvez o problema nao seja o produto";
  const featuredCreativeSubtitle =
    featuredCreativeItem?.objective?.trim() || "Organize oferta, imagem e rotina antes de tentar crescer.";
  const featuredCreativeChannel = featuredCreativeItem?.channel?.trim() || "Instagram Feed";
  const featuredCreativeFormat = featuredCreativeItem?.format?.trim() || "Carrossel";
  const featuredCreativeTheme =
    renderedAssetPayload?.summary?.trim() || contentPackagePayload?.visualDirection?.firstPass?.trim() || "Capa do carrossel de abertura";
  const amiclubeCreativeAgents =
    creativeWorkflowTrail.length > 0
      ? creativeWorkflowTrail
      : [
          {
            id: "creator",
            label: "creator",
            role: "copy e variações",
            output: "content-production-package.md",
          },
          {
            id: "visual-director",
            label: "visual-director",
            role: "direção visual",
            output: "visual-direction.md",
          },
          {
            id: "creative-renderer",
            label: "creative-renderer",
            role: "render final",
            output: "rendered-assets.md",
          },
          {
            id: "reviewer",
            label: "reviewer",
            role: "revisão",
            output: "content-review.md",
          },
          {
            id: "scheduler",
            label: "scheduler",
            role: "agenda",
            output: "schedule-plan.md",
          },
        ];
  const amiclubeWorkflowOwner =
    renderedAssetPayload?.workflow?.owner ??
    contentPackagePayload?.visualDirection?.workflow?.primaryOwner ??
    effectiveSchedulePayload?.workflow?.primaryOwner ??
    "visual-director";
  const amiclubeWorkflowSquad =
    renderedAssetPayload?.workflow?.squad ??
    contentPackagePayload?.visualDirection?.workflow?.squad ??
    effectiveSchedulePayload?.workflow?.squad ??
    "social-growth";
  const amiclubeCreativeVisualAgents = amiclubeCreativeAgents.map((agent) => {
    const agentKey = agent.id ?? agent.label ?? "creative-renderer";
    const stateAgent = socialGrowthAgentMap.get(agentKey);
    return {
      ...agent,
      icon: stateAgent?.icon ?? CREATIVE_AGENT_VISUALS[agent.id as CreativeAgentId]?.icon ?? "•",
      title: stateAgent?.name ?? CREATIVE_AGENT_VISUALS[agent.id as CreativeAgentId]?.title ?? agent.label,
      status: stateAgent ? formatAgentStatus(stateAgent.status) : "sem estado",
    };
  });
  const amiclubeCreativeTimeline = amiclubeCreativeVisualAgents.map((agent, index, array) => ({
    ...agent,
    isLast: index === array.length - 1,
  }));
  const campaignScheduleItems = useMemo(
    () =>
      [...(effectiveSchedulePayload?.items ?? [])].sort((a, b) => {
        const aDate = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
        const bDate = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
        return aDate - bDate;
      }),
    [effectiveSchedulePayload?.items],
  );
  const campaignArtHealth = useMemo(() => {
    const matchedVariantIds = new Set<string>();
    const coverage = campaignScheduleItems.map((item) => {
      const previewVariant = findCampaignVariantForItem(item, campaignGalleryVariants);
      if (previewVariant) {
        matchedVariantIds.add(previewVariant.id);
      }
      return { item, previewVariant };
    });
    const missingItems = coverage.filter((entry) => !entry.previewVariant);
    const orphanVariants = campaignGalleryVariants.filter((variant) => !matchedVariantIds.has(variant.id));
    const hasSchedule = campaignScheduleItems.length > 0;
    const hasVariants = campaignGalleryVariants.length > 0;
    const coveredCount = coverage.length - missingItems.length;

    let status: "empty" | "partial" | "ready" | "orphan" = "empty";

    if (hasSchedule && hasVariants) {
      status = missingItems.length === 0 && orphanVariants.length === 0 ? "ready" : "partial";
    } else if (hasSchedule) {
      status = "partial";
    } else if (hasVariants) {
      status = "orphan";
    }

    const summary = !hasSchedule && !hasVariants
      ? "Ainda não há agenda publicada nem artes Remotion para este cliente."
      : hasSchedule && !hasVariants
        ? `Agenda publicada com ${campaignScheduleItems.length} post(s), mas nenhuma arte Remotion foi vinculada ainda.`
        : !hasSchedule && hasVariants
          ? `${campaignGalleryVariants.length} arte(s) Remotion existem, mas não há agenda publicada para vinculá-las.`
          : missingItems.length === 0 && orphanVariants.length === 0
            ? `Cobertura completa: ${coveredCount}/${campaignScheduleItems.length} post(s) planejado(s) têm arte Remotion correspondente.`
            : `Cobertura parcial: ${coveredCount}/${campaignScheduleItems.length} post(s) planejado(s) têm arte Remotion correspondente.`;

    return {
      status,
      summary,
      hasSchedule,
      hasVariants,
      scheduledCount: campaignScheduleItems.length,
      variantCount: campaignGalleryVariants.length,
      coveredCount,
      missingItems,
      orphanVariants,
    };
  }, [campaignGalleryVariants, campaignScheduleItems]);
  const amiclubeCreativeSlides = useMemo(
    () => [
      {
        id: "cover",
        label: "Slide 01",
        badge: "capa",
        eyebrow: "Gancho principal",
        title: featuredCreativeTitle,
        body: featuredCreativeSubtitle,
        footerLeft: "Salve para revisar sua proxima oferta",
        footerRight: "Hook-first · 4:5",
        accent: "terracotta" as const,
        preview: "Abertura com contraste e promessa direta.",
      },
      {
        id: "error-1",
        label: "Slide 02",
        badge: "erro",
        eyebrow: "Preco baixo",
        title: "Preco baixo nao corrige oferta confusa.",
        body: "Se o cliente nao entende o que esta comprando, ele compara so por preco.",
        footerLeft: "Erros que travam a venda",
        footerRight: "01 / 06",
        accent: "terracotta" as const,
        preview: "Mostra a armadilha da precificacao sem contexto.",
      },
      {
        id: "error-2",
        label: "Slide 03",
        badge: "prova",
        eyebrow: "Apresentacao",
        title: "Foto bonita nao salva descricao fraca.",
        body: "Mostre o que esta comprando, o uso e o detalhe que gera valor.",
        footerLeft: "Valor percebido",
        footerRight: "02 / 06",
        accent: "sand" as const,
        preview: "Troca a estetica pela clareza comercial.",
      },
      {
        id: "error-3",
        label: "Slide 04",
        badge: "ritmo",
        eyebrow: "Constancia",
        title: "Postar sem rotina apaga a lembranca.",
        body: "Constancia cria confianca antes da venda.",
        footerLeft: "Rotina simples",
        footerRight: "03 / 06",
        accent: "green" as const,
        preview: "Entra no tema de memoria e confianca.",
      },
      {
        id: "fix",
        label: "Slide 05",
        badge: "ajuste",
        eyebrow: "Correção",
        title: "Organize oferta, imagem e rotina.",
        body: "Ajuste o que a pessoa ve, entende e sente antes de pedir compra.",
        footerLeft: "Oferta clara vende melhor",
        footerRight: "04 / 06",
        accent: "green" as const,
        preview: "Fecha o passo a passo pratico.",
      },
      {
        id: "cta",
        label: "Slide 06",
        badge: "cta",
        eyebrow: "Fechamento",
        title: "Salve este post para revisar sua proxima oferta.",
        body: "Use o checklist antes de publicar o proximo produto artesanal.",
        footerLeft: "Amiclube",
        footerRight: "05 / 06",
        accent: "terracotta" as const,
        preview: "Chamada final para salvar e revisar.",
      },
    ],
    [featuredCreativeSubtitle, featuredCreativeTitle],
  );
  const amiclubeCreativeSlide = amiclubeCreativeSlides[amiclubeCreativeSlideIndex % amiclubeCreativeSlides.length];

  useEffect(() => {
    const storedSlideIndex = selectedClient?.id ? readAmiclubeSlideIndex(selectedClient.id) : null;
    const nextSlideIndex = storedSlideIndex ?? 0;
    setAmiclubeCreativeSlideIndex(Math.min(nextSlideIndex, Math.max(amiclubeCreativeSlides.length - 1, 0)));
  }, [selectedClient?.id, contentPackagePayload?.visualDirection?.firstPass, effectiveSchedulePayload?.items?.[0]?.title]);

  useEffect(() => {
    if (!selectedClient?.id) {
      return;
    }

    writeAmiclubeSlideIndex(selectedClient.id, amiclubeCreativeSlideIndex);
  }, [amiclubeCreativeSlideIndex, selectedClient?.id]);

  const clientFocusSummaryCards = selectedClient
    ? [
        {
          label: "Foco ativo",
          value: clientContext?.activeProductName ?? "Sem oferta foco",
          hint: clientReportData?.headline ?? "Visão integrada do cliente selecionado",
        },
        {
          label: "Status",
          value: clientContext?.clientRecordStatus ? formatArtifactStatus(clientContext.clientRecordStatus) : "Sem registro",
          hint: `${clientContext?.profiles ?? 0} perfis · ${clientContext?.productCount ?? 0} produtos`,
        },
        {
          label: "Pipeline",
          value: `${clientContext?.contentPlans ?? 0} planos · ${clientContext?.contentPackages ?? 0} pacotes · ${clientContext?.renderedAssets.length ?? 0} renders`,
          hint: `${clientContext?.schedules ?? 0} agendas · ${clientContext?.reports ?? 0} relatórios`,
        },
        {
          label: "Presença",
          value:
            clientSocialPresenceSummary?.totalFollowers !== null && clientSocialPresenceSummary?.totalFollowers !== undefined
              ? `${formatCompactNumber(clientSocialPresenceSummary.totalFollowers)} seguidores`
              : "Seguidores ainda não capturados",
          hint: `${clientSocialPresenceSummary?.networks.length ?? 0} rede(s) · ${clientSocialPresenceCoverageCount} snapshot(s)`,
        },
        {
          label: "Atualizado",
          value: clientContext?.updatedAt ? formatClock(clientContext.updatedAt) : "Sem atualização",
          hint: `${clientContext?.pendingApprovals ?? 0} pendências · ${clientContext?.approvals ?? 0} aprovações`,
        },
      ]
    : [];
  const clientFocusSocialFallbackCards = selectedClient
    ? [
        {
          label: "Perfis monitorados",
          value: `${clientContext?.profiles ?? 0} perfil(is)`,
          hint: clientSocialBreakdown ?? "Ainda sem snapshot social consolidado",
        },
        {
          label: "Maturidade social",
          value: clientEngagement !== null ? `${Math.round(clientEngagement)}%` : "Sem score",
          hint: clientSocialSnapshot?.raw_notes ?? "O snapshot mais recente ainda não trouxe notas detalhadas",
        },
        {
          label: "Cobertura",
          value: `${clientSocialPresenceCoverageCount} coleta(s)`,
          hint: clientReportData?.publicSignals.summary ?? "Sem leitura pública consolidada",
        },
      ]
    : [];
  const clientFocusCampaignFallbackCards = selectedClient
    ? [
        {
          label: "Etapa atual",
          value: clientContext?.campaignState?.stage ? formatArtifactStatus(clientContext.campaignState.stage) : "Sem trilho",
          hint: clientContext?.campaignState?.nextValidStage
            ? `Próxima etapa: ${formatArtifactStatus(clientContext.campaignState.nextValidStage)}`
            : "Sem próxima etapa definida",
        },
        {
          label: "Produção",
          value: `${clientContext?.contentPlans ?? 0} plano(s) · ${clientContext?.contentPackages ?? 0} pacote(s)`,
          hint: `${clientContext?.schedules ?? 0} agenda(s) · ${clientContext?.reports ?? 0} relatório(s)`,
        },
        {
          label: "Aprovações",
          value: `${clientContext?.pendingApprovals ?? 0} pendência(s)`,
          hint: clientContext?.campaignState?.blockers?.[0] ?? `${clientContext?.approvals ?? 0} aprovação(ões) no total`,
        },
      ]
    : [];
  const campaignPublishedItems = useMemo(() => {
    const publishedExecutions = (publishing?.executions ?? [])
      .filter((execution) => execution.status === "published")
      .slice(0, 3);
    const workflowTrail = effectiveSchedulePayload?.workflow?.agentTrail ?? contentPackagePayload?.visualDirection?.workflow?.agentTrail ?? [];
    const workflowSummary =
      workflowTrail.length > 0
        ? workflowTrail.map((agent) => agent.label).join(" → ")
        : "creator → visual-director → creative-renderer → reviewer → scheduler";

    return publishedExecutions.map((execution) => {
      const result = parsePublishingExecutionResult(execution.result_json);
      const targetPlatforms = normalizePublishingPlatforms(result?.executionSummary?.targetPlatforms ?? execution.platforms);

      return {
        id: execution.id,
        title: `${formatPublishingMode(execution.mode)} · ${formatArtifactStatus(execution.status)}`,
        subtitle: targetPlatforms.length > 0 ? targetPlatforms.map(formatPlatformLabel).join(" · ") : "Sem plataformas resolvidas",
        meta: result?.publishedAt ? `Publicado em ${formatDateTime(result.publishedAt)}` : `Executado em ${formatDateTime(execution.created_at)}`,
        status: formatCampaignItemStatus(execution.status),
        note: result?.executionSummary?.warnings?.length
          ? result.executionSummary.warnings[0]
          : execution.confirmed_at
            ? `Confirmado em ${formatDateTime(execution.confirmed_at)}`
            : "Sem confirmação registrada",
        workflow: workflowSummary,
        accent: "success" as const,
      };
    });
  }, [contentPackagePayload?.visualDirection?.workflow?.agentTrail, effectiveSchedulePayload?.workflow?.agentTrail, publishing]);
  const campaignScheduledItems = useMemo(() => {
    const workflowTrail = effectiveSchedulePayload?.workflow?.agentTrail ?? contentPackagePayload?.visualDirection?.workflow?.agentTrail ?? [];
    const workflowSummary =
      workflowTrail.length > 0
        ? workflowTrail.map((agent) => agent.label).join(" → ")
        : "creator → visual-director → creative-renderer → reviewer → scheduler";

    return campaignScheduleItems.slice(0, 4).map((item, index) => ({
      id: `${item.position ?? index}-${item.title ?? "item"}`,
      title: item.title?.trim() || "Item sem título",
      subtitle: [item.channel, item.format, item.pillar]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => formatPublishingToken(value))
        .join(" · "),
      meta: item.date ? `Agendado para ${formatDateTime(item.date)}` : "Sem data definida",
      status: formatCampaignItemStatus(item.status ?? "planned"),
      note: item.objective?.trim() || item.angle?.trim() || "Sem objetivo detalhado",
      workflow: workflowSummary,
      accent: item.status?.toLowerCase() === "published" ? ("success" as const) : item.status?.toLowerCase() === "blocked" ? ("warning" as const) : ("neutral" as const),
      previewVariant: findCampaignVariantForItem(item, campaignGalleryVariants),
    }));
  }, [
    contentPackagePayload?.visualDirection?.workflow?.agentTrail,
    effectiveSchedulePayload?.workflow?.agentTrail,
    campaignGalleryVariants,
    campaignScheduleItems,
  ]);
  const clientReportTabs = [
    { key: "client" as const, label: "Cliente" },
    { key: "market" as const, label: "Mercado / Concorrência" },
    { key: "before-after" as const, label: "Antes / Depois" },
  ];
  const clientReportFocusTabs = [
    { key: "overview" as const, label: "Visão geral" },
    { key: "client" as const, label: "Cliente" },
    { key: "market" as const, label: "Mercado" },
    { key: "social" as const, label: "Social" },
    { key: "campaign" as const, label: "Campanha" },
  ];
  const clientPipelineWeight = clientContext
    ? clientContext.profiles * 0.75 + clientContext.contentPlans * 1.2 + clientContext.contentPackages * 0.9 + clientContext.schedules * 0.8 + clientContext.reports * 0.6
    : 0;
  const clientApprovalPressure = clientContext ? clientContext.pendingApprovals + Math.max(0, clientContext.approvals - clientContext.approvedApprovals) : 0;

  const summary = useMemo(() => {
    const allActiveAgents = activeSquads.flatMap((entry) => entry.state.agents);
    const workingAgents = allActiveAgents.filter((agent) => agent.status === "working" || agent.status === "delivering").length;
    const doneAgents = allActiveAgents.filter((agent) => agent.status === "done").length;
    const handoffs = activeSquads.filter((entry) => entry.state.handoff).length;
    const progressAverage =
      activeSquads.length > 0
        ? activeSquads.reduce((acc, entry) => acc + entry.state.step.current / Math.max(entry.state.step.total, 1), 0) / activeSquads.length
        : 0;

    const engagementScore = clientEngagement ?? (progressAverage || heroProgress) * 100;
    const roiScore = clientContext
      ? Math.max(1.1, 1.4 + clientPipelineWeight / 4 + (clientEngagement ?? 0) / 60 - clientApprovalPressure / 12)
      : Math.max(1.2, 1.6 + (progressAverage || heroProgress) * 2.4);
    const inboxPenalty = clientContext && clientContext.clientRecordStatus && clientContext.clientRecordStatus !== "approved" ? 1 : 0;
    const inboxCount = clientContext ? Math.max(0, Math.round(clientApprovalPressure) + inboxPenalty) : Math.max(0, workingAgents + handoffs - doneAgents);

    return {
      engagement: `${Math.round(engagementScore)}%`,
      roi: `${roiScore.toFixed(1)}x`,
      inbox: `${inboxCount}`,
      workingAgents,
      doneAgents,
      handoffs,
      efficiency: clientContext
        ? `${Math.min(99, Math.round(58 + (clientEngagement ?? 0) * 0.3 + clientPipelineWeight * 1.8 - clientApprovalPressure * 2))}%`
        : `${Math.round(72 + (progressAverage || heroProgress) * 24)}%`,
      spend: clientContext
        ? 6200 + clientContext.profiles * 380 + clientContext.proposals * 620 + clientContext.contentPlans * 840 + clientContext.reports * 240 + clientApprovalPressure * 180
        : 8800 + activeCount * 2100 + workingAgents * 450 + handoffs * 300,
      budget: clientContext
        ? 14500 + clientContext.contentPlans * 1000 + clientContext.contentPackages * 850 + clientContext.schedules * 700 + clientContext.approvals * 120
        : 22000 + totalCount * 900,
    };
  }, [activeCount, activeSquads, clientApprovalPressure, clientContext, clientEngagement, clientPipelineWeight, heroProgress, totalCount]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      {
        icon: "person",
        label: ptBR.dashboard.feed.clientFocus,
        description: selectedClient
          ? `${selectedClient.name}${selectedClient.segment ? ` · ${selectedClient.segment}` : ""}${selectedClient.website_url ? ` · ${selectedClient.website_url}` : ""}`
          : ptBR.dashboard.client.empty,
        accent: selectedClient ? "success" : "neutral",
      },
      {
        icon: "groups",
        label: ptBR.dashboard.feed.monitoredSquads,
        description: `${activeCount} ativas de ${totalCount} registradas`,
      },
      {
        icon: isConnected ? "sync" : "sync_problem",
        label: isConnected ? ptBR.dashboard.feed.connected : ptBR.dashboard.feed.disconnected,
        description: `${ptBR.dashboard.feed.updated} ${formatClock(new Date(now).toISOString())}`,
        accent: isConnected ? "success" : "warning",
      },
    ];

    if (clientContext) {
      const snapshotScore = clientContext.snapshotScore !== null ? `${Math.round(clientContext.snapshotScore)}%` : "sem snapshot";
      const clientRecordStatus = clientContext.clientRecordStatus ? formatArtifactStatus(clientContext.clientRecordStatus) : "Sem registro";
      const campaignStage = clientContext.campaignState?.stage ? formatArtifactStatus(clientContext.campaignState.stage) : "Sem trilho";
      const campaignBlocker = clientContext.campaignState?.blockers[0] ?? null;
      const campaignReopenStages = clientContext.campaignState?.reopenStages ?? [];
      const clientRecordScope = clientContext.campaignState?.clientRecordChangeScope ?? "none";
      const clientRecordChangedSections = clientContext.campaignState?.clientRecordChangedSections ?? [];
      const clientRecordChangedPaths = clientContext.campaignState?.clientRecordChangedPaths ?? [];
      const clientRecordChangeDetails = clientContext.campaignState?.clientRecordChangeDetails ?? [];
      const publishExecutionStatus = clientContext.campaignState?.hasPublishingExecution
        ? formatArtifactStatus(clientContext.campaignState.publishExecutionStatus ?? "draft")
        : null;
      const clientRecordChangeLabel = clientRecordChangedSections.length > 0 ? clientRecordChangedSections.join(", ") : null;
      const clientRecordPathLabel = clientRecordChangedPaths.length > 0 ? clientRecordChangedPaths.join(", ") : null;
      const clientRecordDetailLabel = clientRecordChangeDetails.length > 0 ? clientRecordChangeDetails.map((item) => `${item.path}→${item.impact}`).join(", ") : null;

      items.splice(2, 0, {
        icon: "analytics",
        label: ptBR.dashboard.feed.socialIntelligence,
        description: `${clientContext.profiles} perfis · ${snapshotScore} de maturidade${clientSocialBreakdown ? ` · ${clientSocialBreakdown}` : ""}`,
      });

      items.push({
        icon: "stacked_line_chart",
        label: ptBR.dashboard.feed.pipeline,
        description: `${clientRecordStatus} · ${campaignStage}${clientRecordScope !== "none" ? ` · Regras: ${formatArtifactStatus(clientRecordScope)}` : ""}${clientRecordChangeLabel ? ` · Seções: ${clientRecordChangeLabel}` : ""}${clientRecordPathLabel ? ` · Paths: ${clientRecordPathLabel}` : ""}${clientRecordDetailLabel ? ` · Impacto: ${clientRecordDetailLabel}` : ""}${publishExecutionStatus ? ` · Publish: ${publishExecutionStatus}` : ""}${campaignBlocker ? ` · ${campaignBlocker}` : ""}${campaignReopenStages.length > 0 ? ` · Reabrir: ${campaignReopenStages.map((stage) => formatArtifactStatus(stage)).join(", ")}` : ""} · ${clientContext.productCount} produtos · ${clientContext.proposals} propostas · ${clientContext.contentPlans} planos · ${clientContext.contentPackages} pacotes`,
      });

      items.push({
        icon: "verified",
        label: ptBR.dashboard.feed.governance,
        description: `${clientContext.pendingApprovals} pendências · ${clientContext.approvals} aprovações · ${clientContext.reports} relatórios`,
        accent: clientContext.pendingApprovals > 0 ? "warning" : "success",
      });
    }

    if (heroSquad && heroState) {
      items.push({
        icon: "radar",
        label: ptBR.dashboard.feed.selection,
        description: `${heroSquad.name} · Etapa ${heroState.step.current}/${heroState.step.total}${heroState.step.label ? ` · ${heroState.step.label}` : ""}`,
      });

      if (heroState.startedAt) {
        items.push({
          icon: "schedule",
          label: ptBR.dashboard.timeline.elapsed,
          description: `${formatElapsed(now - new Date(heroState.startedAt).getTime())} em ciclo`,
        });
      }

      if (heroState.handoff) {
        items.push({
          icon: "swap_horiz",
          label: ptBR.dashboard.feed.handoff,
          description: `${heroState.handoff.from} → ${heroState.handoff.to}: ${heroState.handoff.message}`,
          accent: "warning",
        });
      }
    }

    return items;
  }, [activeCount, clientContext, clientSocialBreakdown, heroSquad, heroState, isConnected, now, selectedClient, totalCount]);

  const timelineRows = useMemo(() => {
    return activeSquads.map((entry) => {
      const progress = entry.state.step.current / Math.max(entry.state.step.total, 1);
      const startedAt = entry.state.startedAt ? formatElapsed(Date.now() - new Date(entry.state.startedAt).getTime()) : null;

      return {
        code: entry.squad.code,
        name: entry.squad.name,
        icon: entry.squad.icon,
        progress,
        stepLabel: entry.state.step.label,
        stepCurrent: entry.state.step.current,
        stepTotal: entry.state.step.total,
        startedAt,
        updatedAt: formatClock(entry.state.updatedAt),
        handoff: entry.state.handoff,
      };
    });
  }, [activeSquads, now]);

  const clientTimelineRows = useMemo(() => {
    if (!selectedClient || !clientContext) return [];

    const socialProgress =
      clientContext.snapshotScore !== null
        ? clientContext.snapshotScore / 100
        : clientContext.profiles > 0
          ? Math.min(0.9, 0.3 + clientContext.profiles * 0.12)
          : 0.12;
    const clientRecordProgress = clientContext.clientRecordStatus
      ? {
          draft: 0.35,
          review: 0.65,
          approved: 1,
          published: 1,
          rejected: 0.2,
          archived: 0.1,
        }[clientContext.clientRecordStatus.toLowerCase()] ?? 0.25
      : 0.15;
    const campaignProgress = clientContext.campaignState
      ? {
          intake: 0.1,
          client_record: 0.2,
          research: 0.3,
          strategy: 0.4,
          content_plan: 0.5,
          content_production_package: 0.6,
          schedule: 0.7,
          approval: 0.8,
          publish: 0.9,
          monitoring: 0.95,
          adjustment: 1,
        }[clientContext.campaignState.stage] ?? 0.15
      : Math.max(socialProgress, clientRecordProgress);
    const campaignBlocker = clientContext.campaignState?.blockers[0] ?? null;
    const campaignReopenStages = clientContext.campaignState?.reopenStages ?? [];
    const clientRecordScope = clientContext.campaignState?.clientRecordChangeScope ?? "none";
    const clientRecordChangedSections = clientContext.campaignState?.clientRecordChangedSections ?? [];
    const clientRecordChangedPaths = clientContext.campaignState?.clientRecordChangedPaths ?? [];
    const clientRecordChangeDetails = clientContext.campaignState?.clientRecordChangeDetails ?? [];
    const publishExecutionStatus = clientContext.campaignState?.hasPublishingExecution
      ? formatArtifactStatus(clientContext.campaignState.publishExecutionStatus ?? "draft")
      : null;
    const clientRecordChangeLabel = clientRecordChangedSections.length > 0 ? clientRecordChangedSections.join(", ") : null;
    const clientRecordPathLabel = clientRecordChangedPaths.length > 0 ? clientRecordChangedPaths.join(", ") : null;
    const clientRecordDetailLabel = clientRecordChangeDetails.length > 0 ? clientRecordChangeDetails.map((item) => `${item.path}→${item.impact}`).join(", ") : null;
    const governanceProgress = Math.min(1, 0.18 + clientContext.approvedApprovals * 0.22 + Math.max(0, clientContext.approvals - clientContext.pendingApprovals) * 0.1);

    return [
      {
        code: "client-social",
        name: ptBR.dashboard.agents.socialIntelligence,
        icon: "analytics",
        progress: socialProgress,
        stepLabel: clientContext.profiles > 0 ? `${clientContext.profiles} perfis` : "Aguardando descoberta",
        stepCurrent: Math.max(1, Math.round(socialProgress * 100)),
        stepTotal: 100,
        startedAt: null,
        updatedAt: clientContext.updatedAt ? formatClock(clientContext.updatedAt) : formatClock(new Date(now).toISOString()),
        handoff: null,
      },
      {
        code: "client-record",
        name: ptBR.dashboard.agents.clientRecord,
        icon: "description",
        progress: clientRecordProgress,
        stepLabel: clientContext.clientRecordStatus ? formatArtifactStatus(clientContext.clientRecordStatus) : "Sem registro",
        stepCurrent: Math.max(1, Math.round(clientRecordProgress * 100)),
        stepTotal: 100,
        startedAt: null,
        updatedAt: clientContext.updatedAt ? formatClock(clientContext.updatedAt) : formatClock(new Date(now).toISOString()),
        handoff: null,
      },
      {
        code: "client-campaign",
        name: ptBR.dashboard.agents.clientCampaign,
        icon: "stacked_line_chart",
        progress: campaignProgress,
        stepLabel: `${clientContext.campaignState ? formatArtifactStatus(clientContext.campaignState.stage) : `${clientContext.contentPlans} planos · ${clientContext.schedules} agendas`}${clientRecordScope !== "none" ? ` · Regras: ${formatArtifactStatus(clientRecordScope)}` : ""}${clientRecordChangeLabel ? ` · Seções: ${clientRecordChangeLabel}` : ""}${clientRecordPathLabel ? ` · Paths: ${clientRecordPathLabel}` : ""}${clientRecordDetailLabel ? ` · Impacto: ${clientRecordDetailLabel}` : ""}${publishExecutionStatus ? ` · Publish: ${publishExecutionStatus}` : ""}${campaignBlocker ? ` · ${campaignBlocker}` : ""}${campaignReopenStages.length > 0 ? ` · Reabrir: ${campaignReopenStages.map((stage) => formatArtifactStatus(stage)).join(", ")}` : ""}`,
        stepCurrent: Math.max(1, Math.round(campaignProgress * 100)),
        stepTotal: 100,
        startedAt: null,
        updatedAt: clientContext.updatedAt ? formatClock(clientContext.updatedAt) : formatClock(new Date(now).toISOString()),
        handoff: null,
      },
      {
        code: "client-governance",
        name: ptBR.dashboard.agents.governance,
        icon: "verified",
        progress: governanceProgress,
        stepLabel: `${clientContext.pendingApprovals} pendências · ${clientContext.approvals} aprovações`,
        stepCurrent: Math.max(1, Math.round(governanceProgress * 100)),
        stepTotal: 100,
        startedAt: null,
        updatedAt: clientContext.updatedAt ? formatClock(clientContext.updatedAt) : formatClock(new Date(now).toISOString()),
        handoff: null,
      },
    ];
  }, [clientContext, now, selectedClient]);

  const visibleTimelineRows = selectedClient && clientContext ? clientTimelineRows : timelineRows;
  const timelineTitle = selectedClient ? `${ptBR.dashboard.timeline.clientTitle}: ${selectedClient.name}` : ptBR.dashboard.timeline.title;
  const timelineSubtitle = selectedClient
    ? `${ptBR.dashboard.timeline.clientSubtitle}${selectedClient.segment ? ` · ${selectedClient.segment}` : ""}`
    : activeCount > 0
      ? `${activeCount} contextos ativos · ${timelineScope === "week" ? ptBR.dashboard.timeline.weekView : ptBR.dashboard.timeline.dayView}`
      : ptBR.dashboard.timeline.empty;

  const agentTiles = useMemo(() => {
    if (!selectedClient) {
      return heroTiles(activeSquads, heroState);
    }

      const clientRecordStatus = clientContext?.loading
        ? ptBR.dashboard.agents.loading
        : clientContext?.clientRecordStatus
          ? formatArtifactStatus(clientContext.clientRecordStatus)
          : "Sem registro";
    const snapshotScore = clientContext?.snapshotScore ?? null;
    const socialStatus = clientContext?.loading
      ? ptBR.dashboard.agents.loading
      : clientContext
        ? `${clientContext.profiles} perfis · ${snapshotScore !== null ? `${Math.round(snapshotScore)}%` : "sem snapshot"}${clientSocialBreakdown ? ` · ${clientSocialBreakdown}` : ""}`
        : "Sem leitura";
    const contentStatus = clientContext?.loading
      ? ptBR.dashboard.agents.loading
      : clientContext
        ? `${clientContext.proposals} propostas · ${clientContext.contentPlans} planos · ${clientContext.contentPackages} pacotes${clientContext.contentPackages > 0 ? " · direção visual ligada" : ""}${clientContext.campaignState?.clientRecordChangeScope && clientContext.campaignState.clientRecordChangeScope !== "none" ? ` · regras ${formatArtifactStatus(clientContext.campaignState.clientRecordChangeScope)}` : ""}${clientContext.campaignState?.clientRecordChangedSections?.length ? ` · seções ${clientContext.campaignState.clientRecordChangedSections.join(", ")}` : ""}${clientContext.campaignState?.clientRecordChangedPaths?.length ? ` · paths ${clientContext.campaignState.clientRecordChangedPaths.join(", ")}` : ""}${clientContext.campaignState?.clientRecordChangeDetails?.length ? ` · impacto ${clientContext.campaignState.clientRecordChangeDetails.map((item) => `${item.path}→${item.impact}`).join(", ")}` : ""}${clientContext.campaignState?.hasPublishingExecution ? ` · publish ${formatArtifactStatus(clientContext.campaignState.publishExecutionStatus ?? "draft")}` : ""}${clientContext.campaignState?.blockers[0] ? ` · ${clientContext.campaignState.blockers[0]}` : ""}`
        : "Sem pipeline";
    const campaignAction = clientContext?.campaignState
      ? clientContext.campaignState.blockers[0]
        ? clientContext.campaignState.reopenStages.length > 0
          ? `Ação: revisar base · Reabrir ${clientContext.campaignState.reopenStages.map((stage) => formatArtifactStatus(stage)).join(", ")}`
          : "Ação: revisar base"
        : clientContext.campaignState.clientRecordChangeScope !== "none"
          ? `Ação: ${formatArtifactStatus(clientContext.campaignState.nextValidStage ?? clientContext.campaignState.stage)}`
          : clientContext.campaignState.nextValidStage
          ? `Ação: ${formatArtifactStatus(clientContext.campaignState.nextValidStage)}`
          : "Ação: ciclo fechado"
      : "Ação: fechar base";
    const campaignFlowState = clientContext?.campaignState
      ? clientContext.campaignState.blockers[0]
        ? /stale|atualiza|regerar|desatual/i.test(clientContext.campaignState.blockers[0])
          ? "em correção"
          : "bloqueado"
        : "pronto para avançar"
      : "bloqueado";
    const campaignFlowIndex = {
      bloqueado: 0,
      "em correção": 1,
      "pronto para avançar": 2,
    }[campaignFlowState];
    const governanceStatus = clientContext?.loading
      ? ptBR.dashboard.agents.loading
      : clientContext
        ? `${clientContext.pendingApprovals} pendências · ${clientContext.approvals} aprovações`
        : "Sem governança";

    return [
      {
        title: `${ptBR.dashboard.agents.socialIntelligence}: ${selectedClient.name}`,
        status: socialStatus,
        metric: snapshotScore !== null ? `${Math.round(snapshotScore)}%` : clientContext?.profiles ? `${clientContext.profiles}` : ptBR.dashboard.agents.idle,
        badge: clientContext?.profiles ? "Ativo" : "Novo",
      },
      {
        title: `${ptBR.dashboard.agents.clientRecord}: ${selectedClient.name}`,
        status: clientRecordStatus,
        metric: clientContext?.clientRecordStatus ? clientContext.clientRecordStatus : "0",
        badge: clientContext?.clientRecordStatus ? "Acompanhando" : "Sem registro",
      },
      {
        title: `${ptBR.dashboard.agents.contentPipeline}: ${selectedClient.name}`,
        status: contentStatus,
        action: campaignAction,
        flowState: campaignFlowState,
        flowIndex: campaignFlowIndex,
        metric: clientContext ? `${clientContext.contentPlans}/${clientContext.schedules}` : "0/0",
        badge: clientContext?.contentPackages ? "Direção pronta" : clientContext?.contentPlans ? "Em produção" : "Planejamento",
      },
      {
        title: `${ptBR.dashboard.agents.governance}: ${selectedClient.name}`,
        status: governanceStatus,
        metric: clientContext ? `${clientContext.pendingApprovals}` : "0",
        badge: clientContext?.pendingApprovals ? "Atenção" : "OK",
      },
    ];
  }, [activeSquads, clientContext, clientSocialBreakdown, heroState, selectedClient]);

  const openConsole = () => {
    setConsoleOpen(true);
    setLastDashboardAction("Console operacional aberto");
    recordOfferMetric({
      eventName: "console_opened",
      clientId: selectedClient?.id ?? null,
      source: "dashboard",
    });
    void backendApi.trackOfferEvent({
      eventName: "console_opened",
      clientId: selectedClient?.id ?? undefined,
      source: "dashboard",
      properties: {
        selectedSquad: selectedSquad ?? null,
      },
    });
    requestAnimationFrame(() => {
      consoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const focusSearch = () => {
    searchRef.current?.focus();
  };

  const handleMainScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const scrollTop = event.currentTarget.scrollTop;

    if (mainScrollWriteTimerRef.current !== null) {
      window.clearTimeout(mainScrollWriteTimerRef.current);
    }

    mainScrollWriteTimerRef.current = window.setTimeout(() => {
      writeDashboardMainScroll(scrollTop);
      mainScrollWriteTimerRef.current = null;
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (mainScrollWriteTimerRef.current !== null) {
        window.clearTimeout(mainScrollWriteTimerRef.current);
      }
    };
  }, []);

  const selectFirstVisibleSquad = () => {
    const first = visibleSquads[0] ?? squadList[0];
    if (first) {
      handleSquadSelect(first.code, first.name);
    }
  };

  const handleSquadSelect = (squadCode: string, squadName?: string) => {
    selectSquad(squadCode);
    setLastDashboardAction(squadName ? `Squad em foco: ${squadName}` : `Squad em foco: ${squadCode}`);
  };

  const selectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    writeSelectedClientId(clientId);
    setClientMenuOpen(false);
    setLastDashboardAction(`Cliente selecionado: ${clients.find((client) => client.id === clientId)?.name ?? clientId}`);

    const nextClient = clients.find((client) => client.id === clientId) ?? null;
    recordOfferMetric({
      eventName: "client_selected",
      clientId,
      source: "dashboard",
    });
    void backendApi.trackOfferEvent({
      eventName: "client_selected",
      clientId,
      source: "dashboard",
      properties: {
        clientName: nextClient?.name ?? null,
        clientSegment: nextClient?.segment ?? null,
      },
    });
  };

  return (
    <div className={selectedClient ? "dashboard-shell client-focus-mode" : "dashboard-shell"} style={shellStyle}>
      <aside className="dashboard-sidebar" style={sidebarStyle}>
        <div style={brandStyle}>
          <div style={brandMarkStyle}>O</div>
          <div>
            <div style={brandTitleStyle}>OmniAgent</div>
            <div style={brandEyebrowStyle}>{ptBR.dashboard.brandEyebrow}</div>
          </div>
        </div>

        <nav style={navStyle}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.active ? "nav-item nav-item--active" : "nav-item"}
              style={item.active ? navActiveStyle : navItemStyle}
              onClick={item.key === "clients" ? onOpenClients : undefined}
            >
              {item.active ? <span className="nav-indicator" /> : null}
              <AppIcon name={item.icon} style={navIconStyle} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={sidebarSectionStyle}>
          <div style={sidebarSectionHeaderStyle}>
            <span style={eyebrowStyle}>{sidebarContextEyebrow}</span>
            <span style={mutedTinyStyle}>{sidebarContextValue}</span>
          </div>

          <div style={squadRailStyle} className="soft-scrollbar">
            {visibleSquads.length === 0 ? (
            <EmptyStateNotice message={ptBR.squads.empty} />
            ) : (
              visibleSquads.map((squad) => {
                const state = activeStates.get(squad.code);
                const isSelected = selectedSquad === squad.code;

                return (
                  <button
                    key={squad.code}
                    type="button"
                    onClick={() => handleSquadSelect(squad.code, squad.name)}
                    style={isSelected ? squadItemActiveStyle : squadItemStyle}
                  >
                    <span style={squadIconStyle}>{squad.icon}</span>
                    <span style={squadInfoStyle}>
                      <span style={squadNameStyle}>{squad.name}</span>
                      <span style={squadDescriptionStyle}>
                        {state ? `${state.step.current}/${state.step.total} · ${state.step.label}` : squad.description}
                      </span>
                    </span>
                    <span style={squadStatusStyle}>
                      <span style={isSelected ? activeDotStyle : idleDotStyle} />
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div style={sidebarFooterStyle}>
          <button type="button" className="action-button action-button--primary" style={primaryActionStyle} onClick={openConsole}>
            <AppIcon name="add" style={actionIconStyle} />
            {ptBR.dashboard.sidebar.newCampaign}
          </button>
          <div style={supportRowStyle}>
            {SUPPORT_ITEMS.map((item, index) => (
              <button
                key={item.key}
                type="button"
                className="support-link"
                style={supportLinkStyle}
                onClick={index === 0 ? openConsole : focusSearch}
              >
                <AppIcon name={item.icon} style={supportIconStyle} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div style={connectionCardStyle}>
            <span style={connectionDotStyle(isConnected)} />
            <div style={connectionTextWrapStyle}>
              <div style={connectionStatusStyle}>{connectedLabel}</div>
              <div style={connectionHintStyle}>
                {activeCount > 0
                  ? `${activeCount} contextos em execução`
                  : "Aguardando atualização do cliente"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div style={contentStyle}>
        <header className="dashboard-topbar" style={topbarStyle}>
          <div style={topbarRightStyle}>
            {onCreateClient ? (
              <button
                type="button"
                className="topbar-link"
                style={{ ...topbarLinkStyle, display: "flex", alignItems: "center", gap: 8 }}
                onClick={onCreateClient}
              >
                <AppIcon name="person_add" style={actionIconStyle} />
                Novo Cliente
              </button>
            ) : null}
            {onLogout ? (
              <button
                type="button"
                className="topbar-link"
                style={{ ...topbarLinkStyle, display: "flex", alignItems: "center", gap: 8 }}
                onClick={onLogout}
              >
                <AppIcon name="logout" style={topbarLinkIconStyle} />
                Sair
              </button>
            ) : null}
          </div>
        </header>

        <main ref={mainScrollRef} className="soft-scrollbar" style={mainStyle} onScroll={handleMainScroll}>
          <section className="section-card animate-rise-in client-focus-keep" style={clientCardStyle}>
            <div style={clientCardHeaderStyle}>
              <div style={clientIdentityStyle}>
                <div style={clientAvatarStyle}>{clientAvatarInitials(selectedClient)}</div>
                <div style={clientTextWrapStyle}>
                  <div style={eyebrowStyle}>{ptBR.dashboard.client.eyebrow}</div>
                  <h2 style={clientTitleStyle}>{selectedClient?.name ?? ptBR.dashboard.client.empty}</h2>
                  <p style={clientSubtitleStyle}>
                    {selectedClient
                      ? `${ptBR.dashboard.client.segment}: ${selectedClient.segment ?? "—"} · ${ptBR.dashboard.client.website}: ${selectedClient.website_url ?? "—"}`
                      : ptBR.dashboard.hero.portfolio}
                  </p>
                  {selectedClientRelationshipLabel ? <p style={clientRelationshipStyle}>{selectedClientRelationshipLabel}</p> : null}
                </div>
              </div>

              <div ref={clientMenuRef} style={clientMenuWrapStyle}>
                <button
                  type="button"
                  className="client-switcher"
                  style={clientSwitchButtonStyle}
                  onClick={() => setClientMenuOpen((prev) => !prev)}
                >
                  <div style={clientSwitchAvatarStyle}>{clientAvatarInitials(selectedClient)}</div>
                  <div style={clientSwitchTextStyle}>
                    <div style={clientSwitchLabelStyle}>{ptBR.dashboard.client.activeLabel}</div>
                    <div style={clientSwitchValueStyle}>{selectedClient?.name ?? ptBR.dashboard.client.empty}</div>
                  </div>
                  <AppIcon name="expand_more" style={clientSwitchIconStyle} />
                </button>

                {clientMenuOpen ? (
                  <div className="section-card" style={clientMenuStyle}>
                    {clients.length === 0 ? (
                      <div style={clientMenuEmptyStyle}>{ptBR.dashboard.client.empty}</div>
                    ) : (
                      clients.map((client) => {
                        const isSelected = client.id === selectedClient?.id;
                        const relationshipLabel = getClientRelationshipLabel(client);

                        return (
                          <button
                            key={client.id}
                            type="button"
                            style={isSelected ? clientMenuItemSelectedStyle : clientMenuItemStyle}
                            onClick={() => selectClient(client.id)}
                          >
                            <span style={clientMenuAvatarStyle}>{clientAvatarInitials(client)}</span>
                            <span style={clientMenuItemTextStyle}>
                              <span style={clientMenuItemTitleStyle}>{client.name}</span>
                              <span style={clientMenuItemSubtitleStyle}>
                                {client.segment ?? ptBR.dashboard.client.empty}
                              </span>
                              {relationshipLabel ? <span style={clientMenuItemRelationshipStyle}>{relationshipLabel}</span> : null}
                            </span>
                            {isSelected ? <span style={clientMenuSelectedDotStyle} /> : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="section-card animate-rise-in client-focus-keep" style={heroCardStyle}>
            <div style={heroLeftStyle}>
              <div style={heroHeaderStyle}>
                <div>
                  <div style={eyebrowStyle}>{ptBR.dashboard.hero.eyebrow}</div>
                  <h1 style={heroTitleStyle}>{heroContextTitle}</h1>
                  <p style={heroSubtitleStyle}>{heroContextSubtitle}</p>
                </div>
                <button type="button" className="action-button" style={ghostActionStyle} onClick={selectFirstVisibleSquad}>
                  {ptBR.dashboard.hero.switchLabel}
                </button>
              </div>

              <div style={heroMetaRowStyle}>
                <span style={heroPillStyle}>{heroContextMetaOne}</span>
                <span style={heroPillStyle}>{heroContextMetaTwo}</span>
                <span style={heroPillStyle}>{heroContextMetaThree}</span>
              </div>
            </div>

            <div style={heroRightStyle}>
              <div style={avatarStackStyle}>
                {selectedClient ? (
                  <div style={heroAvatarStyle}>{clientAvatarInitials(selectedClient)}</div>
                ) : (
                  activeSquads.slice(0, 3).map((entry) => (
                    <div key={entry.squad.code} style={heroAvatarStyle}>
                      {entry.squad.icon}
                    </div>
                  ))
                )}
                <div style={heroMoreAvatarStyle}>
                  {selectedClient ? "CL" : Math.max(0, activeCount - 3) > 0 ? `+${activeCount - 3}` : activeCount}
                </div>
              </div>
              <div style={heroSideLabelStyle}>{ptBR.dashboard.hero.clientLabel}</div>
              <div style={heroSideValueStyle}>{heroContextTitle}</div>
              <div style={heroSideHintStyle}>
                {selectedClient
                  ? `${selectedClient.segment ?? ptBR.dashboard.client.empty} · ${selectedClient.website_url ?? "—"}`
                  : heroState?.handoff
                    ? `${heroState.handoff.from} → ${heroState.handoff.to}`
                    : "Aguardando próxima atualização do cliente"}
              </div>
            </div>
          </section>

          {/* legacy dashboard content kept commented while the focused layout renders below
          <section style={agentsGridStyle}>
              {agentTiles.map((tile) => (
                <div key={tile.title} className="section-card animate-rise-in" style={agentCardStyle}>
                  <div style={agentCardHeaderStyle}>
                    <div>
                      <div style={eyebrowStyle}>{ptBR.dashboard.agents.eyebrow}</div>
                      <div style={agentNameStyle}>{tile.title}</div>
                    </div>
                    <span style={agentBadgeStyle}>{tile.badge}</span>
                  </div>
                  <div style={agentStatusStyle}>{tile.status}</div>
                  <div style={agentMetricStyle}>{tile.metric}</div>
                </div>
              ))}
              <button
                type="button"
                className="section-card animate-rise-in"
                style={deployCardStyle}
                onClick={openConsole}
              >
                <AppIcon name="add" style={deployIconStyle} />
                <span style={deployTextStyle}>{ptBR.dashboard.agents.deployNew}</span>
              </button>
          </section>

          <section className="client-focus-keep" style={dashboardGridStyle}>
            <div style={leftColumnStyle}>
              <div style={metricsGridStyle}>
                <MetricCard
                  eyebrow={ptBR.dashboard.metrics.engagement}
                  value={summary.engagement}
                  accent={summary.engagement}
                  hint={
                    selectedClient
                      ? `${ptBR.dashboard.metrics.engagementHint} · ${selectedClient.name}`
                      : ptBR.dashboard.metrics.engagementHint
                  }
                />
                <MetricCard
                  eyebrow={ptBR.dashboard.metrics.roi}
                  value={summary.roi}
                  accent="linear-gradient(135deg, rgba(107,56,212,0.95), rgba(132,85,239,0.95))"
                  hint={selectedClient ? `Leitura financeira de ${selectedClient.name}` : ptBR.dashboard.metrics.roiHint}
                />
                <MetricCard
                  eyebrow={ptBR.dashboard.metrics.inbox}
                  value={summary.inbox}
                  accent={summary.inbox === "0" ? "linear-gradient(135deg, rgba(16,185,129,0.88), rgba(34,197,94,0.88))" : "linear-gradient(135deg, rgba(244,114,182,0.92), rgba(217,70,239,0.92))"}
                  hint={selectedClient ? `Pendências de ${selectedClient.name}` : ptBR.dashboard.metrics.inboxHint}
                  warning={summary.inbox !== "0"}
                />
              </div>

              <section className="section-card animate-rise-in" style={timelineCardStyle}>
                <div style={panelHeaderStyle}>
                  <div>
                    <div style={eyebrowStyle}>{ptBR.dashboard.timeline.eyebrow}</div>
                    <h2 style={panelTitleStyle}>{timelineTitle}</h2>
                  </div>
                  <div style={scopeToggleStyle}>
                    <button
                      type="button"
                      style={timelineScope === "week" ? scopeButtonActiveStyle : scopeButtonStyle}
                      onClick={() => setTimelineScope("week")}
                    >
                      {ptBR.dashboard.timeline.week}
                    </button>
                    <button
                      type="button"
                      style={timelineScope === "day" ? scopeButtonActiveStyle : scopeButtonStyle}
                      onClick={() => setTimelineScope("day")}
                    >
                      {ptBR.dashboard.timeline.day}
                    </button>
                  </div>
                </div>

                <div style={panelCaptionStyle}>{timelineSubtitle}</div>

                <div style={timelineListStyle}>
                  {visibleTimelineRows.length === 0 ? (
                    <EmptyStateNotice message={ptBR.dashboard.timeline.empty} />
                  ) : (
                    visibleTimelineRows.map((row) => (
                      <article key={row.code} style={timelineRowStyle}>
                        <div style={timelineRowHeaderStyle}>
                          <div style={timelineRowIdentityStyle}>
                            <div style={timelineAvatarStyle}>
                              <AppIcon name={row.icon} style={timelineAvatarIconStyle} />
                            </div>
                            <div>
                              <div style={timelineRowTitleStyle}>{row.name}</div>
                              <div style={timelineRowHintStyle}>
                                {ptBR.dashboard.timeline.current} · {row.stepCurrent}/{row.stepTotal}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            style={timelineActionStyle}
                            onClick={selectedClient ? openConsole : () => selectSquad(row.code)}
                          >
                            {selectedClient ? ptBR.dashboard.timeline.inspect : ptBR.dashboard.hero.switchLabel}
                          </button>
                        </div>

                        <div style={progressTrackStyle}>
                          <div style={{ ...progressFillStyle, width: `${Math.round(row.progress * 100)}%` }} />
                        </div>

                        <div style={timelineMetaStyle}>
                          <span>{row.stepLabel || ptBR.dashboard.timeline.scheduled}</span>
                          <span>{row.startedAt ? `${ptBR.dashboard.timeline.elapsed} ${row.startedAt}` : row.updatedAt}</span>
                        </div>

                        {row.handoff ? (
                          <div style={handoffCardStyle}>
                            <span style={handoffBadgeStyle}>{ptBR.dashboard.timeline.handoff}</span>
                            <span style={handoffTextStyle}>
                              {row.handoff.from} → {row.handoff.to}: {row.handoff.message}
                            </span>
                          </div>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="section-card animate-rise-in" style={workspaceCardStyle}>
                <div style={panelHeaderStyle}>
                  <div>
                    <div style={eyebrowStyle}>{ptBR.dashboard.workspace.eyebrow}</div>
                    <h2 style={panelTitleStyle}>{ptBR.dashboard.workspace.title}</h2>
                  </div>
                  <div style={panelCaptionStyle}>{ptBR.dashboard.workspace.subtitle}</div>
                </div>

                <div style={sceneShellCardStyle}>
                  <React.Suspense fallback={<LoadingPanel label="Carregando pré-visualização operacional..." />}>
                    <OfficeScene />
                  </React.Suspense>
                </div>
              </section>

              <details
                ref={consoleRef}
                open={consoleOpen}
                onToggle={(event) => setConsoleOpen(event.currentTarget.open)}
                style={consoleDetailsStyle}
              >
                <summary style={consoleSummaryStyle}>
                  <div>
                    <div style={eyebrowStyle}>{ptBR.dashboard.console.eyebrow}</div>
                    <h2 style={panelTitleStyle}>{ptBR.dashboard.console.title}</h2>
                    <p style={consoleSubtitleStyle}>{ptBR.dashboard.console.subtitle}</p>
                  </div>
                  <span style={consoleToggleStyle}>{consoleOpen ? ptBR.dashboard.console.close : ptBR.dashboard.console.open}</span>
                </summary>
                <div style={consolePanelWrapStyle}>
                  <React.Suspense fallback={<LoadingPanel label="Carregando consultor operacional..." />}>
                    <AssistantConsultantPanel client={selectedClient} />
                  </React.Suspense>
                  <React.Suspense fallback={<LoadingPanel label="Carregando console técnico..." />}>
                    <BackendOpsPanel />
                  </React.Suspense>
                </div>
              </details>
            </div>

            <aside style={rightColumnStyle}>
              <section className="section-card animate-rise-in" style={feedCardStyle}>
                <div style={panelHeaderStyle}>
                  <div>
                    <div style={eyebrowStyle}>{ptBR.dashboard.feed.eyebrow}</div>
                    <h2 style={panelTitleStyle}>{ptBR.dashboard.feed.title}</h2>
                  </div>
                  <div style={panelCaptionStyle}>
                    {isConnected ? ptBR.dashboard.feed.connected : ptBR.dashboard.feed.disconnected}
                  </div>
                </div>

                <div style={feedListStyle}>
                  {feedItems.length === 0 ? (
                    <EmptyStateNotice message={ptBR.dashboard.feed.empty} />
                  ) : (
                    feedItems.map((item) => (
                      <article key={`${item.label}-${item.description}`} style={feedRowStyle}>
                        <div style={feedIconWrapStyle(item.accent)}>
                          <AppIcon name={item.icon} style={feedIconStyle} />
                        </div>
                        <div style={feedTextStyle}>
                          <div style={feedLabelStyle}>{item.label}</div>
                          <div style={feedDescriptionStyle}>{item.description}</div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <div style={feedMiniSummaryStyle}>
                  <div style={feedMiniLabelStyle}>{selectedClient ? ptBR.dashboard.feed.clientFocus : ptBR.dashboard.feed.selection}</div>
                  <div style={feedMiniValueStyle}>{selectedClient?.name ?? heroSquad?.name ?? ptBR.dashboard.hero.titleFallback}</div>
                  <div style={feedMiniHintStyle}>
                    {clientContext
                      ? `${clientContext.profiles} perfis · ${clientContext.productCount} produtos · ${clientContext.pendingApprovals} pendências`
                      : heroState
                        ? `${heroState.step.current}/${heroState.step.total} etapas`
                        : "Sem operação ativa"}
                  </div>
                </div>
              </section>

              {selectedClient ? (
                <section className="section-card animate-rise-in client-focus-keep" style={clientReportCardStyle}>
                  <div style={panelHeaderStyle}>
                    <div>
                      <div style={eyebrowStyle}>relatório unificado</div>
                      <h2 style={panelTitleStyle}>{clientReportData?.headline ?? "Cliente + mercado + presença"}</h2>
                    </div>
                    <div style={scopeToggleStyle}>
                      {clientReportTabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          style={clientReportView === tab.key ? scopeButtonActiveStyle : scopeButtonStyle}
                          onClick={() => handleClientReportViewChange(tab.key)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {clientReportFocusTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        style={clientReportFocus === tab.key ? scopeButtonActiveStyle : clientReportFocusChipStyle}
                        onClick={() => handleClientReportFocusChange(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {clientReportView === "client" ? (
                    <>
                      <div style={clientReportGridStyle}>
                        <div style={clientReportStatStyle}>
                          <div style={clientReportStatLabelStyle}>Tese comercial</div>
                          <div style={clientReportStatValueStyle}>{clientReportData?.commercialSummary ?? "Sem tese comercial consolidada"}</div>
                          <div style={clientReportStatHintStyle}>
                            {clientReportData?.recommendedPositioning ?? "Posicionamento recomendado ainda não consolidado"}
                          </div>
                        </div>

                        <div style={clientReportStatStyle}>
                          <div style={clientReportStatLabelStyle}>Marca do cliente</div>
                          <div style={clientReportStatValueStyle}>{clientReportData?.brandSummary ?? "Sem brand profile consolidado"}</div>
                          <div style={clientReportStatHintStyle}>
                            {clientReportData?.sourceIds.brandProfileId
                              ? `Brand profile ${clientReportData.sourceIds.brandProfileId.slice(0, 8)}`
                              : "Sem brand profile persistido"}
                          </div>
                        </div>

                        <div style={clientReportStatStyle}>
                          <div style={clientReportStatLabelStyle}>Oferta ativa</div>
                          <div style={clientReportStatValueStyle}>{clientReportData?.offerSummary ?? "Sem offer profile consolidado"}</div>
                          <div style={clientReportStatHintStyle}>
                            {clientContext?.activeProductName
                              ? `${clientContext.activeProductName}${clientReportData?.sourceIds.offerProfileId ? ` · Offer profile ${clientReportData.sourceIds.offerProfileId.slice(0, 8)}` : ""}`
                              : clientReportData?.sourceIds.offerProfileId
                                ? `Offer profile ${clientReportData.sourceIds.offerProfileId.slice(0, 8)}`
                                : "Sem oferta ativa persistida"}
                          </div>
                        </div>

                        <div style={clientReportStatStyle}>
                          <div style={clientReportStatLabelStyle}>Direção criativa</div>
                          <div style={clientReportStatValueStyle}>{clientReportData?.creativeSummary ?? "Sem creative profile consolidado"}</div>
                          <div style={clientReportStatHintStyle}>
                            {clientReportData?.sourceIds.creativeProfileId
                              ? `Creative profile ${clientReportData.sourceIds.creativeProfileId.slice(0, 8)}`
                              : "Sem creative profile persistido"}
                          </div>
                        </div>

                        <div style={clientReportStatStyle}>
                          <div style={clientReportStatLabelStyle}>Brief comercial da proposta</div>
                          <div style={clientReportStatValueStyle}>{clientContext?.proposalBrief?.summary ?? "Sem brief comercial consolidado"}</div>
                          <div style={clientReportStatHintStyle}>
                            {clientContext?.proposalBrief?.ctaRecommendation
                              ? `${clientContext.proposalBrief.ctaRecommendation}${clientContext.proposalBrief.proposalAngle ? ` · ${clientContext.proposalBrief.proposalAngle}` : ""}`
                              : "Brief ainda não consolidado"}
                          </div>
                        </div>

                        <div style={clientReportStatStyle}>
                          <div style={clientReportStatLabelStyle}>Leitura do cliente</div>
                          <div style={clientReportStatValueStyle}>{clientReportData?.clientSummary ?? "Sem client record consolidado"}</div>
                          <div style={clientReportStatHintStyle}>
                            {clientReportData?.sourceIds.clientRecordId ? `Client record ${clientReportData.sourceIds.clientRecordId.slice(0, 8)}` : "Sem client record persistido"}
                          </div>
                        </div>
                      </div>

                      {clientContext?.proposalBrief ? (
                        <div style={clientReportSnapshotCardStyle}>
                          <div style={clientReportSnapshotHeaderStyle}>
                            <div>
                              <div style={clientReportStatLabelStyle}>Brief comercial consolidado</div>
                              <div style={clientReportSnapshotTitleStyle}>
                                {clientContext.proposalBrief.targetAudience ?? "Público prioritário não definido"}
                              </div>
                            </div>
                            <div style={clientReportSnapshotMetaStyle}>
                              {clientContext.proposalBrief.summary ?? "Brief comercial derivado da proposta mais recente."}
                            </div>
                          </div>

                          <div style={clientReportSnapshotGridStyle}>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>UVP</span>
                              <span style={clientReportSnapshotValueStyle}>{clientContext.proposalBrief.uniqueValueProposition ?? "Sem UVP consolidada"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Persona</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {clientContext.proposalBrief.buyerPersonas.length > 0
                                  ? clientContext.proposalBrief.buyerPersonas.join(" · ")
                                  : "Sem personas inferidas"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Ângulo</span>
                              <span style={clientReportSnapshotValueStyle}>{clientContext.proposalBrief.proposalAngle ?? "Sem ângulo definido"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>CTA</span>
                              <span style={clientReportSnapshotValueStyle}>{clientContext.proposalBrief.ctaRecommendation ?? "Sem CTA definida"}</span>
                            </div>
                          </div>

                          <div style={clientReportChipGroupStyle}>
                            {clientContext.proposalBrief.proofAssets.length > 0 ? (
                              clientContext.proposalBrief.proofAssets.map((asset) => (
                                <span key={asset} style={clientReportMetaPillStyle}>
                                  {asset}
                                </span>
                              ))
                            ) : (
                              <span style={clientReportMetaPillStyle}>Sem proof assets</span>
                            )}
                            <span style={clientReportMetaPillStyle}>
                              {clientContext.proposalBrief.brandArchetype ?? "Arquétipo não definido"}
                            </span>
                            <span style={clientReportMetaPillStyle}>
                              {clientContext.proposalBrief.visualDirection ?? "Direção visual não definida"}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {brandSnapshot ? (
                        <div style={clientReportSnapshotCardStyle}>
                          <div style={clientReportSnapshotHeaderStyle}>
                            <div>
                              <div style={clientReportStatLabelStyle}>Sinais confirmados da marca</div>
                              <div style={clientReportSnapshotTitleStyle}>{brandSnapshot.brandName ?? selectedClient?.name ?? "Marca sem nome"}</div>
                            </div>
                            <div style={clientReportSnapshotMetaStyle}>
                              {brandSnapshot.summary ?? "Marca persistida a partir da pesquisa e do chat."}
                            </div>
                          </div>

                          <div style={clientReportSnapshotGridStyle}>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Site</span>
                              <span style={clientReportSnapshotValueStyle}>{brandSnapshot.websiteTitle ?? brandSnapshot.website ?? "Sem site"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Contato</span>
                              <span style={clientReportSnapshotValueStyle}>{brandSnapshot.contactEmail ?? "Sem e-mail confirmado"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Logo</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {brandSnapshot.logoUrl ? (
                                  <a href={brandSnapshot.logoUrl} target="_blank" rel="noreferrer" style={clientReportSnapshotLinkStyle}>
                                    Abrir arte do logo
                                  </a>
                                ) : (
                                  "Sem logo confirmado"
                                )}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Oferta sob demanda</span>
                              <span style={clientReportSnapshotValueStyle}>{offerSnapshot?.summary ?? "Produtos cadastrados sob demanda"}</span>
                            </div>
                          </div>

                          <div style={clientReportChipGroupStyle}>
                            <span style={clientReportSnapshotChipLabelStyle}>Paleta</span>
                            {brandSnapshot.visualPalette.length > 0 ? (
                              brandSnapshot.visualPalette.map((color) => (
                                <span key={color} style={clientReportPaletteChipStyle(color)}>
                                  {color}
                                </span>
                              ))
                            ) : (
                              <span style={clientReportMetaPillStyle}>Sem paleta confirmada</span>
                            )}
                          </div>

                          <div style={clientReportChipGroupStyle}>
                            <span style={clientReportSnapshotChipLabelStyle}>Redes confirmadas</span>
                            {brandSnapshot.socialProfiles.length > 0 ? (
                              brandSnapshot.socialProfiles.map((profile) => (
                                <a
                                  key={`${profile.platform}-${profile.handle ?? profile.profileUrl ?? "social"}`}
                                  href={profile.profileUrl ?? undefined}
                                  target={profile.profileUrl ? "_blank" : undefined}
                                  rel={profile.profileUrl ? "noreferrer" : undefined}
                                  style={clientReportMetaPillStyle}
                                >
                                  {profile.platform}
                                  {profile.handle ? ` · ${profile.handle}` : ""}
                                </a>
                              ))
                            ) : (
                              <span style={clientReportMetaPillStyle}>Sem redes confirmadas</span>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {briefSnapshot ? (
                        <div style={clientReportSnapshotCardStyle}>
                          <div style={clientReportSnapshotHeaderStyle}>
                            <div>
                              <div style={clientReportStatLabelStyle}>Brief confirmado</div>
                              <div style={clientReportSnapshotTitleStyle}>{briefSnapshot.summary ?? "Brief sem resumo"}</div>
                            </div>
                            <div style={clientReportSnapshotMetaStyle}>
                              {briefSnapshot.recommendedPositioning ?? "Posicionamento ainda não definido"} ·{" "}
                              {briefSnapshot.archetype ?? "arquetipo nao definido"}
                            </div>
                          </div>

                          <div style={clientReportSnapshotGridStyle}>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Site</span>
                              <span style={clientReportSnapshotValueStyle}>{briefSnapshot.websiteUrl ?? "Sem site"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>E-mail</span>
                              <span style={clientReportSnapshotValueStyle}>{briefSnapshot.contactEmail ?? "Sem e-mail confirmado"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Segmento</span>
                              <span style={clientReportSnapshotValueStyle}>{briefSnapshot.segment ?? "Sem segmento"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Status</span>
                              <span style={clientReportSnapshotValueStyle}>{briefSnapshot.status ?? "Sem status"}</span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Nota</span>
                              <span style={clientReportSnapshotValueStyle}>{briefSnapshot.note ?? "Sem nota registrada"}</span>
                            </div>
                          </div>

                          <div style={clientReportChipGroupStyle}>
                            <span style={clientReportSnapshotChipLabelStyle}>Paleta no brief</span>
                            {briefSnapshot.visualPalette.length > 0 ? (
                              briefSnapshot.visualPalette.map((color) => (
                                <span key={color} style={clientReportPaletteChipStyle(color)}>
                                  {color}
                                </span>
                              ))
                            ) : (
                              <span style={clientReportMetaPillStyle}>Sem paleta no brief</span>
                            )}
                            <span style={clientReportSnapshotChipLabelStyle}>Produtos</span>
                            <span style={clientReportMetaPillStyle}>
                              {briefSnapshot.productsByDemand === true ? "Sob demanda" : briefSnapshot.productsByDemand === false ? "Catálogo fixo" : "Não informado"}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {creativeSnapshot ? (
                        <div style={clientReportSnapshotCardStyle}>
                          <div style={clientReportSnapshotHeaderStyle}>
                            <div>
                              <div style={clientReportStatLabelStyle}>Inteligência criativa</div>
                              <div style={clientReportSnapshotTitleStyle}>
                                {creativeSnapshot.targetAudience ?? creativeSnapshot.audience ?? "Público principal não definido"}
                              </div>
                            </div>
                            <div style={clientReportSnapshotMetaStyle}>
                              {creativeSnapshot.uniqueValueProposition ?? creativeSnapshot.positioning ?? "Proposta de valor ainda não consolidada"}
                            </div>
                          </div>

                          <div style={clientReportSnapshotGridStyle}>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Personas</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.buyerPersonas.length > 0 ? creativeSnapshot.buyerPersonas.join(" · ") : "Sem personas inferidas"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>UVP</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.uniqueValueProposition ?? "Sem UVP consolidada"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Mood</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.mood ?? creativeSnapshot.brandFeel ?? "Sem mood consolidado"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Fundo</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.backgroundTreatment ?? "Sem tratamento de fundo"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Overlay</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.overlayGuidance ?? "Sem orientação de overlay"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Imagem</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.imageStory ?? "Sem história de imagem"}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Logo</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.logoUrl ? (
                                  <a href={creativeSnapshot.logoUrl} target="_blank" rel="noreferrer" style={clientReportSnapshotLinkStyle}>
                                    Abrir logo
                                  </a>
                                ) : (
                                  creativeSnapshot.logoTreatment ?? "Sem logo confirmado"
                                )}
                              </span>
                            </div>
                            <div style={clientReportSnapshotLineStyle}>
                              <span style={clientReportSnapshotLabelStyle}>Imagem do produto</span>
                              <span style={clientReportSnapshotValueStyle}>
                                {creativeSnapshot.productImageryDirection ?? creativeSnapshot.imageRecommendation ?? "Sem direção de imagem"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {socialProfilesSnapshot.length > 0 ? (
                        <div style={clientReportSnapshotCardStyle}>
                          <div style={clientReportSnapshotHeaderStyle}>
                            <div>
                              <div style={clientReportStatLabelStyle}>Perfis sociais confirmados</div>
                              <div style={clientReportSnapshotTitleStyle}>{socialProfilesSnapshot.length} perfil(is) conectados</div>
                            </div>
                            <div style={clientReportSnapshotMetaStyle}>
                              {clientSocialPresenceSummary?.summary ?? "Perfis persistidos a partir da descoberta e presença social."}
                            </div>
                          </div>

                          <div style={clientReportChipGroupStyle}>
                            {socialProfilesSnapshot.map((profile) => (
                              <a
                                key={`${profile.platform}-${profile.handle ?? profile.profileUrl ?? "social"}`}
                                href={profile.profileUrl ?? undefined}
                                target={profile.profileUrl ? "_blank" : undefined}
                                rel={profile.profileUrl ? "noreferrer" : undefined}
                                style={clientReportMetaPillStyle}
                              >
                                {profile.platform}
                                {profile.handle ? ` · ${profile.handle}` : ""}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  {clientReportView === "market" ? (
                    <div style={clientReportGridStyle}>
                      <div style={clientReportStatStyle}>
                        <div style={clientReportStatLabelStyle}>Cobertura geográfica</div>
                        <div style={clientReportStatValueStyle}>{clientReportData?.geographyCoverage.summary ?? "Cobertura geográfica não consolidada"}</div>
                        <div style={clientReportStatHintStyle}>
                          {clientReportData?.geographyCoverage.level
                            ? `${clientReportData.geographyCoverage.level} · confiança ${clientReportData.geographyCoverage.confidence}%`
                            : "Sem recorte geográfico definido"}
                        </div>
                      </div>

                      <div style={clientReportStatStyle}>
                        <div style={clientReportStatLabelStyle}>Mercado</div>
                        <div style={clientReportStatValueStyle}>{clientReportData?.marketSummary ?? "Sem leitura de mercado"}</div>
                        <div style={clientReportStatHintStyle}>
                          {clientReportData?.marketStage ? `Estágio ${clientReportData.marketStage}` : "Estágio não consolidado"}
                        </div>
                      </div>

                      <div style={clientReportStatStyle}>
                        <div style={clientReportStatLabelStyle}>Concorrência</div>
                        <div style={clientReportStatValueStyle}>{clientReportData?.competitionSummary ?? "Benchmark ainda não consolidado"}</div>
                        <div style={clientReportStatHintStyle}>
                          {clientReportData?.sourceCoverage.baselines ?? 0} baselines e {clientReportData?.sourceCoverage.comparisons ?? 0} comparações
                        </div>
                      </div>

                      <div style={clientReportStatStyle}>
                        <div style={clientReportStatLabelStyle}>Fontes públicas</div>
                        <PublicSignalsBadge
                          variant="compact"
                          sourceCount={clientReportData?.publicSignals.sourceCount ?? 0}
                          queryCount={clientReportData?.publicSignals.queryCount ?? 0}
                          summary={clientReportData?.publicSignals.summary}
                        />
                      </div>
                    </div>
                  ) : null}

                  {clientReportView === "before-after" ? (
                    <div style={clientReportGridStyle}>
                      <div style={clientReportStatStyle}>
                        <div style={clientReportStatLabelStyle}>Antes e depois</div>
                        <div style={clientReportStatValueStyle}>{clientReportData?.beforeAfterSummary ?? "Sem baseline e checkpoint"}</div>
                        <div style={clientReportStatHintStyle}>
                          {clientReportData?.operationalSummary ?? "Sem leitura operacional"}
                        </div>
                      </div>

                      <div style={clientReportStatStyle}>
                        <div style={clientReportStatLabelStyle}>Crescimento social</div>
                        <div style={clientReportStatValueStyle}>{clientReportData?.growth.summary ?? "Métricas de crescimento ainda não foram alimentadas."}</div>
                        <div style={clientReportStatHintStyle}>
                          {clientReportData?.missingMetrics.length
                            ? `${clientReportData.missingMetrics.length} métricas pendentes`
                            : "Todas as métricas-chave foram encontradas"}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div style={clientReportActionRowStyle}>
                    <span style={clientReportMetaPillStyle}>Cliente {clientReportData?.weights.client ?? 35}%</span>
                    <span style={clientReportMetaPillStyle}>Mercado {clientReportData?.weights.market ?? 35}%</span>
                    <span style={clientReportMetaPillStyle}>Concorrência {clientReportData?.weights.competition ?? 30}%</span>
                  </div>

                  <div style={clientReportMetaRowStyle}>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.sourceCoverage.profiles ?? 0} perfis
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.geographyCoverage?.scope ?? "nacional"}
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.sourceCoverage.proposals ?? 0} proposta(s)
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.sourceCoverage.baselines ?? 0} baselines
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.sourceCoverage.checkpoints ?? 0} checkpoints
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.sourceCoverage.offerProfiles ?? 0} oferta(s)
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.sourceCoverage.creativeProfiles ?? 0} direção criativa
                    </span>
                    <span style={clientReportMetaPillStyle}>
                      {clientReportData?.missingMetrics.length ? `${clientReportData.missingMetrics.length} métricas pendentes` : "métricas sociais completas"}
                    </span>
                    <PublicSignalsBadge
                      sourceCount={clientReportData?.publicSignals.sourceCount ?? 0}
                      queryCount={clientReportData?.publicSignals.queryCount ?? 0}
                      summary={clientReportData?.publicSignals.summary}
                    />
                  </div>

                  <div style={clientReportMetaRowStyle}>
                    {clientReportData?.keySignals.map((signal) => (
                      <span key={signal} style={clientReportMetaPillStyle}>
                        {signal}
                      </span>
                    ))}
                  </div>

                  {clientReportFocus === "overview" || clientReportFocus === "market" ? (
                    <div style={clientReportNarrativeGridStyle}>
                      <div style={clientReportNarrativeCardStyle}>
                        <div style={clientReportNarrativeLabelStyle}>Mercado</div>
                        <div style={clientReportNarrativeValueStyle}>
                          {clientReportData?.marketSummary ?? "Sem leitura de mercado"}
                        </div>
                        <div style={clientReportNarrativeHintStyle}>
                          {clientReportData?.geographyCoverage?.summary ?? "Cobertura geográfica não consolidada"}
                        </div>
                        <div style={clientReportNarrativeHintStyle}>
                          <PublicSignalsBadge
                            sourceCount={clientReportData?.publicSignals.sourceCount ?? 0}
                            queryCount={clientReportData?.publicSignals.queryCount ?? 0}
                            summary={clientReportData?.publicSignals.summary}
                          />
                        </div>
                      </div>

                      <div style={clientReportNarrativeCardStyle}>
                        <div style={clientReportNarrativeLabelStyle}>Concorrência</div>
                        <div style={clientReportNarrativeValueStyle}>
                          {clientReportData?.competitionSummary ?? "Benchmark ainda não consolidado"}
                        </div>
                        <div style={clientReportNarrativeHintStyle}>
                          {clientReportData?.sourceCoverage.baselines ?? 0} baselines · {clientReportData?.sourceCoverage.comparisons ?? 0} comparações · {clientReportData?.sourceCoverage.monitoringReports ?? 0} relatórios
                        </div>
                      </div>

                      <div style={clientReportNarrativeCardStyle}>
                        <div style={clientReportNarrativeLabelStyle}>Cobertura do recorte</div>
                        <div style={clientReportNarrativeValueStyle}>
                          {clientReportData?.geographyCoverage?.scope ?? "nacional"}
                        </div>
                        <div style={clientReportNarrativeHintStyle}>
                          {clientReportData?.sourceCoverage.profiles ?? 0} perfis e {clientReportData?.sourceCoverage.proposals ?? 0} proposta(s)
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {clientReportFocus === "overview" || clientReportFocus === "social" ? (
                    <div style={socialPresencePanelStyle}>
                      <div style={socialPresenceHeaderStyle}>
                        <div>
                          <div style={clientReportNarrativeLabelStyle}>Snapshot social</div>
                          <div style={socialPresenceTitleStyle}>
                            Redes monitoradas
                          </div>
                          <div style={socialPresenceSubtitleStyle}>
                            {clientSocialPresenceSummary?.lastCapturedAt
                              ? `Coletado em ${formatDateTime(clientSocialPresenceSummary.lastCapturedAt)}`
                              : "Aguardando a primeira captura social"}
                          </div>
                        </div>
                      </div>

                      {clientSocialNetworksForDisplay.length ? (
                        <div style={socialPresenceNetworkListStyle}>
                          {clientSocialNetworksForDisplay.map((network) => (
                            <article key={`${network.platform}-${network.profileUrl}-${network.collectedAt}`} style={socialPresenceNetworkCardStyle}>
                              <div style={socialPresenceNetworkTopStyle}>
                                <div style={socialPresenceNetworkIdentityStyle}>
                                  <div style={socialPresenceNetworkPlatformStyle}>{formatPlatformLabel(network.platform)}</div>
                                  <div style={socialPresenceNetworkHandleStyle}>{network.handle ?? "Handle não identificado"}</div>
                                  <div style={socialPresenceNetworkUrlStyle}>{network.profileUrl}</div>
                                </div>

                                <div style={socialPresenceNetworkStatusStyle}>
                                  <span style={socialPresenceStatusPillStyle(network.observationStatus)}>
                                    {formatObservationStatus(network.observationStatus)}
                                  </span>
                                  <span style={socialPresenceConfidenceStyle}>{network.confidence}%</span>
                                </div>
                              </div>

                              {network.followersCount !== null || network.postsCount !== null || network.latestPostAt ? (
                                <div style={socialPresenceMetricGridStyle}>
                                  {network.followersCount !== null ? (
                                    <div style={socialPresenceMetricCardStyle}>
                                      <div style={socialPresenceMetricLabelStyle}>Seguidores</div>
                                      <div style={socialPresenceMetricValueStyle}>{formatCompactNumber(network.followersCount)}</div>
                                    </div>
                                  ) : null}

                                  {network.postsCount !== null ? (
                                    <div style={socialPresenceMetricCardStyle}>
                                      <div style={socialPresenceMetricLabelStyle}>Postagens</div>
                                      <div style={socialPresenceMetricValueStyle}>{formatCompactNumber(network.postsCount)}</div>
                                    </div>
                                  ) : null}

                                  {network.latestPostAt ? (
                                    <div style={socialPresenceMetricCardStyle}>
                                      <div style={socialPresenceMetricLabelStyle}>Última postagem</div>
                                      <div style={socialPresenceMetricValueStyle}>{formatDateTime(network.latestPostAt)}</div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div style={socialPresenceEmptyMetricsStyle}>Métricas não capturadas nesta coleta.</div>
                              )}

                              <div style={socialPresenceNetworkFooterStyle}>
                                <span>Coletado em {formatDateTime(network.collectedAt)}</span>
                                <span>Observação {formatNoteSummary(network.notes)}</span>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyStateNotice message="Aguardando a primeira coleta social para exibir redes monitoradas." />
                      )}
                    </div>
                  ) : null}

                  {clientReportFocus === "overview" || clientReportFocus === "campaign" ? (
                    <div style={campaignSamplePanelStyle}>
                      <div style={campaignSampleHeaderStyle}>
                        <div>
                          <div style={clientReportNarrativeLabelStyle}>Campanha</div>
                          <div style={campaignSampleTitleStyle}>
                            {publishing?.schedule
                              ? "Publicados e agendados"
                              : effectiveSchedulePayload?.items?.length
                                ? "Agenda estruturada, sem publicação"
                                : "Campanha sem agenda publicada"}
                          </div>
                          <div style={campaignSampleSubtitleStyle}>
                            {publishing?.executions.length
                              ? `${publishing.executions.length} execução(ões) de publicação`
                              : "Ainda não há execuções de publicação para este cliente"}
                            {effectiveSchedulePayload?.items?.length
                              ? ` · ${effectiveSchedulePayload.items.length} item(ns) agendado(s)`
                              : " · Sem itens agendados"}
                          </div>
                        </div>

                        <div style={campaignSampleMetaRowStyle}>
                          <span style={clientReportMetaPillStyle}>
                            {publishing?.latestExecution ? formatCampaignItemStatus(publishing.latestExecution.status) : "Sem publicação"}
                          </span>
                          <span style={clientReportMetaPillStyle}>
                            {effectiveSchedulePayload?.cadence ? effectiveSchedulePayload.cadence : "Cadência não informada"}
                          </span>
                          <span style={clientReportMetaPillStyle}>{creativeWorkflowSummary}</span>
                        </div>
                      </div>

                      <div style={campaignSampleFocusGridStyle}>
                        <article style={campaignSampleFocusCardStyle}>
                          <div style={campaignSampleFocusHeaderStyle}>
                            <div style={campaignSampleFocusTextWrapStyle}>
                              <div style={campaignSampleFocusLabelStyle}>Post planejado</div>
                              <div style={campaignSampleFocusTitleStyle}>
                                {featuredCreativeItem?.title?.trim() ?? "Nenhum post planejado"}
                              </div>
                              <div style={campaignSampleFocusSubtitleStyle}>
                                {featuredCreativeItem
                                  ? `${featuredCreativeItem.channel ?? "Canal não definido"} · ${featuredCreativeItem.format ?? "Formato não definido"}`
                                  : "Aguardando agenda estruturada para exibir o post planejado."}
                              </div>
                            </div>
                            {featuredCreativeItem ? (
                              <span style={campaignSampleStatusPillStyle("neutral")}>
                                {formatCampaignItemStatus(featuredCreativeItem.status ?? "planned")}
                              </span>
                            ) : null}
                          </div>

                          <div style={campaignSampleFocusBodyStyle}>
                            <div style={campaignSampleFocusBodyLabelStyle}>Objetivo</div>
                            <div style={campaignSampleFocusBodyValueStyle}>
                              {featuredCreativeItem?.objective?.trim() ?? "Sem objetivo definido"}
                            </div>
                          </div>

                          <div style={campaignSampleFocusBodyStyle}>
                            <div style={campaignSampleFocusBodyLabelStyle}>Gancho</div>
                            <div style={campaignSampleFocusBodyValueStyle}>
                              {featuredCreativeItem?.hook?.trim() ?? "Sem gancho definido"}
                            </div>
                          </div>

                          <div style={campaignSampleFocusBodyStyle}>
                            <div style={campaignSampleFocusBodyLabelStyle}>CTA</div>
                            <div style={campaignSampleFocusBodyValueStyle}>
                              {featuredCreativeItem?.cta?.trim() ?? "Sem CTA definido"}
                            </div>
                          </div>
                        </article>

                        <article style={campaignSamplePreviewCardStyle}>
                          <div style={campaignSamplePreviewHeaderStyle}>
                            <div style={campaignSamplePreviewTextWrapStyle}>
                              <div style={campaignSamplePreviewLabelStyle}>Arte Remotion</div>
                              <div style={campaignSamplePreviewTitleStyle}>
                                {campaignRemotionPreview ? "Vídeo da campanha" : "Sem render pronto"}
                              </div>
                              <div style={campaignSamplePreviewSubtitleStyle}>
                                {campaignRemotionPreview
                                  ? "A mesma peça do render final, mostrada ao lado do post planejado."
                                  : "Quando houver render pronto, ele aparece aqui como preview."
                                }
                              </div>
                            </div>
                            {campaignRemotionPreview ? (
                              <button
                                type="button"
                                className="action-button"
                                style={renderedAssetPrimaryActionStyle}
                                onClick={() => void openRenderedAssetPlayback(campaignRemotionPreview.asset, campaignRemotionPreview.payload.title ?? null)}
                              >
                                <AppIcon name="play_arrow" style={actionIconStyle} />
                                Abrir player
                              </button>
                            ) : null}
                          </div>

                          {campaignRemotionPreview ? (
                            campaignRemotionPreview.asset.asset_mime_type?.startsWith("video/") && campaignRemotionVideoUrl ? (
                              <video
                                controls
                                muted
                                loop
                                playsInline
                                poster={campaignRemotionPreview.payload.previewDataUrl ?? undefined}
                                src={campaignRemotionVideoUrl}
                                style={campaignSamplePreviewMediaStyle}
                              />
                            ) : (
                              <img
                                alt="Prévia do render final"
                                src={campaignRemotionPreview.payload.previewDataUrl ?? undefined}
                                style={campaignSamplePreviewMediaStyle}
                              />
                            )
                          ) : (
                            <EmptyStateNotice message="Aguardando o render Remotion para mostrar a arte da campanha." />
                          )}

                          {campaignRemotionPreview ? (
                            <div style={campaignSamplePreviewMetaStyle}>
                              <span style={clientReportMetaPillStyle}>{renderedAssetOutputFiles.length} arquivos</span>
                              <span style={clientReportMetaPillStyle}>
                                {campaignRemotionPreview.payload.variantLabel ?? campaignRemotionPreview.payload.variantType ?? "render"}
                              </span>
                            </div>
                          ) : null}
                        </article>
                      </div>

                      <div style={campaignSampleGridStyle}>
                        <section style={campaignSampleColumnStyle}>
                          <div style={campaignSampleColumnHeaderStyle}>
                            <div style={campaignSampleColumnTitleStyle}>Últimos publicados</div>
                            <div style={campaignSampleColumnHintStyle}>
                              {campaignPublishedItems.length ? "execuções concluídas" : "sem publicações confirmadas"}
                            </div>
                          </div>

                          <div style={campaignSampleListStyle}>
                            {campaignPublishedItems.length ? (
                              campaignPublishedItems.map((item) => {
                                return (
                                  <article key={item.id} style={campaignSampleItemStyle}>
                                    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
                                      <div style={campaignSampleItemTopStyle}>
                                        <div style={campaignSampleItemIdentityStyle}>
                                          <div style={campaignSampleItemTitleStyle}>{item.title}</div>
                                          <div style={campaignSampleItemSubtitleStyle}>{item.subtitle}</div>
                                        </div>
                                        <span style={campaignSampleStatusPillStyle(item.accent)}>{item.status}</span>
                                      </div>
                                      <div style={campaignSampleItemMetaStyle}>{item.meta}</div>
                                      <div style={clientFocusCampaignItemWorkflowStyle}>{item.workflow}</div>
                                      <div style={campaignSampleItemNoteStyle}>{item.note}</div>
                                    </div>
                                  </article>
                                );
                              })
                            ) : (
                              <EmptyStateNotice message="Aguardando a primeira execução publicada para mostrar os últimos itens." />
                            )}
                          </div>
                        </section>

                        <section style={campaignSampleColumnStyle}>
                          <div style={campaignSampleColumnHeaderStyle}>
                            <div style={campaignSampleColumnTitleStyle}>Agendados</div>
                            <div style={campaignSampleColumnHintStyle}>
                              {campaignScheduledItems.length ? "agenda viva" : "sem agenda disponível"}
                            </div>
                          </div>

                          <div style={campaignSampleListStyle}>
                            {campaignScheduledItems.length ? (
                              campaignScheduledItems.map((item) => (
                                <article key={item.id} style={campaignSampleItemStyle}>
                                  <div style={campaignSampleItemTopStyle}>
                                    <div style={campaignSampleItemIdentityStyle}>
                                      <div style={campaignSampleItemTitleStyle}>{item.title}</div>
                                      <div style={campaignSampleItemSubtitleStyle}>{item.subtitle}</div>
                                    </div>
                                    <span style={campaignSampleStatusPillStyle(item.accent)}>{item.status}</span>
                                  </div>
                                  <div style={campaignSampleItemMetaStyle}>{item.meta}</div>
                                  <div style={clientFocusCampaignItemWorkflowStyle}>{item.workflow}</div>
                                  <div style={campaignSampleItemNoteStyle}>{item.note}</div>
                                </article>
                              ))
                            ) : (
                              <EmptyStateNotice message="Ainda não há itens de agenda para exibir." />
                            )}
                          </div>
                        </section>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {selectedClient ? (
                <section className="section-card animate-rise-in" style={marketPresenceCardStyle}>
                  <div style={panelHeaderStyle}>
                    <div>
                      <div style={eyebrowStyle}>presença longitudinal</div>
                      <h2 style={panelTitleStyle}>Baseline, checkpoint e analogia</h2>
                    </div>
                    <div style={panelCaptionStyle}>
                      {marketPresenceComparison ? marketPresenceComparison.reading : marketPresenceBaseline ? "baseline ativa" : "sem baseline"}
                    </div>
                  </div>

                  <div style={marketPresenceGridStyle}>
                    <div style={marketPresenceStatStyle}>
                      <div style={marketPresenceStatLabelStyle}>Baseline</div>
                      <div style={marketPresenceStatValueStyle}>
                        {marketPresenceBaseline
                          ? `P ${marketPresenceBaseline.presence_score} · C ${marketPresenceBaseline.consistency_score} · Pr ${marketPresenceBaseline.proof_score} · Cv ${marketPresenceBaseline.conversion_score}`
                          : "sem baseline"}
                      </div>
                      <div style={marketPresenceStatHintStyle}>
                        {marketPresenceBaseline ? `Maturidade ${Math.round((marketPresenceBaseline.presence_score + marketPresenceBaseline.consistency_score + marketPresenceBaseline.proof_score + marketPresenceBaseline.conversion_score) / 4)}` : "Crie uma baseline para iniciar a leitura"}
                      </div>
                    </div>

                    <div style={marketPresenceStatStyle}>
                      <div style={marketPresenceStatLabelStyle}>Checkpoint</div>
                      <div style={marketPresenceStatValueStyle}>
                        {marketPresenceCheckpoint
                          ? `P ${marketPresenceCheckpoint.presence_score} · C ${marketPresenceCheckpoint.consistency_score} · Pr ${marketPresenceCheckpoint.proof_score} · Cv ${marketPresenceCheckpoint.conversion_score}`
                          : "sem checkpoint"}
                      </div>
                      <div style={marketPresenceStatHintStyle}>
                        {marketPresenceCheckpoint
                          ? `Coletado em ${formatClock(marketPresenceCheckpoint.collected_at)}`
                          : "Registre um checkpoint depois das ações orgânicas"}
                      </div>
                    </div>

                    <div style={marketPresenceStatStyle}>
                      <div style={marketPresenceStatLabelStyle}>Leitura</div>
                      <div style={marketPresenceStatValueStyle}>
                        {marketPresenceComparison ? marketPresenceComparison.executive_summary : "sem comparação"}
                      </div>
                      <div style={marketPresenceStatHintStyle}>
                        {marketPresenceComparison ? marketPresenceComparison.analogy : "A comparação vira analogia para leitura executiva"}
                      </div>
                    </div>
                  </div>

                  <div style={marketPresenceActionRowStyle}>
                    <button type="button" className="action-button" style={secondaryActionStyle} onClick={handleMarketPresenceBaseline} disabled={marketPresenceBusy}>
                      {marketPresenceBusy ? "Processando..." : "Criar baseline"}
                    </button>
                    <button type="button" className="action-button" style={secondaryActionStyle} onClick={handleMarketPresenceCheckpoint} disabled={marketPresenceBusy || !marketPresenceBaseline}>
                      {marketPresenceBusy ? "Processando..." : "Criar checkpoint"}
                    </button>
                    <button type="button" className="action-button" style={primaryActionStyle} onClick={handleMarketPresenceCompare} disabled={marketPresenceBusy || !marketPresenceBaseline || !marketPresenceCheckpoint}>
                      Comparar agora
                    </button>
                  </div>

                  <div style={marketPresenceMetaRowStyle}>
                    <span style={marketPresenceMetaPillStyle}>
                      {marketPresence?.baselines.length ?? 0} baselines
                    </span>
                    <span style={marketPresenceMetaPillStyle}>
                      {marketPresence?.checkpoints.length ?? 0} checkpoints
                    </span>
                    <span style={marketPresenceMetaPillStyle}>
                      {marketPresence?.comparisons.length ?? 0} comparações
                    </span>
                  </div>

                  {marketPresenceMessage ? <div style={marketPresenceMessageStyle}>{marketPresenceMessage}</div> : null}
                </section>
              ) : null}

              <React.Suspense fallback={<LoadingPanel label="Carregando portfólio de produtos..." />}>
                <ClientProductsPanel client={selectedClient} />
              </React.Suspense>

              <React.Suspense fallback={<LoadingPanel label="Carregando métricas da oferta..." />}>
                <OfferMetricsPanel
                  clientId={selectedClient?.id ?? null}
                />
              </React.Suspense>

              <section className="section-card animate-rise-in" style={efficiencyCardStyle}>
                <div style={panelHeaderStyle}>
                  <div>
                    <div style={efficiencyEyebrowStyle}>{ptBR.dashboard.efficiency.eyebrow}</div>
                    <h2 style={efficiencyValueStyle}>{summary.efficiency}</h2>
                  </div>
                </div>

                <div style={efficiencyStatsStyle}>
                  <div>
                    <div style={efficiencyMetaLabelStyle}>{ptBR.dashboard.efficiency.spent}</div>
                    <div style={efficiencyMetaValueStyle}>{formatCurrency(summary.spend)}</div>
                  </div>
                  <div>
                    <div style={efficiencyMetaLabelStyle}>{ptBR.dashboard.efficiency.budget}</div>
                    <div style={efficiencyMetaValueStyle}>{formatCurrency(summary.budget)}</div>
                  </div>
                  <div style={efficiencyTrendStyle}>
                    <AppIcon name="trending_up" style={efficiencyTrendIconStyle} />
                    <span>{ptBR.dashboard.efficiency.control}</span>
                  </div>
                </div>
              </section>

              <section className="section-card animate-rise-in" style={feedCardStyle}>
                <div style={panelHeaderStyle}>
                  <div>
                    <div style={eyebrowStyle}>
                      {selectedClient ? ptBR.dashboard.timeline.clientSummaryEyebrow : ptBR.dashboard.timeline.summaryEyebrow}
                    </div>
                    <h2 style={panelTitleStyle}>
                      {selectedClient ? ptBR.dashboard.timeline.clientSummaryTitle : ptBR.dashboard.timeline.summaryTitle}
                    </h2>
                  </div>
                </div>

                {contentPackagePayload?.visualDirection ? (
                  <div style={{ marginBottom: 16 }}>
                    <ArtifactSummaryCard
                      title="Direção visual do pacote"
                      subtitle={contentPackagePayload.visualDirection.productImagePolicy}
                      metrics={[
                        { label: "Mecanismo", value: contentPackagePayload.visualDirection.mechanism },
                        { label: "Canal mestre", value: contentPackagePayload.visualDirection.masterAsset },
                        { label: "Suporte", value: contentPackagePayload.visualDirection.supportChannels.length },
                        { label: "Primeiro passe", value: contentPackagePayload.visualDirection.firstPass },
                      ]}
                      bullets={contentPackagePayload.visualDirection.rules}
                    />
                  </div>
                ) : null}

                {renderedAssetPayload ? (
                  <div ref={renderedAssetSectionRef} style={{ marginBottom: 16 }}>
                    <ArtifactSummaryCard
                      title="Render final"
                      subtitle={renderedAssetPayload.summary ?? "Arte final pronta para revisão e publicação"}
                      metrics={[
                        { label: "Engine", value: renderedAssetPayload.renderEngine ?? "playwright" },
                        { label: "Formato", value: renderedAssetPayload.assetFormat ?? "png" },
                        { label: "Status", value: renderedAssetPayload.status ?? clientContext?.renderedAsset?.status ?? "n/a" },
                        { label: "Package", value: renderedAssetPayload.contentPackageVersion ?? "n/a" },
                        { label: "Schedule", value: renderedAssetPayload.scheduleVersion ?? "n/a" },
                      ]}
                      bullets={
                        renderedAssetPayload.workflow?.trail?.map((agent) => `${agent.label} · ${agent.output}`) ?? [
                          "A mesma peça exibida na campanha",
                          "Render pronto para revisão",
                        ]
                      }
                    />
                    {campaignRemotionPreview ? (
                      <div
                        style={{
                          marginTop: 12,
                          borderRadius: 24,
                          border: "1px solid rgba(180,104,73,0.18)",
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,248,242,0.94) 56%, rgba(255,236,224,0.9) 100%)",
                          boxShadow: "0 18px 42px rgba(180,104,73,0.08)",
                          padding: 14,
                          display: "grid",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              borderRadius: 999,
                              padding: "7px 10px",
                              background: "rgba(180,104,73,0.12)",
                              color: "#7b3f21",
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            Pronto para revisão
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              borderRadius: 999,
                              padding: "7px 10px",
                              background: "rgba(255,255,255,0.7)",
                              color: "rgba(92,58,44,0.86)",
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              border: "1px solid rgba(180,104,73,0.14)",
                            }}
                          >
                            {renderedAssetOutputFiles.length} arquivos
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(92,58,44,0.68)", fontWeight: 800 }}>
                              Preview do render
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#3a2519" }}>
                              Executar o vídeo final agora
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(92,58,44,0.76)", lineHeight: 1.45 }}>
                              Reproduza o MP4 pronto, ou baixe o áudio e as legendas no mesmo bloco.
                            </div>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
                            {clientContext?.renderedAsset?.asset_mime_type?.startsWith("video/") && renderedAssetVideoUrl ? (
                              <button
                                type="button"
                                className="action-button"
                                style={{
                                  ...secondaryActionStyle,
                                  background: "var(--primary)",
                                  color: "white",
                                  boxShadow: "0 16px 32px rgba(180,104,73,0.22)",
                                  transform: "translateY(-1px)",
                                }}
                                onClick={() => void toggleRenderedAssetVideoPlayback()}
                              >
                                <AppIcon name={renderedAssetVideoPlaying ? "pause" : "play_arrow"} style={actionIconStyle} />
                                {renderedAssetVideoPlaying ? "Pausar execução" : "Executar vídeo"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="action-button"
                              style={secondaryActionStyle}
                              onClick={() => void handleRenderedAssetDownload(clientContext.renderedAsset, "video", renderedAssetPayload.title ?? null)}
                              disabled={renderedAssetDownload !== null}
                            >
                              <AppIcon name="download" style={actionIconStyle} />
                              {renderedAssetDownload === "video" ? "Baixando MP4..." : "Baixar MP4"}
                            </button>
                            <button
                              type="button"
                              className="action-button"
                              style={secondaryActionStyle}
                              onClick={() => void handleRenderedAssetDownload(clientContext.renderedAsset, "audio", renderedAssetPayload.title ?? null)}
                              disabled={renderedAssetDownload !== null}
                            >
                              <AppIcon name="volume_up" style={actionIconStyle} />
                              {renderedAssetDownload === "audio" ? "Baixando WAV..." : "Baixar WAV"}
                            </button>
                            <button
                              type="button"
                              className="action-button"
                              style={secondaryActionStyle}
                              onClick={() => void handleRenderedAssetDownload(clientContext.renderedAsset, "subtitles", renderedAssetPayload.title ?? null)}
                              disabled={renderedAssetDownload !== null}
                            >
                              <AppIcon name="subtitles" style={actionIconStyle} />
                              {renderedAssetDownload === "subtitles" ? "Baixando SRT..." : "Baixar SRT"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {renderedAssetPayload.previewDataUrl ? (
                      <div
                        style={{
                          marginTop: 12,
                          borderRadius: 24,
                          border: "1px solid rgba(180,104,73,0.14)",
                          overflow: "hidden",
                        background: "rgba(255,255,255,0.85)",
                      }}
                    >
                        {clientContext?.renderedAsset?.asset_mime_type?.startsWith("video/") && renderedAssetVideoUrl ? (
                          <div style={{ display: "grid", gap: 10, padding: 12 }}>
                            <video
                              ref={renderedAssetVideoRef}
                              controls
                              muted
                              loop
                              playsInline
                              poster={renderedAssetPayload.previewDataUrl ?? undefined}
                              src={renderedAssetVideoUrl}
                              onPlay={() => setRenderedAssetVideoPlaying(true)}
                              onPause={() => setRenderedAssetVideoPlaying(false)}
                              style={{ display: "block", width: "100%", height: "auto" }}
                            />
                          </div>
                        ) : (
                          <img
                            alt="Prévia do render final"
                            src={renderedAssetPayload.previewDataUrl ?? undefined}
                            style={{ display: "block", width: "100%", height: "auto" }}
                          />
                        )}
                      </div>
                    ) : null}
                    {renderedAssetMessage ? (
                      <div
                        style={{
                          marginTop: 12,
                          borderRadius: 18,
                          border: "1px solid rgba(180,104,73,0.14)",
                          background: "rgba(255,255,255,0.72)",
                          padding: "10px 12px",
                          fontSize: 13,
                          color: "#5c3a2c",
                          fontWeight: 600,
                        }}
                      >
                        {renderedAssetMessage}
                      </div>
                    ) : null}
                    {renderedAssetPayload && clientContext?.renderedAsset && renderedAssetPayload.renderEngine === "remotion" && clientContext.renderedAsset.status === "ready" ? (
                      <div
                          style={{
                            marginTop: 12,
                            borderRadius: 20,
                            border: "1px solid rgba(180,104,73,0.14)",
                            background: "rgba(255,255,255,0.72)",
                            padding: "12px 14px",
                          }}
                        >
                          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(92,58,44,0.7)", fontWeight: 700 }}>
                            Arquivos gerados
                          </div>
                          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                            {renderedAssetOutputFiles.map((file) => (
                              <div key={file.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                                <div style={{ fontWeight: 700, color: "#3a2519" }}>
                                  {file.label} · {file.fileName}
                                </div>
                                <div style={{ color: "rgba(92,58,44,0.76)", fontSize: 13 }}>{file.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {recentRenderedAssets.length > 1 ? (
                          <div
                            style={{
                              marginTop: 12,
                              borderRadius: 20,
                              border: "1px solid rgba(180,104,73,0.10)",
                              background: "rgba(255,255,255,0.55)",
                              padding: "12px 14px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "rgba(92,58,44,0.7)",
                                fontWeight: 700,
                              }}
                            >
                              Renders recentes
                            </div>
                            <div style={renderedAssetTableStyle}>
                              <div style={renderedAssetTableHeaderStyle}>
                                <div>Versão</div>
                                <div>Estado</div>
                                <div>Arquivos</div>
                                <div style={{ textAlign: "right" }}>Ações</div>
                              </div>
                              {recentRenderedAssets.map((asset) => {
                                const assetPayload = parseRenderedAssetPayload(asset.payload_json);
                                const assetBaseName = getRenderedAssetDownloadBaseName(asset, assetPayload?.title ?? assetPayload?.variantLabel ?? null);
                                const canDownloadVideo = asset.status === "ready" && typeof asset.asset_mime_type === "string" && asset.asset_mime_type.startsWith("video/");
                                const canDownloadExtras = asset.status === "ready" && asset.render_engine === "remotion";
                                const audioEnabled = canDownloadExtras && renderedAssetDownload === null;
                                const subtitleEnabled = canDownloadExtras && renderedAssetDownload === null;
                                const isHeadlineAsset = assetPayload?.variantType === "headline";
                                const isRegenerating = renderedAssetRegenerationBusy && renderedAssetRegenerationDialog?.asset.id === asset.id;
                                const regenerateDisabled = !canDownloadVideo || renderedAssetDownload !== null || renderedAssetRegenerationBusy;

                                return (
                                  <div key={asset.id} style={renderedAssetTableRowStyle}>
                                    <div style={renderedAssetTableCellStyle}>
                                      <div style={{ fontWeight: 700, color: "#3a2519" }}>v{asset.version}</div>
                                      <div style={{ fontWeight: 700, color: "#3a2519", marginTop: 4 }}>
                                        {assetPayload?.title ?? "Render"}
                                      </div>
                                      <div style={renderedAssetTableSubtleStyle}>{asset.render_engine}</div>
                                      {assetPayload?.variantLabel ? <div style={renderedAssetTableSubtleStyle}>{assetPayload.variantLabel}</div> : null}
                                      {assetPayload?.regeneration?.note ? <div style={renderedAssetTableSubtleStyle}>{assetPayload.regeneration.note}</div> : null}
                                    </div>
                                    <div style={renderedAssetTableCellStyle}>
                                      <div style={{ fontWeight: 700, color: "#3a2519" }}>{asset.status}</div>
                                      <div style={renderedAssetTableSubtleStyle}>{formatClock(asset.updated_at)}</div>
                                    </div>
                                    <div style={renderedAssetTableCellStyle}>
                                      <div style={{ fontWeight: 700, color: "#3a2519" }}>{assetBaseName}.mp4</div>
                                      <div style={renderedAssetTableSubtleStyle}>
                                        {assetBaseName}.wav · {assetBaseName}.srt
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 8 }}>
                                      <button
                                        type="button"
                                        className="action-button"
                                        style={renderedAssetPrimaryActionStyle}
                                        onClick={() => void openRenderedAssetPlayback(asset, null)}
                                        disabled={!canDownloadVideo}
                                      >
                                        <AppIcon name="play_arrow" style={actionIconStyle} />
                                        Abrir player
                                      </button>
                                      <button
                                        type="button"
                                        className="action-button"
                                        style={secondaryActionStyle}
                                        onClick={() => void handleRenderedAssetDownload(asset, "video", null)}
                                        disabled={!canDownloadVideo || renderedAssetDownload !== null}
                                      >
                                        Baixar MP4
                                      </button>
                                      <button
                                        type="button"
                                        className="action-button"
                                        style={secondaryActionStyle}
                                        onClick={() => void handleRenderedAssetDownload(asset, "audio", null)}
                                        disabled={!audioEnabled}
                                      >
                                        Baixar WAV
                                      </button>
                                      <button
                                        type="button"
                                        className="action-button"
                                        style={secondaryActionStyle}
                                        onClick={() => void handleRenderedAssetDownload(asset, "subtitles", null)}
                                        disabled={!subtitleEnabled}
                                      >
                                        Baixar SRT
                                      </button>
                                      <button
                                        type="button"
                                        className="action-button"
                                        style={secondaryActionStyle}
                                        onClick={() => openRenderedAssetRegenerationDialog(asset, "auto")}
                                        disabled={regenerateDisabled}
                                      >
                                        <AppIcon name="autorenew" style={actionIconStyle} />
                                        {isRegenerating ? "Regerando..." : "Regerar"}
                                      </button>
                                      {isHeadlineAsset ? (
                                        <>
                                          <button
                                            type="button"
                                            className="action-button"
                                            style={secondaryActionStyle}
                                            onClick={() => openRenderedAssetRegenerationDialog(asset, "alternate")}
                                            disabled={regenerateDisabled}
                                          >
                                            <AppIcon name="shuffle" style={actionIconStyle} />
                                            Nova direção
                                          </button>
                                      <button
                                        type="button"
                                        className="action-button"
                                        style={secondaryActionStyle}
                                        onClick={() => openRenderedAssetRegenerationDialog(asset, "revision")}
                                        disabled={regenerateDisabled}
                                      >
                                        <AppIcon name="edit_note" style={actionIconStyle} />
                                        Revisar briefing
                                      </button>
                                      {hasRenderedAssetLastRevision ? (
                                        <button
                                          type="button"
                                          className="action-button"
                                          style={secondaryActionStyle}
                                          onClick={() => void handleRenderedAssetRegenerationFromLastRevision(asset)}
                                          disabled={regenerateDisabled}
                                          title="Gerar com base na última revisão salva deste cliente"
                                        >
                                          <AppIcon name="history" style={actionIconStyle} />
                                          Última revisão
                                        </button>
                                      ) : null}
                                    </>
                                  ) : null}
                                </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {renderedAssetPlayback ? (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={renderedAssetPlayback.title}
                    onClick={closeRenderedAssetPlayback}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 80,
                      background: "rgba(15, 23, 42, 0.82)",
                      backdropFilter: "blur(10px)",
                      display: "grid",
                      placeItems: "center",
                      padding: 20,
                    }}
                  >
                    <div
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        width: "min(980px, 96vw)",
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
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{renderedAssetPlayback.title}</div>
                          <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                            Visualização do render pronto para revisão
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={closeRenderedAssetPlayback}
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
                      <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                        {renderedAssetPlayback.mimeType.startsWith("video/") ? (
                          <video
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            src={renderedAssetPlayback.url}
                            style={{ display: "block", width: "100%", height: "auto" }}
                          />
                        ) : (
                          <img
                            alt={renderedAssetPlayback.title}
                            src={renderedAssetPlayback.url}
                            style={{ display: "block", width: "100%", height: "auto" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {renderedAssetRegenerationDialog ? (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={
                      renderedAssetRegenerationDialog.mode === "revision"
                        ? "Revisar briefing do render"
                        : renderedAssetRegenerationDialog.mode === "alternate"
                          ? "Gerar nova direção de arte"
                          : "Regerar render"
                    }
                    onClick={closeRenderedAssetRegenerationDialog}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 81,
                      background: "rgba(15, 23, 42, 0.82)",
                      backdropFilter: "blur(10px)",
                      display: "grid",
                      placeItems: "center",
                      padding: 20,
                    }}
                  >
                    <div
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        width: "min(720px, 96vw)",
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
                            {renderedAssetRegenerationDialog.mode === "revision"
                              ? "Revisar briefing"
                              : renderedAssetRegenerationDialog.mode === "alternate"
                                ? "Nova direção de arte"
                                : "Regerar render"}
                          </div>
                          <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                            {renderedAssetRegenerationDialog.mode === "revision"
                              ? "Descreva o ajuste desejado. A nova versão vai preservar a direção original e incorporar a revisão."
                              : renderedAssetRegenerationDialog.mode === "alternate"
                                ? "A nova versão vai explorar uma direção de arte alternativa."
                                : "A nova versão vai manter a mesma direção de arte do render atual."}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={closeRenderedAssetRegenerationDialog}
                          disabled={renderedAssetRegenerationBusy}
                          style={{
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--text-primary)",
                            borderRadius: 999,
                            padding: "8px 12px",
                            cursor: renderedAssetRegenerationBusy ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            opacity: renderedAssetRegenerationBusy ? 0.6 : 1,
                          }}
                        >
                          Fechar
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: 12,
                          borderRadius: 18,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.04)",
                          padding: 14,
                        }}
                      >
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                            Peça selecionada
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                            {parseRenderedAssetPayload(renderedAssetRegenerationDialog.asset.payload_json)?.title ?? "Render"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            Versão {renderedAssetRegenerationDialog.asset.version} · {renderedAssetRegenerationDialog.asset.status}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
                            <span
                              style={{
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.06)",
                                color: "var(--text-primary)",
                                padding: "5px 9px",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 0.2,
                              }}
                            >
                              {renderedAssetRegenerationDialog.asset.payload_json
                                ? parseRenderedAssetPayload(renderedAssetRegenerationDialog.asset.payload_json)?.variantType === "headline"
                                  ? "Headline"
                                  : parseRenderedAssetPayload(renderedAssetRegenerationDialog.asset.payload_json)?.variantType === "overview"
                                    ? "Overview"
                                    : "Peça"
                                : "Peça"}
                            </span>
                            <span
                              style={{
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.06)",
                                color: "var(--text-primary)",
                                padding: "5px 9px",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: 0.2,
                              }}
                            >
                              {renderedAssetRegenerationDialog.mode === "revision"
                                ? "Revisão"
                                : renderedAssetRegenerationDialog.mode === "alternate"
                                  ? "Direção alternativa"
                                  : "Mesma direção"}
                            </span>
                          </div>
                        </div>

                        {renderedAssetRegenerationDialog.mode === "revision" ? (
                          (() => {
                            const renderedAssetPayload = parseRenderedAssetPayload(renderedAssetRegenerationDialog.asset.payload_json);
                            const renderedAssetObjectives = getRenderedAssetRegenerationObjectives(renderedAssetPayload);
                            const selectedObjective =
                              renderedAssetObjectives.find((objective) => objective.key === renderedAssetRegenerationObjectiveKey) ?? renderedAssetObjectives[0];

                            return (
                              <div style={{ display: "grid", gap: 10 }}>
                                <div style={{ display: "grid", gap: 6 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                                    Escolha o objetivo
                                  </div>
                                  <div style={{ display: "grid", gap: 8 }}>
                                    {renderedAssetObjectives.map((objective) => {
                                      const isSelected = objective.key === selectedObjective.key;

                                      return (
                                        <button
                                          key={objective.key}
                                          type="button"
                                          onClick={() => setRenderedAssetRegenerationObjectiveKey(objective.key)}
                                          disabled={renderedAssetRegenerationBusy}
                                          style={{
                                            textAlign: "left",
                                            borderRadius: 16,
                                            border: isSelected ? "1px solid rgba(249, 115, 22, 0.55)" : "1px solid rgba(255,255,255,0.10)",
                                            background: isSelected ? "rgba(249, 115, 22, 0.12)" : "rgba(255,255,255,0.03)",
                                            color: "var(--text-primary)",
                                            padding: 12,
                                            cursor: renderedAssetRegenerationBusy ? "not-allowed" : "pointer",
                                            opacity: renderedAssetRegenerationBusy ? 0.7 : 1,
                                            display: "grid",
                                            gap: 4,
                                          }}
                                        >
                                          <div style={{ fontSize: 13, fontWeight: 800 }}>{objective.title}</div>
                                          <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>{objective.description}</div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    display: "grid",
                                    gap: 10,
                                    borderRadius: 16,
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.03)",
                                    padding: 12,
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                    <div style={{ display: "grid", gap: 4 }}>
                                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                                        {selectedObjective.title}
                                      </div>
                                      <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>{selectedObjective.description}</div>
                                    </div>
                                    {hasRenderedAssetLastRevision ? (
                                      <button
                                        type="button"
                                        onClick={() => void handleRenderedAssetRegenerationFromLastRevision(renderedAssetRegenerationDialog.asset)}
                                        disabled={renderedAssetRegenerationBusy}
                                        style={{
                                          borderRadius: 999,
                                          border: "1px solid rgba(255,255,255,0.12)",
                                          background: "rgba(255,255,255,0.06)",
                                          color: "var(--text-primary)",
                                          padding: "8px 10px",
                                          fontSize: 12,
                                          fontWeight: 800,
                                          cursor: renderedAssetRegenerationBusy ? "not-allowed" : "pointer",
                                          opacity: renderedAssetRegenerationBusy ? 0.6 : 1,
                                        }}
                                      >
                                        Usar última revisão
                                      </button>
                                    ) : null}
                                  </div>

                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {selectedObjective.presets.map((preset) => (
                                      <button
                                        key={`${selectedObjective.key}-${preset.label}`}
                                        type="button"
                                        onClick={() => setRenderedAssetRegenerationNote(preset.note)}
                                        disabled={renderedAssetRegenerationBusy}
                                        style={{
                                          borderRadius: 999,
                                          border: "1px solid rgba(255,255,255,0.12)",
                                          background: "rgba(255,255,255,0.06)",
                                          color: "var(--text-primary)",
                                          padding: "7px 10px",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          cursor: renderedAssetRegenerationBusy ? "not-allowed" : "pointer",
                                          opacity: renderedAssetRegenerationBusy ? 0.6 : 1,
                                        }}
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>

                                  <label style={{ display: "grid", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                                      Ajuste solicitado
                                    </span>
                                    <textarea
                                      value={renderedAssetRegenerationNote}
                                      onChange={(event) => setRenderedAssetRegenerationNote(event.target.value)}
                                      placeholder="Ex.: deixar o tom mais premium e reduzir a intensidade do CTA."
                                      rows={5}
                                      autoFocus
                                      style={{
                                        width: "100%",
                                        resize: "vertical",
                                        borderRadius: 14,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(255,255,255,0.06)",
                                        color: "var(--text-primary)",
                                        padding: "12px 14px",
                                        font: "inherit",
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                        outline: "none",
                                      }}
                                    />
                                    <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                                      {renderedAssetRegenerationMemory?.note
                                        ? `Última revisão salva em ${new Date(renderedAssetRegenerationMemory.updatedAt).toLocaleString("pt-BR")}.`
                                        : "Os três objetivos cobrem conversão, posicionamento e variação criativa."}
                                    </div>
                                  </label>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div style={{ display: "grid", gap: 8, fontSize: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                            <div>O sistema vai criar uma nova versão sem pedir mais confirmação.</div>
                            <div>
                              {renderedAssetRegenerationDialog.mode === "alternate"
                                ? "Essa versão vai testar uma direção visual diferente."
                                : "Essa versão vai preservar a direção atual e refazer a peça."}
                            </div>
                          </div>
                        )}

                        {renderedAssetMessage ? (
                          <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--accent-amber)" }}>{renderedAssetMessage}</div>
                        ) : null}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={closeRenderedAssetRegenerationDialog}
                          disabled={renderedAssetRegenerationBusy}
                          style={{
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--text-primary)",
                            borderRadius: 999,
                            padding: "10px 14px",
                            cursor: renderedAssetRegenerationBusy ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            opacity: renderedAssetRegenerationBusy ? 0.6 : 1,
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => void confirmRenderedAssetRegeneration()}
                          disabled={renderedAssetRegenerationBusy}
                          style={{
                            border: "none",
                            borderRadius: 999,
                            padding: "10px 14px",
                            background: "linear-gradient(135deg, #f97316 0%, #fb7185 100%)",
                            color: "white",
                            cursor: renderedAssetRegenerationBusy ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 800,
                            boxShadow: "0 12px 28px rgba(249, 115, 22, 0.28)",
                            opacity: renderedAssetRegenerationBusy ? 0.7 : 1,
                          }}
                        >
                          {renderedAssetRegenerationBusy
                            ? "Gerando..."
                            : renderedAssetRegenerationDialog.mode === "revision"
                              ? "Aplicar ajuste"
                              : renderedAssetRegenerationDialog.mode === "alternate"
                                ? "Gerar nova direção"
                                : "Regerar agora"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <section style={amiclubePostPreviewStyle}>
                  <div style={amiclubePostPreviewHeaderStyle}>
                    <div>
                      <div style={amiclubePostPreviewEyebrowStyle}>Arte do post</div>
                      <h3 style={amiclubePostPreviewTitleStyle}>{featuredCreativeTitle}</h3>
                      <p style={amiclubePostPreviewSubtitleStyle}>
                        {featuredCreativeChannel} · {featuredCreativeFormat} · {featuredCreativeTheme}
                      </p>
                    </div>
                    <div style={amiclubePostPreviewTagRowStyle(isAmiclubeCompact)}>
                      <span style={amiclubePostPreviewTagStyle}>Hook-first</span>
                      <span style={amiclubePostPreviewTagStyle}>4:5</span>
                      <span style={amiclubePostPreviewTagStyle}>{amiclubeWorkflowSquad}</span>
                    </div>
                  </div>

                  <div style={amiclubePostPreviewAttributionStyle}>
                    <div style={amiclubePostPreviewAttributionLabelStyle}>Fluxo aplicado</div>
                    <div style={amiclubePostPreviewAgentTrailStyle}>
                      {amiclubeCreativeVisualAgents.map((agent) => (
                        <span key={agent.id} style={amiclubePostPreviewAttributionPillStyle(isAmiclubeCompact)}>
                          <span style={amiclubePostPreviewAgentIconStyle}>{agent.icon}</span>
                          <span style={amiclubePostPreviewAgentBodyStyle}>
                            <strong style={amiclubePostPreviewAttributionAgentStyle}>{agent.title}</strong>
                            <span style={amiclubePostPreviewAttributionMetaStyle}>{agent.role}</span>
                            <span style={amiclubePostPreviewAgentStatusStyle(agent.status)}>
                              <span style={amiclubePostPreviewAgentDotStyle(agent.status)} />
                              {agent.status}
                            </span>
                            <span style={amiclubePostPreviewAttributionFileStyle}>{agent.output}</span>
                          </span>
                        </span>
                      ))}
                    </div>
                    <div style={amiclubePostPreviewAttributionSummaryStyle}>
                      Dono principal: {amiclubeWorkflowOwner} · {creativeWorkflowSummary}
                    </div>
                    <div style={amiclubePostPreviewTimelineWrapStyle}>
                      <div style={amiclubePostPreviewTimelineLabelStyle}>Linha do squad</div>
                      <div style={amiclubePostPreviewTimelineStyle}>
                        {amiclubeCreativeTimeline.map((agent) => (
                          <div key={agent.id} style={amiclubePostPreviewTimelineItemStyle(agent.status, agent.isLast)}>
                            <div style={amiclubePostPreviewTimelineIconStyle(agent.status)}>{agent.icon}</div>
                            <div style={amiclubePostPreviewTimelineBodyStyle}>
                              <div style={amiclubePostPreviewTimelineTitleStyle}>{agent.title}</div>
                              <div style={amiclubePostPreviewTimelineMetaStyle}>{agent.role}</div>
                              <div style={amiclubePostPreviewTimelineStatusStyle(agent.status)}>{agent.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={amiclubeCarouselControlsStyle}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={amiclubeSlideRailLabelStyle}>Carrossel navegável</div>
                      <div style={amiclubeSlideRailPreviewStyle}>
                        Slide {amiclubeCreativeSlideIndex + 1} de {amiclubeCreativeSlides.length} · {amiclubeCreativeSlide.preview}
                      </div>
                    </div>

                    <div style={amiclubeCarouselButtonRowStyle}>
                      <button
                        type="button"
                        style={amiclubeCarouselButtonStyle}
                        onClick={() =>
                          setAmiclubeCreativeSlideIndex(
                            (value) => (value - 1 + amiclubeCreativeSlides.length) % amiclubeCreativeSlides.length,
                          )
                        }
                      >
                        <span style={amiclubeCarouselButtonIconStyle}>←</span>
                        Slide anterior
                      </button>
                      <button
                        type="button"
                        style={amiclubeCarouselButtonStyle}
                        onClick={() =>
                          setAmiclubeCreativeSlideIndex((value) => (value + 1) % amiclubeCreativeSlides.length)
                        }
                      >
                        Próximo slide
                        <span style={amiclubeCarouselButtonIconStyle}>→</span>
                      </button>
                    </div>
                  </div>

                  <div style={amiclubeCarouselDotsStyle}>
                    {amiclubeCreativeSlides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        aria-label={`Ir para ${slide.label}`}
                        title={slide.preview}
                        style={amiclubeCarouselDotStyle(index === amiclubeCreativeSlideIndex)}
                        onClick={() => setAmiclubeCreativeSlideIndex(index)}
                      />
                    ))}
                  </div>

                  <div style={amiclubePostCanvasStyle(isAmiclubeCompact)}>
                    <div style={amiclubeSlideMainStyle(amiclubeCreativeSlide.accent)}>
                      <div style={amiclubePostCoverTopStyle}>
                        <span style={amiclubeSlideBadgeStyle(amiclubeCreativeSlide.accent)}>{amiclubeCreativeSlide.label}</span>
                        <span style={amiclubeSlideBadgeStyle(amiclubeCreativeSlide.accent)}>{amiclubeCreativeSlide.badge}</span>
                      </div>

                      <div style={amiclubePostCoverArtStyle}>
                        <div style={amiclubePostCoverCircleLargeStyle} />
                        <div style={amiclubePostCoverCircleSmallStyle} />
                        <div style={amiclubePostCoverCardStyle}>
                          <div style={amiclubeSlideKickerStyle(amiclubeCreativeSlide.accent)}>{amiclubeCreativeSlide.eyebrow}</div>
                          <div style={amiclubeSlideTitleStyle(amiclubeCreativeSlide.accent)}>
                            {amiclubeCreativeSlide.title.split("\n").map((line, index) => (
                              <React.Fragment key={`${amiclubeCreativeSlide.id}-${index}`}>
                                {line}
                                {index < amiclubeCreativeSlide.title.split("\n").length - 1 ? <br /> : null}
                              </React.Fragment>
                            ))}
                          </div>
                          <div style={amiclubeSlideBodyStyle(amiclubeCreativeSlide.accent)}>{amiclubeCreativeSlide.body}</div>
                          <div style={amiclubeSlideCalloutStyle(amiclubeCreativeSlide.accent)}>
                            {amiclubeCreativeSlide.preview}
                            {amiclubeCreativeSlide.id === "cta" ? " Aplique o checklist antes da proxima postagem." : null}
                          </div>
                        </div>
                      </div>

                      <div style={amiclubePostCoverFooterStyle}>
                        <span>{amiclubeCreativeSlide.footerLeft}</span>
                        <span>{amiclubeCreativeSlide.footerRight}</span>
                      </div>
                    </div>

                    <div style={amiclubeSlideColumnStyle}>
                      {amiclubeCreativeSlides.map((slide, index) => (
                        <article
                          key={slide.id}
                          style={amiclubeSlideRailItemStyle(index === amiclubeCreativeSlideIndex)}
                          onClick={() => setAmiclubeCreativeSlideIndex(index)}
                        >
                          <div style={amiclubeSlideRailProgressStyle}>
                            <span>{slide.label}</span>
                            <span>
                              {index + 1}/{amiclubeCreativeSlides.length}
                            </span>
                          </div>
                          <div style={amiclubeSlideRailTitleStyle}>{slide.title}</div>
                          <div style={amiclubeSlideRailPreviewStyle}>{slide.preview}</div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div style={amiclubePostFooterStyle}>
                    <span style={amiclubePostFooterAccentStyle}>Tese</span>
                    <span style={amiclubePostFooterTextStyle}>{featuredCreativeSubtitle}</span>
                  </div>
                </section>

                <div style={signalGridStyle}>
                  <SignalChip
                    label={ptBR.dashboard.feed.clientFocus}
                    value={
                      selectedClient
                        ? `${selectedClient.segment ?? ptBR.dashboard.client.empty}${selectedClient.website_url ? ` · ${selectedClient.website_url}` : ""}`
                        : ptBR.dashboard.client.empty
                    }
                    strong={!!selectedClient}
                  />
                  <SignalChip
                    label={ptBR.dashboard.feed.socialIntelligence}
                    value={
                      clientContext
                        ? `${clientContext.profiles} perfis · ${clientContext.snapshotScore !== null ? `${Math.round(clientContext.snapshotScore)}%` : "sem snapshot"}`
                        : "Sem leitura do cliente"
                    }
                    strong={!!clientContext?.profiles}
                  />
                  <SignalChip
                    label={ptBR.dashboard.feed.pipeline}
                    value={
                      clientContext
                        ? `${clientContext.proposals} propostas · ${clientContext.contentPlans} planos · ${clientContext.contentPackages} pacotes · ${clientContext.schedules} agendas`
                        : "Sem pipeline do cliente"
                    }
                    strong={!!clientContext && (clientContext.proposals > 0 || clientContext.contentPlans > 0)}
                  />
                  <SignalChip
                    label={ptBR.dashboard.feed.governance}
                    value={
                      clientContext
                        ? `${clientContext.pendingApprovals} pendências · ${clientContext.approvals} aprovações`
                        : "Governança ausente"
                    }
                    strong={!!clientContext && clientContext.pendingApprovals > 0}
                  />
                </div>
              </section>
            </div>

            <aside style={rightColumnStyle}>
              <section className="section-card animate-rise-in" style={feedCardStyle}>
                <div style={panelHeaderStyle}>
                  <div>
                    <div style={eyebrowStyle}>{ptBR.dashboard.feed.eyebrow}</div>
                    <h2 style={panelTitleStyle}>{ptBR.dashboard.feed.title}</h2>
                  </div>
                  <div style={panelCaptionStyle}>
                    {isConnected ? ptBR.dashboard.feed.connected : ptBR.dashboard.feed.disconnected}
                  </div>
                </div>

                <div style={feedListStyle}>
                  {feedItems.length === 0 ? (
                    <EmptyStateNotice message={ptBR.dashboard.feed.empty} />
                  ) : (
                    feedItems.map((item) => (
                      <article key={`${item.label}-${item.description}`} style={feedRowStyle}>
                        <div style={feedIconWrapStyle(item.accent)}>
                          <AppIcon name={item.icon} style={feedIconStyle} />
                        </div>
                        <div style={feedTextStyle}>
                          <div style={feedLabelStyle}>{item.label}</div>
                          <div style={feedDescriptionStyle}>{item.description}</div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <div style={feedMiniSummaryStyle}>
                  <div style={feedMiniLabelStyle}>{selectedClient ? ptBR.dashboard.feed.clientFocus : ptBR.dashboard.feed.selection}</div>
                  <div style={feedMiniValueStyle}>{selectedClient?.name ?? heroSquad?.name ?? ptBR.dashboard.hero.titleFallback}</div>
                  <div style={feedMiniHintStyle}>
                    {clientContext
                      ? `${clientContext.profiles} perfis · ${clientContext.productCount} produtos · ${clientContext.pendingApprovals} pendências`
                      : heroState
                        ? `${heroState.step.current}/${heroState.step.total} etapas`
                        : "Sem operação ativa"}
                  </div>
                </div>
              </section>
            </aside>
          </section>
          */}
          {selectedClient ? (
            <section className="section-card animate-rise-in client-focus-keep" style={clientFocusCardStyle}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={eyebrowStyle}>{ptBR.dashboard.feed.clientFocus}</div>
                  <h2 style={panelTitleStyle}>{selectedClient.name}</h2>
                  <p style={panelCaptionStyle}>
                    {selectedClient.segment ?? ptBR.dashboard.client.empty}
                    {selectedClient.website_url ? ` · ${selectedClient.website_url}` : ""}
                  </p>
                </div>
                <span style={clientFocusBadgeStyle}>{clientContext?.activeProductName ?? "foco ativo"}</span>
              </div>

              <p style={clientFocusHeadlineStyle}>
                {clientReportData?.headline ??
                  clientReportData?.commercialSummary ??
                  "Resumo operacional do cliente, presença social e agenda de publicações."}
              </p>

              <div style={clientFocusSummaryGridStyle}>
                {clientFocusSummaryCards.map((item) => (
                  <article key={item.label} style={clientFocusSummaryCardStyle}>
                    <div style={clientFocusSummaryLabelStyle}>{item.label}</div>
                    <div style={clientFocusSummaryValueStyle}>{item.value}</div>
                    <div style={clientFocusSummaryHintStyle}>{item.hint}</div>
                  </article>
                ))}
              </div>

              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
                <section style={clientFocusPanelStyle}>
                  <div style={socialPresenceHeaderStyle}>
                    <div>
                      <div style={clientFocusSummaryLabelStyle}>Snapshot social</div>
                      <div style={clientFocusPanelTitleStyle}>
                        Redes monitoradas
                      </div>
                      <div style={clientFocusPanelSubtitleStyle}>
                        {clientSocialPresenceSummary?.lastCapturedAt
                          ? `Coletado em ${formatDateTime(clientSocialPresenceSummary.lastCapturedAt)}`
                          : clientSocialSnapshot?.collected_at
                            ? `Snapshot coletado em ${formatDateTime(clientSocialSnapshot.collected_at)}`
                          : clientEngagement !== null
                            ? `Snapshot com maturidade ${Math.round(clientEngagement)}%`
                            : "Aguardando a primeira captura social"}
                        {clientSocialPresenceSummary?.latestPostAt
                          ? ` · Última postagem em ${formatDateTime(clientSocialPresenceSummary.latestPostAt)}`
                          : clientContext?.profiles
                            ? ` · ${clientContext.profiles} perfis monitorados`
                            : ""}
                      </div>
                    </div>

                  </div>

                  {clientSocialNetworksForDisplay.length ? (
                    <div style={socialPresenceNetworkListStyle}>
                      {clientSocialNetworksForDisplay.map((network) => (
                        <article key={`${network.platform}-${network.profileUrl}-${network.collectedAt}`} style={clientFocusNetworkCardStyle}>
                          <div style={socialPresenceNetworkTopStyle}>
                            <div style={socialPresenceNetworkIdentityStyle}>
                              <div style={clientFocusNetworkPlatformStyle}>{formatPlatformLabel(network.platform)}</div>
                              <div style={clientFocusNetworkHandleStyle}>{network.handle ?? "Handle não identificado"}</div>
                              <div style={clientFocusNetworkUrlStyle}>{network.profileUrl}</div>
                            </div>

                            <div style={socialPresenceNetworkStatusStyle}>
                              <span style={clientFocusStatusPillStyle(network.observationStatus)}>
                                {formatObservationStatus(network.observationStatus)}
                              </span>
                              <span style={clientFocusConfidenceStyle}>{network.confidence}%</span>
                            </div>
                          </div>

                          {network.followersCount !== null || network.postsCount !== null || network.latestPostAt ? (
                            <div style={clientFocusMetricGridStyle}>
                              {network.followersCount !== null ? (
                                <div style={clientFocusMetricCardStyle}>
                                  <div style={clientFocusMetricLabelStyle}>Seguidores</div>
                                  <div style={clientFocusMetricValueStyle}>{formatCompactNumber(network.followersCount)}</div>
                                </div>
                              ) : null}

                              {network.postsCount !== null ? (
                                <div style={clientFocusMetricCardStyle}>
                                  <div style={clientFocusMetricLabelStyle}>Postagens</div>
                                  <div style={clientFocusMetricValueStyle}>{formatCompactNumber(network.postsCount)}</div>
                                </div>
                              ) : null}

                              {network.latestPostAt ? (
                                <div style={clientFocusMetricCardStyle}>
                                  <div style={clientFocusMetricLabelStyle}>Última postagem</div>
                                  <div style={clientFocusMetricValueStyle}>{formatDateTime(network.latestPostAt)}</div>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div style={socialPresenceEmptyMetricsStyle}>Métricas não capturadas nesta coleta.</div>
                          )}

                          <div style={clientFocusSectionFooterStyle}>
                            <span>{formatDateTime(network.collectedAt)}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : clientFocusSocialFallbackCards.length ? (
                    <div style={clientFocusMetricGridStyle}>
                      {clientFocusSocialFallbackCards.map((item) => (
                        <article key={item.label} style={clientFocusMetricCardStyle}>
                          <div style={clientFocusMetricLabelStyle}>{item.label}</div>
                          <div style={clientFocusMetricValueStyle}>{item.value}</div>
                          <div style={clientFocusSummaryHintStyle}>{item.hint}</div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyStateNotice message="Aguardando a primeira coleta social para exibir redes monitoradas." />
                  )}
                </section>

                <section style={clientFocusPanelStyle}>
                  <div style={campaignSampleHeaderStyle}>
                    <div>
                      <div style={clientFocusSummaryLabelStyle}>Campanha</div>
                      <div style={clientFocusPanelTitleStyle}>
                        {publishing?.schedule
                          ? "Publicados e agendados"
                          : effectiveSchedulePayload?.items?.length
                            ? "Agenda estruturada, sem publicação"
                            : clientContext?.campaignState?.stage
                              ? formatArtifactStatus(clientContext.campaignState.stage)
                            : "Campanha sem agenda publicada"}
                      </div>
                      <div style={clientFocusPanelSubtitleStyle}>
                        {publishing?.executions.length
                          ? `${publishing.executions.length} execução(ões) de publicação`
                          : effectiveSchedulePayload?.items?.length
                            ? `${effectiveSchedulePayload.items.length} item(ns) de agenda preparado(s)`
                          : clientContext?.campaignState?.nextStage
                            ? `Fluxo pronto para ${formatArtifactStatus(clientContext.campaignState.nextStage)}`
                            : "Ainda não há execuções de publicação para este cliente"}
                        {effectiveSchedulePayload?.items?.length
                          ? ` · ${effectiveSchedulePayload.items.length} item(ns) agendado(s)`
                          : clientContext?.contentPlans || clientContext?.contentPackages
                            ? ` · ${clientContext.contentPlans} plano(s) · ${clientContext.contentPackages} pacote(s)`
                            : " · Sem itens agendados"}
                      </div>
                    </div>

                      <div style={campaignSampleMetaRowStyle}>
                        <span style={clientFocusMetaPillStyle}>
                          {publishing?.latestExecution ? formatCampaignItemStatus(publishing.latestExecution.status) : "Sem publicação"}
                        </span>
                        <span style={clientFocusMetaPillStyle}>
                          {effectiveSchedulePayload?.cadence
                            ? effectiveSchedulePayload.cadence
                            : clientContext?.campaignState?.blockers?.[0] ?? "Cadência não informada"}
                        </span>
                        <span style={clientFocusMetaPillStyle}>{creativeWorkflowSummary}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        borderRadius: 20,
                        border: "1px solid rgba(180,104,73,0.14)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,248,242,0.92) 100%)",
                        padding: 14,
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(92,58,44,0.68)", fontWeight: 800 }}>
                            Checagem automática
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#3a2519" }}>{campaignArtHealth.summary}</div>
                        </div>
                        <span style={clientReportMetaPillStyle}>
                          {campaignArtHealth.status === "ready"
                            ? "Cobertura completa"
                            : campaignArtHealth.status === "partial"
                              ? "Cobertura parcial"
                              : campaignArtHealth.status === "orphan"
                                ? "Arte sem agenda"
                                : "Sem dados"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={clientReportMetaPillStyle}>{campaignArtHealth.scheduledCount} post(s) planejado(s)</span>
                        <span style={clientReportMetaPillStyle}>{campaignArtHealth.coveredCount} com arte Remotion</span>
                        <span style={clientReportMetaPillStyle}>{campaignArtHealth.variantCount} variante(s) gerada(s)</span>
                      </div>

                      {campaignArtHealth.missingItems.length > 0 ? (
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#7b3f21" }}>Posts sem arte vinculada</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {campaignArtHealth.missingItems.slice(0, 4).map((entry, index) => (
                              <span key={`${entry.item.position ?? index}-${entry.item.title ?? "item"}`} style={clientReportMetaPillStyle}>
                                {entry.item.title?.trim() || `Post ${entry.item.position ?? "sem posição"}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {campaignArtHealth.orphanVariants.length > 0 ? (
                        <div style={{ display: "grid", gap: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#7b3f21" }}>Variantes sem agenda correspondente</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {campaignArtHealth.orphanVariants.slice(0, 4).map((variant) => (
                              <span key={variant.id} style={clientReportMetaPillStyle}>
                                {variant.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {socialGrowthState?.status === "running" ? (
                        <div style={{ fontSize: 12, color: "rgba(92,58,44,0.72)", lineHeight: 1.45 }}>
                          Squad `social-growth` em execução: etapa {socialGrowthState.step.current}/{socialGrowthState.step.total} · {socialGrowthState.step.label}
                        </div>
                      ) : null}
                    </div>

                    {renderedAssetPayload && clientContext?.renderedAsset && renderedAssetPayload.renderEngine === "remotion" && clientContext.renderedAsset.status === "ready" ? (
                      <div
                        style={{
                          marginTop: 14,
                          borderRadius: 24,
                          border: "1px solid rgba(180,104,73,0.18)",
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,248,242,0.94) 56%, rgba(255,236,224,0.9) 100%)",
                          boxShadow: "0 18px 42px rgba(180,104,73,0.08)",
                          padding: 14,
                          display: "grid",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              borderRadius: 999,
                              padding: "7px 10px",
                              background: "rgba(180,104,73,0.12)",
                              color: "#7b3f21",
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            Pronto para revisão
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              borderRadius: 999,
                              padding: "7px 10px",
                              background: "rgba(255,255,255,0.7)",
                              color: "rgba(92,58,44,0.86)",
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              border: "1px solid rgba(180,104,73,0.14)",
                            }}
                          >
                            {renderedAssetOutputFiles.length} arquivos
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ display: "grid", gap: 4 }}>
                            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(92,58,44,0.68)", fontWeight: 800 }}>
                              Arte em vídeo
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#3a2519" }}>
                              Vídeo da campanha
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(92,58,44,0.76)", lineHeight: 1.45 }}>
                              A mesma peça do render final, mostrada no contexto da campanha.
                            </div>
                          </div>
                          <button
                            type="button"
                            className="action-button"
                            style={renderedAssetPrimaryActionStyle}
                            onClick={() => void openRenderedAssetPlayback(campaignRemotionPreview!.asset, campaignRemotionPreview!.payload.title ?? null)}
                          >
                            <AppIcon name="play_arrow" style={actionIconStyle} />
                            Abrir player
                          </button>
                        </div>
                        {campaignRemotionPreview!.asset.asset_mime_type?.startsWith("video/") && campaignRemotionVideoUrl ? (
                          <video
                            controls
                            muted
                            loop
                            playsInline
                            poster={campaignRemotionPreview!.payload.previewDataUrl ?? undefined}
                            src={campaignRemotionVideoUrl}
                            style={{ display: "block", width: "100%", height: "auto", borderRadius: 16 }}
                          />
                        ) : (
                          <img
                            alt="Prévia do render final"
                            src={campaignRemotionPreview!.payload.previewDataUrl ?? undefined}
                            style={{ display: "block", width: "100%", height: "auto", borderRadius: 16 }}
                          />
                        )}
                      </div>
                    ) : null}

                    <section
                      style={{
                        marginTop: 16,
                        borderRadius: 24,
                        border: "1px solid rgba(180,104,73,0.14)",
                        background: "rgba(255,255,255,0.72)",
                        padding: 14,
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(92,58,44,0.68)", fontWeight: 800 }}>
                            Galeria Remotion
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#3a2519" }}>
                            Artes dos posts geradas para este cliente
                          </div>
                          <div style={{ fontSize: 13, color: "rgba(92,58,44,0.76)", lineHeight: 1.45 }}>
                            Cada variante aparece aqui mesmo quando ainda não há correspondência exata com a agenda.
                          </div>
                        </div>
                        <span style={clientReportMetaPillStyle}>
                          {campaignGalleryVariants.length} variante(s)
                        </span>
                      </div>

                      {campaignGalleryVariants.length > 0 ? (
                        <div
                          style={{
                            display: "grid",
                            gap: 12,
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          }}
                        >
                          {campaignGalleryVariants.map((variant) => (
                            <article
                              key={variant.id}
                              style={{
                                display: "grid",
                                gap: 10,
                                padding: 12,
                                borderRadius: 18,
                                background: "rgba(255,255,255,0.72)",
                                border: "1px solid rgba(180,104,73,0.10)",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => openCampaignArtPreview(variant.title ?? variant.label, variant.previewDataUrl, variant.previewMimeType)}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  padding: 0,
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  overflow: "hidden",
                                  borderRadius: 14,
                                }}
                                aria-label={`Abrir arte de ${variant.label}`}
                              >
                                <img
                                  alt={`Prévia Remotion de ${variant.label}`}
                                  src={variant.previewDataUrl}
                                  style={{ display: "block", width: "100%", height: "auto" }}
                                />
                              </button>

                              <div style={{ display: "grid", gap: 4 }}>
                                <div style={{ fontWeight: 800, color: "#3a2519", fontSize: 14 }}>{variant.label}</div>
                                <div style={{ fontSize: 12, color: "rgba(92,58,44,0.76)", lineHeight: 1.45 }}>{variant.title}</div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  <span style={clientReportMetaPillStyle}>{variant.format}</span>
                                  <span style={clientReportMetaPillStyle}>{variant.channel}</span>
                                  <span style={clientReportMetaPillStyle}>{variant.previewMimeType}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyStateNotice
                          variant="compact"
                          message={
                            campaignArtHealth.hasSchedule
                              ? `Há ${campaignArtHealth.scheduledCount} post(s) na agenda, mas nenhuma arte Remotion correspondente foi vinculada ainda.`
                              : "Nenhuma arte Remotion foi gerada ainda para este cliente. Gere o feed, o carrossel ou os stories para que os previews apareçam aqui."
                          }
                        />
                      )}
                    </section>

                  <div style={clientFocusCampaignGridStyle}>
                    <section style={campaignSampleColumnStyle}>
                      <div style={campaignSampleColumnHeaderStyle}>
                        <div style={campaignSampleColumnTitleStyle}>Últimos publicados</div>
                        <div style={campaignSampleColumnHintStyle}>
                          {campaignPublishedItems.length ? "execuções concluídas" : "sem publicações confirmadas"}
                        </div>
                      </div>

                      <div style={campaignSampleListStyle}>
                        {campaignPublishedItems.length ? (
                          campaignPublishedItems.map((item) => (
                            <article key={item.id} style={clientFocusCampaignItemStyle}>
                              <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
                                <div style={campaignSampleItemTopStyle}>
                                  <div style={campaignSampleItemIdentityStyle}>
                                    <div style={clientFocusCampaignItemTitleStyle}>{item.title}</div>
                                    <div style={clientFocusCampaignItemSubtitleStyle}>{item.subtitle}</div>
                                  </div>
                                  <span style={clientFocusCampaignStatusPillStyle(item.accent)}>{item.status}</span>
                                </div>
                                <div style={clientFocusCampaignItemMetaStyle}>{item.meta}</div>
                                <div style={clientFocusCampaignItemWorkflowStyle}>{item.workflow}</div>
                                <div style={clientFocusCampaignItemNoteStyle}>{item.note}</div>
                              </div>
                            </article>
                          ))
                        ) : (
                          <EmptyStateNotice message="Aguardando a primeira execução publicada para mostrar os últimos itens." />
                        )}
                      </div>
                    </section>

                    <section style={campaignSampleColumnStyle}>
                      <div style={campaignSampleColumnHeaderStyle}>
                        <div style={campaignSampleColumnTitleStyle}>Agendados</div>
                        <div style={campaignSampleColumnHintStyle}>
                          {campaignScheduledItems.length ? "agenda viva" : "sem agenda disponível"}
                        </div>
                      </div>

                      <div style={campaignSampleListStyle}>
                        {campaignScheduledItems.length ? (
                          campaignScheduledItems.map((item) => (
                            <article key={item.id} style={campaignSampleFocusGridStyle}>
                              <article style={campaignSampleFocusCardStyle}>
                                <div style={campaignSampleFocusHeaderStyle}>
                                  <div style={campaignSampleFocusTextWrapStyle}>
                                    <div style={campaignSampleFocusLabelStyle}>Post planejado</div>
                                    <div style={campaignSampleFocusTitleStyle}>{item.title}</div>
                                    <div style={campaignSampleFocusSubtitleStyle}>
                                      {item.subtitle || "Sem canal ou formato definidos"} · {item.meta}
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                    <span style={campaignSampleStatusPillStyle(item.accent)}>{item.status}</span>
                                    <button
                                      type="button"
                                      className="action-button"
                                      style={renderedAssetPrimaryActionStyle}
                                      onClick={() =>
                                        item.previewVariant
                                          ? openCampaignArtPreview(
                                              item.previewVariant.title ?? item.title,
                                              item.previewVariant.previewDataUrl,
                                              item.previewVariant.previewMimeType,
                                            )
                                          : scrollToRenderedAssetSection()
                                      }
                                    >
                                      <AppIcon name={item.previewVariant ? "play_arrow" : "south"} style={actionIconStyle} />
                                      {item.previewVariant ? "Abrir arte" : "Ir para render"}
                                    </button>
                                  </div>
                                </div>

                                <div style={campaignSampleFocusBodyStyle}>
                                  <div style={campaignSampleFocusBodyLabelStyle}>Objetivo</div>
                                  <div style={campaignSampleFocusBodyValueStyle}>{item.note}</div>
                                </div>

                                <div style={campaignSampleFocusBodyStyle}>
                                  <div style={campaignSampleFocusBodyLabelStyle}>Workflow</div>
                                  <div style={campaignSampleFocusBodyValueStyle}>{item.workflow}</div>
                                </div>
                              </article>

                              <article style={campaignSamplePreviewCardStyle}>
                                <div style={campaignSamplePreviewHeaderStyle}>
                                  <div style={campaignSamplePreviewTextWrapStyle}>
                                    <div style={campaignSamplePreviewLabelStyle}>Arte Remotion</div>
                                    <div style={campaignSamplePreviewTitleStyle}>
                                      {item.previewVariant?.title ?? item.title}
                                    </div>
                                    <div style={campaignSamplePreviewSubtitleStyle}>
                                      {item.previewVariant
                                        ? "Preview gerado para este post planejado."
                                        : "Ainda não há render para este post."}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="action-button"
                                    style={renderedAssetPrimaryActionStyle}
                                    onClick={() =>
                                      item.previewVariant
                                        ? openCampaignArtPreview(
                                            item.previewVariant.title ?? item.title,
                                            item.previewVariant.previewDataUrl,
                                            item.previewVariant.previewMimeType,
                                          )
                                        : scrollToRenderedAssetSection()
                                    }
                                  >
                                    <AppIcon name={item.previewVariant ? "play_arrow" : "south"} style={actionIconStyle} />
                                    {item.previewVariant ? "Abrir player" : "Ver render"}
                                  </button>
                                </div>

                                {item.previewVariant ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCampaignArtPreview(
                                        item.previewVariant!.title ?? item.title,
                                        item.previewVariant!.previewDataUrl,
                                        item.previewVariant!.previewMimeType,
                                      )
                                    }
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      padding: 0,
                                      border: "none",
                                      background: "transparent",
                                      cursor: "pointer",
                                    }}
                                    aria-label={`Abrir arte de ${item.title}`}
                                  >
                                    <img
                                      alt={`Prévia Remotion de ${item.title}`}
                                      src={item.previewVariant.previewDataUrl}
                                      style={campaignSamplePreviewMediaStyle}
                                    />
                                  </button>
                                ) : (
                                  <EmptyStateNotice message="Aguardando o render Remotion deste post para mostrar a arte aqui." />
                                )}

                                {item.previewVariant ? (
                                  <div style={campaignSamplePreviewMetaStyle}>
                                    <span style={clientReportMetaPillStyle}>{item.previewVariant.label}</span>
                                    <span style={clientReportMetaPillStyle}>
                                      {item.previewVariant.sourceItem?.position ? `Post ${item.previewVariant.sourceItem.position}` : "render"}
                                    </span>
                                  </div>
                                ) : null}
                              </article>
                            </article>
                          ))
                        ) : (
                          <EmptyStateNotice message="Ainda não há itens de agenda para exibir." />
                        )}
                      </div>
                    </section>
                  </div>
                  {!campaignPublishedItems.length && !campaignScheduledItems.length ? (
                    <div style={clientFocusMetricGridStyle}>
                      {clientFocusCampaignFallbackCards.map((item) => (
                        <article key={item.label} style={clientFocusMetricCardStyle}>
                          <div style={clientFocusMetricLabelStyle}>{item.label}</div>
                          <div style={clientFocusMetricValueStyle}>{item.value}</div>
                          <div style={clientFocusSummaryHintStyle}>{item.hint}</div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            </section>
          ) : (
            <section className="section-card animate-rise-in" style={clientFocusCardStyle}>
              <div style={eyebrowStyle}>{ptBR.dashboard.feed.clientFocus}</div>
              <h2 style={panelTitleStyle}>Selecione um cliente</h2>
              <p style={panelCaptionStyle}>
                O dashboard foi enxugado. Ao escolher um cliente, a presença social e a campanha aparecem aqui.
              </p>
            </section>
          )}
        </main>
      </div>

      <button type="button" className="assist-fab" style={assistFabStyle} onClick={openConsole}>
        <AppIcon name="auto_awesome" style={assistFabIconStyle} />
        <span style={assistFabBadgeStyle} />
        <div className="assist-fab__tooltip" style={assistFabTooltipStyle}>
          <strong style={assistFabTooltipTitleStyle}>{ptBR.dashboard.topbar.askBen}</strong>
          <span style={assistFabTooltipTextStyle}>Como posso ajudar agora?</span>
        </div>
      </button>
    </div>
  );
}

function heroTiles(activeSquads: Array<{ squad: SquadInfo; state: SquadState }>, heroState: SquadState | null) {
  const strategy = activeSquads[0];
  const content = activeSquads[1];
  const insights = activeSquads[2];

  return [
    {
      title: `${ptBR.dashboard.agents.strategy}: ${strategy?.squad.name ?? "Ben IA"}`,
      status: strategy?.state?.step.label ?? ptBR.dashboard.agents.strategyStatus,
      metric: strategy ? `${strategy.state.step.current}/${strategy.state.step.total}` : ptBR.dashboard.agents.idle,
      badge: strategy ? "Ao vivo" : "Pausado",
    },
    {
      title: `${ptBR.dashboard.agents.content}: ${content?.squad.name ?? "Aria IA"}`,
      status: content?.state?.handoff ? `${content.state.handoff.from} → ${content.state.handoff.to}` : ptBR.dashboard.agents.contentStatus,
      metric: content ? `${Math.round((content.state.step.current / Math.max(content.state.step.total, 1)) * 100)}%` : ptBR.dashboard.agents.idle,
      badge: content ? "Criando" : "Ocioso",
    },
    {
      title: `${ptBR.dashboard.agents.insights}: ${insights?.squad.name ?? "Leo IA"}`,
      status: insights ? `Atualizado ${formatClock(insights.state.updatedAt)}` : ptBR.dashboard.agents.insightsStatus,
      metric: insights ? insights.state.step.label || `${insights.state.step.current}/${insights.state.step.total}` : ptBR.dashboard.agents.idle,
      badge: insights ? "Análise" : "Espera",
    },
    {
      title: ptBR.dashboard.agents.deployNew,
      status: heroState ? `${heroState.step.current}/${heroState.step.total} · ${heroState.step.label}` : "Pronto para uma nova missão",
      metric: "Novo",
      badge: "Ação",
    },
  ];
}

function MetricCard({
  eyebrow,
  value,
  hint,
  accent,
  warning,
}: {
  eyebrow: string;
  value: string;
  hint: string;
  accent: string;
  warning?: boolean;
}) {
  return (
    <article className="section-card animate-rise-in" style={metricCardStyle}>
      <div style={metricHeaderStyle}>
        <div style={metricEyebrowStyle}>{eyebrow}</div>
        <span style={metricBadgeStyle(warning)}>{warning ? "Atenção" : "Em alta"}</span>
      </div>
      <div style={metricValueStyle}>{value}</div>
      <div style={metricHintStyle}>{hint}</div>
      <div style={metricAccentStyle(accent)} />
    </article>
  );
}

function SignalChip({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div style={signalChipStyle(strong)}>
      <div style={signalLabelStyle}>{label}</div>
      <div style={signalValueStyle}>{value}</div>
    </div>
  );
}

function formatClock(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCompactNumber(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSignedDelta(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function formatPlatformLabel(platform: string) {
  const normalized = platform.trim().toLowerCase();

  switch (normalized) {
    case "youtube":
      return "YouTube";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    case "twitter":
    case "x":
      return "X";
    default:
      return platform;
  }
}

function formatObservationStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "captured":
      return "Capturado";
    case "partial":
      return "Parcial";
    case "unavailable":
      return "Indisponível";
    default:
      return `Status ${normalized}`;
  }
}

function formatAgentStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "idle":
      return "ocioso";
    case "working":
      return "trabalhando";
    case "delivering":
      return "entregando";
    case "done":
      return "concluído";
    case "checkpoint":
      return "checkpoint";
    default:
      return normalized || "sem estado";
  }
}

type AgentStatusTone = "idle" | "working" | "done" | "checkpoint";

function getAgentStatusTone(status: string): AgentStatusTone {
  const normalized = status.trim().toLowerCase();

  if (normalized === "done" || normalized === "concluído") {
    return "done";
  }

  if (normalized === "working" || normalized === "entregando" || normalized === "trabalhando") {
    return "working";
  }

  if (normalized === "checkpoint") {
    return "checkpoint";
  }

  return "idle";
}

function getAgentStatusTheme(status: string) {
  switch (getAgentStatusTone(status)) {
    case "done":
      return {
        background: "rgba(16, 185, 129, 0.12)",
        color: "rgb(5, 150, 105)",
        dot: "rgb(5, 150, 105)",
        border: "rgba(16, 185, 129, 0.18)",
      };
    case "working":
      return {
        background: "rgba(245, 158, 11, 0.12)",
        color: "rgb(180, 83, 9)",
        dot: "rgb(180, 83, 9)",
        border: "rgba(245, 158, 11, 0.18)",
      };
    case "checkpoint":
      return {
        background: "rgba(59, 130, 246, 0.12)",
        color: "rgb(37, 99, 235)",
        dot: "rgb(37, 99, 235)",
        border: "rgba(59, 130, 246, 0.18)",
      };
    default:
      return {
        background: "rgba(148, 163, 184, 0.14)",
        color: "rgb(71, 85, 105)",
        dot: "rgb(107, 114, 128)",
        border: "rgba(180,104,73,0.12)",
      };
  }
}

function formatNoteSummary(value: string | null) {
  if (!value) {
    return "sem notas adicionais";
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)[0] ?? "sem notas adicionais";
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function averageDefinedValues(values: Array<number | null | undefined>) {
  const defined = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (defined.length === 0) return null;

  return defined.reduce((acc, value) => acc + value, 0) / defined.length;
}

type ContentPackagePayload = {
  visualDirection?: {
    title?: string;
    owner?: string;
    mechanism: string;
    firstPass: string;
    masterAsset: string;
    supportChannels: string[];
    productImagePolicy: string;
    rules: string[];
    contentRhythm?: string;
    references?: string[];
    workflow?: {
      squad?: string;
      primaryOwner?: string;
      reviewGate?: string;
      scheduleGate?: string;
      agentTrail?: Array<{
        id: string;
        label: string;
        role: string;
        output: string;
      }>;
    };
  };
};

type AmiclubeCreativeAccent = "terracotta" | "sand" | "green";
type CreativeAgentId = "creator" | "visual-director" | "creative-renderer" | "reviewer" | "scheduler";

type RenderedAssetPayload = {
  title?: string;
  status?: string;
  clientName?: string;
  clientId?: string;
  variantType?: "overview" | "headline";
  variantLabel?: string;
  regeneration?: {
    mode?: "auto" | "alternate" | "revision";
    sourceAssetId?: string;
    sourceVersion?: number;
    note?: string | null;
    artDirectionKey?: string | null;
  } | null;
  focusItem?: {
    position?: number;
    channel?: string;
    title?: string;
    pillar?: string;
    angle?: string;
    objective?: string;
    reason?: string;
    format?: string;
    hook?: string;
    proof?: string;
    cta?: string;
    visualCue?: string;
    status?: string;
  } | null;
  contentPackageVersion?: number | null;
  scheduleVersion?: number | null;
  renderEngine?: string;
  assetFormat?: string;
  assetMimeType?: string | null;
  assetPath?: string | null;
  assetWidth?: number | null;
  assetHeight?: number | null;
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
  items?: Array<{
    position?: number;
    title?: string;
    channel?: string;
    format?: string;
    status?: string;
  }>;
};

const CREATIVE_AGENT_VISUALS: Record<CreativeAgentId, { icon: string; title: string }> = {
  creator: { icon: "✍️", title: "Creator" },
  "visual-director": { icon: "🎨", title: "Visual Director" },
  "creative-renderer": { icon: "🖼️", title: "Creative Renderer" },
  reviewer: { icon: "🧪", title: "Reviewer" },
  scheduler: { icon: "📅", title: "Scheduler" },
};

function parseContentPackagePayload(payload: unknown): ContentPackagePayload | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as ContentPackagePayload;
}

function parseRenderedAssetPayload(payload: unknown): RenderedAssetPayload | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as RenderedAssetPayload;
}

function getRenderedAssetRegenerationStorageKey(clientId: string) {
  return `${RENDERED_ASSET_REGENERATION_MEMORY_KEY_PREFIX}${clientId}`;
}

function readRenderedAssetRegenerationMemory(clientId: string): RenderedAssetRegenerationMemory | null {
  if (typeof window === "undefined" || !clientId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getRenderedAssetRegenerationStorageKey(clientId));
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<RenderedAssetRegenerationMemory> | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (parsed.objectiveKey !== "conversion" && parsed.objectiveKey !== "positioning" && parsed.objectiveKey !== "creative") {
      return null;
    }

    if (typeof parsed.note !== "string" || typeof parsed.updatedAt !== "string") {
      return null;
    }

    return {
      objectiveKey: parsed.objectiveKey,
      note: parsed.note,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

function writeRenderedAssetRegenerationMemory(clientId: string, memory: RenderedAssetRegenerationMemory) {
  if (typeof window === "undefined" || !clientId) {
    return;
  }

  try {
    window.localStorage.setItem(getRenderedAssetRegenerationStorageKey(clientId), JSON.stringify(memory));
  } catch {
    return;
  }
}

function getClientReportViewStorageKey(clientId: string) {
  return `${CLIENT_REPORT_VIEW_KEY_PREFIX}${clientId}`;
}

function readClientReportView(clientId: string): "client" | "market" | "before-after" | null {
  if (typeof window === "undefined" || !clientId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getClientReportViewStorageKey(clientId));
    if (rawValue === "client" || rawValue === "market" || rawValue === "before-after") {
      return rawValue;
    }
  } catch {
    return null;
  }

  return null;
}

function writeClientReportView(clientId: string, view: "client" | "market" | "before-after") {
  if (typeof window === "undefined" || !clientId) {
    return;
  }

  try {
    window.localStorage.setItem(getClientReportViewStorageKey(clientId), view);
  } catch {
    return;
  }
}

function getClientReportFocusStorageKey(clientId: string) {
  return `${CLIENT_REPORT_FOCUS_KEY_PREFIX}${clientId}`;
}

function readClientReportFocus(clientId: string): "overview" | "client" | "market" | "social" | "campaign" | null {
  if (typeof window === "undefined" || !clientId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getClientReportFocusStorageKey(clientId));
    if (rawValue === "overview" || rawValue === "client" || rawValue === "market" || rawValue === "social" || rawValue === "campaign") {
      return rawValue;
    }
  } catch {
    return null;
  }

  return null;
}

function writeClientReportFocus(clientId: string, focus: "overview" | "client" | "market" | "social" | "campaign") {
  if (typeof window === "undefined" || !clientId) {
    return;
  }

  try {
    window.localStorage.setItem(getClientReportFocusStorageKey(clientId), focus);
  } catch {
    return;
  }
}

function readDashboardTimelineScope(): "day" | "week" | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(DASHBOARD_TIMELINE_SCOPE_KEY);
    if (storedValue === "day" || storedValue === "week") {
      return storedValue;
    }
  } catch {
    return null;
  }

  return null;
}

function writeDashboardTimelineScope(scope: "day" | "week") {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_TIMELINE_SCOPE_KEY, scope);
  } catch {
    return;
  }
}

function readDashboardConsoleOpen(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(DASHBOARD_CONSOLE_OPEN_KEY);
    if (rawValue === "true") {
      return true;
    }
    if (rawValue === "false") {
      return false;
    }
  } catch {
    return null;
  }

  return null;
}

function writeDashboardConsoleOpen(isOpen: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_CONSOLE_OPEN_KEY, String(isOpen));
  } catch {
    return;
  }
}

function readDashboardSearch(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(DASHBOARD_SEARCH_KEY);
    return rawValue ? rawValue : null;
  } catch {
    return null;
  }
}

function writeDashboardSearch(search: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const normalized = search.trim();
    if (normalized) {
      window.localStorage.setItem(DASHBOARD_SEARCH_KEY, normalized);
    } else {
      window.localStorage.removeItem(DASHBOARD_SEARCH_KEY);
    }
  } catch {
    return;
  }
}

function readDashboardClientMenuOpen(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(DASHBOARD_CLIENT_MENU_OPEN_KEY);
    if (rawValue === "true") {
      return true;
    }
    if (rawValue === "false") {
      return false;
    }
  } catch {
    return null;
  }

  return null;
}

function writeDashboardClientMenuOpen(isOpen: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_CLIENT_MENU_OPEN_KEY, String(isOpen));
  } catch {
    return;
  }
}

function readDashboardLastAction(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(DASHBOARD_LAST_ACTION_KEY);
    return rawValue && rawValue.trim() ? rawValue : null;
  } catch {
    return null;
  }
}

function writeDashboardLastAction(action: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const normalized = action.trim();
    if (normalized) {
      window.localStorage.setItem(DASHBOARD_LAST_ACTION_KEY, normalized);
    } else {
      window.localStorage.removeItem(DASHBOARD_LAST_ACTION_KEY);
    }
  } catch {
    return;
  }
}

function readDashboardMainScroll(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(DASHBOARD_MAIN_SCROLL_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeDashboardMainScroll(scrollTop: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_MAIN_SCROLL_KEY, String(Math.max(0, Math.floor(scrollTop))));
  } catch {
    return;
  }
}

function getAmiclubeSlideIndexStorageKey(clientId: string) {
  return `${AMICLUBE_SLIDE_INDEX_KEY_PREFIX}${clientId}`;
}

function readAmiclubeSlideIndex(clientId: string) {
  if (typeof window === "undefined" || !clientId) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getAmiclubeSlideIndexStorageKey(clientId));
    if (!rawValue) {
      return null;
    }

    const parsed = Number.parseInt(rawValue, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeAmiclubeSlideIndex(clientId: string, index: number) {
  if (typeof window === "undefined" || !clientId || !Number.isFinite(index) || index < 0) {
    return;
  }

  try {
    window.localStorage.setItem(getAmiclubeSlideIndexStorageKey(clientId), String(index));
  } catch {
    return;
  }
}

function getRenderedAssetRegenerationDefaultObjectiveKey(payload: RenderedAssetPayload | null): RenderedAssetRegenerationObjectiveKey {
  if (payload?.variantType === "headline") {
    return "conversion";
  }

  if (payload?.variantType === "overview") {
    return "positioning";
  }

  return "creative";
}

type RenderedAssetRegenerationPreset = {
  label: string;
  note: string;
};

type RenderedAssetRegenerationObjective = {
  key: "conversion" | "positioning" | "creative";
  title: string;
  description: string;
  presets: RenderedAssetRegenerationPreset[];
};

function getRenderedAssetRegenerationObjectives(payload: RenderedAssetPayload | null) {
  const isHeadline = payload?.variantType === "headline";
  const isOverview = payload?.variantType === "overview";

  return [
    {
      key: "conversion",
      title: "1. Aumentar conversão",
      description: isHeadline
        ? "Ajusta a chamada principal para ganhar clareza, desejo e resposta direta."
        : isOverview
          ? "Ajusta o resumo para tornar o caminho até a ação mais objetivo."
          : "Ajusta a peça para ser mais direta, clara e orientada à ação.",
      presets: [
        { label: "CTA mais forte", note: "Deixar a chamada final mais clara, direta e convincente." },
        { label: "Mais urgência", note: "Aumentar o senso de oportunidade e o impulso para agir agora." },
        { label: "Mais benefício", note: "Explicitar melhor a transformação ou ganho prático da peça." },
      ],
    },
    {
      key: "positioning",
      title: "2. Reforçar posicionamento",
      description: isHeadline
        ? "Aumenta percepção de valor, autoridade e sofisticação da mensagem."
        : isOverview
          ? "Deixa a proposta mais estratégica e alinhada com o posicionamento da marca."
          : "Reforça autoridade, valor percebido e consistência de marca.",
      presets: [
        { label: "Mais premium", note: "Ajustar para um tom mais premium, elegante e convincente." },
        { label: "Mais autoridade", note: "Reforçar credibilidade, experiência e confiança na proposta." },
        { label: "Mais estratégia", note: "Posicionar a mensagem com mais visão, contexto e intenção comercial." },
      ],
    },
    {
      key: "creative",
      title: "3. Variar ângulo criativo",
      description: isHeadline
        ? "Explora uma nova abordagem de hook, narrativa ou composição."
        : isOverview
          ? "Testa uma leitura diferente sem perder a mensagem principal."
          : "Gera uma variação visual para testar outro caminho de atenção.",
      presets: [
        { label: "Mais ousado", note: "Testar uma abordagem mais marcante, diferente e memorável." },
        { label: "Mais visual", note: "Dar mais destaque para a composição e a leitura visual do criativo." },
        { label: "Outro ângulo", note: "Trocar o foco da proposta para um caminho criativo diferente." },
      ],
    },
  ] as const;
}

type PublishingSchedulePayload = {
  cadence?: string;
  items?: Array<{
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
  workflow?: {
    squad?: string;
    primaryOwner?: string;
    upstreamOwner?: string;
    agentTrail?: Array<{
      id: string;
      label: string;
      role: string;
      output: string;
    }>;
  };
};

type PublishingExecutionResult = {
  publishedAt?: string | null;
  notes?: string | null;
  deliveryMode?: string;
  status?: string;
  executionSummary?: {
    targetPlatforms?: unknown;
    blockers?: string[];
    warnings?: string[];
  };
};

function parsePublishingSchedulePayload(payload: unknown): PublishingSchedulePayload | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as PublishingSchedulePayload;
}

function parsePublishingExecutionResult(payload: PublishingExecution["result_json"]): PublishingExecutionResult | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as PublishingExecutionResult;
}

function normalizePublishingPlatforms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is string => item.length > 0);
}

function formatPublishingMode(mode: string) {
  switch (mode.trim().toLowerCase()) {
    case "dry_run":
      return "Dry-run";
    case "live":
      return "Ao vivo";
    default:
      return mode;
  }
}

function formatPublishingToken(value: string) {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "post":
      return "Post";
    case "reel":
      return "Reel";
    case "story":
      return "Story";
    case "carousel":
      return "Carrossel";
    case "video":
      return "Vídeo";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "linkedin":
      return "LinkedIn";
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    default:
      return value;
  }
}

function formatCampaignItemStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "planned":
      return "Planejado";
    case "scheduled":
      return "Agendado";
    case "queued":
      return "Na fila";
    case "published":
      return "Publicado";
    case "draft":
      return "Rascunho";
    case "review":
      return "Em revisão";
    case "approved":
      return "Aprovado";
    case "blocked":
      return "Bloqueado";
    case "failed":
      return "Falhou";
    case "dry_run_passed":
      return "Dry-run aprovado";
    default:
      return formatArtifactStatus(normalized);
  }
}

function formatArtifactStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "intake":
      return "Intake";
    case "client_record":
      return "Registro do cliente";
    case "research":
      return "Pesquisa";
    case "strategy":
      return "Estratégia";
    case "content_plan":
      return "Plano de conteúdo";
    case "content_production_package":
      return "Pacote de produção de conteúdo";
    case "schedule":
      return "Agenda";
    case "approval":
      return "Aprovação";
    case "publish":
      return "Publicação";
    case "monitoring":
      return "Monitoramento";
    case "adjustment":
      return "Ajuste";
    case "draft":
      return "Registro em rascunho";
    case "review":
      return "Registro em revisão";
    case "approved":
      return "Registro aprovado";
    case "published":
      return "Registro publicado";
    case "dry_run_passed":
      return "Dry-run aprovado";
    case "blocked":
      return "Bloqueado";
    case "queued":
      return "Na fila";
    case "failed":
      return "Falhou";
    case "pending":
      return "Pendente";
    case "rejected":
      return "Rejeitado";
    case "archived":
      return "Arquivado";
    default:
      return `Registro ${normalized}`;
  }
}

function clientAvatarInitials(client: Client | null) {
  if (!client) return "—";

  const parts = client.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "—";

  return parts.map((part: string) => part[0]?.toUpperCase() ?? "").join("");
}

const shellStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  minHeight: "100vh",
};

const sidebarStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "100vh",
  padding: "24px 18px 20px",
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 28,
};

const brandMarkStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(107,56,212,0.96), rgba(132,85,239,0.96))",
  color: "var(--on-primary)",
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontWeight: 700,
  boxShadow: "0 14px 28px rgba(107, 56, 212, 0.24)",
};

const brandTitleStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 24,
  fontWeight: 700,
  color: "var(--primary)",
  lineHeight: 1,
};

const brandEyebrowStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const navStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 24,
};

const navItemStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "12px 14px 12px 16px",
  border: "none",
  borderRadius: 16,
  background: "transparent",
  color: "var(--text-secondary)",
  textAlign: "left",
  fontWeight: 600,
  cursor: "pointer",
};

const navActiveStyle: React.CSSProperties = {
  ...navItemStyle,
  background: "rgba(255, 255, 255, 0.72)",
  color: "var(--accent-cyan)",
  boxShadow: "0 12px 32px rgba(26, 27, 65, 0.06)",
  paddingLeft: 18,
};

const navIconStyle: React.CSSProperties = {
  fontSize: 20,
};

const sidebarSectionStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  flex: 1,
  minHeight: 0,
};

const sidebarContextPanelStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 16,
  borderRadius: 22,
  background:
    "linear-gradient(135deg, rgba(107,56,212,0.10) 0%, rgba(255,255,255,0.88) 48%, rgba(180,104,73,0.10) 100%)",
  border: "1px solid rgba(107,56,212,0.12)",
  boxShadow: "0 16px 34px rgba(26, 27, 65, 0.08)",
  marginBottom: 2,
};

const sidebarContextPanelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const sidebarContextPanelIconStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  color: "var(--primary)",
  flexShrink: 0,
};

const sidebarContextPanelHeaderTextStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
};

const sidebarContextPanelLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--primary)",
};

const sidebarContextPanelValueStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-primary)",
  lineHeight: 1.35,
};

const sidebarContextPanelGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const sidebarContextPanelChipStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  padding: "10px 12px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.86)",
  border: "1px solid rgba(107,56,212,0.10)",
};

const sidebarContextPanelChipLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const sidebarContextPanelChipValueStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--text-primary)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const sidebarContextPanelActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
  padding: "11px 14px",
  border: "none",
  borderRadius: 16,
  background: "linear-gradient(135deg, rgba(107,56,212,0.96), rgba(180,104,73,0.92))",
  color: "var(--on-primary)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 16px 28px rgba(107,56,212,0.18)",
};

const sidebarContextPanelActionIconStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  flexShrink: 0,
};

const sidebarContextPanelHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  lineHeight: 1.45,
};

const sidebarSectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "baseline",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const mutedTinyStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
};

const squadRailStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  overflow: "auto",
  paddingRight: 4,
  minHeight: 0,
};

const squadItemStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "12px 14px",
  border: "none",
  borderRadius: 18,
  background: "rgba(255,255,255,0.58)",
  color: "var(--text-primary)",
  cursor: "pointer",
  textAlign: "left",
};

const squadItemActiveStyle: React.CSSProperties = {
  ...squadItemStyle,
  background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(233,221,255,0.78))",
  boxShadow: "0 14px 30px rgba(26, 27, 65, 0.08)",
};

const squadIconStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: "grid",
  placeItems: "center",
  borderRadius: 14,
  background: "rgba(107,56,212,0.12)",
  fontSize: 18,
};

const squadInfoStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 3,
};

const squadNameStyle: React.CSSProperties = {
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const squadDescriptionStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const squadStatusStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
};

const activeDotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "var(--accent-green)",
  boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.15)",
};

const idleDotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "rgba(93, 100, 114, 0.34)",
};

const sidebarFooterStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 20,
};

const primaryActionStyle: React.CSSProperties = {
  width: "100%",
  justifyContent: "center",
};

const secondaryActionStyle: React.CSSProperties = {
  background: "var(--primary-container)",
  color: "var(--on-primary)",
};

const ghostActionStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.76)",
  color: "var(--primary)",
};

const supportRowStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const supportLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "10px 12px",
  border: "none",
  borderRadius: 14,
  background: "rgba(255,255,255,0.45)",
  color: "var(--text-secondary)",
  cursor: "pointer",
  textAlign: "left",
};

const supportIconStyle: React.CSSProperties = {
  fontSize: 18,
};

const connectionCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 12px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.76)",
  boxShadow: "0 12px 32px rgba(26, 27, 65, 0.06)",
};

const connectionDotStyle = (connected: boolean): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: 999,
  background: connected ? "var(--accent-green)" : "var(--accent-red)",
  boxShadow: connected ? "0 0 0 5px rgba(16, 185, 129, 0.12)" : "0 0 0 5px rgba(220, 38, 38, 0.12)",
});

const connectionTextWrapStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 2,
};

const connectionStatusStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--primary)",
};

const connectionHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
};

const contentStyle: React.CSSProperties = {
  minWidth: 0,
};

const topbarStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 24,
  padding: "18px 28px 14px",
  margin: "0 0 18px",
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,249,244,0.95) 58%, rgba(248,239,255,0.92) 100%)",
  border: "1px solid rgba(107,56,212,0.12)",
  boxShadow: "0 18px 40px rgba(26, 27, 65, 0.08)",
  backdropFilter: "blur(14px)",
};

const topbarLinkStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontWeight: 600,
};

const topbarLinkIconStyle: React.CSSProperties = {
  width: 16,
  height: 16,
};

const topbarRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const actionIconStyle: React.CSSProperties = {
  fontSize: 18,
};

const renderedAssetPrimaryActionStyle: React.CSSProperties = {
  background: "var(--primary)",
  color: "white",
  boxShadow: "0 14px 28px rgba(180,104,73,0.18)",
};

const mainStyle: React.CSSProperties = {
  padding: "0 28px 28px",
  display: "grid",
  gap: 24,
};

const clientCardStyle: React.CSSProperties = {
  padding: 24,
  position: "relative",
  zIndex: 10,
};

const clientCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const clientIdentityStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  minWidth: 0,
};

const clientAvatarStyle: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(26,27,65,0.96), rgba(107,56,212,0.94))",
  color: "var(--on-primary)",
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 20,
  fontWeight: 700,
  flexShrink: 0,
};

const clientTextWrapStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const clientTitleStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 24,
  fontWeight: 700,
  color: "var(--primary)",
  lineHeight: 1.05,
};

const clientSubtitleStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  lineHeight: 1.45,
};

const clientRelationshipStyle: React.CSSProperties = {
  marginTop: 6,
  color: "var(--secondary)",
  fontSize: 12,
  fontWeight: 700,
};

const clientMenuWrapStyle: React.CSSProperties = {
  position: "relative",
  minWidth: 320,
};

const clientSwitchButtonStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "12px 14px",
  border: "none",
  borderRadius: 18,
  background: "rgba(255,255,255,0.8)",
  color: "var(--text-primary)",
  cursor: "pointer",
  boxShadow: "0 12px 32px rgba(26, 27, 65, 0.06)",
};

const clientSwitchAvatarStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(107,56,212,0.98), rgba(132,85,239,0.96))",
  color: "var(--on-primary)",
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontWeight: 700,
};

const clientSwitchTextStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
  textAlign: "left",
};

const clientSwitchLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const clientSwitchValueStyle: React.CSSProperties = {
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const clientSwitchIconStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
};

const clientMenuStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 10px)",
  width: "100%",
  padding: 10,
  borderRadius: 20,
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 24px 48px rgba(26, 27, 65, 0.14)",
  display: "grid",
  gap: 6,
  zIndex: 30,
};

const clientMenuEmptyStyle: React.CSSProperties = {
  padding: "14px 12px",
  color: "var(--text-secondary)",
};

const clientMenuItemStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "10px 12px",
  border: "none",
  borderRadius: 14,
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
};

const clientMenuItemSelectedStyle: React.CSSProperties = {
  ...clientMenuItemStyle,
  background: "rgba(107,56,212,0.08)",
};

const clientMenuAvatarStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "rgba(107,56,212,0.12)",
  color: "var(--primary)",
  fontSize: 12,
  fontWeight: 700,
};

const clientMenuItemTextStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
};

const clientMenuItemTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const clientMenuItemSubtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
};

const clientMenuItemRelationshipStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--secondary)",
};

const clientMenuSelectedDotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "var(--accent-green)",
};

const heroCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 280px",
  gap: 24,
  padding: 28,
};

const heroLeftStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  minWidth: 0,
};

const heroHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 18,
};

const heroTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: "clamp(2rem, 4vw, 3.25rem)",
  lineHeight: 0.98,
  letterSpacing: "-0.04em",
  color: "var(--primary)",
};

const heroSubtitleStyle: React.CSSProperties = {
  marginTop: 10,
  color: "var(--text-secondary)",
  maxWidth: 740,
};

const heroMetaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const heroPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(107,56,212,0.08)",
  color: "var(--primary)",
  fontSize: 13,
  fontWeight: 600,
};

const heroRightStyle: React.CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: 10,
  padding: 20,
  borderRadius: 20,
  background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(242,244,247,0.92))",
};

const avatarStackStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const heroAvatarStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  marginRight: -8,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(107,56,212,0.94), rgba(132,85,239,0.94))",
  color: "var(--on-primary)",
  boxShadow: "0 10px 24px rgba(107,56,212,0.18)",
};

const heroMoreAvatarStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  marginLeft: 4,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.8)",
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 700,
};

const heroSideLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const heroSideValueStyle: React.CSSProperties = {
  fontSize: 22,
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontWeight: 700,
  color: "var(--primary)",
};

const heroSideHintStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-secondary)",
};

const agentsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
};

const agentCardStyle: React.CSSProperties = {
  padding: 20,
  display: "grid",
  gap: 12,
  minHeight: 168,
};

const agentCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 12,
};

const agentNameStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 18,
  fontWeight: 700,
  color: "var(--primary)",
};

const agentBadgeStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(107,56,212,0.1)",
  color: "var(--accent-cyan)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
};

const agentStatusStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  lineHeight: 1.45,
};

const agentCampaignRailStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(0, 212, 255, 0.18)",
  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.10), rgba(255,255,255,0.03))",
  display: "grid",
  gap: 8,
};

const agentCampaignActionStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 700,
};

const agentCampaignFlowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "nowrap",
};

const agentCampaignFlowStepStyle = (state: "done" | "active" | "pending"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  padding: "8px 10px",
  minHeight: 34,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.2,
  color:
    state === "active"
      ? "rgba(255,255,255,0.98)"
      : state === "done"
        ? "rgba(200,214,255,0.92)"
        : "var(--text-secondary)",
  background:
    state === "active"
      ? "linear-gradient(135deg, rgba(0, 212, 255, 0.94), rgba(107,56,212,0.92))"
      : state === "done"
        ? "rgba(0, 212, 255, 0.12)"
        : "rgba(255,255,255,0.05)",
  border:
    state === "active"
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(255,255,255,0.08)",
  boxShadow: state === "active" ? "0 10px 22px rgba(0, 212, 255, 0.18)" : "none",
  animation: state === "active" ? "pulseAccent 2.2s ease-in-out infinite" : "none",
  whiteSpace: "nowrap",
});

const agentCampaignFlowIconStyle = (state: "done" | "active" | "pending"): React.CSSProperties => ({
  width: 14,
  height: 14,
  flex: "0 0 auto",
  color:
    state === "active"
      ? "#ffffff"
      : state === "done"
        ? "rgba(0, 212, 255, 0.96)"
        : "rgba(255,255,255,0.38)",
  animation: state === "active" ? "pulseAccent 2.2s ease-in-out infinite" : "none",
});

const agentCampaignFlowConnectorStyle = (state: "done" | "active" | "pending"): React.CSSProperties => ({
  flex: "1 1 18px",
  height: 2,
  borderRadius: 999,
  background:
    state === "done"
      ? "linear-gradient(90deg, rgba(0, 212, 255, 0.85), rgba(107,56,212,0.65))"
      : state === "active"
        ? "linear-gradient(90deg, rgba(0, 212, 255, 0.45), rgba(255,255,255,0.12))"
        : "rgba(255,255,255,0.12)",
  opacity: state === "pending" ? 0.75 : 1,
});

const agentCampaignMetaStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const agentMetricStyle: React.CSSProperties = {
  fontSize: 32,
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontWeight: 700,
  color: "var(--primary)",
  alignSelf: "end",
};

const deployCardStyle: React.CSSProperties = {
  minHeight: 168,
  padding: 20,
  border: "1px dashed rgba(107,56,212,0.28)",
  background: "rgba(255,255,255,0.44)",
  color: "var(--text-secondary)",
  display: "grid",
  placeItems: "center",
  gap: 10,
  cursor: "pointer",
};

const deployIconStyle: React.CSSProperties = {
  fontSize: 28,
  color: "var(--accent-cyan)",
};

const deployTextStyle: React.CSSProperties = {
  fontWeight: 700,
};

const dashboardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, 0.85fr)",
  gap: 24,
  alignItems: "start",
};

const leftColumnStyle: React.CSSProperties = {
  display: "grid",
  gap: 24,
  minWidth: 0,
};

const rightColumnStyle: React.CSSProperties = {
  display: "grid",
  gap: 24,
  minWidth: 0,
  position: "sticky",
  top: 104,
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
};

const metricCardStyle: React.CSSProperties = {
  position: "relative",
  minHeight: 220,
  padding: 24,
  overflow: "hidden",
  display: "grid",
  alignContent: "start",
  gap: 12,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.06), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const metricHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 10,
};

const metricEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const metricBadgeStyle = (warning?: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  background: warning ? "rgba(245, 158, 11, 0.14)" : "rgba(0, 212, 255, 0.08)",
  color: warning ? "var(--warning)" : "var(--accent-cyan)",
  fontSize: 11,
  fontWeight: 700,
});

const metricValueStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 56,
  fontWeight: 700,
  lineHeight: 0.96,
  letterSpacing: "-0.05em",
  color: "var(--text-primary)",
  marginTop: 6,
};

const metricHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  marginTop: "auto",
};

const metricAccentStyle = (accent: string): React.CSSProperties => ({
  height: 10,
  borderRadius: 999,
  background: accent.startsWith("linear-gradient") ? accent : "linear-gradient(135deg, rgba(107,56,212,0.12), rgba(132,85,239,0.42))",
  marginTop: 8,
});

const timelineCardStyle: React.CSSProperties = {
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.05), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
};

const panelTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 22,
  fontWeight: 700,
  color: "var(--text-primary)",
};

const panelCaptionStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 13,
};

const scopeToggleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: 4,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const scopeButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  padding: "8px 12px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  color: "var(--text-secondary)",
  cursor: "pointer",
};

const scopeButtonActiveStyle: React.CSSProperties = {
  ...scopeButtonStyle,
  background: "rgba(0, 212, 255, 0.10)",
  color: "var(--accent-cyan)",
};

const timelineListStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const timelineRowStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const timelineRowHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const timelineRowIdentityStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const timelineAvatarStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "rgba(0, 212, 255, 0.08)",
};

const timelineAvatarIconStyle: React.CSSProperties = {
  fontSize: 22,
  color: "var(--accent-cyan)",
};

const timelineRowTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--text-primary)",
};

const timelineRowHintStyle: React.CSSProperties = {
  marginTop: 2,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const timelineActionStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "none",
  borderRadius: 999,
  background: "rgba(0, 212, 255, 0.08)",
  color: "var(--accent-cyan)",
  fontWeight: 700,
  cursor: "pointer",
};

const progressTrackStyle: React.CSSProperties = {
  height: 10,
  borderRadius: 999,
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.92), rgba(0, 156, 255, 0.92))",
};

const timelineMetaStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  color: "var(--text-secondary)",
  fontSize: 12,
  flexWrap: "wrap",
};

const handoffCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(245, 158, 11, 0.10)",
  border: "1px solid rgba(245, 158, 11, 0.16)",
};

const handoffBadgeStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(245, 158, 11, 0.12)",
  color: "var(--accent-cyan)",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const handoffTextStyle: React.CSSProperties = {
  minWidth: 0,
  color: "var(--text-primary)",
};

const workspaceCardStyle: React.CSSProperties = {
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.05), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const sceneShellCardStyle: React.CSSProperties = {
  height: 440,
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(16,17,24,0.96), rgba(19,20,30,0.98))",
  boxShadow: "0 24px 64px rgba(26,27,65,0.14)",
};

const consoleDetailsStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 24,
  borderRadius: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.05), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const consoleSummaryStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 18,
  cursor: "pointer",
  listStyle: "none",
};

const consoleSubtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-secondary)",
  maxWidth: 620,
};

const consoleToggleStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  background: "rgba(0, 212, 255, 0.08)",
  color: "var(--accent-cyan)",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const consolePanelWrapStyle: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gap: 18,
};

const feedCardStyle: React.CSSProperties = {
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.05), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const clientReportCardStyle: React.CSSProperties = {
  ...feedCardStyle,
  display: "grid",
  gap: 16,
};

const clientReportGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const clientReportStatStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 20,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 10,
  minHeight: 150,
};

const clientReportStatLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "rgba(190,200,230,0.74)",
};

const clientReportStatValueStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: "rgba(244,247,255,0.95)",
  fontWeight: 600,
};

const clientReportStatHintStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(182,193,224,0.84)",
  marginTop: "auto",
};

const clientReportActionRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const clientReportMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const clientReportMetaPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(236,242,255,0.88)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.01em",
};

const clientReportSnapshotCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const clientReportSnapshotHeaderStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const clientReportSnapshotTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 15,
  lineHeight: 1.4,
  fontWeight: 700,
  color: "rgba(244,247,255,0.98)",
};

const clientReportSnapshotMetaStyle: React.CSSProperties = {
  maxWidth: 420,
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(182,193,224,0.86)",
};

const clientReportSnapshotGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const clientReportSnapshotLineStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "12px 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const clientReportSnapshotLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(190,200,230,0.74)",
};

const clientReportSnapshotValueStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(244,247,255,0.95)",
  fontWeight: 600,
  wordBreak: "break-word",
};

const clientReportSnapshotLinkStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  textDecoration: "none",
};

const clientReportChipGroupStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 8,
};

const clientReportSnapshotChipLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(190,200,230,0.74)",
  marginRight: 2,
};

const clientReportPaletteChipStyle = (color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: color,
  color: "#10131b",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.01em",
});

const clientReportNarrativeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

const clientReportNarrativeCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 10,
  minHeight: 162,
};

const clientReportNarrativeCardFocusStyle: React.CSSProperties = {
  borderColor: "rgba(249,115,22,0.42)",
  background: "rgba(255,248,242,0.9)",
  boxShadow: "0 14px 30px rgba(249,115,22,0.10)",
};

const clientReportNarrativeLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "rgba(190,200,230,0.74)",
};

const clientReportNarrativeValueStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: "rgba(244,247,255,0.96)",
  fontWeight: 600,
};

const clientReportNarrativeHintStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(182,193,224,0.86)",
  marginTop: "auto",
};

const clientReportFocusChipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(236,242,255,0.88)",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const socialPresencePanelStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 22,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const socialPresenceHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const socialPresenceTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 15,
  lineHeight: 1.5,
  color: "rgba(244,247,255,0.96)",
  fontWeight: 700,
};

const socialPresenceSubtitleStyle: React.CSSProperties = {
  marginTop: 4,
  color: "rgba(182,193,224,0.86)",
  fontSize: 12,
  lineHeight: 1.45,
};

const socialPresenceMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "flex-end",
};

const socialPresenceNetworkListStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
};

const socialPresenceNetworkCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 10,
  minHeight: 0,
};

const socialPresenceNetworkTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const socialPresenceNetworkIdentityStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 0,
};

const socialPresenceNetworkPlatformStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(190,200,230,0.74)",
};

const socialPresenceNetworkHandleStyle: React.CSSProperties = {
  color: "rgba(244,247,255,0.96)",
  fontWeight: 700,
};

const socialPresenceNetworkUrlStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  fontSize: 11,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
};

const socialPresenceNetworkStatusStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const socialPresenceStatusPillStyle = (status: string): React.CSSProperties => {
  const normalized = status.trim().toLowerCase();

  const background =
    normalized === "captured"
      ? "rgba(0, 212, 255, 0.12)"
      : normalized === "partial"
        ? "rgba(245, 158, 11, 0.14)"
        : "rgba(148, 163, 184, 0.14)";
  const color =
    normalized === "captured"
      ? "var(--accent-cyan)"
      : normalized === "partial"
        ? "rgb(251, 191, 36)"
        : "rgb(203, 213, 225)";

  return {
    padding: "6px 10px",
    borderRadius: 999,
    background,
    color,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.02,
    whiteSpace: "nowrap",
  };
};

const socialPresenceConfidenceStyle: React.CSSProperties = {
  color: "rgba(182,193,224,0.86)",
  fontSize: 11,
  fontWeight: 600,
};

const socialPresenceMetricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
  gap: 8,
};

const socialPresenceMetricCardStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 4,
};

const socialPresenceMetricLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "rgba(190,200,230,0.74)",
};

const socialPresenceMetricValueStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(244,247,255,0.96)",
  fontWeight: 700,
};

const socialPresenceEmptyMetricsStyle: React.CSSProperties = {
  color: "rgba(182,193,224,0.78)",
  fontSize: 11,
  lineHeight: 1.4,
};

const socialPresenceNetworkFooterStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  color: "rgba(182,193,224,0.82)",
  fontSize: 12,
  lineHeight: 1.45,
};

const amiclubePostPreviewStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 18,
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(255,252,247,0.98), rgba(247,241,232,0.96))",
  border: "1px solid rgba(180,104,73,0.2)",
  boxShadow: "0 18px 40px rgba(124, 45, 18, 0.08)",
};

const amiclubePostPreviewHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const amiclubePostPreviewEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  color: "rgba(154,52,18,0.78)",
  fontWeight: 800,
};

const amiclubePostPreviewTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 20,
  lineHeight: 1.18,
  color: "rgb(41, 20, 11)",
  fontWeight: 800,
  maxWidth: 520,
};

const amiclubePostPreviewSubtitleStyle: React.CSSProperties = {
  marginTop: 6,
  color: "rgba(91, 55, 42, 0.78)",
  fontSize: 13,
  lineHeight: 1.5,
  maxWidth: 560,
};

const amiclubePostPreviewTagRowStyle = (compact: boolean): React.CSSProperties => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: compact ? "flex-start" : "flex-end",
});

const amiclubePostPreviewTagStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(154,52,18,0.14)",
  background: "rgba(255,255,255,0.92)",
  color: "rgba(124,45,18,0.92)",
  fontSize: 11,
  fontWeight: 700,
};

const amiclubePostPreviewAttributionStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: "14px 16px",
  borderRadius: 20,
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(180,104,73,0.14)",
};

const amiclubePostPreviewAttributionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "rgba(154,52,18,0.74)",
  fontWeight: 800,
};

const amiclubePostPreviewAgentTrailStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const amiclubePostPreviewAttributionPillStyle = (compact: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "9px 11px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(180,104,73,0.12)",
  minWidth: compact ? 0 : 170,
  flex: compact ? "1 1 100%" : "1 1 170px",
});

const amiclubePostPreviewAttributionAgentStyle: React.CSSProperties = {
  color: "rgb(41, 20, 11)",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "lowercase",
};

const amiclubePostPreviewAttributionMetaStyle: React.CSSProperties = {
  color: "rgba(91, 55, 42, 0.76)",
  fontSize: 12,
  lineHeight: 1.2,
};

const amiclubePostPreviewAttributionFileStyle: React.CSSProperties = {
  color: "rgba(124,45,18,0.78)",
  fontSize: 11,
  fontWeight: 700,
};

const amiclubePostPreviewAttributionSummaryStyle: React.CSSProperties = {
  color: "rgba(91, 55, 42, 0.74)",
  fontSize: 12,
  lineHeight: 1.45,
};

const amiclubePostPreviewAgentIconStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 6px 14px rgba(124,45,18,0.08)",
  flexShrink: 0,
  fontSize: 15,
};

const amiclubePostPreviewAgentBodyStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
};

const amiclubePostPreviewTimelineWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  paddingTop: 4,
};

const amiclubePostPreviewTimelineLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(154,52,18,0.74)",
  fontWeight: 800,
};

const amiclubePostPreviewTimelineStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const amiclubePostPreviewTimelineItemStyle = (status: string, isLast: boolean): React.CSSProperties => {
  const theme = getAgentStatusTheme(status);

  return {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.78)",
    border: `1px solid ${theme.border}`,
    boxShadow: "0 8px 18px rgba(124,45,18,0.04)",
    opacity: status.trim().length === 0 ? 0.82 : 1,
    marginBottom: isLast ? 0 : 0,
  };
};

const amiclubePostPreviewTimelineIconStyle = (status: string): React.CSSProperties => {
  const theme = getAgentStatusTheme(status);

  return {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: theme.background,
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 6px 14px rgba(124,45,18,0.05)",
    flexShrink: 0,
    fontSize: 14,
  };
};

const amiclubePostPreviewTimelineBodyStyle: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
};

const amiclubePostPreviewTimelineTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "rgb(41, 20, 11)",
  textTransform: "lowercase",
};

const amiclubePostPreviewTimelineMetaStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(91, 55, 42, 0.78)",
  lineHeight: 1.3,
};

const amiclubePostPreviewTimelineStatusStyle = (status: string): React.CSSProperties => {
  const theme = getAgentStatusTheme(status);

  return {
    display: "inline-flex",
    width: "fit-content",
    alignItems: "center",
    gap: 5,
    padding: "3px 7px",
    borderRadius: 999,
    background: theme.background,
    color: theme.color,
    fontSize: 11,
    fontWeight: 800,
    textTransform: "lowercase",
  };
};

const amiclubePostPreviewAgentStatusStyle = (status: string): React.CSSProperties => {
  const theme = getAgentStatusTheme(status);

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    width: "fit-content",
    padding: "3px 8px",
    borderRadius: 999,
    background: theme.background,
    color: theme.color,
    fontSize: 11,
    fontWeight: 800,
    textTransform: "lowercase",
  };
};

const amiclubePostPreviewAgentDotStyle = (status: string): React.CSSProperties => {
  const theme = getAgentStatusTheme(status);

  return {
    width: 7,
    height: 7,
    borderRadius: 999,
    background: theme.dot,
  };
};

const amiclubePostCanvasStyle = (compact: boolean): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1.35fr) minmax(240px, 0.9fr)",
  gap: 14,
  alignItems: "stretch",
});

const amiclubeCarouselControlsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const amiclubeCarouselButtonRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const amiclubeCarouselButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minWidth: 40,
  height: 40,
  padding: "0 14px",
  borderRadius: 999,
  border: "1px solid rgba(180,104,73,0.18)",
  background: "rgba(255,255,255,0.94)",
  color: "rgba(124,45,18,0.92)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(124, 45, 18, 0.06)",
};

const amiclubeCarouselButtonIconStyle: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
};

const amiclubeCarouselDotsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const amiclubeCarouselDotStyle = (active: boolean): React.CSSProperties => ({
  width: active ? 18 : 10,
  height: 10,
  borderRadius: 999,
  border: "none",
  background: active ? "rgba(124,45,18,0.92)" : "rgba(180,104,73,0.22)",
  cursor: "pointer",
  transition: "width 160ms ease, background 160ms ease",
});

const amiclubeSlideColumnStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  alignContent: "start",
};

const amiclubeSlideRailItemStyle = (active: boolean): React.CSSProperties => ({
  display: "grid",
  gap: 6,
  padding: 14,
  borderRadius: 18,
  border: active ? "1px solid rgba(124,45,18,0.24)" : "1px solid rgba(180,104,73,0.14)",
  background: active ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.78)",
  boxShadow: active ? "0 10px 20px rgba(124, 45, 18, 0.08)" : "none",
  cursor: "pointer",
});

const amiclubeSlideRailLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "rgba(154,52,18,0.74)",
  fontWeight: 800,
};

const amiclubeSlideRailTitleStyle: React.CSSProperties = {
  color: "rgb(41, 20, 11)",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 800,
};

const amiclubeSlideRailPreviewStyle: React.CSSProperties = {
  color: "rgba(91, 55, 42, 0.78)",
  fontSize: 12,
  lineHeight: 1.45,
};

const amiclubeSlideRailProgressStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  color: "rgba(154,52,18,0.76)",
  fontSize: 11,
  fontWeight: 700,
};

const amiclubeSlideMainStyle = (accent: AmiclubeCreativeAccent): React.CSSProperties => {
  const gradient =
    accent === "green"
      ? "linear-gradient(180deg, rgba(248,255,249,0.98), rgba(232,248,236,0.96))"
      : accent === "sand"
        ? "linear-gradient(180deg, rgba(255,252,247,0.98), rgba(248,244,232,0.96))"
        : "linear-gradient(180deg, rgba(255,250,244,0.98), rgba(248,238,226,0.96))";

  return {
    position: "relative",
    overflow: "hidden",
    minHeight: 380,
    borderRadius: 28,
    padding: 20,
    background: `${gradient}, radial-gradient(circle at top right, rgba(194, 142, 122, 0.12), transparent 35%)`,
    border: "1px solid rgba(180,104,73,0.18)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: 16,
  };
};

const amiclubeSlideBadgeStyle = (accent: AmiclubeCreativeAccent): React.CSSProperties => ({
  padding: "7px 10px",
  borderRadius: 999,
  background:
    accent === "green"
      ? "rgba(21,128,61,0.1)"
      : accent === "sand"
        ? "rgba(180,83,9,0.1)"
        : "rgba(124,45,18,0.1)",
  color:
    accent === "green"
      ? "rgb(22,101,52)"
      : accent === "sand"
        ? "rgb(154,52,18)"
        : "rgba(124,45,18,0.92)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
});

const amiclubeSlideKickerStyle = (accent: AmiclubeCreativeAccent): React.CSSProperties => ({
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color:
    accent === "green"
      ? "rgba(22,101,52,0.78)"
      : accent === "sand"
        ? "rgba(154,52,18,0.78)"
        : "rgba(124,45,18,0.78)",
  fontWeight: 800,
});

const amiclubeSlideTitleStyle = (accent: AmiclubeCreativeAccent): React.CSSProperties => ({
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 34,
  lineHeight: 1.02,
  letterSpacing: "-0.04em",
  color: accent === "green" ? "rgb(19, 78, 53)" : "rgb(37, 21, 14)",
  fontWeight: 800,
});

const amiclubeSlideBodyStyle = (accent: AmiclubeCreativeAccent): React.CSSProperties => ({
  fontSize: 16,
  lineHeight: 1.5,
  color: accent === "green" ? "rgba(19, 78, 53, 0.88)" : "rgba(91, 55, 42, 0.92)",
  fontWeight: 600,
  maxWidth: 420,
});

const amiclubeSlideCalloutStyle = (accent: AmiclubeCreativeAccent): React.CSSProperties => ({
  display: "grid",
  gap: 8,
  maxWidth: 320,
  padding: 14,
  borderRadius: 18,
  background: accent === "green" ? "rgba(21,128,61,0.08)" : "rgba(255,255,255,0.88)",
  border: "1px solid rgba(180,104,73,0.14)",
  color: accent === "green" ? "rgba(19,78,53,0.88)" : "rgba(91,55,42,0.88)",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 700,
});

const amiclubePostCoverStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  minHeight: 380,
  borderRadius: 28,
  padding: 20,
  background:
    "linear-gradient(180deg, rgba(255,250,244,0.98), rgba(248,238,226,0.96)), radial-gradient(circle at top right, rgba(194, 142, 122, 0.12), transparent 35%)",
  border: "1px solid rgba(180,104,73,0.18)",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: 16,
};

const amiclubePostCoverTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const amiclubePostCoverLabelStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(124,45,18,0.1)",
  color: "rgba(124,45,18,0.92)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
};

const amiclubePostCoverBadgeStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(21,128,61,0.1)",
  color: "rgb(22,101,52)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const amiclubePostCoverArtStyle: React.CSSProperties = {
  position: "relative",
  display: "grid",
  alignItems: "center",
  justifyItems: "start",
  padding: "20px 0",
  minHeight: 240,
};

const amiclubePostCoverCircleLargeStyle: React.CSSProperties = {
  position: "absolute",
  right: 14,
  top: 10,
  width: 210,
  height: 210,
  borderRadius: "50%",
  background: "radial-gradient(circle at 30% 30%, rgba(194, 65, 12, 0.42), rgba(180,83,9,0.12) 48%, rgba(255,255,255,0) 70%)",
  filter: "blur(2px)",
};

const amiclubePostCoverCircleSmallStyle: React.CSSProperties = {
  position: "absolute",
  right: 90,
  top: 140,
  width: 110,
  height: 110,
  borderRadius: "50%",
  background: "radial-gradient(circle at 40% 40%, rgba(21,128,61,0.42), rgba(21,128,61,0.08) 55%, rgba(255,255,255,0) 78%)",
};

const amiclubePostCoverCardStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: 430,
  display: "grid",
  gap: 12,
  padding: 20,
  borderRadius: 24,
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(180,104,73,0.18)",
  boxShadow: "0 16px 28px rgba(124, 45, 18, 0.08)",
};

const amiclubePostCoverCardLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  color: "rgba(154,52,18,0.78)",
  fontWeight: 800,
};

const amiclubePostCoverCardTitleStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 34,
  lineHeight: 1.02,
  letterSpacing: "-0.04em",
  color: "rgb(37, 21, 14)",
  fontWeight: 800,
};

const amiclubePostCoverCardSupportStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.45,
  color: "rgba(91, 55, 42, 0.92)",
  fontWeight: 600,
};

const amiclubePostCoverFooterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "rgba(91, 55, 42, 0.76)",
  fontSize: 12,
  fontWeight: 700,
};

const amiclubePostStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const amiclubePostStackItemStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 12,
  alignItems: "start",
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(180,104,73,0.16)",
};

const amiclubePostStackIndexStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "rgba(124,45,18,0.1)",
  color: "rgba(124,45,18,0.92)",
  fontSize: 11,
  fontWeight: 800,
};

const amiclubePostStackTextStyle: React.CSSProperties = {
  color: "rgba(41, 20, 11, 0.94)",
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 700,
};

const amiclubePostFooterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  flexWrap: "wrap",
  paddingTop: 2,
};

const amiclubePostFooterAccentStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(124,45,18,0.12)",
  color: "rgba(124,45,18,0.96)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
};

const amiclubePostFooterTextStyle: React.CSSProperties = {
  color: "rgba(91, 55, 42, 0.88)",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 600,
};

const clientFocusCardStyle: React.CSSProperties = {
  padding: 24,
  display: "grid",
  gap: 18,
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,249,255,0.95) 100%)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
};

const clientFocusHeadlineStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-secondary)",
  fontSize: 13,
  lineHeight: 1.55,
};

const clientFocusSummaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const clientFocusSummaryCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  minHeight: 118,
  padding: 16,
  borderRadius: 18,
  background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.95))",
  border: "1px solid rgba(148,163,184,0.18)",
};

const clientFocusSummaryLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(100,116,139,0.82)",
};

const clientFocusSummaryValueStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  color: "var(--text-primary)",
  fontWeight: 700,
};

const clientFocusSummaryHintStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "var(--text-secondary)",
  marginTop: "auto",
};

const clientFocusPanelStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 22,
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const clientFocusPanelTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 15,
  lineHeight: 1.5,
  color: "var(--text-primary)",
  fontWeight: 800,
};

const clientFocusPanelSubtitleStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.45,
};

const clientFocusMetaPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(248,250,252,0.98)",
  color: "rgba(51,65,85,0.9)",
  fontSize: 12,
  fontWeight: 600,
};

const clientFocusNetworkCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(148,163,184,0.16)",
  display: "grid",
  gap: 14,
};

const clientFocusNetworkPlatformStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "rgba(100,116,139,0.82)",
};

const clientFocusNetworkHandleStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontWeight: 800,
};

const clientFocusNetworkUrlStyle: React.CSSProperties = {
  color: "rgb(8,145,178)",
  fontSize: 12,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
};

const clientFocusStatusPillStyle = (status: string): React.CSSProperties => {
  const normalized = status.trim().toLowerCase();

  const background =
    normalized === "captured"
      ? "rgba(0, 212, 255, 0.12)"
      : normalized === "partial"
        ? "rgba(245, 158, 11, 0.16)"
        : "rgba(148, 163, 184, 0.14)";
  const color =
    normalized === "captured"
      ? "rgb(8, 145, 178)"
      : normalized === "partial"
        ? "rgb(180, 83, 9)"
        : "rgb(71, 85, 105)";

  return {
    padding: "6px 10px",
    borderRadius: 999,
    background,
    color,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.02,
    whiteSpace: "nowrap",
  };
};

const clientFocusConfidenceStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  fontWeight: 600,
};

const clientFocusMetricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const clientFocusMetricCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 16,
  background: "rgba(248,250,252,0.96)",
  border: "1px solid rgba(148,163,184,0.16)",
  display: "grid",
  gap: 6,
};

const clientFocusMetricLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "rgba(100,116,139,0.82)",
};

const clientFocusMetricValueStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.45,
  color: "var(--text-primary)",
  fontWeight: 800,
};

const clientFocusSectionFooterStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.45,
};

const clientFocusCampaignGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 12,
};

const clientFocusCampaignColumnStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const clientFocusCampaignColumnTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "0.02em",
};

const clientFocusCampaignColumnHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
};

const clientFocusCampaignListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const clientFocusCampaignItemStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 14,
  borderRadius: 16,
  background: "rgba(248,250,252,0.98)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const clientFocusCampaignItemTitleStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.4,
  color: "var(--text-primary)",
  fontWeight: 800,
};

const clientFocusCampaignItemSubtitleStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "var(--text-secondary)",
};

const clientFocusCampaignStatusPillStyle = (accent: "success" | "warning" | "neutral"): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  background:
    accent === "success"
      ? "rgba(16, 185, 129, 0.14)"
      : accent === "warning"
        ? "rgba(245, 158, 11, 0.16)"
        : "rgba(148, 163, 184, 0.14)",
  color:
    accent === "success"
      ? "rgb(5, 150, 105)"
      : accent === "warning"
        ? "rgb(180, 83, 9)"
        : "rgb(71, 85, 105)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.02,
  whiteSpace: "nowrap",
});

const clientFocusCampaignItemMetaStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--text-primary)",
};

const clientFocusCampaignItemWorkflowStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(71, 85, 105, 0.88)",
  fontWeight: 700,
};

const clientFocusCampaignItemNoteStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "var(--text-secondary)",
};

const clientFocusBadgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(0, 212, 255, 0.12)",
  color: "rgb(8,145,178)",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
  border: "1px solid rgba(0, 212, 255, 0.18)",
};

const clientFocusMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const campaignSamplePanelStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 4,
  padding: 18,
  borderRadius: 22,
  background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
};

const campaignSampleHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const campaignSampleTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 15,
  lineHeight: 1.5,
  color: "rgba(244,247,255,0.96)",
  fontWeight: 700,
};

const campaignSampleSubtitleStyle: React.CSSProperties = {
  marginTop: 4,
  color: "rgba(182,193,224,0.86)",
  fontSize: 12,
  lineHeight: 1.45,
};

const campaignSampleMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "flex-end",
};

const campaignSampleFocusGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 14,
};

const campaignSampleFocusCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const campaignSampleFocusHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const campaignSampleFocusTextWrapStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const campaignSampleFocusLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(0, 212, 255, 0.9)",
};

const campaignSampleFocusTitleStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.45,
  color: "rgba(244,247,255,0.98)",
  fontWeight: 800,
};

const campaignSampleFocusSubtitleStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(182,193,224,0.84)",
};

const campaignSampleFocusBodyStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  paddingTop: 10,
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const campaignSampleFocusBodyLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(182,193,224,0.72)",
};

const campaignSampleFocusBodyValueStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(244,247,255,0.94)",
};

const campaignSamplePreviewCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 20,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.08), transparent 45%), rgba(255,255,255,0.04)",
  border: "1px solid rgba(0, 212, 255, 0.14)",
};

const campaignSamplePreviewHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const campaignSamplePreviewTextWrapStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

const campaignSamplePreviewLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(0, 212, 255, 0.9)",
};

const campaignSamplePreviewTitleStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.45,
  color: "rgba(244,247,255,0.98)",
  fontWeight: 800,
};

const campaignSamplePreviewSubtitleStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(182,193,224,0.84)",
};

const campaignSamplePreviewMediaStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  borderRadius: 16,
  objectFit: "cover",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const campaignSamplePreviewMetaStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const campaignSampleGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 12,
};

const campaignSampleColumnStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const campaignSampleColumnHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const campaignSampleColumnTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "rgba(244,247,255,0.96)",
  letterSpacing: "0.02em",
};

const campaignSampleColumnHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(182,193,224,0.82)",
};

const campaignSampleListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const campaignSampleItemStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const campaignSampleItemTopStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const campaignSampleItemIdentityStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 3,
};

const campaignSampleItemTitleStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.4,
  color: "rgba(244,247,255,0.98)",
  fontWeight: 700,
};

const campaignSampleItemSubtitleStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(182,193,224,0.86)",
};

const campaignSampleStatusPillStyle = (accent: "success" | "warning" | "neutral"): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  background:
    accent === "success"
      ? "rgba(16, 185, 129, 0.14)"
      : accent === "warning"
        ? "rgba(245, 158, 11, 0.14)"
        : "rgba(148, 163, 184, 0.14)",
  color:
    accent === "success"
      ? "rgb(110, 231, 183)"
      : accent === "warning"
        ? "rgb(251, 191, 36)"
        : "rgb(203, 213, 225)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.02,
  whiteSpace: "nowrap",
});

const campaignSampleItemMetaStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(236,242,255,0.9)",
};

const campaignSampleItemNoteStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "rgba(182,193,224,0.86)",
};

const marketPresenceCardStyle: React.CSSProperties = {
  ...feedCardStyle,
  display: "grid",
  gap: 16,
};

const marketPresenceGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const marketPresenceStatStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 6,
};

const marketPresenceStatLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const marketPresenceStatValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontWeight: 700,
  lineHeight: 1.35,
};

const marketPresenceStatHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 13,
  lineHeight: 1.45,
};

const marketPresenceActionRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const marketPresenceMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const marketPresenceMetaPillStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  color: "var(--text-secondary)",
  fontSize: 12,
  fontWeight: 600,
};

const marketPresenceMessageStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 16,
  background: "rgba(0, 212, 255, 0.08)",
  color: "var(--text-primary)",
  border: "1px solid rgba(0, 212, 255, 0.14)",
  lineHeight: 1.45,
};

const renderedAssetTableStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 10,
};

const renderedAssetTableHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "88px 120px minmax(220px, 1.2fr) auto",
  gap: 12,
  padding: "0 10px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(92,58,44,0.72)",
};

const renderedAssetTableRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "88px 120px minmax(220px, 1.2fr) auto",
  gap: 12,
  alignItems: "center",
  padding: 10,
  borderRadius: 16,
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(180,104,73,0.12)",
};

const renderedAssetTableCellStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 2,
};

const renderedAssetTableSubtleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(92,58,44,0.72)",
};

const efficiencyCardStyle: React.CSSProperties = {
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.06), transparent 42%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  color: "var(--text-primary)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const efficiencyEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--accent-cyan)",
  marginBottom: 4,
};

const efficiencyValueStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 44,
  fontWeight: 700,
  lineHeight: 0.95,
  color: "var(--text-primary)",
};

const efficiencyStatsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: 16,
  alignItems: "end",
  marginTop: 22,
};

const efficiencyMetaLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
};

const efficiencyMetaValueStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text-primary)",
};

const efficiencyTrendStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  justifySelf: "end",
  color: "var(--accent-cyan)",
  fontWeight: 700,
};

const efficiencyTrendIconStyle: React.CSSProperties = {
  fontSize: 18,
};

const feedListStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const feedRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: 14,
  alignItems: "start",
  padding: 14,
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const feedIconWrapStyle = (accent?: FeedItem["accent"]): React.CSSProperties => ({
  width: 44,
  height: 44,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background:
    accent === "warning"
      ? "rgba(245, 158, 11, 0.14)"
      : accent === "success"
        ? "rgba(0, 212, 255, 0.08)"
        : "rgba(255,255,255,0.06)",
});

const feedIconStyle: React.CSSProperties = {
  fontSize: 20,
  color: "var(--accent-cyan)",
};

const feedTextStyle: React.CSSProperties = {
  minWidth: 0,
};

const feedLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--text-primary)",
};

const feedDescriptionStyle: React.CSSProperties = {
  marginTop: 3,
  color: "var(--text-secondary)",
  lineHeight: 1.45,
};

const feedMiniSummaryStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.03)",
  color: "var(--text-primary)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 8,
};

const feedMiniLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const feedMiniValueStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, Manrope, sans-serif",
  fontSize: 22,
  fontWeight: 700,
};

const feedMiniHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
};

const signalGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const signalChipStyle = (strong?: boolean): React.CSSProperties => ({
  padding: "14px 16px",
  borderRadius: 18,
  background: strong ? "rgba(0, 212, 255, 0.08)" : "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 3,
});

const signalLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const signalValueStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--text-primary)",
};

const assistFabStyle: React.CSSProperties = {
  position: "fixed",
  right: 28,
  bottom: 28,
  zIndex: 50,
  width: 68,
  height: 68,
  border: "none",
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.98), rgba(0, 156, 255, 0.98))",
  color: "#041018",
  boxShadow: "0 24px 48px rgba(0, 212, 255, 0.22)",
  cursor: "pointer",
  overflow: "visible",
};

const assistFabIconStyle: React.CSSProperties = {
  fontSize: 32,
  position: "relative",
  zIndex: 2,
};

const assistFabBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  width: 10,
  height: 10,
  borderRadius: 999,
  border: "2px solid #ffffff",
  background: "var(--accent-green)",
};

const assistFabTooltipStyle: React.CSSProperties = {
  position: "absolute",
  right: 82,
  top: "50%",
  transform: "translateY(-50%)",
  minWidth: 220,
  padding: "12px 14px",
  borderRadius: 16,
  background: "rgba(10, 12, 18, 0.96)",
  color: "var(--text-primary)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 44px rgba(0, 0, 0, 0.22)",
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.18s ease, transform 0.18s ease",
};

const assistFabTooltipTitleStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
};

const assistFabTooltipTextStyle: React.CSSProperties = {
  display: "block",
  marginTop: 2,
  fontSize: 12,
  color: "var(--text-secondary)",
};
