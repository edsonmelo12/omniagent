import { buildSocialSearchQueries, searchSocialIntelligenceSources, type SocialSearchSource } from "../social-intelligence/social-intelligence.search.js";
import type { ClientRow } from "../clients/clients.repository.js";
import type { SocialProfileRow } from "../social-discovery/social-discovery.repository.js";

export type MarketResearchPublicSignals = {
  queries: string[];
  sources: SocialSearchSource[];
  summary: string | null;
};

export const collectMarketResearchPublicSignals = async (input: {
  client: Pick<ClientRow, "name" | "website_url" | "segment">;
  profiles: Array<Pick<SocialProfileRow, "platform" | "handle">>;
  braveSearchApiKey?: string;
  fetchImpl?: typeof fetch;
}) => {
  const queries = buildSocialSearchQueries(input.client, input.profiles).map((item) => item.query);
  const sources = await searchSocialIntelligenceSources({
    client: input.client,
    profiles: input.profiles,
    braveSearchApiKey: input.braveSearchApiKey,
    fetchImpl: input.fetchImpl,
  });

  if (!input.braveSearchApiKey) {
    return {
      queries,
      sources,
      summary: null,
    } satisfies MarketResearchPublicSignals;
  }

  if (sources.length === 0) {
    return {
      queries,
      sources,
      summary: `Brave Search executou ${queries.length} consulta(s), mas não encontrou fontes públicas úteis para o market research.`,
    } satisfies MarketResearchPublicSignals;
  }

  return {
    queries,
    sources,
    summary: `Brave Search executou ${queries.length} consulta(s) e adicionou ${sources.length} fonte(s) públicas ao market research.`,
  } satisfies MarketResearchPublicSignals;
};
