import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const logPath = resolve(process.cwd(), "docs", "gallery-log.md");
const logContent = readFileSync(logPath, "utf8");
const lines = logContent.split("\n");

const backgrounds = lines
  .slice(lines.indexOf("## Backgrounds utilizados por layout") + 1, lines.indexOf("", lines.indexOf("## Backgrounds utilizados por layout")))
  .filter((line) => line.trim().startsWith("-"))
  .map((line) => line.replace("- ", ""));

const variants = lines
  .slice(lines.indexOf("## Variantes geradas") + 1)
  .filter((line) => line.trim().startsWith("-"))
  .map((line) => line.replace("- ", ""));

const issue = [
  "# Nova rodada de artes",
  "",
  "## Fundo / Tema",
  ...backgrounds.map((entry) => `- ${entry}`),
  "",
  "## Variantes geradas",
  ...variants,
  "",
  "## Próximos passos",
  "- Revisar os backgrounds com o designer e confirmar contraste.",
  "- Validar o CTA e a assinatura com o stakeholder.",
  "- Registrar feedback neste arquivo ou como issue relacionada.",
];

writeFileSync(resolve(process.cwd(), "docs", "gallery-issue.md"), issue.join("\n"), "utf8");
console.log("issue salva em docs/gallery-issue.md");
