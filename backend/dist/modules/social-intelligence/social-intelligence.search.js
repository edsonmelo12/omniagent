import { env } from "../../app/env.js";
export const buildSocialSearchQueries = (client, profiles) => {
    const queries = [];
    const name = client.name.trim();
    const segment = client.segment?.trim() ?? "";
    const domain = getWebsiteHost(client.website_url);
    addQuery(queries, name, "brand name");
    if (segment) {
        addQuery(queries, `${name} ${segment}`, "brand + segment");
    }
    if (domain) {
        addQuery(queries, `site:${domain} "${name}"`, "official website");
    }
    for (const platform of uniquePlatforms(profiles)) {
        addQuery(queries, `site:${platformDomain(platform)} "${name}"`, `official ${platform}`);
    }
    const handles = uniqueHandles(profiles);
    if (handles.length > 0) {
        addQuery(queries, `"${name}" (${handles.join(" OR ")})`, "known handles");
    }
    return dedupeQueries(queries);
};
export const searchSocialIntelligenceSources = async (input) => {
    const braveSearchApiKey = input.braveSearchApiKey ?? env.BRAVE_SEARCH_API_KEY;
    if (!braveSearchApiKey) {
        return [];
    }
    const queries = buildSocialSearchQueries(input.client, input.profiles);
    if (queries.length === 0) {
        return [];
    }
    const results = [];
    for (const item of queries) {
        const queryResults = await searchBraveWeb(item.query, braveSearchApiKey, input.fetchImpl);
        for (const result of queryResults) {
            results.push({
                sourceUrl: result.url,
                sourceType: "brave_search",
                confidence: result.confidence,
                notes: `${item.reason}; query="${item.query}"; title="${result.title}"${result.description ? `; snippet="${result.description}"` : ""}`,
            });
        }
    }
    return dedupeSources(results);
};
const searchBraveWeb = async (query, braveSearchApiKey, fetchImpl = fetch) => {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(env.BRAVE_SEARCH_COUNT));
    url.searchParams.set("country", env.BRAVE_SEARCH_COUNTRY.toLowerCase());
    url.searchParams.set("search_lang", env.BRAVE_SEARCH_LANG.toLowerCase());
    url.searchParams.set("ui_lang", env.BRAVE_SEARCH_LANG.toLowerCase());
    url.searchParams.set("extra_snippets", "1");
    try {
        const response = await fetchImpl(url, {
            headers: {
                Accept: "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": braveSearchApiKey,
            },
        });
        if (!response.ok) {
            return [];
        }
        const data = (await response.json());
        const results = data.web?.results ?? [];
        return results
            .map((result) => normalizeSearchResult(result))
            .filter((result) => Boolean(result));
    }
    catch {
        return [];
    }
};
const normalizeSearchResult = (result) => {
    if (typeof result.url !== "string" || result.url.trim().length === 0) {
        return null;
    }
    const title = typeof result.title === "string" && result.title.trim().length > 0 ? result.title.trim() : result.url;
    const description = typeof result.description === "string" ? stripHtml(result.description) : "";
    const confidence = scoreSearchResult(result);
    return {
        title,
        url: normalizeUrl(result.url),
        description,
        confidence,
    };
};
const scoreSearchResult = (result) => {
    const profileName = result.profile?.name ?? result.profile?.long_name ?? "";
    const title = `${result.title ?? ""} ${profileName}`.toLowerCase();
    const description = `${result.description ?? ""} ${(result.extra_snippets ?? []).join(" ")}`.toLowerCase();
    const officialSignals = ["instagram", "linkedin", "facebook", "youtube", "tiktok", "x.com", "twitter.com"];
    const officialBoost = officialSignals.some((signal) => title.includes(signal) || description.includes(signal)) ? 8 : 0;
    const snippetBoost = result.description ? 6 : 0;
    const extraSnippetBoost = (result.extra_snippets?.length ?? 0) > 0 ? 6 : 0;
    return Math.max(45, Math.min(95, 55 + officialBoost + snippetBoost + extraSnippetBoost));
};
const uniquePlatforms = (profiles) => Array.from(new Set(profiles.map((profile) => profile.platform.trim().toLowerCase()).filter(Boolean)));
const uniqueHandles = (profiles) => Array.from(new Set(profiles.map((profile) => profile.handle.trim()).filter(Boolean)));
const platformDomain = (platform) => {
    if (platform === "x")
        return "x.com";
    return `${platform}.com`;
};
const addQuery = (queries, query, reason) => {
    const trimmed = query.trim();
    if (!trimmed)
        return;
    queries.push({ query: trimmed, reason });
};
const dedupeQueries = (queries) => {
    const seen = new Set();
    const unique = [];
    for (const query of queries) {
        const key = query.query.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        unique.push(query);
    }
    return unique;
};
const dedupeSources = (sources) => {
    const seen = new Set();
    const unique = [];
    for (const source of sources) {
        const key = source.sourceUrl.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        unique.push(source);
    }
    return unique;
};
const getWebsiteHost = (websiteUrl) => {
    if (!websiteUrl)
        return "";
    try {
        const url = new URL(websiteUrl);
        return url.hostname.toLowerCase();
    }
    catch {
        return "";
    }
};
const stripHtml = (value) => value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const normalizeUrl = (value) => {
    try {
        const url = new URL(value);
        return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`;
    }
    catch {
        return value.trim();
    }
};
