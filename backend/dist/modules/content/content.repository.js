import { query, queryOne, withTransaction } from "../../shared/db/database.js";
const getNextVersion = async (clientId, tableName) => {
    const row = await queryOne(`select coalesce(max(version), 0) + 1 as version
     from ${tableName}
     where client_id = $1`, [clientId]);
    return Number(row?.version ?? 1);
};
export const findLatestContentPlanByClientId = async (clientId) => queryOne(`select id, client_id, version, status, payload_json, created_at, updated_at
     from content_plans
     where client_id = $1
     order by version desc
     limit 1`, [clientId]);
export const listContentPlansByClientId = async (clientId) => query(`select id, client_id, version, status, payload_json, created_at, updated_at
     from content_plans
     where client_id = $1
     order by version desc`, [clientId]);
export const createContentPlanVersion = async (input) => withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "content_plans");
    const result = await client.query(`insert into content_plans (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`, [input.clientId, version, input.status, JSON.stringify(input.payload)]);
    return result.rows[0];
});
export const createContentPackageVersion = async (input) => withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "content_production_packages");
    const result = await client.query(`insert into content_production_packages (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`, [input.clientId, version, input.status, JSON.stringify(input.payload)]);
    return result.rows[0];
});
export const findLatestContentPackageByClientId = async (clientId) => queryOne(`select id, client_id, version, status, payload_json, created_at, updated_at
     from content_production_packages
     where client_id = $1
     order by version desc
     limit 1`, [clientId]);
export const listContentPackagesByClientId = async (clientId) => query(`select id, client_id, version, status, payload_json, created_at, updated_at
     from content_production_packages
     where client_id = $1
     order by version desc`, [clientId]);
export const createScheduleVersion = async (input) => withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "schedules");
    const result = await client.query(`insert into schedules (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`, [input.clientId, version, input.status, JSON.stringify(input.payload)]);
    return result.rows[0];
});
export const listSchedulesByClientId = async (clientId) => query(`select id, client_id, version, status, payload_json, created_at, updated_at
     from schedules
     where client_id = $1
     order by version desc`, [clientId]);
export const findLatestScheduleByClientId = async (clientId) => queryOne(`select id, client_id, version, status, payload_json, created_at, updated_at
     from schedules
     where client_id = $1
     order by version desc
     limit 1`, [clientId]);
