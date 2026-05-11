import { createHash } from "node:crypto";
import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";
const TABLE_NAME = "youtube_strategy_analyses";
const VIDEO_STATE_TABLE_NAME = "youtube_strategy_video_states";
let ensureTablePromise = null;
let ensureVideoStateTablePromise = null;
const ensureTable = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!ensureTablePromise) {
        ensureTablePromise = (async () => {
            await query(`create table if not exists ${TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           version integer not null,
           status text not null default 'draft',
           payload_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now(),
           unique (client_id, version)
         )`);
            await query(`create index if not exists ${TABLE_NAME}_client_version_idx
         on ${TABLE_NAME} (client_id, version desc)`);
            await query(`create index if not exists ${TABLE_NAME}_client_status_idx
         on ${TABLE_NAME} (client_id, status)`);
            await query(`do $$
         begin
           if not exists (
             select 1
             from pg_trigger
             where tgname = '${TABLE_NAME}_set_updated_at'
           ) then
             create trigger ${TABLE_NAME}_set_updated_at
             before update on ${TABLE_NAME}
             for each row execute function set_updated_at();
           end if;
         end $$;`).catch(() => undefined);
        })().catch((error) => {
            ensureTablePromise = null;
            throw error;
        });
    }
    return ensureTablePromise;
};
const compactText = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();
const buildTranscriptHash = (status, text) => {
    const normalizedStatus = (status ?? "missing").trim().toLowerCase();
    const normalizedText = text ? compactText(text) : "";
    if (normalizedStatus !== "available" || !normalizedText) {
        return `status:${normalizedStatus}`;
    }
    return createHash("sha256").update(normalizedText, "utf8").digest("hex");
};
const ensureVideoStateTable = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!ensureVideoStateTablePromise) {
        ensureVideoStateTablePromise = (async () => {
            await query(`create table if not exists ${VIDEO_STATE_TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           video_id text not null,
           canonical_url text not null,
           transcript_hash text not null,
           transcript_status text not null,
           transcript_character_count integer not null default 0,
           transcript_segment_count integer not null default 0,
           last_analysis_id uuid null references ${TABLE_NAME}(id) on delete set null,
           last_analysis_version integer null,
           last_processed_at timestamptz not null default now(),
           last_seen_at timestamptz not null default now(),
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now(),
           unique (client_id, video_id)
         )`);
            await query(`create index if not exists ${VIDEO_STATE_TABLE_NAME}_client_seen_idx
         on ${VIDEO_STATE_TABLE_NAME} (client_id, last_seen_at desc)`);
            await query(`create index if not exists ${VIDEO_STATE_TABLE_NAME}_client_version_idx
         on ${VIDEO_STATE_TABLE_NAME} (client_id, last_analysis_version desc)`);
            await query(`create index if not exists ${VIDEO_STATE_TABLE_NAME}_client_video_idx
         on ${VIDEO_STATE_TABLE_NAME} (client_id, video_id)`);
            await query(`do $$
         begin
           if not exists (
             select 1
             from pg_trigger
             where tgname = '${VIDEO_STATE_TABLE_NAME}_set_updated_at'
           ) then
             create trigger ${VIDEO_STATE_TABLE_NAME}_set_updated_at
             before update on ${VIDEO_STATE_TABLE_NAME}
             for each row execute function set_updated_at();
           end if;
         end $$;`).catch(() => undefined);
        })().catch((error) => {
            ensureVideoStateTablePromise = null;
            throw error;
        });
    }
    return ensureVideoStateTablePromise;
};
export const listYoutubeStrategyVideoStatesByClientId = async (clientId) => {
    await ensureVideoStateTable();
    return query(`select id, client_id, video_id, canonical_url, transcript_hash, transcript_status,
            transcript_character_count, transcript_segment_count, last_analysis_id,
            last_analysis_version, last_processed_at, last_seen_at, created_at, updated_at
     from ${VIDEO_STATE_TABLE_NAME}
     where client_id = $1
     order by last_seen_at desc, video_id asc`, [clientId]);
};
export const findYoutubeStrategyVideoStateByClientIdAndVideoId = async (clientId, videoId) => {
    await ensureVideoStateTable();
    return queryOne(`select id, client_id, video_id, canonical_url, transcript_hash, transcript_status,
            transcript_character_count, transcript_segment_count, last_analysis_id,
            last_analysis_version, last_processed_at, last_seen_at, created_at, updated_at
     from ${VIDEO_STATE_TABLE_NAME}
     where client_id = $1
       and video_id = $2
     limit 1`, [clientId, videoId]);
};
export const upsertYoutubeStrategyVideoState = async (input) => {
    await ensureVideoStateTable();
    return queryOne(`insert into ${VIDEO_STATE_TABLE_NAME} (
       client_id,
       video_id,
       canonical_url,
       transcript_hash,
       transcript_status,
       transcript_character_count,
       transcript_segment_count,
       last_analysis_id,
       last_analysis_version,
       last_processed_at,
       last_seen_at
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
     on conflict (client_id, video_id)
     do update set
       canonical_url = excluded.canonical_url,
       transcript_hash = excluded.transcript_hash,
       transcript_status = excluded.transcript_status,
       transcript_character_count = excluded.transcript_character_count,
       transcript_segment_count = excluded.transcript_segment_count,
       last_analysis_id = excluded.last_analysis_id,
       last_analysis_version = excluded.last_analysis_version,
       last_processed_at = excluded.last_processed_at,
       last_seen_at = excluded.last_seen_at
     returning id, client_id, video_id, canonical_url, transcript_hash, transcript_status,
               transcript_character_count, transcript_segment_count, last_analysis_id,
               last_analysis_version, last_processed_at, last_seen_at, created_at, updated_at`, [
        input.clientId,
        input.videoId,
        input.canonicalUrl,
        input.transcriptHash,
        input.transcriptStatus,
        input.transcriptCharacterCount,
        input.transcriptSegmentCount,
        input.lastAnalysisId,
        input.lastAnalysisVersion,
    ]);
};
const extractTranscriptHashFromPayload = (payload, videoId) => {
    const video = payload.videos?.find((item) => item.videoId === videoId);
    if (!video)
        return null;
    return buildTranscriptHash(video.transcript?.status ?? null, video.transcript?.text ?? null);
};
export const ensureYoutubeStrategyVideoStateBackfill = async (clientId) => {
    await ensureVideoStateTable();
    const existingCount = await queryOne(`select count(*)::text as count
     from ${VIDEO_STATE_TABLE_NAME}
     where client_id = $1`, [clientId]);
    if (Number(existingCount?.count ?? 0) > 0) {
        return listYoutubeStrategyVideoStatesByClientId(clientId);
    }
    const analyses = await query(`select id, version, payload_json
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc, created_at desc`, [clientId]);
    const seenVideos = new Set();
    await withTransaction(async (client) => {
        for (const analysis of analyses) {
            const payload = (analysis.payload_json ?? {});
            const videos = payload.videos ?? [];
            for (const video of videos) {
                const videoId = video.videoId?.trim();
                if (!videoId || seenVideos.has(videoId)) {
                    continue;
                }
                const transcriptHash = extractTranscriptHashFromPayload(payload, videoId);
                if (!transcriptHash) {
                    continue;
                }
                await client.query(`insert into ${VIDEO_STATE_TABLE_NAME} (
             client_id,
             video_id,
             canonical_url,
             transcript_hash,
             transcript_status,
             transcript_character_count,
             transcript_segment_count,
             last_analysis_id,
             last_analysis_version,
             last_processed_at,
             last_seen_at
           )
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
           on conflict (client_id, video_id) do nothing`, [
                    clientId,
                    videoId,
                    video.canonicalUrl ?? `https://www.youtube.com/watch?v=${videoId}`,
                    transcriptHash,
                    video.transcript?.status ?? "missing",
                    Number(video.transcript?.characterCount ?? 0),
                    Number(video.transcript?.segmentCount ?? 0),
                    analysis.id,
                    analysis.version,
                ]);
                seenVideos.add(videoId);
            }
        }
    });
    return listYoutubeStrategyVideoStatesByClientId(clientId);
};
export const listYoutubeStrategyAnalysesByClientId = async (clientId, limit = 5) => {
    await ensureTable();
    return query(`select id, client_id, version, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc, created_at desc
     limit $2`, [clientId, limit]);
};
export const findLatestYoutubeStrategyAnalysisByClientId = async (clientId) => {
    await ensureTable();
    return queryOne(`select id, client_id, version, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc, created_at desc
     limit 1`, [clientId]);
};
export const findYoutubeStrategyAnalysisById = async (analysisId) => {
    await ensureTable();
    return queryOne(`select id, client_id, version, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where id = $1
     limit 1`, [analysisId]);
};
export const updateYoutubeStrategyAnalysisPayload = async (analysisId, payload) => {
    await ensureTable();
    return queryOne(`update ${TABLE_NAME}
     set payload_json = $2::jsonb,
         updated_at = now()
     where id = $1
     returning id, client_id, version, status, payload_json, created_at, updated_at`, [analysisId, JSON.stringify(payload)]);
};
export const createYoutubeStrategyAnalysis = async (input) => {
    await ensureTable();
    return withTransaction(async (client) => {
        const versionRow = await client.query(`select coalesce(max(version), 0) + 1 as version
       from ${TABLE_NAME}
       where client_id = $1`, [input.clientId]);
        const version = Number(versionRow.rows[0]?.version ?? 1);
        const result = await client.query(`insert into ${TABLE_NAME} (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`, [input.clientId, version, input.status, JSON.stringify(input.payload)]);
        return result.rows[0] ?? null;
    });
};
