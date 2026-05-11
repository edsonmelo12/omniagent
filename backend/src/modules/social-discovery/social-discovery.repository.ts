import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type SocialProfileRow = {
  id: string;
  client_id: string;
  platform: string;
  handle: string;
  profile_url: string;
  discovery_source: string;
  status: string;
  confidence: number;
  created_at: string;
  updated_at: string;
};

export const listSocialProfilesByClientId = async (clientId: string) =>
  query<SocialProfileRow>(
    `select
       id,
       client_id,
       platform,
       handle,
       profile_url,
       discovery_source,
       status,
       confidence,
       created_at,
       updated_at
     from social_profiles
     where client_id = $1
     order by platform asc, created_at desc`,
    [clientId],
  );

export const findSocialProfileByPlatformAndHandle = async (clientId: string, platform: string, handle: string) =>
  queryOne<SocialProfileRow>(
    `select
       id,
       client_id,
       platform,
       handle,
       profile_url,
       discovery_source,
       status,
       confidence,
       created_at,
       updated_at
     from social_profiles
     where client_id = $1 and platform = $2 and handle = $3`,
    [clientId, platform, handle],
  );

export const upsertSocialProfile = async (
  client: import("pg").PoolClient,
  input: {
    clientId: string;
    platform: string;
    handle: string;
    profileUrl: string;
    discoverySource: string;
    confidence: number;
  },
) => {
  const result = await client.query<SocialProfileRow>(
    `insert into social_profiles (client_id, platform, handle, profile_url, discovery_source, confidence)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (client_id, platform, handle)
     do update set
       profile_url = excluded.profile_url,
       discovery_source = excluded.discovery_source,
       confidence = excluded.confidence,
       updated_at = now()
     returning id, client_id, platform, handle, profile_url, discovery_source, status, confidence, created_at, updated_at`,
    [input.clientId, input.platform, input.handle, input.profileUrl, input.discoverySource, input.confidence],
  );

  return result.rows[0];
};

export const saveSocialProfiles = async (
  profiles: Array<{
    clientId: string;
    platform: string;
    handle: string;
    profileUrl: string;
    discoverySource: string;
    confidence: number;
  }>,
) =>
  withTransaction(async (client) => {
    const uniqueProfiles = new Map<string, {
      clientId: string;
      platform: string;
      handle: string;
      profileUrl: string;
      discoverySource: string;
      confidence: number;
    }>();

    for (const profile of profiles) {
      const key = [profile.clientId, profile.platform.trim().toLowerCase(), profile.handle.trim().toLowerCase()].join(":");
      uniqueProfiles.set(key, {
        ...profile,
        platform: profile.platform.trim().toLowerCase(),
        handle: profile.handle.trim().toLowerCase(),
      });
    }

    const saved: SocialProfileRow[] = [];

    for (const profile of uniqueProfiles.values()) {
      const row = await upsertSocialProfile(client, profile);
      saved.push(row);
    }

    return saved;
  });
