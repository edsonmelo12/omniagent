import { buildPostArtGallery, assignBackgroundsForLogging } from "../backend/src/modules/content/post-art-gallery.service";

const gallery = buildPostArtGallery({
  clientId: "demo",
  clientName: "Demo",
  contentPackage: {
    id: "cp-demo",
    version: 1,
    payload_json: {
      items: ["Brief 1", "Brief 2", "Brief 3", "Brief 4"],
      visualDirection: {
        title: "Demo Art",
        firstPass: "Pare de travar em receitas confusas",
        contentRhythm: "cadência semanal consistente",
        productImagePolicy: "Revisar proposta com clareza",
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
    id: "s-demo",
    version: 1,
    payload_json: {
      cadence: "cadência semanal consistente",
      items: [],
    },
  },
  mode: "all",
});

const backgroundAssignments = assignBackgroundsForLogging();

const log = [
  "# Registro da última geração",
  `**Data:** ${new Date().toISOString()}`,
  "",
  "## Backgrounds utilizados por layout",
  ...backgroundAssignments.map((entry) => `- ${entry.style}: ${entry.asset?.id ?? "none"}`),
  "",
  "## Variantes geradas",
  ...gallery.variants.map((variant) => `- ${variant.id} (${variant.label}): ${variant.previewDataUrl.startsWith("data:image") ? "ok" : "missing"}`),
];

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

writeFileSync(resolve(process.cwd(), "docs", "gallery-log.md"), log.join("\n"), "utf8");

console.log("log salvo em docs/gallery-log.md");
