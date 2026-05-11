import { buildSocialSearchQueries, searchSocialIntelligenceSources } from "../social-intelligence/social-intelligence.search.js";
export const collectMarketResearchPublicSignals = async (input) => {
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
        };
    }
    if (sources.length === 0) {
        return {
            queries,
            sources,
            summary: `Brave Search executou ${queries.length} consulta(s), mas não encontrou fontes públicas úteis para o market research.`,
        };
    }
    return {
        queries,
        sources,
        summary: `Brave Search executou ${queries.length} consulta(s) e adicionou ${sources.length} fonte(s) públicas ao market research.`,
    };
};
