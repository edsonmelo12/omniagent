import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { listClientRecordsByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { findLatestProposalByClientId } from "../proposals/proposals.repository.js";
import { findLatestContentPlanByClientId, findLatestContentPackageByClientId, findLatestScheduleByClientId } from "../content/content.repository.js";
import { findLatestMonitoringReportByClientId } from "../monitoring/monitoring.repository.js";
import { listApprovalsByClientId } from "../approvals/approvals.repository.js";
import { findLatestPublishingExecutionByClientId } from "../publishing/publishing.repository.js";

export type CampaignStage =
  | "intake"
  | "client_record"
  | "research"
  | "strategy"
  | "content_plan"
  | "content_production_package"
  | "schedule"
  | "approval"
  | "publish"
  | "monitoring"
  | "adjustment";

type CampaignState = {
  stage: CampaignStage;
  nextStage: CampaignStage | null;
  nextValidStage: CampaignStage | null;
  clientRecordChangeScope: "none" | "identity" | "research" | "strategy" | "mixed";
  clientRecordChangedSections: string[];
  clientRecordChangedPaths: string[];
  clientRecordChangeDetails: Array<{
    path: string;
    section: string;
    impact: "none" | "research" | "strategy";
  }>;
  blockers: string[];
  reopenStages: CampaignStage[];
  completedStages: CampaignStage[];
  approvalsPending: number;
  approvalsApproved: number;
  currentApprovals: Array<{
    id: string;
    artifactType: string;
    status: string;
  }>;
  hasSnapshot: boolean;
  hasProfiles: boolean;
  hasClientRecord: boolean;
  clientRecordStatus: string | null;
  hasMarketResearch: boolean;
  marketResearchStatus: string | null;
  hasProposal: boolean;
  proposalStatus: string | null;
  hasContentPlan: boolean;
  contentPlanStatus: string | null;
  hasContentPackage: boolean;
  contentPackageStatus: string | null;
  hasSchedule: boolean;
  scheduleStatus: string | null;
  hasPublishingExecution: boolean;
  publishExecutionStatus: string | null;
  publishExecutionMode: string | null;
  hasMonitoring: boolean;
  monitoringStatus: string | null;
};

type CampaignContext = Awaited<ReturnType<typeof getCampaignContext>>;

const stageOrder: CampaignStage[] = [
  "intake",
  "client_record",
  "research",
  "strategy",
  "content_plan",
  "content_production_package",
  "schedule",
  "approval",
  "publish",
  "monitoring",
  "adjustment",
];

const getArtifactStatus = (value: unknown) => (typeof value === "string" ? value : null);

const isApproved = (status: string | null) => status === "approved";

const appendUniqueStages = (target: CampaignStage[], stages: CampaignStage[]) => {
  for (const stage of stages) {
    if (!target.includes(stage)) {
      target.push(stage);
    }
  }
};

const ignoredClientRecordPayloadKeys = new Set(["note", "createdFrom", "revisedFromClientRecordVersion"]);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const normalizeForComparison = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeForComparison(item));
  }

  if (isPlainObject(value)) {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .filter((key) => !ignoredClientRecordPayloadKeys.has(key))
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = normalizeForComparison(record[key]);
        return accumulator;
      }, {});
  }

  return value;
};

const stableSerialize = (value: unknown) => JSON.stringify(normalizeForComparison(value));

const getClientRecordPayload = (value: { payload_json: unknown } | null): Record<string, unknown> | null => {
  if (!value || typeof value.payload_json !== "object" || value.payload_json === null) {
    return null;
  }

  return value.payload_json as Record<string, unknown>;
};

