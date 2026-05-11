import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const baseDir = path.resolve("squads/social-growth/output/dallas-rent-a-car/blog/assets");

const sources = [
  {
    output: "frota-propria-vs-terceirizacao.jpg",
    page: "https://pxhere.com/en/photo/1703012"
  },
  {
    output: "aluguel-mensal-custos-invisiveis.jpg",
    page: "https://pxhere.com/fr/photo/1703008"
  },
  {
    output: "viagem-corporativa-locacao-local.jpg",
    page: "https://pxhere.com/en/photo/1601100"
  },
  {
    output: "escolher-categoria-certa.jpg",
    page: "https://pxhere.com/en/photo/1629378"
  },
  {
    output: "locacao-com-motorista-belem.jpg",
    page: "https://pxhere.com/en/photo/1707796"
  },
  {
    output: "contrato-locacao-checklist-tarifas.jpg",
    page: "https://pxhere.com/en/photo/1703018"
  },
  {
    output: "assistencia-24h-carro-reserva-operacao.jpg",
    page: "https://pxhere.com/en/photo/1701150"
  },
  {
    output: "locacao-aeroporto-vs-loja.jpg",
    page: "https://pxhere.com/en/photo/1017560"
  },
  {
    output: "mercado-locacao-2026-para.jpg",
    page: "https://pxhere.com/en/photo/1642192"
  },
  {
    output: "reserva-eficiente-no-show-empresas.jpg",
    page: "https://pxhere.com/en/photo/1132024"
  }
];

function request(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            resolve(request(res.headers.location));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`Request failed for ${url}: ${res.statusCode}`));
            return;
          }
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        }
      )
      .on("error", reject);
  });
}

function extractContentUrl(html) {
  const match = html.match(/"contentUrl"\s*:\s*"([^"]+)"/);
  if (!match) throw new Error("Could not locate contentUrl");
  return match[1].replaceAll("\\/", "/");
}

fs.mkdirSync(baseDir, { recursive: true });

for (const source of sources) {
  const pageHtml = (await request(source.page)).toString("utf8");
  const contentUrl = extractContentUrl(pageHtml);
  const buffer = await request(contentUrl);
  fs.writeFileSync(path.join(baseDir, source.output), buffer);
  console.log(`Downloaded ${source.output}`);
}
