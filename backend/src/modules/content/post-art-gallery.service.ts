import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type Theme = { bg1: string; bg2: string; accent: string; ink: string; soft: string };

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
    }>;
    workflow?: {
      squad?: string;
      primaryOwner?: string;
      reviewGate?: string;
      renderGate?: string;
      scheduleGate?: string;
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
    format?: string;
    status?: string;
    reason?: string;
    hook?: string;
    proof?: string;
    cta?: string;
    visualCue?: string;
  }>;
};

type GallerySourceItem = {
  position: number;
  title: string;
  channel: string;
  format: string;
  pillar: string;
  angle: string;
  objective: string;
  reason: string;
  hook: string;
  proof: string;
  cta: string;
  visualCue: string;
  status: string;
};

type GalleryVariantQuality = {
  totalScore: number;
  copyScore: number;
  visualScore: number;
  clarityScore: number;
  accessibilityScore: number;
  strengths: string[];
  risks: string[];
  suggestions: string[];
};

type WorkflowTrailItem = {
  id: string;
  label: string;
  role: string;
  output: string;
};

type VariantLayoutStyle = "hero" | "split" | "magazine" | "poster";

type WorkflowTrailInput = ContentPackagePayload["visualDirection"] extends { workflow?: { agentTrail?: infer A } } ? A : unknown;

export type PostArtGalleryMode = "feed_carousel" | "story" | "all";

type GalleryVariant = {
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
  sourceItem: GallerySourceItem | null;
  quality: GalleryVariantQuality;
};

export type PostArtGalleryResult = {
  mode: PostArtGalleryMode;
  title: string;
  summary: string;
  clientId: string;
  clientName: string;
  contentPackageVersion: number | null;
  scheduleVersion: number | null;
  overallScore: number;
  generatedAt: string;
  variants: GalleryVariant[];
};

const safeText = (value: unknown, fallback = "") => (typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toBase64DataUrl = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

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

const normalizeSourceItems = (
  contentPackage: { payload_json: unknown; version: number; id: string } | null,
  schedule: { payload_json: unknown; version: number; id: string } | null,
): GallerySourceItem[] => {
  const schedulePayload = getSchedulePayload(schedule);
  const scheduleItems = Array.isArray(schedulePayload?.items) ? schedulePayload.items : [];

  if (scheduleItems.length > 0) {
    return scheduleItems.slice(0, 4).map((item, index) => ({
      position: typeof item.position === "number" ? item.position : index + 1,
      title: safeText(item.title, `Post ${index + 1}`),
      channel: safeText(item.channel, "instagram"),
      format: safeText(item.format, index === 0 ? "feed" : "carrossel"),
      pillar: safeText(item.pillar, "editorial"),
      angle: safeText(item.angle, ""),
      objective: safeText(item.objective, ""),
      reason: safeText(item.reason, ""),
      hook: safeText(item.hook, ""),
      proof: safeText(item.proof, ""),
      cta: safeText(item.cta, ""),
      visualCue: safeText(item.visualCue, ""),
      status: safeText(item.status, "planned"),
    }));
  }

  const contentPackagePayload = getContentPackagePayload(contentPackage);
  const creativeSignals = Array.isArray(contentPackagePayload?.visualDirection?.creativeSignals)
    ? contentPackagePayload?.visualDirection?.creativeSignals
    : [];

  if (creativeSignals.length > 0) {
    return creativeSignals.slice(0, 4).map((item, index) => ({
      position: index + 1,
      title: safeText(item.title, `Post ${index + 1}`),
      channel: index === 0 ? "instagram-feed" : "instagram-carousel",
      format: safeText(item.format, index === 0 ? "feed" : "carrossel"),
      pillar: safeText(item.pillar, "editorial"),
      angle: safeText(item.angle, ""),
      objective: safeText(item.objective, ""),
      reason: safeText(item.reason, ""),
      hook: safeText(item.hook, ""),
      proof: safeText(item.proof, ""),
      cta: safeText(item.cta, ""),
      visualCue: safeText(item.visualCue, ""),
      status: "planned",
    }));
  }

  const items = contentPackagePayload?.items ?? [];

  return items.slice(0, 4).map((item, index) => ({
    position: index + 1,
    title: safeText(item, `Post ${index + 1}`),
    channel: index === 0 ? "instagram-feed" : "instagram-carousel",
    format: index === 0 ? "feed" : "carrossel",
    pillar: "editorial",
    angle: "",
    objective: "",
    reason: "",
    hook: "",
    proof: "",
    cta: "",
    visualCue: "",
    status: "planned",
  }));
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const countWords = (text: string) => text.trim().split(/\s+/g).filter(Boolean).length;

const trimWords = (text: string, maxWords: number) => {
  const words = text.trim().split(/\s+/g).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
};

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
};

const lowerFirst = (value: string) => (value.length > 0 ? value[0].toLowerCase() + value.slice(1) : value);

const hashText = (value: string) =>
  Array.from(value).reduce((hash, char) => {
    const next = (hash << 5) - hash + char.charCodeAt(0);
    return next | 0;
  }, 0);

const pickBySeed = (seed: string, options: string[]) => options[Math.abs(hashText(seed)) % options.length];

const normalizeWorkflowTrail = (trail: WorkflowTrailInput): WorkflowTrailItem[] => {
  if (!Array.isArray(trail) || trail.length === 0) {
    return [
      { id: "creator", label: "creator", role: "copy e variações", output: "content-production-package.md" },
      { id: "visual-director", label: "visual-director", role: "direção visual", output: "visual-direction.md" },
      { id: "creative-renderer", label: "creative-renderer", role: "render final", output: "rendered-assets.md" },
      { id: "reviewer", label: "reviewer", role: "revisão", output: "content-review.md" },
    ];
  }

  return trail
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item, index) => ({
      id: safeText(item.id, `agent-${index + 1}`),
      label: safeText(item.label, "agent"),
      role: safeText(item.role, "work"),
      output: safeText(item.output, "output.md"),
    }));
};

