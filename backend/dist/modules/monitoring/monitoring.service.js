import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { assertCampaignStage } from "../campaign/campaign.service.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestProposalByClientId } from "../proposals/proposals.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { createMonitoringPayload, createMonitoringReportVersion, findLatestMonitoringReportByClientId, listMonitoringReportsByClientId, getFallbackPeriod, } from "./monitoring.repository.js";
import { findLatestContentPlanByClientId, findLatestScheduleByClientId, listSchedulesByClientId } from "../content/content.repository.js";
const readClientRecordVersion = (source, fallback) => {
    if (typeof source !== "object" || source === null) {
        return fallback;
    }
    const record = source;
    if (typeof record.clientRecordVersion === "number") {
        return record.clientRecordVersion;
    }
    const legacyKey = "b" + "riefVersion";
    const legacyValue = record[legacyKey];
    return typeof legacyValue === "number" ? legacyValue : fallback;
};
const getContentPlanPayload = (contentPlan) => {
    if (!contentPlan || typeof contentPlan.payload_json !== "object" || contentPlan.payload_json === null) {
        return null;
    }
    return contentPlan.payload_json;
};
const getSchedulePayload = (schedule) => {
    if (!schedule || typeof schedule.payload_json !== "object" || schedule.payload_json === null) {
        return null;
    }
    return schedule.payload_json;
};
export const getMonitoringContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const latestReport = await findLatestMonitoringReportByClientId(input.clientId);
    const reports = await listMonitoringReportsByClientId(input.clientId);
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const proposal = await findLatestProposalByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const contentPlan = await findLatestContentPlanByClientId(input.clientId);
    const latestSchedule = await findLatestScheduleByClientId(input.clientId);
    const schedules = await listSchedulesByClientId(input.clientId);
    const contentPlanPayload = getContentPlanPayload(contentPlan);
    const schedulePayload = getSchedulePayload(latestSchedule);
    return {
        client,
        latestReport,
        reports,
        clientRecord,
        proposal,
        snapshot,
        contentPlan,
        latestSchedule,
        schedules,
        contentPlanPayload,
        schedulePayload,
    };
};
export const createMonitoringReport = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    await assertCampaignStage({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        allowedStages: ["monitoring"],
    });
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const proposal = await findLatestProposalByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const contentPlan = await findLatestContentPlanByClientId(input.clientId);
    const latestSchedule = await findLatestScheduleByClientId(input.clientId);
    if (!clientRecord || !proposal || !snapshot || !contentPlan || !latestSchedule) {
        throw createError("FAILED_PRECONDITION", "Client record, proposal, content plan, schedule and social intelligence are required before monitoring", 422);
    }
    const period = input.periodStart && input.periodEnd
        ? { periodStart: input.periodStart, periodEnd: input.periodEnd }
        : getFallbackPeriod();
    const contentPlanPayload = getContentPlanPayload(contentPlan);
    const schedulePayload = getSchedulePayload(latestSchedule);
    const editorialPautas = schedulePayload?.editorialPautas ?? contentPlanPayload?.editorialPautas ?? [];
    const scheduleItems = schedulePayload?.items ?? [];
    const payload = createMonitoringPayload({
        clientName: client.name,
        snapshot,
        clientRecordVersion: clientRecord.version,
        proposalVersion: proposal.version,
        contentPlanVersion: contentPlan.version,
        scheduleVersion: latestSchedule.version,
        contentRhythm: schedulePayload?.cadence ?? contentPlanPayload?.contentRhythm ?? null,
        editorialPautas: editorialPautas.filter((pauta) => typeof pauta?.title === "string").map((pauta, index) => ({
            id: pauta.id ?? `monitoring-pauta-${contentPlan.version}-${index + 1}`,
            title: pauta.title ?? "",
            pillar: pauta.pillar ?? "editorial",
            angle: pauta.angle ?? "positioning",
            objective: pauta.objective ?? "",
            reason: pauta.reason ?? "",
            format: pauta.format ?? "post",
            source: {
                clientRecordVersion: readClientRecordVersion(pauta.source, clientRecord.version),
                proposalVersion: pauta.source?.proposalVersion ?? proposal.version,
                marketResearchVersion: pauta.source?.marketResearchVersion ?? null,
            },
        })),
        scheduleItems: scheduleItems.filter((item) => typeof item?.title === "string").map((item) => ({
            position: item.position ?? 0,
            date: item.date ?? period.periodStart,
            channel: item.channel ?? "instagram",
            title: item.title ?? "",
            pillar: item.pillar ?? "editorial",
            angle: item.angle ?? "positioning",
            objective: item.objective ?? "",
            format: item.format ?? "post",
            status: item.status ?? "planned",
        })),
    });
    const report = await createMonitoringReportVersion({
        clientId: input.clientId,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        status: input.status,
        payload,
    });
    const reports = await listMonitoringReportsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        proposal,
        snapshot,
        contentPlan,
        latestSchedule,
        schedules: await listSchedulesByClientId(input.clientId),
        report,
        reports,
        payload,
    };
};
export const reviseMonitoringReport = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    await assertCampaignStage({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        allowedStages: ["monitoring", "adjustment"],
    });
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const proposal = await findLatestProposalByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const contentPlan = await findLatestContentPlanByClientId(input.clientId);
    const latestReport = await findLatestMonitoringReportByClientId(input.clientId);
    const latestSchedule = await findLatestScheduleByClientId(input.clientId);
    if (!clientRecord || !proposal || !snapshot || !contentPlan || !latestReport || !latestSchedule) {
        throw createError("FAILED_PRECONDITION", "Monitoring report, client record, proposal, content plan, schedule and social intelligence are required before monitoring revision", 422);
    }
    const period = input.periodStart && input.periodEnd
        ? { periodStart: input.periodStart, periodEnd: input.periodEnd }
        : { periodStart: latestReport.period_start, periodEnd: latestReport.period_end };
    const contentPlanPayload = getContentPlanPayload(contentPlan);
    const schedulePayload = getSchedulePayload(latestSchedule);
    const editorialPautas = schedulePayload?.editorialPautas ?? contentPlanPayload?.editorialPautas ?? [];
    const scheduleItems = schedulePayload?.items ?? [];
    const payload = createMonitoringPayload({
        clientName: client.name,
        snapshot,
        clientRecordVersion: clientRecord.version,
        proposalVersion: proposal.version,
        contentPlanVersion: contentPlan.version,
        scheduleVersion: latestSchedule.version,
        contentRhythm: schedulePayload?.cadence ?? contentPlanPayload?.contentRhythm ?? null,
        editorialPautas: editorialPautas.filter((pauta) => typeof pauta?.title === "string").map((pauta, index) => ({
            id: pauta.id ?? `monitoring-pauta-${contentPlan.version}-${index + 1}`,
            title: pauta.title ?? "",
            pillar: pauta.pillar ?? "editorial",
            angle: pauta.angle ?? "positioning",
            objective: pauta.objective ?? "",
            reason: pauta.reason ?? "",
            format: pauta.format ?? "post",
            source: {
                clientRecordVersion: readClientRecordVersion(pauta.source, clientRecord.version),
                proposalVersion: pauta.source?.proposalVersion ?? proposal.version,
                marketResearchVersion: pauta.source?.marketResearchVersion ?? null,
            },
        })),
        scheduleItems: scheduleItems.filter((item) => typeof item?.title === "string").map((item) => ({
            position: item.position ?? 0,
            date: item.date ?? period.periodStart,
            channel: item.channel ?? "instagram",
            title: item.title ?? "",
            pillar: item.pillar ?? "editorial",
            angle: item.angle ?? "positioning",
            objective: item.objective ?? "",
            format: item.format ?? "post",
            status: item.status ?? "planned",
        })),
    });
    const revisedPayload = {
        ...payload,
        note: input.note ?? null,
        createdFrom: "manual-edit",
        revisedFromMonitoringReportId: latestReport.id,
        revisedFromPeriodStart: latestReport.period_start,
        revisedFromPeriodEnd: latestReport.period_end,
    };
    const report = await createMonitoringReportVersion({
        clientId: input.clientId,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        status: input.status,
        payload: revisedPayload,
    });
    const reports = await listMonitoringReportsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        proposal,
        snapshot,
        contentPlan,
        latestSchedule,
        report,
        reports,
        payload: revisedPayload,
    };
};
