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
  "batch-02",
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
    id: "amiclube-cp-batch-02",
    version: 1,
    payload_json: {
      items: [
        "Pare de travar em receitas confusas",
        "3 dúvidas que travam sua venda",
        "Clareza comercial muda tudo",
        "Como vender sem parecer confuso",
      ],
      visualDirection: {
        title: "Amiclube Batch 02",
        firstPass: "Clareza editorial com contraste alto",
        contentRhythm: "ensino rápido, objeções e tese",
        masterAsset: "Instagram Feed",
        productImagePolicy: "Use um layout limpo e direto, com muito respiro e um gancho forte.",
        references: [
          "O feed é o anchor do ciclo.",
          "Cada peça deve ler como uma pequena aula editorial.",
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
            id: "batch-02-01",
            title: "Pare de travar em receitas confusas",
            pillar: "education",
            angle: "clarity",
            objective: "Abrir com dor e clareza",
            reason: "O problema precisa ser entendido antes da solução",
            format: "carousel",
            hook: "Se a receita confunde, a venda trava antes de começar.",
            proof: "Mostre o que uma oferta confusa faz com a decisão.",
            cta: "Salvar para revisar antes de postar",
            visualCue: "editorial cover com contraste forte e leitura imediata",
          },
          {
            id: "batch-02-02",
            title: "3 dúvidas que travam sua venda",
            pillar: "education",
            angle: "objections",
            objective: "Responder objeções",
            reason: "Uma dúvida por card melhora a retenção",
            format: "carousel",
            hook: "Preço, clareza e confiança costumam travar a compra.",
            proof: "Trate uma dúvida por vez com leitura limpa.",
            cta: "Revisar com a equipe",
            visualCue: "três cartões de objeção com espaço e ritmo",
          },
          {
            id: "batch-02-03",
            title: "Clareza comercial muda tudo",
            pillar: "education",
            angle: "authority",
            objective: "Mostrar tese",
            reason: "Clareza reduz o atrito e acelera a decisão",
            format: "carousel",
            hook: "Quando a mensagem fica clara, a oferta vende melhor.",
            proof: "Apresente a lógica em blocos curtos e escaneáveis.",
            cta: "Aplicar a estrutura",
            visualCue: "argumento sequencial com respiro editorial",
          },
          {
            id: "batch-02-04",
            title: "Como vender sem parecer confuso",
            pillar: "education",
            angle: "language",
            objective: "Ensinar linguagem comercial",
            reason: "A peça precisa soar simples e direta",
            format: "feed",
            hook: "Venda melhor quando a frase fica fácil de entender.",
            proof: "Troque excesso de explicação por estrutura limpa.",
            cta: "Salvar a dica",
            visualCue: "tipografia forte com CTA isolado",
          },
        ],
      },
    },
  },
  schedule: {
    id: "amiclube-schedule-batch-02",
    version: 1,
    payload_json: {
      cadence: "4 peças educativas do feed",
      items: [
        {
          position: 1,
          date: "Semana 1 - Seg",
          channel: "Instagram Feed",
          title: "Pare de travar em receitas confusas",
          pillar: "education",
          angle: "clarity",
          objective: "Abrir com dor e clareza",
          format: "carousel",
          status: "planned",
          reason: "O problema precisa ser entendido antes da solução",
          hook: "Se a receita confunde, a venda trava antes de começar.",
          proof: "Mostre o que uma oferta confusa faz com a decisão.",
          cta: "Salvar para revisar antes de postar",
          visualCue: "editorial cover com contraste forte e leitura imediata",
        },
        {
          position: 2,
          date: "Semana 1 - Qua",
          channel: "Instagram Feed",
          title: "3 dúvidas que travam sua venda",
          pillar: "education",
          angle: "objections",
          objective: "Responder objeções",
          format: "carousel",
          status: "planned",
          reason: "Uma dúvida por card melhora a retenção",
          hook: "Preço, clareza e confiança costumam travar a compra.",
          proof: "Trate uma dúvida por vez com leitura limpa.",
          cta: "Revisar com a equipe",
          visualCue: "três cartões de objeção com espaço e ritmo",
        },
        {
          position: 3,
          date: "Semana 1 - Sex",
          channel: "Instagram Feed",
          title: "Clareza comercial muda tudo",
          pillar: "education",
          angle: "authority",
          objective: "Mostrar tese",
          format: "carousel",
          status: "planned",
          reason: "Clareza reduz o atrito e acelera a decisão",
          hook: "Quando a mensagem fica clara, a oferta vende melhor.",
          proof: "Apresente a lógica em blocos curtos e escaneáveis.",
          cta: "Aplicar a estrutura",
          visualCue: "argumento sequencial com respiro editorial",
        },
        {
          position: 4,
          date: "Semana 1 - Dom",
          channel: "Instagram Feed",
          title: "Como vender sem parecer confuso",
          pillar: "education",
          angle: "language",
          objective: "Ensinar linguagem comercial",
          format: "feed",
          status: "planned",
          reason: "A peça precisa soar simples e direta",
          hook: "Venda melhor quando a frase fica fácil de entender.",
          proof: "Troque excesso de explicação por estrutura limpa.",
          cta: "Salvar a dica",
          visualCue: "tipografia forte com CTA isolado",
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
    <title>Amiclube Batch 02</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        padding: 32px;
        background: radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 30%), #07070a;
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
      code { color: #c7d2fe; }
    </style>
  </head>
  <body>
    <h1>Amiclube · Batch 02</h1>
    <p>
      Primeira leva educativa do feed: <code>${cards.map((card) => card.title).join(" · ")}</code>.
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

const manifest = `# Amiclube Batch 02 Render Manifest

Client: Amiclube
Batch: 02
Mode: feed_carousel
Status: preview-ready
Output dir: squads/social-growth/output/amiclube/creative/batch-02

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
- The batch focuses on educational clarity, objections and thesis-building.
- Next batch can continue with support, routine and closing pieces.
`;

writeFileSync(resolve(batchDir, "gallery.html"), galleryHtml, "utf8");
writeFileSync(resolve(batchDir, "rendered-assets.md"), manifest, "utf8");

console.log(`Generated ${cards.length} Amiclube previews in ${batchDir}`);
