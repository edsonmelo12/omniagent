import { fetchProfileHtmlWithBrowser } from "./social-presence.browser.js";
const PLATFORM_PATTERNS = {
    instagram: {
        followers: [
            /"edge_followed_by"\s*:\s*{\s*"count"\s*:\s*(\d+)/i,
            /"follower_count"\s*:\s*(\d+)/i,
            /([\d.,]+(?:\s*[kKmMbB])?)\s+(followers|seguidores)/i,
        ],
        posts: [
            /"edge_owner_to_timeline_media"\s*:\s*{\s*"count"\s*:\s*(\d+)/i,
            /"media_count"\s*:\s*(\d+)/i,
            /([\d.,]+(?:\s*[kKmMbB])?)\s+(posts|publica[cç][õo]es)/i,
        ],
        latestPostAt: [
            /"taken_at_timestamp"\s*:\s*(\d+)/i,
            /"datePublished"\s*:\s*"([^"]+)"/i,
            /<time[^>]+datetime="([^"]+)"/i,
        ],
    },
    facebook: {
        followers: [
            /([\d.,]+(?:\s*[kKmMbB])?)\s+(followers|seguidores|curtidas|likes)/i,
            /"followers_count"\s*:\s*(\d+)/i,
        ],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+(posts|publica[cç][õo]es)/i, /"posts_count"\s*:\s*(\d+)/i],
        latestPostAt: [/"datePublished"\s*:\s*"([^"]+)"/i, /<time[^>]+datetime="([^"]+)"/i],
    },
    linkedin: {
        followers: [/([\d.,]+(?:\s*[kKmMbB])?)\s+followers/i, /([\d.,]+(?:\s*[kKmMbB])?)\s+seguidores/i],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+posts/i, /([\d.,]+(?:\s*[kKmMbB])?)\s+publica[cç][õo]es/i],
        latestPostAt: [/"datePublished"\s*:\s*"([^"]+)"/i, /<time[^>]+datetime="([^"]+)"/i],
    },
    youtube: {
        followers: [
            /([\d.,]+(?:\s*[kKmMbB])?)\s+(subscribers|inscritos)/i,
            /"subscriberCountText"\s*:\s*{\s*"simpleText"\s*:\s*"([^"]+)"/i,
        ],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+(videos|uploads)/i, /"videoCountText"\s*:\s*{\s*"simpleText"\s*:\s*"([^"]+)"/i],
        latestPostAt: [/"datePublished"\s*:\s*"([^"]+)"/i, /<time[^>]+datetime="([^"]+)"/i],
    },
    tiktok: {
        followers: [/([\d.,]+(?:\s*[kKmMbB])?)\s+(followers|seguidores)/i, /"followerCount"\s*:\s*(\d+)/i],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+(videos|posts)/i, /"videoCount"\s*:\s*(\d+)/i],
        latestPostAt: [/"createTime"\s*:\s*"([^"]+)"/i, /"createTime"\s*:\s*(\d+)/i, /<time[^>]+datetime="([^"]+)"/i],
    },
    x: {
        followers: [/([\d.,]+(?:\s*[kKmMbB])?)\s+followers/i, /([\d.,]+(?:\s*[kKmMbB])?)\s+seguidores/i],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+posts/i, /([\d.,]+(?:\s*[kKmMbB])?)\s+tweets/i],
        latestPostAt: [/<time[^>]+datetime="([^"]+)"/i, /"created_at"\s*:\s*"([^"]+)"/i],
    },
    threads: {
        followers: [/([\d.,]+(?:\s*[kKmMbB])?)\s+followers/i, /([\d.,]+(?:\s*[kKmMbB])?)\s+seguidores/i],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+posts/i],
        latestPostAt: [/"datePublished"\s*:\s*"([^"]+)"/i, /<time[^>]+datetime="([^"]+)"/i],
    },
    pinterest: {
        followers: [/([\d.,]+(?:\s*[kKmMbB])?)\s+followers/i],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+pins/i, /([\d.,]+(?:\s*[kKmMbB])?)\s+posts/i],
        latestPostAt: [/<time[^>]+datetime="([^"]+)"/i, /"datePublished"\s*:\s*"([^"]+)"/i],
    },
    other: {
        followers: [/([\d.,]+(?:\s*[kKmMbB])?)\s+(followers|seguidores|inscritos|subscribers|likes)/i],
        posts: [/([\d.,]+(?:\s*[kKmMbB])?)\s+(posts|videos|publica[cç][õo]es)/i],
        latestPostAt: [/<time[^>]+datetime="([^"]+)"/i, /"datePublished"\s*:\s*"([^"]+)"/i],
    },
};
const SOCIAL_PLATFORM_NAMES = new Set(Object.keys(PLATFORM_PATTERNS));
const USER_AGENT = "Mozilla/5.0 SocialGrowth/1.0";
const normalizePlatform = (value) => {
    const normalized = value.trim().toLowerCase();
    return SOCIAL_PLATFORM_NAMES.has(normalized) ? normalized : "other";
};
const normalizeHandle = (value) => value.trim().replace(/^@+/, "").replace(/\/+$/, "");
const normalizeProfileUrl = (value) => {
    try {
        const url = new URL(value);
        url.hash = "";
        url.search = "";
        url.pathname = url.pathname.replace(/\/+$/, "");
        return `${url.protocol}//${url.host}${url.pathname}`;
    }
    catch {
        return value.trim();
    }
};
const stripHtml = (html) => html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
const parseCountToken = (value) => {
    const normalized = value.trim().replace(/\s+/g, "").toLowerCase();
    const match = normalized.match(/^(\d+(?:[.,]\d+)?)([kmb])?$/i);
    if (!match) {
        const plain = Number(normalized.replace(/[^\d.-]/g, ""));
        return Number.isFinite(plain) ? Math.round(plain) : null;
    }
    const base = Number(match[1].replace(",", "."));
    const suffix = match[2] ?? "";
    const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;
    const result = Math.round(base * multiplier);
    return Number.isFinite(result) ? result : null;
};
const extractPatternValue = (source, patterns) => {
    for (const pattern of patterns) {
        const match = source.match(pattern);
        if (!match)
            continue;
        const raw = match[1]?.trim();
        if (!raw)
            continue;
        if (/^\d+$/.test(raw)) {
            return { value: Number(raw), matchedPattern: pattern.source };
        }
        const count = parseCountToken(raw);
        if (count !== null) {
            return { value: count, matchedPattern: pattern.source };
        }
    }
    return null;
};
const extractDateValue = (source, patterns) => {
    for (const pattern of patterns) {
        const match = source.match(pattern);
        if (!match)
            continue;
        const raw = match[1]?.trim();
        if (!raw)
            continue;
        if (/^\d{10}$/.test(raw)) {
            const date = new Date(Number(raw) * 1_000);
            if (!Number.isNaN(date.getTime())) {
                return { value: date.toISOString(), matchedPattern: pattern.source };
            }
        }
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
            return { value: parsed.toISOString(), matchedPattern: pattern.source };
        }
    }
    return null;
};
const buildStatus = (followersCount, postsCount, latestPostAt, fetchSucceeded) => {
    if (!fetchSucceeded) {
        return "unavailable";
    }
    const present = [followersCount, postsCount, latestPostAt].filter((value) => value !== null).length;
    if (present === 3) {
        return "captured";
    }
    if (present >= 1) {
        return "partial";
    }
    return "partial";
};
const buildConfidence = (profileConfidence, status, followersCount, postsCount, latestPostAt) => {
    if (status === "unavailable") {
        return Math.min(profileConfidence ?? 30, 30);
    }
    const completeness = [followersCount, postsCount, latestPostAt].filter((value) => value !== null).length;
    const baseline = completeness === 3 ? 90 : completeness === 2 ? 75 : completeness === 1 ? 60 : 45;
    return Math.min(100, Math.max(profileConfidence ?? baseline, baseline));
};
const buildObservation = (input) => {
    const observationStatus = buildStatus(input.followersCount, input.postsCount, input.latestPostAt, input.fetchSucceeded);
    const confidence = buildConfidence(input.profileConfidence, observationStatus, input.followersCount, input.postsCount, input.latestPostAt);
    return {
        platform: input.platform,
        handle: input.handle,
        profileUrl: input.profileUrl,
        followersCount: input.followersCount,
        postsCount: input.postsCount,
        latestPostAt: input.latestPostAt,
        observationStatus,
        confidence,
        notes: input.notes,
        payload: input.payload,
    };
};
const fetchJson = async (url, fetchImpl) => {
    const safeUrl = (() => {
        try {
            const parsed = new URL(url);
            parsed.searchParams.delete("access_token");
            parsed.searchParams.delete("key");
            parsed.searchParams.delete("client_secret");
            return parsed.toString();
        }
        catch {
            return url;
        }
    })();
    const response = await fetchImpl(url, {
        headers: {
            "user-agent": USER_AGENT,
            accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Unable to fetch API resource: ${safeUrl}`);
    }
    return response.json();
};
const fetchProfileHtml = async (profileUrl, fetchImpl) => {
    const response = await fetchImpl(profileUrl, {
        headers: {
            "user-agent": USER_AGENT,
            accept: "text/html,application/xhtml+xml",
        },
    });
    if (!response.ok) {
        throw new Error(`Unable to fetch profile: ${profileUrl}`);
    }
    return response.text();
};
const collectObservationFromHtml = (profile, html, source, notesSuffix, payload) => {
    const platform = normalizePlatform(profile.platform);
    const normalizedHandle = normalizeHandle(profile.handle);
    const normalizedProfileUrl = normalizeProfileUrl(profile.profile_url);
    const patterns = PLATFORM_PATTERNS[platform] ?? PLATFORM_PATTERNS.other;
    const text = stripHtml(html);
    const rawMatches = [];
    const followersMatch = extractPatternValue(html, patterns.followers) ?? extractPatternValue(text, patterns.followers);
    const postsMatch = extractPatternValue(html, patterns.posts) ?? extractPatternValue(text, patterns.posts);
    const latestPostAtMatch = extractDateValue(html, patterns.latestPostAt) ?? extractDateValue(text, patterns.latestPostAt);
    if (followersMatch)
        rawMatches.push(followersMatch.matchedPattern);
    if (postsMatch)
        rawMatches.push(postsMatch.matchedPattern);
    if (latestPostAtMatch)
        rawMatches.push(latestPostAtMatch.matchedPattern);
    const followersCount = followersMatch?.value ?? null;
    const postsCount = postsMatch?.value ?? null;
    const latestPostAt = latestPostAtMatch?.value ?? null;
    const missing = [];
    if (followersCount === null)
        missing.push("followers");
    if (postsCount === null)
        missing.push("posts");
    if (latestPostAt === null)
        missing.push("latest_post_at");
    return buildObservation({
        platform,
        handle: normalizedHandle || null,
        profileUrl: normalizedProfileUrl,
        followersCount,
        postsCount,
        latestPostAt,
        profileConfidence: profile.confidence,
        fetchSucceeded: true,
        notes: missing.length === 0
            ? `Presence metrics collected for ${platform} via ${source}.`
            : `Partial presence metrics collected for ${platform} via ${source}; missing ${missing.join(", ")}.${notesSuffix ? ` ${notesSuffix}` : ""}`,
        payload: {
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            source,
            matchedPatterns: rawMatches,
            missing,
            ...(payload ?? {}),
        },
    });
};
const collectBrowserObservation = async (profile, captureBrowserHtml = fetchProfileHtmlWithBrowser) => {
    const normalizedProfileUrl = normalizeProfileUrl(profile.profile_url);
    const normalizedHandle = normalizeHandle(profile.handle);
    const platform = normalizePlatform(profile.platform);
    try {
        const capture = await captureBrowserHtml(normalizedProfileUrl);
        const notesSuffix = capture.finalUrl !== normalizedProfileUrl ? `Final URL resolved to ${capture.finalUrl}.` : undefined;
        return collectObservationFromHtml(profile, capture.html, "browser", notesSuffix, {
            finalUrl: capture.finalUrl,
            title: capture.title,
        });
    }
    catch (error) {
        return buildObservation({
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            followersCount: null,
            postsCount: null,
            latestPostAt: null,
            profileConfidence: profile.confidence,
            fetchSucceeded: false,
            notes: `Browser capture unavailable for ${platform}.`,
            payload: {
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                source: "browser",
                error: error instanceof Error ? error.message : String(error),
            },
        });
    }
};
const extractYouTubeChannelIdFromUrl = (profileUrl) => {
    try {
        const url = new URL(profileUrl);
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments[0]?.toLowerCase() === "channel" && segments[1]) {
            return segments[1];
        }
    }
    catch {
        return null;
    }
    return null;
};
const getYouTubeSearchQueries = (profile) => {
    const candidates = new Set();
    const normalizedHandle = normalizeHandle(profile.handle);
    if (normalizedHandle) {
        candidates.add(normalizedHandle);
        candidates.add(`@${normalizedHandle}`);
    }
    try {
        const url = new URL(profile.profile_url);
        const segments = url.pathname.split("/").filter(Boolean);
        const firstSegment = segments[0] ?? "";
        if (firstSegment.startsWith("@")) {
            const handle = firstSegment.replace(/^@+/, "");
            if (handle) {
                candidates.add(handle);
                candidates.add(`@${handle}`);
            }
        }
    }
    catch {
        // Ignore malformed URLs and keep the handle-based search only.
    }
    return [...candidates];
};
const getYouTubeApiKey = () => process.env.SOCIAL_PRESENCE_YOUTUBE_API_KEY?.trim() ?? null;
const getMetaGraphAccessToken = () => process.env.META_GRAPH_ACCESS_TOKEN?.trim() ?? null;
const getMetaGraphApiVersion = () => process.env.META_GRAPH_API_VERSION?.trim() || "v20.0";
const getMetaInstagramBusinessAccountId = () => process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ?? null;
const getProfileSearchCandidates = (profile) => {
    const candidates = new Set();
    const normalizedHandle = normalizeHandle(profile.handle);
    if (normalizedHandle) {
        candidates.add(normalizedHandle);
        candidates.add(`@${normalizedHandle}`);
    }
    try {
        const url = new URL(profile.profile_url);
        const segments = url.pathname.split("/").filter(Boolean);
        const firstSegment = segments[0] ?? "";
        if (firstSegment) {
            candidates.add(firstSegment.replace(/^@+/, ""));
            candidates.add(firstSegment);
        }
    }
    catch {
        // Ignore malformed URLs and keep handle-based search only.
    }
    return [...candidates].filter(Boolean);
};
const collectHtmlObservation = async (profile, fetchImpl) => {
    const platform = normalizePlatform(profile.platform);
    const normalizedHandle = normalizeHandle(profile.handle);
    const normalizedProfileUrl = normalizeProfileUrl(profile.profile_url);
    const patterns = PLATFORM_PATTERNS[platform] ?? PLATFORM_PATTERNS.other;
    try {
        const html = await fetchProfileHtml(normalizedProfileUrl, fetchImpl);
        const text = stripHtml(html);
        const rawMatches = [];
        const followersMatch = extractPatternValue(html, patterns.followers) ?? extractPatternValue(text, patterns.followers);
        const postsMatch = extractPatternValue(html, patterns.posts) ?? extractPatternValue(text, patterns.posts);
        const latestPostAtMatch = extractDateValue(html, patterns.latestPostAt) ?? extractDateValue(text, patterns.latestPostAt);
        if (followersMatch)
            rawMatches.push(followersMatch.matchedPattern);
        if (postsMatch)
            rawMatches.push(postsMatch.matchedPattern);
        if (latestPostAtMatch)
            rawMatches.push(latestPostAtMatch.matchedPattern);
        const followersCount = followersMatch?.value ?? null;
        const postsCount = postsMatch?.value ?? null;
        const latestPostAt = latestPostAtMatch?.value ?? null;
        const missing = [];
        if (followersCount === null)
            missing.push("followers");
        if (postsCount === null)
            missing.push("posts");
        if (latestPostAt === null)
            missing.push("latest_post_at");
        return buildObservation({
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            followersCount,
            postsCount,
            latestPostAt,
            profileConfidence: profile.confidence,
            fetchSucceeded: true,
            notes: missing.length === 0
                ? `Presence metrics collected for ${platform}.`
                : `Partial presence metrics collected for ${platform}; missing ${missing.join(", ")}.`,
            payload: {
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                source: "html",
                matchedPatterns: rawMatches,
                missing,
            },
        });
    }
    catch (error) {
        return buildObservation({
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            followersCount: null,
            postsCount: null,
            latestPostAt: null,
            profileConfidence: profile.confidence,
            fetchSucceeded: false,
            notes: `Profile capture unavailable for ${platform}.`,
            payload: {
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                source: "html",
                error: error instanceof Error ? error.message : String(error),
            },
        });
    }
};
const collectYoutubeApiObservation = async (profile, fetchImpl) => {
    const apiKey = getYouTubeApiKey();
    if (!apiKey) {
        return null;
    }
    const platform = "youtube";
    const normalizedHandle = normalizeHandle(profile.handle);
    const normalizedProfileUrl = normalizeProfileUrl(profile.profile_url);
    const directChannelId = extractYouTubeChannelIdFromUrl(normalizedProfileUrl);
    try {
        let resolvedChannelId = directChannelId;
        let searchQuery = null;
        let channelTitle = null;
        if (!resolvedChannelId) {
            for (const candidate of getYouTubeSearchQueries(profile)) {
                searchQuery = candidate;
                const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
                searchUrl.searchParams.set("part", "snippet");
                searchUrl.searchParams.set("type", "channel");
                searchUrl.searchParams.set("maxResults", "5");
                searchUrl.searchParams.set("q", candidate);
                searchUrl.searchParams.set("key", apiKey);
                const searchData = await fetchJson(searchUrl.toString(), fetchImpl);
                const firstItem = Array.isArray(searchData?.items) ? searchData.items[0] : null;
                const itemRecord = firstItem && typeof firstItem === "object" ? firstItem : null;
                const itemId = itemRecord && typeof itemRecord.id === "object" ? itemRecord.id : null;
                const channelId = typeof itemId?.channelId === "string" ? itemId.channelId : null;
                if (channelId) {
                    resolvedChannelId = channelId;
                    const snippet = itemRecord && typeof itemRecord.snippet === "object" ? itemRecord.snippet : null;
                    channelTitle = typeof snippet?.title === "string" ? snippet.title : null;
                    break;
                }
            }
        }
        if (!resolvedChannelId) {
            return buildObservation({
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                followersCount: null,
                postsCount: null,
                latestPostAt: null,
                profileConfidence: profile.confidence,
                fetchSucceeded: false,
                notes: "YouTube API could not resolve a channel for this profile.",
                payload: {
                    platform,
                    handle: normalizedHandle || null,
                    profileUrl: normalizedProfileUrl,
                    source: "api",
                    provider: "youtubeDataApi",
                    apiError: "channel_not_found",
                    searchQuery,
                },
            });
        }
        const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
        channelsUrl.searchParams.set("part", "snippet,statistics,contentDetails");
        channelsUrl.searchParams.set("id", resolvedChannelId);
        channelsUrl.searchParams.set("key", apiKey);
        const channelsData = await fetchJson(channelsUrl.toString(), fetchImpl);
        const channelItem = Array.isArray(channelsData?.items) ? channelsData.items[0] : null;
        const channelRecord = channelItem && typeof channelItem === "object" ? channelItem : null;
        const statistics = channelRecord && typeof channelRecord.statistics === "object" ? channelRecord.statistics : null;
        const snippet = channelRecord && typeof channelRecord.snippet === "object" ? channelRecord.snippet : null;
        const followersCount = typeof statistics?.subscriberCount === "number" ? statistics.subscriberCount : null;
        const postsCount = typeof statistics?.videoCount === "number" ? statistics.videoCount : null;
        const hiddenSubscriberCount = typeof statistics?.hiddenSubscriberCount === "boolean" ? statistics.hiddenSubscriberCount : null;
        const channelPublishedAt = typeof snippet?.publishedAt === "string" ? snippet.publishedAt : null;
        let latestPostAt = channelPublishedAt;
        let latestVideoId = null;
        const videosUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        videosUrl.searchParams.set("part", "snippet");
        videosUrl.searchParams.set("channelId", resolvedChannelId);
        videosUrl.searchParams.set("order", "date");
        videosUrl.searchParams.set("type", "video");
        videosUrl.searchParams.set("maxResults", "1");
        videosUrl.searchParams.set("key", apiKey);
        const videosData = await fetchJson(videosUrl.toString(), fetchImpl);
        const latestVideo = Array.isArray(videosData?.items) ? videosData.items[0] : null;
        const latestVideoRecord = latestVideo && typeof latestVideo === "object" ? latestVideo : null;
        const latestVideoSnippet = latestVideoRecord && typeof latestVideoRecord.snippet === "object"
            ? latestVideoRecord.snippet
            : null;
        const latestVideoIdRecord = latestVideoRecord && typeof latestVideoRecord.id === "object"
            ? latestVideoRecord.id
            : null;
        if (typeof latestVideoIdRecord?.videoId === "string") {
            latestVideoId = latestVideoIdRecord.videoId;
        }
        if (typeof latestVideoSnippet?.publishedAt === "string") {
            latestPostAt = latestVideoSnippet.publishedAt;
        }
        const missing = [];
        if (followersCount === null)
            missing.push("followers");
        if (postsCount === null)
            missing.push("posts");
        if (latestPostAt === null)
            missing.push("latest_post_at");
        return buildObservation({
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            followersCount,
            postsCount,
            latestPostAt,
            profileConfidence: profile.confidence,
            fetchSucceeded: true,
            notes: missing.length === 0
                ? "Presence metrics collected via YouTube Data API."
                : `YouTube Data API returned partial metrics; missing ${missing.join(", ")}.`,
            payload: {
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                source: "api",
                provider: "youtubeDataApi",
                channelId: resolvedChannelId,
                channelTitle,
                hiddenSubscriberCount,
                channelPublishedAt,
                latestVideoId,
                searchQuery,
                missing,
            },
        });
    }
    catch (error) {
        return buildObservation({
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            followersCount: null,
            postsCount: null,
            latestPostAt: null,
            profileConfidence: profile.confidence,
            fetchSucceeded: false,
            notes: "YouTube API capture failed before the HTML fallback.",
            payload: {
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                source: "api",
                provider: "youtubeDataApi",
                apiError: error instanceof Error ? error.message : String(error),
            },
        });
    }
};
const collectMetaApiObservation = async (profile, fetchImpl) => {
    const apiKey = getMetaGraphAccessToken();
    if (!apiKey) {
        return null;
    }
    const platform = normalizePlatform(profile.platform);
    if (platform !== "facebook" && platform !== "instagram") {
        return null;
    }
    const normalizedHandle = normalizeHandle(profile.handle);
    const normalizedProfileUrl = normalizeProfileUrl(profile.profile_url);
    const apiVersion = getMetaGraphApiVersion();
    try {
        if (platform === "facebook") {
            let pageRecord = null;
            let searchQuery = null;
            for (const candidate of getProfileSearchCandidates(profile)) {
                searchQuery = candidate;
                const searchUrl = new URL(`https://graph.facebook.com/${apiVersion}/search`);
                searchUrl.searchParams.set("type", "page");
                searchUrl.searchParams.set("q", candidate);
                searchUrl.searchParams.set("fields", "id,name,username,link,fan_count,followers_count,posts.limit(1).summary(true){created_time}");
                searchUrl.searchParams.set("access_token", apiKey);
                const searchData = await fetchJson(searchUrl.toString(), fetchImpl);
                const firstItem = Array.isArray(searchData?.data) ? searchData.data[0] : null;
                pageRecord = firstItem && typeof firstItem === "object" ? firstItem : null;
                if (pageRecord) {
                    break;
                }
            }
            if (!pageRecord) {
                return buildObservation({
                    platform,
                    handle: normalizedHandle || null,
                    profileUrl: normalizedProfileUrl,
                    followersCount: null,
                    postsCount: null,
                    latestPostAt: null,
                    profileConfidence: profile.confidence,
                    fetchSucceeded: false,
                    notes: "Meta Graph API could not resolve a Facebook page for this profile.",
                    payload: {
                        platform,
                        handle: normalizedHandle || null,
                        profileUrl: normalizedProfileUrl,
                        source: "api",
                        provider: "metaGraphApi",
                        apiError: "page_not_found",
                        searchQuery,
                    },
                });
            }
            const postsRecord = pageRecord.posts && typeof pageRecord.posts === "object" ? pageRecord.posts : null;
            const postsSummary = postsRecord?.summary && typeof postsRecord.summary === "object" ? postsRecord.summary : null;
            const postsData = Array.isArray(postsRecord?.data) ? postsRecord?.data : [];
            const latestPostRecord = postsData.length > 0 && typeof postsData[0] === "object" ? postsData[0] : null;
            const followersCount = typeof pageRecord.followers_count === "number"
                ? pageRecord.followers_count
                : typeof pageRecord.fan_count === "number"
                    ? pageRecord.fan_count
                    : null;
            const postsCount = typeof postsSummary?.total_count === "number" ? postsSummary.total_count : null;
            const latestPostAt = typeof latestPostRecord?.created_time === "string" ? latestPostRecord.created_time : null;
            const pageName = typeof pageRecord.name === "string" ? pageRecord.name : null;
            const pageLink = typeof pageRecord.link === "string" ? pageRecord.link : normalizedProfileUrl;
            const pageUsername = typeof pageRecord.username === "string" ? pageRecord.username : normalizedHandle || null;
            const missing = [];
            if (followersCount === null)
                missing.push("followers");
            if (postsCount === null)
                missing.push("posts");
            if (latestPostAt === null)
                missing.push("latest_post_at");
            return buildObservation({
                platform,
                handle: pageUsername,
                profileUrl: pageLink,
                followersCount,
                postsCount,
                latestPostAt,
                profileConfidence: profile.confidence,
                fetchSucceeded: true,
                notes: missing.length === 0
                    ? "Presence metrics collected via Meta Graph API."
                    : `Meta Graph API returned partial metrics; missing ${missing.join(", ")}.`,
                payload: {
                    platform,
                    handle: pageUsername,
                    profileUrl: pageLink,
                    source: "api",
                    provider: "metaGraphApi",
                    network: "facebook",
                    pageId: typeof pageRecord.id === "string" ? pageRecord.id : null,
                    pageName,
                    pageUsername,
                    searchQuery,
                    missing,
                },
            });
        }
        const businessAccountId = getMetaInstagramBusinessAccountId();
        if (!businessAccountId) {
            return null;
        }
        const candidates = getProfileSearchCandidates(profile);
        const username = candidates.find((candidate) => !candidate.includes("facebook.com") && !candidate.includes("instagram.com")) ?? normalizedHandle;
        if (!username) {
            return buildObservation({
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                followersCount: null,
                postsCount: null,
                latestPostAt: null,
                profileConfidence: profile.confidence,
                fetchSucceeded: false,
                notes: "Meta Graph API could not resolve an Instagram username for this profile.",
                payload: {
                    platform,
                    handle: normalizedHandle || null,
                    profileUrl: normalizedProfileUrl,
                    source: "api",
                    provider: "metaGraphApi",
                    apiError: "username_not_found",
                },
            });
        }
        const discoveryUrl = new URL(`https://graph.facebook.com/${apiVersion}/${businessAccountId}`);
        discoveryUrl.searchParams.set("fields", `business_discovery.username(${username}){username,name,followers_count,media_count,media.limit(1){timestamp,permalink}}`);
        discoveryUrl.searchParams.set("access_token", apiKey);
        const discoveryData = await fetchJson(discoveryUrl.toString(), fetchImpl);
        const discoveryRecord = discoveryData && typeof discoveryData === "object" ? discoveryData : null;
        const businessDiscovery = discoveryRecord?.business_discovery && typeof discoveryRecord.business_discovery === "object"
            ? discoveryRecord.business_discovery
            : null;
        if (!businessDiscovery) {
            return buildObservation({
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                followersCount: null,
                postsCount: null,
                latestPostAt: null,
                profileConfidence: profile.confidence,
                fetchSucceeded: false,
                notes: "Meta Graph API could not resolve Instagram business discovery for this profile.",
                payload: {
                    platform,
                    handle: normalizedHandle || null,
                    profileUrl: normalizedProfileUrl,
                    source: "api",
                    provider: "metaGraphApi",
                    apiError: "business_discovery_not_found",
                    username,
                    businessAccountId,
                },
            });
        }
        const mediaRecord = businessDiscovery.media && typeof businessDiscovery.media === "object" ? businessDiscovery.media : null;
        const mediaData = Array.isArray(mediaRecord?.data) ? mediaRecord.data : [];
        const latestMediaRecord = mediaData.length > 0 && typeof mediaData[0] === "object" ? mediaData[0] : null;
        const followersCount = typeof businessDiscovery.followers_count === "number" ? businessDiscovery.followers_count : null;
        const postsCount = typeof businessDiscovery.media_count === "number" ? businessDiscovery.media_count : null;
        const latestPostAt = typeof latestMediaRecord?.timestamp === "string" ? latestMediaRecord.timestamp : null;
        const resolvedUsername = typeof businessDiscovery.username === "string" ? businessDiscovery.username : username;
        const resolvedName = typeof businessDiscovery.name === "string" ? businessDiscovery.name : null;
        const missing = [];
        if (followersCount === null)
            missing.push("followers");
        if (postsCount === null)
            missing.push("posts");
        if (latestPostAt === null)
            missing.push("latest_post_at");
        return buildObservation({
            platform,
            handle: resolvedUsername,
            profileUrl: normalizedProfileUrl,
            followersCount,
            postsCount,
            latestPostAt,
            profileConfidence: profile.confidence,
            fetchSucceeded: true,
            notes: missing.length === 0
                ? "Presence metrics collected via Meta Graph API."
                : `Meta Graph API returned partial metrics; missing ${missing.join(", ")}.`,
            payload: {
                platform,
                handle: resolvedUsername,
                profileUrl: normalizedProfileUrl,
                source: "api",
                provider: "metaGraphApi",
                network: "instagram",
                businessAccountId,
                username,
                resolvedName,
                missing,
            },
        });
    }
    catch (error) {
        return buildObservation({
            platform,
            handle: normalizedHandle || null,
            profileUrl: normalizedProfileUrl,
            followersCount: null,
            postsCount: null,
            latestPostAt: null,
            profileConfidence: profile.confidence,
            fetchSucceeded: false,
            notes: "Meta Graph API capture failed before the HTML fallback.",
            payload: {
                platform,
                handle: normalizedHandle || null,
                profileUrl: normalizedProfileUrl,
                source: "api",
                provider: "metaGraphApi",
                apiError: error instanceof Error ? error.message : String(error),
            },
        });
    }
};
const mergeObservations = (primary, fallback) => {
    const followersCount = primary.followersCount ?? fallback.followersCount;
    const postsCount = primary.postsCount ?? fallback.postsCount;
    const latestPostAt = primary.latestPostAt ?? fallback.latestPostAt;
    const missing = [
        followersCount === null ? "followers" : null,
        postsCount === null ? "posts" : null,
        latestPostAt === null ? "latest_post_at" : null,
    ].filter((value) => value !== null);
    return buildObservation({
        platform: primary.platform,
        handle: primary.handle ?? fallback.handle,
        profileUrl: primary.profileUrl,
        followersCount,
        postsCount,
        latestPostAt,
        profileConfidence: Math.max(primary.confidence, fallback.confidence),
        fetchSucceeded: true,
        notes: missing.length === 0
            ? `${primary.notes} HTML fallback confirmed the missing fields.`
            : `${primary.notes} HTML fallback still missed ${missing.join(", ")}.`,
        payload: {
            ...primary.payload,
            source: primary.payload.source ?? "api",
            fallbackSource: fallback.payload.source ?? "html",
            fallbackPayload: fallback.payload,
            merged: true,
            missing,
        },
    });
};
const resolveProfileObservation = async (profile, fetchImpl, mode, captureBrowserHtml) => {
    const platform = normalizePlatform(profile.platform);
    if (mode === "browser") {
        const browserObservation = await collectBrowserObservation(profile, captureBrowserHtml);
        if (browserObservation.observationStatus !== "unavailable") {
            return browserObservation;
        }
        const htmlObservation = await collectHtmlObservation(profile, fetchImpl);
        if (htmlObservation.observationStatus !== "unavailable") {
            return {
                ...htmlObservation,
                notes: `${htmlObservation.notes} Browser capture was unavailable.`,
                payload: {
                    ...htmlObservation.payload,
                    primarySource: browserObservation.payload.source ?? "browser",
                    primaryPayload: browserObservation.payload,
                },
            };
        }
        return {
            ...browserObservation,
            notes: `${browserObservation.notes} HTML fallback was also unavailable.`,
            payload: {
                ...browserObservation.payload,
                fallbackSource: htmlObservation.payload.source ?? "html",
                fallbackPayload: htmlObservation.payload,
            },
        };
    }
    if (platform !== "youtube" && platform !== "facebook" && platform !== "instagram") {
        return collectHtmlObservation(profile, fetchImpl);
    }
    const apiObservation = platform === "youtube"
        ? await collectYoutubeApiObservation(profile, fetchImpl)
        : await collectMetaApiObservation(profile, fetchImpl);
    if (!apiObservation) {
        return collectHtmlObservation(profile, fetchImpl);
    }
    if (apiObservation.observationStatus === "captured") {
        return apiObservation;
    }
    const htmlObservation = await collectHtmlObservation(profile, fetchImpl);
    if (apiObservation.observationStatus === "partial" && htmlObservation.observationStatus !== "unavailable") {
        return mergeObservations(apiObservation, htmlObservation);
    }
    if (htmlObservation.observationStatus !== "unavailable") {
        return {
            ...htmlObservation,
            notes: `${htmlObservation.notes} Primary API attempt was unavailable.`,
            payload: {
                ...htmlObservation.payload,
                primarySource: apiObservation.payload.source ?? "api",
                primaryPayload: apiObservation.payload,
            },
        };
    }
    return {
        ...apiObservation,
        notes: `${apiObservation.notes} HTML fallback was also unavailable.`,
        payload: {
            ...apiObservation.payload,
            fallbackSource: htmlObservation.payload.source ?? "html",
            fallbackPayload: htmlObservation.payload,
        },
    };
};
const dedupeProfiles = (profiles) => {
    const seen = new Set();
    const unique = [];
    for (const profile of profiles) {
        const platform = normalizePlatform(profile.platform);
        const handle = normalizeHandle(profile.handle);
        const profileUrl = normalizeProfileUrl(profile.profile_url);
        const key = [platform, handle, profileUrl].join(":");
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        unique.push({
            ...profile,
            platform,
            handle,
            profile_url: profileUrl,
        });
    }
    return unique;
};
export const collectSocialPresenceObservations = async (input) => {
    const fetchImpl = input.fetchImpl ?? fetch;
    const mode = input.mode ?? "default";
    const captureBrowserHtml = input.captureBrowserHtml ?? fetchProfileHtmlWithBrowser;
    const uniqueProfiles = dedupeProfiles(input.profiles);
    const observations = await Promise.all(uniqueProfiles.map((profile) => resolveProfileObservation(profile, fetchImpl, mode, captureBrowserHtml)));
    return observations.sort((a, b) => {
        const platformCompare = a.platform.localeCompare(b.platform);
        if (platformCompare !== 0)
            return platformCompare;
        return (a.handle ?? "").localeCompare(b.handle ?? "");
    });
};
