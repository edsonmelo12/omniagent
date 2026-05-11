import { query, queryOne } from "../src/shared/db/database.js";
import { refreshRenderedAssetsForClient, processRenderedAssetQueueOnce } from "../src/modules/content/rendered-assets.service.js";

const readArg = (name: string) => {
  const index = process.argv.findIndex((value) => value === `--${name}`);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const run = async () => {
  const clientId = readArg("client-id");
  const cyclesArg = readArg("cycles");
  const cycles = cyclesArg ? Number(cyclesArg) : 6;

  if (!clientId) {
    console.error("Missing required arg: --client-id");
    process.exit(1);
  }

  const client = await queryOne<{ agency_id: string }>(
    `select agency_id
     from clients
     where id = $1
     limit 1`,
    [clientId],
  );

  if (!client) {
    console.error("Client not found");
    process.exit(1);
  }

  const membership = await queryOne<{ user_id: string }>(
    `select user_id
     from memberships
     where agency_id = $1
     order by created_at asc
     limit 1`,
    [client.agency_id],
  );

  if (!membership) {
    console.error("No membership found for client agency");
    process.exit(1);
  }

  await refreshRenderedAssetsForClient({
    userId: membership.user_id,
    agencyId: client.agency_id,
    clientId,
  });

  for (let index = 0; index < cycles; index += 1) {
    await processRenderedAssetQueueOnce();
  }

  const rows = await query<{
    id: string;
    version: number;
    status: string;
    asset_format: string | null;
    asset_path: string | null;
  }>(
    `select id, version, status, asset_format, asset_path
     from rendered_assets
     where client_id = $1
     order by version desc
     limit 8`,
    [clientId],
  );

  console.log(JSON.stringify(rows, null, 2));
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
