import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import {
  createYoutubeStrategyAnalysis,
  ensureYoutubeStrategyVideoStateBackfill,
  findLatestYoutubeStrategyAnalysisByClientId,
  listYoutubeStrategyAnalysesByClientId,
  listYoutubeStrategyVideoStatesByClientId,
  type YoutubeStrategyVideoStateRow,
  updateYoutubeStrategyAnalysisPayload,
  type YoutubeStrategyAnalysisRow,
  upsertYoutubeStrategyVideoState,
} from "./youtube-strategy.repository.js";
import { persistStrategyIntelligenceFromYoutubeAnalysis } from "../strategy-intelligence/strategy-intelligence.service.js";

const execFileAsync = promisify(execFile);
const transcriptPythonVenvDir = join(tmpdir(), "omniagent-youtube-transcript-stack");
const transcriptPythonBinary = join(transcriptPythonVenvDir, "bin", "python");
let transcriptPythonBootstrapPromise: Promise<string> | null = null;
const transcriptPythonValidationScript = [
  "import importlib",
  "modules = ['youtube_transcript_api', 'yt_dlp', 'faster_whisper']",
  "missing = []",
  "for module_name in modules:",
  "    try:",
  "        importlib.import_module(module_name)",
  "    except Exception:",
  "        missing.append(module_name)",
  "if missing:",
  "    raise SystemExit(1)",
].join("\n");

type TranscriptSegment = {
  startMs: number | null;
  durationMs: number | null;
  text: string;
};

type TranscriptResult = {
  status: "available" | "missing" | "error";
  languageCode: string | null;
  language: string | null;
  text: string | null;
  segmentCount: number;
  characterCount: number;
  reason: string | null;
};

type VideoAnalysis = {
  videoId: string;
  originalUrl: string;
  canonicalUrl: string;
  title: string | null;
  channelName: string | null;
  channelUrl: string | null;
  thumbnailUrl: string | null;
  transcript: TranscriptResult;
  summary: string;
  thesis: string;
  strategies: Array<{
    label: string;
    rationale: string;
    evidence: string[];
  }>;
  mechanisms: string[];
  tactics: string[];
  risks: string[];
  applicability: Array<{
    businessType: string;
    score: number;
    reason: string;
  }>;
  evidence: Array<{
    quote: string;
    reason: string;
  }>;
  processing?: {
    status: "new" | "reused" | "changed";
    reason: string;
    transcriptFingerprint: string;
    previousTranscriptFingerprint: string | null;
    previousAnalysisId: string | null;
    previousAnalysisVersion: number | null;
  };
};

type YoutubeStrategyAnalysisPayload = {
  title: string;
  context: {
    status: string;
    note: string | null;
    confidence: number;
    requestedVideoCount: number;
    analyzedVideoCount: number;
    funnelStage: string | null;
    transcriptCoverage: {
      available: number;
      missing: number;
      totalCharacters: number;
      totalSegments: number;
    };
  };
  overview: {
    executiveSummary: string;
    thesis: string;
    analysisStatus: "complete" | "partial" | "failed";
    confidence: number;
  };
  videos: VideoAnalysis[];
  synthesis: {
    commonStrategies: string[];
    commonMechanisms: string[];
    commonTactics: string[];
    risks: string[];
    recommendedBusinessTypes: Array<{
      businessType: string;
      score: number;
      reason: string;
    }>;
    lessSuitableBusinessTypes: Array<{
      businessType: string;
      score: number;
      reason: string;
    }>;
    nextTests: string[];
  };
  raw: {
    notes: string | null;
  };
  processing?: {
    hasRelevantChange: boolean;
    reusedVideoCount: number;
    changedVideoCount: number;
    newVideoCount: number;
    videos: Array<{
      videoId: string;
      canonicalUrl: string;
      status: "new" | "reused" | "changed";
      reason: string;
      transcriptFingerprint: string;
      previousTranscriptFingerprint: string | null;
      previousAnalysisId: string | null;
      previousAnalysisVersion: number | null;
    }>;
  };
  strategyLibrary?: {
    version: number | null;
    source?: {
      analysisId?: string | null;
      analysisVersion?: number | null;
      title?: string | null;
    };
    assets: Array<Record<string, unknown>>;
  };
  strategyIntelligence?: {
    version: number;
    assets: Array<Record<string, unknown>>;
    recommendation: Record<string, unknown>;
  };
};

type YoutubeVideoProcessingStatus = "new" | "reused" | "changed";

type YoutubeVideoProcessingRecord = {
  videoId: string;
  canonicalUrl: string;
  transcriptFingerprint: string;
  transcriptStatus: TranscriptResult["status"];
  transcriptCharacterCount: number;
  transcriptSegmentCount: number;
  status: YoutubeVideoProcessingStatus;
  reason: string;
  previousTranscriptFingerprint: string | null;
  previousAnalysisId: string | null;
  previousAnalysisVersion: number | null;
};

const BUSINESS_TYPE_LABELS = {
  local_business: "negocio local",
  service_business: "servico",
  physical_product: "produto fisico",
  ecommerce: "e-commerce",
  saas: "SaaS",
  b2b: "B2B",
  info_product: "infoproduto",
  creator_business: "creator business",
} as const;

const BUSINESS_TYPE_KEYWORDS: Record<keyof typeof BUSINESS_TYPE_LABELS, string[]> = {
  local_business: ["whatsapp", "agenda", "local", "bairro", "presencial", "unidade", "loja", "telefone", "visita"],
  service_business: ["servico", "consultoria", "cliente", "projeto", "reuniao", "diagnostico", "fechamento", "orçamento"],
  physical_product: ["produto", "fisico", "envio", "frete", "estoque", "catálogo", "loja", "varejo"],
  ecommerce: ["e-commerce", "commerce", "checkout", "frete", "carrinho", "sku", "catalogo", "marketplace", "loja online"],
  saas: ["saas", "software", "trial", "demo", "assinatura", "onboarding", "churn", "feature", "plataforma", "licenca"],
  b2b: ["b2b", "empresa", "corporativo", "comprador", "pipeline", "crm", "gestor", "comite", "decisor"],
  info_product: ["curso", "mentoria", "coorte", "aula", "comunidade", "lançamento", "lancamento", "infoproduto", "webinar"],
  creator_business: ["creator", "audiencia", "publico", "canal", "podcast", "youtube", "reels", "shorts", "newsletter"],
};

