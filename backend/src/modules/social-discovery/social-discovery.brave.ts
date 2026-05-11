import { env } from "../../app/env.js";
import type { ClientRow } from "../clients/clients.repository.js";
import type { SocialProfileRow } from "./social-discovery.repository.js";
import { searchSocialIntelligenceSources } from "../social-intelligence/social-intelligence.search.js";

type BraveSocialProfile = {
  platform: string;
  handle: string;
  profileUrl: string;
  discoverySource: string;
  confidence: number;
};

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

const normalizeHandle = (value: string) =>
  value
    .trim()
    .replace(/^@+/, "")
    .replace(/\/+$/, "");

const normalizeProfileUrl = (url: URL) => `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`;

const extractPlatformAndHandle = (href: string) => {
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
  } catch {
    return null;
  }
};

export const discoverSocialProfilesFromBrave = async (input: {
  client: Pick<ClientRow, "name" | "website_url" | "segment">;
  profiles: Array<Pick<SocialProfileRow, "platform" | "handle">>;
  braveSearchApiKey?: string;
  fetchImpl?: typeof fetch;
}) => {
  const braveSearchApiKey = input.braveSearchApiKey ?? env.BRAVE_SEARCH_API_KEY;

  if (!braveSearchApiKey) {
    return [];
  }

  const sources = await searchSocialIntelligenceSources({
    client: input.client,
    profiles: input.profiles,
    braveSearchApiKey,
    fetchImpl: input.fetchImpl,
  });

  const discovered: BraveSocialProfile[] = [];

  for (const source of sources) {
    const parsed = extractPlatformAndHandle(source.sourceUrl);
    if (!parsed) {
      continue;
    }

    discovered.push({
      platform: parsed.platform,
      handle: parsed.handle,
      profileUrl: parsed.profileUrl,
      discoverySource: source.sourceUrl,
      confidence: Math.max(source.confidence, 75),
    });
  }

  return dedupeProfiles(discovered);
};

const dedupeProfiles = (profiles: BraveSocialProfile[]) => {
  const seen = new Set<string>();
  const unique: BraveSocialProfile[] = [];

  for (const profile of profiles) {
    const key = [profile.platform.trim().toLowerCase(), profile.handle.trim().toLowerCase(), profile.profileUrl.trim().toLowerCase()].join(":");
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(profile);
  }

  return unique;
};
