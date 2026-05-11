import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type PublishingProfileRow = {
  id: string;
  client_id: string;
  channel: string;
  provider: string;
  account_label: string;
  external_account_id: string | null;
  secret_ref: string;
  connection_status: string;
  approval_mode: string;
  publish_mode: string;
  capabilities_json: unknown;
  constraints_json: unknown;
  last_validated_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
};

const TABLE_NAME = "publishing_profiles";

let schemaReady: Promise<void> | null = null;

export const ensurePublishingProfilesSchema = async () => {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`
        create table if not exists ${TABLE_NAME} (
          id uuid primary key default gen_random_uuid(),
          client_id uuid not null references clients(id) on delete cascade,
          channel text not null,
          provider text not null,
          account_label text not null,
          external_account_id text null,
          secret_ref text not null,
          connection_status text not null default 'disconnected',
          approval_mode text not null default 'manual',
          publish_mode text not null default 'dry_run_only',
          capabilities_json jsonb not null default '{}'::jsonb,
          constraints_json jsonb not null default '{}'::jsonb,
          last_validated_at timestamptz null,
          last_error_code text null,
          last_error_message text null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          unique (client_id, channel, account_label)
        )
      `);

      await query(`create index if not exists ${TABLE_NAME}_client_channel_idx on ${TABLE_NAME} (client_id, channel, connection_status)`);
      await query(`create index if not exists ${TABLE_NAME}_secret_ref_idx on ${TABLE_NAME} (secret_ref)`);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
};

export const listPublishingProfilesByClientId = async (clientId: string) => {
  await ensurePublishingProfilesSchema();
  return query<PublishingProfileRow>(
    `select
       id,
       client_id,
       channel,
       provider,
       account_label,
       external_account_id,
       secret_ref,
       connection_status,
       approval_mode,
       publish_mode,
       capabilities_json,
       constraints_json,
       last_validated_at,
       last_error_code,
       last_error_message,
       created_at,
       updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by channel asc, account_label asc, created_at desc`,
    [clientId],
  );
};

export const findPublishingProfileById = async (profileId: string) => {
  await ensurePublishingProfilesSchema();
  return queryOne<PublishingProfileRow>(
    `select
       id,
       client_id,
       channel,
       provider,
       account_label,
       external_account_id,
       secret_ref,
       connection_status,
       approval_mode,
       publish_mode,
       capabilities_json,
       constraints_json,
       last_validated_at,
       last_error_code,
       last_error_message,
       created_at,
       updated_at
     from ${TABLE_NAME}
     where id = $1
     limit 1`,
    [profileId],
  );
};

export const findPublishingProfileByClientAndChannel = async (clientId: string, channel: string) => {
  await ensurePublishingProfilesSchema();
  return queryOne<PublishingProfileRow>(
    `select
       id,
       client_id,
       channel,
       provider,
       account_label,
       external_account_id,
       secret_ref,
       connection_status,
       approval_mode,
       publish_mode,
       capabilities_json,
       constraints_json,
       last_validated_at,
       last_error_code,
       last_error_message,
       created_at,
       updated_at
     from ${TABLE_NAME}
     where client_id = $1
       and channel = $2
     order by
       case connection_status when 'active' then 0 when 'pending_auth' then 1 else 2 end,
       created_at desc
     limit 1`,
    [clientId, channel],
  );
};

export const createPublishingProfileRecord = async (input: {
  clientId: string;
  channel: string;
  provider: string;
  accountLabel: string;
  externalAccountId?: string | null;
  secretRef: string;
  approvalMode: string;
  publishMode: string;
  capabilities: Record<string, unknown>;
  constraints: Record<string, unknown>;
}) => {
  await ensurePublishingProfilesSchema();
  return withTransaction(async (client) => {
    const result = await client.query<PublishingProfileRow>(
      `insert into ${TABLE_NAME} (
        client_id,
        channel,
        provider,
        account_label,
        external_account_id,
        secret_ref,
        approval_mode,
        publish_mode,
        capabilities_json,
        constraints_json
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
      returning
        id,
        client_id,
        channel,
        provider,
        account_label,
        external_account_id,
        secret_ref,
        connection_status,
        approval_mode,
        publish_mode,
        capabilities_json,
        constraints_json,
        last_validated_at,
        last_error_code,
        last_error_message,
        created_at,
        updated_at`,
      [
        input.clientId,
        input.channel,
        input.provider,
        input.accountLabel,
        input.externalAccountId ?? null,
        input.secretRef,
        input.approvalMode,
        input.publishMode,
        JSON.stringify(input.capabilities),
        JSON.stringify(input.constraints),
      ],
    );

    return result.rows[0];
  });
};

export const updatePublishingProfileRecord = async (
  profileId: string,
  input: Partial<{
    accountLabel: string;
    externalAccountId: string | null;
    secretRef: string;
    connectionStatus: string;
    approvalMode: string;
    publishMode: string;
    capabilities: Record<string, unknown>;
    constraints: Record<string, unknown>;
    lastValidatedAt: string | null;
    lastErrorCode: string | null;
    lastErrorMessage: string | null;
  }>,
) => {
  await ensurePublishingProfilesSchema();
  const existing = await findPublishingProfileById(profileId);
  if (!existing) {
    return null;
  }

  return withTransaction(async (client) => {
    const result = await client.query<PublishingProfileRow>(
      `update ${TABLE_NAME}
       set
         account_label = $2,
         external_account_id = $3,
         secret_ref = $4,
         connection_status = $5,
         approval_mode = $6,
         publish_mode = $7,
         capabilities_json = $8::jsonb,
         constraints_json = $9::jsonb,
         last_validated_at = $10,
         last_error_code = $11,
         last_error_message = $12,
         updated_at = now()
       where id = $1
       returning
         id,
         client_id,
         channel,
         provider,
         account_label,
         external_account_id,
         secret_ref,
         connection_status,
         approval_mode,
         publish_mode,
         capabilities_json,
         constraints_json,
         last_validated_at,
         last_error_code,
         last_error_message,
         created_at,
         updated_at`,
      [
        profileId,
        input.accountLabel ?? existing.account_label,
        input.externalAccountId !== undefined ? input.externalAccountId : existing.external_account_id,
        input.secretRef ?? existing.secret_ref,
        input.connectionStatus ?? existing.connection_status,
        input.approvalMode ?? existing.approval_mode,
        input.publishMode ?? existing.publish_mode,
        JSON.stringify(input.capabilities ?? (typeof existing.capabilities_json === "object" && existing.capabilities_json !== null ? existing.capabilities_json : {})),
        JSON.stringify(input.constraints ?? (typeof existing.constraints_json === "object" && existing.constraints_json !== null ? existing.constraints_json : {})),
        input.lastValidatedAt !== undefined ? input.lastValidatedAt : existing.last_validated_at,
        input.lastErrorCode !== undefined ? input.lastErrorCode : existing.last_error_code,
        input.lastErrorMessage !== undefined ? input.lastErrorMessage : existing.last_error_message,
      ],
    );

    return result.rows[0];
  });
};
