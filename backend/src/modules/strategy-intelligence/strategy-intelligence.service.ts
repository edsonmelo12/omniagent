import { createError } from "../../shared/http/errors.js";
import { findClientById, type ClientRow } from "../clients/clients.repository.js";
import { findProductById, listProductsByClientId, type ProductRow } from "../client-products/client-products.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import {
  createStrategyIntelligenceVersion,
  findLatestStrategyIntelligenceVersionByClientId,
  findStrategyIntelligenceAssetById,
  listAllStrategyIntelligenceAssets,
  listStrategyIntelligenceAssetsByClientId,
  listLatestStrategyIntelligenceAssetsByClientId,
  listStrategyLibraryStrategies,
  syncStrategyLibraryFromAssets,
  type StrategyLibraryRow,
  type StrategyIntelligenceRow,
} from "./strategy-intelligence.repository.js";
import { findYoutubeStrategyAnalysisById, type YoutubeStrategyAnalysisRow } from "../youtube-strategy/youtube-strategy.repository.js";

type YoutubeStrategyPayloadLike = {
  title?: string;
  context?: {
    note?: string | null;
    confidence?: number;
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
  overview?: {
    executiveSummary?: string;
    thesis?: string;
    analysisStatus?: "complete" | "partial" | "failed" | string;
    confidence?: number;
  };
  videos?: Array<{
    originalUrl?: string;
    canonicalUrl?: string;
    title?: string | null;
    channelName?: string | null;
    channelUrl?: string | null;
    thumbnailUrl?: string | null;
    transcript?: {
      status?: string;
      language?: string | null;
      segmentCount?: number;
      characterCount?: number;
      reason?: string | null;
    };
  }>;
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
  raw?: {
    notes?: string | null;
  };
};

type StrategySlot = "primary" | "alternative" | "plan_b" | "library";
type StrategyTheme = "authority" | "education" | "conversion" | "scale" | "fallback";

type StrategyRecommendationItem = {
  id: string;
  strategyKey: string;
  kind: StrategySlot;
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
  fitBand: OrganicStrategyFitBand;
  sourceCount: number;
};

type StrategyRecommendation = {
  primary: StrategyRecommendationItem | null;
  alternatives: StrategyRecommendationItem[];
  contingency: StrategyRecommendationItem | null;
  planB: StrategyRecommendationItem | null;
  strategyOptions: StrategyRecommendationItem[];
  actionPlan: CampaignActionPlan;
};

type StrategyEvidenceItem = {
  id: string;
  clientId: string;
  sourceAnalysisId: string | null;
  sourceVersion: number;
  kind: StrategySlot;
  strategyKey: string;
  strategyName: string;
  strategySummary: string;
  sourceTitle: string | null;
  sourceVideoId: string | null;
  sourceOriginalUrl: string | null;
  sourceCanonicalUrl: string | null;
  sourceChannelName: string | null;
  sourceChannelUrl: string | null;
  sourceThumbnailUrl: string | null;
  sourceUrls: string[];
  evidence: string[];
  fitSignals: string[];
};

type OrganicStrategyFitBand = "recommended" | "secondary" | "not_recommended";

type CampaignStage = "awareness" | "consideration" | "decision" | "retention" | "scale";

type CampaignActionFormat = {
  format: string;
  frequency: string;
  purpose: string;
};

type CampaignActionPlan = {
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

type CampaignAgendaItem = {
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

type CampaignAgendaVariant = {
  label: "A" | "B";
  angle: string;
  hook: string;
  copy: string;
  finalCta: string;
};

type CampaignAgendaItemDraft = Omit<CampaignAgendaItem, "variants">;

type CampaignActionPlanTemplate = Omit<CampaignActionPlan, "focus" | "stage" | "summary" | "weeklyAgenda"> & {
  weeklyAgenda: CampaignAgendaItemDraft[];
};

type OrganicStrategyOption = {
  id: string;
  strategyName: string;
  strategySummary: string;
  fitScore: number;
  confidence: number;
  reason: string;
  fitSignals: string[];
  recommendedFormats: string[];
  campaignObjective: string | null;
  funnelStage: string;
  fitBand: OrganicStrategyFitBand;
};

type OrganicStrategyRecommendation = {
  primary: OrganicStrategyOption | null;
  secondary: OrganicStrategyOption[];
  notRecommended: OrganicStrategyOption[];
  strategyOptions: OrganicStrategyOption[];
};

const CAMPAIGN_VARIANT_GUIDANCE: Record<
  CampaignStage,
  {
    angleA: string;
    angleB: string;
    hookB: string;
    copyB: string;
    finalCtaB: string;
  }
> = {
  awareness: {
    angleA: "Gancho de dor",
    angleB: "Gancho de clareza",
    hookB: "abra com uma pergunta curta ou dado simples que deixe o problema óbvio",
    copyB: "mostre um exemplo prático e feche com um convite para salvar.",
    finalCtaB: "salvar e seguir",
  },
  consideration: {
    angleA: "Gancho de autoridade",
    angleB: "Gancho de prova",
    hookB: "mostre o erro comum antes de apresentar o mecanismo",
    copyB: "traga prova, bastidor ou comparação antes do CTA.",
    finalCtaB: "responder no direct",
  },
  decision: {
    angleA: "Gancho de objeção",
    angleB: "Gancho de urgência",
    hookB: "nomeie a dúvida principal e responda sem rodeios",
    copyB: "deixe a oferta e o próximo passo explícitos.",
    finalCtaB: "agendar conversa",
  },
  retention: {
    angleA: "Gancho de relacionamento",
    angleB: "Gancho de comunidade",
    hookB: "abra com um aprendizado útil que a audiência possa repetir",
    copyB: "conecte o conteúdo a um convite de participação.",
    finalCtaB: "comentar e participar",
  },
  scale: {
    angleA: "Gancho de processo",
    angleB: "Gancho de benchmark",
    hookB: "abra com o playbook, processo ou comparação que vale copiar",
    copyB: "mostre como isso vira padrão e compartilhe o playbook.",
    finalCtaB: "compartilhar o playbook",
  },
};

const buildAgendaVariants = (input: {
  stage: CampaignStage;
  title: string;
  hook: string;
  copy: string;
  finalCta: string;
}): CampaignAgendaVariant[] => {
  const guidance = CAMPAIGN_VARIANT_GUIDANCE[input.stage];
  const capitalizeFirst = (value: string) => {
    const trimmed = value.trim();

    return trimmed.length > 0 ? `${trimmed[0]?.toUpperCase() ?? ""}${trimmed.slice(1)}` : trimmed;
  };

  return [
    {
      label: "A",
      angle: guidance.angleA,
      hook: input.hook,
      copy: input.copy,
      finalCta: input.finalCta,
    },
    {
      label: "B",
      angle: guidance.angleB,
      hook: capitalizeFirst(guidance.hookB),
      copy: `${input.copy} ${capitalizeFirst(guidance.copyB)}`,
      finalCta: guidance.finalCtaB,
    },
  ];
};

type OrganicStrategyInput = {
  campaignObjective?: string | null;
  productContext?: string | null;
  serviceContext?: string | null;
  audienceContext?: string | null;
  clientSegment?: string | null;
  funnelStage?: string | null;
  sourceSignals?: string[];
  activeProduct: ProductRow | null;
};

type OrganicStrategyCatalogItem = {
  id: string;
  strategyName: string;
  strategySummary: string;
  objectiveTags: string[];
  productFitTags: string[];
  recommendedFormats: string[];
  fitSignals: string[];
  avoidWhen: string[];
  baseScore: number;
  confidence: number;
  funnelStage: string;
};

const ORGANIC_STRATEGY_CATALOG: OrganicStrategyCatalogItem[] = [
  {
    id: "authority_proof",
    strategyName: "Autoridade para gerar prova",
    strategySummary: "Posiciona o cliente como referência antes de pedir conversao, usando contexto, tese e resultado.",
    objectiveTags: ["autoridade", "credibilidade", "posicionamento", "prova", "case"],
    productFitTags: ["consultive", "high_ticket", "b2b", "service_business"],
    recommendedFormats: ["carrossel", "reel", "podcast clip", "linkedin"],
    fitSignals: ["autoridade", "prova", "credibilidade", "case", "posicionamento"],
    avoidWhen: ["a oferta ainda não está clara", "não há sinais mínimos de prova"],
    baseScore: 66,
    confidence: 88,
    funnelStage: "consideration",
  },
  {
    id: "education_mechanism",
    strategyName: "Educação para clarificar o mecanismo",
    strategySummary: "Explica o raciocínio e simplifica a decisão com ensino prático, passo a passo e linguagem acessível.",
    objectiveTags: ["educacao", "educação", "awareness", "clareza", "mecanismo", "ensinar", "explicar"],
    productFitTags: ["educational", "productized", "saas", "b2b"],
    recommendedFormats: ["carrossel", "youtube", "newsletter", "post"],
    fitSignals: ["ensina", "explica", "framework", "passo a passo", "didático"],
    avoidWhen: ["a campanha precisa fechar rápido", "a oferta depende de urgência"],
    baseScore: 64,
    confidence: 87,
    funnelStage: "awareness",
  },
  {
    id: "conversion_value",
    strategyName: "Conversão para demonstrar valor",
    strategySummary: "Conduz o público para uma ação clara, mostrando oferta, benefício e próximo passo sem dispersão.",
    objectiveTags: ["conversao", "conversão", "lead", "venda", "cta", "agendamento", "demo", "checkout"],
    productFitTags: ["consultive", "productized", "saas", "service_business", "local_business", "ecommerce"],
    recommendedFormats: ["stories", "reel", "post", "landing teaser"],
    fitSignals: ["cta", "lead", "agendamento", "demo", "venda", "checkout"],
    avoidWhen: ["o cliente ainda não tem clareza do que vende"],
    baseScore: 68,
    confidence: 90,
    funnelStage: "conversion",
  },
  {
    id: "proof_reduction",
    strategyName: "Prova social para reduzir fricção",
    strategySummary: "Usa casos, depoimentos e evidências para diminuir risco percebido e acelerar confiança.",
    objectiveTags: ["prova", "prova social", "resultado", "depoimento", "confiança", "case"],
    productFitTags: ["educational", "consultive", "service_business", "local_business", "ecommerce", "info_product"],
    recommendedFormats: ["carrossel", "story", "reel", "post"],
    fitSignals: ["resultado", "depoimento", "case", "antes e depois", "evidência"],
    avoidWhen: ["não existem cases ou provas suficientes ainda"],
    baseScore: 65,
    confidence: 86,
    funnelStage: "consideration",
  },
  {
    id: "objection_breaker",
    strategyName: "Quebra de objeção para acelerar decisão",
    strategySummary: "Antecipates custo, tempo, medo e ceticismo para remover trava cognitiva antes da oferta.",
    objectiveTags: ["objeção", "objeções", "medo", "risco", "segurança", "dúvida", "duvida"],
    productFitTags: ["consultive", "high_ticket", "b2b", "service_business", "saas", "info_product"],
    recommendedFormats: ["carrossel", "live", "reel", "stories"],
    fitSignals: ["objeção", "medo", "risco", "custo", "tempo", "segurança"],
    avoidWhen: ["o público ainda não reconhece o problema"],
    baseScore: 60,
    confidence: 82,
    funnelStage: "consideration",
  },
  {
    id: "community_rhythm",
    strategyName: "Comunidade para gerar recorrência",
    strategySummary: "Aposta em pertencimento, rituais e relação para aumentar retenção e engajamento sustentável.",
    objectiveTags: ["comunidade", "engajamento", "retencao", "retenção", "recorrencia", "recorrência"],
    productFitTags: ["creator_business", "educational", "info_product", "local_business"],
    recommendedFormats: ["stories", "lives", "newsletter", "reel"],
    fitSignals: ["comunidade", "pertencimento", "ritual", "engajamento", "recorrência"],
    avoidWhen: ["o objetivo é conversão imediata", "a marca ainda não tem base mínima"],
    baseScore: 56,
    confidence: 79,
    funnelStage: "retention",
  },
  {
    id: "scale_system",
    strategyName: "Escala para sistematizar execução",
    strategySummary: "Organiza processo, cadência e automação para ganhar consistência sem depender de esforço manual permanente.",
    objectiveTags: ["escala", "processo", "automacao", "automação", "sistema", "eficiencia", "eficiência"],
    productFitTags: ["saas", "productized", "b2b", "creator_business"],
    recommendedFormats: ["carrossel", "linkedin", "youtube", "post"],
    fitSignals: ["processo", "sistema", "automação", "cadência", "eficiência"],
    avoidWhen: ["não existe operação básica estruturada"],
    baseScore: 58,
    confidence: 80,
    funnelStage: "scale",
  },
  {
    id: "trend_amplification",
    strategyName: "Tendência para ampliar alcance",
    strategySummary: "Usa formato, timing e adaptação de pauta para ganhar distribuição sem perder a leitura do negócio.",
    objectiveTags: ["alcance", "topo", "viral", "tendencia", "tendência"],
    productFitTags: ["creator_business", "ecommerce", "local_business"],
    recommendedFormats: ["reel", "shorts", "story", "trend post"],
    fitSignals: ["alcance", "viral", "tendência", "topo", "distribuição"],
    avoidWhen: ["a marca precisa construir credibilidade primeiro"],
    baseScore: 35,
    confidence: 74,
    funnelStage: "awareness",
  },
];

type StrategyIntelligenceResponse = {
  client: ClientRow;
  title: string | null;
  assets: StrategyIntelligenceRow[];
  evidence: StrategyEvidenceItem[];
  latestVersion: number;
  recommendation: StrategyRecommendation;
  activeProduct: ProductRow | null;
  source: StrategySourceMetadata | null;
  payload: Record<string, unknown>;
};

const KINDS: Array<Exclude<StrategySlot, "library">> = ["primary", "alternative", "plan_b"];

const compactText = (value: string) => value.replace(/\s+/g, " ").trim();

const toList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => (typeof item === "string" ? compactText(item) : "")).filter(Boolean) : [];

const toNullableString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = compactText(value);
  return trimmed ? trimmed : null;
};

type StrategySourceVideo = {
  videoId: string | null;
  title: string | null;
  originalUrl: string | null;
  canonicalUrl: string | null;
  channelName: string | null;
  channelUrl: string | null;
  thumbnailUrl: string | null;
};

type StrategySourceMetadata = {
  analysisId: string | null;
  analysisVersion: number | null;
  executiveSummary: string | null;
  thesis: string | null;
  confidence: number | null;
  primaryVideo: StrategySourceVideo | null;
  videos: StrategySourceVideo[];
};

const toNullableNumber = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

const buildStrategySourceVideo = (value: unknown): StrategySourceVideo | null => {
  if (!value || typeof value !== "object") return null;

  const video = value as Record<string, unknown>;
  const originalUrl = toNullableString(video.originalUrl);
  const canonicalUrl = toNullableString(video.canonicalUrl);
  const title = toNullableString(video.title);
  const channelName = toNullableString(video.channelName);
  const channelUrl = toNullableString(video.channelUrl);
  const thumbnailUrl = toNullableString(video.thumbnailUrl);
  const videoId = toNullableString(video.videoId) ?? getStrategySourceVideoIdFromUrl(canonicalUrl ?? originalUrl ?? "");

  return {
    videoId,
    title,
    originalUrl,
    canonicalUrl,
    channelName,
    channelUrl,
    thumbnailUrl,
  };
};

const buildStrategySourceMetadata = (value: unknown): StrategySourceMetadata | null => {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const videos = Array.isArray(source.videos)
    ? source.videos.map((item) => buildStrategySourceVideo(item)).filter(Boolean) as StrategySourceVideo[]
    : [];
  const primaryVideo = buildStrategySourceVideo(source.primaryVideo) ?? videos[0] ?? null;

  return {
    analysisId: toNullableString(source.analysisId),
    analysisVersion: toNullableNumber(source.analysisVersion),
    executiveSummary: toNullableString(source.executiveSummary),
    thesis: toNullableString(source.thesis),
    confidence: toNullableNumber(source.confidence),
    primaryVideo,
    videos: videos.length > 0 ? videos : primaryVideo ? [primaryVideo] : [],
  };
};

const getStrategySourceVideoIdFromUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host.endsWith("youtube.com")) {
      const searchId = url.searchParams.get("v");
      if (searchId) return searchId;

      const pathParts = url.pathname.split("/").filter(Boolean);
      const shortsIndex = pathParts.indexOf("shorts");
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
        return pathParts[shortsIndex + 1];
      }

      const embedIndex = pathParts.indexOf("embed");
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
        return pathParts[embedIndex + 1];
      }
    }
  } catch {
    const directMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,})/i);
    if (directMatch?.[1]) return directMatch[1];
  }

  return null;
};