const getAgentForLayout = (trail: WorkflowTrailItem[], layoutStyle: VariantLayoutStyle) => {
  const byId = trail.find((item) => item.id === "visual-director") ?? trail[0] ?? null;

  if (layoutStyle === "split") {
    return trail.find((item) => item.id === "creative-renderer") ?? byId;
  }

  if (layoutStyle === "magazine") {
    return trail.find((item) => item.id === "reviewer") ?? byId;
  }

  if (layoutStyle === "poster") {
    return trail.find((item) => item.id === "creator") ?? byId;
  }

  return byId;
};

const buildCreativeSupportCopy = (input: {
  title: string;
  sourceItem: GallerySourceItem | null;
  firstPass: string;
}) => {
  const hook = lowerFirst(firstText(input.sourceItem?.hook));
  const proof = lowerFirst(firstText(input.sourceItem?.proof));
  const reason = lowerFirst(firstText(input.sourceItem?.reason));
  const cue = lowerFirst(firstText(input.sourceItem?.visualCue));
  const objective = lowerFirst(firstText(input.sourceItem?.objective));
  const angle = lowerFirst(firstText(input.sourceItem?.angle));
  const title = lowerFirst(firstText(input.title));
  const seed = `${title}|${objective}|${angle}|${reason}|${cue}|${input.firstPass}`.toLowerCase();

  return firstText(
    hook,
    proof,
    buildCreativeObjectiveLine(
      objective,
      pickBySeed(seed, [
        "A peça precisa organizar a atenção antes de pedir ação.",
        "Quando a mensagem fica clara, a decisão anda mais rápido.",
        "Uma tese direta faz o conteúdo parecer mais útil.",
      ]),
    ),
    pickBySeed(seed, [
      "A leitura melhora quando o benefício aparece cedo.",
      "A peça funciona melhor quando o raciocínio é simples.",
      "A promessa precisa caber em uma única ideia.",
    ]),
  );
};

const buildCreativeObjectiveLine = (objective: string, fallback: string) => {
  if (/surface the pain point/i.test(objective) || /pain point|dor|pain/i.test(objective)) {
    return "A dor certa precisa aparecer antes da solução.";
  }

  if (/show the real product value/i.test(objective) || /value|valor/i.test(objective)) {
    return "O valor real aparece quando a entrega fica concreta.";
  }

  if (/reduce chaos and increase consistency/i.test(objective) || /chaos|consist/i.test(objective)) {
    return "Consistência é o que transforma improviso em rotina.";
  }

  if (/address the main buying friction/i.test(objective) || /friction|fric|objection|obje/i.test(objective)) {
    return "As dúvidas que travam a compra precisam sair da frente.";
  }

  if (/increase perceived value through evidence/i.test(objective) || /proof|prova|evidence|evid/i.test(objective)) {
    return "Prova curta deixa o valor mais crível.";
  }

  if (/clarify the message and reduce friction/i.test(objective)) {
    return "Clareza comercial reduz atrito e acelera a decisão.";
  }

  if (/teach simple selling language/i.test(objective)) {
    return "Uma mensagem simples vende melhor que uma explicação longa.";
  }

  if (/show a simple routine that can be maintained/i.test(objective)) {
    return "A rotina certa precisa caber no dia a dia.";
  }

  if (/demonstrate value without forcing conversion/i.test(objective)) {
    return "Mostre valor sem empurrar a venda.";
  }

  if (/close the cycle with the core thesis/i.test(objective)) {
    return "Feche com uma tese que a audiência consiga repetir.";
  }

  return fallback;
};

const buildCreativeBodyCopy = (input: {
  sourceItem: GallerySourceItem | null;
  firstPass: string;
  productImagePolicy: string;
  rhythm: string;
  layout: "feed" | "story";
}) => {
  const objective = firstText(input.sourceItem?.objective);
  const angle = lowerFirst(firstText(input.sourceItem?.angle));
  const hook = lowerFirst(firstText(input.sourceItem?.hook));
  const proof = lowerFirst(firstText(input.sourceItem?.proof));
  const reason = lowerFirst(firstText(input.sourceItem?.reason));
  const cue = lowerFirst(firstText(input.sourceItem?.visualCue));
  const cta = lowerFirst(firstText(input.sourceItem?.cta));
  const seed = `${objective}|${angle}|${hook}|${proof}|${reason}|${cue}|${input.firstPass}|${input.productImagePolicy}|${input.rhythm}|${input.layout}`.toLowerCase();
  const leadLine = trimWords(
    firstText(
      hook,
      buildCreativeObjectiveLine(
        objective,
        pickBySeed(seed, [
          "A peça precisa organizar a atenção antes de pedir ação.",
          "Quando a mensagem fica clara, a decisão anda mais rápido.",
          "Uma tese direta faz o conteúdo parecer mais útil.",
        ]),
      ),
      angle,
    ),
    10,
  );
  const proofLine = trimWords(
    firstText(
      proof,
      reason,
      pickBySeed(seed, [
        "Mostre o detalhe que sustenta a promessa.",
        "A prova precisa aparecer cedo na peça.",
        "Uma evidência curta vale mais do que explicação longa.",
      ]),
    ),
    13,
  );
  const systemLine = trimWords(
    firstText(
      cue,
      input.productImagePolicy,
      pickBySeed(seed, [
        "Use contraste alto e leitura direta.",
        "Priorize um único bloco de atenção.",
        "Deixe a hierarquia visual falar primeiro.",
      ]),
    ),
    14,
  );
  const rhythmLine = trimWords(
    input.rhythm.length > 0 && countWords(input.rhythm) <= 8 && !/[+/]/.test(input.rhythm)
      ? input.rhythm
      : pickBySeed(seed, ["cadência consistente", "ritmo que sustenta a tese", "presença sem ruído"]),
    6,
  );
  const closeLine = trimWords(
    firstText(
      cta ? `Fecho: ${cta}` : "",
      input.layout === "story"
        ? "Em poucos segundos a peça entrega tese, valor e direção."
        : "A peça termina com leitura simples e próximo passo visível.",
    ),
    12,
  );

  return [leadLine, proofLine, systemLine, rhythmLine, closeLine].filter(Boolean).join("\n");
};

const buildCreativeCta = (input: { layout: "feed" | "story"; sourceItem: GallerySourceItem | null }) => {
  const explicit = firstText(input.sourceItem?.cta);
  if (explicit) {
    return explicit;
  }

  const objective = lowerFirst(firstText(input.sourceItem?.objective));

  if (/proof|prova|evidence|evid/i.test(objective)) {
    return input.layout === "story" ? "Ver a prova" : "Salvar a prova";
  }

  if (/value|valor/i.test(objective)) {
    return input.layout === "story" ? "Entender o valor" : "Revisar a proposta";
  }

  if (/friction|fric|objection|obje/i.test(objective)) {
    return input.layout === "story" ? "Vencer a objeção" : "Salvar para comparar";
  }

  return input.layout === "story" ? "Continuar a sequência" : "Salvar e revisar depois";
};

const buildQuality = (input: { title: string; subtitle: string; caption: string; cta: string; sourceItem: GallerySourceItem | null }) => {
  const titleWords = countWords(input.title);
  const subtitleWords = countWords(input.subtitle);
  const captionWords = countWords(input.caption);
  const captionLines = input.caption
    .split(/\n+/g)
    .map((line) => line.trim())
    .filter(Boolean).length;
  const objectiveWords = countWords(input.sourceItem?.objective ?? "");
  const hasCTA = input.cta.trim().length > 0;
  const hasNumbers = /\d/.test(input.title) || /\d/.test(input.subtitle) || /\d/.test(input.caption);
  const isConciseTitle = titleWords >= 4 && titleWords <= 10;
  const isReadableSubtitle = subtitleWords >= 8 && subtitleWords <= 24;
  const isReadableCaption = captionWords <= 40;
  const isStructuredCaption = captionLines >= 3 && captionLines <= 5;

  const copyScore = clampScore(
    42 +
      (isConciseTitle ? 24 : titleWords < 4 ? 14 : 10) +
      (isReadableSubtitle ? 20 : subtitleWords < 8 ? 10 : 12) +
      (isReadableCaption ? 10 : 4) +
      (isStructuredCaption ? 6 : 0) +
      (hasCTA ? 4 : 0) +
      (hasNumbers ? 2 : 0),
  );

  const visualScore = clampScore(
    60 +
      (hasNumbers ? 10 : 0) +
      (input.sourceItem?.format === "carrossel" ? 8 : 4) +
      (input.subtitle.length > 0 ? 8 : 0) +
      (input.caption.length > 0 ? 6 : 0) +
      (objectiveWords > 0 ? 4 : 0),
  );

  const clarityScore = clampScore(
    50 +
      (input.sourceItem?.objective ? 18 : 10) +
      (input.sourceItem?.angle ? 12 : 6) +
      (input.caption.length < 220 ? 12 : 6) +
      (isStructuredCaption ? 4 : 0) +
      (input.title.length > 0 ? 8 : 0),
  );

  const accessibilityScore = clampScore(
    74 +
      (input.title.length <= 80 ? 8 : 4) +
      (input.subtitle.length <= 140 ? 8 : 4) +
      (input.caption.length <= 220 ? 6 : 2) +
      (hasCTA ? 4 : 0),
  );

  const totalScore = clampScore((copyScore + visualScore + clarityScore + accessibilityScore) / 4);

  const strengths = [
    isConciseTitle ? "Gancho legível em leitura rápida." : "Gancho com densidade suficiente.",
    hasCTA ? "CTA explícito presente." : "CTA implícito, mas pode ficar mais direto.",
    isStructuredCaption ? "Copy em blocos curtos e escaneáveis." : "Copy legível em um único bloco.",
    input.sourceItem?.format ? `Formato claramente identificado como ${input.sourceItem.format}.` : "Formato visual consistente.",
  ];

  const risks: string[] = [];
  const suggestions: string[] = [];

  if (!isConciseTitle) {
    risks.push("Título fora da faixa ideal para leitura rápida.");
    suggestions.push("Encurte o título ou quebre a promessa em duas linhas.");
  }
  if (!isReadableSubtitle) {
    risks.push("Subtítulo pode ficar denso demais no mobile.");
    suggestions.push("Reduza o subtítulo para 1 ou 2 frases curtas.");
  }
  if (!hasCTA) {
    risks.push("CTA ausente ou pouco explícito.");
    suggestions.push("Acrescente uma instrução final clara de ação.");
  }
  if (!isReadableCaption) {
    risks.push("Legenda longa demais para o primeiro impacto.");
    suggestions.push("Resuma a legenda em 3 a 5 linhas curtas.");
  }
  if (!isStructuredCaption) {
    risks.push("A copy poderia aproveitar melhor a hierarquia em blocos.");
    suggestions.push("Quebre a copy em gancho, prova e fecho.");
  }

  return {
    totalScore,
    copyScore,
    visualScore,
    clarityScore,
    accessibilityScore,
    strengths,
    risks,
    suggestions,
  };
};

