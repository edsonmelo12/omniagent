import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type ApprovalRow = {
  id: string;
  client_id: string;
  artifact_type: string;
  artifact_id: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const listApprovalsByClientId = async (clientId: string) =>
  query<ApprovalRow>(
    `select id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at
     from approvals
     where client_id = $1
     order by created_at desc`,
    [clientId],
  );

export const createApprovalRow = async (input: {
  clientId: string;
  artifactType: string;
  artifactId: string;
  status: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  notes?: string | null;
}) =>
  withTransaction(async (client) => {
    const result = await client.query<ApprovalRow>(
      `insert into approvals (client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at`,
      [
        input.clientId,
        input.artifactType,
        input.artifactId,
        input.status,
        input.approvedBy ?? null,
        input.approvedAt ?? null,
        input.notes ?? null,
      ],
    );

    return result.rows[0];
  });

export const updateApprovalStatus = async (approvalId: string, status: string, notes?: string | null, approvedBy?: string | null) =>
  withTransaction(async (client) => {
    const result = await client.query<ApprovalRow>(
      `update approvals
       set status = $2,
           approved_at = case when $2 = 'approved' then now() else approved_at end,
           approved_by = case when $2 = 'approved' then coalesce($4, approved_by) else approved_by end,
           notes = coalesce($3, notes)
       where id = $1
       returning id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at`,
      [approvalId, status, notes ?? null, approvedBy ?? null],
    );

    return result.rows[0] ?? null;
  });

export const findApprovalById = async (approvalId: string) =>
  queryOne<ApprovalRow>(
    `select id, client_id, artifact_type, artifact_id, status, approved_by, approved_at, notes, created_at, updated_at
     from approvals
     where id = $1`,
    [approvalId],
  );