const buildStrategySourceVideos = (videos: YoutubeStrategyPayloadLike["videos"]): StrategySourceVideo[] => {
  const seen = new Set<string>();

  return (videos ?? []).flatMap((video) => {
    const originalUrl = toNullableString(video.originalUrl);
    const canonicalUrl = toNullableString(video.canonicalUrl);
    const title = toNullableString(video.title);
    const channelName = toNullableString(video.channelName);
    const channelUrl = toNullableString(video.channelUrl);
    const thumbnailUrl = toNullableString(video.thumbnailUrl);
    const videoId = getStrategySourceVideoIdFromUrl(canonicalUrl ?? originalUrl ?? "");
    const dedupeKey = videoId ?? canonicalUrl ?? originalUrl ?? title ?? null;

    if (!dedupeKey || seen.has(dedupeKey)) {
      return [];
    }

    seen.add(dedupeKey);
    return [
      {
        videoId,
        title,
        originalUrl,
        canonicalUrl,
        channelName,
        channelUrl,
        thumbnailUrl,
      },
    ];
  });
};

const splitTokens = (value: string) =>
  compactText(value)
    .toLowerCase()
    .split(/[^a-z0-9áàâãéèêíìîóòôõúùûç]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const collectText = (values: Array<string | null | undefined>) => values.filter(Boolean).join(" ");

const countTextOverlap = (left: string, right: string) => {
  const leftTokens = new Set(splitTokens(left));
  const rightTokens = new Set(splitTokens(right));
  let overlap = 0;

  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  });

  return overlap;
};

const inferStrategyAngles = (strategy: { name: string; summary: string; objective: string | null; evidence: string[] }) => {
  const context = collectText([strategy.name, strategy.summary, strategy.objective ?? "", ...strategy.evidence]).toLowerCase();
  const angles = new Set<string>();

  if (/autoridade|posicionamento|prova|credibilidade|case/.test(context)) angles.add("authority");
  if (/educa|ensina|explica|didatico|aula|framework/.test(context)) angles.add("education");
  if (/convers|lead|captura|funil|cta|conversao/.test(context)) angles.add("conversion");
  if (/risco|seguranca|fallback|conservador|valid/.test(context)) angles.add("risk");
  if (/escala|volume|processo|sistema|automat/.test(context)) angles.add("scale");

  return angles;
};

const inferOfferProfile = (product: ProductRow | null) => {
  const offerText = collectText([
    product?.name,
    product?.category,
    product?.offer_type,
    product?.promise,
    product?.problem_solved,
    product?.audience,
  ]).toLowerCase();

  return {
    isConsultative: /consult|mentoria|servi[cç]o|agency|ag[eê]ncia/.test(offerText),
    isEducational: /curso|treinamento|workshop|aula|formacao|formação|ebook/.test(offerText),
    isProductized: /software|saas|app|plataforma|produto/.test(offerText),
    isHighTicket: /premium|executivo|enterprise|alta|ticket alto/.test(offerText),
    hasPerformanceNeed: /lead|convers|venda|mql|pipeline|roi|cac/.test(offerText),
  };
};

export const STRATEGY_THEME_LABELS: Record<StrategyTheme, string> = {
  authority: "Autoridade para gerar prova",
  education: "Educação para clarificar o mecanismo",
  conversion: "Conversão para demonstrar valor",
  scale: "Escala para sistematizar execução",
  fallback: "Estratégia de contingência",
};

export const buildFallbackStrategyName = (kind: StrategySlot) => {
  if (kind === "primary") {
    return "Objetivo principal para gerar prova";
  }

  if (kind === "alternative") {
    return "Variação alternativa para clarificar o mecanismo";
  }

  return "Estratégia de contingência para reduzir risco";
};

export const buildFallbackStrategySummary = (kind: StrategySlot) => {
  if (kind === "primary") {
    return "Leitura principal extraída da transcrição.";
  }

  if (kind === "alternative") {
    return "Variação alternativa extraída da transcrição.";
  }

  return "Estratégia de contingência para reduzir risco e preservar coerência.";
};

const inferStrategyTheme = (
  kind: StrategySlot,
  strategy: { name: string; summary: string; objective: string | null; evidence: string[] },
  product: ProductRow | null,
): StrategyTheme => {
  if (kind === "plan_b") {
    return "fallback";
  }

  const context = collectText([strategy.name, strategy.summary, strategy.objective ?? "", ...strategy.evidence]).toLowerCase();
  const offerProfile = inferOfferProfile(product);
  const hasAuthority = /autoridade|posicionamento|prova|credibilidade|case/.test(context);
  const hasEducation = /educa|ensina|explica|didatico|aula|framework/.test(context);
  const hasConversion = /convers|lead|captura|funil|cta|conversao/.test(context);
  const hasScale = /escala|volume|processo|sistema|automat/.test(context);

  if ((offerProfile.isConsultative || offerProfile.isHighTicket) && hasAuthority) {
    return "authority";
  }

  if (offerProfile.isEducational || hasEducation) {
    return "education";
  }

  if (offerProfile.isProductized || offerProfile.hasPerformanceNeed || hasConversion) {
    return hasScale ? "scale" : "conversion";
  }

  if (hasScale) {
    return "scale";
  }

  if (hasAuthority) {
    return "authority";
  }

  if (hasEducation) {
    return "education";
  }

  return offerProfile.isConsultative ? "authority" : "conversion";
};

const scoreProductFit = (
  strategy: { name: string; summary: string; objective: string | null; funnelStage: string | null; evidence: string[] },
  product: ProductRow | null,
) => {
  if (!product) {
    return { score: 0, signals: ["sem produto selecionado"] };
  }

  const productText = collectText([
    product.name,
    product.category,
    product.offer_type,
    product.promise,
    product.problem_solved,
    product.audience,
    product.notes,
  ]).toLowerCase();
  const strategyText = collectText([strategy.name, strategy.summary, strategy.objective ?? "", ...strategy.evidence]).toLowerCase();
  const signals: string[] = [];

  let score = 0;
  const overlap = countTextOverlap(productText, strategyText);
  score += Math.min(32, overlap * 6);
  if (overlap > 0) {
    signals.push(`match textual com ${overlap} sinais do produto`);
  }

  const strategyAngles = inferStrategyAngles(strategy);
  const offerProfile = inferOfferProfile(product);

  if (offerProfile.isConsultative && strategyAngles.has("authority")) {
    score += 16;
    signals.push("bom encaixe para oferta consultiva");
  }

  if (offerProfile.isEducational && strategyAngles.has("education")) {
    score += 14;
    signals.push("boa aderencia a oferta educacional");
  }

  if (offerProfile.isProductized && (strategyAngles.has("scale") || strategyAngles.has("conversion"))) {
    score += 14;
    signals.push("compatível com oferta produto/saaS");
  }

  if (offerProfile.hasPerformanceNeed && strategyAngles.has("conversion")) {
    score += 10;
    signals.push("conversa com objetivo de performance");
  }

  if (offerProfile.isHighTicket && strategyAngles.has("authority")) {
    score += 8;
    signals.push("apoia ticket alto com autoridade");
  }

  if (product.is_active) {
    score += 8;
    signals.push("produto ativo");
  }

  if (product.status === "prioritized" || product.status === "in_campaign") {
    score += 10;
    signals.push("produto prioritário");
  } else if (product.status === "validated") {
    score += 5;
    signals.push("produto validado");
  }

  if (product.priority > 0) {
    score += Math.min(8, Math.round(product.priority / 12));
    signals.push(`prioridade ${product.priority}`);
  }

  if (strategy.funnelStage === "consideration" && offerProfile.isConsultative) {
    score += 6;
    signals.push("funnel de consideracao compatível");
  }

  if (strategy.funnelStage === "validation" && (offerProfile.isEducational || offerProfile.isProductized)) {
    score += 5;
    signals.push("fase de validacao compatível");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    signals,
  };
};

