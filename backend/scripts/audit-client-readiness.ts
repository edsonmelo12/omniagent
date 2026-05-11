import { query, queryOne } from "../src/shared/db/database.js";

type LatestArtifactRow = {
  id: string;
  version: number;
  status: string;
  created_at: string;
};

const readArg = (name: string) => {
  const index = process.argv.findIndex((value) => value === `--${name}`);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const getLatestArtifactByClientId = async (tableName: string, clientId: string) =>
  queryOne<LatestArtifactRow>(
    `select id, version, status, created_at
     from ${tableName}
     where client_id = $1
     order by version desc, created_at desc
     limit 1`,
    [clientId],
  );

const run = async () => {
  const clientIdArg = readArg("client-id");
  const clientNameArg = readArg("client-name") ?? "amiclube";

  const client = clientIdArg
    ? await queryOne<{ id: string; name: string; segment: string | null; website_url: string | null }>(
        `select id, name, segment, website_url
         from clients
         where id = $1
         limit 1`,
        [clientIdArg],
      )
    : await queryOne<{ id: string; name: string; segment: string | null; website_url: string | null }>(
        `select id, name, segment, website_url
         from clients
         where lower(name) like lower($1)
         order by created_at desc
         limit 1`,
        [`%${clientNameArg}%`],
      );

  if (!client) {
    console.error("Client not found");
    process.exit(1);
  }

  const [latestBrief, latestSnapshot, latestMarketResearch, latestBrandProfile, primaryProduct, latestProposal, latestContentPlan, latestContentPackage, latestSchedule, publishingProfiles, latestPublishingExecution, approvals] =
    await Promise.all([
      getLatestArtifactByClientId("client_briefs", client.id),
      queryOne<{
        id: string;
        created_at: string;
        confidence: number | null;
        presence_score: number | null;
        consistency_score: number | null;
        proof_score: number | null;
        conversion_readiness: number | null;
      }>(
        `select id, created_at, confidence, presence_score, consistency_score, proof_score, conversion_readiness
         from social_intelligence_snapshots
         where client_id = $1
         order by created_at desc
         limit 1`,
        [client.id],
      ),
      getLatestArtifactByClientId("market_researches", client.id),
      queryOne<{ id: string; version: number; status: string; confidence: number; created_at: string }>(
        `select id, version, status, confidence, created_at
         from brand_profiles
         where client_id = $1
         order by version desc, created_at desc
         limit 1`,
        [client.id],
      ),
      queryOne<{
        id: string;
        name: string;
        status: string;
        is_active: boolean;
        priority: number;
        updated_at: string;
      }>(
        `select id, name, status, is_active, priority, updated_at
         from client_products
         where client_id = $1
         order by is_active desc, priority desc, updated_at desc
         limit 1`,
        [client.id],
      ),
      getLatestArtifactByClientId("proposals", client.id),
      getLatestArtifactByClientId("content_plans", client.id),
      getLatestArtifactByClientId("content_packages", client.id),
      getLatestArtifactByClientId("schedules", client.id),
      query<{
        id: string;
        channel: string;
        provider: string;
        account_label: string;
        external_account_id: string | null;
        secret_ref: string;
        connection_status: string;
        approval_mode: string;
        publish_mode: string;
        last_validated_at: string | null;
        last_error_code: string | null;
        last_error_message: string | null;
      }>(
        `select id, channel, provider, account_label, external_account_id, secret_ref, connection_status, approval_mode, publish_mode, last_validated_at, last_error_code, last_error_message
         from publishing_profiles
         where client_id = $1
         order by channel asc, account_label asc`,
        [client.id],
      ),
      queryOne<{ id: string; mode: string; status: string; created_at: string }>(
        `select id, mode, status, created_at
         from publishing_executions
         where client_id = $1
         order by created_at desc
         limit 1`,
        [client.id],
      ),
      query<{ id: string; artifact_type: string; status: string; created_at: string }>(
        `select id, artifact_type, status, created_at
         from approvals
         where client_id = $1
         order by created_at desc`,
        [client.id],
      ),
    ]);

  const latestOfferProfile = primaryProduct
    ? await queryOne<{ id: string; version: number; status: string; confidence: number; created_at: string }>(
        `select id, version, status, confidence, created_at
         from offer_profiles
         where client_product_id = $1
         order by version desc, created_at desc
         limit 1`,
        [primaryProduct.id],
      )
    : null;

  const scheduleApprovals = approvals.filter((approval) => approval.artifact_type === "schedule");
  const scheduleApproved = scheduleApprovals.some((approval) => approval.status === "approved");
  const schedulePendingCount = scheduleApprovals.filter((approval) => approval.status === "pending").length;

  const checks = {
    clientRegistered: true,
    briefExists: Boolean(latestBrief),
    socialSnapshotExists: Boolean(latestSnapshot),
    marketResearchExists: Boolean(latestMarketResearch),
    brandProfileExists: Boolean(latestBrandProfile),
    primaryProductExists: Boolean(primaryProduct),
    offerProfileExists: Boolean(latestOfferProfile),
    proposalExists: Boolean(latestProposal),
    contentPlanExists: Boolean(latestContentPlan),
    contentPackageExists: Boolean(latestContentPackage),
    scheduleExists: Boolean(latestSchedule),
    scheduleApproved,
    scheduleApprovalsPending: schedulePendingCount,
    publishingProfileExists: publishingProfiles.length > 0,
    publishingProfileActive: publishingProfiles.some((profile) => profile.connection_status === "active"),
    publishingLiveEnabled: publishingProfiles.some((profile) => profile.publish_mode === "live_enabled"),
    lastPublishSucceeded: latestPublishingExecution?.status === "published",
  };

  const missing = Object.entries(checks)
    .filter(([key, value]) => {
      if (key === "scheduleApprovalsPending") return (value as number) > 0;
      return !value;
    })
    .map(([key]) => key);

  console.log(
    JSON.stringify(
      {
        ok: missing.length === 0,
        client,
        checks,
        missing,
        latest: {
          brief: latestBrief,
          snapshot: latestSnapshot,
          marketResearch: latestMarketResearch,
          brandProfile: latestBrandProfile,
          primaryProduct,
          offerProfile: latestOfferProfile,
          proposal: latestProposal,
          contentPlan: latestContentPlan,
          contentPackage: latestContentPackage,
          schedule: latestSchedule,
          scheduleApprovals,
          publishingProfiles,
          latestPublishingExecution,
        },
      },
      null,
      2,
    ),
  );
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
