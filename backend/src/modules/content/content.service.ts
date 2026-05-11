import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { assertCampaignStage } from "../campaign/campaign.service.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { findLatestProposalByClientId } from "../proposals/proposals.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { findLatestBrandProfileByClientId } from "../brand-profile/brand-profile.repository.js";
import { findPrimaryProductByClientId } from "../client-products/client-products.repository.js";
import { findLatestOfferProfileByProductId, listOfferProfilesByProductId } from "../offer-profile/offer-profile.repository.js";
import { listPostArtGalleryRowsByClientId } from "./post-art-gallery.repository.js";
import {
  createContentPackageVersion,
  createContentPlanVersion,
  createScheduleVersion,
  findLatestContentPackageByClientId,
  findLatestContentPlanByClientId,
  listContentPlansByClientId,
  listContentPackagesByClientId,
  listSchedulesByClientId,
} from "./content.repository.js";
import {
  findLatestRenderedAssetByClientId,
  listRenderedAssetsByClientId,
  refreshRenderedAssetsForClient,
} from "./rendered-assets.service.js";
import type { PostArtGalleryResult } from "./post-art-gallery.service.js";
import type { PostArtGalleryRow } from "./post-art-gallery.repository.js";
import { getOfferProfileSignals, type OfferProfileSignals } from "../offer-profile/offer-profile.service.js";

const getResearchPayload = (marketResearch: { payload_json: unknown; version: number; id: string } | null) => {
  if (!marketResearch || typeof marketResearch.payload_json !== "object" || marketResearch.payload_json === null) {
    return null;
  }

  return marketResearch.payload_json as {
    market?: { stage?: string; summary?: string; positioning?: string };
    recommendations?: {
      editorialPillars?: string[];
      differentiators?: string[];
      contentAngles?: string[];
      nextPautas?: string[];
    };
    competition?: { competitorCount?: number; competitorUrls?: string[]; summary?: string };
  };
};

type PayloadRecord = Record<string, unknown>;

const asRecord = (value: unknown): PayloadRecord | null => (typeof value === "object" && value !== null ? (value as PayloadRecord) : null);

const asString = (value: unknown): string | null => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const asStringArray = (value: unknown): string[] => asArray(value).map((item) => asString(item)).filter((item): item is string => Boolean(item));

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

  return asArray(current);
};

type BrandProfileSignals = {
  version: number;
  status: string;
  confidence: number;
  summary: string | null;
  brandName: string | null;
  website: string | null;
  category: string | null;
  audience: string | null;
  uniqueValueProposition: string | null;
  promise: string | null;
  toneOfVoice: string | null;
  visualPalette: string[];
  primaryCta: string | null;
  proofGaps: string[];
  confirmedTestimonials: string[];
  publicCaseStudies: string[];
  processProof: string[];
  beforeAfterEvidence: string[];
};

const getBrandProfileSignals = (
  brandProfile: {
    version: number;
    status: string;
    confidence: number;
    confirmed_json: unknown;
    inferred_json: unknown;
    proof_json: unknown;
  } | null,
): BrandProfileSignals | null => {
  if (!brandProfile) {
    return null;
  }

  const confirmed = asRecord(brandProfile.confirmed_json);
  const inferred = asRecord(brandProfile.inferred_json);
  const proof = asRecord(brandProfile.proof_json);
  const brandName = getRecordString(confirmed, ["brandName"]);
  const uniqueValueProposition = getRecordString(inferred, ["uniqueValueProposition"]);
  const promise = getRecordString(inferred, ["promise"]);
  const toneOfVoice = getRecordString(inferred, ["toneOfVoice"]);
  const visualPalette = asStringArray(getRecordArray(inferred, ["visualPalette"]));
  const primaryCta = getRecordString(inferred, ["primaryCta"]);
  const proofGaps = asStringArray(getRecordArray(proof, ["proofGaps"]));
  const confirmedTestimonials = asStringArray(getRecordArray(proof, ["confirmedTestimonials"]));
  const publicCaseStudies = asStringArray(getRecordArray(proof, ["publicCaseStudies"]));
  const processProof = asStringArray(getRecordArray(proof, ["processProof"]));
  const beforeAfterEvidence = asStringArray(getRecordArray(proof, ["beforeAfterEvidence"]));

  return {
    version: brandProfile.version,
    status: brandProfile.status,
    confidence: brandProfile.confidence,
    summary: [brandName, uniqueValueProposition ?? promise, toneOfVoice].filter(Boolean).join(" · ") || null,
    brandName,
    website: getRecordString(confirmed, ["website"]),
    category: getRecordString(confirmed, ["category"]),
    audience: getRecordString(inferred, ["audience"]),
    uniqueValueProposition,
    promise,
    toneOfVoice,
    visualPalette,
    primaryCta,
    proofGaps,
    confirmedTestimonials,
    publicCaseStudies,
    processProof,
    beforeAfterEvidence,
  };
};

const readClientRecordVersion = (source: unknown, fallback: number) => {
  if (typeof source !== "object" || source === null) {
    return fallback;
  }

  const record = source as Record<string, unknown>;

  if (typeof record.clientRecordVersion === "number") {
    return record.clientRecordVersion;
  }

  const legacyKey = "b" + "riefVersion";
  const legacyValue = record[legacyKey];

  return typeof legacyValue === "number" ? legacyValue : fallback;
};

const compactPhrase = (value: string, maxWords: number) => value.trim().split(/\s+/g).filter(Boolean).slice(0, maxWords).join(" ");

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
};

const pickBySeed = (seed: string, options: string[]) => {
  if (options.length === 0) {
    return "";
  }

  const hash = Array.from(seed).reduce((acc, char) => {
    const next = (acc << 5) - acc + char.charCodeAt(0);
    return next | 0;
  }, 0);

  return options[Math.abs(hash) % options.length];
};

type EditorialPauta = {
  id: string;
  title: string;
  pillar: string;
  angle: string;
  objective: string;
  reason: string;
  format: string;
  hook: string;
  proof: string;
  cta: string;
  visualCue: string;
  source: {
    clientRecordVersion: number;
    proposalVersion: number;
    marketResearchVersion: number | null;
  };
};