export const buildStrategySummary = (kind: StrategySlot, payload: YoutubeStrategyPayloadLike, index: number) => {
  const commonStrategies = payload.synthesis?.commonStrategies ?? [];
  const commonMechanisms = payload.synthesis?.commonMechanisms ?? [];
  const commonTactics = payload.synthesis?.commonTactics ?? [];
  const nextTests = payload.synthesis?.nextTests ?? [];
  const overviewThesis = payload.overview?.thesis ?? "Leitura principal extraída da transcrição";
  const summarySource =
    kind === "primary"
      ? commonStrategies[0] ?? overviewThesis ?? buildFallbackStrategySummary(kind)
      : kind === "alternative"
        ? commonStrategies[1] ?? commonMechanisms[0] ?? overviewThesis ?? buildFallbackStrategySummary(kind)
        : nextTests[0] ?? commonMechanisms[1] ?? buildFallbackStrategySummary(kind);

  const strategyName =
    kind === "primary"
      ? commonStrategies[0] ?? buildFallbackStrategyName(kind)
      : kind === "alternative"
        ? commonStrategies[1] ?? buildFallbackStrategyName(kind)
        : buildFallbackStrategyName(kind);

  const evidence = [
    ...(kind === "primary" ? commonMechanisms.slice(0, 2) : []),
    ...(kind === "alternative" ? commonTactics.slice(0, 2) : []),
    ...(kind === "plan_b" ? nextTests.slice(0, 2) : []),
  ];

  const objective =
    kind === "plan_b"
      ? "reduzir risco e preservar coerência"
      : kind === "alternative"
        ? "testar variação com alto potencial"
        : "aplicar o mecanismo mais coerente";

  return {
    strategyName,
    strategySummary: compactText(summarySource),
    evidence: evidence.length > 0 ? evidence : [compactText(overviewThesis)],
    objective,
    funnelStage: kind === "primary" ? "consideration" : kind === "alternative" ? "validation" : "fallback",
    sourceUrls: toList(payload.videos?.map((video) => video.originalUrl).filter(Boolean)),
    confidence: Math.max(35, Math.min(100, Math.round((payload.overview?.confidence ?? payload.context?.confidence ?? 60) - index * 6))),
  };
};

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const buildProductFitTags = (product: ProductRow | null) => {
  const tags = new Set<string>();
  const offerProfile = inferOfferProfile(product);
  const productText = normalizeSearchText(
    collectText([
      product?.name,
      product?.category,
      product?.offer_type,
      product?.promise,
      product?.problem_solved,
      product?.audience,
      product?.notes,
    ]),
  );

  if (offerProfile.isConsultative) tags.add("consultive");
  if (offerProfile.isEducational) tags.add("educational");
  if (offerProfile.isProductized) tags.add("productized");
  if (offerProfile.isHighTicket) tags.add("high_ticket");
  if (offerProfile.hasPerformanceNeed) tags.add("performance");

  if (/b2b|corporativo|gestor|diretor|empresa/.test(productText)) tags.add("b2b");
  if (/local|loja|restaurante|clinica|clínica|presencial|whatsapp/.test(productText)) tags.add("local_business");
  if (/e ?commerce|loja online|checkout|carrinho|frete/.test(productText)) tags.add("ecommerce");
  if (/creator|youtube|reels|shorts|instagram|podcast/.test(productText)) tags.add("creator_business");

  return tags;
};

const buildClientProfileTags = (input: OrganicStrategyInput) => {
  const tags = new Set<string>();
  const clientText = normalizeSearchText(
    collectText([input.clientSegment, input.productContext, input.serviceContext, input.audienceContext]),
  );

  if (/consult|servi[cç]o|agency|ag[eê]ncia|mentoria|consultoria/.test(clientText)) tags.add("consultive");
  if (/curso|treinamento|aula|workshop|formacao|formação|educacao|educação/.test(clientText)) tags.add("educational");
  if (/saas|software|app|plataforma|tech|produto digital/.test(clientText)) tags.add("productized");
  if (/premium|enterprise|executivo|ticket alto|high ticket/.test(clientText)) tags.add("high_ticket");
  if (/lead|venda|funil|pipeline|roi|mql|demanda|convers/.test(clientText)) tags.add("performance");
  if (/b2b|corporativo|empresa|empresarial|indústria|industria/.test(clientText)) tags.add("b2b");
  if (/local|loja|restaurante|clinica|clínica|servi[çc]o local|presencial|bairro/.test(clientText)) tags.add("local_business");
  if (/e-?commerce|ecommerce|varejo|loja online|checkout|carrinho/.test(clientText)) tags.add("ecommerce");
  if (/creator|criador|influencer|influenciador|youtube|instagram|tiktok|podcast/.test(clientText)) tags.add("creator_business");

  return tags;
};

const normalizeFunnelStage = (value?: string | null) => {
  const normalized = normalizeSearchText(String(value ?? ""));

  if (!normalized) return null;
  if (/^awareness$|^topo$|descoberta|alcance|descobrir|reconhecimento/.test(normalized)) return "awareness";
  if (/^consideration$|consideracao|consideração|avaliacao|avaliação|pesquisa|comparacao|comparação/.test(normalized))
    return "consideration";
  if (/^decision$|decisao|decisão|fechamento|compra|conversao|conversão/.test(normalized)) return "decision";
  if (/^retention$|retencao|retenção|recorrencia|recorrência|lifetime/.test(normalized)) return "retention";
  if (/^scale$|escala|expansao|expansão|sistemat|operacao|operação/.test(normalized)) return "scale";

  return null;
};

const buildFunnelStageSignals = (input: OrganicStrategyInput) => {
  const stage = normalizeFunnelStage(input.funnelStage);
  const signals = new Set<string>();

  if (stage === "awareness") signals.add("stage awareness");
  if (stage === "consideration") signals.add("stage consideration");
  if (stage === "decision") signals.add("stage decision");
  if (stage === "retention") signals.add("stage retention");
  if (stage === "scale") signals.add("stage scale");

  return { stage, signals };
};

const buildObjectiveSignals = (text: string) => {
  const normalized = normalizeSearchText(text);
  const signals = new Set<string>();

  if (/autoridade|credibilidade|posicionamento|prova|case/.test(normalized)) signals.add("authority");
  if (/educa|ensina|explica|clareza|mecanismo|awareness|alcance|topo/.test(normalized)) signals.add("education");
  if (/convers|lead|venda|cta|agend|demo|checkout/.test(normalized)) signals.add("conversion");
  if (/prova|resultado|depoimento|evidencia|case/.test(normalized)) signals.add("proof");
  if (/obje|medo|risco|seguran|duvid/.test(normalized)) signals.add("objection");
  if (/comunidade|engaj|recorr|retenc/.test(normalized)) signals.add("community");
  if (/escala|processo|autom|eficien/.test(normalized)) signals.add("scale");
  if (/viral|trend|tendenc|alcance/.test(normalized)) signals.add("trend");

  return signals;
};

