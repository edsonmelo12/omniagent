import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createError } from "../../shared/http/errors.js";
import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestContentPackageByClientId, findLatestScheduleByClientId } from "./content.repository.js";
import { getRemotionRenderDefaults, renderCopyMotionVideo } from "./remotion/remotion-renderer.js";

export type RenderedAssetRow = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  content_package_id: string | null;
  content_package_version: number | null;
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

type ContentPackagePayload = {
  contentPlanVersion?: number;
  note?: string | null;
  items?: string[];
  visualDirection?: {
    title?: string;
    owner?: string;
    mechanism?: string;
    firstPass?: string;
    hookSystem?: string;
    masterAsset?: string;
    supportChannels?: string[];
    productImagePolicy?: string;
    rules?: string[];
    contentRhythm?: string;
    references?: string[];
    creativeSignals?: Array<{
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
      channel?: string;
      status?: string;
      position?: number;
    }>;
    workflow?: {
      squad?: string;
      primaryOwner?: string;
      reviewGate?: string;
      scheduleGate?: string;
      renderGate?: string;
      agentTrail?: Array<{
        id?: string;
        label?: string;
        role?: string;
        output?: string;
      }>;
    };
  };
};

type SchedulePayload = {
  contentPlanVersion?: number;
  cadence?: string;
  items?: Array<{
    position?: number;
    date?: string;
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
  }>;
  workflow?: {
    squad?: string;
    primaryOwner?: string;
    upstreamOwner?: string;
    agentTrail?: Array<{
      id?: string;
      label?: string;
      role?: string;
      output?: string;
    }>;
  };
};

type ScheduleItem = {
  position: number;
  date?: string;
  channel: string;
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
  status: string;
};

type RenderedAssetManifest = {
  title: string;
  status: string;
  clientName: string;
  clientId: string;
  variantType: "overview" | "headline";
  variantLabel: string;
  focusItem: ScheduleItem | null;
  artDirection: {
    key: string;
    label: string;
    mood: string;
    composition: string;
    notes: readonly string[];
    palette: RenderPalette;
  };
  regeneration?: {
    mode: RenderedAssetRegenerationMode;
    sourceAssetId: string;
    sourceVersion: number;
    note?: string | null;
    artDirectionKey?: string | null;
  } | null;
  contentPackageVersion: number | null;
  scheduleVersion: number | null;
  renderEngine: string;
  assetFormat: string;
  previewDataUrl: string;
  previewMimeType: string;
  summary: string;
  workflow: {
    squad: string;
    owner: string;
    trail: Array<{
      id: string;
      label: string;
      role: string;
      output: string;
    }>;
  };
  direction: {
    firstPass: string;
    hookSystem: string;
    masterAsset: string;
    contentRhythm: string;
    productImagePolicy: string;
    rules: string[];
  };
  items: ScheduleItem[];
  creativeSignals: Array<{
    id: string;
    position: number;
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
    channel: string;
    status: string;
  }>;
  references: string[];
  createdAt: string;
};

type RenderMode = "remotion" | "playwright";

type RenderedAssetRegenerationMode = "auto" | "alternate" | "revision";

type RenderedDiskAsset = {
  assetPath: string;
  assetMimeType: string;
  assetFormat: string;
  assetWidth: number;
  assetHeight: number;
  renderEngine: string;
  subtitlePath?: string;
  soundtrackPath?: string;
};

type RenderedAssetQueuePayload = RenderedAssetManifest & {
  manifest?: RenderedAssetManifest;
  renderMode: RenderMode;
  htmlContent: string;
  renderJob: {
    compositionId: string;
    fps: number;
    durationInFrames: number;
    width: number;
    height: number;
  };
  subtitlePath?: string;
  soundtrackPath?: string;
};

const TABLE_NAME = "rendered_assets";
const OUTPUT_DIR = join(tmpdir(), "omniagent-rendered-assets");
const REMOTION_COMPOSITION_ID = "CopyMotionVideo";
const REMOTION_BACKGROUND = "#0f172a";
const REMOTION_FOREGROUND = "#f8fafc";
const REMOTION_MUTED = "#cbd5e1";
const REMOTION_BORDER = "rgba(148,163,184,0.24)";
const REMOTION_ACCENT = "#2563eb";
const REMOTION_ACCENT_SOFT = "rgba(37,99,235,0.16)";

let queueWorkerTimer: NodeJS.Timeout | null = null;
let queueWorkerRunning = false;

let schemaReady: Promise<void> | null = null;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const getContentPackagePayload = (contentPackage: { payload_json: unknown; version: number; id: string } | null): ContentPackagePayload | null => {
  if (!contentPackage || typeof contentPackage.payload_json !== "object" || contentPackage.payload_json === null) {
    return null;
  }

  return contentPackage.payload_json as ContentPackagePayload;
};

const getSchedulePayload = (schedule: { payload_json: unknown; version: number; id: string } | null): SchedulePayload | null => {
  if (!schedule || typeof schedule.payload_json !== "object" || schedule.payload_json === null) {
    return null;
  }

  return schedule.payload_json as SchedulePayload;
};