const STRATEGY_DEFINITIONS = [
  {
    key: "positioning",
    label: "Posicionamento",
    keywords: ["posicion", "nich", "autoridade", "categoria", "diferenci", "marca", "narrativa"],
  },
  {
    key: "offer",
    label: "Oferta",
    keywords: ["oferta", "produto", "servico", "preco", "ticket", "pacote", "garantia", "assinatura", "proposta"],
  },
  {
    key: "distribution",
    label: "Distribuicao",
    keywords: ["youtube", "instagram", "tiktok", "reels", "shorts", "seo", "ads", "anuncio", "email", "whatsapp", "parceria", "podcast"],
  },
  {
    key: "conversion",
    label: "Conversao",
    keywords: ["lead", "cta", "conversao", "fechamento", "obje", "agendamento", "checkout", "call", "demo", "funil"],
  },
  {
    key: "proof",
    label: "Prova",
    keywords: ["prova", "case", "resultado", "depoimento", "antes e depois", "metric", "numero", "dados", "evidencia"],
  },
  {
    key: "operations",
    label: "Operacao",
    keywords: ["processo", "sistema", "autom", "playbook", "cadencia", "equipe", "rotina", "execucao", "operacao"],
  },
  {
    key: "retention",
    label: "Retencao",
    keywords: ["retenc", "recorr", "recompra", "churn", "ltv", "assinatura", "comunidade", "renov"],
  },
];

const NEXT_TESTS_BY_TYPE: Record<keyof typeof BUSINESS_TYPE_LABELS, string[]> = {
  local_business: [
    "Validar a tese em uma oferta local com prova social e WhatsApp como CTA principal.",
    "Testar cortes curtos com depoimentos e agenda de atendimento para gerar conversas qualificadas.",
  ],
  service_business: [
    "Transformar a tese em um fluxo simples de diagnóstico, prova e fechamento consultivo.",
    "Usar a narrativa do case como argumento de venda e material de follow-up.",
  ],
  physical_product: [
    "Testar a narrativa em uma vitrine de produto com prova visual, comparativos e oferta clara.",
    "Avaliar se a tese sustenta bundles, upsell ou cross-sell sem depender de audiência enorme.",
  ],
  ecommerce: [
    "Converter a tese em criativos de oferta, prova e urgencia dentro do funil de checkout.",
    "Medir se a distribuicao do case suporta remarketing e rotinas de criativo recorrente.",
  ],
  saas: [
    "Adaptar a tese para demo, trial e onboarding com prova de uso e resultado.",
    "Validar se o mecanismo de crescimento depende de retenção e ativação ou apenas de awareness.",
  ],
  b2b: [
    "Reescrever a tese para venda consultiva, proof points e materiais de decisor.",
    "Testar a narrativa em pipeline com prova, objeção e ROI explícito.",
  ],
  info_product: [
    "Converter a tese em autoridade, comunidade e prova de resultado para audiência quente.",
    "Validar se o mecanismo sustenta oferta de entrada, evento ou lançamento.",
  ],
  creator_business: [
    "Replicar o mecanismo em conteúdo de topo de funil com cortes, series e prova narrativa.",
    "Medir se a tese depende de consistência editorial ou de um caso isolado de grande alcance.",
  ],
};

const TOPIC_RULES = [
  { key: "positioning", label: "Posicionamento", phrases: ["clareza de nicho", "categoria definida", "narrativa de autoridade", "diferenciacao"] },
  { key: "offer", label: "Oferta", phrases: ["oferta clara", "pacote simples", "precificacao", "garantia", "ticket"] },
  { key: "distribution", label: "Distribuicao", phrases: ["canais de distribuicao", "repurpose", "cortes", "shorts", "reels", "podcast"] },
  { key: "conversion", label: "Conversao", phrases: ["cta direto", "funil curto", "objeções", "agendamento", "checkout"] },
  { key: "proof", label: "Prova", phrases: ["prova social", "depoimentos", "casos", "antes e depois", "dados"] },
  { key: "operations", label: "Operacao", phrases: ["processo repetivel", "playbook", "sistema", "cadencia"] },
  { key: "retention", label: "Retencao", phrases: ["recorrencia", "renovacao", "comunidade", "retenção"] },
];

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const fetchWithTimeout = async (url: string, init: RequestInit = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const validateTranscriptPython = async (pythonBinary: string) => {
  await execFileAsync(pythonBinary, ["-c", transcriptPythonValidationScript], {
    maxBuffer: 1024 * 1024,
  });
};

const installTranscriptPythonPackages = async (pythonBinary: string) => {
  await execFileAsync(
    pythonBinary,
    [
      "-m",
      "pip",
      "install",
      "--quiet",
      "--upgrade",
      "youtube-transcript-api",
      "yt-dlp",
      "faster-whisper",
      "secretstorage",
    ],
    {
      maxBuffer: 1024 * 1024,
    },
  );
};

const ensureTranscriptPython = async () => {
  if (existsSync(transcriptPythonBinary)) {
    try {
      await validateTranscriptPython(transcriptPythonBinary);
      return transcriptPythonBinary;
    } catch {
      // Repair the existing virtualenv by reinstalling the missing packages.
    }
  }

  if (!transcriptPythonBootstrapPromise) {
    transcriptPythonBootstrapPromise = (async () => {
      if (!existsSync(transcriptPythonBinary)) {
        await execFileAsync("python3", ["-m", "venv", transcriptPythonVenvDir], {
          maxBuffer: 1024 * 1024,
        });
      }

      await installTranscriptPythonPackages(transcriptPythonBinary);
      await validateTranscriptPython(transcriptPythonBinary);
      return transcriptPythonBinary;
    })().catch((error) => {
      transcriptPythonBootstrapPromise = null;
      throw error;
    });
  }

  return transcriptPythonBootstrapPromise;
};

const TRANSCRIPT_LANGUAGE_LABELS: Record<string, string> = {
  af: "Africâner",
  ar: "Arabe",
  de: "Alemao",
  en: "Ingles",
  es: "Espanhol",
  fr: "Frances",
  it: "Italiano",
  pt: "Portugues",
  "pt-br": "Portugues do Brasil",
  "pt_br": "Portugues do Brasil",
};

const labelForTranscriptLanguage = (languageCode: string | null) => {
  if (!languageCode) return null;

  const normalized = languageCode.trim().toLowerCase();
  return TRANSCRIPT_LANGUAGE_LABELS[normalized] ?? languageCode;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)));

const compactText = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeTranscriptFingerprintText = (value: string) => compactText(value).toLowerCase();

export const buildTranscriptFingerprint = (transcript: Pick<TranscriptResult, "status" | "text">) => {
  if (transcript.status !== "available" || !transcript.text) {
    return `status:${transcript.status}`;
  }

  return createHash("sha256").update(normalizeTranscriptFingerprintText(transcript.text), "utf8").digest("hex");
};

