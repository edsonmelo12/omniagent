import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";
const TABLE = "social_presence_snapshots";
let ensureTablePromise = null;
const ensureVersionedTable = async () => {
    if (!isDatabaseConfigured())
        return;
    await query(`create table if not exists ${TABLE} (
       id uuid primary key default gen_random_uuid(),
       agency_id uuid not null references agencies(id) on delete cascade,
       client_id uuid not null references clients(id) on delete cascade,
       platform text not null,
       handle text null,
       profile_url text not null,
       source_snapshot_id uuid null references social_intelligence_snapshots(id) on delete set null,
       collected_at timestamptz not null default now(),
       followers_count integer null check (followers_count >= 0),
       posts_count integer null check (posts_count >= 0),
       latest_post_at timestamptz null,
       observation_status text not null default 'partial' check (observation_status in ('captured', 'partial', 'unavailable')),
       confidence integer not null default 50 check (confidence >= 0 and confidence <= 100),
       notes text null,
       payload_json jsonb not null default '{}'::jsonb,
       created_at timestamptz not null default now(),
       updated_at timestamptz not null default now()
     )`);
    await query(`create index if not exists ${TABLE}_client_platform_collected_idx
     on ${TABLE} (client_id, platform, collected_at desc, created_at desc)`);
    await query(`create index if not exists ${TABLE}_agency_collected_idx
     on ${TABLE} (agency_id, collected_at desc, created_at desc)`);
    await query(`create index if not exists ${TABLE}_platform_collected_idx
     on ${TABLE} (platform, collected_at desc, created_at desc)`);
    await query(`do $$
     begin
       if not exists (
         select 1
         from pg_trigger
         where tgname = '${TABLE}_set_updated_at'
       ) then
         create trigger ${TABLE}_set_updated_at
         before update on ${TABLE}
         for each row execute function set_updated_at();
       end if;
     end $$;`).catch(() => undefined);
};
export const ensureSocialPresenceTables = async () => {
    if (!ensureTablePromise) {
        ensureTablePromise = ensureVersionedTable().catch((error) => {
            ensureTablePromise = null;
            throw error;
        });
    }
    return ensureTablePromise;
};
export const listSocialPresenceSnapshotsByClientId = async (clientId, filters) => {
    await ensureSocialPresenceTables();
    const params = [clientId];
    const conditions = ["client_id = $1"];
    if (filters?.platform) {
        params.push(filters.platform);
        conditions.push(`platform = $${params.length}`);
    }
    if (filters?.status) {
        params.push(filters.status);
        conditions.push(`observation_status = $${params.length}`);
    }
    if (filters?.from) {
        params.push(filters.from);
        conditions.push(`collected_at >= $${params.length}`);
    }
    if (filters?.to) {
        params.push(filters.to);
        conditions.push(`collected_at <= $${params.length}`);
    }
    const limit = filters?.limit ?? 50;
    params.push(limit);
    return query(`select
       id,
       agency_id,
       client_id,
       platform,
       handle,
       profile_url,
       source_snapshot_id,
       collected_at,
       followers_count,
       posts_count,
       latest_post_at,
       observation_status,
       confidence,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${TABLE}
     where ${conditions.join(" and ")}
     order by collected_at desc, created_at desc
     limit $${params.length}`, params);
};
export const createSocialPresenceSnapshots = async (snapshots) => withTransaction(async (client) => {
    await ensureSocialPresenceTables();
    const inserted = [];
    for (const snapshot of snapshots) {
        const result = await client.query(`insert into ${TABLE} (
           agency_id,
           client_id,
           platform,
           handle,
           profile_url,
           source_snapshot_id,
           collected_at,
           followers_count,
           posts_count,
           latest_post_at,
           observation_status,
           confidence,
           notes,
           payload_json
         )
         values ($1, $2, $3, $4, $5, $6, coalesce($7, now()), $8, $9, $10, $11, $12, $13, $14::jsonb)
         returning
           id,
           agency_id,
           client_id,
           platform,
           handle,
           profile_url,
           source_snapshot_id,
           collected_at,
           followers_count,
           posts_count,
           latest_post_at,
           observation_status,
           confidence,
           notes,
           payload_json,
           created_at,
           updated_at`, [
            snapshot.agencyId,
            snapshot.clientId,
            snapshot.platform,
            snapshot.handle,
            snapshot.profileUrl,
            snapshot.sourceSnapshotId ?? null,
            snapshot.collectedAt ?? null,
            snapshot.followersCount,
            snapshot.postsCount,
            snapshot.latestPostAt,
            snapshot.observationStatus,
            snapshot.confidence,
            snapshot.notes,
            JSON.stringify(snapshot.payload),
        ]);
        inserted.push(result.rows[0]);
    }
    return inserted;
});
export const listLatestSocialPresenceSnapshotsByClientId = async (clientId) => {
    await ensureSocialPresenceTables();
    return query(`select distinct on (platform)
       id,
       agency_id,
       client_id,
       platform,
       handle,
       profile_url,
       source_snapshot_id,
       collected_at,
       followers_count,
       posts_count,
       latest_post_at,
       observation_status,
       confidence,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${TABLE}
     where client_id = $1
     order by platform asc, collected_at desc, created_at desc`, [clientId]);
};
export const findLatestSocialPresenceSnapshotByClientIdAndPlatform = async (clientId, platform) => {
    await ensureSocialPresenceTables();
    return queryOne(`select
       id,
       agency_id,
       client_id,
       platform,
       handle,
       profile_url,
       source_snapshot_id,
       collected_at,
       followers_count,
       posts_count,
       latest_post_at,
       observation_status,
       confidence,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${TABLE}
     where client_id = $1 and platform = $2
     order by collected_at desc, created_at desc
     limit 1`, [clientId, platform]);
};
