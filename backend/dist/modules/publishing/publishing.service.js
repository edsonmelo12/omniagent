import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { listApprovalsByClientId } from "../approvals/approvals.repository.js";
import { findLatestContentPackageByClientId, findLatestContentPlanByClientId, findLatestScheduleByClientId } from "../content/content.repository.js";
import { createPublishingExecution, findLatestPublishingExecutionByClientId, listPublishingExecutionsByClientId, } from "./publishing.repository.js";
const asRecord = (value) => typeof value === "object" && value !== null ? value : null;
const getNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const getValueAtPath = (value, path) => {
    let current = value;
    for (const key of path) {
        const record = asRecord(current);
        if (!record)
            return null;
        current = record[key];
    }
    return current;
};
const getVersionAtPath = (value, path) => getNumber(getValueAtPath(value, path));
const getSchedulePayload = (schedule) => {
    if (!schedule || typeof schedule.payload_json !== "object" || schedule.payload_json === null) {
        return null;
    }
    return schedule.payload_json;
};
const getContentPackagePayload = (contentPackage) => {
    if (!contentPackage || typeof contentPackage.payload_json !== "object" || contentPackage.payload_json === null) {
        return null;
    }
    return contentPackage.payload_json;
};
const readStatus = (value) => (typeof value === "string" ? value : null);
const isApproved = (status) => status === "approved";
export const normalizePlatforms = (value) => Array.from(new Set(value.map((item) => item.trim().toLowerCase()).filter(Boolean)));
export const buildTargetPlatforms = (input) => {
    const requested = normalizePlatforms(input.requestedPlatforms);
    if (requested.length > 0) {
        return requested;
    }
    const scheduleChannels = normalizePlatforms((input.schedulePayload?.items ?? [])
        .map((item) => item?.channel ?? "")
        .filter((item) => typeof item === "string"));
    if (scheduleChannels.length > 0) {
        return scheduleChannels;
    }
    return normalizePlatforms(input.contentPackagePayload?.visualDirection?.supportChannels ?? []);
};
export const buildPublishingPayload = (input) => ({
    clientName: input.clientName,
    requestedMode: input.mode,
    confirmed: input.confirmed,
    notes: input.notes ?? null,
    targetPlatforms: input.targetPlatforms,
    contentPlanVersion: input.contentPlanVersion,
    contentPackageVersion: input.contentPackageVersion,
    scheduleVersion: input.scheduleVersion,
    contentRhythm: input.schedulePayload?.cadence ?? input.contentPackagePayload?.visualDirection?.contentRhythm ?? null,
    scheduleItems: (input.schedulePayload?.items ?? []).map((item) => ({
        position: item.position ?? 0,
        date: item.date ?? null,
        channel: item.channel ?? "instagram",
        title: item.title ?? "",
        pillar: item.pillar ?? "editorial",
        angle: item.angle ?? "positioning",
        objective: item.objective ?? "",
        format: item.format ?? "post",
        status: item.status ?? "planned",
    })),
    editorialPautas: input.schedulePayload?.editorialPautas ?? [],
    visualDirection: input.contentPackagePayload?.visualDirection ?? null,
    approvals: {
        pending: input.approvalsPending,
        approved: input.approvalsApproved,
    },
    generatedAt: new Date().toISOString(),
});
export const buildValidation = (input) => {
    const blockers = [];
    const warnings = [];
    if (input.contentPlanVersion === null) {
        blockers.push("Content plan is missing");
    }
    if (input.contentPackageVersion === null) {
        blockers.push("Content production package is missing");
    }
    if (input.scheduleVersion === null) {
        blockers.push("Schedule is missing");
    }
    const scheduleContentPlanVersion = getVersionAtPath(input.schedulePayload, ["contentPlanVersion"]);
    const packageContentPlanVersion = getVersionAtPath(input.contentPackagePayload, ["contentPlanVersion"]);
    if (scheduleContentPlanVersion !== null && input.contentPlanVersion !== null && scheduleContentPlanVersion < input.contentPlanVersion) {
        blockers.push("Schedule is stale after content plan changes");
    }
    if (packageContentPlanVersion !== null && input.contentPlanVersion !== null && packageContentPlanVersion < input.contentPlanVersion) {
        blockers.push("Content production package is stale after content plan changes");
    }
    if (!isApproved(input.scheduleStatus)) {
        blockers.push("Schedule still needs approval");
    }
    if (!isApproved(input.contentPackageStatus)) {
        blockers.push("Content production package still needs approval");
    }
    if (input.approvalsPending > 0) {
        blockers.push(`${input.approvalsPending} schedule approval(s) pending`);
    }
    if (input.approvalsApproved === 0) {
        blockers.push("Schedule approval is missing");
    }
    if (input.targetPlatforms.length === 0) {
        blockers.push("No social platforms were resolved for publication");
    }
    if (input.mode === "live" && !input.confirm) {
        blockers.push("Live publication requires explicit confirmation");
    }
    if (input.mode === "live") {
        warnings.push("Live publication is simulated locally until network adapters are connected.");
    }
    return {
        ready: blockers.length === 0,
        blockers,
        warnings,
    };
};
const summarizeExecution = (execution) => ({
    id: execution.id,
    mode: execution.mode,
    status: execution.status,
    platforms: Array.isArray(execution.platforms) ? execution.platforms : [],
    confirmedAt: execution.confirmed_at,
    createdAt: execution.created_at,
});
export const getPublishingContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const [latestExecution, executions, clientRecord, contentPlan, contentPackage, schedule, approvals] = await Promise.all([
        findLatestPublishingExecutionByClientId(input.clientId),
        listPublishingExecutionsByClientId(input.clientId),
        findLatestClientRecordByClientId(input.clientId),
        findLatestContentPlanByClientId(input.clientId),
        findLatestContentPackageByClientId(input.clientId),
        findLatestScheduleByClientId(input.clientId),
        listApprovalsByClientId(input.clientId),
    ]);
    const schedulePayload = getSchedulePayload(schedule);
    const contentPackagePayload = getContentPackagePayload(contentPackage);
    return {
        client,
        latestExecution,
        executions,
        clientRecord,
        contentPlan,
        contentPackage,
        schedule,
        approvals,
        schedulePayload,
        contentPackagePayload,
    };
};
export const executePublishing = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const contentPlan = await findLatestContentPlanByClientId(input.clientId);
    const contentPackage = await findLatestContentPackageByClientId(input.clientId);
    const schedule = await findLatestScheduleByClientId(input.clientId);
    const approvals = await listApprovalsByClientId(input.clientId);
    if (!contentPlan || !contentPackage || !schedule) {
        throw createError("FAILED_PRECONDITION", "Content plan, content production package and schedule are required before publishing", 422);
    }
    const contentPackagePayload = getContentPackagePayload(contentPackage);
    const schedulePayload = getSchedulePayload(schedule);
    const approvalsApproved = approvals.filter((approval) => approval.artifact_type === "schedule" && approval.status === "approved").length;
    const approvalsPending = approvals.filter((approval) => approval.artifact_type === "schedule" && approval.status === "pending").length;
    const targetPlatforms = buildTargetPlatforms({
        requestedPlatforms: input.platforms,
        schedulePayload,
        contentPackagePayload,
    });
    const validation = buildValidation({
        mode: input.mode,
        confirm: input.confirm,
        contentPlanVersion: contentPlan.version,
        contentPackageVersion: contentPackage.version,
        scheduleVersion: schedule.version,
        scheduleStatus: schedule.status,
        contentPackageStatus: contentPackage.status,
        contentPackagePayload,
        schedulePayload,
        approvalsPending,
        approvalsApproved,
        targetPlatforms,
    });
    const payload = buildPublishingPayload({
        clientName: client.name,
        mode: input.mode,
        confirmed: input.confirm,
        notes: input.notes,
        targetPlatforms,
        contentPlanVersion: contentPlan.version,
        contentPackageVersion: contentPackage.version,
        scheduleVersion: schedule.version,
        schedulePayload,
        contentPackagePayload,
        approvalsPending,
        approvalsApproved,
    });
    const status = validation.blockers.length > 0
        ? "blocked"
        : input.mode === "dry_run"
            ? "dry_run_passed"
            : "published";
    const result = {
        deliveryMode: input.mode === "live" ? "simulated" : "validation",
        mode: input.mode,
        status,
        publishedAt: status === "published" ? new Date().toISOString() : null,
        executionSummary: {
            clientId: input.clientId,
            contentPlanVersion: contentPlan.version,
            contentPackageVersion: contentPackage.version,
            scheduleVersion: schedule.version,
            targetPlatforms,
            blockers: validation.blockers,
            warnings: validation.warnings,
        },
        notes: input.notes ?? null,
    };
    const execution = await createPublishingExecution({
        clientId: input.clientId,
        scheduleId: schedule.id,
        mode: input.mode,
        status,
        platforms: targetPlatforms,
        payload,
        validation,
        result,
        requestedBy: input.userId,
        confirmedBy: input.mode === "live" && input.confirm ? input.userId : null,
        confirmedAt: input.mode === "live" && input.confirm ? new Date().toISOString() : null,
    });
    const executions = await listPublishingExecutionsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        contentPlan,
        contentPackage,
        schedule,
        approvals,
        execution,
        executions,
        payload,
        validation,
        result,
        summary: summarizeExecution(execution),
    };
};
