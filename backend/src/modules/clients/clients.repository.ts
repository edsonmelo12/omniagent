import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";

export type ClientRow = {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  website_url: string | null;
  segment: string | null;
  status: string;
  notes: string | null;
  parent_client_id: string | null;
  parent_client_name: string | null;
  created_at: string;
  updated_at: string;
};

const TABLE_NAME = "clients";
const PARENT_BRAND_REGEX = /(?:parent brand|marca[- ]?m[aã]e|marca principal)\s*:\s*([^\n\r;.]+)/i;

let ensureSchemaPromise: Promise<void> | null = null;

const extractParentBrandName = (notes: string | null) => {
  if (!notes) return null;
  const match = notes.match(PARENT_BRAND_REGEX);
  return match?.[1]?.trim() ?? null;
};

const ensureClientsSchema = async () => {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!ensureSchemaPromise) {
    ensureSchemaPromise = (async () => {
      await query(`alter table ${TABLE_NAME} add column if not exists parent_client_id uuid`);
      await query(
        `do $$
         begin
           if not exists (
             select 1
             from pg_constraint
             where conname = '${TABLE_NAME}_parent_client_id_fkey'
           ) then
             alter table ${TABLE_NAME}
             add constraint ${TABLE_NAME}_parent_client_id_fkey
             foreign key (parent_client_id) references ${TABLE_NAME}(id) on delete set null;
           end if;
         end $$;`,
      ).catch(() => undefined);
      await query(`create index if not exists ${TABLE_NAME}_parent_client_id_idx on ${TABLE_NAME} (parent_client_id)`);
      await backfillParentClientLinks();
    })().catch((error) => {
      ensureSchemaPromise = null;
      throw error;
    });
  }

  return ensureSchemaPromise;
};

const selectClientRow = async (db: any, agencyId: string, clientId: string) => {
  const result = (await db.query(
    `select
       c.id,
       c.agency_id,
       c.name,
       c.slug,
       c.website_url,
       c.segment,
       c.status,
       c.notes,
       c.parent_client_id,
       parent.name as parent_client_name,
       c.created_at,
       c.updated_at
     from ${TABLE_NAME} c
     left join ${TABLE_NAME} parent on parent.id = c.parent_client_id
     where c.agency_id = $1 and c.id = $2`,
    [agencyId, clientId],
  )) as { rows: ClientRow[] };

  return result.rows[0] ?? null;
};

const resolveParentClientId = async (
  db: any,
  agencyId: string,
  currentClientId: string | null,
  explicitParentClientId: string | null | undefined,
  notes: string | null | undefined,
) => {
  if (explicitParentClientId !== undefined) {
    if (explicitParentClientId === null) {
      return null;
    }

    const normalized = explicitParentClientId.trim();
    return normalized.length > 0 ? normalized : null;
  }

  const parentBrandName = extractParentBrandName(notes ?? null);
  if (!parentBrandName) {
    return null;
  }

  const result = (await db.query(
    `select id
     from ${TABLE_NAME}
     where agency_id = $1
       and ($2::text is null or id <> $2)
       and (lower(name) = lower($3) or lower(slug) = lower($3))
     order by case when lower(name) = lower($3) then 0 else 1 end, created_at asc
     limit 1`,
    [agencyId, currentClientId, parentBrandName],
  )) as { rows: Array<{ id: string }> };

  return result.rows[0]?.id ?? null;
};

const backfillParentClientLinks = async () => {
  const rows = await query<{ id: string; agency_id: string; notes: string | null; parent_client_id: string | null }>(
    `select id, agency_id, notes, parent_client_id
     from ${TABLE_NAME}
     where parent_client_id is null
       and notes is not null
       and notes ~* '(parent brand|marca[- ]?m[aã]e|marca principal)\\s*:'`,
  );

  for (const row of rows) {
    const parentBrandName = extractParentBrandName(row.notes);
    if (!parentBrandName) continue;

    const parentClient = await queryOne<{ id: string }>(
      `select id
       from ${TABLE_NAME}
       where agency_id = $1
         and id <> $2
         and (lower(name) = lower($3) or lower(slug) = lower($3))
       order by case when lower(name) = lower($3) then 0 else 1 end, created_at asc
       limit 1`,
      [row.agency_id, row.id, parentBrandName],
    );

    if (!parentClient || parentClient.id === row.id) {
      continue;
    }

    await query(
      `update ${TABLE_NAME}
       set parent_client_id = $2,
           updated_at = now()
       where id = $1
         and parent_client_id is null`,
      [row.id, parentClient.id],
    );
  }
};

export const listClientsByAgencyId = async (agencyId: string, options: { search?: string; limit: number }) => {
  await ensureClientsSchema();
  const search = options.search?.trim() ?? "";
  const hasSearch = search.length > 0;

  return query<ClientRow>(
    `select
       c.id,
       c.agency_id,
       c.name,
       c.slug,
       c.website_url,
       c.segment,
       c.status,
       c.notes,
       c.parent_client_id,
       parent.name as parent_client_name,
       c.created_at,
       c.updated_at
     from ${TABLE_NAME} c
     left join ${TABLE_NAME} parent on parent.id = c.parent_client_id
     where c.agency_id = $1
       and ($2::boolean = false or c.name ilike $3 or c.slug ilike $3 or c.segment ilike $3 or parent.name ilike $3)
     order by c.created_at desc, c.id desc
     limit $4`,
    [agencyId, hasSearch, `%${search}%`, options.limit],
  );
};