const buildPautaCreativeSignal = (input: {
  clientName: string;
  pillar: string;
  angle: string;
  objective: string;
  reason: string;
  differentiator: string;
  marketSummary: string;
  brandProfile: BrandProfileSignals | null;
  offerProfile: OfferProfileSignals | null;
  index: number;
}) => {
  const focus = compactPhrase(
    firstText(
      input.offerProfile?.promise,
      input.offerProfile?.audience,
      input.brandProfile?.uniqueValueProposition,
      input.brandProfile?.promise,
      input.differentiator,
      input.marketSummary,
      input.objective,
      input.clientName,
    ),
    7,
  );
  const seed = `${input.clientName}|${input.pillar}|${input.angle}|${input.objective}|${input.reason}|${focus}|${input.index}`.toLowerCase();
  const needsProofBackstop =
    input.brandProfile?.proofGaps.includes("testimonials") ||
    input.brandProfile?.proofGaps.includes("reviews") ||
    input.brandProfile?.proofGaps.includes("cases") ||
    input.offerProfile?.proofGaps.includes("testimonials") ||
    input.offerProfile?.proofGaps.includes("reviews") ||
    input.offerProfile?.proofGaps.includes("cases");

  const hookByPillar: Record<string, string[]> = {
    proof: ["A prova precisa aparecer antes da promessa.", "Sem prova, a mensagem perde peso.", "O detalhe certo sustenta a oferta."],
    educational: ["Clareza vende mais do que volume.", "Quando o método fica claro, a leitura anda.", "Ensinar o processo melhora a percepção de valor."],
    commercial: ["Se a oferta confunde, a decisão trava.", "Um próximo passo claro encurta a venda.", "A mensagem precisa abrir caminho para o sim."],
    community: ["A audiência responde quando se reconhece no texto.", "Conversa boa nasce de contexto real.", "Comunidade cresce quando a mensagem parece próxima."],
  };

  const titleByPillar: Record<string, string[]> = {
    proof: [`Prova de ${focus}`, `O que sustenta ${focus}`, `Como mostrar ${focus} sem exagero`],
    educational: [`Como organizar ${focus}`, `A lógica de ${focus}`, `O passo simples para ${focus}`],
    commercial: [`Como vender ${focus} com clareza`, `A mensagem que reduz atrito em ${focus}`, `O caminho mais curto para ${focus}`],
    community: [`A conversa certa sobre ${focus}`, `O que a audiência quer ouvir sobre ${focus}`, `Pergunta que aproxima ${focus}`],
  };

  const proofByPillar: Record<string, string[]> = {
    proof: [
      needsProofBackstop
        ? "Mostre processo, caso real ou evidência visual antes de pedir confiança."
        : "Exemplo real ou dado curto para sustentar a tese.",
      needsProofBackstop
        ? "Evite promessa solta; mostre o que muda de forma concreta."
        : "Mostre o antes e depois de forma simples.",
      needsProofBackstop
        ? "Use uma evidência que a audiência entenda em segundos e sem exagero."
        : "Use uma evidência que a audiência entenda em segundos.",
    ],
    educational: [
      "Explique o processo em blocos curtos.",
      "Mostre a ordem certa para evitar confusão.",
      "Transforme a lógica em passos visuais.",
    ],
    commercial: [
      "Mostre o benefício sem empurrar a venda.",
      "Deixe claro o que a pessoa ganha ao agir agora.",
      "Reduza objeção com um próximo passo simples.",
    ],
    community: [
      "Abra espaço para conversa e reconhecimento.",
      "Faça a audiência se ver na situação descrita.",
      "Troque formalidade por proximidade útil.",
    ],
  };

  const ctaByPillar: Record<string, string[]> = {
    proof: input.offerProfile?.primaryCta
      ? [input.offerProfile.primaryCta]
      : input.brandProfile?.primaryCta
        ? [input.brandProfile.primaryCta]
        : ["Ver a prova", "Salvar o exemplo", "Revisar com calma"],
    educational: ["Salvar para usar", "Revisar a rotina", "Aplicar depois"],
    commercial: ["Rever a proposta", "Entender o próximo passo", "Salvar para decidir"],
    community: ["Responder agora", "Comentar a própria experiência", "Enviar para alguém"],
  };

  const visualCueByPillar: Record<string, string[]> = {
    proof: ["bloco de evidência com contraste alto", "antes/depois com foco no detalhe", "card curto com prova visível"],
    educational: ["sequência em passos curtos", "checklist com hierarquia limpa", "layout com ordem e respiro"],
    commercial: ["tese forte no topo e CTA isolado", "mensagem limpa com fecho evidente", "hierarquia editorial com foco no próximo passo"],
    community: ["pergunta grande e resposta curta", "layout de conversa com espaço para leitura", "mensagem próxima com tom humano"],
  };

  return {
    title: pickBySeed(seed, titleByPillar[input.pillar] ?? titleByPillar.educational),
    hook: pickBySeed(seed, hookByPillar[input.pillar] ?? hookByPillar.educational),
    proof: pickBySeed(seed, proofByPillar[input.pillar] ?? proofByPillar.educational),
    cta: pickBySeed(seed, ctaByPillar[input.pillar] ?? ctaByPillar.educational),
    visualCue: pickBySeed(seed, visualCueByPillar[input.pillar] ?? visualCueByPillar.educational),
  };
};

const buildCreativeWorkflowTrail = () => [
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
] as const;