const ensureSchema = async () => {
  if (!isDatabaseConfigured()) return;

  if (!schemaReady) {
    schemaReady = (async () => {
      await query(
        `create table if not exists ${TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           version integer not null,
           status text not null default 'draft',
           content_package_id uuid null references content_packages(id) on delete set null,
           content_package_version integer null,
           schedule_id uuid null references schedules(id) on delete set null,
           schedule_version integer null,
           render_engine text not null default 'playwright-screenshot',
           asset_format text not null default 'png',
           asset_path text null,
           asset_mime_type text null,
           asset_width integer null,
           asset_height integer null,
           preview_data_url text null,
           preview_mime_type text null,
           html_content text null,
           payload_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now(),
           unique (client_id, version)
         )`,
      );

      await query(`create index if not exists ${TABLE_NAME}_client_version_idx on ${TABLE_NAME} (client_id, version desc)`);
      await query(`create index if not exists ${TABLE_NAME}_client_status_idx on ${TABLE_NAME} (client_id, status)`);
      await query(`create index if not exists ${TABLE_NAME}_client_package_idx on ${TABLE_NAME} (client_id, content_package_version desc, schedule_version desc)`);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
};

const getNextVersion = async (clientId: string) => {
  const row = await queryOne<{ version: number }>(
    `select coalesce(max(version), 0) + 1 as version
     from ${TABLE_NAME}
     where client_id = $1`,
    [clientId],
  );

  return Number(row?.version ?? 1);
};

const safeText = (value: unknown, fallback = "") => (typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback);

const hashText = (value: string) =>
  Array.from(value).reduce((hash, char) => {
    const next = (hash << 5) - hash + char.charCodeAt(0);
    return next | 0;
  }, 0);

const pickBySeed = (seed: string, options: string[]) => options[Math.abs(hashText(seed)) % options.length];

type RenderPalette = {
  bg1: string;
  bg2: string;
  panel: string;
  panelStrong: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
};

const RENDER_PALETTES: RenderPalette[] = [
  {
    bg1: "#f8efe6",
    bg2: "#efe3d7",
    panel: "rgba(255,248,240,0.78)",
    panelStrong: "rgba(255,255,255,0.86)",
    border: "rgba(160, 105, 67, 0.18)",
    text: "#111827",
    muted: "#5b6472",
    accent: "#c2410c",
    accentSoft: "rgba(194,65,12,0.10)",
    accentText: "#7c2d12",
  },
  {
    bg1: "#eff6ff",
    bg2: "#dbeafe",
    panel: "rgba(239,246,255,0.84)",
    panelStrong: "rgba(255,255,255,0.90)",
    border: "rgba(37, 99, 235, 0.16)",
    text: "#0f172a",
    muted: "#475569",
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.10)",
    accentText: "#1d4ed8",
  },
  {
    bg1: "#ecfdf5",
    bg2: "#d1fae5",
    panel: "rgba(236,253,245,0.84)",
    panelStrong: "rgba(255,255,255,0.88)",
    border: "rgba(22, 163, 74, 0.16)",
    text: "#052e16",
    muted: "#4b5563",
    accent: "#16a34a",
    accentSoft: "rgba(22,163,74,0.10)",
    accentText: "#15803d",
  },
  {
    bg1: "#fdf2f8",
    bg2: "#fce7f3",
    panel: "rgba(253,242,248,0.84)",
    panelStrong: "rgba(255,255,255,0.88)",
    border: "rgba(219, 39, 119, 0.16)",
    text: "#312e81",
    muted: "#6b7280",
    accent: "#db2777",
    accentSoft: "rgba(219,39,119,0.10)",
    accentText: "#be185d",
  },
];

const getRenderPalette = (manifest: RenderedAssetManifest) =>
  RENDER_PALETTES[Math.abs(hashText(`${manifest.title}|${manifest.clientId}|${manifest.workflow.owner}`)) % RENDER_PALETTES.length];

const ART_DIRECTION_LIBRARY = [
  {
    key: "editorial-board",
    label: "Board editorial",
    mood: "Denso, forte e legível",
    composition: "blocos, contraste e hierarquia de título",
    notes: [
      "Usado para carrosséis de selling and positioning.",
      "A leitura precisa parecer de peça aprovada, não de briefing.",
      "Os blocos sustentam tese, prova e fecho sem poluir a tela.",
    ],
    palette: RENDER_PALETTES[1],
  },
  {
    key: "kinetic-proof",
    label: "Prova cinética",
    mood: "Ritmo rápido com sensação de processo real",
    composition: "camadas, cortes e leitura em movimento",
    notes: [
      "Usado para reels de proof and process.",
      "A peça precisa parecer capturada em execução, não em slide.",
      "Movimento e prova dividem a atenção em partes claras.",
    ],
    palette: RENDER_PALETTES[3],
  },
  {
    key: "system-minimal",
    label: "Sistema mínimo",
    mood: "Calma, ordem e consistência",
    composition: "respiro, alinhamento e blocos limpos",
    notes: [
      "Usado para posts de organization and routine.",
      "A linguagem visual precisa reduzir ruído e aumentar disciplina.",
      "Menos efeitos, mais estrutura.",
    ],
    palette: RENDER_PALETTES[2],
  },
  {
    key: "objection-grid",
    label: "Grade de objeções",
    mood: "Tático, direto e diagnóstico",
    composition: "grid de dúvidas com resposta forte",
    notes: [
      "Usado para carrosséis que atacam fricção de compra.",
      "Cada bloco responde uma dúvida com uma única ideia.",
      "O título precisa funcionar como corte de objeção.",
    ],
    palette: RENDER_PALETTES[0],
  },
] as const;

const getArtDirectionForItem = (item: ScheduleItem, index: number): (typeof ART_DIRECTION_LIBRARY)[number] => {
  const normalized = `${item.channel}|${item.format}|${item.pillar}|${item.angle}|${item.title}`.toLowerCase();
  const isReel = normalized.includes("reel");
  const isOrganization = normalized.includes("organization") || normalized.includes("routine") || normalized.includes("organiza");
  const isObjection = normalized.includes("dúvida") || normalized.includes("duvida") || normalized.includes("friction") || normalized.includes("objection");
  const isSelling = normalized.includes("selling") || normalized.includes("positioning") || normalized.includes("venda");

  if (isReel) {
    return ART_DIRECTION_LIBRARY[1];
  }

  if (isOrganization) {
    return ART_DIRECTION_LIBRARY[2];
  }

  if (isObjection) {
    return ART_DIRECTION_LIBRARY[3];
  }

  if (isSelling) {
    return ART_DIRECTION_LIBRARY[0];
  }

  return ART_DIRECTION_LIBRARY[index % ART_DIRECTION_LIBRARY.length];
};

const getAlternativeArtDirectionForItem = (
  item: ScheduleItem,
  index: number,
  currentKey?: string | null,
): (typeof ART_DIRECTION_LIBRARY)[number] => {
  if (ART_DIRECTION_LIBRARY.length <= 1) {
    return ART_DIRECTION_LIBRARY[0];
  }

  const currentIndex = currentKey ? ART_DIRECTION_LIBRARY.findIndex((direction) => direction.key === currentKey) : -1;
  const fallbackIndex = getArtDirectionForItem(item, index);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ART_DIRECTION_LIBRARY.length : (index + 1) % ART_DIRECTION_LIBRARY.length;
  const alternate = ART_DIRECTION_LIBRARY[nextIndex] ?? fallbackIndex;

  if (alternate.key !== currentKey) {
    return alternate;
  }

  return ART_DIRECTION_LIBRARY[(nextIndex + 1) % ART_DIRECTION_LIBRARY.length] ?? fallbackIndex;
};

const getItemPalette = (item: { channel: string; format: string; title: string }, index: number) => {
  const seed = `${item.channel}|${item.format}|${item.title}|${index}`.toLowerCase();
  const presets = [
    {
      surface: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(255,255,255,0.72))",
      border: "rgba(37,99,235,0.22)",
      accent: "#2563eb",
      glow: "rgba(37,99,235,0.16)",
      chipBg: "rgba(37,99,235,0.10)",
      chipText: "#1d4ed8",
    },
    {
      surface: "linear-gradient(135deg, rgba(194,65,12,0.12), rgba(255,247,237,0.82))",
      border: "rgba(194,65,12,0.22)",
      accent: "#c2410c",
      glow: "rgba(194,65,12,0.16)",
      chipBg: "rgba(194,65,12,0.10)",
      chipText: "#9a3412",
    },
    {
      surface: "linear-gradient(135deg, rgba(22,163,74,0.12), rgba(236,253,245,0.82))",
      border: "rgba(22,163,74,0.22)",
      accent: "#16a34a",
      glow: "rgba(22,163,74,0.16)",
      chipBg: "rgba(22,163,74,0.10)",
      chipText: "#15803d",
    },
    {
      surface: "linear-gradient(135deg, rgba(219,39,119,0.12), rgba(253,242,248,0.82))",
      border: "rgba(219,39,119,0.22)",
      accent: "#db2777",
      glow: "rgba(219,39,119,0.16)",
      chipBg: "rgba(219,39,119,0.10)",
      chipText: "#be185d",
    },
  ];

  return presets[Math.abs(hashText(seed)) % presets.length];
};

const createPreviewDataUrl = (manifest: RenderedAssetManifest) => {
  const palette = manifest.variantType === "headline" ? manifest.artDirection.palette : getRenderPalette(manifest);
  const trail = manifest.workflow.trail.slice(0, 4);
  const items = manifest.items.slice(0, manifest.variantType === "headline" ? 1 : 4);
  const focus = manifest.focusItem;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1600" viewBox="0 0 1280 1600">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${palette.bg1}" />
          <stop offset="100%" stop-color="${palette.bg2}" />
        </linearGradient>
      </defs>
      <rect width="1280" height="1600" rx="56" fill="url(#bg)" />
      <rect x="64" y="64" width="1152" height="1472" rx="40" fill="${palette.panelStrong}" stroke="${palette.border}" />
      <text x="112" y="160" fill="${palette.accentText}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">${escapeXml(manifest.variantType === "headline" ? "HEADLINE ART" : "CAMPAIGN OVERVIEW")}</text>
      <text x="112" y="240" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="800">${escapeXml(manifest.title)}</text>
      <text x="112" y="304" fill="${palette.muted}" font-family="Arial, Helvetica, sans-serif" font-size="26">${escapeXml(manifest.summary)}</text>
      <rect x="112" y="360" width="520" height="76" rx="22" fill="${palette.accent}" />
      <text x="140" y="410" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">${escapeXml(manifest.variantLabel)}</text>
      <text x="112" y="506" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">
        ${escapeXml(manifest.variantType === "headline" ? "Headline selecionada" : "Workflow trail")}
      </text>
      ${manifest.variantType === "headline" && focus
        ? `
          <rect x="112" y="548" width="1056" height="248" rx="28" fill="${palette.panel}" stroke="${palette.border}" />
          <text x="148" y="618" fill="${palette.accentText}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" letter-spacing="0.18em">${escapeXml(focus.channel)} · ${escapeXml(focus.format)}</text>
          <text x="148" y="680" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="800">${escapeXml(focus.title)}</text>
          <text x="148" y="744" fill="${palette.muted}" font-family="Arial, Helvetica, sans-serif" font-size="24">${escapeXml(focus.objective)}</text>
        `
        : trail
            .map(
              (agent, index) => `
            <rect x="112" y="${548 + index * 96}" width="1056" height="72" rx="20" fill="${index % 2 === 0 ? palette.panel : palette.panelStrong}" stroke="${palette.border}" />
            <text x="142" y="${593 + index * 96}" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">${escapeXml(agent.label)}</text>
            <text x="420" y="${593 + index * 96}" fill="${palette.muted}" font-family="Arial, Helvetica, sans-serif" font-size="22">${escapeXml(agent.role)}</text>
            <text x="940" y="${593 + index * 96}" fill="${palette.accentText}" font-family="Arial, Helvetica, sans-serif" font-size="20">${escapeXml(agent.output)}</text>
          `,
            )
            .join("")}
      <text x="112" y="964" fill="#111827" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">
        ${escapeXml(manifest.variantType === "headline" ? "Contexto da pauta" : "Items")}
      </text>
      ${items
        .map(
          (item, index) => `
            <rect x="112" y="${1010 + index * 104}" width="1056" height="84" rx="20" fill="${index % 2 === 0 ? palette.panelStrong : palette.panel}" stroke="${palette.border}" />
            <text x="142" y="${1060 + index * 104}" fill="${palette.text}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">${escapeXml(item.title)}</text>
            <text x="142" y="${1088 + index * 104}" fill="${palette.muted}" font-family="Arial, Helvetica, sans-serif" font-size="20">${escapeXml(`${item.channel} · ${item.format} · ${item.status}`)}</text>
          `,
        )
        .join("")}
      <text x="112" y="1490" fill="#9ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">${escapeXml(manifest.renderEngine)} · ${escapeXml(manifest.assetFormat)} · ${new Date(manifest.createdAt).toLocaleString("pt-BR")}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
};

const normalizeRenderedAssetManifest = (payload: unknown): RenderedAssetManifest | null => {
  const record = asRecord(payload);
  const manifestRecord = asRecord(record?.manifest) ?? record;

  if (!manifestRecord) {
    return null;
  }

  return manifestRecord as RenderedAssetManifest;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

type VisualStyleConfig = {
  bg: string;
  heroBg: string;
  panel: string;
  text: string;
  titleFont: string;
  bodyFont: string;
  accent: string;
  border: string;
  effects: string;
  noise: number;
};

const VISUAL_STYLES: Record<string, VisualStyleConfig> = {
  "dark-premium": {
    bg: "#0D0D0D",
    heroBg: "linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)",
    panel: "rgba(255, 255, 255, 0.03)",
    text: "#F5F5DC",
    titleFont: "'Playfair Display', serif",
    bodyFont: "Inter, sans-serif",
    accent: "#D4AF37",
    border: "rgba(212, 175, 55, 0.2)",
    effects: "backdrop-filter: blur(20px); box-shadow: 0 40px 100px rgba(0,0,0,0.8);",
    noise: 0.05,
  },
  "editorial-magazine": {
    bg: "#F9F7F2",
    heroBg: "white",
    panel: "#FFFFFF",
    text: "#1A1A1A",
    titleFont: "Inter, sans-serif",
    bodyFont: "'Georgia', serif",
    accent: "#B22222",
    border: "#E5E1D8",
    effects: "box-shadow: 15px 15px 0px #E5E1D8;",
    noise: 0.02,
  },
  "high-energy-cyber": {
    bg: "#0F0121",
    heroBg: "linear-gradient(135deg, #1A0B3B 0%, #0F0121 100%)",
    panel: "rgba(255, 255, 255, 0.05)",
    text: "#FFFFFF",
    titleFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
    accent: "#00F2FF",
    border: "rgba(0, 242, 255, 0.3)",
    effects: "text-shadow: 0 0 15px rgba(0, 242, 255, 0.5); box-shadow: 0 0 30px rgba(0, 242, 255, 0.15);",
    noise: 0.08,
  },
  "minimalist-texture": {
    bg: "#F0F0F0",
    heroBg: "#F0F0F0",
    panel: "rgba(255, 255, 255, 0.8)",
    text: "#333333",
    titleFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
    accent: "#6B705C",
    border: "rgba(0, 0, 0, 0.05)",
    effects: "box-shadow: 0 20px 50px rgba(0,0,0,0.05);",
    noise: 0.03,
  },
};

const getStyleConfig = (styleName: string = ""): VisualStyleConfig => {
  const normalized = styleName.toLowerCase().replace(/\s+/g, "-");
  return VISUAL_STYLES[normalized] || VISUAL_STYLES["minimalist-texture"];
};

const buildRenderedAssetHtml = (input: {
  clientName: string;
  contentPackageVersion: number | null;
  scheduleVersion: number | null;
  contentPackagePayload: ContentPackagePayload | null;
  schedulePayload: SchedulePayload | null;
  manifest: RenderedAssetManifest;
}) => {
  const selectedStyle: any = input.manifest.variantType === "headline" ? input.manifest.artDirection.palette : getRenderPalette(input.manifest);
  const title = safeText(
    input.manifest.variantType === "headline" && input.manifest.focusItem ? input.manifest.focusItem.title : input.contentPackagePayload?.visualDirection?.title,
    `${input.clientName} visual direction`,
  );
  const tagline = safeText(
    input.manifest.variantType === "headline" && input.manifest.focusItem
      ? input.manifest.focusItem.objective
      : input.contentPackagePayload?.visualDirection?.firstPass,
    "direção visual profissional",
  );
  const items = (input.manifest.variantType === "headline" ? [input.manifest.focusItem].filter(Boolean) : input.schedulePayload?.items ?? []).slice(0, 6) as Array<
    NonNullable<(typeof input.manifest)["focusItem"]>
  >;
  const channels = input.contentPackagePayload?.visualDirection?.supportChannels ?? [];
  const heroLabel = input.manifest.variantType === "headline" ? input.manifest.artDirection.label : "overview";
  const heroNotes = input.manifest.variantType === "headline" ? input.manifest.artDirection.notes : ["Uma peça editorial", "Leitura clara", "Pronta para aprovação"];
  const shellBackground =
    input.manifest.variantType === "headline"
      ? `radial-gradient(circle at 12% 10%, ${selectedStyle.accentSoft}, transparent 30%), linear-gradient(135deg, ${selectedStyle.bg1}, ${selectedStyle.bg2})`
      : `linear-gradient(135deg, ${selectedStyle.bg1}, ${selectedStyle.bg2})`;

  const itemCards =
    input.manifest.variantType === "headline"
      ? `
        <div style="display:grid; gap:22px;">
          <div style="background:${selectedStyle.panel}; border:1px solid ${selectedStyle.border}; border-radius: 28px; padding: 30px; ${input.manifest.variantType === "headline" ? "box-shadow: 0 30px 80px rgba(0,0,0,0.10);" : ""}">
          <div style="font-size: 12px; font-weight: 800; color: ${selectedStyle.accentText}; text-transform: uppercase; letter-spacing: 0.16em;">${escapeXml(input.manifest.variantLabel)}</div>
          <div style="font-family: ${input.manifest.variantType === "headline" ? "'Iowan Old Style', Georgia, serif" : "Inter, sans-serif"}; font-size: 34px; font-weight: 800; color: ${selectedStyle.text}; margin-top: 14px; line-height: 1.02;">${escapeXml(title)}</div>
          <div style="font-size: 18px; color: ${selectedStyle.muted}; margin-top: 16px; line-height: 1.55;">${escapeXml(tagline)}</div>
          ${input.manifest.regeneration?.note ? `<div style="margin-top: 16px; display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 999px; background: ${selectedStyle.accentSoft}; color: ${selectedStyle.accentText}; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">revisão: ${escapeXml(input.manifest.regeneration.note)}</div>` : ""}
        </div>
          <div style="display:grid; gap:12px; grid-template-columns: repeat(2, minmax(0, 1fr));">
            ${heroNotes
              .map(
                (note) => `
                  <div style="background:${selectedStyle.panelStrong}; border:1px solid ${selectedStyle.border}; border-radius: 22px; padding: 18px 20px; color:${selectedStyle.text}; font-size: 14px; font-weight: 700; line-height: 1.45;">
                    ${escapeXml(note)}
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      `
      : items
          .map((item, index) => {
            return `
              <div style="background:${selectedStyle.panel}; border: 1px solid ${selectedStyle.border}; border-radius: 20px; padding: 24px; ${selectedStyle.effects}">
                <div style="font-size: 12px; font-weight: 800; color: ${selectedStyle.accent}; text-transform: uppercase; letter-spacing: 0.1em;">${escapeXml(item.channel ?? "social")}</div>
                <div style="font-family: ${selectedStyle.titleFont}; font-size: 24px; font-weight: 800; color: ${selectedStyle.text}; margin-top: 12px;">${escapeXml(item.title ?? "Item")}</div>
                <div style="font-family: ${selectedStyle.bodyFont}; font-size: 14px; color: ${selectedStyle.text}; opacity: 0.7; margin-top: 12px; line-height: 1.5;">${escapeXml(item.objective ?? "")}</div>
              </div>
            `;
          })
          .join("");

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            background: ${shellBackground};
            color: ${selectedStyle.text};
            font-family: ${selectedStyle.bodyFont};
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 1600px;
            width: 1280px;
            position: relative;
            overflow: hidden;
          }
          body::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: ${input.manifest.variantType === "headline" ? 0.06 : 0.03};
            pointer-events: none;
          }
          .shell {
            width: 1100px;
            display: grid;
            gap: 34px;
            z-index: 1;
          }
          .hero {
            background: ${input.manifest.variantType === "headline" ? selectedStyle.panelStrong : selectedStyle.panel};
            padding: ${input.manifest.variantType === "headline" ? "72px" : "80px"};
            border-radius: 40px;
            border: 1px solid ${selectedStyle.border};
            ${selectedStyle.effects}
            position: relative;
          }
          .hero h1 {
            font-family: ${input.manifest.variantType === "headline" ? "'Iowan Old Style', Georgia, serif" : selectedStyle.titleFont};
            font-size: ${input.manifest.variantType === "headline" ? "84px" : "90px"};
            margin: 0;
            line-height: 0.94;
            letter-spacing: -0.05em;
          }
          .tagline {
            font-size: ${input.manifest.variantType === "headline" ? "26px" : "24px"};
            margin-top: 28px;
            opacity: 0.82;
            max-width: 760px;
            line-height: 1.45;
          }
          .grid {
            display: grid;
            grid-template-columns: ${input.manifest.variantType === "headline" ? "1fr" : "repeat(2, 1fr)"};
            gap: 22px;
          }
          .accent-bar {
            width: 100px;
            height: 10px;
            background: ${selectedStyle.accent};
            margin-bottom: 28px;
          }
          .meta-row {
            margin-top: 26px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid ${selectedStyle.border};
            background: ${selectedStyle.panelStrong};
            color: ${selectedStyle.accentText};
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="shell">
          <section class="hero">
            <div class="accent-bar"></div>
            <div class="chip">${escapeXml(heroLabel)}</div>
            <h1>${escapeXml(title)}</h1>
            <div class="tagline">${escapeXml(tagline)}</div>
            <div class="meta-row">
              ${input.manifest.variantType === "headline"
              ? `
                  <span class="chip">${escapeXml(input.manifest.focusItem?.channel ?? "instagram")}</span>
                  <span class="chip">${escapeXml(input.manifest.focusItem?.format ?? "post")}</span>
                  <span class="chip">${escapeXml(input.manifest.focusItem?.pillar ?? "positioning")}</span>
                `
                : `
                  <span class="chip">${escapeXml(input.manifest.workflow.owner)}</span>
                  <span class="chip">${escapeXml(input.manifest.direction.masterAsset)}</span>
                  ${channels.slice(0, 2)
                    .map((channel) => `<span class="chip">${escapeXml(channel)}</span>`)
                    .join("")}
                `}
            </div>
          </section>
          <div class="grid">
            ${itemCards}
          </div>
        </div>
      </body>
    </html>
  `;
};

const writeFallbackAsset = async (input: {
  clientId: string;
  version: number;
  htmlContent: string;
  manifest: RenderedAssetManifest;
}) => {
  const clientDir = join(OUTPUT_DIR, input.clientId);
  await mkdir(clientDir, { recursive: true });
  const filePath = join(clientDir, `render-${input.version}.svg`);
  const base64Svg = input.manifest.previewDataUrl.replace(/^data:image\/svg\+xml;base64,/, "");
  await writeFile(filePath, Buffer.from(base64Svg, "base64"));

  return {
    assetPath: filePath,
    assetMimeType: "image/svg+xml",
    assetFormat: "svg",
    assetWidth: 1280,
    assetHeight: 1600,
    renderEngine: "svg-fallback",
  };
};

const tryRenderScreenshot = async (input: { clientId: string; version: number; htmlContent: string }) => {
  const clientDir = join(OUTPUT_DIR, input.clientId);
  await mkdir(clientDir, { recursive: true });
  const filePath = join(clientDir, `render-${input.version}.png`);
  let browser: any = null;

  try {
    const playwright = await import("playwright");
    browser = await playwright.chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage({
      viewport: {
        width: 1280,
        height: 1600,
      },
      deviceScaleFactor: 1,
    });

    await page.setContent(input.htmlContent, { waitUntil: "networkidle" });
    await page.screenshot({ path: filePath, fullPage: true, type: "png" });

    return {
      assetPath: filePath,
      assetMimeType: "image/png",
      assetFormat: "png",
      assetWidth: 1280,
      assetHeight: 1600,
      renderEngine: "playwright-screenshot",
    };
  } catch {
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
};

const buildManifest = (input: {
  clientId: string;
  clientName: string;
  contentPackage: { id: string; version: number; payload_json: unknown } | null;
  schedule: { id: string; version: number; payload_json: unknown } | null;
}) => {
  const contentPackagePayload = getContentPackagePayload(input.contentPackage);
  const schedulePayload = getSchedulePayload(input.schedule);
  const visualDirection = contentPackagePayload?.visualDirection;
  const visualDirectionRules = Array.isArray(visualDirection?.rules)
    ? visualDirection.rules.filter((rule): rule is string => typeof rule === "string" && rule.trim().length > 0)
    : [];
  const visualDirectionCreativeSignals = Array.isArray(visualDirection?.creativeSignals) ? visualDirection.creativeSignals : [];
  const items = (schedulePayload?.items ?? []).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const workflowTrail = visualDirection?.workflow?.agentTrail ?? schedulePayload?.workflow?.agentTrail ?? [];
  const normalizedTrail = workflowTrail
    .filter((agent): agent is NonNullable<typeof agent> => Boolean(agent))
    .map((agent, index) => ({
      id: safeText(agent.id, `agent-${index + 1}`),
      label: safeText(agent.label, "agent"),
      role: safeText(agent.role, "work"),
      output: safeText(agent.output, "output.md"),
    }));

  const baseManifest: RenderedAssetManifest = {
    title: visualDirection?.title ?? `${input.clientName} render manifest`,
    status: "ready",
    clientName: input.clientName,
    clientId: input.clientId,
    variantType: "overview",
    variantLabel: safeText(visualDirection?.title, "Campaign overview"),
    focusItem: null,
    artDirection: {
      key: "overview",
      label: safeText(visualDirection?.title, "Overview board"),
      mood: safeText(visualDirection?.firstPass, "Uma direção editorial limpa"),
      composition: safeText(visualDirection?.hookSystem, "gancho > prova > fecho"),
      notes: visualDirectionRules.slice(0, 3),
      palette: RENDER_PALETTES[1],
    },
    contentPackageVersion: input.contentPackage?.version ?? null,
    scheduleVersion: input.schedule?.version ?? null,
    renderEngine: "playwright-screenshot",
    assetFormat: "png",
    previewDataUrl: "",
    previewMimeType: "image/svg+xml",
    summary:
      visualDirection?.productImagePolicy ??
      `Render manifest com ${items.length} item(ns) e ${normalizedTrail.length} passo(s) de workflow.`,
    workflow: {
      squad: visualDirection?.workflow?.squad ?? schedulePayload?.workflow?.squad ?? "social-growth",
      owner: visualDirection?.workflow?.primaryOwner ?? schedulePayload?.workflow?.primaryOwner ?? "visual-director",
      trail: normalizedTrail,
    },
    direction: {
      firstPass: safeText(visualDirection?.firstPass, "uma ideia clara por peça"),
      hookSystem: safeText(visualDirection?.hookSystem, "gancho > prova > fecho"),
      masterAsset: safeText(visualDirection?.masterAsset, "Instagram"),
      contentRhythm: safeText(visualDirection?.contentRhythm, schedulePayload?.cadence ?? "cadência editorial"),
      productImagePolicy: safeText(
        visualDirection?.productImagePolicy,
        "Uma peça clara, com leitura rápida e próximo passo visível.",
      ),
      rules: visualDirectionRules,
    },
    items: items.map((item, index) => ({
      position: typeof (item as Record<string, unknown>).position === "number" ? Number((item as Record<string, unknown>).position) : index + 1,
      title: safeText((item as Record<string, unknown>).title, `Item ${index + 1}`),
      channel: safeText((item as Record<string, unknown>).channel, "instagram"),
      format: safeText((item as Record<string, unknown>).format, "post"),
      pillar: safeText((item as Record<string, unknown>).pillar, "editorial"),
      angle: safeText((item as Record<string, unknown>).angle, "positioning"),
      status: safeText((item as Record<string, unknown>).status, "planned"),
      objective: safeText((item as Record<string, unknown>).objective, "Objetivo editorial"),
      reason: safeText((item as Record<string, unknown>).reason, "Razão editorial"),
      hook: safeText((item as Record<string, unknown>).hook, "Gancho editorial"),
      proof: safeText((item as Record<string, unknown>).proof, "Prova curta"),
      cta: safeText((item as Record<string, unknown>).cta, "Próximo passo"),
      visualCue: safeText((item as Record<string, unknown>).visualCue, "Layout editorial"),
    })),
    creativeSignals: ((visualDirectionCreativeSignals.length > 0 ? visualDirectionCreativeSignals : items) as Array<Record<string, unknown>>)
      .slice(0, 4)
      .map((signal, index) => ({
        id: safeText(signal.id, `signal-${index + 1}`),
        position: typeof signal.position === "number" ? Number(signal.position) : index + 1,
        title: safeText(signal.title, `Sinal ${index + 1}`),
        pillar: safeText(signal.pillar, "editorial"),
        angle: safeText(signal.angle, "positioning"),
        objective: safeText(signal.objective, "Objetivo editorial"),
        reason: safeText(signal.reason, "Razão editorial"),
        format: safeText(signal.format, "post"),
        hook: safeText(signal.hook, "Gancho editorial"),
        proof: safeText(signal.proof, "Prova curta"),
        cta: safeText(signal.cta, "Próximo passo"),
        visualCue: safeText(signal.visualCue, "Layout editorial"),
        channel: safeText(signal.channel, "instagram"),
        status: safeText(signal.status, "planned"),
      })),
    references: Array.isArray(visualDirection?.references)
      ? visualDirection.references.filter((reference): reference is string => typeof reference === "string" && reference.trim().length > 0)
      : [],
    createdAt: new Date().toISOString(),
  };

  baseManifest.previewDataUrl = createPreviewDataUrl(baseManifest);
  return baseManifest;
};

const buildHeadlineManifest = (input: {
  baseManifest: RenderedAssetManifest;
  focusItem: ScheduleItem;
  itemIndex: number;
  itemCount: number;
  regeneration?: {
    mode: RenderedAssetRegenerationMode;
    sourceAssetId: string;
    sourceVersion: number;
    note?: string | null;
    artDirectionKey?: string | null;
  } | null;
  artDirection?: RenderedAssetManifest["artDirection"] | null;
}) => {
  const artDirection = input.artDirection ?? getArtDirectionForItem(input.focusItem, input.itemIndex);
  const channel = safeText(input.focusItem.channel, "instagram");
  const format = safeText(input.focusItem.format, "post");
  const variantLabel = `${channel} · ${format} · ${artDirection.label} (${input.itemIndex + 1}/${input.itemCount})${
    input.regeneration ? " · revisão" : ""
  }`;

  const manifest: RenderedAssetManifest = {
    ...input.baseManifest,
    title: input.focusItem.title,
    summary: input.focusItem.objective || input.focusItem.reason || input.baseManifest.summary,
    variantType: "headline",
    variantLabel,
    focusItem: input.focusItem,
    artDirection,
    regeneration: input.regeneration ?? null,
    items: [input.focusItem],
    creativeSignals: [input.focusItem as unknown as RenderedAssetManifest["creativeSignals"][number]],
    references: [input.focusItem.title, input.focusItem.objective, input.focusItem.reason, input.focusItem.cta].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    ),
    previewMimeType: "image/svg+xml",
    previewDataUrl: "",
    createdAt: new Date().toISOString(),
  };

  manifest.previewDataUrl = createPreviewDataUrl(manifest);
  return manifest;
};

const buildOverviewManifest = (input: {
  baseManifest: RenderedAssetManifest;
  regeneration?: {
    mode: RenderedAssetRegenerationMode;
    sourceAssetId: string;
    sourceVersion: number;
    note?: string | null;
    artDirectionKey?: string | null;
  } | null;
}) => {
  const manifest: RenderedAssetManifest = {
    ...input.baseManifest,
    variantType: "overview",
    variantLabel: `${input.baseManifest.variantLabel}${input.regeneration ? " · revisão" : ""}`,
    regeneration: input.regeneration ?? null,
  };

  manifest.previewDataUrl = createPreviewDataUrl(manifest);
  return manifest;
};

const buildQueuePayloadFromManifest = (manifest: RenderedAssetManifest, htmlContent: string) => ({
  manifest,
  ...manifest,
  status: "queued",
  renderEngine: "remotion",
  renderMode: "remotion",
  htmlContent,
  renderJob: {
    compositionId: REMOTION_COMPOSITION_ID,
    ...getRemotionRenderDefaults(),
  },
  assetPath: null,
  assetMimeType: "video/mp4",
  assetWidth: null,
  assetHeight: null,
});

const createQueuedRenderedAssetFromManifest = async (input: {
  clientId: string;
  version: number;
  contentPackageId: string | null;
  contentPackageVersion: number | null;
  scheduleId: string | null;
  scheduleVersion: number | null;
  manifest: RenderedAssetManifest;
  htmlContent: string;
}) =>
  createRenderedAssetVersion({
    clientId: input.clientId,
    version: input.version,
    contentPackageId: input.contentPackageId,
    contentPackageVersion: input.contentPackageVersion,
    scheduleId: input.scheduleId,
    scheduleVersion: input.scheduleVersion,
    status: "queued",
    renderEngine: "remotion",
    assetFormat: "mp4",
    assetPath: null,
    assetMimeType: "video/mp4",
    assetWidth: null,
    assetHeight: null,
    previewDataUrl: input.manifest.previewDataUrl,
    previewMimeType: input.manifest.previewMimeType,
    htmlContent: input.htmlContent,
    payload: buildQueuePayloadFromManifest(input.manifest, input.htmlContent),
  });

const renderManifestToDisk = async (input: {
  clientId: string;
  version: number;
  htmlContent: string;
  manifest: RenderedAssetManifest;
  renderMode?: RenderMode;
}): Promise<RenderedDiskAsset> => {
  if (input.renderMode === "remotion") {
    try {
      const remotionProps = buildRemotionCopyMotionProps(input.manifest, input.htmlContent);
      const disk = await renderCopyMotionVideo({
        outputLocation: join(OUTPUT_DIR, input.clientId, `render-${input.version}.mp4`),
        props: remotionProps,
      });

      return disk;
    } catch (error) {
      console.warn("Remotion render failed, falling back to screenshot", {
        clientId: input.clientId,
        version: input.version,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  const screenshot = await tryRenderScreenshot({
    clientId: input.clientId,
    version: input.version,
    htmlContent: input.htmlContent,
  });

  if (screenshot) {
    return screenshot;
  }

  return writeFallbackAsset({
    clientId: input.clientId,
    version: input.version,
    htmlContent: input.htmlContent,
    manifest: input.manifest,
  });
};

const buildRemotionCopyMotionProps = (manifest: RenderedAssetManifest, htmlContent: string) => {
  const defaults = getRemotionRenderDefaults();
  const leadSignal = manifest.creativeSignals[0] ?? null;
  const supportingSignals = manifest.creativeSignals.slice(1, 4);
  return {
    title: manifest.title,
    summary: manifest.summary,
    clientName: manifest.clientName,
    focusItem: manifest.focusItem,
    artDirection: manifest.artDirection,
    variantType: manifest.variantType,
    variantLabel: manifest.variantLabel,
    variantIndex: manifest.focusItem?.position ?? 0,
    variantCount: manifest.items.length,
    regenerationMode: manifest.regeneration?.mode ?? null,
    regenerationNote: manifest.regeneration?.note ?? null,
    workflowOwner: manifest.workflow.owner,
    workflowSquad: manifest.workflow.squad,
    workflowTrail: manifest.workflow.trail,
    items: manifest.items,
    creativeSignals: manifest.creativeSignals,
    references: manifest.references,
    direction: manifest.direction,
    leadSignal,
    supportingSignals,
    accent: REMOTION_ACCENT,
    accentSoft: REMOTION_ACCENT_SOFT,
    background: REMOTION_BACKGROUND,
    foreground: REMOTION_FOREGROUND,
    muted: REMOTION_MUTED,
    border: REMOTION_BORDER,
    htmlContent,
    renderJob: {
      compositionId: REMOTION_COMPOSITION_ID,
      fps: defaults.fps,
      durationInFrames: defaults.durationInFrames,
      width: defaults.width,
      height: defaults.height,
    },
    renderMode: "remotion" as const,
    renderEngine: "remotion",
  };
};

const renderedAssetSelectColumns = `id, client_id, version, status, content_package_id, content_package_version,
            schedule_id, schedule_version, render_engine, asset_format, asset_path,
            asset_mime_type, asset_width, asset_height, preview_data_url, preview_mime_type,
            html_content, payload_json, created_at, updated_at`;

const updateRenderedAssetVersion = async (input: {
  id: string;
  status: string;
  renderEngine: string;
  assetFormat: string;
  assetPath: string | null;
  assetMimeType: string | null;
  assetWidth: number | null;
  assetHeight: number | null;
  previewDataUrl: string | null;
  previewMimeType: string | null;
  htmlContent: string | null;
  payload: Record<string, unknown>;
}) => {
  await ensureSchema();

  return withTransaction(async (client) => {
    const result = await client.query<RenderedAssetRow>(
      `update ${TABLE_NAME}
       set status = $2,
           render_engine = $3,
           asset_format = $4,
           asset_path = $5,
           asset_mime_type = $6,
           asset_width = $7,
           asset_height = $8,
           preview_data_url = $9,
           preview_mime_type = $10,
           html_content = $11,
           payload_json = $12::jsonb,
           updated_at = now()
       where id = $1
       returning ${renderedAssetSelectColumns}`,
      [
        input.id,
        input.status,
        input.renderEngine,
        input.assetFormat,
        input.assetPath,
        input.assetMimeType,
        input.assetWidth,
        input.assetHeight,
        input.previewDataUrl,
        input.previewMimeType,
        input.htmlContent,
        JSON.stringify(input.payload),
      ],
    );

    return result.rows[0] ?? null;
  });
};

const claimNextQueuedRenderedAsset = async () => {
  await ensureSchema();

  return withTransaction(async (client) => {
    const result = await client.query<RenderedAssetRow>(
      `select ${renderedAssetSelectColumns}
       from ${TABLE_NAME}
       where status = 'queued'
       order by created_at asc, version asc
       for update skip locked
       limit 1`,
    );

    const nextAsset = result.rows[0];

    if (!nextAsset) {
      return null;
    }

    const claimed = await client.query<RenderedAssetRow>(
      `update ${TABLE_NAME}
       set status = 'rendering',
           updated_at = now()
       where id = $1
       returning ${renderedAssetSelectColumns}`,
      [nextAsset.id],
    );

    return claimed.rows[0] ?? null;
  });
};

const getQueuePayload = (asset: RenderedAssetRow) => {
  const payload = asRecord(asset.payload_json);

  if (!payload) {
    return null;
  }

  const htmlContent = typeof payload.htmlContent === "string" ? payload.htmlContent : asset.html_content ?? "";
  const manifestRecord = asRecord(payload.manifest) ?? payload;

  if (!manifestRecord) {
    return null;
  }

  return {
    htmlContent,
    manifest: manifestRecord as unknown as RenderedAssetManifest,
    renderMode: payload.renderMode === "remotion" ? "remotion" : "playwright",
    renderJob: asRecord(payload.renderJob) ?? {},
  };
};

const renderQueuedRenderedAsset = async (asset: RenderedAssetRow) => {
  const queuePayload = getQueuePayload(asset);

  if (!queuePayload) {
    throw new Error("Queued rendered asset is missing render payload");
  }

  const renderMode = queuePayload.renderMode === "remotion" ? "remotion" : "playwright";
  const disk = await renderManifestToDisk({
    clientId: asset.client_id,
    version: asset.version,
    htmlContent: queuePayload.htmlContent,
    manifest: queuePayload.manifest,
    renderMode,
  });

  const nextPayload = {
    ...queuePayload.manifest,
    status: "ready",
    renderEngine: disk.renderEngine,
    renderMode,
    htmlContent: queuePayload.htmlContent,
    renderJob: queuePayload.renderJob,
    assetPath: disk.assetPath,
    assetMimeType: disk.assetMimeType,
    assetWidth: disk.assetWidth,
    assetHeight: disk.assetHeight,
    subtitlePath: disk.subtitlePath,
    soundtrackPath: disk.soundtrackPath,
  };

  return updateRenderedAssetVersion({
    id: asset.id,
    status: "ready",
    renderEngine: disk.renderEngine,
    assetFormat: disk.assetFormat,
    assetPath: disk.assetPath,
    assetMimeType: disk.assetMimeType,
    assetWidth: disk.assetWidth,
    assetHeight: disk.assetHeight,
    previewDataUrl: queuePayload.manifest.previewDataUrl,
    previewMimeType: queuePayload.manifest.previewMimeType,
    htmlContent: queuePayload.htmlContent,
    payload: nextPayload,
  });
};

const failRenderedAsset = async (asset: RenderedAssetRow, error: unknown) => {
  const queuePayload = getQueuePayload(asset);
  const payload = queuePayload?.manifest ?? (asRecord(asset.payload_json) as unknown as RenderedAssetManifest | null);
  const message = error instanceof Error ? error.message : "Unknown render failure";

  return updateRenderedAssetVersion({
    id: asset.id,
    status: "failed",
    renderEngine: asset.render_engine,
    assetFormat: asset.asset_format,
    assetPath: asset.asset_path,
    assetMimeType: asset.asset_mime_type,
    assetWidth: asset.asset_width,
    assetHeight: asset.asset_height,
    previewDataUrl: asset.preview_data_url,
    previewMimeType: asset.preview_mime_type,
    htmlContent: asset.html_content,
    payload: {
      ...(asRecord(asset.payload_json) ?? {}),
      status: "failed",
      renderEngine: asset.render_engine,
      renderError: message,
      renderFailedAt: new Date().toISOString(),
      manifest: payload,
    },
  });
};

export const processRenderedAssetQueueOnce = async () => {
  if (queueWorkerRunning) {
    return;
  }

  queueWorkerRunning = true;

  try {
    while (true) {
      const nextAsset = await claimNextQueuedRenderedAsset();

      if (!nextAsset) {
        break;
      }

      try {
        await renderQueuedRenderedAsset(nextAsset);
      } catch (error) {
        await failRenderedAsset(nextAsset, error);
      }
    }
  } finally {
    queueWorkerRunning = false;
  }
};

export const startRenderedAssetQueueWorker = (options: { keepAlive?: boolean } = {}) => {
  if (queueWorkerTimer) {
    return;
  }

  queueWorkerTimer = setInterval(() => {
    void processRenderedAssetQueueOnce();
  }, 5000);

  if (!options.keepAlive) {
    queueWorkerTimer.unref();
  }

  void processRenderedAssetQueueOnce();
};

export const findLatestRenderedAssetByClientId = async (clientId: string) => {
  await ensureSchema();

  return queryOne<RenderedAssetRow>(
    `select id, client_id, version, status, content_package_id, content_package_version,
            schedule_id, schedule_version, render_engine, asset_format, asset_path,
            asset_mime_type, asset_width, asset_height, preview_data_url, preview_mime_type,
            html_content, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc
     limit 1`,
    [clientId],
  );
};

export const listRenderedAssetsByClientId = async (clientId: string) => {
  await ensureSchema();

  return query<RenderedAssetRow>(
    `select id, client_id, version, status, content_package_id, content_package_version,
            schedule_id, schedule_version, render_engine, asset_format, asset_path,
            asset_mime_type, asset_width, asset_height, preview_data_url, preview_mime_type,
            html_content, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc`,
    [clientId],
  );
};

export const findRenderedAssetById = async (assetId: string) => {
  await ensureSchema();

  return queryOne<RenderedAssetRow>(
    `select id, client_id, version, status, content_package_id, content_package_version,
            schedule_id, schedule_version, render_engine, asset_format, asset_path,
            asset_mime_type, asset_width, asset_height, preview_data_url, preview_mime_type,
            html_content, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where id = $1
     limit 1`,
    [assetId],
  );
};

export const createRenderedAssetVersion = async (input: {
  clientId: string;
  version?: number;
  contentPackageId: string | null;
  contentPackageVersion: number | null;
  scheduleId: string | null;
  scheduleVersion: number | null;
  status: string;
  renderEngine: string;
  assetFormat: string;
  assetPath: string | null;
  assetMimeType: string | null;
  assetWidth: number | null;
  assetHeight: number | null;
  previewDataUrl: string | null;
  previewMimeType: string | null;
  htmlContent: string | null;
  payload: Record<string, unknown>;
}) => {
  await ensureSchema();

  return withTransaction(async (client) => {
    const version = typeof input.version === "number" ? input.version : await getNextVersion(input.clientId);
    const result = await client.query<RenderedAssetRow>(
      `insert into ${TABLE_NAME} (
         client_id,
         version,
         status,
         content_package_id,
         content_package_version,
         schedule_id,
         schedule_version,
         render_engine,
         asset_format,
         asset_path,
         asset_mime_type,
         asset_width,
         asset_height,
         preview_data_url,
         preview_mime_type,
         html_content,
         payload_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb)
       returning id, client_id, version, status, content_package_id, content_package_version,
                 schedule_id, schedule_version, render_engine, asset_format, asset_path,
                 asset_mime_type, asset_width, asset_height, preview_data_url, preview_mime_type,
                 html_content, payload_json, created_at, updated_at`,
      [
        input.clientId,
        version,
        input.status,
        input.contentPackageId,
        input.contentPackageVersion,
        input.scheduleId,
        input.scheduleVersion,
        input.renderEngine,
        input.assetFormat,
        input.assetPath,
        input.assetMimeType,
        input.assetWidth,
        input.assetHeight,
        input.previewDataUrl,
        input.previewMimeType,
        input.htmlContent,
        JSON.stringify(input.payload),
      ],
    );

    return result.rows[0];
  });
};

export const refreshRenderedAssetsForClient = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [contentPackage, schedule] = await Promise.all([
    findLatestContentPackageByClientId(input.clientId),
    findLatestScheduleByClientId(input.clientId),
  ]);

  if (!contentPackage) {
    return null;
  }

  const manifest = buildManifest({
    clientId: input.clientId,
    clientName: client.name,
    contentPackage,
    schedule,
  });

  const contentPackagePayload = getContentPackagePayload(contentPackage);
  const schedulePayload = getSchedulePayload(schedule);
  const baseVersion = await getNextVersion(input.clientId);
  const itemManifests = manifest.items.slice(0, 4).map((item, index) =>
    buildHeadlineManifest({
      baseManifest: manifest,
      focusItem: item,
      itemIndex: index,
      itemCount: manifest.items.length,
    }),
  );
  const overviewHtmlContent = buildRenderedAssetHtml({
    clientName: client.name,
    contentPackageVersion: contentPackage.version,
    scheduleVersion: schedule?.version ?? null,
    contentPackagePayload,
    schedulePayload,
    manifest,
  });

  const itemAssets: RenderedAssetRow[] = [];

  for (const [index, itemManifest] of itemManifests.entries()) {
    const htmlContent = buildRenderedAssetHtml({
      clientName: client.name,
      contentPackageVersion: contentPackage.version,
      scheduleVersion: schedule?.version ?? null,
      contentPackagePayload,
      schedulePayload,
      manifest: itemManifest,
    });

    const asset = await createQueuedRenderedAssetFromManifest({
      clientId: input.clientId,
      version: baseVersion + index,
      contentPackageId: contentPackage.id,
      contentPackageVersion: contentPackage.version,
      scheduleId: schedule?.id ?? null,
      scheduleVersion: schedule?.version ?? null,
      manifest: itemManifest,
      htmlContent,
    });

    itemAssets.push(asset);
  }

  const overviewAsset = await createQueuedRenderedAssetFromManifest({
    clientId: input.clientId,
    version: baseVersion + itemManifests.length,
    contentPackageId: contentPackage.id,
    contentPackageVersion: contentPackage.version,
    scheduleId: schedule?.id ?? null,
    scheduleVersion: schedule?.version ?? null,
    manifest,
    htmlContent: overviewHtmlContent,
  });

  void processRenderedAssetQueueOnce();

  return overviewAsset ?? itemAssets[0] ?? null;
};

export const regenerateRenderedAssetForClient = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  renderedAssetId: string;
  mode: RenderedAssetRegenerationMode;
  revisionNote?: string | null;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const sourceAsset = await findRenderedAssetById(input.renderedAssetId);

  if (!sourceAsset || sourceAsset.client_id !== input.clientId) {
    throw createError("NOT_FOUND", "Rendered asset not found", 404);
  }

  const sourceManifest = normalizeRenderedAssetManifest(sourceAsset.payload_json);

  if (!sourceManifest) {
    throw createError("FAILED_PRECONDITION", "Rendered asset payload is missing manifest data", 422);
  }

  const [contentPackage, schedule] = await Promise.all([
    findLatestContentPackageByClientId(input.clientId),
    findLatestScheduleByClientId(input.clientId),
  ]);

  if (!contentPackage) {
    throw createError("FAILED_PRECONDITION", "Content production package is required before regenerating a rendered asset", 422);
  }

  const baseVersion = await getNextVersion(input.clientId);
  const sourceFocusItem = sourceManifest.focusItem ?? sourceManifest.items[0] ?? null;
  const normalizedMode: RenderedAssetRegenerationMode = input.mode;
  const sourceIsHeadline = sourceManifest.variantType === "headline" && sourceFocusItem !== null;
  const selectedMode = sourceManifest.variantType === "headline" && sourceFocusItem ? normalizedMode : "auto";
  const requestedNote = typeof input.revisionNote === "string" && input.revisionNote.trim().length > 0 ? input.revisionNote.trim() : null;
  const sourceArtDirection = sourceManifest.artDirection;
  const alternateDirection =
    sourceIsHeadline && sourceFocusItem
      ? getAlternativeArtDirectionForItem(sourceFocusItem, sourceFocusItem.position - 1, sourceArtDirection?.key ?? null)
      : sourceArtDirection;

  const regeneratedHeadlineManifest =
    sourceIsHeadline && sourceFocusItem
      ? buildHeadlineManifest({
          baseManifest: sourceManifest,
          focusItem: sourceFocusItem,
          itemIndex: Math.max(0, sourceFocusItem.position - 1),
          itemCount: sourceManifest.items.length || 1,
          artDirection: selectedMode === "alternate" ? alternateDirection : sourceArtDirection,
          regeneration: {
            mode: selectedMode,
            sourceAssetId: sourceAsset.id,
            sourceVersion: sourceAsset.version,
            note: selectedMode === "revision" ? requestedNote : null,
            artDirectionKey: (selectedMode === "alternate" ? alternateDirection : sourceArtDirection)?.key ?? null,
          },
        })
      : null;

  const overviewManifest = buildOverviewManifest({
    baseManifest: {
      ...sourceManifest,
      regeneration: {
        mode: selectedMode,
        sourceAssetId: sourceAsset.id,
        sourceVersion: sourceAsset.version,
        note: requestedNote,
        artDirectionKey: sourceArtDirection?.key ?? null,
      },
      previewDataUrl: sourceManifest.previewDataUrl,
    },
    regeneration: {
      mode: selectedMode,
      sourceAssetId: sourceAsset.id,
      sourceVersion: sourceAsset.version,
      note: requestedNote,
      artDirectionKey: sourceArtDirection?.key ?? null,
    },
  });

  const overviewHtmlContent = buildRenderedAssetHtml({
    clientName: client.name,
    contentPackageVersion: contentPackage.version,
    scheduleVersion: schedule?.version ?? null,
    contentPackagePayload: getContentPackagePayload(contentPackage),
    schedulePayload: getSchedulePayload(schedule),
    manifest: overviewManifest,
  });

  const overviewVersion = sourceIsHeadline ? baseVersion + 1 : baseVersion;
  const regeneratedAsset = sourceIsHeadline && regeneratedHeadlineManifest
    ? await createQueuedRenderedAssetFromManifest({
        clientId: input.clientId,
        version: baseVersion,
        contentPackageId: sourceAsset.content_package_id ?? contentPackage.id,
        contentPackageVersion: sourceAsset.content_package_version ?? contentPackage.version,
        scheduleId: sourceAsset.schedule_id ?? schedule?.id ?? null,
        scheduleVersion: sourceAsset.schedule_version ?? schedule?.version ?? null,
        manifest: regeneratedHeadlineManifest,
        htmlContent: buildRenderedAssetHtml({
          clientName: client.name,
          contentPackageVersion: contentPackage.version,
          scheduleVersion: schedule?.version ?? null,
          contentPackagePayload: getContentPackagePayload(contentPackage),
          schedulePayload: getSchedulePayload(schedule),
          manifest: regeneratedHeadlineManifest,
        }),
      })
    : null;

  const refreshedOverview = await createQueuedRenderedAssetFromManifest({
    clientId: input.clientId,
    version: overviewVersion,
    contentPackageId: contentPackage.id,
    contentPackageVersion: contentPackage.version,
    scheduleId: schedule?.id ?? null,
    scheduleVersion: schedule?.version ?? null,
    manifest: overviewManifest,
    htmlContent: overviewHtmlContent,
  });

  void processRenderedAssetQueueOnce();

  return refreshedOverview ?? regeneratedAsset;
};

export const getRenderedAssetManifest = (asset: RenderedAssetRow) => {
  return normalizeRenderedAssetManifest(asset.payload_json);
};

export const getRenderedAssetFileInfo = (asset: RenderedAssetRow) => {
  const payload = asRecord(asset.payload_json);

  return {
    assetPath: asset.asset_path ?? null,
    subtitlePath: typeof payload?.subtitlePath === "string" ? payload.subtitlePath : null,
    soundtrackPath: typeof payload?.soundtrackPath === "string" ? payload.soundtrackPath : null,
    assetMimeType: asset.asset_mime_type ?? "application/octet-stream",
    assetWidth: asset.asset_width ?? null,
    assetHeight: asset.asset_height ?? null,
    previewDataUrl: typeof payload?.previewDataUrl === "string" ? payload.previewDataUrl : asset.preview_data_url ?? null,
    previewMimeType: asset.preview_mime_type ?? null,
  };
};

export const hasRenderedAssetFile = (asset: RenderedAssetRow) => {
  return typeof asset.asset_path === "string" && asset.asset_path.length > 0 && existsSync(asset.asset_path);
};

export const hasRenderedAssetSubtitle = (asset: RenderedAssetRow) => {
  const payload = asRecord(asset.payload_json);
  const subtitlePath = typeof payload?.subtitlePath === "string" ? payload.subtitlePath : null;
  return typeof subtitlePath === "string" && subtitlePath.length > 0 && existsSync(subtitlePath);
};

export const hasRenderedAssetSoundtrack = (asset: RenderedAssetRow) => {
  const payload = asRecord(asset.payload_json);
  const soundtrackPath = typeof payload?.soundtrackPath === "string" ? payload.soundtrackPath : null;
  return typeof soundtrackPath === "string" && soundtrackPath.length > 0 && existsSync(soundtrackPath);
};