export const compareYoutubeVideoProcessing = (input: {
  transcriptFingerprint: string;
  existingState: YoutubeStrategyVideoStateRow | null;
}) => {
  if (!input.existingState) {
    return {
      status: "new" as const,
      reason: "Video ainda nao possuia estado persistido.",
      previousTranscriptFingerprint: null,
      previousAnalysisId: null,
      previousAnalysisVersion: null,
      hasRelevantChange: true,
    };
  }

  if (input.existingState.transcript_hash === input.transcriptFingerprint) {
    return {
      status: "reused" as const,
      reason: "Transcricao sem mudanca relevante; analise anterior reaproveitada.",
      previousTranscriptFingerprint: input.existingState.transcript_hash,
      previousAnalysisId: input.existingState.last_analysis_id,
      previousAnalysisVersion: input.existingState.last_analysis_version,
      hasRelevantChange: false,
    };
  }

  return {
    status: "changed" as const,
    reason: "Transcricao mudou de forma relevante; nova estrategia deve ser gerada.",
    previousTranscriptFingerprint: input.existingState.transcript_hash,
    previousAnalysisId: input.existingState.last_analysis_id,
    previousAnalysisVersion: input.existingState.last_analysis_version,
    hasRelevantChange: true,
  };
};

const shorten = (value: string, maxLength = 220) => {
  const compact = compactText(value);
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trimEnd()}…`;
};

export const getVideoIdFromUrl = (value: string) => {
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

export const dedupeYoutubeVideoUrls = (videoUrls: string[]) => {
  const seenVideoIds = new Set<string>();
  const seenFallbackUrls = new Set<string>();
  const uniqueVideoUrls: string[] = [];

  for (const videoUrl of videoUrls) {
    const trimmed = videoUrl.trim();
    if (!trimmed) continue;

    const videoId = getVideoIdFromUrl(trimmed);

    if (videoId) {
      if (seenVideoIds.has(videoId)) continue;
      seenVideoIds.add(videoId);
    } else {
      if (seenFallbackUrls.has(trimmed)) continue;
      seenFallbackUrls.add(trimmed);
    }

    uniqueVideoUrls.push(trimmed);
  }

  return uniqueVideoUrls;
};

const buildCanonicalVideoUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

const extractJsonArrayFromHtml = (html: string, marker: string) => {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return null;

  const openIndex = html.indexOf("[", markerIndex);
  if (openIndex < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = openIndex; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "[") {
      depth += 1;
      continue;
    }

    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(openIndex, index + 1);
      }
    }
  }

  return null;
};

const extractCaptionTracks = (html: string) => {
  const json = extractJsonArrayFromHtml(html, '"captionTracks":');
  if (!json) return [];

  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((track) => ({
        baseUrl: typeof track?.baseUrl === "string" ? track.baseUrl : null,
        languageCode: typeof track?.languageCode === "string" ? track.languageCode : null,
        name: typeof track?.name?.simpleText === "string" ? track.name.simpleText : null,
        kind: typeof track?.kind === "string" ? track.kind : null,
      }))
      .filter((track) => track.baseUrl);
  } catch {
    return [];
  }
};

const scoreTrack = (languageCode: string | null, kind: string | null) => {
  const priority = ["pt-BR", "pt", "en"];
  const normalized = languageCode?.toLowerCase() ?? "";
  const exactPriority = priority.findIndex((language) => language.toLowerCase() === normalized);
  const languageScore = exactPriority >= 0 ? 100 - exactPriority * 10 : normalized.startsWith("pt") ? 80 : normalized.startsWith("en") ? 70 : 10;
  const kindScore = kind === "asr" ? -5 : 5;
  return languageScore + kindScore;
};

const selectCaptionTrack = (
  tracks: Array<{ baseUrl: string; languageCode: string | null; name: string | null; kind: string | null }>,
) => {
  if (tracks.length === 0) return null;
  return [...tracks].sort((left, right) => scoreTrack(right.languageCode, right.kind) - scoreTrack(left.languageCode, left.kind))[0] ?? null;
};

const parseTranscriptSegments = (body: string) => {
  const trimmed = body.trim();

  if (!trimmed) return [];

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        events?: Array<{
          tStartMs?: string;
          dDurationMs?: string;
          segs?: Array<{ utf8?: string }>;
        }>;
      };

      return (parsed.events ?? [])
        .map((event) => {
          const text = compactText((event.segs ?? []).map((segment) => segment.utf8 ?? "").join(""));
          if (!text) return null;

          return {
            startMs: event.tStartMs ? Number.parseInt(event.tStartMs, 10) : null,
            durationMs: event.dDurationMs ? Number.parseInt(event.dDurationMs, 10) : null,
            text,
          } satisfies TranscriptSegment;
        })
        .filter((segment): segment is TranscriptSegment => Boolean(segment));
    } catch {
      return [];
    }
  }

  const segments: TranscriptSegment[] = [];
  const regex = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;

  for (const match of trimmed.matchAll(regex)) {
    const attributes = match[1] ?? "";
    const rawText = match[2] ?? "";
    const startMatch = attributes.match(/\bstart="([^"]+)"/i)?.[1];
    const durationMatch = attributes.match(/\bdur="([^"]+)"/i)?.[1];
    const text = compactText(
      decodeHtmlEntities(
        rawText
          .replace(/<[^>]+>/g, "")
          .replace(/\n+/g, " ")
          .trim(),
      ),
    );

    if (!text) continue;

    segments.push({
      startMs: startMatch ? Math.round(Number.parseFloat(startMatch) * 1000) : null,
      durationMs: durationMatch ? Math.round(Number.parseFloat(durationMatch) * 1000) : null,
      text,
    });
  }

  return segments;
};

const splitIntoSentences = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((part) => compactText(part))
    .filter(Boolean);

const extractMatchingSentences = (sentences: string[], keywords: string[], limit = 3) => {
  const loweredKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return sentences.filter((sentence) => loweredKeywords.some((keyword) => sentence.toLowerCase().includes(keyword))).slice(0, limit);
};

const buildStrategyInsights = (sentences: string[]) =>
  STRATEGY_DEFINITIONS.map((definition) => {
    const evidence = extractMatchingSentences(sentences, definition.keywords, 3);
    const score = evidence.length * 25;

    return {
      key: definition.key,
      label: definition.label,
      score,
      evidence,
    };
  })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

const buildMechanisms = (strategies: Array<{ key: string; label: string }>, sentences: string[]) => {
  const labels = new Set(strategies.map((strategy) => strategy.key));
  const mechanisms: string[] = [];

  if (labels.has("proof") && labels.has("conversion")) {
    mechanisms.push("A prova reduz objeções e acelera a conversao.");
  }

  if (labels.has("distribution") && labels.has("positioning")) {
    mechanisms.push("A distribuicao amplifica um posicionamento claro.");
  }

  if (labels.has("offer") && labels.has("conversion")) {
    mechanisms.push("A clareza da oferta encurta o caminho ate a decisao.");
  }

  if (labels.has("operations") && labels.has("distribution")) {
    mechanisms.push("Um sistema repetivel transforma um bom case em rotinas de crescimento.");
  }

  if (labels.has("retention")) {
    mechanisms.push("A recorrencia aparece como estabilizador do resultado no longo prazo.");
  }

  if (mechanisms.length === 0) {
    const firstSignals = sentences.slice(0, 2).map((sentence) => shorten(sentence, 120));
    if (firstSignals.length > 0) {
      mechanisms.push(...firstSignals.map((sentence) => `Sinal relevante: ${sentence}`));
    }
  }

  return [...new Set(mechanisms)].slice(0, 5);
};

const buildTactics = (sentences: string[]) => {
  const tactics: string[] = [];

  const addIfMatches = (keywords: string[], tactic: string) => {
    if (sentences.some((sentence) => keywords.some((keyword) => sentence.toLowerCase().includes(keyword)))) {
      tactics.push(tactic);
    }
  };

  addIfMatches(["shorts", "reels", "corte", "clip", "repurpose", "recorte"], "Repurpose de conteudo longo em cortes curtos.");
  addIfMatches(["whatsapp", "telefone", "agenda", "agendamento"], "Usar CTA direto para conversa ou agendamento.");
  addIfMatches(["depoimento", "case", "resultado", "antes e depois"], "Apoiar a narrativa em prova concreta.");
  addIfMatches(["email", "newsletter", "comunidade"], "Fortalecer a distribuicao propria e recorrente.");
  addIfMatches(["demo", "trial", "onboarding"], "Levar o lead para demo, teste ou onboarding guiado.");
  addIfMatches(["preco", "ticket", "oferta", "garantia"], "Framing de oferta e reducao de risco percebido.");
  addIfMatches(["processo", "sistema", "playbook"], "Codificar o mecanismo em um playbook repetivel.");

  if (tactics.length === 0) {
    tactics.push(...sentences.slice(0, 3).map((sentence) => shorten(sentence, 140)));
  }

  return [...new Set(tactics)].slice(0, 6);
};

const buildRisks = (
  analysisCount: number,
  transcriptCoverage: { available: number; missing: number; totalCharacters: number },
  sentenceCount: number,
) => {
  const risks = new Set<string>();

  if (analysisCount > 1) {
    risks.add("Casos de sucesso podem refletir contexto especifico e nao uma causalidade geral.");
  }

  if (transcriptCoverage.missing > 0) {
    risks.add("Alguns videos nao tiveram transcricao util, o que reduz a confiabilidade da sintese.");
  }

  if (transcriptCoverage.totalCharacters < 2500 || sentenceCount < 8) {
    risks.add("A amostra textual e pequena para conclusoes fortes.");
  }

  risks.add("A forma do caso nao deve ser copiada sem adaptar mecanismo, oferta e canal.");

  return [...risks].slice(0, 5);
};

const buildBusinessApplicability = (
  text: string,
  strategies: Array<{ key: string; label: string; score: number }>,
): Array<{
  businessType: string;
  score: number;
  reason: string;
}> => {
  const lowered = text.toLowerCase();
  const categories = new Set(strategies.map((strategy) => strategy.key));

  const result = Object.entries(BUSINESS_TYPE_LABELS).map(([businessType, label]) => {
    const keywords = BUSINESS_TYPE_KEYWORDS[businessType as keyof typeof BUSINESS_TYPE_LABELS];
    let score = 45;
    const matched = keywords.filter((keyword) => lowered.includes(keyword)).length;
    score += matched * 10;

    if (businessType === "local_business" && (categories.has("conversion") || categories.has("proof"))) score += 15;
    if (businessType === "service_business" && (categories.has("positioning") || categories.has("conversion"))) score += 12;
    if (businessType === "physical_product" && (categories.has("offer") || categories.has("distribution"))) score += 12;
    if (businessType === "ecommerce" && (categories.has("distribution") || categories.has("conversion"))) score += 12;
    if (businessType === "saas" && (categories.has("operations") || categories.has("retention"))) score += 12;
    if (businessType === "b2b" && (categories.has("proof") || categories.has("operations"))) score += 12;
    if (businessType === "info_product" && (categories.has("positioning") || categories.has("proof"))) score += 12;
    if (businessType === "creator_business" && categories.has("distribution")) score += 12;

    score = clampScore(score);

    return {
      businessType: label,
      score,
      reason:
        matched > 0
          ? `O texto menciona ${matched} sinal(is) diretamente associado(s) a ${label}.`
          : `A analise sugere ${label} por alinhamento com os mecanismos extraidos.`,
    };
  });

  return result.sort((left, right) => right.score - left.score);
};

const buildExecutiveSummary = (videos: VideoAnalysis[]) => {
  if (videos.length === 0) {
    return "Nao foi possivel extrair uma leitura util da transcricao.";
  }

  const topStrategies = videos
    .flatMap((video) => video.strategies.map((strategy) => strategy.label))
    .filter(Boolean);
  const uniqueStrategies = [...new Set(topStrategies)].slice(0, 4);
  const strategyText = uniqueStrategies.length > 0 ? uniqueStrategies.join(", ") : "mecanismo de crescimento";
  const coverageText = videos.filter((video) => video.transcript.status === "available").length;

  return `O material aponta para ${strategyText}, com ${coverageText} video(s) com transcricao util e uma leitura orientada a aplicabilidade.`;
};

const buildGlobalThesis = (videos: VideoAnalysis[]) => {
  const candidates = videos.map((video) => video.thesis).filter(Boolean);
  return candidates[0] ?? "A transcricao sugere um conjunto de praticas transferiveis, mas a tese central depende da adaptacao ao contexto do negocio.";
};

const buildCommonItems = (items: string[][]) => {
  const frequency = new Map<string, number>();
  items.flat().forEach((item) => {
    const normalized = item.trim().toLowerCase();
    if (!normalized) return;
    frequency.set(normalized, (frequency.get(normalized) ?? 0) + 1);
  });

  return [...frequency.entries()]
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1])
    .map(([item]) => item)
    .slice(0, 5);
};

const buildNextTests = (businessApplicability: Array<{ businessType: string; score: number; reason: string }>) => {
  const bestBusinessType = businessApplicability[0]?.businessType ?? BUSINESS_TYPE_LABELS.service_business;
  const normalizedType = (Object.entries(BUSINESS_TYPE_LABELS).find(([, label]) => label === bestBusinessType)?.[0] ??
    "service_business") as keyof typeof BUSINESS_TYPE_LABELS;
  return NEXT_TESTS_BY_TYPE[normalizedType].slice(0, 2);
};

const chooseTranscriptLanguage = (languageCode: string | null, language: string | null) => languageCode ?? language ?? "unknown";

const fetchOEmbedMetadata = async (canonicalUrl: string) => {
  const response = await fetchWithTimeout(`https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 OmniAgent/1.0",
    },
  });

  if (!response.ok) {
    return null;
  }

  try {
    return (await response.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
    };
  } catch {
    return null;
  }
};

