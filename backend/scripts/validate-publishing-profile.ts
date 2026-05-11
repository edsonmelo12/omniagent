import { queryOne } from "../src/shared/db/database.js";
import { validatePublishingProfile } from "../src/modules/publishing-profiles/publishing-profiles.service.js";

const readArg = (name: string) => {
  const index = process.argv.findIndex((value) => value === `--${name}`);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const run = async () => {
  const clientId = readArg("client-id");
  const profileId = readArg("profile-id");

  if (!clientId || !profileId) {
    console.error("Missing required args: --client-id and --profile-id");
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

  const result = await validatePublishingProfile({
    userId: membership.user_id,
    agencyId: client.agency_id,
    clientId,
    profileId,
  });

  console.log(JSON.stringify(result.validation, null, 2));
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
