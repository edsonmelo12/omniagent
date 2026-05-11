import { query, queryOne, withTransaction } from "../../shared/db/database.js";
export const listApprovalsByClientId = async (clientId) => query(`select id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at
     from approvals
     where client_id = $1
     order by created_at desc`, [clientId]);
export const createApprovalRow = async (input) => withTransaction(async (client) => {
    const result = await client.query(`insert into approvals (client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at`, [
        input.clientId,
        input.artifactType,
        input.artifactId,
        input.status,
        input.approvedBy ?? null,
        input.approvedAt ?? null,
        input.notes ?? null,
    ]);
    return result.rows[0];
});
export const updateApprovalStatus = async (approvalId, status, notes, approvedBy) => withTransaction(async (client) => {
    const result = await client.query(`update approvals
       set status = $2,
           approved_at = case when $2 = 'approved' then now() else approved_at end,
           approved_by = case when $2 = 'approved' then coalesce($4, approved_by) else approved_by end,
           notes = coalesce($3, notes)
       where id = $1
       returning id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at`, [approvalId, status, notes ?? null, approvedBy ?? null]);
    return result.rows[0] ?? null;
});
export const findApprovalById = async (approvalId) => queryOne(`select id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at
     from approvals
     where id = $1`, [approvalId]);