const fetchYoutubeHtml = async (videoId: string) => {
  const response = await fetchWithTimeout(buildCanonicalVideoUrl(videoId), {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "Mozilla/5.0 OmniAgent/1.0",
    },
  });

  if (!response.ok) {
    throw createError("BAD_GATEWAY", `Nao foi possivel carregar o video ${videoId}`, 502);
  }

  return response.text();
};

const fetchTranscriptSegments = async (trackBaseUrl: string) => {
  const response = await fetchWithTimeout(trackBaseUrl, {
    headers: {
      accept: "text/plain,application/json,text/xml,*/*",
      "user-agent": "Mozilla/5.0 OmniAgent/1.0",
    },
  });

  if (!response.ok) {
    throw createError("BAD_GATEWAY", "Nao foi possivel carregar a transcricao", 502);
  }

  const body = await response.text();
  return parseTranscriptSegments(body);
};

const fetchTranscriptSegmentsViaPython = async (videoId: string, languages: string[]) => {
  const python = await ensureTranscriptPython();
  const script = [
    "import json",
    "import sys",
    "from youtube_transcript_api import YouTubeTranscriptApi",
    "video_id = sys.argv[1]",
    "languages = [lang for lang in sys.argv[2].split(',') if lang]",
    "api = YouTubeTranscriptApi()",
    "transcript = api.fetch(video_id, languages=languages)",
    "print(json.dumps([{'text': item.text, 'startMs': int(round(float(item.start) * 1000)), 'durationMs': int(round(float(item.duration) * 1000))} for item in transcript], ensure_ascii=False))",
  ].join("\n");

  const { stdout } = await execFileAsync(python, ["-c", script, videoId, languages.join(",")], {
    maxBuffer: 1024 * 1024,
  });

  const parsed = JSON.parse(stdout.trim() || "[]") as Array<{
    text: string;
    startMs: number | null;
    durationMs: number | null;
  }>;

  return parsed
    .map((segment) => ({
      startMs: Number.isFinite(segment.startMs) ? segment.startMs : null,
      durationMs: Number.isFinite(segment.durationMs) ? segment.durationMs : null,
      text: compactText(segment.text),
    }))
    .filter((segment) => Boolean(segment.text));
};