const scoreOrganicStrategyOption = (item: OrganicStrategyCatalogItem, input: OrganicStrategyInput) => {
  const objectiveText = collectText([input.campaignObjective, input.productContext, input.serviceContext, input.audienceContext, ...(input.sourceSignals ?? [])]);
  const normalizedObjectiveText = normalizeSearchText(objectiveText);
  const catalogText = normalizeSearchText(
    collectText([item.strategyName, item.strategySummary, ...item.objectiveTags, ...item.productFitTags, ...item.fitSignals, ...item.recommendedFormats]),
  );
  const objectiveSignals = buildObjectiveSignals(objectiveText);
  const funnelStage = buildFunnelStageSignals(input);
  const productFitTags = buildProductFitTags(input.activeProduct);
  const clientProfileTags = buildClientProfileTags(input);
  const fitSignals = new Set<string>();
  let score = item.baseScore;

  const objectiveMatches = item.objectiveTags.filter((tag) => normalizedObjectiveText.includes(normalizeSearchText(tag)));
  if (objectiveMatches.length > 0) {
    score += 28 + Math.min(10, (objectiveMatches.length - 1) * 4);
    objectiveMatches.forEach((tag) => fitSignals.add(`objetivo alinhado: ${tag}`));
  }

  const signalMatches = item.fitSignals.filter((signal) => normalizedObjectiveText.includes(normalizeSearchText(signal)));
  if (signalMatches.length > 0) {
    score += Math.min(12, signalMatches.length * 3);
    signalMatches.forEach((signal) => fitSignals.add(`sinal recorrente: ${signal}`));
  }

  const productMatches = item.productFitTags.filter((tag) => productFitTags.has(tag));
  if (productMatches.length > 0) {
    score += 12 + Math.min(8, productMatches.length * 3);
    productMatches.forEach((tag) => fitSignals.add(`perfil do produto: ${tag}`));
  }

  const overlap = countTextOverlap(normalizedObjectiveText, catalogText);
  if (overlap > 0) {
    score += Math.min(14, overlap * 3);
  }

  if (objectiveSignals.has("authority") && item.id === "authority_proof") {
    score += 10;
    fitSignals.add("objetivo de autoridade/prova");
  }

  if (objectiveSignals.has("education") && item.id === "education_mechanism") {
    score += 10;
    fitSignals.add("objetivo educacional");
  }

  if (objectiveSignals.has("conversion") && item.id === "conversion_value") {
    score += 12;
    fitSignals.add("objetivo de conversão");
  }

  if (objectiveSignals.has("proof") && item.id === "proof_reduction") {
    score += 8;
    fitSignals.add("objetivo de prova");
  }

  if (objectiveSignals.has("objection") && item.id === "objection_breaker") {
    score += 8;
    fitSignals.add("objetivo de objeção");
  }

  if (objectiveSignals.has("community") && item.id === "community_rhythm") {
    score += 8;
    fitSignals.add("objetivo de comunidade");
  }

  if (objectiveSignals.has("scale") && item.id === "scale_system") {
    score += 8;
    fitSignals.add("objetivo de escala");
  }

  if (objectiveSignals.has("trend") && item.id === "trend_amplification") {
    score += 12;
    fitSignals.add("objetivo de alcance");
  }

  if (objectiveSignals.has("trend") && item.id === "conversion_value") {
    score -= 10;
    fitSignals.add("alcance priorizado acima de conversão imediata");
  }

  if (productFitTags.has("consultive") && item.id === "conversion_value") score += 6;
  if (productFitTags.has("consultive") && item.id === "authority_proof") score += 6;
  if (productFitTags.has("educational") && item.id === "education_mechanism") score += 8;
  if (productFitTags.has("educational") && item.id === "proof_reduction") score += 5;
  if (productFitTags.has("productized") && item.id === "scale_system") score += 8;
  if (productFitTags.has("productized") && item.id === "conversion_value") score += 4;
  if (productFitTags.has("high_ticket") && item.id === "authority_proof") score += 8;
  if (productFitTags.has("high_ticket") && item.id === "objection_breaker") score += 6;
  if (productFitTags.has("performance") && item.id === "conversion_value") score += 8;
  if (productFitTags.has("performance") && item.id === "scale_system") score += 5;
  if (productFitTags.has("creator_business") && item.id === "trend_amplification") score += 8;
  if (productFitTags.has("local_business") && item.id === "proof_reduction") score += 6;
  if (productFitTags.has("local_business") && item.id === "conversion_value") score += 5;

  if (clientProfileTags.has("consultive") && item.id === "authority_proof") {
    score += 8;
    fitSignals.add("perfil consultivo do cliente");
  }

  if (clientProfileTags.has("educational") && item.id === "education_mechanism") {
    score += 10;
    fitSignals.add("perfil educacional do cliente");
  }

  if (clientProfileTags.has("productized") && item.id === "scale_system") {
    score += 10;
    fitSignals.add("perfil produto/SaaS do cliente");
  }

  if (clientProfileTags.has("high_ticket") && item.id === "objection_breaker") {
    score += 8;
    fitSignals.add("perfil high-ticket do cliente");
  }

  if (clientProfileTags.has("performance") && item.id === "conversion_value") {
    score += 8;
    fitSignals.add("perfil orientado a performance do cliente");
  }

  if (clientProfileTags.has("b2b") && item.id === "authority_proof") {
    score += 6;
    fitSignals.add("perfil B2B do cliente");
  }

  if (clientProfileTags.has("ecommerce") && item.id === "trend_amplification") {
    score += 8;
    fitSignals.add("perfil e-commerce do cliente");
  }

  if (clientProfileTags.has("ecommerce") && objectiveSignals.has("trend") && item.id === "trend_amplification") {
    score += 14;
    fitSignals.add("e-commerce com foco em alcance");
  }

  if (clientProfileTags.has("ecommerce") && objectiveSignals.has("trend") && item.id === "conversion_value") {
    score -= 6;
    fitSignals.add("e-commerce em fase de descoberta");
  }

  if (clientProfileTags.has("ecommerce") && item.id === "proof_reduction") {
    score += 6;
    fitSignals.add("perfil e-commerce do cliente");
  }

  if (clientProfileTags.has("local_business") && item.id === "conversion_value") {
    score += 8;
    fitSignals.add("perfil local do cliente");
  }

  if (clientProfileTags.has("creator_business") && item.id === "community_rhythm") {
    score += 8;
    fitSignals.add("perfil creator do cliente");
  }

  if (funnelStage.stage === "awareness" && item.id === "education_mechanism") {
    score += 12;
    fitSignals.add("estágio awareness");
  }

  if (funnelStage.stage === "awareness" && item.id === "trend_amplification") {
    score += 10;
    fitSignals.add("estágio awareness");
  }

  if (funnelStage.stage === "awareness" && item.id === "conversion_value") {
    score -= 12;
    fitSignals.add("awareness antes de conversão direta");
  }

  if (funnelStage.stage === "consideration" && item.id === "authority_proof") {
    score += 12;
    fitSignals.add("estágio consideration");
  }

  if (funnelStage.stage === "consideration" && item.id === "proof_reduction") {
    score += 10;
    fitSignals.add("estágio consideration");
  }

  if (funnelStage.stage === "consideration" && item.id === "objection_breaker") {
    score += 8;
    fitSignals.add("estágio consideration");
  }

  if (funnelStage.stage === "decision" && item.id === "conversion_value") {
    score += 16;
    fitSignals.add("estágio decision");
  }

  if (funnelStage.stage === "decision" && item.id === "objection_breaker") {
    score += 10;
    fitSignals.add("estágio decision");
  }

  if (funnelStage.stage === "decision" && item.id === "proof_reduction") {
    score += 8;
    fitSignals.add("estágio decision");
  }

  if (funnelStage.stage === "retention" && item.id === "community_rhythm") {
    score += 14;
    fitSignals.add("estágio retention");
  }

  if (funnelStage.stage === "retention" && item.id === "scale_system") {
    score += 6;
    fitSignals.add("estágio retention");
  }

  if (funnelStage.stage === "scale" && item.id === "scale_system") {
    score += 14;
    fitSignals.add("estágio scale");
  }

  if (funnelStage.stage === "scale" && item.id === "conversion_value") {
    score -= 6;
    fitSignals.add("escala acima de conversão isolada");
  }

  if (input.sourceSignals?.length) {
    const sourceText = normalizeSearchText(input.sourceSignals.join(" "));
    const sourceOverlap = countTextOverlap(sourceText, catalogText);
    if (sourceOverlap > 0) {
      score += Math.min(12, sourceOverlap * 3);
      fitSignals.add("sinais recorrentes da fonte");
    }
  }

  const avoidPenalty = item.avoidWhen.some((rule) => normalizedObjectiveText.includes(normalizeSearchText(rule))) ? 6 : 0;
  score -= avoidPenalty;

  const fitScore = Math.max(0, Math.min(100, Math.round(score)));
  const fitBand: OrganicStrategyFitBand = fitScore >= 75 ? "recommended" : fitScore >= 60 ? "secondary" : "not_recommended";

  return {
    id: item.id,
    strategyName: item.strategyName,
    strategySummary: item.strategySummary,
    fitScore,
    confidence: item.confidence,
    reason:
      fitSignals.size > 0
        ? [...fitSignals].join(" · ")
        : `${item.strategyName} é coerente com o contexto e com o objetivo informado.`,
    fitSignals: fitSignals.size > 0 ? [...fitSignals] : [item.strategySummary],
    recommendedFormats: item.recommendedFormats,
    campaignObjective: input.campaignObjective?.trim() || null,
    funnelStage: item.funnelStage,
    fitBand,
  } satisfies OrganicStrategyOption;
};

export const buildContextualStrategyOptions = (input: OrganicStrategyInput): OrganicStrategyRecommendation => {
  const scoredOptions = ORGANIC_STRATEGY_CATALOG.map((item) => scoreOrganicStrategyOption(item, input)).sort(
    (left, right) => right.fitScore - left.fitScore || right.confidence - left.confidence || left.strategyName.localeCompare(right.strategyName),
  );

  const primary = scoredOptions[0] ?? null;
  const secondary = scoredOptions.filter((item) => item.id !== primary?.id && item.fitScore >= 60).slice(0, 3);
  const notRecommended = scoredOptions.filter((item) => item.id !== primary?.id && item.fitScore < 60);

  return {
    primary,
    secondary,
    notRecommended,
    strategyOptions: scoredOptions,
  };
};

const inferCampaignActionFocus = (
  primary: StrategyRecommendationItem | null,
  context: {
    campaignObjective?: string | null;
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
  },
  product: ProductRow | null,
) => {
  const text = collectText([
    primary?.strategyName,
    primary?.strategySummary,
    primary?.objective,
    context.campaignObjective,
    context.productContext,
    context.serviceContext,
    context.audienceContext,
    product?.name,
    product?.category,
    product?.offer_type,
    product?.promise,
    product?.problem_solved,
    product?.audience,
  ]).toLowerCase();

  if (/autoridade|posicionamento|credibil|case|prova/.test(text)) return "autoridade e prova";
  if (/educa|ensina|explica|clareza|mecanismo|aula|didat/.test(text)) return "educação e mecanismo";
  if (/convers|cta|lead|venda|agend|demo|checkout/.test(text)) return "conversão e CTA";
  if (/obje|medo|risco|seguran|duvid/.test(text)) return "quebra de objeções";
  if (/viral|trend|tendenc|alcance|distribu/.test(text)) return "alcance e distribuição";
  if (/escala|processo|autom|efici/.test(text)) return "escala e sistema";
  if (/comunidade|engaj|recorr|reten/.test(text)) return "comunidade e retenção";

  const offerProfile = inferOfferProfile(product);
  if (offerProfile.isConsultative || offerProfile.isHighTicket) return "autoridade e prova";
  if (offerProfile.isEducational) return "educação e mecanismo";
  if (offerProfile.isProductized) return "escala e sistema";

  return "conversão e CTA";
};

