import { queryOne } from "../src/shared/db/database.js";
import { findAgencyBySlug } from "../src/modules/tenancy/tenancy.repository.js";
import { findLatestBrandProfileByClientId } from "../src/modules/brand-profile/brand-profile.repository.js";
import { createBrandProfile } from "../src/modules/brand-profile/brand-profile.service.js";
import { findPrimaryProductByClientId } from "../src/modules/client-products/client-products.repository.js";
import { findLatestOfferProfileByProductId } from "../src/modules/offer-profile/offer-profile.repository.js";
import { syncOfferProfileFromProduct } from "../src/modules/offer-profile/offer-profile.service.js";
import { findLatestProposalByClientId } from "../src/modules/proposals/proposals.repository.js";
import { createProposal } from "../src/modules/proposals/proposals.service.js";
import {
  findLatestContentPackageByClientId,
  findLatestContentPlanByClientId,
  findLatestScheduleByClientId,
} from "../src/modules/content/content.repository.js";
import { createContentPlan, createSchedule } from "../src/modules/content/content.service.js";
import { getApprovals, setApprovalStatus } from "../src/modules/approvals/approvals.service.js";
import { createApproval } from "../src/modules/approvals/approvals.service.js";
import { findClientBySlug } from "../src/modules/clients/clients.repository.js";

const DEFAULT_AGENCY_SLUG = "social-growth";

