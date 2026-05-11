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
  "batch-02",
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
    key: "clarity-ink",
    label: "Clarity Ink",
    mood: "Leitura limpa com contraste editorial forte.",
    composition: "Capa direta, blocos de objeção e desfecho objetivo.",
    notes: ["Texto enxuto", "Nada compete com a headline", "Priorize hierarquia"],
    palette: {
      bg1: "#0c1016",
      bg2: "#141b24",
      panel: "rgba(119,149,186,0.14)",
      panelStrong: "rgba(119,149,186,0.24)",
      border: "rgba(214,226,240,0.22)",
      text: "#f8fbff",
      muted: "#d4dfec",
      accent: "#7cb8ff",
      accentSoft: "rgba(80,124,188,0.14)",
      accentText: "#dbeaff",
    },
  },
  {
    key: "questions-slate",
    label: "Questions Slate",
    mood: "Tom de diagnóstico com blocos de pergunta e resposta.",
    composition: "Pergunta forte, resposta curta e prova visual em camadas.",
    notes: ["Use ritmo de cartões", "Mostre o conflito", "Finalize com clareza"],
    palette: {
      bg1: "#111317",
      bg2: "#1b2027",
      panel: "rgba(152,162,179,0.14)",
      panelStrong: "rgba(152,162,179,0.24)",
      border: "rgba(226,232,240,0.2)",
      text: "#f8fafc",
      muted: "#cbd5e1",
      accent: "#c7d2fe",
      accentSoft: "rgba(129,140,248,0.14)",
      accentText: "#eef2ff",
    },
  },
  {
    key: "message-sand",
    label: "Message Sand",
    mood: "Clareza comercial com calor visual e serenidade.",
    composition: "Headline, argumento e fecho em blocos respirados.",
    notes: ["Clareza antes de decoração", "Traz conforto visual", "Bom para conteúdo educativo"],
    palette: {
      bg1: "#17120d",
      bg2: "#261b12",
      panel: "rgba(210,173,120,0.16)",
      panelStrong: "rgba(210,173,120,0.26)",
      border: "rgba(247,231,206,0.2)",
      text: "#fffaf4",
      muted: "#f0dcc3",
      accent: "#d8aa6c",
      accentSoft: "rgba(210,173,120,0.14)",
      accentText: "#fff4e1",
    },
  },
  {
    key: "clean-close",
    label: "Clean Close",
    mood: "Fecho limpo com CTA direto e sem ruído.",
    composition: "Uma tese clara, uma prova curta e uma saída elegante.",
    notes: ["Reduz a poluição", "Fecha com convicção", "Ótimo para a última peça"],
    palette: {
      bg1: "#0f1510",
      bg2: "#162018",
      panel: "rgba(96,147,119,0.16)",
      panelStrong: "rgba(96,147,119,0.26)",
      border: "rgba(224,245,232,0.2)",
      text: "#f2fbf5",
      muted: "#d6e7dd",
      accent: "#7ee2b8",
      accentSoft: "rgba(96,147,119,0.14)",
      accentText: "#e6fbef",
    },
  },
];

const focusItems: FocusItem[] = [
  {
    position: 1,
    channel: "Instagram Feed",
    title: "Pare de travar em receitas confusas",
    pillar: "clarity",
    angle: "friction",
    objective: "Reduzir atrito de entendimento",
    reason: "Se a receita confunde, a venda trava antes de começar.",
    format: "carousel",
    hook: "Quando a receita parece confusa, a decisão para na primeira leitura.",
    proof: "Mostre a diferença entre uma página confusa e uma proposta clara.",
    cta: "Revisar a proposta",
    visualCue: "blocos editoriais limpos com contraste e leitura rápida",
    status: "planned",
  },
  {
    position: 2,
    channel: "Instagram Feed",
    title: "3 dúvidas que travam sua venda",
    pillar: "objection",
    angle: "diagnosis",
    objective: "Nomear objeções comuns",
    reason: "Preço, clareza e confiança costumam travar a compra.",
    format: "carousel",
    hook: "A venda trava em dúvidas previsíveis. Nomear isso já ajuda.",
    proof: "Liste as três objeções e mostre como cada uma aparece na oferta.",
    cta: "Salvar o diagnóstico",
    visualCue: "cartões de pergunta com resposta curta e forte",
    status: "planned",
  },
  {
    position: 3,
    channel: "Instagram Feed",
    title: "Clareza comercial muda tudo",
    pillar: "thesis",
    angle: "system",
    objective: "Amarrar a tese da campanha",
    reason: "Quando a mensagem fica clara, a oferta vende melhor.",
    format: "carousel",
    hook: "Clareza vende porque reduz o esforço de entendimento.",
    proof: "Mostre a oferta antes e depois de uma revisão de mensagem.",
    cta: "Aplicar no catálogo",
    visualCue: "tese central com apoio de blocos e prova",
    status: "planned",
  },
  {
    position: 4,
    channel: "Instagram Feed",
    title: "Como vender sem parecer confuso",
    pillar: "delivery",
    angle: "clarity",
    objective: "Fechar com um método prático",
    reason: "Venda melhor quando a frase fica fácil de entender.",
    format: "feed",
    hook: "Se a mensagem é fácil de ler, a venda flui mais rápido.",
    proof: "Mostre uma leitura simples, direta e sem excesso de texto.",
    cta: "Simplificar agora",
    visualCue: "tese final com CTA e espaço respirado",
    status: "planned",
  },
];

const manifestLines: string[] = [
  "# Amiclube Batch 02 Motion Manifest",
  "",
  "Client: Amiclube",
  "Batch: 02",
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
        variantLabel: `Batch 02 ${String(item.position).padStart(2, "0")}`,
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
          "A sequência precisa ajudar o público a entender a oferta sem esforço.",
          "A leitura mobile deve ficar limpa e objetiva desde o primeiro frame.",
        ],
        direction: {
          firstPass: "clareza antes de explicação",
          hookSystem: "gancho > diagnóstico > fecho",
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