const collectChangedPaths = (previous: unknown, next: unknown, basePath = ""): string[] => {
  if (stableSerialize(previous) === stableSerialize(next)) {
    return [];
  }

  if (Array.isArray(previous) || Array.isArray(next)) {
    return [basePath];
  }

  if (!isPlainObject(previous) || !isPlainObject(next)) {
    return [basePath];
  }

  const keys = Array.from(
    new Set([
      ...Object.keys(previous).filter((key) => !ignoredClientRecordPayloadKeys.has(key)),
      ...Object.keys(next).filter((key) => !ignoredClientRecordPayloadKeys.has(key)),
    ]),
  ).sort();

  const paths: string[] = [];

  for (const key of keys) {
    const path = basePath ? `${basePath}.${key}` : key;
    const left = previous[key];
    const right = next[key];

    if (stableSerialize(left) === stableSerialize(right)) {
      continue;
    }

    if (isPlainObject(left) && isPlainObject(right)) {
      const nestedPaths = collectChangedPaths(left, right, path);
      if (nestedPaths.length > 0) {
        paths.push(...nestedPaths);
        continue;
      }
    }

    paths.push(path);
  }

  return paths;
};

const getClientRecordChangedSections = (
  previous: { payload_json: unknown } | null,
  current: { payload_json: unknown } | null,
): string[] => {
  const previousPayload = getClientRecordPayload(previous);
  const currentPayload = getClientRecordPayload(current);

  if (!previousPayload || !currentPayload) {
    return [];
  }

  return collectChangedPaths(previousPayload, currentPayload).map((path) => path.split(".")[0]).filter((item, index, array) => array.indexOf(item) === index);
};

const getClientRecordChangeScope = (changedSections: string[]): "none" | "identity" | "research" | "strategy" | "mixed" => {
  const identityChanged = changedSections.some((section) => section === "client" || section === "diagnosis");
  const strategyChanged = changedSections.some((section) => section === "narrative" || section === "offerRecommendation");

  if (!identityChanged && !strategyChanged) {
    return "none";
  }

  if (identityChanged && strategyChanged) {
    return "mixed";
  }

  if (identityChanged) {
    return "identity";
  }

  return "strategy";
};

const classifyClientRecordPathImpact = (path: string): "none" | "research" | "strategy" => {
  const topLevelSection = path.split(".")[0] ?? "";

  if (topLevelSection === "client" || topLevelSection === "diagnosis") {
    return "research";
  }

  if (topLevelSection === "narrative" || topLevelSection === "offerRecommendation") {
    return "strategy";
  }

  return "none";
};

const buildClientRecordChangeDetails = (changedPaths: string[]) =>
  changedPaths.map((path) => ({
    path,
    section: path.split(".")[0] ?? path,
    impact: classifyClientRecordPathImpact(path),
  }));

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const getNumber = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

const getValueAtPath = (value: unknown, path: string[]): unknown => {
  let current: unknown = value;

  for (const key of path) {
    const record = asRecord(current);
    if (!record) return null;
    current = record[key];
  }

  return current;
};

const getVersionAtPath = (value: unknown, path: string[]): number | null => getNumber(getValueAtPath(value, path));

const isStaleComparedTo = (sourceVersion: number | null, latestVersion: number | null) => {
  if (sourceVersion === null || latestVersion === null) {
    return false;
  }

  return sourceVersion < latestVersion;
};

const getCampaignContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [profiles, snapshot, clientRecords, marketResearch, proposal, contentPlan, contentPackage, schedule, publishingExecution, monitoring, approvals] =
    await Promise.all([
      listSocialProfilesByClientId(input.clientId),
      listLatestSnapshotByClientId(input.clientId),
      listClientRecordsByClientId(input.clientId),
      findLatestMarketResearchByClientId(input.clientId),
      findLatestProposalByClientId(input.clientId),
      findLatestContentPlanByClientId(input.clientId),
      findLatestContentPackageByClientId(input.clientId),
      findLatestScheduleByClientId(input.clientId),
      findLatestPublishingExecutionByClientId(input.clientId),
      findLatestMonitoringReportByClientId(input.clientId),
      listApprovalsByClientId(input.clientId),
    ]);

  const clientRecord = clientRecords[0] ?? null;
  const previousClientRecord = clientRecords[1] ?? null;

  return {
    client,
    profiles,
    snapshot,
    clientRecord,
    previousClientRecord,
    clientRecords,
    marketResearch,
    proposal,
    contentPlan,
    contentPackage,
    schedule,
    publishingExecution,
    monitoring,
    approvals,
  };
};