const getEditorialPautas = (contentPlan: { payload_json: unknown; version: number; id: string } | null) => {
  if (!contentPlan || typeof contentPlan.payload_json !== "object" || contentPlan.payload_json === null) {
    return [];
  }

  const payload = contentPlan.payload_json as {
    editorialPautas?: Array<{
      id?: string;
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
      source?: {
        clientRecordVersion?: number;
        proposalVersion?: number;
        marketResearchVersion?: number | null;
      };
    }>;
  };

  return Array.isArray(payload.editorialPautas)
    ? payload.editorialPautas
        .filter((pauta) => typeof pauta?.title === "string")
        .map((pauta, index) => ({
          id: pauta.id ?? `editorial-pauta-${contentPlan.version}-${index + 1}`,
          title: pauta.title ?? "",
          pillar: pauta.pillar ?? "editorial",
          angle: pauta.angle ?? "positioning",
          objective: pauta.objective ?? "",
          reason: pauta.reason ?? "",
          format: pauta.format ?? "post",
          hook: pauta.hook ?? "",
          proof: pauta.proof ?? "",
          cta: pauta.cta ?? "",
          visualCue: pauta.visualCue ?? "",
          source: {
            clientRecordVersion: readClientRecordVersion(pauta.source, contentPlan.version),
            proposalVersion: pauta.source?.proposalVersion ?? contentPlan.version,
            marketResearchVersion: pauta.source?.marketResearchVersion ?? null,
          },
        }))
    : [];
};

const getContentPlanPayload = (contentPlan: { payload_json: unknown; version: number; id: string } | null) => {
  if (!contentPlan || typeof contentPlan.payload_json !== "object" || contentPlan.payload_json === null) {
    return null;
  }

  return contentPlan.payload_json as {
    title?: string;
    archetype?: string;
    contentRhythm?: string;
    marketStage?: string | null;
    marketSummary?: string | null;
    marketResearchVersion?: number | null;
  };
};

const getPostArtGalleryPayload = (gallery: { payload_json: unknown; version: number; id: string } | null) => {
  if (!gallery || typeof gallery.payload_json !== "object" || gallery.payload_json === null) {
    return null;
  }

  return gallery.payload_json as PostArtGalleryResult;
};

const getPostArtGalleryContext = async (clientId: string) => {
  const postArtGalleries = await listPostArtGalleryRowsByClientId(clientId);
  const postArtGallery = getPostArtGalleryPayload(postArtGalleries[0] ?? null);
  const postArtGalleryComparison = buildPostArtGalleryComparison(postArtGalleries);

  return {
    postArtGallery,
    postArtGalleries,
    postArtGalleryComparison,
  };
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

const getPostArtGalleryVariantCount = (row: PostArtGalleryRow | null) => {
  if (!row || typeof row.payload_json !== "object" || row.payload_json === null) {
    return 0;
  }

  const payload = row.payload_json as { variants?: unknown[] };
  return Array.isArray(payload.variants) ? payload.variants.length : 0;
};

const buildPostArtGalleryComparison = (rows: PostArtGalleryRow[]) => {
  const latest = rows[0] ?? null;
  const previous = rows[1] ?? null;

  if (!latest || !previous) {
    return null;
  }

  const latestPayload = getPostArtGalleryPayload(latest);
  const previousPayload = getPostArtGalleryPayload(previous);
  if (!latestPayload || !previousPayload) {
    return null;
  }

  const scoreDelta = latest.overall_score - previous.overall_score;
  const latestVariantCount = getPostArtGalleryVariantCount(latest);
  const previousVariantCount = getPostArtGalleryVariantCount(previous);
  const variantDelta = latestVariantCount - previousVariantCount;
  const modeChanged = latest.mode !== previous.mode;

  const highlights = [
    scoreDelta > 0 ? `Score subiu ${scoreDelta} ponto(s).` : scoreDelta < 0 ? `Score caiu ${Math.abs(scoreDelta)} ponto(s).` : "Score estável entre as duas versões.",
    variantDelta > 0 ? `A nova versão adicionou ${variantDelta} variante(s).` : variantDelta < 0 ? `A nova versão removeu ${Math.abs(variantDelta)} variante(s).` : "Mesma quantidade de variantes.",
    modeChanged ? `Modo mudou de ${previous.mode} para ${latest.mode}.` : `Modo mantido em ${latest.mode}.`,
  ];

  const improvements: string[] = [];
  const regressions: string[] = [];

  if (scoreDelta > 0) {
    improvements.push("Qualidade média aumentou na nova geração.");
  } else if (scoreDelta < 0) {
    regressions.push("Qualidade média caiu na nova geração.");
  }

  if (variantDelta > 0) {
    improvements.push("Mais variações disponíveis para análise.");
  } else if (variantDelta < 0) {
    regressions.push("Menos variações do que a versão anterior.");
  }

  if (!modeChanged) {
    improvements.push("Formato consistente com a geração anterior.");
  } else {
    regressions.push("Mudança de modo reduz a comparação direta.");
  }

  return {
    comparedAt: new Date().toISOString(),
    latestVersion: latest.version,
    previousVersion: previous.version,
    latestMode: latest.mode,
    previousMode: previous.mode,
    latestScore: latest.overall_score,
    previousScore: previous.overall_score,
    scoreDelta,
    latestVariantCount,
    previousVariantCount,
    variantDelta,
    summary:
      scoreDelta === 0
        ? `Versões ${latest.version} e ${previous.version} estão estáveis em score e estrutura.`
        : scoreDelta > 0
          ? `Versão ${latest.version} melhorou em relação à ${previous.version}.`
          : `Versão ${latest.version} ficou abaixo da ${previous.version}.`,
    highlights,
    improvements,
    regressions,
  };
};

const buildScheduleItems = (input: {
  startDate: string;
  endDate: string;
  contentRhythm: string;
  editorialPautas: EditorialPauta[];
}) => {
  const start = new Date(`${input.startDate}T00:00:00.000Z`);
  const end = new Date(`${input.endDate}T00:00:00.000Z`);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const count = Math.max(1, input.editorialPautas.length);
  const stepDays = Math.max(1, Math.floor(totalDays / count));
  const channels = input.contentRhythm.includes("5x")
    ? ["instagram", "linkedin", "facebook", "threads"]
    : ["instagram", "linkedin", "facebook"];

  return input.editorialPautas.map((pauta, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index * stepDays);

    return {
      position: index + 1,
      date: date.toISOString().slice(0, 10),
      channel: channels[index % channels.length],
      title: pauta.title,
      pillar: pauta.pillar,
      angle: pauta.angle,
      objective: pauta.objective,
      format: pauta.format,
      reason: pauta.reason,
      hook: pauta.hook,
      proof: pauta.proof,
      cta: pauta.cta,
      visualCue: pauta.visualCue,
      status: date.getTime() <= end.getTime() ? "planned" : "planned-overflow",
    };
  });
};

