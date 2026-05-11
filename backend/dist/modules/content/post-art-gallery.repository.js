import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";
const TABLE_NAME = "post_art_galleries";
let schemaReady = null;
const ensureSchema = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!schemaReady) {
        schemaReady = (async () => {
            await query(`create table if not exists ${TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           version integer not null,
           mode text not null default 'feed_carousel',
           title text not null,
           summary text not null,
           overall_score integer not null default 0,
           payload_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now(),
           unique (client_id, version)
         )`);
            await query(`create index if not exists ${TABLE_NAME}_client_version_idx on ${TABLE_NAME} (client_id, version desc)`);
            await query(`create index if not exists ${TABLE_NAME}_client_mode_idx on ${TABLE_NAME} (client_id, mode, version desc)`);
        })().catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
};
export const listPostArtGalleryRowsByClientId = async (clientId) => {
    await ensureSchema();
    return query(`select id, client_id, version, mode, title, summary, overall_score, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc`, [clientId]);
};
export const findLatestPostArtGalleryRowByClientId = async (clientId) => {
    await ensureSchema();
    return queryOne(`select id, client_id, version, mode, title, summary, overall_score, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc
     limit 1`, [clientId]);
};
export const createPostArtGalleryRow = async (input) => {
    await ensureSchema();
    return withTransaction(async (client) => {
        await client.query("select pg_advisory_xact_lock(hashtext($1))", [input.clientId]);
        const versionRow = await client.query(`select coalesce(max(version), 0) + 1 as version
       from ${TABLE_NAME}
       where client_id = $1`, [input.clientId]);
        const version = Number(versionRow.rows[0]?.version ?? 1);
        const result = await client.query(`insert into ${TABLE_NAME} (client_id, version, mode, title, summary, overall_score, payload_json)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb)
       returning id, client_id, version, mode, title, summary, overall_score, payload_json, created_at, updated_at`, [input.clientId, version, input.mode, input.title, input.summary, input.overallScore, JSON.stringify(input.payload)]);
        return result.rows[0];
    });
};
