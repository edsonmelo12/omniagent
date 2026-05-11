import { query, queryOne, withTransaction } from "../../shared/db/database.js";
const getNextVersion = async (clientId) => {
    const row = await queryOne(`select coalesce(max(version), 0) + 1 as version
     from proposals
     where client_id = $1`, [clientId]);
    return Number(row?.version ?? 1);
};
export const listProposalsByClientId = async (clientId) => query(`select id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at
     from proposals
     where client_id = $1
     order by version desc`, [clientId]);
export const findLatestProposalByClientId = async (clientId) => queryOne(`select id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at
     from proposals
     where client_id = $1
     order by version desc
     limit 1`, [clientId]);
export const createProposalVersion = async (input) => withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId);
    const result = await client.query(`insert into proposals (client_id, version, archetype, thesis, status, payload_json)
       values ($1, $2, $3, $4, $5, $6::jsonb)
       returning id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at`, [input.clientId, version, input.archetype, input.thesis, input.status, JSON.stringify(input.payload)]);
    return result.rows[0];
});
export const updateProposalVersion = async (input) => withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId);
    const result = await client.query(`insert into proposals (client_id, version, archetype, thesis, status, payload_json)
       values ($1, $2, $3, $4, $5, $6::jsonb)
       returning id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at`, [input.clientId, version, input.archetype, input.thesis, input.status, JSON.stringify(input.payload)]);
    return result.rows[0];
});