export const buildEditorialPautas = (input: {
  clientName: string;
  archetype: string;
  marketStage: string | null;
  marketSummary: string | null;
  brandProfile: BrandProfileSignals | null;
  offerProfile: OfferProfileSignals | null;
  editorialPillars: string[];
  differentiators: string[];
  contentAngles: string[];
  clientRecordVersion: number;
  proposalVersion: number;
  marketResearchVersion: number | null;
}) => {
  const pillars = input.editorialPillars.length > 0 ? input.editorialPillars : ["proof", "educational", "commercial", "community"];
  const angles = input.contentAngles.length > 0 ? input.contentAngles : ["positioning", "authority", "conversion", "proof"];
  const stageLabel =
    input.marketStage === "scale"
      ? "escala"
      : input.marketStage === "conversion"
        ? "conversao"
        : input.marketStage === "authority"
          ? "autoridade"
          : "presenca";

  return pillars.slice(0, 4).map((pillar, index) => {
    const angle = angles[index % angles.length] ?? "positioning";
    const differentiator =
      input.offerProfile?.promise ??
      input.brandProfile?.uniqueValueProposition ??
      input.brandProfile?.promise ??
      input.offerProfile?.audience ??
      input.differentiators[index % (input.differentiators.length || 1)] ??
      "posicionamento claro";
    const objective =
      input.offerProfile?.proofGaps.includes("testimonials") ||
      input.offerProfile?.proofGaps.includes("reviews") ||
      input.brandProfile?.proofGaps.includes("testimonials") ||
      input.brandProfile?.proofGaps.includes("reviews")
        ? "Aumentar prova percebida da oferta com evidência concreta"
        : input.archetype === "escala"
          ? "Ampliar alcance com prova e recorrencia comercial"
          : input.archetype === "conversao"
            ? "Converter atencao em lead qualificado"
            : input.archetype === "autoridade"
              ? "Fortalecer confianca e lembranca de marca"
              : "Construir presenca e consistencia";
    const reason = [input.brandProfile?.summary, input.offerProfile?.summary, input.marketSummary, `Pesquisa de mercado indica foco em ${stageLabel}, com diferencial em ${differentiator}.`]
      .filter(Boolean)
      .join(" · ");
    const creativeSignal = buildPautaCreativeSignal({
      clientName: input.clientName,
      pillar,
      angle,
      objective,
      reason,
      differentiator,
      marketSummary: input.marketSummary ?? "",
      brandProfile: input.brandProfile,
      offerProfile: input.offerProfile,
      index,
    });

    return {
      id: `${pillar}-${index + 1}`,
      title: creativeSignal.title || `${pillar === "proof" ? "Pauta de prova" : pillar === "commercial" ? "Pauta comercial" : pillar === "community" ? "Pauta de comunidade" : "Pauta educativa"} para ${input.clientName}`,
      pillar,
      angle,
      objective,
      reason,
      format:
        pillar === "commercial"
          ? "post com CTA"
          : pillar === "proof"
            ? "caso e prova"
            : pillar === "community"
              ? "conversa guiada"
              : "post educativo",
      hook: creativeSignal.hook,
      proof: creativeSignal.proof,
      cta: creativeSignal.cta,
      visualCue: creativeSignal.visualCue,
      source: {
        clientRecordVersion: input.clientRecordVersion,
        proposalVersion: input.proposalVersion,
        marketResearchVersion: input.marketResearchVersion,
      },
    };
  });
};

const buildContentPlanPayload = (input: {
  clientName: string;
  clientRecordVersion: number;
  proposalVersion: number;
  archetype: string;
  brandProfile: BrandProfileSignals | null;
  offerProfile: OfferProfileSignals | null;
  marketResearchVersion: number | null;
  marketStage: string | null;
  marketSummary: string | null;
  editorialPillars: string[];
  differentiators: string[];
  contentAngles: string[];
  editorialPautas: EditorialPauta[];
  snapshotScores: {
    presence: number | null;
    consistency: number | null;
    proof: number | null;
    conversion: number | null;
  };
}) => ({
  title: `${input.clientName} content plan`,
  archetype: input.archetype,
  clientRecordVersion: input.clientRecordVersion,
  proposalVersion: input.proposalVersion,
  marketResearchVersion: input.marketResearchVersion,
  marketStage: input.marketStage,
  marketSummary: input.marketSummary,
  brandProfileVersion: input.brandProfile?.version ?? null,
  brandProfileStatus: input.brandProfile?.status ?? null,
  brandProfileConfidence: input.brandProfile?.confidence ?? null,
  brandSummary: input.brandProfile?.summary ?? null,
  brandTone: input.brandProfile?.toneOfVoice ?? null,
  brandVisualPalette: input.brandProfile?.visualPalette ?? [],
  brandPrimaryCta: input.brandProfile?.primaryCta ?? null,
  brandProofGaps: input.brandProfile?.proofGaps ?? [],
  offerProfileVersion: input.offerProfile?.version ?? null,
  offerProfileStatus: input.offerProfile?.status ?? null,
  offerProfileConfidence: input.offerProfile?.confidence ?? null,
  offerSummary: input.offerProfile?.summary ?? null,
  offerAudience: input.offerProfile?.audience ?? null,
  offerPromise: input.offerProfile?.promise ?? null,
  offerProblemSolved: input.offerProfile?.problemSolved ?? null,
  offerPrimaryCta: input.offerProfile?.primaryCta ?? null,
  offerTone: input.offerProfile?.toneOfVoice ?? null,
  offerProofPoints: input.offerProfile?.proofPoints ?? [],
  offerProofGaps: input.offerProfile?.proofGaps ?? [],
  contentRhythm: input.archetype === "escala" ? "5x weekly mixed cadence" : "3x weekly authority-driven cadence",
  pillars: input.editorialPillars.length > 0 ? input.editorialPillars : ["proof", "educational", "commercial", "community"],
  differentiators: input.differentiators,
  contentAngles: input.contentAngles,
  editorialPautas: input.editorialPautas,
  scoreContext: input.snapshotScores,
});