export const findClientById = async (agencyId: string, clientId: string) => {
  await ensureClientsSchema();
  return queryOne<ClientRow>(
    `select
       c.id,
       c.agency_id,
       c.name,
       c.slug,
       c.website_url,
       c.segment,
       c.status,
       c.notes,
       c.parent_client_id,
       parent.name as parent_client_name,
       c.created_at,
       c.updated_at
     from ${TABLE_NAME} c
     left join ${TABLE_NAME} parent on parent.id = c.parent_client_id
     where c.agency_id = $1 and c.id = $2`,
    [agencyId, clientId],
  );
};

export const findClientBySlug = async (agencyId: string, slug: string) => {
  await ensureClientsSchema();
  return queryOne<ClientRow>(
    `select
       c.id,
       c.agency_id,
       c.name,
       c.slug,
       c.website_url,
       c.segment,
       c.status,
       c.notes,
       c.parent_client_id,
       parent.name as parent_client_name,
       c.created_at,
       c.updated_at
     from ${TABLE_NAME} c
     left join ${TABLE_NAME} parent on parent.id = c.parent_client_id
     where c.agency_id = $1 and c.slug = $2`,
    [agencyId, slug],
  );
};

export const createClient = async (
  input: { agencyId: string; name: string; slug: string; segment?: string; websiteUrl?: string; notes?: string; parentClientId?: string | null },
) =>
  withTransaction(async (client) => {
    await ensureClientsSchema();
    const parentClientId = await resolveParentClientId(client, input.agencyId, null, input.parentClientId, input.notes ?? null);
    const result = await client.query<{ id: string }>(
      `insert into ${TABLE_NAME} (agency_id, name, slug, website_url, segment, notes, parent_client_id)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [input.agencyId, input.name, input.slug, input.websiteUrl ?? null, input.segment ?? null, input.notes ?? null, parentClientId],
    );

    const createdClient = result.rows[0];

    if (!createdClient) {
      return null;
    }

    if (input.websiteUrl) {
      await client.query(
        `insert into client_sites (client_id, url, label, source_type, confidence)
         values ($1, $2, $3, $4, $5)`,
        [createdClient.id, input.websiteUrl, "Primary site", "website", 100],
      );
    }

    return selectClientRow(client, input.agencyId, createdClient.id);
  });

export const updateClient = async (
  clientId: string,
  input: { name?: string; slug?: string; segment?: string; websiteUrl?: string; notes?: string; parentClientId?: string | null },
) =>
  withTransaction(async (client) => {
    await ensureClientsSchema();
    const agencyResult = await client.query<{ agency_id: string }>(`select agency_id from ${TABLE_NAME} where id = $1`, [clientId]);
    const agencyId = agencyResult.rows[0]?.agency_id ?? null;
    const resolvedParentClientId =
      agencyId && input.parentClientId !== undefined
        ? await resolveParentClientId(client, agencyId, clientId, input.parentClientId, input.notes ?? null)
        : null;
    const result = await client.query<{ id: string }>(
      `update ${TABLE_NAME}
       set name = coalesce($2, name),
           slug = coalesce($3, slug),
           website_url = case when $4::text is null then website_url else $4 end,
           segment = case when $5::text is null then segment else $5 end,
           notes = case when $6::text is null then notes else $6 end,
           parent_client_id = case when $7::boolean = false then parent_client_id else $8 end,
           updated_at = now()
       where id = $1
       returning id`,
      [clientId, input.name ?? null, input.slug ?? null, input.websiteUrl ?? null, input.segment ?? null, input.notes ?? null, input.parentClientId !== undefined, resolvedParentClientId],
    );

    const updatedClient = result.rows[0];

    if (updatedClient && input.websiteUrl !== undefined) {
      await client.query("delete from client_sites where client_id = $1 and source_type = 'website'", [clientId]);

      if (input.websiteUrl) {
        await client.query(
          `insert into client_sites (client_id, url, label, source_type, confidence)
           values ($1, $2, $3, $4, $5)`,
          [clientId, input.websiteUrl, "Primary site", "website", 100],
        );
      }
    }

    if (!updatedClient || !agencyId) {
      return null;
    }

    return selectClientRow(client, agencyId, updatedClient.id);
  });

const tableExists = async (client: any, tableName: string) => {
  const result = await client.query("select to_regclass($1) is not null as exists", [tableName]);
  return Boolean(result.rows[0]?.exists);
};

export const deleteClient = async (clientId: string) =>
  withTransaction(async (client) => {
    await ensureClientsSchema();
    if (await tableExists(client, "client_products")) {
      await client.query("delete from client_products where client_id = $1", [clientId]);
    }

    if (await tableExists(client, "product_events")) {
      await client.query("delete from product_events where client_id = $1", [clientId]);
    }

    if (await tableExists(client, "product_event_executive_snapshots")) {
      await client.query("delete from product_event_executive_snapshots where client_id = $1", [clientId]);
    }

    const result = await client.query<ClientRow>(
      `with deleted as (
         delete from ${TABLE_NAME}
         where id = $1
         returning *
       )
       select
         deleted.id,
         deleted.agency_id,
         deleted.name,
         deleted.slug,
         deleted.website_url,
         deleted.segment,
         deleted.status,
         deleted.notes,
         deleted.parent_client_id,
         parent.name as parent_client_name,
         deleted.created_at,
         deleted.updated_at
       from deleted
       left join ${TABLE_NAME} parent on parent.id = deleted.parent_client_id`,
      [clientId],
    );

    return result.rows[0] ?? null;
  });
