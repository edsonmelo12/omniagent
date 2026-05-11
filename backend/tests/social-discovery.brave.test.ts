import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgres://localhost:5432/omniagent";

const { discoverSocialProfilesFromBrave } = await import(
  "../src/modules/social-discovery/social-discovery.brave.js"
);

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

test("retorna perfis sociais descobertos via Brave quando a chave existe", async () => {
  await withEnv("BRAVE_SEARCH_API_KEY", "test-token", async () => {
    const profiles = await discoverSocialProfilesFromBrave({
      client: {
        name: "Omni Agent",
        website_url: "https://www.omniagent.com.br",
        segment: "Agentes de IA",
      },
      profiles: [],
      braveSearchApiKey: "test-token",
      fetchImpl: (async (url: URL) => {
        const requestUrl = new URL(url);

        if (requestUrl.hostname === "api.search.brave.com") {
          return {
            ok: true,
            json: async () => ({
              web: {
                results: [
                  {
                    title: "Omni Agent no Instagram",
                    url: "https://instagram.com/omniagent/",
                    description: "Perfil oficial",
                  },
                  {
                    title: "Omni Agent no YouTube",
                    url: "https://youtube.com/@omniagent",
                    description: "Canal oficial",
                  },
                  {
                    title: "Site institucional",
                    url: "https://www.omniagent.com.br",
                    description: "Website",
                  },
                ],
              },
            }),
          } as typeof fetch;
        }

        throw new Error(`unexpected fetch: ${url}`);
      }) as typeof fetch,
    });

    assert.deepEqual(
      profiles.map((profile) => ({ platform: profile.platform, handle: profile.handle, profileUrl: profile.profileUrl })),
      [
        { platform: "instagram", handle: "omniagent", profileUrl: "https://instagram.com/omniagent" },
        { platform: "youtube", handle: "omniagent", profileUrl: "https://youtube.com/@omniagent" },
      ],
    );
    assert(profiles.every((profile) => profile.confidence >= 75));
  });
});

test("retorna vazio quando a chave do Brave nao existe", async () => {
  const profiles = await discoverSocialProfilesFromBrave({
    client: {
      name: "Omni Agent",
      website_url: null,
      segment: null,
    },
    profiles: [],
  });

  assert.deepEqual(profiles, []);
});