export const resolveCampaignState = (context: CampaignContext): CampaignState => {
  const hasSnapshot = Boolean(context.snapshot);
  const hasProfiles = context.profiles.length > 0;
  const hasClientRecord = Boolean(context.clientRecord);
  const clientRecordChangedPaths = collectChangedPaths(context.previousClientRecord?.payload_json ?? null, context.clientRecord?.payload_json ?? null);
  const clientRecordChangedSections = getClientRecordChangedSections(context.previousClientRecord ?? null, context.clientRecord ?? null);
  const clientRecordChangeDetails = buildClientRecordChangeDetails(clientRecordChangedPaths);
  const clientRecordChangeScope = getClientRecordChangeScope(clientRecordChangedSections);
  const latestClientRecordVersion = context.clientRecord?.version ?? null;
  const clientRecordStatus = getArtifactStatus(context.clientRecord?.status);
  const hasMarketResearch = Boolean(context.marketResearch);
  const marketResearchStatus = getArtifactStatus(context.marketResearch?.status);
  const hasProposal = Boolean(context.proposal);
  const latestProposalVersion = context.proposal?.version ?? null;
  const proposalStatus = getArtifactStatus(context.proposal?.status);
  const hasContentPlan = Boolean(context.contentPlan);
  const latestContentPlanVersion = context.contentPlan?.version ?? null;
  const contentPlanStatus = getArtifactStatus(context.contentPlan?.status);
  const hasContentPackage = Boolean(context.contentPackage);
  const contentPackageStatus = getArtifactStatus(context.contentPackage?.status);
  const hasSchedule = Boolean(context.schedule);
  const latestScheduleVersion = context.schedule?.version ?? null;
  const scheduleStatus = getArtifactStatus(context.schedule?.status);
  const hasPublishingExecution = Boolean(context.publishingExecution);
  const publishExecutionStatus = getArtifactStatus(context.publishingExecution?.status);
  const publishExecutionMode = getArtifactStatus(context.publishingExecution?.mode);
  const hasMonitoring = Boolean(context.monitoring);
  const monitoringStatus = getArtifactStatus(context.monitoring?.status);

  const marketResearchClientRecordVersion = getVersionAtPath(context.marketResearch?.payload_json, ["context", "clientRecordVersion"]);
  const proposalClientRecordVersion = getVersionAtPath(context.proposal?.payload_json, ["clientRecordVersion"]);
  const contentPlanClientRecordVersion = getVersionAtPath(context.contentPlan?.payload_json, ["clientRecordVersion"]);
  const contentPlanProposalVersion = getVersionAtPath(context.contentPlan?.payload_json, ["proposalVersion"]);
  const contentPackageContentPlanVersion = getVersionAtPath(context.contentPackage?.payload_json, ["contentPlanVersion"]);
  const scheduleContentPlanVersion = getVersionAtPath(context.schedule?.payload_json, ["contentPlanVersion"]);
  const monitoringClientRecordVersion = getVersionAtPath(context.monitoring?.payload_json, ["clientRecordVersion"]);
  const monitoringProposalVersion = getVersionAtPath(context.monitoring?.payload_json, ["proposalVersion"]);
  const monitoringContentPlanVersion = getVersionAtPath(context.monitoring?.payload_json, ["contentPlanVersion"]);
  const monitoringScheduleVersion = getVersionAtPath(context.monitoring?.payload_json, ["scheduleVersion"]);

  const clientRecordImpactsResearch = clientRecordChangeScope === "identity" || clientRecordChangeScope === "mixed";
  const clientRecordImpactsStrategy = clientRecordChangeScope === "strategy" || clientRecordChangeScope === "mixed";
  const clientRecordHasMeaningfulChange = clientRecordChangeScope !== "none";

  const marketResearchStale = clientRecordImpactsResearch && isStaleComparedTo(marketResearchClientRecordVersion, latestClientRecordVersion);
  const proposalStale = clientRecordImpactsStrategy && isStaleComparedTo(proposalClientRecordVersion, latestClientRecordVersion);
  const contentPlanStale =
    clientRecordImpactsStrategy && isStaleComparedTo(contentPlanClientRecordVersion, latestClientRecordVersion) ||
    isStaleComparedTo(contentPlanProposalVersion, latestProposalVersion);
  const contentPackageStale = contentPlanStale || isStaleComparedTo(contentPackageContentPlanVersion, latestContentPlanVersion);
  const scheduleStale = contentPlanStale || isStaleComparedTo(scheduleContentPlanVersion, latestContentPlanVersion);
  const monitoringStale =
    (clientRecordHasMeaningfulChange && isStaleComparedTo(monitoringClientRecordVersion, latestClientRecordVersion)) ||
    isStaleComparedTo(monitoringProposalVersion, latestProposalVersion) ||
    isStaleComparedTo(monitoringContentPlanVersion, latestContentPlanVersion) ||
    isStaleComparedTo(monitoringScheduleVersion, latestScheduleVersion);
  const currentApprovals = context.approvals
    .filter((approval) => approval.artifact_type === "schedule")
    .map((approval) => ({
      id: approval.id,
      artifactType: approval.artifact_type,
      status: approval.status,
    }));
  const approvalsPending = currentApprovals.filter((approval) => approval.status === "pending").length;
  const approvalsApproved = currentApprovals.filter((approval) => approval.status === "approved").length;

  const completedStages: CampaignStage[] = [];
  const blockers: string[] = [];

  if (hasSnapshot || hasProfiles) {
    completedStages.push("intake");
  } else {
    blockers.push("Intake is missing social evidence");
  }

  if (hasClientRecord && isApproved(clientRecordStatus)) {
    completedStages.push("client_record");
  } else if (hasClientRecord) {
    blockers.push("Client record still needs approval");
  } else {
    blockers.push("Client record is missing");
  }

  if (hasMarketResearch && isApproved(marketResearchStatus) && !marketResearchStale) {
    completedStages.push("research");
  } else if (hasMarketResearch) {
    blockers.push(marketResearchStale ? "Market research is stale after a client record change" : "Market research still needs approval");
  } else {
    blockers.push("Market research is missing");
  }

  if (hasProposal && isApproved(proposalStatus) && !proposalStale) {
    completedStages.push("strategy");
  } else if (hasProposal) {
    blockers.push(proposalStale ? "Proposal is stale after a client record change" : "Proposal still needs approval");
  } else {
    blockers.push("Proposal is missing");
  }

  if (hasContentPlan && isApproved(contentPlanStatus) && !contentPlanStale) {
    completedStages.push("content_plan");
  } else if (hasContentPlan) {
    blockers.push(contentPlanStale ? "Content plan is stale after upstream changes" : "Content plan still needs approval");
  } else {
    blockers.push("Content plan is missing");
  }

  if (hasContentPackage && isApproved(contentPackageStatus) && !contentPackageStale) {
    completedStages.push("content_production_package");
  } else if (hasContentPackage) {
    blockers.push(contentPackageStale ? "Content production package is stale after content plan changes" : "Content production package still needs approval");
  } else {
    blockers.push("Content production package is missing");
  }

  if (hasSchedule && isApproved(scheduleStatus) && !scheduleStale) {
    completedStages.push("schedule");
  } else if (hasSchedule) {
    blockers.push(scheduleStale ? "Schedule is stale after content plan changes" : "Schedule still needs approval");
  } else {
    blockers.push("Schedule is missing");
  }

  if (approvalsApproved > 0 && approvalsPending === 0 && hasSchedule) {
    completedStages.push("approval");
  } else if (hasSchedule && approvalsPending > 0) {
    blockers.push(`${approvalsPending} schedule approval(s) pending`);
  } else if (hasSchedule && approvalsApproved === 0) {
    blockers.push("Schedule approval is missing");
  }

  if (hasPublishingExecution && publishExecutionStatus === "published") {
    completedStages.push("publish");
  } else if (hasPublishingExecution) {
    blockers.push(
      publishExecutionStatus === "blocked"
        ? "Publishing execution is blocked"
        : publishExecutionStatus === "failed"
          ? "Publishing execution failed"
          : publishExecutionMode === "dry_run"
            ? "Dry-run passed; live publication is still pending"
            : "Publishing execution is queued",
    );
  } else if (completedStages.includes("schedule") && approvalsApproved > 0) {
    blockers.push("Publishing cycle has not been executed yet");
  }

  if (hasMonitoring && isApproved(monitoringStatus) && !monitoringStale) {
    completedStages.push("monitoring");
    completedStages.push("adjustment");
  } else if (hasMonitoring) {
    blockers.push(monitoringStale ? "Monitoring report is stale after upstream changes" : "Monitoring report still needs approval");
  }

  const reopenStages: CampaignStage[] = [];

  if (marketResearchStale) {
    appendUniqueStages(reopenStages, ["research", "strategy", "content_plan", "content_production_package", "schedule"]);
  }

  if (proposalStale) {
    appendUniqueStages(reopenStages, ["strategy", "content_plan", "content_production_package", "schedule"]);
  }

  if (contentPlanStale) {
    appendUniqueStages(reopenStages, ["content_plan", "content_production_package", "schedule"]);
  }

  if (contentPackageStale) {
    appendUniqueStages(reopenStages, ["content_production_package", "schedule"]);
  }

  if (scheduleStale) {
    appendUniqueStages(reopenStages, ["approval"]);
  }

  if (hasMonitoring && monitoringStale) {
    appendUniqueStages(reopenStages, ["monitoring"]);
  }

  const firstMissingStage = stageOrder.find((stage) => !completedStages.includes(stage)) ?? "adjustment";
  const stage = firstMissingStage;

  const stageIndex = stageOrder.indexOf(stage);
  const nextStage = stageIndex >= 0 && stageIndex < stageOrder.length - 1 ? stageOrder[stageIndex + 1] : null;

  return {
    stage,
    nextStage,
    nextValidStage: nextStage,
    clientRecordChangeScope,
    clientRecordChangedSections,
    clientRecordChangedPaths,
    clientRecordChangeDetails,
    blockers,
    reopenStages,
    completedStages,
    approvalsPending,
    approvalsApproved,
    currentApprovals,
    hasSnapshot,
    hasProfiles,
    hasClientRecord,
    clientRecordStatus,
    hasMarketResearch,
    marketResearchStatus,
    hasProposal,
    proposalStatus,
    hasContentPlan,
    contentPlanStatus,
    hasContentPackage,
    contentPackageStatus,
    hasSchedule,
    scheduleStatus,
    hasPublishingExecution,
    publishExecutionStatus,
    publishExecutionMode,
    hasMonitoring,
    monitoringStatus,
  };
};

export const getCampaignState = async (input: { userId: string; agencyId: string; clientId: string }) => {
  const context = await getCampaignContext(input);
  const state = resolveCampaignState(context);

  return {
    client: context.client,
    state,
    context: {
      hasSnapshot: state.hasSnapshot,
      hasProfiles: state.hasProfiles,
      hasClientRecord: state.hasClientRecord,
      hasMarketResearch: state.hasMarketResearch,
      hasProposal: state.hasProposal,
      hasContentPlan: state.hasContentPlan,
      hasContentPackage: state.hasContentPackage,
      hasSchedule: state.hasSchedule,
      hasPublishingExecution: state.hasPublishingExecution,
      hasMonitoring: state.hasMonitoring,
    },
  };
};

export const assertCampaignStage = async (input: { userId: string; agencyId: string; clientId: string; allowedStages: CampaignStage[] }) => {
  const context = await getCampaignContext(input);
  const state = resolveCampaignState(context);

  if (!input.allowedStages.includes(state.stage)) {
    throw createError(
      "FAILED_PRECONDITION",
      `Campaign is currently at ${state.stage}. Earliest allowed stage is ${input.allowedStages.join(", ")}`,
      422,
    );
  }

  return state;
};
