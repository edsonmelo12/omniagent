import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgres://localhost:5432/omniagent";

const { buildSocialSearchQueries, searchSocialIntelligenceSources } = await import(
  "../src/modules/social-intelligence/social-intelligence.search.js"
);

test("monta consultas de pesquisa com site, segmento e perfis conhecidos", () => {
  const queries = buildSocialSearchQueries(
    {
      name: "Omni Agent",
      website_url: "https://www.omniagent.com.br/pt?utm_source=foo",
      segment: "Agentes de IA",
    },
    [
      { platform: "instagram", handle: "omniagent" },
      { platform: "linkedin", handle: "omniagent" },
      { platform: "instagram", handle: "omniagent" },
    ],
  );

  assert.deepEqual(queries, [
    { query: "Omni Agent", reason: "brand name" },
    { query: "Omni Agent Agentes de IA", reason: "brand + segment" },
    { query: 'site:www.omniagent.com.br "Omni Agent"', reason: "official website" },
    { query: 'site:instagram.com "Omni Agent"', reason: "official instagram" },
    { query: 'site:linkedin.com "Omni Agent"', reason: "official linkedin" },
    { query: '"Omni Agent" (omniagent)', reason: "known handles" },
  ]);
});

test("retorna vazio quando a chave do Brave nao esta disponivel", async () => {
  const sources = await searchSocialIntelligenceSources({
    client: {
      name: "Omni Agent",
      website_url: "https://www.omniagent.com.br",
      segment: null,
    },
    profiles: [],
    braveSearchApiKey: "",
  });

  assert.deepEqual(sources, []);
});

test("normaliza e deduplica resultados do Brave Search", async () => {
  const requestedUrls: string[] = [];

  const sources = await searchSocialIntelligenceSources({
    client: {
      name: "Omni Agent",
      website_url: null,
      segment: null,
    },
    profiles: [],
    braveSearchApiKey: "test-token",
    fetchImpl: (async (url: URL) => {
      requestedUrls.push(url.toString());

      return {
        ok: true,
        json: async () => ({
          web: {
            results: [
              {
                title: "Omni Agent no Instagram",
                url: "https://instagram.com/omniagent/",
                description: "Perfil oficial",
                extra_snippets: ["Conteudo", "Autoridade"],
              },
              {
                title: "Omni Agent no Instagram",
                url: "https://instagram.com/omniagent",
                description: "Perfil oficial duplicado",
              },
              {
                title: "Resultado sem url",
                description: "Ignorado",
              },
            ],
          },
        }),
      } as any;
    }) as typeof fetch,
  });

  assert.equal(requestedUrls.length, 1);
  assert.equal(sources.length, 1);
  assert.deepEqual(sources[0], {
    sourceUrl: "https://instagram.com/omniagent",
    sourceType: "brave_search",
    confidence: sources[0].confidence,
    notes: sources[0].notes,
  });
  assert(sources[0].confidence >= 45);
  assert.match(sources[0].notes, /brand name/);
  assert.match(sources[0].notes, /Omni Agent no Instagram/);
});
