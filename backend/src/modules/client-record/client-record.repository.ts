import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type ClientRecordRow = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

const getNextVersion = async (clientId: string, tableName: string) => {
  const row = await queryOne<{ version: number }>(
    `select coalesce(max(version), 0) + 1 as version
     from ${tableName}
     where client_id = $1`,
    [clientId],
  );

  return Number(row?.version ?? 1);
};

export const listClientRecordsByClientId = async (clientId: string) =>
  query<ClientRecordRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from client_briefs
     where client_id = $1
     order by version desc`,
    [clientId],
  );

export const findLatestClientRecordByClientId = async (clientId: string) =>
  queryOne<ClientRecordRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from client_briefs
     where client_id = $1
     order by version desc
     limit 1`,
    [clientId],
  );

export const createClientRecordVersion = async (input: {
  clientId: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "client_briefs");
    const result = await client.query<ClientRecordRow>(
      `insert into client_briefs (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });

export const updateClientRecordVersion = async (input: {
  clientId: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "client_briefs");
    const result = await client.query<ClientRecordRow>(
      `insert into client_briefs (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });
