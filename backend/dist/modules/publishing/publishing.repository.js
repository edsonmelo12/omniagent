import { query, queryOne, withTransaction } from "../../shared/db/database.js";
export const findLatestPublishingExecutionByClientId = async (clientId) => queryOne(`select id, client_id, schedule_id, mode, status, platforms, payload_json, validation_json, result_json, requested_by, confirmed_by, confirmed_at, created_at, updated_at
     from publishing_executions
     where client_id = $1
     order by created_at desc
     limit 1`, [clientId]);
export const listPublishingExecutionsByClientId = async (clientId) => query(`select id, client_id, schedule_id, mode, status, platforms, payload_json, validation_json, result_json, requested_by, confirmed_by, confirmed_at, created_at, updated_at
     from publishing_executions
     where client_id = $1
     order by created_at desc`, [clientId]);
export const createPublishingExecution = async (input) => withTransaction(async (client) => {
    const result = await client.query(`insert into publishing_executions (
         client_id,
         schedule_id,
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
       values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10, $11)
       returning id, client_id, schedule_id, mode, status, platforms, payload_json, validation_json, result_json, requested_by, confirmed_by, confirmed_at, created_at, updated_at`, [
        input.clientId,
        input.scheduleId,
        input.mode,
        input.status,
        JSON.stringify(input.platforms),
        JSON.stringify(input.payload),
        JSON.stringify(input.validation),
        JSON.stringify(input.result),
        input.requestedBy,
        input.confirmedBy,
        input.confirmedAt,
    ]);
    return result.rows[0];
});