const fetchTranscriptSegmentsViaWhisper = async (videoUrl: string, modelName: string) => {
  const python = await ensureTranscriptPython();
  const script = [
    "import json",
    "import os",
    "import re",
    "import tempfile",
    "import warnings",
    "from pathlib import Path",
    "import yt_dlp",
    "from faster_whisper import WhisperModel",
    "",
    "video_url = os.environ['OMNIAGENT_VIDEO_URL']",
    "model_name = os.environ.get('OMNIAGENT_WHISPER_MODEL', 'small')",
    "cookie_file = os.environ.get('OMNIAGENT_YTDLP_COOKIE_FILE')",
    "cookies_from_browser = os.environ.get('OMNIAGENT_YTDLP_COOKIES_FROM_BROWSER')",
    "remote_components = os.environ.get('OMNIAGENT_YTDLP_REMOTE_COMPONENTS')",
    "",
    "def build_ydl_kwargs():",
    "    ydl_kwargs = {",
    "        'quiet': True,",
    "        'verbose': False,",
    "        'format': 'best[acodec!=none]/best',",
    "        'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),",
    "        'postprocessors': [{",
    "            'key': 'FFmpegExtractAudio',",
    "            'preferredcodec': 'mp3',",
    "            'preferredquality': '192',",
    "        }],",
    "    }",
    "",
    "    if cookie_file:",
    "        ydl_kwargs['cookiefile'] = cookie_file",
    "",
    "    if cookies_from_browser:",
    "        pattern = re.fullmatch(r'''(?x)",
    "            (?P<name>[^+:]+)",
    "            (?:\\s*\\+\\s*(?P<keyring>[^:]+))?",
    "            (?:\\s*:\\s*(?!:)(?P<profile>.+?))?",
    "            (?:\\s*::\\s*(?P<container>.+))?",
    "        ''', cookies_from_browser)",
    "        if pattern is None:",
    "            raise RuntimeError(f'invalid cookies from browser arguments: {cookies_from_browser}')",
    "",
    "        browser_name, keyring, profile, container = pattern.group('name', 'keyring', 'profile', 'container')",
    "        ydl_kwargs['cookiesfrombrowser'] = (browser_name.lower(), profile, keyring.upper() if keyring else None, container)",
    "",
    "    if remote_components:",
    "        ydl_kwargs['remote_components'] = [part.strip() for part in remote_components.split(',') if part.strip()]",
    "",
    "    return ydl_kwargs",
    "",
    "with tempfile.TemporaryDirectory(prefix='omniagent-youtube-whisper-') as temp_dir:",
    "    ydl = yt_dlp.YoutubeDL(build_ydl_kwargs())",
    "",
    "    warnings.filterwarnings('ignore')",
    "    result = ydl.extract_info(video_url, download=True)",
    "    warnings.filterwarnings('default')",
    "",
    "    audio_path = Path(temp_dir) / f\"{result['id']}.mp3\"",
    "    if not audio_path.exists():",
    "        candidates = sorted(Path(temp_dir).glob(f\"{result['id']}.*\"), key=lambda item: item.stat().st_size if item.exists() else 0, reverse=True)",
    "        if not candidates:",
    "            raise RuntimeError('Nao foi possivel localizar o arquivo de audio baixado')",
    "        audio_path = candidates[0]",
    "",
    "    model = WhisperModel(model_name, device='cpu', compute_type='int8')",
    "    segments_iter, info = model.transcribe(str(audio_path), task='transcribe', beam_size=1, vad_filter=True)",
    "",
    "    segments = []",
    "    for segment in segments_iter:",
    "        text = ' '.join(str(segment.text).split())",
    "        if not text:",
    "            continue",
    "",
    "        start = segment.start",
    "        end = segment.end",
    "        segments.append({",
    "            'text': text,",
    "            'startMs': int(round(float(start) * 1000)) if start is not None else None,",
    "            'durationMs': int(round((float(end) - float(start)) * 1000)) if start is not None and end is not None else None,",
    "        })",
    "",
    "    print(json.dumps({",
    "        'languageCode': getattr(info, 'language', None),",
    "        'segments': segments,",
    "    }, ensure_ascii=False))",
  ].join("\n");

  const { stdout } = await execFileAsync(
    python,
    ["-c", script],
    {
      maxBuffer: 1024 * 1024 * 10,
        env: {
          ...process.env,
          OMNIAGENT_VIDEO_URL: videoUrl,
          OMNIAGENT_WHISPER_MODEL: modelName,
          OMNIAGENT_YTDLP_COOKIES_FROM_BROWSER: process.env.OMNIAGENT_YTDLP_COOKIES_FROM_BROWSER ?? "",
          OMNIAGENT_YTDLP_COOKIE_FILE: process.env.OMNIAGENT_YTDLP_COOKIE_FILE ?? "",
          PYTHONUNBUFFERED: "1",
        },
      },
  );

  const parsed = JSON.parse(stdout.trim() || "{}") as {
    languageCode?: string | null;
    segments?: Array<{
      text: string;
      startMs: number | null;
      durationMs: number | null;
    }>;
  };

  return {
    languageCode: parsed.languageCode ?? null,
    segments: (parsed.segments ?? [])
      .map((segment) => ({
        startMs: Number.isFinite(segment.startMs) ? segment.startMs : null,
        durationMs: Number.isFinite(segment.durationMs) ? segment.durationMs : null,
        text: compactText(segment.text),
      }))
      .filter((segment) => Boolean(segment.text)),
  };
};