export const buildCampaignActionPlan = (
  primary: StrategyRecommendationItem | null,
  context: {
    campaignObjective?: string | null;
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    funnelStage?: string | null;
  },
  product: ProductRow | null,
): CampaignActionPlan => {
  const stage = (normalizeFunnelStage(context.funnelStage) ?? normalizeFunnelStage(primary?.funnelStage) ?? "consideration") as CampaignStage;
  const focus = inferCampaignActionFocus(primary, context, product);
  const summary = `Transforme ${primary?.strategyName ?? "a estratégia recomendada"} em rotina semanal com peças repetíveis, foco em ${focus} e execução simples.`;

  const templates: Record<
    CampaignStage,
    CampaignActionPlanTemplate
  > = {
    awareness: {
      weeklyCadence: "5 peças por semana: 3 reels/shorts, 1 carrossel e 1 sequência de stories.",
      contentMix: [
        { format: "reel/short", frequency: "3x por semana", purpose: "capturar atenção e abrir o tema com um gancho simples" },
        { format: "carrossel", frequency: "1x por semana", purpose: "explicar o mecanismo em passos curtos" },
        { format: "stories", frequency: "diário", purpose: "repetir a mensagem, coletar dúvidas e manter presença" },
      ],
      weeklyAgenda: [
        {
          day: "Segunda",
          title: "Por que esse problema continua travando sua campanha",
          hook: "Comece com a dor mais óbvia e mostre que o erro não é esforço, e sim falta de clareza.",
          structure: "Problema -> impacto -> tese -> microexemplo -> convite leve.",
          copy: "O problema não é postar mais. É postar sem uma tese clara que organize a atenção do público.",
          caption: "Se a campanha trava, o primeiro ajuste é clareza de tese, não volume.",
          format: "reel/short",
          deliverable: "gancho principal da semana",
          objective: "abrir alcance e introduzir a tese",
          finalCta: "salvar o conteúdo",
        },
        {
          day: "Terça",
          title: "O mecanismo que simplifica a decisão",
          hook: "Mostre o mecanismo em uma frase simples antes de entrar nos passos.",
          structure: "Promessa -> mecanismo -> 4 passos -> erro comum -> resumo.",
          copy: "Quando você explica o mecanismo certo, a decisão fica mais rápida e o conteúdo ganha utilidade.",
          caption: "Legende com os 4 passos e destaque o erro comum no final.",
          format: "carrossel",
          deliverable: "explicação do mecanismo em 4 passos",
          objective: "aumentar compreensão",
          finalCta: "compartilhar com alguém",
        },
        {
          day: "Quarta",
          title: "As dúvidas que o público sempre faz antes de comprar",
          hook: "Abra com uma pergunta real que você escuta de clientes ou leads.",
          structure: "Pergunta -> respostas rápidas -> objeção -> prova -> chamada para interação.",
          copy: "Quais dúvidas aparecem sempre antes da compra? As respostas mostram exatamente onde o conteúdo precisa atuar.",
          caption: "Use perguntas reais do direct, comentários ou call para gerar identificação.",
          format: "stories",
          deliverable: "caixa de perguntas e enquete",
          objective: "coletar objeções e vocabulário do público",
          finalCta: "responder a enquete",
        },
        {
          day: "Quinta",
          title: "Prova ou contexto que reforça a tese",
          hook: "Traga um caso ou contexto que mostre por que a tese é confiável.",
          structure: "Contexto -> prova -> interpretação -> lição -> próximo passo.",
          copy: "Toda tese fica mais forte quando vem acompanhada de prova. Sem isso, ela parece apenas opinião.",
          caption: "Feche com o aprendizado e um convite leve para seguir o raciocínio.",
          format: "reel/short",
          deliverable: "variação do gancho com prova ou contexto",
          objective: "reforçar reconhecimento da tese",
          finalCta: "seguir o perfil",
        },
        {
          day: "Sexta",
          title: "Resumo da semana + próximo passo",
          hook: "Feche a semana com uma síntese do que o público aprendeu e do que vem agora.",
          structure: "Resumo -> reforço da tese -> resposta a dúvida -> próximo passo -> CTA leve.",
          copy: "A semana termina com uma mensagem simples: o que aprendemos, o que mudou e qual é o próximo passo.",
          caption: "Use esse fechamento para fixar a tese e preparar a próxima ação.",
          format: "stories",
          deliverable: "recapitulação da semana e chamada leve",
          objective: "manter presença e empurrar o próximo passo",
          finalCta: "mandar DM",
        },
      ],
      weeklyActions: [
        "Abra a semana com 1 vídeo curto que mostre a dor, a promessa e o ponto de vista.",
        "Publique 1 carrossel com o mecanismo em 3 a 5 passos.",
        "Feche a semana com stories de pergunta, enquete e CTA para seguir ou salvar.",
      ],
      productionPriorities: [
        "gancho claro e rápido",
        "explicação sem jargão",
        "repetição da tese principal",
      ],
      ctaFocus: "seguir, salvar e compartilhar",
      nextTests: [
        "testar 2 ganchos diferentes para a mesma tese",
        "comparar vídeo curto falado vs. vídeo curto com texto na tela",
        "validar se o carrossel aumenta salvamentos mais do que o reel",
      ],
      distributionNotes: [
        "priorize alcance antes de conversão direta",
        "mantenha a linguagem simples e sem excesso de contexto",
        "repita o mecanismo até ele ficar reconhecível",
      ],
    },
    consideration: {
      weeklyCadence: "4 peças por semana: 2 reels, 1 carrossel e 1 sequência de stories com prova.",
      contentMix: [
        { format: "reel", frequency: "2x por semana", purpose: "posicionar e abrir a conversa" },
        { format: "carrossel", frequency: "1x por semana", purpose: "explicar a tese com mais clareza" },
        { format: "stories de prova", frequency: "1x por semana", purpose: "mostrar contexto, resultado e bastidor" },
      ],
      weeklyAgenda: [
        {
          day: "Segunda",
          title: "Por que essa tese faz sentido agora",
          hook: "Abra com o motivo pelo qual essa visão resolve um problema real do momento.",
          structure: "Contexto -> tese -> credencial -> exemplo -> convite.",
          copy: "Essa tese faz sentido agora porque resolve um problema prático que o público já sente no dia a dia.",
          caption: "Mostre contexto e credencial antes de passar para o exemplo.",
          format: "reel",
          deliverable: "autoridade da tese",
          objective: "posicionar e abrir a conversa",
          finalCta: "salvar",
        },
        {
          day: "Terça",
          title: "O mecanismo + o erro comum que atrapalha",
          hook: "Comece mostrando o erro comum antes de revelar o mecanismo.",
          structure: "Erro -> consequência -> mecanismo -> comparação -> resumo.",
          copy: "O erro mais comum não é falta de vontade. É seguir um caminho que parece certo, mas não gera decisão.",
          caption: "Compare o erro e o mecanismo correto em blocos curtos.",
          format: "carrossel",
          deliverable: "mecanismo + erro comum",
          objective: "clarificar a decisão",
          finalCta: "compartilhar",
        },
        {
          day: "Quarta",
          title: "O que aconteceu quando aplicamos isso",
          hook: "Abra com o resultado e depois volte para o processo que gerou a prova.",
          structure: "Resultado -> bastidor -> decisão -> aprendizado -> convite para responder.",
          copy: "Quando a tese entra na operação, o resultado precisa aparecer no bastidor e no número.",
          caption: "Mostre o resultado, conte o bastidor e convide para perguntas.",
          format: "stories de prova",
          deliverable: "bastidor e resultado",
          objective: "reduzir dúvida",
          finalCta: "responder com dúvidas",
        },
        {
          day: "Quinta",
          title: "Comparação prática: antes e depois",
          hook: "Mostre uma comparação simples que deixe a mudança óbvia em segundos.",
          structure: "Antes -> depois -> comparação -> insight -> CTA.",
          copy: "Antes e depois ajudam a enxergar valor rápido. O objetivo é tornar a mudança impossível de ignorar.",
          caption: "Use uma comparação visual ou narrativa, sem exagerar na explicação.",
          format: "reel",
          deliverable: "comparação ou quebra de crença",
          objective: "reforçar a proposta",
          finalCta: "pedir diagnóstico",
        },
        {
          day: "Sexta",
          title: "Perguntas que mais travam a decisão",
          hook: "Liste as dúvidas que mais aparecem quando alguém está perto de comprar.",
          structure: "Perguntas -> respostas curtas -> prova -> tranquilização -> CTA.",
          copy: "As dúvidas perto da decisão são previsíveis. Quando você as responde, a conversão fica mais simples.",
          caption: "Transforme as dúvidas em respostas curtas e objetivas.",
          format: "stories",
          deliverable: "perguntas frequentes",
          objective: "converter interesse em conversa",
          finalCta: "agendar conversa",
        },
      ],
      weeklyActions: [
        "Publique 1 reel de autoridade e 1 reel de dúvida ou comparação.",
        "Publique 1 carrossel com a tese, o mecanismo e o erro comum.",
        "Use stories para mostrar prova, bastidor e responder dúvidas recorrentes.",
      ],
      productionPriorities: [
        "clareza do mecanismo",
        "prova suficiente para reduzir dúvida",
        "transição suave para a oferta",
      ],
      ctaFocus: "responder, pedir diagnóstico ou agendar conversa",
      nextTests: [
        "testar carrossel com prova social contra carrossel apenas educacional",
        "comparar stories de bastidor com stories de caso",
        "medir qual formato gera mais respostas diretas",
      ],
      distributionNotes: [
        "equilibre ensino e evidência",
        "não pressione venda antes de consolidar confiança",
        "repita a prova em formatos diferentes",
      ],
    },
    decision: {
      weeklyCadence: "4 a 5 toques por semana: 1 case, 1 peça de objeção, 1 peça de oferta e 2 sequências de stories.",
      contentMix: [
        { format: "case/prova", frequency: "1x por semana", purpose: "reduzir risco percebido com evidência concreta" },
        { format: "reel de objeção", frequency: "1x por semana", purpose: "antecipar medo, custo ou tempo" },
        { format: "stories com CTA", frequency: "2x por semana", purpose: "levar o público para a próxima ação" },
      ],
      weeklyAgenda: [
        {
          day: "Segunda",
          title: "Case da semana: por que a solução funcionou",
          hook: "Abra com o número, o resultado ou a transformação alcançada.",
          structure: "Resultado -> contexto -> solução -> prova -> pedido de proposta.",
          copy: "O case mostra o que mudou, por que mudou e por que isso pode se repetir em outro contexto.",
          caption: "Organize em contexto, solução e resultado para facilitar a leitura.",
          format: "case/prova",
          deliverable: "antes/depois ou resultado",
          objective: "mostrar que a solução funciona",
          finalCta: "pedir proposta",
        },
        {
          day: "Terça",
          title: "A objeção mais comum antes da compra",
          hook: "Nomeie a objeção explicitamente para mostrar que você a entende.",
          structure: "Objeção -> resposta -> prova -> comparação -> direct.",
          copy: "Se a objeção é sempre a mesma, a resposta também precisa ser clara, direta e repetível.",
          caption: "Responda a objeção sem rodeios e feche com prova.",
          format: "reel de objeção",
          deliverable: "resposta ao medo principal",
          objective: "remover trava cognitiva",
          finalCta: "tirar dúvida no direct",
        },
        {
          day: "Quarta",
          title: "Oferta resumida em 1 mensagem",
          hook: "Comece com a oferta sem rodeios e explique em uma frase o benefício central.",
          structure: "Oferta -> benefício -> condição -> prova -> link.",
          copy: "A oferta precisa caber em uma mensagem simples: o que é, para quem é e o que a pessoa ganha.",
          caption: "Uma mensagem clara vale mais do que uma explicação longa demais.",
          format: "stories com CTA",
          deliverable: "oferta resumida",
          objective: "gerar ação imediata",
          finalCta: "clicar no link",
        },
        {
          day: "Quinta",
          title: "Condição, benefício e prazo",
          hook: "Mostre o motivo para agir agora e não depois.",
          structure: "Benefício -> condição -> prazo -> risco de perder -> CTA.",
          copy: "Quando a condição é clara, o público entende o custo de esperar. Isso acelera a ação.",
          caption: "Use um prazo real e um benefício concreto, sem dramatizar.",
          format: "post de oferta",
          deliverable: "benefício, condição e prazo",
          objective: "converter intenção",
          finalCta: "agendar conversa",
        },
        {
          day: "Sexta",
          title: "Última chamada da semana",
          hook: "Retome o que foi provado e encerre com uma decisão simples.",
          structure: "Resumo -> urgência -> prova -> próximo passo -> CTA final.",
          copy: "Feche a semana lembrando a pessoa do valor visto e do próximo passo que ela pode tomar agora.",
          caption: "Último CTA da semana, com prova e decisão simples.",
          format: "stories com CTA",
          deliverable: "recapitulação e última chamada",
          objective: "fechar pendência",
          finalCta: "comprar agora",
        },
      ],
      weeklyActions: [
        "Publique 1 case com antes/depois, contexto e resultado.",
        "Publique 1 peça específica de quebra de objeção.",
        "Faça 2 sequências de stories com chamada para proposta, compra ou agendamento.",
      ],
      productionPriorities: [
        "prova concreta",
        "objeções respondidas antes da oferta",
        "CTA explícito e direto",
      ],
      ctaFocus: "marcar conversa, pedir proposta ou comprar",
      nextTests: [
        "testar uma peça focada em preço contra uma focada em risco",
        "comparar CTA para agendamento com CTA para compra direta",
        "medir qual prova social reduz mais a fricção",
      ],
      distributionNotes: [
        "reduza a ambiguidade do próximo passo",
        "trate objeções antes de insistir na urgência",
        "coloque a prova no início da peça, não só no final",
      ],
    },
    retention: {
      weeklyCadence: "3 a 4 pontos de contato por semana: 1 newsletter, 1 live e 2 sequências de stories/comunidade.",
      contentMix: [
        { format: "newsletter", frequency: "1x por semana", purpose: "manter relacionamento e aprofundar visão" },
        { format: "live", frequency: "1x por semana", purpose: "gerar proximidade e responder questões ao vivo" },
        { format: "stories/comunidade", frequency: "2x por semana", purpose: "estimular participação e recorrência" },
      ],
      weeklyAgenda: [
        {
          day: "Segunda",
          title: "O aprendizado que vale repetir",
          hook: "Abra com uma lição prática que a audiência possa aplicar imediatamente.",
          structure: "Lição -> exemplo -> aplicação -> convite -> continuidade.",
          copy: "O que foi aprendido nesta semana deve virar prática. O conteúdo de retenção existe para isso.",
          caption: "Traga um exemplo curto e um convite para colocar em prática.",
          format: "newsletter",
          deliverable: "aprendizado da semana",
          objective: "reativar atenção",
          finalCta: "abrir e ler",
        },
        {
          day: "Terça",
          title: "Pergunta para puxar a comunidade",
          hook: "Faça uma pergunta fácil de responder para estimular participação.",
          structure: "Pergunta -> contexto -> exemplo -> participação -> resposta.",
          copy: "Participação cresce quando a pergunta é simples e o contexto ajuda a pessoa a responder sem esforço.",
          caption: "Use uma pergunta que gere comentários ou respostas em DM.",
          format: "stories/comunidade",
          deliverable: "pergunta ou ritual",
          objective: "aumentar participação",
          finalCta: "responder",
        },
        {
          day: "Quarta",
          title: "Q&A ao vivo com o que mais trava a jornada",
          hook: "Comece com a dúvida mais frequente da comunidade.",
          structure: "Dúvida -> resposta -> bastidor -> orientação -> convite ao vivo.",
          copy: "A live funciona quando a dúvida principal vira conversa e a resposta parece uma aula útil, não um pitch.",
          caption: "Abra com a dor, responda com clareza e termine com orientação.",
          format: "live",
          deliverable: "Q&A ou bastidor",
          objective: "gerar proximidade",
          finalCta: "entrar ao vivo",
        },
        {
          day: "Quinta",
          title: "Prova de continuidade",
          hook: "Mostre que a consistência está sendo mantida e que o valor continua aparecendo.",
          structure: "Continuidade -> prova -> hábito -> reforço -> engajamento.",
          copy: "A retenção aumenta quando a audiência percebe que a entrega continua e que vale permanecer.",
          caption: "Mostre rotina, consistência e pequenos ganhos acumulados.",
          format: "stories/comunidade",
          deliverable: "prova de continuidade",
          objective: "sustentar hábito",
          finalCta: "comentar",
        },
        {
          day: "Sexta",
          title: "Fechamento da semana",
          hook: "Feche com uma síntese útil e convide a comunidade para a próxima etapa.",
          structure: "Síntese -> valor -> reforço -> convite -> compartilhamento.",
          copy: "Encerrar a semana com síntese ajuda a fixar o valor e prepara o próximo ciclo de atenção.",
          caption: "Feche com uma lição aplicável e um convite para compartilhar.",
          format: "newsletter ou post",
          deliverable: "fechamento da semana",
          objective: "reforçar valor",
          finalCta: "compartilhar",
        },
      ],
      weeklyActions: [
        "Envie 1 comunicação de retenção com aprendizado prático ou atualização relevante.",
        "Faça 1 live curta ou Q&A com as dúvidas mais frequentes.",
        "Publique 2 sequências de stories com pergunta, votação ou convite para resposta.",
      ],
      productionPriorities: [
        "relação contínua",
        "participação recorrente",
        "reforço do valor entregue",
      ],
      ctaFocus: "responder, participar e renovar",
      nextTests: [
        "testar newsletter com conteúdo prático contra newsletter com bastidor",
        "comparar live de dúvida contra live de caso",
        "medir engajamento de prompts curtos versus prompts longos",
      ],
      distributionNotes: [
        "mantenha consistência de presença",
        "não trate retenção como campanha isolada",
        "faça o público sentir evolução contínua",
      ],
    },
    scale: {
      weeklyCadence: "4 peças por semana: 1 peça de processo, 1 case, 1 carrossel e 1 vídeo curto.",
      contentMix: [
        { format: "carrossel", frequency: "1x por semana", purpose: "explicar processo e playbook" },
        { format: "reel/short", frequency: "1x por semana", purpose: "distribuir a tese com alcance" },
        { format: "case/bastidor", frequency: "1x por semana", purpose: "mostrar operação, sistema e consistência" },
      ],
      weeklyAgenda: [
        {
          day: "Segunda",
          title: "O playbook que organiza a execução",
          hook: "Abra com o processo que permite repetir resultado sem depender de improviso.",
          structure: "Playbook -> etapas -> responsável -> resultado -> salvamento.",
          copy: "Escala sem processo vira ruído. O playbook mostra como a execução se repete com menos esforço.",
          caption: "Apresente o processo em etapas para deixar a replicação óbvia.",
          format: "carrossel",
          deliverable: "playbook de processo",
          objective: "explicar o método",
          finalCta: "salvar",
        },
        {
          day: "Terça",
          title: "Insight curto para ampliar distribuição",
          hook: "Mostre um insight rápido que vale por si só e chama compartilhamento.",
          structure: "Insight -> implicação -> exemplo -> resumo -> seguir.",
          copy: "Um insight curto pode ampliar distribuição quando ele condensa uma lição útil em poucas linhas.",
          caption: "Use uma ideia forte, fácil de salvar e compartilhar.",
          format: "reel/short",
          deliverable: "insight de distribuição",
          objective: "ampliar alcance",
          finalCta: "seguir",
        },
        {
          day: "Quarta",
          title: "O que a operação provou na prática",
          hook: "Use um resultado concreto para mostrar que o processo se sustenta em operação real.",
          structure: "Operação -> evidência -> interpretação -> aprendizado -> compartilhamento.",
          copy: "Quando a operação prova a tese, a equipe ganha confiança para repetir o que funcionou.",
          caption: "Mostre consistência operacional, não só o resultado final.",
          format: "case/bastidor",
          deliverable: "resultado operacional",
          objective: "mostrar replicabilidade",
          finalCta: "compartilhar",
        },
        {
          day: "Quinta",
          title: "Benchmark ou aprendizado que vale copiar",
          hook: "Traga um benchmark para mostrar o que está funcionando em escala.",
          structure: "Benchmark -> comparação -> lição -> adaptação -> pedido de benchmark.",
          copy: "Benchmark ajuda a entender o que merece ser copiado e o que precisa ser adaptado ao contexto.",
          caption: "Traga uma referência e a lição que ela deixa para a operação.",
          format: "reel",
          deliverable: "benchmark ou aprendizado",
          objective: "repetir a tese em escala",
          finalCta: "pedir benchmark",
        },
        {
          day: "Sexta",
          title: "Lições da semana para melhorar o sistema",
          hook: "Finalize com o que o time deve repetir e o que deve parar de fazer.",
          structure: "Lição -> ajuste -> decisão -> padrão -> comentário.",
          copy: "Toda semana deve fechar com uma decisão operacional: o que manter, o que ajustar e o que eliminar.",
          caption: "Use esse post para transformar aprendizado em padrão.",
          format: "post de revisão",
          deliverable: "lições da semana",
          objective: "fechar ciclo e otimizar",
          finalCta: "comentar",
        },
      ],
      weeklyActions: [
        "Publique 1 conteúdo mostrando o processo que torna a execução previsível.",
        "Publique 1 case de escala ou consistência.",
        "Inclua 1 peça curta com insight para replicação ou benchmark.",
      ],
      productionPriorities: [
        "processo claro",
        "consistência operacional",
        "replicabilidade",
      ],
      ctaFocus: "adotar o processo, replicar ou pedir benchmark",
      nextTests: [
        "testar peça de processo contra peça de case",
        "comparar conteúdo sobre método com conteúdo sobre resultado",
        "medir qual formato gera mais pedidos de implementação",
      ],
      distributionNotes: [
        "mostre como o sistema funciona, não apenas o resultado final",
        "reduza dependência de esforço manual",
        "priorize consistência acima de improviso",
      ],
    },
  };

  const template = templates[stage];
  const weeklyAgenda = template.weeklyAgenda.map((item) => ({
    ...item,
    variants: buildAgendaVariants({
      stage,
      title: item.title,
      hook: item.hook,
      copy: item.copy,
      finalCta: item.finalCta,
    }),
  }));

  return {
    focus,
    stage,
    summary,
    ...template,
    weeklyAgenda,
  };
};

