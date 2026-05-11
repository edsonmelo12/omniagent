import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgres://localhost:5432/omniagent";

const { collectSocialPresenceObservations } = await import(
  "../src/modules/social-presence/social-presence.search.js"
);
const { buildSocialPresenceSummary } = await import("../src/modules/social-presence/social-presence.service.js");

const withEnv = async <T>(key: string, value: string | undefined, fn: () => Promise<T>) => {
  const previous = process.env[key];

  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }

  try {
    return await fn();
  } finally {
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  }
};

const jsonResponse = (body: unknown) =>
  ({
    ok: true,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as typeof fetch;

test("extrai seguidores, postagens e ultima postagem de um perfil publico", async () => {
  const observations = await collectSocialPresenceObservations({
    profiles: [
      {
        platform: "instagram",
        handle: "@omniagent",
        profile_url: "https://instagram.com/omniagent/",
        confidence: 80,
      },
    ],
    fetchImpl: (async () =>
      ({
        ok: true,
        text: async () => `
          <html>
            <head>
              <title>Omni Agent</title>
            </head>
            <body>
              <div>1.2k followers</div>
              <div>38 posts</div>
              <time datetime="2026-04-01T10:00:00.000Z">Apr 1</time>
            </body>
          </html>
        `,
      })) as typeof fetch,
  });

  assert.equal(observations.length, 1);
  assert.deepEqual(observations[0], {
    platform: "instagram",
    handle: "omniagent",
    profileUrl: "https://instagram.com/omniagent",
    followersCount: 1200,
    postsCount: 38,
    latestPostAt: "2026-04-01T10:00:00.000Z",
    observationStatus: "captured",
    confidence: observations[0].confidence,
    notes: observations[0].notes,
    payload: observations[0].payload,
  });
  assert(observations[0].confidence >= 80);
});

test("prioriza a API do YouTube quando a chave esta disponivel", async () => {
  await withEnv("SOCIAL_PRESENCE_YOUTUBE_API_KEY", "test-key", async () => {
    const observations = await collectSocialPresenceObservations({
      profiles: [
        {
          platform: "youtube",
          handle: "@omniagent",
          profile_url: "https://youtube.com/@omniagent",
          confidence: 82,
        },
      ],
      fetchImpl: (async (url: string) => {
        const requestUrl = new URL(url);

        if (requestUrl.hostname === "www.googleapis.com" && requestUrl.pathname.includes("/search")) {
          if (requestUrl.searchParams.get("type") === "channel") {
            return jsonResponse({
              items: [
                {
                  id: { channelId: "channel-123" },
                  snippet: { title: "Omni Agent" },
                },
              ],
            });
          }

          if (requestUrl.searchParams.get("type") === "video") {
            return jsonResponse({
              items: [
                {
                  id: { videoId: "video-999" },
                  snippet: { publishedAt: "2026-04-03T10:00:00.000Z" },
                },
              ],
            });
          }
        }

        if (requestUrl.hostname === "www.googleapis.com" && requestUrl.pathname.includes("/channels")) {
          return jsonResponse({
            items: [
              {
                snippet: { title: "Omni Agent", publishedAt: "2025-01-01T00:00:00.000Z" },
                statistics: {
                  subscriberCount: 12345,
                  videoCount: 321,
                  hiddenSubscriberCount: false,
                },
              },
            ],
          });
        }

        throw new Error(`unexpected fetch: ${url}`);
      }) as typeof fetch,
    });

    assert.equal(observations.length, 1);
    assert.equal(observations[0].platform, "youtube");
    assert.equal(observations[0].followersCount, 12345);
    assert.equal(observations[0].postsCount, 321);
    assert.equal(observations[0].latestPostAt, "2026-04-03T10:00:00.000Z");
    assert.equal(observations[0].payload.source, "api");
    assert.match(observations[0].notes, /YouTube Data API/);
  });
});

test("prioriza a API oficial do Meta para Facebook quando a chave esta disponivel", async () => {
  await withEnv("META_GRAPH_ACCESS_TOKEN", "meta-token", async () => {
    const observations = await collectSocialPresenceObservations({
      profiles: [
        {
          platform: "facebook",
          handle: "omniagent",
          profile_url: "https://facebook.com/omniagent",
          confidence: 78,
        },
      ],
      fetchImpl: (async (url: string) => {
        const requestUrl = new URL(url);

        if (requestUrl.hostname === "graph.facebook.com" && requestUrl.pathname.includes("/search")) {
          return jsonResponse({
            data: [
              {
                id: "page-123",
                name: "Omni Agent",
                username: "omniagent",
                link: "https://facebook.com/omniagent",
                fan_count: 4567,
                followers_count: 4567,
                posts: {
                  summary: { total_count: 89 },
                  data: [{ created_time: "2026-04-04T10:00:00.000Z" }],
                },
              },
            ],
          });
        }

        throw new Error(`unexpected fetch: ${url}`);
      }) as typeof fetch,
    });

    assert.equal(observations.length, 1);
    assert.equal(observations[0].platform, "facebook");
    assert.equal(observations[0].followersCount, 4567);
    assert.equal(observations[0].postsCount, 89);
    assert.equal(observations[0].latestPostAt, "2026-04-04T10:00:00.000Z");
    assert.equal(observations[0].payload.source, "api");
    assert.equal(observations[0].payload.provider, "metaGraphApi");
    assert.match(observations[0].notes, /Meta Graph API/);
  });
});

test("prioriza a API oficial do Meta para Instagram quando a chave esta disponivel", async () => {
  await withEnv("META_GRAPH_ACCESS_TOKEN", "meta-token", async () => {
    await withEnv("META_INSTAGRAM_BUSINESS_ACCOUNT_ID", "ig-business-123", async () => {
      const observations = await collectSocialPresenceObservations({
        profiles: [
          {
            platform: "instagram",
            handle: "@omniagent",
            profile_url: "https://instagram.com/omniagent/",
            confidence: 81,
          },
        ],
        fetchImpl: (async (url: string) => {
          const requestUrl = new URL(url);

          if (
            requestUrl.hostname === "graph.facebook.com" &&
            requestUrl.pathname === "/v20.0/ig-business-123"
          ) {
            return jsonResponse({
              business_discovery: {
                username: "omniagent",
                name: "Omni Agent",
                followers_count: 2345,
                media_count: 67,
                media: {
                  data: [{ timestamp: "2026-04-03T12:30:00.000Z" }],
                },
              },
            });
          }

          throw new Error(`unexpected fetch: ${url}`);
        }) as typeof fetch,
      });

      assert.equal(observations.length, 1);
      assert.equal(observations[0].platform, "instagram");
      assert.equal(observations[0].followersCount, 2345);
      assert.equal(observations[0].postsCount, 67);
      assert.equal(observations[0].latestPostAt, "2026-04-03T12:30:00.000Z");
      assert.equal(observations[0].payload.source, "api");
      assert.equal(observations[0].payload.provider, "metaGraphApi");
      assert.match(observations[0].notes, /Meta Graph API/);
    });
  });
});

test("usa o modo browser para capturar perfil autenticado", async () => {
  const observations = await collectSocialPresenceObservations({
    mode: "browser",
    profiles: [
      {
        platform: "instagram",
        handle: "@omniagent",
        profile_url: "https://instagram.com/omniagent/",
        confidence: 84,
      },
    ],
    captureBrowserHtml: async () => ({
      html: `
        <html>
          <body>
            <div>3.4k followers</div>
            <div>52 posts</div>
            <time datetime="2026-04-07T09:15:00.000Z">Apr 7</time>
          </body>
        </html>
      `,
      finalUrl: "https://www.instagram.com/omniagent/",
      title: "Omni Agent",
    }),
    fetchImpl: (async () => {
      throw new Error("fetch should not be used in browser mode when capture succeeds");
    }) as typeof fetch,
  });

  assert.equal(observations.length, 1);
  assert.equal(observations[0].platform, "instagram");
  assert.equal(observations[0].followersCount, 3400);
  assert.equal(observations[0].postsCount, 52);
  assert.equal(observations[0].latestPostAt, "2026-04-07T09:15:00.000Z");
  assert.equal(observations[0].payload.source, "browser");
  assert.equal(observations[0].payload.finalUrl, "https://www.instagram.com/omniagent/");
  assert.match(observations[0].notes, /browser/i);
});

test("cai para HTML quando a API do YouTube falha", async () => {
  await withEnv("SOCIAL_PRESENCE_YOUTUBE_API_KEY", "test-key", async () => {
    const observations = await collectSocialPresenceObservations({
      profiles: [
        {
          platform: "youtube",
          handle: "@omniagent",
          profile_url: "https://youtube.com/@omniagent",
          confidence: 82,
        },
      ],
      fetchImpl: (async (url: string) => {
        if (url.startsWith("https://www.googleapis.com/youtube/v3/")) {
          throw new Error("api unavailable");
        }

        return {
          ok: true,
          text: async () => `
            <html>
              <body>
                <div>2.4k subscribers</div>
                <div>88 videos</div>
                <time datetime="2026-04-02T08:00:00.000Z">Apr 2</time>
              </body>
            </html>
          `,
        };
      }) as typeof fetch,
    });

    assert.equal(observations.length, 1);
    assert.equal(observations[0].platform, "youtube");
    assert.equal(observations[0].followersCount, 2400);
    assert.equal(observations[0].postsCount, 88);
    assert.equal(observations[0].latestPostAt, "2026-04-02T08:00:00.000Z");
    assert.equal(observations[0].payload.primarySource, "api");
    assert.match(observations[0].notes, /Primary API attempt was unavailable/);
  });
});

test("consolida a leitura mais recente por rede e calcula delta", () => {
  const summary = buildSocialPresenceSummary([
    {
      id: "1",
      agency_id: "agency-1",
      client_id: "client-1",
      platform: "instagram",
      handle: "omniagent",
      profile_url: "https://instagram.com/omniagent",
      source_snapshot_id: null,
      collected_at: "2026-04-01T10:00:00.000Z",
      followers_count: 1200,
      posts_count: 38,
      latest_post_at: "2026-04-01T10:00:00.000Z",
      observation_status: "captured",
      confidence: 90,
      notes: null,
      payload_json: {},
      created_at: "2026-04-01T10:00:00.000Z",
      updated_at: "2026-04-01T10:00:00.000Z",
    },
    {
      id: "2",
      agency_id: "agency-1",
      client_id: "client-1",
      platform: "instagram",
      handle: "omniagent",
      profile_url: "https://instagram.com/omniagent",
      source_snapshot_id: null,
      collected_at: "2026-03-01T10:00:00.000Z",
      followers_count: 1000,
      posts_count: 30,
      latest_post_at: "2026-03-01T10:00:00.000Z",
      observation_status: "captured",
      confidence: 80,
      notes: null,
      payload_json: {},
      created_at: "2026-03-01T10:00:00.000Z",
      updated_at: "2026-03-01T10:00:00.000Z",
    },
  ]);

  assert.equal(summary.networks.length, 1);
  assert.equal(summary.networks[0].followersCount, 1200);
  assert.equal(summary.networks[0].followersDelta, 200);
  assert.equal(summary.networks[0].postsDelta, 8);
  assert.match(summary.summary, /Presenca social registrada/);
});
