import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildPostArtGallery } from "../backend/src/modules/content/post-art-gallery.service";

const batchDir = resolve(
  process.cwd(),
  "squads",
  "social-growth",
  "output",
  "amiclube",
  "creative",
  "batch-03",
);

const svgToString = (dataUrl: string) => {
  const base64 = dataUrl.replace(/^data:image\/svg\+xml;base64,/, "");
  return Buffer.from(base64, "base64").toString("utf8");
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const gallery = buildPostArtGallery({
  clientId: "amiclube",
  clientName: "Amiclube",
  contentPackage: {
    id: "amiclube-cp-batch-03",
    version: 1,
    payload_json: {
      items: [
        "Organização vende mais do que improviso",
        "Suporte também é diferencial",
        "Rotina simples para não travar",
        "A tese da campanha",
      ],
      visualDirection: {
        title: "Amiclube Batch 03",
        firstPass: "Suporte, rotina e tese",
        contentRhythm: "fechamento claro e praticável",
        masterAsset: "Instagram Feed",
        productImagePolicy: "Use uma direção mais calma, útil e conclusiva.",
        references: [
          "O feed deve fechar o ciclo sem parecer genérico.",
          "A peça final precisa ser saveable e útil.",
        ],
        workflow: {
          squad: "social-growth",
          primaryOwner: "visual-director",
          reviewGate: "reviewer",
          renderGate: "creative-renderer",
          scheduleGate: "scheduler",
          agentTrail: [
            { id: "creator", label: "creator", role: "copy", output: "content-production-package.md" },
            { id: "visual-director", label: "visual-director", role: "direção", output: "visual-direction.md" },
            { id: "creative-renderer", label: "creative-renderer", role: "render", output: "remotion" },
          ],
        },
        creativeSignals: [
          {
            id: "batch-03-01",
            title: "Organização vende mais do que improviso",
            pillar: "support",
            angle: "routine",
            objective: "Tornar rotina simples",
            reason: "Estrutura visual reduz fricção",
            format: "feed",
            hook: "A melhor venda costuma nascer de um processo simples.",
            proof: "Mostre um checklist direto, sem excesso.",
            cta: "Salvar para usar depois",
            visualCue: "checklist limpo com destaque editorial",
          },
          {
            id: "batch-03-02",
            title: "Suporte também é diferencial",
            pillar: "support",
            angle: "trust",
            objective: "Transformar suporte em valor",
            reason: "Acompanhamento vira prova de cuidado",
            format: "carousel",
            hook: "A marca também vende pelo suporte que oferece.",
            proof: "Mostre orientação, ajuda e presença.",
            cta: "Ver o que entra no suporte",
            visualCue: "carousel de confiança com espaço e calor",
          },
          {
            id: "batch-03-03",
            title: "Rotina simples para não travar",
            pillar: "support",
            angle: "system",
            objective: "Mostrar sistema",
            reason: "Rotina pequena é mais executável do que promessa grande",
            format: "feed",
            hook: "Consistência pede um sistema que caiba no dia a dia.",
            proof: "Troque complexidade por sequência prática.",
            cta: "Copiar a rotina",
            visualCue: "planner editorial com passos curtos",
          },
          {
            id: "batch-03-04",
            title: "A tese da campanha",
            pillar: "closing",
            angle: "manifesto",
            objective: "Fechar com promessa de marca",
            reason: "O ciclo precisa terminar com a tese clara",
            format: "carousel",
            hook: "Amiclube ajuda artesãs a vender melhor com clareza, prova e rotina.",
            proof: "Feche com uma leitura forte da marca e do método.",
            cta: "Salvar a tese",
            visualCue: "manifesto com tipografia dominante e respiro",
          },
        ],
      },
    },
  },
  schedule: {
    id: "amiclube-schedule-batch-03",
    version: 1,
    payload_json: {
      cadence: "4 peças de suporte e fechamento",
      items: [
        {
          position: 1,
          date: "Semana 2 - Seg",
          channel: "Instagram Feed",
          title: "Organização vende mais do que improviso",
          pillar: "support",
          angle: "routine",
          objective: "Tornar rotina simples",
          format: "feed",
          status: "planned",
          reason: "Estrutura visual reduz fricção",
          hook: "A melhor venda costuma nascer de um processo simples.",
          proof: "Mostre um checklist direto, sem excesso.",
          cta: "Salvar para usar depois",
          visualCue: "checklist limpo com destaque editorial",
        },
        {
          position: 2,
          date: "Semana 2 - Qua",
          channel: "Instagram Feed",
          title: "Suporte também é diferencial",
          pillar: "support",
          angle: "trust",
          objective: "Transformar suporte em valor",
          format: "carousel",
          status: "planned",
          reason: "Acompanhamento vira prova de cuidado",
          hook: "A marca também vende pelo suporte que oferece.",
          proof: "Mostre orientação, ajuda e presença.",
          cta: "Ver o que entra no suporte",
          visualCue: "carousel de confiança com espaço e calor",
        },
        {
          position: 3,
          date: "Semana 2 - Sex",
          channel: "Instagram Feed",
          title: "Rotina simples para não travar",
          pillar: "support",
          angle: "system",
          objective: "Mostrar sistema",
          format: "feed",
          status: "planned",
          reason: "Rotina pequena é mais executável do que promessa grande",
          hook: "Consistência pede um sistema que caiba no dia a dia.",
          proof: "Troque complexidade por sequência prática.",
          cta: "Copiar a rotina",
          visualCue: "planner editorial com passos curtos",
        },
        {
          position: 4,
          date: "Semana 2 - Dom",
          channel: "Instagram Feed",
          title: "A tese da campanha",
          pillar: "closing",
          angle: "manifesto",
          objective: "Fechar com promessa de marca",
          format: "carousel",
          status: "planned",
          reason: "O ciclo precisa terminar com a tese clara",
          hook: "Amiclube ajuda artesãs a vender melhor com clareza, prova e rotina.",
          proof: "Feche com uma leitura forte da marca e do método.",
          cta: "Salvar a tese",
          visualCue: "manifesto com tipografia dominante e respiro",
        },
      ],
    },
  },
  mode: "feed_carousel",
});

const cards = gallery.variants
  .map((variant, index) => {
    const title = variant.sourceItem?.title ?? variant.title;
    const fileName = `${String(index + 1).padStart(2, "0")}-${slugify(title)}.svg`;
    const svg = svgToString(variant.previewDataUrl);
    const svgPath = resolve(batchDir, fileName);

    return {
      index,
      title,
      fileName,
      svg,
      svgPath,
      variant,
    };
  })
  .slice(0, 4);

mkdirSync(batchDir, { recursive: true });

for (const card of cards) {
  writeFileSync(card.svgPath, card.svg, "utf8");
}

const galleryHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Amiclube Batch 03</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        padding: 32px;
        background: radial-gradient(circle at top, rgba(16,185,129,0.16), transparent 30%), #07070a;
        color: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      h1 { margin: 0 0 8px; font-size: 32px; }
      p { margin: 0 0 24px; color: #cbd5e1; max-width: 920px; line-height: 1.5; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
      .card {
        background: rgba(15, 15, 20, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      }
      .meta { padding: 16px 18px 18px; }
      .meta strong { display: block; font-size: 18px; line-height: 1.2; margin-bottom: 6px; }
      .meta span { display: block; color: #94a3b8; font-size: 13px; line-height: 1.45; }
      img { display: block; width: 100%; height: auto; }
      code { color: #a7f3d0; }
    </style>
  </head>
  <body>
    <h1>Amiclube · Batch 03</h1>
    <p>
      Primeira leva de suporte e fechamento: <code>${cards.map((card) => card.title).join(" · ")}</code>.
      Os SVGs abaixo são os previews programáticos salvos por peça.
    </p>
    <div class="grid">
      ${cards
        .map(
          (card) => `<article class="card">
            <img src="./${card.fileName}" alt="${card.title}" />
            <div class="meta">
              <strong>${card.title}</strong>
              <span>${card.variant.label} · ${card.variant.format} · ${card.variant.cta}</span>
            </div>
          </article>`,
        )
        .join("\n")}
    </div>
  </body>
</html>`;

const manifest = `# Amiclube Batch 03 Render Manifest

Client: Amiclube
Batch: 03
Mode: feed_carousel
Status: preview-ready
Output dir: squads/social-growth/output/amiclube/creative/batch-03

## Items

| # | Title | Channel | Format | Preview File | Status | Notes |
|---|---|---|---|---|---|---|
${cards
  .map(
    (card) =>
      `| ${String(card.index + 1)} | ${card.title} | ${card.variant.channel} | ${card.variant.format} | \`${card.fileName}\` | preview-ready | ${card.variant.subtitle} |`,
  )
  .join("\n")}

## Notes

- These previews were generated from the approved Amiclube content production package and schedule payload.
- The batch focuses on support, routine and closing thesis.
- The next step is to review the three batches together and decide whether to render Remotion motion versions for the reel-led items.
`;

writeFileSync(resolve(batchDir, "gallery.html"), galleryHtml, "utf8");
writeFileSync(resolve(batchDir, "rendered-assets.md"), manifest, "utf8");

console.log(`Generated ${cards.length} Amiclube previews in ${batchDir}`);
