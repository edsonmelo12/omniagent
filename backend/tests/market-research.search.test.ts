import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgres://localhost:5432/omniagent";

const { collectMarketResearchPublicSignals } = await import(
  "../src/modules/market-research/market-research.search.js"
);

test("retorna sem resumo quando nao ha chave do Brave", async () => {
  const result = await collectMarketResearchPublicSignals({
    client: {
      name: "Omni Agent",
      website_url: "https://www.omniagent.com.br",
      segment: "Agentes de IA",
    },
    profiles: [],
  });

  assert.deepEqual(result, {
    queries: [
      "Omni Agent",
      "Omni Agent Agentes de IA",
      'site:www.omniagent.com.br "Omni Agent"',
    ],
    sources: [],
    summary: null,
  });
});

test("resumir fontes públicas do Brave para market research", async () => {
  const result = await collectMarketResearchPublicSignals({
    client: {
      name: "Omni Agent",
      website_url: "https://www.omniagent.com.br",
      segment: "Agentes de IA",
    },
    profiles: [{ platform: "instagram", handle: "omniagent" }],
    braveSearchApiKey: "test-token",
    fetchImpl: (async () => ({
      ok: true,
      json: async () => ({
        web: {
          results: [
            {
              title: "Omni Agent",
              url: "https://www.omniagent.com.br/",
              description: "Site oficial",
            },
          ],
        },
      }),
    })) as typeof fetch,
  });

  assert.equal(result.queries.length, 5);
  assert.equal(result.sources.length, 1);
  assert.match(result.summary ?? "", /adicionou 1 fonte/);
});
