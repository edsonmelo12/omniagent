import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type PublishingExecutionRow = {
  id: string;
  client_id: string;
  schedule_id: string | null;
  publishing_profile_id: string | null;
  mode: string;
  status: string;
  platforms: unknown;
  payload_json: unknown;
  validation_json: unknown;
  result_json: unknown;
  requested_by: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const findLatestPublishingExecutionByClientId = async (clientId: string) =>
  queryOne<PublishingExecutionRow>(
    `select id, client_id, schedule_id, publishing_profile_id, mode, status, platforms, payload_json, validation_json, result_json, requested_by, confirmed_by, confirmed_at, created_at, updated_at
     from publishing_executions
     where client_id = $1
     order by created_at desc
     limit 1`,
    [clientId],
  );

export const listPublishingExecutionsByClientId = async (clientId: string) =>
  query<PublishingExecutionRow>(
    `select id, client_id, schedule_id, publishing_profile_id, mode, status, platforms, payload_json, validation_json, result_json, requested_by, confirmed_by, confirmed_at, created_at, updated_at
     from publishing_executions
     where client_id = $1
     order by created_at desc`,
    [clientId],
  );

export const createPublishingExecution = async (input: {
  clientId: string;
  scheduleId: string | null;
  publishingProfileId: string | null;
  mode: "dry_run" | "live";
  status: "draft" | "blocked" | "dry_run_passed" | "queued" | "published" | "failed";
  platforms: string[];
  payload: Record<string, unknown>;
  validation: Record<string, unknown>;
  result: Record<string, unknown>;
  requestedBy: string | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
}) =>
  withTransaction(async (client) => {
    const result = await client.query<PublishingExecutionRow>(
      `insert into publishing_executions (
         client_id,
         schedule_id,
         publishing_profile_id,
         mode,
         status,
         platforms,
         payload_json,
         validation_json,
         result_json,
         requested_by,
         confirmed_by,
         confirmed_at
       )
       values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, $12)
       returning id, client_id, schedule_id, publishing_profile_id, mode, status, platforms, payload_json, validation_json, result_json, requested_by, confirmed_by, confirmed_at, created_at, updated_at`,
      [
        input.clientId,
        input.scheduleId,
        input.publishingProfileId,
        input.mode,
        input.status,
        JSON.stringify(input.platforms),
        JSON.stringify(input.payload),
        JSON.stringify(input.validation),
        JSON.stringify(input.result),
        input.requestedBy,
        input.confirmedBy,
        input.confirmedAt,
      ],
    );

    return result.rows[0];
  });