const analyzeVideo = async (input: { videoUrl: string; notes: string | null }) => {
  const videoId = getVideoIdFromUrl(input.videoUrl);
  if (!videoId) {
    throw createError("BAD_REQUEST", `URL do YouTube invalida: ${input.videoUrl}`, 400);
  }

  const canonicalUrl = buildCanonicalVideoUrl(videoId);
  const metadata = await fetchOEmbedMetadata(canonicalUrl).catch(() => null);

  let html: string | null = null;
  let transcript: TranscriptResult = {
    status: "missing",
    languageCode: null,
    language: null,
    text: null,
    segmentCount: 0,
    characterCount: 0,
    reason: "Transcricao indisponivel",
  };
  let segments: TranscriptSegment[] = [];

  try {
    try {
      segments = await fetchTranscriptSegmentsViaPython(videoId, ["pt-BR", "pt", "en"]);
    } catch {
      try {
        html = await fetchYoutubeHtml(videoId);
        const captionTracks = extractCaptionTracks(html);
        const captionTrack = selectCaptionTrack(captionTracks);
        const captionLanguageCode = captionTrack?.languageCode ?? null;

        if (captionTrack?.baseUrl) {
          try {
            segments = await fetchTranscriptSegments(captionTrack.baseUrl);

            if (segments.length > 0) {
              const text = compactText(segments.map((segment) => segment.text).join(" "));
              transcript = {
                status: "available",
                languageCode: captionLanguageCode,
                language: labelForTranscriptLanguage(captionLanguageCode),
                text,
                segmentCount: segments.length,
                characterCount: text.length,
                reason: null,
              };
            }
          } catch {
            // Keep falling through to Whisper when caption tracks cannot be fetched.
          }
        }
      } catch {
        // Keep falling through to Whisper when the raw HTML page is blocked.
      }
    }

    if (segments.length === 0) {
      try {
        const whisperResult = await fetchTranscriptSegmentsViaWhisper(canonicalUrl, process.env.YT_WHISPER_MODEL ?? "small");
        segments = whisperResult.segments;

        if (segments.length > 0) {
          transcript = {
            status: "available",
            languageCode: whisperResult.languageCode ?? null,
            language: labelForTranscriptLanguage(whisperResult.languageCode),
            text: compactText(segments.map((segment) => segment.text).join(" ")),
            segmentCount: segments.length,
            characterCount: compactText(segments.map((segment) => segment.text).join(" ")).length,
            reason: null,
          };
        }
      } catch (error) {
        transcript = {
          ...transcript,
          reason:
            error instanceof Error
              ? `Nao foi possivel gerar uma transcricao local com Whisper: ${error.message}`
              : "Nao foi possivel gerar uma transcricao local com Whisper",
        };
      }
    }

    if (segments.length > 0 && transcript.status !== "available") {
      const text = compactText(segments.map((segment) => segment.text).join(" "));

      transcript = {
        status: segments.length > 0 ? "available" : "missing",
        languageCode: transcript.languageCode ?? null,
        language: transcript.language ?? labelForTranscriptLanguage(transcript.languageCode),
        text: segments.length > 0 ? text : null,
        segmentCount: segments.length,
        characterCount: text.length,
        reason: segments.length > 0 ? null : "Transcricao vazia",
      };
    } else if (!transcript.reason) {
      transcript = {
        ...transcript,
        reason: "Nao foi possivel extrair uma transcricao util do video",
      };
    }
  } catch (error) {
    transcript = {
      ...transcript,
      status: "error",
      reason: error instanceof Error ? error.message : "Falha ao extrair transcricao",
    };
  }

  const transcriptText = transcript.text ?? compactText(segments.map((segment) => segment.text).join(" "));
  const sentences = transcriptText ? splitIntoSentences(transcriptText) : [];
  const strategyInsights = transcriptText ? buildStrategyInsights(sentences) : [];
  const strategyItems = strategyInsights.map((item) => ({ key: item.key, label: item.label, score: item.score }));
  const mechanisms = buildMechanisms(strategyItems, sentences);
  const tactics = buildTactics(sentences);
  const applicability = buildBusinessApplicability(transcriptText || `${metadata?.title ?? ""} ${metadata?.author_name ?? ""}`, strategyItems);
  const evidence = strategyInsights.flatMap((item) =>
    item.evidence.slice(0, 2).map((sentence) => ({
      quote: shorten(sentence, 220),
      reason: `${item.label} aparece como um dos sinais mais recorrentes do trecho.`,
    })),
  );

  const transcriptCoverage = transcript.status === "available" ? 1 : 0;
  const qualityScore = clampScore(
    Math.min(100, Math.round((transcript.characterCount / 45) * (transcript.segmentCount > 0 ? 1 : 0)) + (sentences.length >= 8 ? 15 : 0)),
  );
  const transcriptFingerprint = buildTranscriptFingerprint({
    status: transcript.status,
    text: transcript.text,
  });

  const summary =
    strategyInsights.length > 0
      ? `O video enfatiza ${strategyInsights
          .slice(0, 3)
          .map((item) => item.label.toLowerCase())
          .join(", ")}.`
      : transcript.status === "available"
        ? "A transcricao existe, mas os sinais estrategicos sao difusos."
        : "Nao foi possivel extrair uma transcricao confiavel para analise estrategica.";

  const thesis =
    strategyInsights[0]?.label ??
    (transcript.status === "available"
      ? "O material sugere um conjunto de praticas transferiveis, mas sem uma tese dominante claramente isolada."
      : "Nao foi possivel inferir uma tese confiavel sem transcricao util.");

  const risks = buildRisks(1, { available: transcriptCoverage, missing: transcriptCoverage ? 0 : 1, totalCharacters: transcript.characterCount }, sentences.length);

  const videoAnalysis: VideoAnalysis = {
    videoId,
    originalUrl: input.videoUrl,
    canonicalUrl,
    title: metadata?.title ?? null,
    channelName: metadata?.author_name ?? null,
    channelUrl: metadata?.author_url ?? null,
    thumbnailUrl: metadata?.thumbnail_url ?? null,
    transcript,
    summary,
    thesis,
    strategies: strategyInsights.map((item) => ({
      label: item.label,
      rationale: item.evidence[0] ? `O trecho sugere ${item.label.toLowerCase()} como um dos eixos centrais.` : `O video aponta para ${item.label.toLowerCase()} como tendencia dominante.`,
      evidence: item.evidence.slice(0, 3).map((sentence) => shorten(sentence, 180)),
    })),
    mechanisms,
    tactics,
    risks,
    applicability,
    evidence,
  };

  const available = transcript.status === "available" ? 1 : 0;

  return {
    videoAnalysis,
    qualityScore,
    available,
    missing: available ? 0 : 1,
    sentenceCount: sentences.length,
    transcriptCharacters: transcript.characterCount,
    transcriptFingerprint,
  };
};

