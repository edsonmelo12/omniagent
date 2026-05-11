import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { renderCopyMotionVideo } from "../backend/src/modules/content/remotion/remotion-renderer";

type FocusItem = {
  position: number;
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

type ArtDirection = {
  key: string;
  label: string;
  mood: string;
  composition: string;
  notes: readonly string[];
  palette: {
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
};

const batchDir = resolve(
  process.cwd(),
  "squads",
  "social-growth",
  "output",
  "amiclube",
  "creative",
  "batch-01",
  "motion",
);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const artDirections: ArtDirection[] = [
  {
    key: "proof-terracotta",
    label: "Proof Editorial",
    mood: "Clareza com força comercial e leitura imediata",
    composition: "Capa forte, blocos de prova e fechamento com CTA visível.",
    notes: [
      "Use contraste alto",
      "Deixe o detalhe do produto em evidência",
      "Texto curto e assertivo",
    ],
    palette: {
      bg1: "#120d0b",
      bg2: "#231411",
      panel: "rgba(171,82,56,0.18)",
      panelStrong: "rgba(171,82,56,0.28)",
      border: "rgba(245,208,198,0.24)",
      text: "#fff7f2",
      muted: "#f5d0c6",
      accent: "#db6d4e",
      accentSoft: "rgba(171,82,56,0.16)",
      accentText: "#f9dfd7",
    },
  },
  {
    key: "process-sand",
    label: "Process Studio",
    mood: "Bastidor artesanal com acabamento calmo e confiável",
    composition: "Plano de processo, blocos respirados e prova na sequência.",
    notes: [
      "Mostrar mãos e material",
      "Evitar poluição visual",
      "Manter o foco no acabamento",
    ],
    palette: {
      bg1: "#14100a",
      bg2: "#2a2117",
      panel: "rgba(230,207,174,0.14)",
      panelStrong: "rgba(230,207,174,0.24)",
      border: "rgba(255,240,219,0.2)",
      text: "#fff9f0",
      muted: "#f1ddc2",
      accent: "#d4b07a",
      accentSoft: "rgba(230,207,174,0.16)",
      accentText: "#fff3df",
    },
  },
  {
    key: "comparison-ink",
    label: "Comparison Frame",
    mood: "Comparativo editorial com contraste mais duro",
    composition: "Antes/depois com menos elementos e peso na leitura.",
    notes: [
      "Não esconder o problema",
      "Corte visual preciso",
      "Usar tipografia dominante",
    ],
    palette: {
      bg1: "#0b0f13",
      bg2: "#121820",
      panel: "rgba(28,32,40,0.16)",
      panelStrong: "rgba(28,32,40,0.28)",
      border: "rgba(203,213,225,0.22)",
      text: "#f8fafc",
      muted: "#cbd5e1",
      accent: "#7dd3fc",
      accentSoft: "rgba(37,99,235,0.14)",
      accentText: "#dbeafe",
    },
  },
  {
    key: "proof-green",
    label: "Proof Close",
    mood: "Fecho de prova com confiança e CTA limpo",
    composition: "Prova em primeiro plano, argumento curto e saída forte.",
    notes: [
      "CTA sem ruído",
      "Foco na evidência",
      "Encerrar sem excesso",
    ],
    palette: {
      bg1: "#0c120f",
      bg2: "#122017",
      panel: "rgba(86,132,99,0.16)",
      panelStrong: "rgba(86,132,99,0.28)",
      border: "rgba(225,245,232,0.2)",
      text: "#f2fbf5",
      muted: "#d5ebdb",
      accent: "#6ee7b7",
      accentSoft: "rgba(86,132,99,0.14)",
      accentText: "#dff7e7",
    },
  },
];

const focusItems: FocusItem[] = [
  {
    position: 1,
    channel: "Instagram Reels",
    title: "O que você recebe não é só uma receita",
    pillar: "proof",
    angle: "value",
    objective: "Expandir valor percebido",
    reason: "A oferta precisa parecer maior do que o item principal",
    format: "reel",
    hook: "Você não compra só a peça. Compra clareza sobre o que fazer com ela.",
    proof: "Mostre a composição, o pacote e o detalhe que justifica o preço.",
    cta: "Salvar para revisar a oferta",
    visualCue: "close-up com hierarquia editorial e prova visível",
    status: "planned",
  },
  {
    position: 2,
    channel: "Instagram Reels",
    title: "Bastidor que gera valor percebido",
    pillar: "process",
    angle: "craft",
    objective: "Aumentar confiança no processo",
    reason: "O trabalho visível sustenta o valor final",
    format: "reel",
    hook: "O bastidor faz o produto parecer mais sério.",
    proof: "Mostre mãos, materiais e acabamento.",
    cta: "Ver o processo",
    visualCue: "camadas de processo com foco no detalhe",
    status: "planned",
  },
  {
    position: 3,
    channel: "Instagram Reels",
    title: "O valor real está no que evita",
    pillar: "proof",
    angle: "avoidance",
    objective: "Tornar o benefício concreto",
    reason: "Evitar dor é mais fácil de entender do que prometer abstração",
    format: "reel",
    hook: "A oferta fica mais forte quando mostra o erro que evita.",
    proof: "Mostre a consequência de uma apresentação fraca e a versão correta.",
    cta: "Comparar com a sua oferta",
    visualCue: "antes/depois com contraste editorial",
    status: "planned",
  },
  {
    position: 4,
    channel: "Instagram Reels",
    title: "Prova que convence sem forçar",
    pillar: "proof",
    angle: "credibility",
    objective: "Fechar com evidência",
    reason: "A prova deve parecer natural, não empurrada",
    format: "reel",
    hook: "A prova certa convence sem pressão.",
    proof: "Mostre resultado, detalhe e uma leitura rápida do valor.",
    cta: "Salvar o checklist",
    visualCue: "prova em primeiro plano com texto curto",
    status: "planned",
  },
];

const manifestLines: string[] = [
  "# Amiclube Batch 01 Motion Manifest",
  "",
  "Client: Amiclube",
  "Batch: 01",
  "Mode: remotion_headline",
  "Status: rendering",
  `Output dir: ${batchDir}`,
  "",
  "## Items",
  "",
  "| # | Title | Channel | Format | Video | Status | Notes |",
  "|---|---|---|---|---|---|---|",
];

const main = async () => {
  mkdirSync(batchDir, { recursive: true });

  for (let index = 0; index < focusItems.length; index += 1) {
    const item = focusItems[index];
    const artDirection = artDirections[index];
    const outputLocation = resolve(batchDir, `${String(item.position).padStart(2, "0")}-${slugify(item.title)}.mp4`);

    await renderCopyMotionVideo({
      outputLocation,
      props: {
        title: item.title,
        summary: item.hook,
        clientName: "Amiclube",
        focusItem: item,
        artDirection,
        variantType: "headline",
        variantLabel: `Batch 01 ${String(item.position).padStart(2, "0")}`,
        variantIndex: item.position,
        variantCount: focusItems.length,
        workflowOwner: "creative-renderer",
        workflowSquad: "social-growth",
        workflowTrail: [
          { label: "creator", role: "copy", output: "content-production-package.md" },
          { label: "visual-director", role: "shape", output: "visual-direction.md" },
          { label: "creative-renderer", role: "render", output: "mp4/srt/wav" },
        ],
        items: focusItems.map((entry) => ({
          position: entry.position,
          title: entry.title,
          channel: entry.channel,
          format: entry.format,
          status: entry.status,
          objective: entry.objective,
          reason: entry.reason,
          hook: entry.hook,
          proof: entry.proof,
          cta: entry.cta,
          visualCue: entry.visualCue,
        })),
        creativeSignals: [],
        references: [
          "O ciclo precisa fechar com prova e rotina.",
          "A leitura mobile deve permanecer limpa no primeiro frame.",
        ],
        direction: {
          firstPass: "prova antes da explicação",
          hookSystem: "gancho > prova > fecho",
          masterAsset: "Instagram Reels",
          contentRhythm: "quatro peças em sequência",
          productImagePolicy: "Use produto real sempre que a prova depender de detalhe.",
          rules: [
            "Mobile-first readability",
            "One dominant idea per slide or frame",
            "High-contrast editorial layouts",
          ],
        },
        accent: artDirection.palette.accent,
        accentSoft: artDirection.palette.accentSoft,
        background: artDirection.palette.bg1,
        foreground: artDirection.palette.text,
        muted: artDirection.palette.muted,
        border: artDirection.palette.border,
      },
    });

    manifestLines.push(
      `| ${String(item.position)} | ${item.title} | ${item.channel} | ${item.format} | \`${pathBase(outputLocation)}\` | rendered | ${item.hook} |`,
    );
  }

  manifestLines.push("", "## Notes", "", "- These motion assets were rendered with the existing Remotion copy-motion renderer.", "- Each item was rendered as a headline variant using the item-specific focus data.", "- Subtitle, soundtrack and mp4 outputs are colocated in the batch directory.");

  writeFileSync(resolve(batchDir, "rendered-assets.md"), manifestLines.join("\n"), "utf8");
  console.log(`Rendered ${focusItems.length} Amiclube motion assets in ${batchDir}`);
};

const pathBase = (value: string) => value.split(/[\\/]/).pop() ?? value;

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
