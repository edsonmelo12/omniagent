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
  "batch-03",
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
    key: "system-slate",
    label: "System Slate",
    mood: "Estrutura e processo com leitura objetiva.",
    composition: "Headline forte, blocos de sistema e conclusão limpa.",
    notes: ["Mais sistema, menos ruído", "Hierarquia visível", "Apoio visual em camadas"],
    palette: {
      bg1: "#0e1218",
      bg2: "#18202a",
      panel: "rgba(112,139,171,0.14)",
      panelStrong: "rgba(112,139,171,0.24)",
      border: "rgba(216,226,236,0.22)",
      text: "#f8fbff",
      muted: "#d4dfec",
      accent: "#8bbcff",
      accentSoft: "rgba(83,118,177,0.14)",
      accentText: "#dceaff",
    },
  },
  {
    key: "support-olive",
    label: "Support Olive",
    mood: "Tom de suporte confiável com calor humano.",
    composition: "Mensagem de apoio, prova curta e CTA suave.",
    notes: ["Mostre disponibilidade", "Evite excesso de texto", "Traga sensação de cuidado"],
    palette: {
      bg1: "#12160f",
      bg2: "#1a2317",
      panel: "rgba(112,148,103,0.16)",
      panelStrong: "rgba(112,148,103,0.26)",
      border: "rgba(225,239,219,0.2)",
      text: "#f5fbf2",
      muted: "#dce9d3",
      accent: "#8dd18e",
      accentSoft: "rgba(112,148,103,0.14)",
      accentText: "#e6f7e6",
    },
  },
  {
    key: "routine-sand",
    label: "Routine Sand",
    mood: "Rotina simples com acabamento artesanal e estável.",
    composition: "Passo a passo enxuto, respiro visual e fechamento prático.",
    notes: ["Deixe o dia caber no sistema", "Menos esforço, mais consistência", "Leitura tranquila"],
    palette: {
      bg1: "#18120d",
      bg2: "#271c13",
      panel: "rgba(209,171,120,0.16)",
      panelStrong: "rgba(209,171,120,0.26)",
      border: "rgba(248,230,202,0.2)",
      text: "#fffaf3",
      muted: "#efddc5",
      accent: "#d7a86b",
      accentSoft: "rgba(209,171,120,0.14)",
      accentText: "#fff2dd",
    },
  },
  {
    key: "thesis-ink",
    label: "Thesis Ink",
    mood: "Fecho de campanha com tese central e confiança.",
    composition: "Resumo da ideia, prova de valor e saída forte.",
    notes: ["Conclua com convicção", "Tese em primeiro plano", "CTA sem complicação"],
    palette: {
      bg1: "#0a0f12",
      bg2: "#121922",
      panel: "rgba(33,43,55,0.18)",
      panelStrong: "rgba(33,43,55,0.28)",
      border: "rgba(207,216,226,0.22)",
      text: "#f7fafc",
      muted: "#cbd5e1",
      accent: "#7dd3fc",
      accentSoft: "rgba(37,99,235,0.14)",
      accentText: "#dbeafe",
    },
  },
];

const focusItems: FocusItem[] = [
  {
    position: 1,
    channel: "Instagram Feed",
    title: "Organização vende mais do que improviso",
    pillar: "system",
    angle: "process",
    objective: "Mostrar valor do processo",
    reason: "A melhor venda costuma nascer de um processo simples.",
    format: "feed",
    hook: "Quando a rotina é organizada, a venda deixa de depender de sorte.",
    proof: "Mostre o método que evita correria e aumenta previsibilidade.",
    cta: "Estruturar o processo",
    visualCue: "camadas organizadas com leitura limpa e ordem visual",
    status: "planned",
  },
  {
    position: 2,
    channel: "Instagram Feed",
    title: "Suporte também é diferencial",
    pillar: "support",
    angle: "care",
    objective: "Valorizar a experiência",
    reason: "A marca também vende pelo suporte que oferece.",
    format: "carousel",
    hook: "Suporte é parte da entrega. Ele aumenta confiança e recorrência.",
    proof: "Mostre como o atendimento reduz dúvida e melhora a percepção de valor.",
    cta: "Aprimorar o suporte",
    visualCue: "blocos de cuidado com prova e CTA direto",
    status: "planned",
  },
  {
    position: 3,
    channel: "Instagram Feed",
    title: "Rotina simples para não travar",
    pillar: "routine",
    angle: "consistency",
    objective: "Reduzir fricção na produção",
    reason: "Consistência pede um sistema que caiba no dia a dia.",
    format: "feed",
    hook: "Se a rotina cabe na agenda, ela sai do papel.",
    proof: "Mostre uma estrutura que funcione sem esforço excessivo.",
    cta: "Aplicar a rotina",
    visualCue: "sequência prática com poucas etapas e respiro",
    status: "planned",
  },
  {
    position: 4,
    channel: "Instagram Feed",
    title: "A tese da campanha",
    pillar: "thesis",
    angle: "closing",
    objective: "Amarrar a mensagem final",
    reason: "Amiclube ajuda artesãs a vender melhor com clareza, prova e rotina.",
    format: "carousel",
    hook: "A campanha fecha quando a tese fica simples de repetir.",
    proof: "Resuma a promessa central em uma leitura rápida e forte.",
    cta: "Salvar a tese",
    visualCue: "fecho com tese central e prova curta",
    status: "planned",
  },
];

const manifestLines: string[] = [
  "# Amiclube Batch 03 Motion Manifest",
  "",
  "Client: Amiclube",
  "Batch: 03",
  "Mode: feed_carousel_motion",
  "Status: rendering",
  `Output dir: ${batchDir}`,
  "",
  "## Items",
  "",
  "| # | Title | Channel | Format | Video | Status | Notes |",
  "|---|---|---|---|---|---|---|",
];

const pathBase = (value: string) => value.split(/[\\/]/).pop() ?? value;

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
        variantLabel: `Batch 03 ${String(item.position).padStart(2, "0")}`,
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
          "O fechamento da campanha precisa reforçar rotina, suporte e tese.",
          "A leitura mobile deve permanecer limpa e rápida desde a primeira cena.",
        ],
        direction: {
          firstPass: "sistema antes da ornamentação",
          hookSystem: "gancho > sistema > prova",
          masterAsset: "Instagram Feed",
          contentRhythm: "quatro peças em sequência",
          productImagePolicy: "Use a peça/arte como âncora visual sempre que possível.",
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

  manifestLines.push(
    "",
    "## Notes",
    "",
    "- These motion assets were rendered with the existing Remotion copy-motion renderer.",
    "- Each item was rendered as a headline variant using the item-specific focus data.",
    "- Subtitle, soundtrack and mp4 outputs are colocated in the batch directory.",
  );

  writeFileSync(resolve(batchDir, "rendered-assets.md"), manifestLines.join("\n"), "utf8");
  console.log(`Rendered ${focusItems.length} Amiclube motion assets in ${batchDir}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