const buildPayload = async (input: {
  client: {
    id: string;
    name: string;
    slug: string;
    website_url: string | null;
    segment: string | null;
    status: string;
  };
  status: string;
  notes: string | null;
  funnelStage: string | null;
  videoUrls: string[];
}) => {
  const videoStates = await ensureYoutubeStrategyVideoStateBackfill(input.client.id);
  const videoStateMap = new Map(videoStates.map((state) => [state.video_id, state]));
  const uniqueVideoUrls = dedupeYoutubeVideoUrls(input.videoUrls);

  const videoResults = await Promise.all(
    uniqueVideoUrls.map(async (videoUrl) =>
      analyzeVideo({ videoUrl, notes: input.notes }).catch((error) => {
        const resolvedUrl = videoUrl.trim();
        const videoId = getVideoIdFromUrl(resolvedUrl);
        const transcriptFingerprint = buildTranscriptFingerprint({
          status: "error",
          text: null,
        });

        return {
          videoAnalysis: {
            videoId: videoId ?? resolvedUrl,
            originalUrl: resolvedUrl,
            canonicalUrl: videoId ? buildCanonicalVideoUrl(videoId) : resolvedUrl,
            title: null,
            channelName: null,
            channelUrl: null,
            thumbnailUrl: null,
            transcript: {
              status: "error" as const,
              languageCode: null,
              language: null,
              text: null,
              segmentCount: 0,
              characterCount: 0,
              reason: error instanceof Error ? error.message : "Falha ao analisar o video",
            },
            summary: "Falha ao analisar este video.",
            thesis: "Nao foi possivel extrair uma tese util deste video.",
            strategies: [],
            mechanisms: [],
            tactics: [],
            risks: [
              error instanceof Error ? error.message : "Falha ao analisar o video",
            ],
            applicability: Object.values(BUSINESS_TYPE_LABELS).map((businessType) => ({
              businessType,
              score: 20,
              reason: "Nao foi possivel avaliar este video com confianca.",
            })),
            evidence: [],
          },
          qualityScore: 0,
          available: 0,
          missing: 1,
          sentenceCount: 0,
          transcriptCharacters: 0,
          transcriptFingerprint,
        };
      }),
    ),
  );

  const videoProcessing = videoResults.map((result) => {
    const videoAnalysis = result.videoAnalysis as VideoAnalysis;
    const existingState = videoStateMap.get(videoAnalysis.videoId) ?? null;
    const comparison = compareYoutubeVideoProcessing({
      transcriptFingerprint: result.transcriptFingerprint,
      existingState,
    });

    const processing = {
      status: comparison.status,
      reason: comparison.reason,
      transcriptFingerprint: result.transcriptFingerprint,
      previousTranscriptFingerprint: comparison.previousTranscriptFingerprint,
      previousAnalysisId: comparison.previousAnalysisId,
      previousAnalysisVersion: comparison.previousAnalysisVersion,
    } as const;

    videoAnalysis.processing = processing;

    return {
      videoId: videoAnalysis.videoId,
      canonicalUrl: videoAnalysis.canonicalUrl,
      status: comparison.status,
      reason: comparison.reason,
      transcriptFingerprint: result.transcriptFingerprint,
      previousTranscriptFingerprint: comparison.previousTranscriptFingerprint,
      previousAnalysisId: comparison.previousAnalysisId,
      previousAnalysisVersion: comparison.previousAnalysisVersion,
      transcriptStatus: videoAnalysis.transcript.status,
      transcriptCharacterCount: videoAnalysis.transcript.characterCount,
      transcriptSegmentCount: videoAnalysis.transcript.segmentCount,
    };
  });

  const videos = videoResults.map((result) => result.videoAnalysis);
  const totalAvailable = videoResults.reduce((sum, result) => sum + result.available, 0);
  const totalMissing = videoResults.reduce((sum, result) => sum + result.missing, 0);
  const totalCharacters = videoResults.reduce((sum, result) => sum + result.transcriptCharacters, 0);
  const totalSegments = videos.reduce((sum, video) => sum + video.transcript.segmentCount, 0);
  const totalSentences = videoResults.reduce((sum, result) => sum + result.sentenceCount, 0);
  const averageQuality = videoResults.length > 0 ? videoResults.reduce((sum, result) => sum + result.qualityScore, 0) / videoResults.length : 0;
  const commonStrategies = buildCommonItems(videos.map((video) => video.strategies.map((strategy) => strategy.label)));
  const commonMechanisms = buildCommonItems(videos.map((video) => video.mechanisms));
  const commonTactics = buildCommonItems(videos.map((video) => video.tactics));
  const risks = buildRisks(videos.length, { available: totalAvailable, missing: totalMissing, totalCharacters }, totalSentences);
  const aggregateApplicability = Object.entries(
    videos.reduce<Record<string, { score: number; reason: string[] }>>((accumulator, video) => {
      video.applicability.forEach((item) => {
        const current = accumulator[item.businessType] ?? { score: 0, reason: [] };
        current.score += item.score;
        current.reason.push(item.reason);
        accumulator[item.businessType] = current;
      });
      return accumulator;
    }, {}),
  )
    .map(([businessType, value]) => ({
      businessType,
      score: clampScore(value.score / Math.max(1, videos.length)),
      reason: value.reason.slice(0, 2).join(" "),
    }))
    .sort((left, right) => right.score - left.score);

  const recommendedBusinessTypes = aggregateApplicability.slice(0, 3);
  const lessSuitableBusinessTypes = [...aggregateApplicability].slice(-3).reverse();
  const nextTests = buildNextTests(recommendedBusinessTypes);
  const primaryVideoTitle = videos[0]?.title ?? null;

  const transcriptCoverage = {
    available: totalAvailable,
    missing: totalMissing,
    totalCharacters,
    totalSegments,
  };

  const analysisStatus: "complete" | "partial" | "failed" =
    totalAvailable > 0 ? (totalMissing > 0 ? "partial" : "complete") : "failed";
  const hasRelevantChange = videoProcessing.some((item) => item.status !== "reused");
  const reusedVideoCount = videoProcessing.filter((item) => item.status === "reused").length;
  const changedVideoCount = videoProcessing.filter((item) => item.status === "changed").length;
  const newVideoCount = videoProcessing.filter((item) => item.status === "new").length;

  const payload: YoutubeStrategyAnalysisPayload = {
    title: primaryVideoTitle ?? "Estratégia do YouTube",
    context: {
      status: input.status,
      note: input.notes,
      confidence: averageQuality,
      requestedVideoCount: uniqueVideoUrls.length,
      analyzedVideoCount: videos.length,
      funnelStage: input.funnelStage,
      transcriptCoverage,
    },
    overview: {
      executiveSummary: buildExecutiveSummary(videos),
      thesis: buildGlobalThesis(videos),
      analysisStatus,
      confidence: averageQuality,
    },
    videos,
    synthesis: {
      commonStrategies,
      commonMechanisms,
      commonTactics,
      risks,
      recommendedBusinessTypes,
      lessSuitableBusinessTypes,
      nextTests: nextTests.length > 0 ? nextTests : buildNextTests(aggregateApplicability),
    },
    raw: {
      notes: input.notes,
    },
    processing: {
      hasRelevantChange,
      reusedVideoCount,
      changedVideoCount,
      newVideoCount,
      videos: videoProcessing.map((item) => ({
        videoId: item.videoId,
        canonicalUrl: item.canonicalUrl,
        status: item.status,
        reason: item.reason,
        transcriptFingerprint: item.transcriptFingerprint,
        previousTranscriptFingerprint: item.previousTranscriptFingerprint,
        previousAnalysisId: item.previousAnalysisId,
        previousAnalysisVersion: item.previousAnalysisVersion,
      })),
    },
  };

  return {
    payload,
    processing: {
      hasRelevantChange,
      reusedVideoCount,
      changedVideoCount,
      newVideoCount,
      videos: videoProcessing,
    },
  };
};

const loadYoutubeStrategyContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);

  const client = await findClientById(input.agencyId, input.clientId);
  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  await ensureYoutubeStrategyVideoStateBackfill(input.clientId);
  const latestAnalysis = await findLatestYoutubeStrategyAnalysisByClientId(input.clientId);
  const analyses = await listYoutubeStrategyAnalysesByClientId(input.clientId, 5);
  const videoStates = await listYoutubeStrategyVideoStatesByClientId(input.clientId);

  return {
    client,
    latestAnalysis,
    analyses,
    videoStates,
  };
};

const buildLatestAnalysisResponse = (analysis: YoutubeStrategyAnalysisRow | null) => analysis;

export const getYoutubeStrategyContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  const context = await loadYoutubeStrategyContext(input);

  return {
    client: context.client,
    latestAnalysis: buildLatestAnalysisResponse(context.latestAnalysis),
    analyses: context.analyses,
    videoStates: context.videoStates,
  };
};

export const createYoutubeStrategyAnalysisForClient = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  status: string;
  notes?: string;
  funnelStage?: string;
  videoUrls: string[];
}) => {
  const context = await loadYoutubeStrategyContext(input);
  const buildResult = await buildPayload({
    client: context.client,
    status: input.status,
    notes: input.notes ?? null,
    funnelStage: input.funnelStage ?? null,
    videoUrls: input.videoUrls,
  });

  const shouldCreateNewAnalysis = !context.latestAnalysis || buildResult.processing.hasRelevantChange;
  let latestAnalysis = context.latestAnalysis;
  let analyses = context.analyses;
  let strategyIntelligencePayload: YoutubeStrategyAnalysisPayload = {
    ...buildResult.payload,
    processing: buildResult.payload.processing,
  };

  if (shouldCreateNewAnalysis) {
    const createdAnalysis = await createYoutubeStrategyAnalysis({
      clientId: context.client.id,
      status: input.status,
      payload: buildResult.payload,
    });

    latestAnalysis = createdAnalysis;
    analyses = await listYoutubeStrategyAnalysesByClientId(context.client.id, 5);

    const strategyIntelligence = await persistStrategyIntelligenceFromYoutubeAnalysis({
      userId: input.userId,
      agencyId: input.agencyId,
      clientId: context.client.id,
      sourceAnalysisId: createdAnalysis.id,
      sourceAnalysisVersion: createdAnalysis.version,
    });

    strategyIntelligencePayload = {
      ...buildResult.payload,
      strategyLibrary: {
        version: strategyIntelligence.latestVersion,
        ...(strategyIntelligence.payload.strategyLibrary as Record<string, unknown> | undefined),
        assets: (strategyIntelligence.payload.strategyLibrary?.assets ?? []).map((asset) => asset as Record<string, unknown>),
      },
      strategyIntelligence: {
        ...strategyIntelligence.payload.strategyIntelligence,
        assets: (strategyIntelligence.payload.strategyIntelligence?.assets ?? []).map((asset) => asset as Record<string, unknown>),
      },
    };

    latestAnalysis = await updateYoutubeStrategyAnalysisPayload(createdAnalysis.id, strategyIntelligencePayload);

    await Promise.all(
      buildResult.processing.videos.map((video) =>
        upsertYoutubeStrategyVideoState({
          clientId: context.client.id,
          videoId: video.videoId,
          canonicalUrl: video.canonicalUrl,
          transcriptHash: video.transcriptFingerprint,
          transcriptStatus: video.transcriptStatus,
          transcriptCharacterCount: video.transcriptCharacterCount,
          transcriptSegmentCount: video.transcriptSegmentCount,
          lastAnalysisId: latestAnalysis?.id ?? createdAnalysis.id,
          lastAnalysisVersion: latestAnalysis?.version ?? createdAnalysis.version,
        }),
      ),
    );
  } else if (latestAnalysis) {
    strategyIntelligencePayload = {
      ...(latestAnalysis.payload_json as Record<string, unknown>),
      processing: buildResult.payload.processing,
    } as YoutubeStrategyAnalysisPayload;
  }

  return {
    client: context.client,
    latestAnalysis,
    analyses,
    payload: strategyIntelligencePayload,
    videoStates: shouldCreateNewAnalysis ? await listYoutubeStrategyVideoStatesByClientId(context.client.id) : context.videoStates,
  };
};