const buildFeedVariantSvg = (input: {
  title: string;
  subtitle: string;
  caption: string;
  cta: string;
  badge: string;
  theme: { bg1: string; bg2: string; accent: string; ink: string; soft: string };
  sourceItem: GallerySourceItem | null;
  layoutStyle: VariantLayoutStyle;
  agent: WorkflowTrailItem | null;
  background?: string;
}) => {
  const item = input.sourceItem;
  const itemLine1 = item ? `${item.channel} · ${item.format}` : "feed · carrossel";
  const itemLine2 = item ? `${item.pillar}${item.angle ? ` · ${item.angle}` : ""}` : "estrutura visual";
  const agent = input.agent ?? { label: "visual-director", role: "direção visual", output: "visual-direction.md" };
  const agentSignature = `${agent.label} · ${agent.role}`;
  const agentOutput = agent.output;
  const surfaces = getLayoutSurfaces(input.layoutStyle);

  const backgroundLayer = input.background
    ? `<image width="1080" height="1920" preserveAspectRatio="xMidYMid slice" href="${input.background}" opacity="0.45" />`
    : "";

  const svg = input.layoutStyle === "split"
    ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1350" rx="54" fill="url(#bg)" fill-opacity="0.65" />
      <rect x="54" y="54" width="300" height="1242" rx="42" fill="${input.theme.ink}" />
      <rect x="54" y="54" width="300" height="1242" rx="42" fill="rgba(0,0,0,0.08)" />
      <circle cx="140" cy="154" r="54" fill="rgba(255,255,255,0.14)" />
      <circle cx="250" cy="250" r="26" fill="rgba(255,255,255,0.12)" />
      <text x="92" y="118" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <text x="92" y="178" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="900">${escapeXml(itemLine1.toUpperCase())}</text>
      <text x="92" y="224" fill="rgba(255,255,255,0.78)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">AGENTE · ${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="92" y="278" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800">Responsável</text>
      <text x="92" y="320" fill="rgba(255,255,255,0.82)" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${escapeXml(agentOutput)}</text>
      <rect x="392" y="88" width="636" height="138" rx="28" fill="${surfaces.panel}" stroke="${surfaces.stroke}" />
      <text x="420" y="138" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="0.08em">GANCHO</text>
      <foreignObject x="420" y="152" width="580" height="56">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:24px;line-height:1.45;color:${input.theme.ink};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <text x="392" y="286" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="900">${escapeXml(input.title)}</text>
      <rect x="392" y="330" width="636" height="418" rx="28" fill="${surfaces.panelStrong}" stroke="${surfaces.stroke}" />
      <text x="420" y="376" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">DESENVOLVIMENTO</text>
      <foreignObject x="420" y="392" width="580" height="310">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.65;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="392" y="780" width="636" height="164" rx="30" fill="url(#accent)" />
      <text x="420" y="826" fill="rgba(255,255,255,0.72)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="420" y="876" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="392" y="1110" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(item?.title ? `Origem: ${item.title}` : "Origem: direção visual do pacote")}</text>
      <text x="392" y="1160" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`
    : input.layoutStyle === "magazine"
      ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1350" rx="54" fill="url(#bg)" fill-opacity="0.65" />
      <rect x="54" y="54" width="972" height="1242" rx="42" fill="${surfaces.shell}" stroke="${surfaces.stroke}" />
      <rect x="92" y="92" width="168" height="42" rx="21" fill="url(#accent)" />
      <text x="176" y="120" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <rect x="92" y="160" width="896" height="112" rx="24" fill="${surfaces.panel}" />
      <text x="120" y="206" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="120" y="246" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="900">${escapeXml(itemLine1.toUpperCase())}</text>
      <text x="92" y="350" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="60" font-weight="900">${escapeXml(input.title)}</text>
      <rect x="92" y="404" width="896" height="104" rx="22" fill="${surfaces.panel}" />
      <text x="120" y="446" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">GANCHO</text>
      <foreignObject x="120" y="458" width="816" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.45;color:${input.theme.ink};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="92" y="542" width="430" height="362" rx="28" fill="${surfaces.panelStrong}" stroke="${surfaces.stroke}" />
      <rect x="548" y="542" width="440" height="362" rx="28" fill="${surfaces.panel}" stroke="${surfaces.stroke}" />
      <text x="120" y="586" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">DESENVOLVIMENTO</text>
      <foreignObject x="120" y="600" width="372" height="260">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.65;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <text x="576" y="586" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">AGENTE</text>
      <foreignObject x="576" y="600" width="382" height="260">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:21px;line-height:1.7;color:${input.theme.ink};white-space:pre-line;">${escapeXml(`Responsável: ${agent.label}\nPapel: ${agent.role}\nSaída: ${agent.output}`)}</div>
      </foreignObject>
      <rect x="92" y="940" width="896" height="138" rx="30" fill="url(#accent)" opacity="0.98" />
      <text x="120" y="988" fill="rgba(255,255,255,0.74)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="120" y="1038" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="92" y="1208" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(item?.title ? `Origem: ${item.title}` : "Origem: direção visual do pacote")}</text>
      <text x="92" y="1260" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`
      : input.layoutStyle === "poster"
        ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1350" rx="54" fill="url(#bg)" fill-opacity="0.65" />
      <circle cx="860" cy="180" r="190" fill="rgba(255,255,255,0.32)" />
      <circle cx="220" cy="1110" r="230" fill="rgba(255,255,255,0.28)" />
      <rect x="54" y="54" width="972" height="1242" rx="42" fill="${surfaces.shell}" stroke="${surfaces.stroke}" />
      <rect x="92" y="92" width="168" height="42" rx="21" fill="url(#accent)" />
      <text x="176" y="120" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <text x="92" y="198" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.18em">${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="92" y="310" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900">${escapeXml(input.title)}</text>
      <foreignObject x="92" y="360" width="860" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:28px;line-height:1.45;color:${input.theme.soft};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="92" y="528" width="896" height="370" rx="34" fill="rgba(15,23,42,0.035)" stroke="rgba(15,23,42,0.06)" />
      <text x="120" y="578" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">DESENVOLVIMENTO</text>
      <foreignObject x="120" y="592" width="816" height="270">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:24px;line-height:1.72;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="92" y="954" width="896" height="154" rx="30" fill="url(#accent)" />
      <text x="120" y="1000" fill="rgba(255,255,255,0.74)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="120" y="1050" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="92" y="1240" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(item?.title ? `Origem: ${item.title}` : "Origem: direção visual do pacote")}</text>
      <text x="92" y="1292" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`
        : `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
        <filter id="noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.35 0" />
        </filter>
        <linearGradient id="hero-arc" x1="0%" x2="100%" y1="100%" y2="0%">
          <stop offset="0%" stop-color="${input.theme.soft}" />
          <stop offset="100%" stop-color="${input.theme.accent}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1350" rx="54" fill="url(#bg)" fill-opacity="0.65" />
      <rect x="-80" y="720" width="1240" height="600" rx="260" fill="url(#hero-arc)" opacity="0.4" filter="url(#noise)" />
      <path d="M0 1020 L1080 560 L1080 1350 L0 1350 Z" fill="rgba(0,0,0,0.12)" />
      <rect x="54" y="54" width="972" height="1242" rx="42" fill="${surfaces.shell}" stroke="${surfaces.stroke}" />
      <rect x="92" y="92" width="168" height="42" rx="21" fill="url(#accent)" />
      <text x="176" y="120" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <text x="92" y="200" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="0.06em">${escapeXml(itemLine1.toUpperCase())}</text>
      <text x="92" y="258" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800">${escapeXml(input.title)}</text>
      <rect x="92" y="304" width="896" height="126" rx="24" fill="${surfaces.panel}" stroke="${surfaces.stroke}" />
      <text x="120" y="348" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">GANCHO</text>
      <foreignObject x="120" y="360" width="816" height="56">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:24px;line-height:1.45;color:${input.theme.ink};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="92" y="452" width="896" height="286" rx="24" fill="${surfaces.panelStrong}" stroke="${surfaces.stroke}" />
      <text x="120" y="496" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">DESENVOLVIMENTO</text>
      <foreignObject x="120" y="508" width="816" height="210">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.62;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="92" y="768" width="896" height="158" rx="28" fill="${surfaces.panel}" />
      <text x="120" y="812" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.08em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="120" y="860" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="92" y="1108" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(`Responsável: ${agentSignature}`)}</text>
      <text x="92" y="1142" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600">AGENTE · ${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="92" y="1160" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`;

  return toBase64DataUrl(svg);
};

const buildStoryVariantSvg = (input: {
  title: string;
  subtitle: string;
  caption: string;
  cta: string;
  badge: string;
  theme: { bg1: string; bg2: string; accent: string; ink: string; soft: string };
  sourceItem: GallerySourceItem | null;
  layoutStyle: VariantLayoutStyle;
  agent: WorkflowTrailItem | null;
  background?: string;
}) => {
  const item = input.sourceItem;
  const itemLine1 = item ? `${item.channel} · story` : "story";
  const itemLine2 = item ? `${item.pillar}${item.angle ? ` · ${item.angle}` : ""}` : "story sequence";
  const agent = input.agent ?? { label: "visual-director", role: "direção visual", output: "visual-direction.md" };
  const agentSignature = `${agent.label} · ${agent.role}`;
  const agentOutput = agent.output;
  const surfaces = getLayoutSurfaces(input.layoutStyle);

  const backgroundLayer = input.background
    ? `<image width="1080" height="1920" preserveAspectRatio="xMidYMid slice" href="${input.background}" opacity="0.45" />`
    : "";

  const svg = input.layoutStyle === "split"
    ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1920" rx="60" fill="url(#bg)" fill-opacity="0.65" />
      <rect x="42" y="42" width="324" height="1836" rx="48" fill="${input.theme.ink}" />
      <circle cx="162" cy="182" r="62" fill="rgba(255,255,255,0.14)" />
      <text x="82" y="116" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <text x="82" y="176" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="900">${escapeXml(itemLine1.toUpperCase())}</text>
      <text x="82" y="228" fill="rgba(255,255,255,0.78)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">AGENTE · ${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="82" y="292" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800">Responsável</text>
      <text x="82" y="334" fill="rgba(255,255,255,0.82)" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${escapeXml(agentOutput)}</text>
      <rect x="404" y="74" width="634" height="220" rx="28" fill="${surfaces.panel}" stroke="${surfaces.stroke}" />
      <text x="432" y="118" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">GANCHO</text>
      <text x="432" y="188" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="900">${escapeXml(input.title)}</text>
      <foreignObject x="432" y="196" width="560" height="72">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:26px;line-height:1.45;color:${input.theme.ink};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="404" y="340" width="634" height="922" rx="28" fill="${surfaces.panelStrong}" stroke="${surfaces.stroke}" />
      <text x="432" y="386" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">DESENVOLVIMENTO</text>
      <foreignObject x="432" y="406" width="566" height="780">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:25px;line-height:1.72;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="404" y="1294" width="634" height="138" rx="30" fill="url(#accent)" />
      <text x="432" y="1338" fill="rgba(255,255,255,0.74)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="432" y="1386" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="82" y="1588" fill="rgba(255,255,255,0.74)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">AGENTE · ${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="82" y="1640" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${escapeXml(`Responsável: ${agentOutput}`)}</text>
      <text x="404" y="1764" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(item?.title ? `Origem: ${item.title}` : "Origem: direção visual do pacote")}</text>
      <text x="404" y="1818" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`
    : input.layoutStyle === "magazine"
      ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1920" rx="60" fill="url(#bg)" fill-opacity="0.65" />
      <rect x="42" y="42" width="996" height="1836" rx="48" fill="${surfaces.shell}" stroke="${surfaces.stroke}" />
      <rect x="82" y="82" width="172" height="46" rx="23" fill="url(#accent)" />
      <text x="168" y="112" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <rect x="82" y="160" width="916" height="154" rx="28" fill="${surfaces.panel}" />
      <text x="112" y="204" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="112" y="268" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="900">${escapeXml(itemLine1.toUpperCase())}</text>
      <text x="82" y="380" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900">${escapeXml(input.title)}</text>
      <rect x="82" y="440" width="916" height="124" rx="26" fill="${surfaces.panel}" />
      <text x="112" y="486" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">GANCHO</text>
      <foreignObject x="112" y="500" width="856" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:24px;line-height:1.45;color:${input.theme.ink};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="82" y="608" width="916" height="1040" rx="28" fill="${surfaces.panelStrong}" stroke="${surfaces.stroke}" />
      <text x="112" y="652" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">DESENVOLVIMENTO</text>
      <foreignObject x="112" y="670" width="856" height="650">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:26px;line-height:1.68;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="112" y="1374" width="856" height="158" rx="30" fill="url(#accent)" />
      <text x="140" y="1418" fill="rgba(255,255,255,0.74)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="140" y="1468" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="82" y="1728" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(`Responsável: ${agentSignature}`)}</text>
      <text x="82" y="1780" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`
      : input.layoutStyle === "poster"
        ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1920" rx="60" fill="url(#bg)" fill-opacity="0.65" />
      <circle cx="860" cy="180" r="190" fill="rgba(255,255,255,0.32)" />
      <circle cx="220" cy="1640" r="220" fill="rgba(255,255,255,0.20)" />
      <rect x="42" y="42" width="996" height="1836" rx="48" fill="${surfaces.shell}" stroke="${surfaces.stroke}" />
      <rect x="82" y="82" width="172" height="46" rx="23" fill="url(#accent)" />
      <text x="168" y="112" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <text x="82" y="198" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.18em">${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="82" y="330" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="74" font-weight="900">${escapeXml(input.title)}</text>
      <foreignObject x="82" y="390" width="860" height="140">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:28px;line-height:1.45;color:${input.theme.soft};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="82" y="570" width="916" height="1108" rx="34" fill="rgba(15,23,42,0.03)" stroke="rgba(15,23,42,0.06)" />
      <text x="120" y="620" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">DESENVOLVIMENTO</text>
      <foreignObject x="120" y="640" width="836" height="700">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:26px;line-height:1.76;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="120" y="1370" width="836" height="166" rx="30" fill="url(#accent)" />
      <text x="148" y="1416" fill="rgba(255,255,255,0.74)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="148" y="1466" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="82" y="1748" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(`Responsável: ${agentSignature}`)}</text>
      <text x="82" y="1800" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">Uma peça que fala por si.</text>
    </svg>`
        : `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.bg1}" />
          <stop offset="100%" stop-color="${input.theme.bg2}" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${input.theme.accent}" />
          <stop offset="100%" stop-color="${input.theme.soft}" />
        </linearGradient>
      </defs>
      ${backgroundLayer}
      <rect width="1080" height="1920" rx="60" fill="url(#bg)" fill-opacity="0.65" />
      <rect x="42" y="42" width="996" height="1836" rx="48" fill="${surfaces.shell}" stroke="${surfaces.stroke}" />
      <rect x="82" y="82" width="172" height="46" rx="23" fill="url(#accent)" />
      <text x="168" y="112" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(input.badge.toUpperCase())}</text>
      <text x="82" y="194" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="0.12em">${escapeXml(itemLine1.toUpperCase())}</text>
      <text x="82" y="286" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="68" font-weight="900">${escapeXml(input.title)}</text>
      <rect x="82" y="346" width="916" height="176" rx="28" fill="${surfaces.panel}" stroke="${surfaces.stroke}" />
      <text x="114" y="392" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.1em">GANCHO</text>
      <foreignObject x="114" y="404" width="860" height="98">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:28px;line-height:1.45;color:${input.theme.ink};font-weight:600;white-space:pre-wrap;">${escapeXml(input.subtitle)}</div>
      </foreignObject>
      <rect x="82" y="548" width="916" height="548" rx="28" fill="${surfaces.panelStrong}" stroke="${surfaces.stroke}" />
      <text x="114" y="594" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.1em">DESENVOLVIMENTO</text>
      <foreignObject x="114" y="610" width="860" height="442">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:25px;line-height:1.72;color:${input.theme.ink};white-space:pre-line;">${escapeXml(input.caption)}</div>
      </foreignObject>
      <rect x="82" y="1128" width="916" height="202" rx="30" fill="${surfaces.panel}" />
      <text x="120" y="1180" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.1em">FECHO · ${escapeXml(itemLine2)}</text>
      <text x="120" y="1234" fill="${input.theme.ink}" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="900">${escapeXml(input.cta)}</text>
      <text x="82" y="1588" fill="${input.theme.soft}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="0.12em">AGENTE · ${escapeXml(agentSignature.toUpperCase())}</text>
      <text x="82" y="1640" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${escapeXml(`Responsável: ${agentOutput}`)}</text>
    </svg>`;

  return toBase64DataUrl(svg);
};

const VARIANT_THEMES = [
  { bg1: "#fff4ea", bg2: "#fde8d6", accent: "#b45309", ink: "#1f2937", soft: "#7c2d12" },
  { bg1: "#eff6ff", bg2: "#dbeafe", accent: "#2563eb", ink: "#0f172a", soft: "#1d4ed8" },
  { bg1: "#f0fdf4", bg2: "#dcfce7", accent: "#16a34a", ink: "#052e16", soft: "#15803d" },
  { bg1: "#fdf2f8", bg2: "#fce7f3", accent: "#db2777", ink: "#312e81", soft: "#be185d" },
];

const LAYOUT_STYLE_THEMES: Record<VariantLayoutStyle, Theme> = {
  hero: { bg1: "#0f172a", bg2: "#1e293b", accent: "#38bdf8", ink: "#e2e8f0", soft: "#b8c6ff" },
  split: { bg1: "#fef3c7", bg2: "#fde68a", accent: "#92400e", ink: "#581c0c", soft: "#78350f" },
  magazine: { bg1: "#ecfeff", bg2: "#cffafe", accent: "#06b6d4", ink: "#0f172a", soft: "#06b6d4" },
  poster: { bg1: "#111827", bg2: "#1f2937", accent: "#f472b6", ink: "#ffffff", soft: "#f9a8d4" },
};

const getLayoutSurfaces = (style: VariantLayoutStyle) => {
  if (style === "hero") {
    return {
      shell: "rgba(15,23,42,0.92)",
      panel: "rgba(15,23,42,0.58)",
      panelStrong: "rgba(15,23,42,0.82)",
      stroke: "rgba(255,255,255,0.12)",
    };
  }

  if (style === "poster") {
    return {
      shell: "rgba(17,24,39,0.94)",
      panel: "rgba(17,24,39,0.60)",
      panelStrong: "rgba(17,24,39,0.84)",
      stroke: "rgba(255,255,255,0.12)",
    };
  }

  if (style === "split") {
    return {
      shell: "rgba(255,248,240,0.94)",
      panel: "rgba(255,247,237,0.82)",
      panelStrong: "rgba(255,255,255,0.90)",
      stroke: "rgba(194,65,12,0.14)",
    };
  }

  return {
    shell: "rgba(255,255,255,0.92)",
    panel: "rgba(236,254,255,0.78)",
    panelStrong: "rgba(255,255,255,0.92)",
    stroke: "rgba(6,182,212,0.12)",
  };
};

type BackgroundAsset = { id: string; dataUrl: string };

const BACKGROUND_DIR = join(process.cwd(), "templates", "bg-genericos");

const loadBackgroundAssets = (directory: string): BackgroundAsset[] => {
  try {
    const files = readdirSync(directory);
    return files
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map((file) => {
        const data = readFileSync(join(directory, file));
        return {
          id: file,
          dataUrl: `data:image/${file.endsWith(".png") ? "png" : file.endsWith(".webp") ? "webp" : "jpeg"};base64,${data.toString("base64")}`,
        };
      });
  } catch {
    return [];
  }
};

const BACKGROUND_ASSETS = loadBackgroundAssets(BACKGROUND_DIR);
const shuffledBackgrounds = [...BACKGROUND_ASSETS].sort(() => Math.random() - 0.5);
const backgroundByStyle = new Map<VariantLayoutStyle, BackgroundAsset>();
let backgroundCursor = 0;

const ensureBackgroundForStyle = (style: VariantLayoutStyle): BackgroundAsset | null => {
  if (backgroundByStyle.has(style)) {
    return backgroundByStyle.get(style)!;
  }

  if (shuffledBackgrounds.length === 0) {
    return null;
  }

  const asset = shuffledBackgrounds[backgroundCursor % shuffledBackgrounds.length];
  backgroundCursor += 1;
  backgroundByStyle.set(style, asset);
  return asset;
};

export const assignBackgroundsForLogging = () => {
  const styles: VariantLayoutStyle[] = ["hero", "split", "magazine", "poster"];
  const assignments = styles.map((style) => {
    const asset = ensureBackgroundForStyle(style);
    return { style, asset };
  });
  return assignments;
};

const buildVariant = (input: {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  caption: string;
  cta: string;
  channel: string;
  format: string;
  sourceItem: GallerySourceItem | null;
  themeIndex: number;
  layout: "feed" | "story";
  layoutStyle: VariantLayoutStyle;
  agent: WorkflowTrailItem | null;
}) => {
  const quality = buildQuality({
    title: input.title,
    subtitle: input.subtitle,
    caption: input.caption,
    cta: input.cta,
    sourceItem: input.sourceItem,
  });

  const backgroundAsset = ensureBackgroundForStyle(input.layoutStyle);
  const theme = LAYOUT_STYLE_THEMES[input.layoutStyle] ?? VARIANT_THEMES[input.themeIndex % VARIANT_THEMES.length];

  return {
    id: input.id,
    label: input.label,
    format: input.format,
    title: input.title,
    subtitle: input.subtitle,
    caption: input.caption,
    cta: input.cta,
    channel: input.channel,
    previewDataUrl:
      input.layout === "story"
        ? buildStoryVariantSvg({
            title: input.title,
            subtitle: input.subtitle,
            caption: input.caption,
            cta: input.cta,
            badge: input.label,
            theme,
            sourceItem: input.sourceItem,
            layoutStyle: input.layoutStyle,
            agent: input.agent,
            background: backgroundAsset?.dataUrl,
          })
        : buildFeedVariantSvg({
            title: input.title,
            subtitle: input.subtitle,
            caption: input.caption,
            cta: input.cta,
            badge: input.label,
            theme,
            sourceItem: input.sourceItem,
            layoutStyle: input.layoutStyle,
            agent: input.agent,
            background: backgroundAsset?.dataUrl,
          }),
    previewMimeType: "image/svg+xml",
    sourceItem: input.sourceItem,
    quality,
  };
};

export const buildPostArtGallery = (input: {
  clientId: string;
  clientName: string;
  contentPackage: { id: string; version: number; payload_json: unknown } | null;
  schedule: { id: string; version: number; payload_json: unknown } | null;
  mode?: PostArtGalleryMode;
}): PostArtGalleryResult => {
  const contentPackagePayload = getContentPackagePayload(input.contentPackage);
  const schedulePayload = getSchedulePayload(input.schedule);
  const sourceItems = normalizeSourceItems(input.contentPackage, input.schedule);
  const visualDirection = contentPackagePayload?.visualDirection;
  const mode = input.mode ?? "feed_carousel";
  const title = safeText(visualDirection?.title, `${input.clientName} post arts`);
  const firstPass = safeText(visualDirection?.firstPass, "Abertura clara com promessa específica");
  const rhythm = safeText(visualDirection?.contentRhythm, schedulePayload?.cadence ?? "cadência editorial");
  const masterAsset = safeText(visualDirection?.masterAsset, "feed");
  const references = visualDirection?.references ?? [];
  const workflowTrail = normalizeWorkflowTrail(visualDirection?.workflow?.agentTrail);

  const feedVariants = [
    (() => {
      const sourceItem = sourceItems[0] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, title), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: safeText(visualDirection?.productImagePolicy, "Uma peça clara, com leitura rápida e próximo passo visível."),
        rhythm,
        layout: "feed",
      });

      return buildVariant({
        id: "cover",
        label: "Capa feed",
        title: safeText(sourceItem?.title, title),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "feed", sourceItem }),
        channel: sourceItem?.channel ?? "instagram-feed",
        format: sourceItem?.format ?? "feed",
        sourceItem,
        themeIndex: 0,
        layout: "feed",
        layoutStyle: "hero",
        agent: getAgentForLayout(workflowTrail, "hero"),
      });
    })(),
    (() => {
      const sourceItem = sourceItems[1] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, "Problema que trava a percepção de valor"), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: safeText(visualDirection?.productImagePolicy, "O valor aparece quando a mensagem deixa de parecer genérica."),
        rhythm,
        layout: "feed",
      });

      return buildVariant({
        id: "carousel-1",
        label: "Slide 2",
        title: safeText(sourceItem?.title, "Problema que trava a percepção de valor"),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "feed", sourceItem }),
        channel: sourceItem?.channel ?? "instagram-carousel",
        format: sourceItem?.format ?? "carrossel",
        sourceItem,
        themeIndex: 1,
        layout: "feed",
        layoutStyle: "poster",
        agent: getAgentForLayout(workflowTrail, "poster"),
      });
    })(),
    (() => {
      const sourceItem = sourceItems[2] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, "Prova, exemplo ou detalhe que sustenta a oferta"), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: safeText(visualDirection?.productImagePolicy, "Prova curta e clara para sustentar a promessa."),
        rhythm,
        layout: "feed",
      });

      return buildVariant({
        id: "carousel-2",
        label: "Slide 3",
        title: safeText(sourceItem?.title, "Prova, exemplo ou detalhe que sustenta a oferta"),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "feed", sourceItem }),
        channel: sourceItem?.channel ?? "instagram-carousel",
        format: sourceItem?.format ?? "carrossel",
        sourceItem,
        themeIndex: 2,
        layout: "feed",
        layoutStyle: "split",
        agent: getAgentForLayout(workflowTrail, "split"),
      });
    })(),
    (() => {
      const sourceItem = sourceItems[3] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, "CTA direto e orientação final"), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: references.length > 0 ? `Referências: ${references.slice(0, 3).join(" · ")}` : "Feche com um próximo passo claro e sem atrito.",
        rhythm,
        layout: "feed",
      });

      return buildVariant({
        id: "carousel-3",
        label: "Fechamento",
        title: safeText(sourceItem?.title, "CTA direto e orientação final"),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "feed", sourceItem }),
        channel: sourceItem?.channel ?? "instagram-carousel",
        format: sourceItem?.format ?? "carrossel",
        sourceItem,
        themeIndex: 3,
        layout: "feed",
        layoutStyle: "magazine",
        agent: getAgentForLayout(workflowTrail, "magazine"),
      });
    })(),
  ];

  const storyVariants = [
    (() => {
      const sourceItem = sourceItems[0] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, title), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: safeText(visualDirection?.productImagePolicy, "Narrativa vertical com leitura imediata."),
        rhythm,
        layout: "story",
      });

      return buildVariant({
        id: "story-hook",
        label: "Story 1",
        title: safeText(sourceItem?.title, title),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "story", sourceItem }),
        channel: "instagram-story",
        format: "story",
        sourceItem,
        themeIndex: 0,
        layout: "story",
        layoutStyle: "hero",
        agent: getAgentForLayout(workflowTrail, "hero"),
      });
    })(),
    (() => {
      const sourceItem = sourceItems[1] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, "Dor principal e contexto"), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: safeText(visualDirection?.productImagePolicy, "Mostre o problema de forma curta e concreta."),
        rhythm,
        layout: "story",
      });

      return buildVariant({
        id: "story-pain",
        label: "Story 2",
        title: safeText(sourceItem?.title, "Dor principal e contexto"),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "story", sourceItem }),
        channel: "instagram-story",
        format: "story",
        sourceItem,
        themeIndex: 1,
        layout: "story",
        layoutStyle: "poster",
        agent: getAgentForLayout(workflowTrail, "poster"),
      });
    })(),
    (() => {
      const sourceItem = sourceItems[2] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, "Prova e evidência"), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: safeText(visualDirection?.productImagePolicy, "Prova curta e visível para sustentar a promessa."),
        rhythm,
        layout: "story",
      });

      return buildVariant({
        id: "story-proof",
        label: "Story 3",
        title: safeText(sourceItem?.title, "Prova e evidência"),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "story", sourceItem }),
        channel: "instagram-story",
        format: "story",
        sourceItem,
        themeIndex: 2,
        layout: "story",
        layoutStyle: "split",
        agent: getAgentForLayout(workflowTrail, "split"),
      });
    })(),
    (() => {
      const sourceItem = sourceItems[3] ?? null;
      const supportCopy = buildCreativeSupportCopy({ title: safeText(sourceItem?.title, "CTA e fechamento"), sourceItem, firstPass });
      const bodyCopy = buildCreativeBodyCopy({
        sourceItem,
        firstPass,
        productImagePolicy: references.length > 0 ? `Referências: ${references.slice(0, 3).join(" · ")}` : "Finalize com um próximo passo curto e visível.",
        rhythm,
        layout: "story",
      });

      return buildVariant({
        id: "story-cta",
        label: "Story 4",
        title: safeText(sourceItem?.title, "CTA e fechamento"),
        subtitle: supportCopy,
        caption: bodyCopy,
        cta: buildCreativeCta({ layout: "story", sourceItem }),
        channel: "instagram-story",
        format: "story",
        sourceItem,
        themeIndex: 3,
        layout: "story",
        layoutStyle: "magazine",
        agent: getAgentForLayout(workflowTrail, "magazine"),
      });
    })(),
  ];

  const variants = mode === "story" ? storyVariants : mode === "all" ? [...feedVariants, ...storyVariants] : feedVariants;

  const overallScore = variants.length > 0 ? Math.round(variants.reduce((sum, variant) => sum + variant.quality.totalScore, 0) / variants.length) : 0;

  return {
    mode,
    title,
    summary:
      mode === "story"
        ? safeText(visualDirection?.productImagePolicy, "Conjunto de stories para análise de qualidade.")
        : mode === "all"
          ? safeText(visualDirection?.productImagePolicy, "Conjunto completo de feed, carrossel e stories para análise de qualidade.")
          : safeText(visualDirection?.productImagePolicy, "Conjunto de artes de feed e carrossel para análise de qualidade."),
    clientId: input.clientId,
    clientName: input.clientName,
    contentPackageVersion: input.contentPackage?.version ?? null,
    scheduleVersion: input.schedule?.version ?? null,
    overallScore,
    generatedAt: new Date().toISOString(),
    variants,
  };
};