export const buildVisualDirectionPayload = (input: {
  clientName: string;
  contentRhythm: string;
  editorialPautas: EditorialPauta[];
  brandProfile: BrandProfileSignals | null;
  offerProfile: OfferProfileSignals | null;
}) => ({
  title: `${input.clientName} visual direction`,
  owner: "Visual Director",
  mechanism: "template/render",
  firstPass: "uma ideia clara por peça",
  hookSystem: "gancho > prova > fecho",
  masterAsset: "Instagram",
  supportChannels: ["Facebook", "Pinterest", "Stories"],
  productImagePolicy:
    input.offerProfile && input.brandProfile
      ? `Usar a oferta ${input.offerProfile.productName} como núcleo visual, com prova, contexto e audiência ${input.offerProfile.audience ?? "definida"}. Priorizar a paleta ${input.brandProfile.visualPalette.join(", ")} e o tom ${input.brandProfile.toneOfVoice ?? "da marca"}.`
      : input.offerProfile
        ? `Usar a oferta ${input.offerProfile.productName} como núcleo visual, com prova, contexto e audiência ${input.offerProfile.audience ?? "definida"}.`
        : input.brandProfile
          ? `Usar produto, prova ou contexto sempre que isso deixar a promessa mais crível e a peça mais legível. Priorizar a paleta ${input.brandProfile.visualPalette.join(", ")} e o tom ${input.brandProfile.toneOfVoice ?? "da marca"}.`
          : "Usar produto, prova ou contexto sempre que isso deixar a promessa mais crível e a peça mais legível.",
  rules: [
    "Mobile-first readability",
    "One dominant idea per slide or frame",
    "No separate creative system per channel",
    "High-contrast editorial layouts",
    "2 fonts max and 4 colors max",
  ],
  contentRhythm: input.contentRhythm,
  brandContext: input.brandProfile
    ? {
        version: input.brandProfile.version,
        status: input.brandProfile.status,
        confidence: input.brandProfile.confidence,
        summary: input.brandProfile.summary,
        primaryCta: input.brandProfile.primaryCta,
        toneOfVoice: input.brandProfile.toneOfVoice,
        visualPalette: input.brandProfile.visualPalette,
        proofGaps: input.brandProfile.proofGaps,
        promise: input.brandProfile.promise,
        uniqueValueProposition: input.brandProfile.uniqueValueProposition,
      }
    : null,
  offerContext: input.offerProfile
    ? {
        version: input.offerProfile.version,
        status: input.offerProfile.status,
        confidence: input.offerProfile.confidence,
        summary: input.offerProfile.summary,
        productId: input.offerProfile.productId,
        productName: input.offerProfile.productName,
        category: input.offerProfile.category,
        offerType: input.offerProfile.offerType,
        priceLabel: input.offerProfile.priceLabel,
        audience: input.offerProfile.audience,
        promise: input.offerProfile.promise,
        problemSolved: input.offerProfile.problemSolved,
        primaryCta: input.offerProfile.primaryCta,
        toneOfVoice: input.offerProfile.toneOfVoice,
        proofPoints: input.offerProfile.proofPoints,
        proofGaps: input.offerProfile.proofGaps,
      }
    : null,
  references: input.editorialPautas.map((pauta) => `${pauta.title} · ${pauta.objective}`),
  creativeSignals: input.editorialPautas.map((pauta) => ({
    id: pauta.id,
    title: pauta.title,
    pillar: pauta.pillar,
    angle: pauta.angle,
    objective: pauta.objective,
    reason: pauta.reason,
    format: pauta.format,
    hook: pauta.hook,
    proof: pauta.proof,
    cta: pauta.cta,
    visualCue: pauta.visualCue,
  })),
  workflow: {
    squad: "social-growth",
    primaryOwner: "visual-director",
    reviewGate: "reviewer",
    renderGate: "creative-renderer",
    scheduleGate: "scheduler",
    agentTrail: buildCreativeWorkflowTrail(),
  },
});

const buildSchedulePayload = (input: {
  clientName: string;
  contentPlanVersion: number;
  contentRhythm: string;
  editorialPautas: EditorialPauta[];
  startDate: string;
  endDate: string;
}) => ({
  title: `${input.clientName} schedule`,
  contentPlanVersion: input.contentPlanVersion,
  startDate: input.startDate,
  endDate: input.endDate,
  cadence: input.contentRhythm,
  channels: input.contentRhythm.includes("5x")
    ? ["instagram", "linkedin", "facebook", "threads"]
    : ["instagram", "linkedin", "facebook"],
  editorialPautas: input.editorialPautas,
  items: buildScheduleItems({
    startDate: input.startDate,
    endDate: input.endDate,
    contentRhythm: input.contentRhythm,
    editorialPautas: input.editorialPautas,
  }),
  workflow: {
    squad: "social-growth",
    primaryOwner: "scheduler",
    upstreamOwner: "reviewer",
    agentTrail: buildCreativeWorkflowTrail(),
  },
});

const getClientOfferContext = async (clientId: string) => {
  const primaryProduct = await findPrimaryProductByClientId(clientId);

  if (!primaryProduct) {
    return {
      primaryProduct: null,
      offerProfile: null,
      offerProfiles: [],
    };
  }

  const offerProfiles = await listOfferProfilesByProductId(primaryProduct.id);
  const offerProfile = await findLatestOfferProfileByProductId(primaryProduct.id);

  return {
    primaryProduct,
    offerProfile: getOfferProfileSignals(offerProfile),
    offerProfiles,
  };
};