const buildStrategyName = (
  kind: StrategySlot,
  draft: { strategyName: string; strategySummary: string; objective: string | null; evidence: string[] },
  product: ProductRow | null,
) =>
  STRATEGY_THEME_LABELS[
    inferStrategyTheme(
      kind,
      {
        name: draft.strategyName,
        summary: draft.strategySummary,
        objective: draft.objective,
        evidence: draft.evidence,
      },
      product,
    )
  ];

const buildDraftFromYoutubePayload = async (input: {
  client: ClientRow;
  sourceAnalysisId: string | null;
  sourceAnalysisVersion: number | null;
  payload: YoutubeStrategyPayloadLike;
}) => {
  const recommendedBusinessTypes = input.payload.synthesis?.recommendedBusinessTypes ?? [];
  const lessSuitableBusinessTypes = input.payload.synthesis?.lessSuitableBusinessTypes ?? [];
  const sourceUrls = toList((input.payload.videos ?? []).map((video) => video.originalUrl).filter(Boolean));
  const sourceVideos = buildStrategySourceVideos(input.payload.videos);
  const commonStrategies = input.payload.synthesis?.commonStrategies ?? [];
  const commonMechanisms = input.payload.synthesis?.commonMechanisms ?? [];
  const commonTactics = input.payload.synthesis?.commonTactics ?? [];
  const nextTests = input.payload.synthesis?.nextTests ?? [];
  const version = input.sourceAnalysisVersion ?? 1;

  const contextualRecommendations = buildContextualStrategyOptions({
    productContext: null,
    serviceContext: null,
    audienceContext: null,
    clientSegment: null,
    funnelStage: input.payload.context?.funnelStage ?? null,
    sourceSignals: [...commonStrategies, ...commonMechanisms, ...commonTactics, ...nextTests],
    activeProduct: null,
  });

  const sourcePayload = {
    type: "youtube",
    analysisId: input.sourceAnalysisId,
    analysisVersion: input.sourceAnalysisVersion,
    urls: sourceUrls,
    primaryVideo: sourceVideos[0] ?? null,
    videos: sourceVideos,
    transcriptCoverage: input.payload.context?.transcriptCoverage ?? null,
    summary: input.payload.overview?.executiveSummary ?? null,
    thesis: input.payload.overview?.thesis ?? null,
    confidence: input.payload.overview?.confidence ?? input.payload.context?.confidence ?? 0,
  };
  const sourceMetadata = buildStrategySourceMetadata(sourcePayload);
  const recordTitle = sourceVideos[0]?.title ?? input.payload.title ?? null;

  const assetBlueprints = KINDS.map((kind, index) => {
    const draft = buildStrategySummary(kind, input.payload, index);
    const strategyName = buildStrategyName(kind, draft, null);
    const sourceBusinessType = recommendedBusinessTypes[index]?.businessType ?? recommendedBusinessTypes[0]?.businessType ?? "geral";
    const businessTypeReason = recommendedBusinessTypes[index]?.reason ?? recommendedBusinessTypes[0]?.reason ?? input.payload.overview?.thesis ?? "Leitura consolidada da transcricao";
    const fitSignals = [
      ...new Set([
        ...draft.evidence,
        ...draft.strategySummary.split(/[.;]/).map((item) => item.trim()).filter(Boolean).slice(0, 2),
        sourceBusinessType !== "geral" ? `contexto de ${sourceBusinessType}` : "contexto geral",
        businessTypeReason,
      ]),
    ];

    const baseScore =
      kind === "primary"
        ? recommendedBusinessTypes[0]?.score ?? 85
        : kind === "alternative"
          ? recommendedBusinessTypes[1]?.score ?? Math.max(55, (recommendedBusinessTypes[0]?.score ?? 70) - 10)
          : lessSuitableBusinessTypes[0]?.score ?? 55;

    const confidence = Math.max(30, Math.min(100, Math.round((input.payload.overview?.confidence ?? input.payload.context?.confidence ?? 60) - index * 8)));

    return {
      kind,
      payload: {
        title: recordTitle,
        source: sourcePayload,
        strategy: {
          name: strategyName,
          summary: draft.strategySummary,
          objective: draft.objective,
          funnelStage: draft.funnelStage,
          fitScore: baseScore,
          confidence,
          slot: kind,
          fitBand: kind === "primary" ? "recommended" : kind === "alternative" ? "secondary" : "not_recommended",
          sourceBusinessType,
          businessTypeReason,
        },
        recommendation: {
          productContext: null,
          serviceContext: null,
          audienceContext: null,
          sourceUrls,
          commonStrategies,
          commonMechanisms,
          nextTests,
          evidence: draft.evidence,
          lessSuitableBusinessTypes,
          fitSignals,
        },
      },
    };
  });

  const recommendationPayload = {
    title: recordTitle ?? "biblioteca de estratégia",
    strategyBlueprints: assetBlueprints,
    strategyLibrary: {
      version,
      source: {
        analysisId: input.sourceAnalysisId,
        analysisVersion: input.sourceAnalysisVersion,
        primaryVideo: sourceVideos[0] ?? null,
        videos: sourceVideos,
      },
      assets: assetBlueprints.map((asset) => asset.payload),
    },
    source: sourceMetadata,
    synthesis: {
      commonStrategies: commonStrategies.slice(0, 4),
      commonMechanisms: commonMechanisms.slice(0, 4),
      nextTests: nextTests.slice(0, 3),
    },
    context: {
      productContext: null,
      serviceContext: null,
      audienceContext: null,
      funnelStage: input.payload.context?.funnelStage ?? null,
      selectedProduct: null,
    },
    strategyOptions: contextualRecommendations.strategyOptions,
  };

  return {
    version,
    payload: recommendationPayload,
    assets: assetBlueprints,
  };
};

