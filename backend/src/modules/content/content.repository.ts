import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type ContentPlanRow = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ContentPackageRow = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ScheduleRow = {
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

export const findLatestContentPlanByClientId = async (clientId: string) =>
  queryOne<ContentPlanRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from content_plans
     where client_id = $1
     order by version desc
     limit 1`,
    [clientId],
  );

export const listContentPlansByClientId = async (clientId: string) =>
  query<ContentPlanRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from content_plans
     where client_id = $1
     order by version desc`,
    [clientId],
  );

export const createContentPlanVersion = async (input: {
  clientId: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "content_plans");
    const result = await client.query<ContentPlanRow>(
      `insert into content_plans (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });

export const createContentPackageVersion = async (input: {
  clientId: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "content_packages");
    const result = await client.query<ContentPackageRow>(
      `insert into content_packages (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });

export const findLatestContentPackageByClientId = async (clientId: string) =>
  queryOne<ContentPackageRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from content_packages
     where client_id = $1
     order by version desc
     limit 1`,
    [clientId],
  );

export const listContentPackagesByClientId = async (clientId: string) =>
  query<ContentPackageRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from content_packages
     where client_id = $1
     order by version desc`,
    [clientId],
  );

export const createScheduleVersion = async (input: {
  clientId: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const version = await getNextVersion(input.clientId, "schedules");
    const result = await client.query<ScheduleRow>(
      `insert into schedules (client_id, version, status, payload_json)
       values ($1, $2, $3, $4::jsonb)
       returning id, client_id, version, status, payload_json, created_at, updated_at`,
      [input.clientId, version, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });

export const listSchedulesByClientId = async (clientId: string) =>
  query<ScheduleRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from schedules
     where client_id = $1
     order by version desc`,
    [clientId],
  );

export const findLatestScheduleByClientId = async (clientId: string) =>
  queryOne<ScheduleRow>(
    `select id, client_id, version, status, payload_json, created_at, updated_at
     from schedules
     where client_id = $1
     order by version desc
     limit 1`,
    [clientId],
  );