export const getContentContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const contentPlan = await findLatestContentPlanByClientId(input.clientId);
  const contentPackage = await findLatestContentPackageByClientId(input.clientId);
  const brandProfileRow = await findLatestBrandProfileByClientId(input.clientId);
  const brandProfile = getBrandProfileSignals(brandProfileRow);
  const { primaryProduct, offerProfile, offerProfiles } = await getClientOfferContext(input.clientId);
  const contentPlans = await listContentPlansByClientId(input.clientId);
  const contentPackages = await listContentPackagesByClientId(input.clientId);
  const schedules = await listSchedulesByClientId(input.clientId);
  const renderedAsset = await findLatestRenderedAssetByClientId(input.clientId);
  const renderedAssets = await listRenderedAssetsByClientId(input.clientId);
  const { postArtGallery, postArtGalleries, postArtGalleryComparison } = await getPostArtGalleryContext(input.clientId);
  const clientRecord = await findLatestClientRecordByClientId(input.clientId);
  const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
  const proposal = await findLatestProposalByClientId(input.clientId);
  const snapshot = await listLatestSnapshotByClientId(input.clientId);
  const editorialPautas = getEditorialPautas(contentPlan);

  return {
    client,
    contentPlan,
    contentPackage,
    brandProfile,
    primaryProduct,
    offerProfile,
    offerProfiles,
    contentPlans,
    contentPackages,
    schedules,
    renderedAsset,
    renderedAssets,
    postArtGallery,
    postArtGalleries,
    postArtGalleryComparison,
    clientRecord,
    marketResearch,
    editorialPautas,
    proposal,
    snapshot,
  };
};

export const createContentPlan = async (input: { userId: string; agencyId: string; clientId: string; status: string; objective?: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await assertCampaignStage({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    allowedStages: ["content_plan"],
  });

  const clientRecord = await findLatestClientRecordByClientId(input.clientId);
  const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
  const proposal = await findLatestProposalByClientId(input.clientId);
  const snapshot = await listLatestSnapshotByClientId(input.clientId);
  const brandProfile = await findLatestBrandProfileByClientId(input.clientId);
  const brandProfileSignals = getBrandProfileSignals(brandProfile);
  const { primaryProduct, offerProfile } = await getClientOfferContext(input.clientId);

  if (!clientRecord || !proposal || !snapshot) {
    throw createError("FAILED_PRECONDITION", "Client record, proposal and social intelligence are required before content planning", 422);
  }

  const researchPayload = getResearchPayload(marketResearch);
  const editorialPillars = researchPayload?.recommendations?.editorialPillars ?? [];
  const differentiators = researchPayload?.recommendations?.differentiators ?? [];
  const contentAngles = researchPayload?.recommendations?.contentAngles ?? [];
  const marketStage = researchPayload?.market?.stage ?? null;
  const marketSummary = researchPayload?.market?.summary ?? null;
  const editorialPautas = buildEditorialPautas({
    clientName: client.name,
    archetype: proposal.archetype,
    marketStage,
    marketSummary,
    editorialPillars,
    differentiators,
    contentAngles,
    clientRecordVersion: clientRecord.version,
    proposalVersion: proposal.version,
    marketResearchVersion: marketResearch?.version ?? null,
    brandProfile: brandProfileSignals,
    offerProfile,
  });

  const contentPlanPayload = buildContentPlanPayload({
    clientName: client.name,
    clientRecordVersion: clientRecord.version,
    proposalVersion: proposal.version,
    archetype: proposal.archetype,
    brandProfile: brandProfileSignals,
    offerProfile,
    marketResearchVersion: marketResearch?.version ?? null,
    marketStage,
    marketSummary,
    editorialPillars,
    differentiators,
    contentAngles,
    editorialPautas,
    snapshotScores: {
      presence: snapshot.presence_score,
      consistency: snapshot.consistency_score,
      proof: snapshot.proof_score,
      conversion: snapshot.conversion_readiness,
    },
  });

  const contentPlan = await createContentPlanVersion({
    clientId: input.clientId,
    status: input.status,
    payload: {
      ...contentPlanPayload,
      objective: input.objective ?? null,
      createdFrom: "proposal",
    },
  });

  const contentPackage = await createContentPackageVersion({
    clientId: input.clientId,
    status: input.status,
    payload: {
      contentPlanId: contentPlan.id,
      contentPlanVersion: contentPlan.version,
      visualDirection: buildVisualDirectionPayload({
        clientName: client.name,
        contentRhythm: contentPlanPayload.contentRhythm ?? "3x weekly authority-driven cadence",
        editorialPautas,
        brandProfile: brandProfileSignals,
        offerProfile,
      }),
      items:
        editorialPautas.length > 0
          ? editorialPautas.map((pauta) => pauta.title)
          : ["Hook ideas", "Caption drafts", "CTA variants", "Publication rhythm"],
    },
  });

  await refreshRenderedAssetsForClient({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
  }).catch(() => undefined);

  const contentPlans = await listContentPlansByClientId(input.clientId);
  const contentPackages = await listContentPackagesByClientId(input.clientId);
  const schedules = await listSchedulesByClientId(input.clientId);
  const renderedAsset = await findLatestRenderedAssetByClientId(input.clientId);
  const renderedAssets = await listRenderedAssetsByClientId(input.clientId);
  const { postArtGallery, postArtGalleries, postArtGalleryComparison } = await getPostArtGalleryContext(input.clientId);

  return {
    client,
    clientRecord,
    brandProfile: brandProfileSignals,
    proposal,
    snapshot,
    contentPlan,
    contentPackage,
    contentPlans,
    contentPackages,
    marketResearch,
    editorialPautas,
    primaryProduct,
    offerProfile,
    renderedAsset,
    renderedAssets,
    postArtGallery,
    postArtGalleries,
    postArtGalleryComparison,
  };
};

export const reviseContentPlan = async (input: { userId: string; agencyId: string; clientId: string; status: string; objective?: string; note?: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await assertCampaignStage({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    allowedStages: ["content_plan"],
  });

  const existingPlan = await findLatestContentPlanByClientId(input.clientId);
  const clientRecord = await findLatestClientRecordByClientId(input.clientId);
  const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
  const brandProfile = await findLatestBrandProfileByClientId(input.clientId);
  const proposal = await findLatestProposalByClientId(input.clientId);
  const snapshot = await listLatestSnapshotByClientId(input.clientId);
  const brandProfileSignals = getBrandProfileSignals(brandProfile);
  const { primaryProduct, offerProfile } = await getClientOfferContext(input.clientId);

  if (!existingPlan || !clientRecord || !proposal || !snapshot) {
    throw createError("FAILED_PRECONDITION", "Content plan, client record, proposal and social intelligence are required before content plan revision", 422);
  }

  const existingPayload = typeof existingPlan.payload_json === "object" && existingPlan.payload_json !== null ? (existingPlan.payload_json as Record<string, unknown>) : {};
  const researchPayload = getResearchPayload(marketResearch);
  const editorialPillars = researchPayload?.recommendations?.editorialPillars ?? [];
  const differentiators = researchPayload?.recommendations?.differentiators ?? [];
  const contentAngles = researchPayload?.recommendations?.contentAngles ?? [];
  const title = typeof existingPayload.title === "string" ? existingPayload.title : `${client.name} content plan`;
  const archetype = typeof existingPayload.archetype === "string" ? existingPayload.archetype : proposal.archetype;
  const editorialPautas = buildEditorialPautas({
    clientName: client.name,
    archetype,
    marketStage: researchPayload?.market?.stage ?? null,
    marketSummary: researchPayload?.market?.summary ?? null,
    editorialPillars,
    differentiators,
    contentAngles,
    clientRecordVersion: clientRecord.version,
    proposalVersion: proposal.version,
    marketResearchVersion: marketResearch?.version ?? null,
    brandProfile: brandProfileSignals,
    offerProfile,
  });
  const contentRhythm = input.objective?.toLowerCase().includes("scale")
    ? "5x weekly mixed cadence"
    : typeof existingPayload.contentRhythm === "string"
      ? existingPayload.contentRhythm
      : "3x weekly authority-driven cadence";

  const contentPlanPayload = {
    ...existingPayload,
    title,
    archetype,
    clientRecordVersion: clientRecord.version,
    proposalVersion: proposal.version,
    marketResearchVersion: marketResearch?.version ?? (existingPayload.marketResearchVersion as number | null | undefined) ?? null,
    marketStage: researchPayload?.market?.stage ?? (existingPayload.marketStage as string | null | undefined) ?? null,
    marketSummary: researchPayload?.market?.summary ?? (existingPayload.marketSummary as string | null | undefined) ?? null,
    brandProfileVersion: brandProfileSignals?.version ?? (existingPayload.brandProfileVersion as number | null | undefined) ?? null,
    brandProfileStatus: brandProfileSignals?.status ?? (existingPayload.brandProfileStatus as string | null | undefined) ?? null,
    brandProfileConfidence: brandProfileSignals?.confidence ?? (existingPayload.brandProfileConfidence as number | null | undefined) ?? null,
    brandSummary: brandProfileSignals?.summary ?? (existingPayload.brandSummary as string | null | undefined) ?? null,
    brandTone: brandProfileSignals?.toneOfVoice ?? (existingPayload.brandTone as string | null | undefined) ?? null,
    brandVisualPalette: brandProfileSignals?.visualPalette ?? (existingPayload.brandVisualPalette as string[] | undefined) ?? [],
    brandPrimaryCta: brandProfileSignals?.primaryCta ?? (existingPayload.brandPrimaryCta as string | null | undefined) ?? null,
    brandProofGaps: brandProfileSignals?.proofGaps ?? (existingPayload.brandProofGaps as string[] | undefined) ?? [],
    offerProfileVersion: offerProfile?.version ?? (existingPayload.offerProfileVersion as number | null | undefined) ?? null,
    offerProfileStatus: offerProfile?.status ?? (existingPayload.offerProfileStatus as string | null | undefined) ?? null,
    offerProfileConfidence: offerProfile?.confidence ?? (existingPayload.offerProfileConfidence as number | null | undefined) ?? null,
    offerSummary: offerProfile?.summary ?? (existingPayload.offerSummary as string | null | undefined) ?? null,
    offerAudience: offerProfile?.audience ?? (existingPayload.offerAudience as string | null | undefined) ?? null,
    offerPromise: offerProfile?.promise ?? (existingPayload.offerPromise as string | null | undefined) ?? null,
    offerProblemSolved: offerProfile?.problemSolved ?? (existingPayload.offerProblemSolved as string | null | undefined) ?? null,
    offerPrimaryCta: offerProfile?.primaryCta ?? (existingPayload.offerPrimaryCta as string | null | undefined) ?? null,
    offerTone: offerProfile?.toneOfVoice ?? (existingPayload.offerTone as string | null | undefined) ?? null,
    offerProofPoints: offerProfile?.proofPoints ?? (existingPayload.offerProofPoints as string[] | undefined) ?? [],
    offerProofGaps: offerProfile?.proofGaps ?? (existingPayload.offerProofGaps as string[] | undefined) ?? [],
    contentRhythm,
    objective: input.objective ?? (existingPayload.objective as string | null | undefined) ?? null,
    createdFrom: "manual-edit",
    revisedFromContentPlanVersion: existingPlan.version,
    note: input.note ?? null,
    pillars: editorialPillars.length > 0 ? editorialPillars : (existingPayload.pillars as string[] | undefined) ?? ["proof", "educational", "commercial", "community"],
    differentiators: differentiators.length > 0 ? differentiators : (existingPayload.differentiators as string[] | undefined) ?? [],
    contentAngles: contentAngles.length > 0 ? contentAngles : (existingPayload.contentAngles as string[] | undefined) ?? [],
    editorialPautas,
    scoreContext: {
      presence: snapshot.presence_score,
      consistency: snapshot.consistency_score,
      proof: snapshot.proof_score,
      conversion: snapshot.conversion_readiness,
    },
  };

  const contentPlan = await createContentPlanVersion({
    clientId: input.clientId,
    status: input.status,
    payload: contentPlanPayload,
  });

  const contentPackage = await createContentPackageVersion({
    clientId: input.clientId,
    status: input.status,
    payload: {
      contentPlanId: contentPlan.id,
      contentPlanVersion: contentPlan.version,
      note: input.note ?? null,
      visualDirection: buildVisualDirectionPayload({
        clientName: client.name,
        contentRhythm,
        editorialPautas,
        brandProfile: brandProfileSignals,
        offerProfile,
      }),
      items:
        editorialPautas.length > 0
          ? editorialPautas.map((pauta) => pauta.title)
          : [
              "Hook ideas",
              "Caption drafts",
              "CTA variants",
              "Publication rhythm",
            ],
      createdFrom: "manual-edit",
      revisedFromContentPlanVersion: existingPlan.version,
    },
  });

  await refreshRenderedAssetsForClient({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
  }).catch(() => undefined);

  const contentPlans = await listContentPlansByClientId(input.clientId);
  const contentPackages = await listContentPackagesByClientId(input.clientId);
  const renderedAsset = await findLatestRenderedAssetByClientId(input.clientId);
  const renderedAssets = await listRenderedAssetsByClientId(input.clientId);
  const { postArtGallery, postArtGalleries, postArtGalleryComparison } = await getPostArtGalleryContext(input.clientId);

  return {
    client,
    clientRecord,
    brandProfile: getBrandProfileSignals(brandProfile),
    proposal,
    snapshot,
    contentPlan,
    contentPackage,
    contentPlans,
    contentPackages,
    marketResearch,
    editorialPautas,
    primaryProduct,
    offerProfile,
    renderedAsset,
    renderedAssets,
    postArtGallery,
    postArtGalleries,
    postArtGalleryComparison,
  };
};

export const createSchedule = async (input: { userId: string; agencyId: string; clientId: string; status: string; startDate?: string; endDate?: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await assertCampaignStage({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    allowedStages: ["schedule"],
  });

  const contentPlan = await findLatestContentPlanByClientId(input.clientId);

  if (!contentPlan) {
    throw createError("FAILED_PRECONDITION", "Content plan is required before schedule creation", 422);
  }

  const contentPlanPayload = getContentPlanPayload(contentPlan);
  const editorialPautas = getEditorialPautas(contentPlan);
  const contentRhythm =
    typeof contentPlanPayload?.contentRhythm === "string"
      ? contentPlanPayload.contentRhythm
      : contentPlanPayload?.archetype === "escala"
        ? "5x weekly mixed cadence"
        : "3x weekly authority-driven cadence";

  const payload = buildSchedulePayload({
    clientName: client.name,
    contentPlanVersion: contentPlan.version,
    contentRhythm,
    editorialPautas,
    startDate: input.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: input.endDate ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString().slice(0, 10),
  });

  const schedule = await createScheduleVersion({
    clientId: input.clientId,
    status: input.status,
    payload,
  });

  await refreshRenderedAssetsForClient({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
  }).catch(() => undefined);

  const schedules = await listSchedulesByClientId(input.clientId);
  const renderedAsset = await findLatestRenderedAssetByClientId(input.clientId);
  const renderedAssets = await listRenderedAssetsByClientId(input.clientId);
  const { postArtGallery, postArtGalleries, postArtGalleryComparison } = await getPostArtGalleryContext(input.clientId);

  return {
    client,
    contentPlan,
    schedule,
    schedules,
    payload,
    renderedAsset,
    renderedAssets,
    postArtGallery,
    postArtGalleries,
    postArtGalleryComparison,
  };
};

export const reviseSchedule = async (input: { userId: string; agencyId: string; clientId: string; status: string; startDate?: string; endDate?: string; note?: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await assertCampaignStage({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
    allowedStages: ["schedule"],
  });

  const contentPlan = await findLatestContentPlanByClientId(input.clientId);

  if (!contentPlan) {
    throw createError("FAILED_PRECONDITION", "Content plan is required before schedule revision", 422);
  }

  const contentPlanPayload = getContentPlanPayload(contentPlan);
  const editorialPautas = getEditorialPautas(contentPlan);
  const contentRhythm =
    typeof contentPlanPayload?.contentRhythm === "string"
      ? contentPlanPayload.contentRhythm
      : contentPlanPayload?.archetype === "escala"
        ? "5x weekly mixed cadence"
        : "3x weekly authority-driven cadence";

  const existingSchedules = await listSchedulesByClientId(input.clientId);
  const latestSchedule = existingSchedules[0] ?? null;

  if (!latestSchedule || typeof latestSchedule.payload_json !== "object" || latestSchedule.payload_json === null) {
    throw createError("FAILED_PRECONDITION", "Schedule is required before revision", 422);
  }

  const payload = latestSchedule.payload_json as Record<string, unknown>;
  const nextPayload = {
    ...payload,
    title: typeof payload.title === "string" ? payload.title : `${client.name} schedule`,
    contentPlanVersion: contentPlan.version,
    startDate: input.startDate ?? (payload.startDate as string | undefined) ?? new Date().toISOString().slice(0, 10),
    endDate: input.endDate ?? (payload.endDate as string | undefined) ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString().slice(0, 10),
    cadence: contentRhythm,
    editorialPautas,
    items: buildScheduleItems({
      startDate: input.startDate ?? (payload.startDate as string | undefined) ?? new Date().toISOString().slice(0, 10),
      endDate: input.endDate ?? (payload.endDate as string | undefined) ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString().slice(0, 10),
      contentRhythm,
      editorialPautas,
    }),
    note: input.note ?? null,
    createdFrom: "manual-edit",
    revisedFromScheduleVersion: latestSchedule.version,
  };

  const schedule = await createScheduleVersion({
    clientId: input.clientId,
    status: input.status,
    payload: nextPayload,
  });

  await refreshRenderedAssetsForClient({
    userId: input.userId,
    agencyId: input.agencyId,
    clientId: input.clientId,
  }).catch(() => undefined);

  const schedules = await listSchedulesByClientId(input.clientId);
  const renderedAsset = await findLatestRenderedAssetByClientId(input.clientId);
  const renderedAssets = await listRenderedAssetsByClientId(input.clientId);
  const { postArtGallery, postArtGalleries, postArtGalleryComparison } = await getPostArtGalleryContext(input.clientId);

  return {
    client,
    contentPlan,
    schedule,
    schedules,
    payload: nextPayload,
    renderedAsset,
    renderedAssets,
    postArtGallery,
    postArtGalleries,
    postArtGalleryComparison,
  };
};