const readArg = (name: string) => {
  const index = process.argv.findIndex((value) => value === `--${name}`);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const resolveUserForAgency = async (agencyId: string) => {
  const preferred = await queryOne<{ id: string }>(
    `select u.id
     from users u
     inner join memberships m on m.user_id = u.id
     where m.agency_id = $1
       and lower(u.email) = lower($2)
     limit 1`,
    [agencyId, "edson@portaldemidias.com"],
  );
  if (preferred) return preferred.id;

  const fallback = await queryOne<{ user_id: string }>(
    `select user_id
     from memberships
     where agency_id = $1
     order by created_at asc
     limit 1`,
    [agencyId],
  );
  return fallback?.user_id ?? null;
};

const asObject = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const extractBrandSignals = (brandProfile: { confirmed_json: unknown; inferred_json: unknown } | null) => {
  if (!brandProfile) return null;
  const confirmed = asObject(brandProfile.confirmed_json);
  const inferred = asObject(brandProfile.inferred_json);
  return {
    primaryCta: asString(inferred?.primaryCta),
    toneOfVoice: asString(inferred?.toneOfVoice),
    uniqueValueProposition: asString(confirmed?.uniqueValueProposition),
    promise: asString(confirmed?.promise),
  };
};

const run = async () => {
  const agencySlug = readArg("agency-slug") ?? DEFAULT_AGENCY_SLUG;
  const clientSlug = readArg("client-slug") ?? "dallas-rent-a-car";
  const status = readArg("status") ?? "approved";

  const agency = await findAgencyBySlug(agencySlug);
  if (!agency) {
    throw new Error(`Agency not found for slug ${agencySlug}`);
  }

  const userId = await resolveUserForAgency(agency.id);
  if (!userId) {
    throw new Error(`No user membership found for agency ${agency.id}`);
  }

  const client = await findClientBySlug(agency.id, clientSlug);
  if (!client) {
    throw new Error(`Client not found for slug ${clientSlug}`);
  }

  const operations: string[] = [];
  const skips: string[] = [];

  let brandProfile = await findLatestBrandProfileByClientId(client.id);
  if (!brandProfile) {
    const created = await createBrandProfile({
      userId,
      agencyId: agency.id,
      clientId: client.id,
      status,
      note: "Materialized from public evidence (no META_GRAPH).",
    });
    brandProfile = created.brandProfile;
    operations.push(`brandProfile:v${created.brandProfile.version}`);
  } else {
    skips.push(`brandProfile:v${brandProfile.version}`);
  }

  const product = await findPrimaryProductByClientId(client.id);
  if (!product) {
    throw new Error("Primary product missing. Create a prioritized product before materialization.");
  }

  let offerProfile = await findLatestOfferProfileByProductId(product.id);
  if (!offerProfile) {
    offerProfile = await syncOfferProfileFromProduct({
      client,
      product,
      brandProfile: extractBrandSignals(brandProfile),
    });
    operations.push(`offerProfile:v${offerProfile.version}`);
  } else {
    skips.push(`offerProfile:v${offerProfile.version}`);
  }

  let proposal = await findLatestProposalByClientId(client.id);
  if (!proposal) {
    const created = await createProposal({
      userId,
      agencyId: agency.id,
      clientId: client.id,
      status,
    });
    proposal = created.proposal;
    operations.push(`proposal:v${created.proposal.version}`);
  } else {
    skips.push(`proposal:v${proposal.version}`);
  }

  let contentPlan = await findLatestContentPlanByClientId(client.id);
  let contentPackage = await findLatestContentPackageByClientId(client.id);
  if (!contentPlan || !contentPackage) {
    const created = await createContentPlan({
      userId,
      agencyId: agency.id,
      clientId: client.id,
      status,
      objective: "Cadência de prova pública e geração de demanda local.",
    });
    contentPlan = created.contentPlan;
    contentPackage = created.contentPackage;
    operations.push(`contentPlan:v${created.contentPlan.version}`);
    operations.push(`contentPackage:v${created.contentPackage.version}`);
  } else {
    skips.push(`contentPlan:v${contentPlan.version}`);
    skips.push(`contentPackage:v${contentPackage.version}`);
  }

  let schedule = await findLatestScheduleByClientId(client.id);
  if (!schedule) {
    const created = await createSchedule({
      userId,
      agencyId: agency.id,
      clientId: client.id,
      status,
    });
    schedule = created.schedule;
    operations.push(`schedule:v${created.schedule.version}`);
  } else {
    skips.push(`schedule:v${schedule.version}`);
  }

  const approvalsContext = await getApprovals({
    userId,
    agencyId: agency.id,
    clientId: client.id,
  });
  const scheduleApprovals = approvalsContext.approvals.filter((item) => item.artifact_type === "schedule");
  const approvedSchedule = scheduleApprovals.find((item) => item.status === "approved");

  if (!approvedSchedule) {
    const pendingApproval = scheduleApprovals.find((item) => item.status === "pending");
    if (pendingApproval) {
      await setApprovalStatus({
        userId,
        agencyId: agency.id,
        approvalId: pendingApproval.id,
        status: "approved",
        notes: "Approved automatically after public-readiness materialization.",
      });
      operations.push(`approval:approved:${pendingApproval.id}`);
    } else {
      const createdApproval = await createApproval({
        userId,
        agencyId: agency.id,
        clientId: client.id,
        artifactType: "schedule",
        artifactId: schedule.id,
        status: "approved",
        notes: "Approved automatically after public-readiness materialization.",
      });
      operations.push(`approval:created:${createdApproval.approval.id}`);
    }
  } else {
    skips.push(`approval:approved:${approvedSchedule.id}`);
  }

  const latest = {
    brandProfile: await findLatestBrandProfileByClientId(client.id),
    offerProfile: await findLatestOfferProfileByProductId(product.id),
    proposal: await findLatestProposalByClientId(client.id),
    contentPlan: await findLatestContentPlanByClientId(client.id),
    contentPackage: await findLatestContentPackageByClientId(client.id),
    schedule: await findLatestScheduleByClientId(client.id),
  };

  console.log(
    JSON.stringify(
      {
        ok: true,
        agency: { id: agency.id, slug: agency.slug },
        client: { id: client.id, slug: client.slug, name: client.name },
        statusUsed: status,
        operations,
        skips,
        latest: {
          brandProfile: latest.brandProfile ? { id: latest.brandProfile.id, version: latest.brandProfile.version, status: latest.brandProfile.status } : null,
          offerProfile: latest.offerProfile ? { id: latest.offerProfile.id, version: latest.offerProfile.version, status: latest.offerProfile.status } : null,
          proposal: latest.proposal ? { id: latest.proposal.id, version: latest.proposal.version, status: latest.proposal.status } : null,
          contentPlan: latest.contentPlan ? { id: latest.contentPlan.id, version: latest.contentPlan.version, status: latest.contentPlan.status } : null,
          contentPackage: latest.contentPackage ? { id: latest.contentPackage.id, version: latest.contentPackage.version, status: latest.contentPackage.status } : null,
          schedule: latest.schedule ? { id: latest.schedule.id, version: latest.schedule.version, status: latest.schedule.status } : null,
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
