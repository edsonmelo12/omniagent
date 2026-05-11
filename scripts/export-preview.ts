import { buildPostArtGallery } from "../backend/src/modules/content/post-art-gallery.service";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const gallery = buildPostArtGallery({
  clientId: "preview",
  clientName: "Preview",
  contentPackage: {
    id: "preview-cp",
    version: 1,
    payload_json: {
      items: ["Breve 1", "Breve 2", "Breve 3", "Breve 4"],
      visualDirection: {
        title: "Preview Art",
        firstPass: "Pare de travar em receitas confusas",
        contentRhythm: "cadência semanal consistente",
        productImagePolicy: "Revisar com clareza",
        workflow: {
          agentTrail: [
            { id: "creator", label: "creator", role: "copy", output: "content-production-package.md" },
            { id: "visual-director", label: "visual-director", role: "direção", output: "visual-direction.md" },
          ],
        },
      },
    },
  },
  schedule: {
    id: "preview-s",
    version: 1,
    payload_json: {
      cadence: "cadência semanal consistente",
      items: [],
    },
  },
  mode: "all",
});

const sections = gallery.variants.map((variant) => {
  return `
    <section style="border:1px solid #111; padding:16px; margin-bottom:16px; background:#0f0f12;">
      <h2 style="margin:0 0 8px;color:#fefefe;">${variant.label} (${variant.id})</h2>
      <p style="margin:0 0 16px;color:#b0b0c0;">CTA: ${variant.cta}</p>
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <img src="${variant.previewDataUrl}" alt="${variant.label}" style="max-width:320px; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.4);" />
        <div style="flex:1; color:#e2e8f0; font-family:Arial, sans-serif;">
          <pre style="white-space:pre-wrap; font-size:12px;">${variant.caption}</pre>
        </div>
      </div>
    </section>
  `;
});

const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Preview Gallery</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        background:#07080d;
        color:#f3f4f6;
        font-family:"IBM Plex Sans", system-ui, sans-serif;
        padding:32px;
      }
      h1 {
        margin-bottom:24px;
      }
    </style>
  </head>
  <body>
    <h1>Preview Gallery</h1>
    ${sections.join("\n")}
  </body>
</html>
`;

mkdirSync(resolve(process.cwd(), "docs"), { recursive: true });
writeFileSync(resolve(process.cwd(), "docs", "preview-gallery.html"), html, "utf8");
console.log("preview salvo em docs/preview-gallery.html");
