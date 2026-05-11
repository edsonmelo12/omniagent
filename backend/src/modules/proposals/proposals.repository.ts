import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type ProposalRow = {
  id: string;
  client_id: string;
  version: number;
  archetype: string;
  thesis: string;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

const getNextVersion = async (clientId: string) => {
  const row = await queryOne<{ version: number }>(
    `select coalesce(max(version), 0) + 1 as version
     from proposals
     where client_id = $1`,
    [clientId],
  );

  return Number(row?.version ?? 1);
};

export const listProposalsByClientId = async (clientId: string) =>
  query<ProposalRow>(
    `select id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at
     from proposals
     where client_id = $1
     order by version desc`,
    [clientId],
  );

export const findLatestProposalByClientId = async (clientId: string) =>
  queryOne<ProposalRow>(
    `select id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at
     from proposals
     where client_id = $1
     order by version desc
     limit 1`,
    [clientId],
  );

export const createProposalVersion = async (input: {
  clientId: string;
  archetype: string;
  thesis: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId);
    const result = await client.query<ProposalRow>(
      `insert into proposals (client_id, version, archetype, thesis, status, payload_json)
       values ($1, $2, $3, $4, $5, $6::jsonb)
       returning id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.archetype, input.thesis, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });

export const updateProposalVersion = async (input: {
  clientId: string;
  archetype: string;
  thesis: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId);
    const result = await client.query<ProposalRow>(
      `insert into proposals (client_id, version, archetype, thesis, status, payload_json)
       values ($1, $2, $3, $4, $5, $6::jsonb)
       returning id, client_id, version, archetype, thesis, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.archetype, input.thesis, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });
