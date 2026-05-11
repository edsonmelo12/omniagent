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
  "batch-01",
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
    id: "amiclube-cp-batch-01",
    version: 1,
    payload_json: {
      items: [
        "O que você recebe não é só uma receita",
        "Bastidor que gera valor percebido",
        "O valor real está no que evita",
        "Prova que convence sem forçar",
      ],
      visualDirection: {
        title: "Amiclube Batch 01",
        firstPass: "Gancho > prova > fecho",
        contentRhythm: "descoberta, prova e clareza em sequência curta",
        masterAsset: "Instagram Reels",
        productImagePolicy: "Use produto real quando a prova depender de detalhe, acabamento ou processo.",
        references: [
          "O conteúdo precisa ensinar sem soar genérico.",
          "A prova deve ficar perto do gancho.",
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
            id: "batch-01-01",
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
          },
          {
            id: "batch-01-02",
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
          },
          {
            id: "batch-01-03",
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
          },
          {
            id: "batch-01-04",
            title: "Prova que convence sem forçar",
            pillar: "proof",
            angle: "credibility",
            objective: "Fechar com evidência",
            reason: "A prova deve parecer natural, não empurrada",
            format: "reel",
            hook: "A prova certa convence sem pressionar.",
            proof: "Mostre resultado, detalhe e uma leitura rápida do valor.",
            cta: "Salvar o checklist",
            visualCue: "prova em primeiro plano com texto curto",
          },
        ],
      },
    },
  },
  schedule: {
    id: "amiclube-schedule-batch-01",
    version: 1,
    payload_json: {
      cadence: "4 reels de descoberta e prova",
      items: [
        {
          position: 1,
          date: "Semana 1 - Seg",
          channel: "Instagram Reels",
          title: "O que você recebe não é só uma receita",
          pillar: "proof",
          angle: "value",
          objective: "Expandir valor percebido",
          format: "reel",
          status: "planned",
          reason: "A oferta precisa parecer maior do que o item principal",
          hook: "Você não compra só a peça. Compra clareza sobre o que fazer com ela.",
          proof: "Mostre a composição, o pacote e o detalhe que justifica o preço.",
          cta: "Salvar para revisar a oferta",
          visualCue: "close-up com hierarquia editorial e prova visível",
        },
        {
          position: 2,
          date: "Semana 1 - Qua",
          channel: "Instagram Reels",
          title: "Bastidor que gera valor percebido",
          pillar: "process",
          angle: "craft",
          objective: "Aumentar confiança no processo",
          format: "reel",
          status: "planned",
          reason: "O trabalho visível sustenta o valor final",
          hook: "O bastidor faz o produto parecer mais sério.",
          proof: "Mostre mãos, materiais e acabamento.",
          cta: "Ver o processo",
          visualCue: "camadas de processo com foco no detalhe",
        },
        {
          position: 3,
          date: "Semana 1 - Sex",
          channel: "Instagram Reels",
          title: "O valor real está no que evita",
          pillar: "proof",
          angle: "avoidance",
          objective: "Tornar o benefício concreto",
          format: "reel",
          status: "planned",
          reason: "Evitar dor é mais fácil de entender do que prometer abstração",
          hook: "A oferta fica mais forte quando mostra o erro que evita.",
          proof: "Mostre a consequência de uma apresentação fraca e a versão correta.",
          cta: "Comparar com a sua oferta",
          visualCue: "antes/depois com contraste editorial",
        },
        {
          position: 4,
          date: "Semana 1 - Dom",
          channel: "Instagram Reels",
          title: "Prova que convence sem forçar",
          pillar: "proof",
          angle: "credibility",
          objective: "Fechar com evidência",
          format: "reel",
          status: "planned",
          reason: "A prova deve parecer natural, não empurrada",
          hook: "A prova certa convence sem pressionar.",
          proof: "Mostre resultado, detalhe e uma leitura rápida do valor.",
          cta: "Salvar o checklist",
          visualCue: "prova em primeiro plano com texto curto",
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
    <title>Amiclube Batch 01</title>
    <style>
      :root {
        color-scheme: dark;
      }
      body {
        margin: 0;
        padding: 32px;
        background: radial-gradient(circle at top, rgba(171,82,56,0.18), transparent 30%), #07070a;
        color: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 32px;
      }
      p {
        margin: 0 0 24px;
        color: #cbd5e1;
        max-width: 920px;
        line-height: 1.5;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
      }
      .card {
        background: rgba(15, 15, 20, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      }
      .meta {
        padding: 16px 18px 18px;
      }
      .meta strong {
        display: block;
        font-size: 18px;
        line-height: 1.2;
        margin-bottom: 6px;
      }
      .meta span {
        display: block;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.45;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
      }
      code {
        color: #f5d0c6;
      }
    </style>
  </head>
  <body>
    <h1>Amiclube · Batch 01</h1>
    <p>
      Primeira leva de artes geradas para os posts: <code>${cards.map((card) => card.title).join(" · ")}</code>.
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

const manifest = `# Amiclube Batch 01 Render Manifest

Client: Amiclube
Batch: 01
Mode: feed_carousel
Status: preview-ready
Output dir: squads/social-growth/output/amiclube/creative/batch-01

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
- The batch focuses on proof, process and value framing.
- Next batch can continue with the educational and support pieces.
`;

writeFileSync(resolve(batchDir, "gallery.html"), galleryHtml, "utf8");
writeFileSync(resolve(batchDir, "rendered-assets.md"), manifest, "utf8");

console.log(`Generated ${cards.length} Amiclube previews in ${batchDir}`);
