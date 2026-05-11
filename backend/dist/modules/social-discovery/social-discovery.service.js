import { createError } from "../../shared/http/errors.js";
import { queryOne } from "../../shared/db/database.js";
import { env } from "../../app/env.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findClientById } from "../clients/clients.repository.js";
import { listSocialProfilesByClientId, saveSocialProfiles } from "./social-discovery.repository.js";
import { discoverSocialProfilesFromBrave } from "./social-discovery.brave.js";
const SOCIAL_DOMAINS = new Map([
    ["instagram.com", "instagram"],
    ["www.instagram.com", "instagram"],
    ["facebook.com", "facebook"],
    ["www.facebook.com", "facebook"],
    ["tiktok.com", "tiktok"],
    ["www.tiktok.com", "tiktok"],
    ["youtube.com", "youtube"],
    ["www.youtube.com", "youtube"],
    ["linkedin.com", "linkedin"],
    ["www.linkedin.com", "linkedin"],
    ["x.com", "x"],
    ["www.x.com", "x"],
    ["twitter.com", "x"],
    ["www.twitter.com", "x"],
    ["threads.net", "threads"],
    ["www.threads.net", "threads"],
    ["pinterest.com", "pinterest"],
    ["www.pinterest.com", "pinterest"],
]);
const normalizeHandle = (value) => value
    .trim()
    .replace(/^@+/, "")
    .replace(/\/+$/, "");
const normalizeProfileUrl = (url) => `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`;
const extractPlatformAndHandle = (href) => {
    try {
        const url = new URL(href);
        const platform = SOCIAL_DOMAINS.get(url.hostname.toLowerCase());
        if (!platform) {
            return null;
        }
        const segments = url.pathname.split("/").filter(Boolean);
        const rawHandle = segments[0] ?? url.searchParams.get("id") ?? "";
        if (!rawHandle) {
            return null;
        }
        return {
            platform,
            handle: normalizeHandle(rawHandle),
            profileUrl: normalizeProfileUrl(url),
        };
    }
    catch {
        return null;
    }
};
const collectSocialLinksFromHtml = (html) => {
    const matches = html.matchAll(/href="([^"]+)"/g);
    const discovered = [];
    for (const match of matches) {
        const href = match[1];
        const parsed = extractPlatformAndHandle(href);
        if (parsed) {
            discovered.push(parsed);
        }
    }
    return discovered;
};
const fetchHtml = async (url) => {
    const response = await fetch(url, {
        headers: {
            "user-agent": "Mozilla/5.0 SocialGrowth/1.0",
            accept: "text/html,application/xhtml+xml",
        },
    });
    if (!response.ok) {
        throw createError("UPSTREAM_ERROR", `Unable to fetch source: ${url}`, 502);
    }
    return response.text();
};
export const discoverSocialProfiles = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const sourceCandidates = new Set(input.sourceUrls ?? []);
    if (client.website_url) {
        sourceCandidates.add(client.website_url);
    }
    const clientSites = await queryOne(`select coalesce(array_agg(url), '{}'::text[]) as urls
     from client_sites
     where client_id = $1`, [input.clientId]);
    for (const url of clientSites?.urls ?? []) {
        sourceCandidates.add(url);
    }
    const discoveredFromSources = [];
    for (const sourceUrl of sourceCandidates) {
        try {
            const html = await fetchHtml(sourceUrl);
            const links = collectSocialLinksFromHtml(html);
            for (const link of links) {
                discoveredFromSources.push({
                    platform: link.platform,
                    handle: link.handle,
                    profileUrl: link.profileUrl,
                    discoverySource: sourceUrl,
                    confidence: 85,
                });
            }
        }
        catch {
            continue;
        }
    }
    const discoveredFromInput = (input.discoveredProfiles ?? []).map((profile) => ({
        platform: profile.platform,
        handle: normalizeHandle(profile.handle),
        profileUrl: profile.profileUrl,
        discoverySource: profile.discoverySource,
        confidence: profile.confidence,
    }));
    const discoveredFromBrave = await discoverSocialProfilesFromBrave({
        client: {
            name: client.name,
            website_url: client.website_url,
            segment: client.segment,
        },
        profiles: discoveredFromInput,
        braveSearchApiKey: input.braveSearchApiKey ?? env.BRAVE_SEARCH_API_KEY,
    });
    const savedProfiles = await saveSocialProfiles([
        ...discoveredFromSources,
        ...discoveredFromInput,
        ...discoveredFromBrave,
    ].map((profile) => ({
        clientId: input.clientId,
        platform: profile.platform,
        handle: profile.handle,
        profileUrl: profile.profileUrl,
        discoverySource: profile.discoverySource,
        confidence: profile.confidence,
    })));
    const profiles = await listSocialProfilesByClientId(input.clientId);
    return {
        client,
        sourceUrls: [...sourceCandidates],
        discoveredProfiles: savedProfiles,
        profiles,
    };
};