const chooseActiveProduct = async (clientId: string, productId?: string | null) => {
  if (productId) {
    const selected = await findProductById(productId);
    if (!selected || selected.client_id !== clientId) {
      throw createError("NOT_FOUND", "Product not found", 404);
    }

    return selected;
  }

  const products = await listProductsByClientId(clientId);
  return products.find((product) => product.is_active) ?? products[0] ?? null;
};

const normalizeStrategyLibraryKey = (strategyName: string, objective: string | null, funnelStage: string | null) =>
  [strategyName, objective, funnelStage]
    .map((value) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("__");

const scoreStrategyLibraryForContext = (
  strategy: StrategyLibraryRow,
  product: ProductRow | null,
  context: {
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    funnelStage?: string | null;
  },
) => {
  const fitSignals = Array.isArray(strategy.fit_signals)
    ? (strategy.fit_signals as unknown[]).map((signal) => (typeof signal === "string" ? signal : "")).filter(Boolean)
    : [];
  const tokens = new Set<string>();
  const offerProfile = inferOfferProfile(product);
  const strategyAngles = inferStrategyAngles({
    name: strategy.strategy_name,
    summary: strategy.strategy_summary,
    objective: strategy.canonical_objective ?? null,
    evidence: fitSignals,
  });

  const pushTokens = (value: unknown) => {
    if (typeof value !== "string") return;
    splitTokens(value).forEach((token) => tokens.add(token));
  };

  pushTokens(strategy.strategy_key);
  pushTokens(strategy.strategy_name);
  pushTokens(strategy.strategy_summary);
  pushTokens(String(strategy.canonical_objective ?? ""));
  pushTokens(String(strategy.canonical_funnel_stage ?? ""));
  fitSignals.forEach(pushTokens);

  const productText = collectText([
    product?.name,
    product?.category,
    product?.offer_type,
    product?.promise,
    product?.problem_solved,
    product?.audience,
    product?.notes,
    context.productContext,
    context.serviceContext,
    context.audienceContext,
  ]).toLowerCase();

  let score = 20 + Math.min(24, Number(strategy.source_count ?? 0) * 3);
  const overlap = [...tokens].filter((token) => productText.includes(token)).length;
  score += overlap * 6;

  if (product?.is_active) score += 5;
  if (product?.status === "prioritized" || product?.status === "in_campaign") score += 8;

  if (String(strategy.fit_band ?? "").toLowerCase() === "recommended") score += 8;
  if (String(strategy.fit_band ?? "").toLowerCase() === "secondary") score += 4;

  if (offerProfile.isConsultative && strategyAngles.has("authority")) {
    score += 16;
  }

  if (offerProfile.isEducational && strategyAngles.has("education")) {
    score += 14;
  }

  if (offerProfile.isProductized && (strategyAngles.has("scale") || strategyAngles.has("conversion"))) {
    score += 14;
  }

  if (offerProfile.hasPerformanceNeed && strategyAngles.has("conversion")) {
    score += 10;
  }

  if (offerProfile.isHighTicket && strategyAngles.has("authority")) {
    score += 8;
  }

  if (fitSignals.some((signal) => signal.includes("produto prioritário"))) score += 4;
  if (fitSignals.some((signal) => signal.includes("produto ativo"))) score += 3;
  if (fitSignals.some((signal) => signal.includes("bom encaixe"))) score += 5;
  if (fitSignals.some((signal) => signal.includes("compatível"))) score += 4;
  if (context.productContext || context.serviceContext || context.audienceContext) {
    score += Math.min(8, overlap * 2);
  }

  const stage = normalizeFunnelStage(context.funnelStage);
  if (stage) {
    if (stage === "awareness" && String(strategy.canonical_funnel_stage ?? "").toLowerCase() === "awareness") score += 10;
    if (stage === "consideration" && String(strategy.canonical_funnel_stage ?? "").toLowerCase() === "consideration") score += 10;
    if (stage === "decision" && String(strategy.canonical_funnel_stage ?? "").toLowerCase() === "conversion") score += 10;
    if (stage === "retention" && String(strategy.canonical_funnel_stage ?? "").toLowerCase() === "retention") score += 10;
    if (stage === "scale" && String(strategy.canonical_funnel_stage ?? "").toLowerCase() === "scale") score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

const toRecommendationItemFromLibrary = (
  strategy: StrategyLibraryRow,
  product: ProductRow | null,
  context: {
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    funnelStage?: string | null;
  },
): StrategyRecommendationItem => {
  const fitSignals = Array.isArray(strategy.fit_signals)
    ? (strategy.fit_signals as unknown[]).map((signal) => (typeof signal === "string" ? signal : "")).filter(Boolean)
    : [];
  const fitScore = scoreStrategyLibraryForContext(strategy, product, context);
  const fitBand: OrganicStrategyFitBand = fitScore >= 75 ? "recommended" : fitScore >= 60 ? "secondary" : "not_recommended";

  return {
    id: strategy.id,
    strategyKey: strategy.strategy_key,
    kind: "library",
    version: Number(strategy.source_count ?? 0),
    strategyName: strategy.strategy_name,
    strategySummary: strategy.strategy_summary,
    fitScore,
    confidence: Math.max(0, Math.min(100, Number(strategy.source_count ?? 0) * 6 + (fitBand === "recommended" ? 20 : fitBand === "secondary" ? 10 : 0))),
    sourceAnalysisId: strategy.last_source_analysis_id,
    reason: strategy.canonical_objective ?? "Estratégia consolidada da biblioteca global",
    fitSignals,
    productContext: context.productContext ?? null,
    serviceContext: context.serviceContext ?? null,
    audienceContext: context.audienceContext ?? null,
    funnelStage: strategy.canonical_funnel_stage ?? context.funnelStage ?? null,
    objective: strategy.canonical_objective ?? null,
    sourceUrls: [],
    evidence: [],
    fitBand,
    sourceCount: Number(strategy.source_count ?? 0),
  };
};

const scoreAssetForContext = (
  asset: StrategyIntelligenceRow,
  product: ProductRow | null,
  context: {
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    funnelStage?: string | null;
  },
) => {
  const payload = asset.payload_json as Record<string, unknown>;
  const strategy = (payload.strategy ?? {}) as Record<string, unknown>;
  const recommendation = (payload.recommendation ?? {}) as Record<string, unknown>;
  const source = (payload.source ?? {}) as Record<string, unknown>;
  const primaryVideo = (source.primaryVideo ?? null) as Record<string, unknown> | null;
  const sourceTitle = toNullableString(source.title);
  const fitSignals = Array.isArray(recommendation.fitSignals)
    ? (recommendation.fitSignals as unknown[]).map((signal) => (typeof signal === "string" ? signal : "")).filter(Boolean)
    : [];
  const tokens = new Set<string>();

  const pushTokens = (value: unknown) => {
    if (typeof value !== "string") return;
    splitTokens(value).forEach((token) => tokens.add(token));
  };

  pushTokens(String(strategy.name ?? ""));
  pushTokens(String(strategy.summary ?? ""));
  pushTokens(String(strategy.objective ?? ""));
  pushTokens(String(recommendation.productContext ?? ""));
  pushTokens(String(recommendation.serviceContext ?? ""));
  pushTokens(String(recommendation.audienceContext ?? ""));

  const productText = collectText([
    product?.name,
    product?.category,
    product?.offer_type,
    product?.promise,
    product?.problem_solved,
    product?.audience,
    product?.notes,
    context.productContext,
    context.serviceContext,
    context.audienceContext,
  ]).toLowerCase();

  let score = Number(strategy.fitScore ?? 0);
  const overlap = [...tokens].filter((token) => productText.includes(token)).length;
  score += overlap * 6;

  if (asset.kind === "primary") score += 12;
  if (asset.kind === "alternative") score += 6;
  if (asset.kind === "plan_b") score += 2;

  if (product?.is_active) score += 5;
  if (product?.status === "prioritized" || product?.status === "in_campaign") score += 8;

  const parsedConfidence = Number(strategy.confidence ?? 0);
  score += Math.round(parsedConfidence / 20);

  if (fitSignals.some((signal) => signal.includes("produto prioritário"))) score += 4;
  if (fitSignals.some((signal) => signal.includes("produto ativo"))) score += 3;
  if (fitSignals.some((signal) => signal.includes("bom encaixe"))) score += 5;
  if (fitSignals.some((signal) => signal.includes("compatível"))) score += 4;
  if (context.productContext || context.serviceContext || context.audienceContext) {
    score += Math.min(8, overlap * 2);
  }

  const stage = normalizeFunnelStage(context.funnelStage);
  if (stage) {
    if (stage === "awareness" && String(strategy.funnelStage ?? "").toLowerCase() === "awareness") score += 10;
    if (stage === "consideration" && String(strategy.funnelStage ?? "").toLowerCase() === "consideration") score += 10;
    if (stage === "decision" && String(strategy.funnelStage ?? "").toLowerCase() === "conversion") score += 10;
    if (stage === "retention" && String(strategy.funnelStage ?? "").toLowerCase() === "retention") score += 10;
    if (stage === "scale" && String(strategy.funnelStage ?? "").toLowerCase() === "scale") score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

const toRecommendationItem = (
  asset: StrategyIntelligenceRow,
  product: ProductRow | null,
  context: {
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    funnelStage?: string | null;
  },
): StrategyRecommendationItem => {
  const payload = asset.payload_json as Record<string, unknown>;
  const strategy = (payload.strategy ?? {}) as Record<string, unknown>;
  const recommendation = (payload.recommendation ?? {}) as Record<string, unknown>;
  const fitSignals = Array.isArray(recommendation.fitSignals)
    ? (recommendation.fitSignals as unknown[]).map((signal) => (typeof signal === "string" ? signal : "")).filter(Boolean)
    : [];
  const fitScore = scoreAssetForContext(asset, product, context);
  const fitBand: OrganicStrategyFitBand = fitScore >= 75 ? "recommended" : fitScore >= 60 ? "secondary" : "not_recommended";

  return {
    id: asset.id,
    strategyKey: normalizeStrategyLibraryKey(
      String(strategy.name ?? buildFallbackStrategyName(asset.kind as StrategySlot)),
      String(strategy.objective ?? null),
      String(strategy.funnelStage ?? null),
    ),
    kind: asset.kind as StrategySlot,
    version: asset.version,
    strategyName: String(strategy.name ?? buildFallbackStrategyName(asset.kind as StrategySlot)),
    strategySummary: String(strategy.summary ?? "Resumo objetivo indisponível"),
    fitScore,
    confidence: Number(strategy.confidence ?? 0),
    sourceAnalysisId: asset.source_analysis_id,
    reason: String(strategy.businessTypeReason ?? recommendation.reason ?? "Leitura objetiva derivada da transcrição"),
    fitSignals,
    productContext: String(recommendation.productContext ?? context.productContext ?? "") || null,
    serviceContext: String(recommendation.serviceContext ?? context.serviceContext ?? "") || null,
    audienceContext: String(recommendation.audienceContext ?? context.audienceContext ?? "") || null,
    funnelStage: String(strategy.funnelStage ?? "consideration"),
    objective: String(strategy.objective ?? "aplicar a estratégia mais coerente"),
    sourceUrls: toList((recommendation.sourceUrls ?? []) as unknown),
    evidence: toList((recommendation.evidence ?? []) as unknown),
    fitBand,
    sourceCount: 1,
  };
};

const sortRecommendations = (items: StrategyRecommendationItem[]) =>
  [...items].sort((left, right) => right.fitScore - left.fitScore || right.confidence - left.confidence || left.version - right.version);

const buildStrategyEvidencePayload = (assets: StrategyIntelligenceRow[]): StrategyEvidenceItem[] =>
  assets.map((asset) => {
    const payload = asset.payload_json as Record<string, unknown>;
    const strategy = (payload.strategy ?? {}) as Record<string, unknown>;
    const recommendation = (payload.recommendation ?? {}) as Record<string, unknown>;
    const source = (payload.source ?? {}) as Record<string, unknown>;
    const primaryVideo = (source.primaryVideo ?? null) as Record<string, unknown> | null;
    const recordTitle = toNullableString(payload.title);
    const fitSignals = Array.isArray(recommendation.fitSignals)
      ? (recommendation.fitSignals as unknown[]).map((signal) => (typeof signal === "string" ? signal : "")).filter(Boolean)
      : [];
    const strategyKey = normalizeStrategyLibraryKey(
      String(strategy.name ?? buildFallbackStrategyName(asset.kind as StrategySlot)),
      String(strategy.objective ?? null),
      String(strategy.funnelStage ?? null),
    );

    return {
      id: asset.id,
      clientId: asset.client_id,
      sourceAnalysisId: asset.source_analysis_id,
      sourceVersion: asset.version,
      kind: asset.kind as StrategySlot,
      strategyKey,
      strategyName: String(strategy.name ?? buildFallbackStrategyName(asset.kind as StrategySlot)),
      strategySummary: String(strategy.summary ?? "Resumo objetivo indisponível"),
      sourceTitle: toNullableString(recordTitle ?? primaryVideo?.title ?? source.title),
      sourceVideoId: toNullableString(primaryVideo?.videoId),
      sourceOriginalUrl: toNullableString(primaryVideo?.originalUrl),
      sourceCanonicalUrl: toNullableString(primaryVideo?.canonicalUrl),
      sourceChannelName: toNullableString(primaryVideo?.channelName),
      sourceChannelUrl: toNullableString(primaryVideo?.channelUrl),
      sourceThumbnailUrl: toNullableString(primaryVideo?.thumbnailUrl),
      sourceUrls: toList((recommendation.sourceUrls ?? []) as unknown),
      evidence: toList((recommendation.evidence ?? []) as unknown),
      fitSignals,
    };
  });

const buildSourceMetadataFromAssets = (assets: StrategyIntelligenceRow[]): StrategySourceMetadata | null => {
  const source = (assets[0]?.payload_json as Record<string, unknown> | undefined)?.source;
  return buildStrategySourceMetadata(source);
};

const buildStrategyRecordTitleFromAssets = (assets: StrategyIntelligenceRow[], source: StrategySourceMetadata | null) => {
  const payload = assets[0]?.payload_json as Record<string, unknown> | undefined;
  const title = toNullableString(payload?.title ?? source?.primaryVideo?.title);
  return title;
};

export const buildRecommendationFromLibrary = (
  strategies: StrategyLibraryRow[],
  context: {
    campaignObjective?: string | null;
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    clientSegment?: string | null;
    funnelStage?: string | null;
  },
  product: ProductRow | null,
) => {
  const scored = sortRecommendations(
    strategies.map((strategy) =>
      toRecommendationItemFromLibrary(strategy, product, {
        productContext: context.productContext,
        serviceContext: context.serviceContext,
        audienceContext: context.audienceContext,
        funnelStage: context.funnelStage,
      }),
    ),
  );
  const primary = scored[0] ?? null;
  const alternatives = scored.filter((item) => item.id !== primary?.id).slice(0, 2);
  const planB = scored.find((item) => item.fitBand === "not_recommended") ?? scored[scored.length - 1] ?? null;
  const actionPlan = buildCampaignActionPlan(primary, context, product);

  return {
    primary,
    alternatives,
    contingency: planB,
    planB,
    strategyOptions: scored,
    actionPlan,
  } satisfies StrategyRecommendation;
};

export const persistStrategyIntelligenceFromYoutubeAnalysis = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  sourceAnalysisId: string;
  sourceAnalysisVersion?: number | null;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const analysis = await findYoutubeStrategyAnalysisById(input.sourceAnalysisId);
  if (!analysis) {
    throw createError("NOT_FOUND", "Youtube strategy analysis not found", 404);
  }

  const payload = analysis.payload_json as YoutubeStrategyPayloadLike;
  const draft = await buildDraftFromYoutubePayload({
    client,
    sourceAnalysisId: analysis.id,
    sourceAnalysisVersion: input.sourceAnalysisVersion ?? analysis.version,
    payload,
  });

  const result = await createStrategyIntelligenceVersion({
    clientId: client.id,
    sourceAnalysisId: analysis.id,
    status: "active",
    assets: draft.assets,
  });

  await syncStrategyLibraryFromAssets(await listAllStrategyIntelligenceAssets());
  const libraryStrategies = await listStrategyLibraryStrategies();
  const latestAssets = await listLatestStrategyIntelligenceAssetsByClientId(client.id);
  const recommendation = buildRecommendationFromLibrary(
    libraryStrategies,
    {
      funnelStage: draft.payload.context.funnelStage,
    },
    null,
  );
  const source = buildStrategySourceMetadata(draft.payload.source);
  const title = toNullableString(draft.payload.title);

  return {
    client,
    title,
    latestVersion: result.version,
    assets: latestAssets,
    evidence: buildStrategyEvidencePayload(latestAssets),
    recommendation,
    activeProduct: null,
    source,
    payload: {
      ...draft.payload,
      strategyLibrary: {
        version: result.version,
        source: {
          analysisId: analysis.id,
          analysisVersion: input.sourceAnalysisVersion ?? analysis.version,
        },
        assets: libraryStrategies.map((strategy) => ({
          id: strategy.id,
          strategyKey: strategy.strategy_key,
          strategyName: strategy.strategy_name,
          strategySummary: strategy.strategy_summary,
          fitBand: strategy.fit_band,
          sourceCount: strategy.source_count,
          canonicalObjective: strategy.canonical_objective,
          canonicalFunnelStage: strategy.canonical_funnel_stage,
          fitSignals: strategy.fit_signals,
          lastSourceAnalysisId: strategy.last_source_analysis_id,
          lastSourceClientId: strategy.last_source_client_id,
          lastSeenAt: strategy.last_seen_at,
        })),
      },
      strategyIntelligence: {
        version: result.version,
        title,
        assets: result.assets.map((asset) => asset.payload_json),
        recommendation: {
          ...recommendation,
        },
        source,
      },
      strategyEvidence: buildStrategyEvidencePayload(result.assets),
    },
  };
};

export const listStrategyIntelligenceForClient = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const assets = await listStrategyIntelligenceAssetsByClientId(client.id, 50);
  const latestAssets = await listLatestStrategyIntelligenceAssetsByClientId(client.id);
  const activeProduct = await chooseActiveProduct(client.id);
  await syncStrategyLibraryFromAssets(await listAllStrategyIntelligenceAssets());
  const strategyLibrary = await listStrategyLibraryStrategies();
  const recommendation = buildRecommendationFromLibrary(strategyLibrary, {}, activeProduct);
  const latestVersion = Number((await findLatestStrategyIntelligenceVersionByClientId(client.id))?.version ?? 0);
  const source = buildSourceMetadataFromAssets(latestAssets);
  const title = buildStrategyRecordTitleFromAssets(latestAssets, source);

  return {
    client,
    title,
    assets,
    latestVersion,
    evidence: buildStrategyEvidencePayload(latestAssets),
    recommendation,
    activeProduct,
    source,
    payload: {
      strategyLibrary: {
        version: latestVersion || null,
        assets: strategyLibrary.map((strategy) => ({
          id: strategy.id,
          strategyKey: strategy.strategy_key,
          strategyName: strategy.strategy_name,
          strategySummary: strategy.strategy_summary,
          fitBand: strategy.fit_band,
          sourceCount: strategy.source_count,
          canonicalObjective: strategy.canonical_objective,
          canonicalFunnelStage: strategy.canonical_funnel_stage,
          fitSignals: strategy.fit_signals,
          lastSourceAnalysisId: strategy.last_source_analysis_id,
          lastSourceClientId: strategy.last_source_client_id,
          lastSeenAt: strategy.last_seen_at,
        })),
      },
      strategyIntelligence: {
        version: latestVersion || null,
        title,
        assets: latestAssets.map((asset) => asset.payload_json),
        recommendation,
        source,
      },
      strategyEvidence: buildStrategyEvidencePayload(latestAssets),
    },
  };
};

export const recommendStrategyForClient = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  productId?: string;
  campaignObjective?: string;
  productContext?: string;
  serviceContext?: string;
  audienceContext?: string;
  funnelStage?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await syncStrategyLibraryFromAssets(await listAllStrategyIntelligenceAssets());
  const strategyLibrary = await listStrategyLibraryStrategies();
  const latestAssets = await listLatestStrategyIntelligenceAssetsByClientId(client.id);
  const activeProduct = await chooseActiveProduct(client.id, input.productId ?? null);
  const recommendation = buildRecommendationFromLibrary(
    strategyLibrary,
    {
      campaignObjective: input.campaignObjective,
      productContext: input.productContext,
      serviceContext: input.serviceContext,
      audienceContext: input.audienceContext,
      clientSegment: client.segment,
      funnelStage: input.funnelStage,
    },
    activeProduct,
  );
  const latestVersion = Number((await findLatestStrategyIntelligenceVersionByClientId(client.id))?.version ?? 0);
  const source = buildSourceMetadataFromAssets(latestAssets);
  const title = buildStrategyRecordTitleFromAssets(latestAssets, source);

  return {
    client,
    title,
    latestVersion,
    recommendation,
    assets: latestAssets,
    evidence: buildStrategyEvidencePayload(latestAssets),
    activeProduct,
    source,
    payload: {
      strategyLibrary: {
        version: latestVersion || null,
        assets: strategyLibrary.map((strategy) => ({
          id: strategy.id,
          strategyKey: strategy.strategy_key,
          strategyName: strategy.strategy_name,
          strategySummary: strategy.strategy_summary,
          fitBand: strategy.fit_band,
          sourceCount: strategy.source_count,
          canonicalObjective: strategy.canonical_objective,
          canonicalFunnelStage: strategy.canonical_funnel_stage,
          fitSignals: strategy.fit_signals,
          lastSourceAnalysisId: strategy.last_source_analysis_id,
          lastSourceClientId: strategy.last_source_client_id,
          lastSeenAt: strategy.last_seen_at,
        })),
      },
      strategyEvidence: buildStrategyEvidencePayload(latestAssets),
      strategyRecommendation: recommendation,
      strategySource: source,
      title,
    },
  };
};

export const buildRecommendationFromAssets = (
  assets: StrategyIntelligenceRow[],
  context: {
    campaignObjective?: string | null;
    productContext?: string | null;
    serviceContext?: string | null;
    audienceContext?: string | null;
    clientSegment?: string | null;
    funnelStage?: string | null;
  },
  product: ProductRow | null,
) => {
  const scored = sortRecommendations(assets.map((asset) => toRecommendationItem(asset, product, context)));
  const primary = scored[0] ?? null;
  const alternatives = scored.filter((item) => item.id !== primary?.id).slice(0, 2);
  const planB = scored.find((item) => item.kind === "plan_b" && item.id !== primary?.id) ?? scored[scored.length - 1] ?? null;
  const actionPlan = buildCampaignActionPlan(primary, context, product);

  return {
    primary,
    alternatives,
    contingency: planB,
    planB,
    strategyOptions: scored,
    actionPlan,
  } satisfies StrategyRecommendation;
};

export const getStrategyIntelligenceByAssetId = async (input: {
  userId: string;
  agencyId: string;
  assetId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const asset = await findStrategyIntelligenceAssetById(input.assetId);

  if (!asset) {
    throw createError("NOT_FOUND", "Strategy intelligence asset not found", 404);
  }

  const client = await findClientById(input.agencyId, asset.client_id);
  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const source = buildStrategySourceMetadata((asset.payload_json as Record<string, unknown> | undefined)?.source);
  const title = toNullableString((asset.payload_json as Record<string, unknown> | undefined)?.title ?? source?.primaryVideo?.title);

  return {
    client,
    asset,
    title,
    source,
  };
};

export type {
  StrategyIntelligenceResponse,
  StrategyRecommendation,
  StrategyRecommendationItem,
  StrategySlot,
  YoutubeStrategyPayloadLike,
};
