import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { monitoringReportCreateSchema, monitoringReportUpdateSchema } from "./monitoring.schemas.js";
import { createMonitoringReport, getMonitoringContext, reviseMonitoringReport } from "./monitoring.service.js";
const requireAgencyHeader = (request) => {
    const value = request.headers["x-agency-id"];
    if (typeof value !== "string" || value.trim().length === 0) {
        if (env.NODE_ENV === "development") {
            const devSession = getDevSession();
            if (devSession) {
                return devSession.agencyId;
            }
        }
        throw createError("BAD_REQUEST", "x-agency-id header is required", 400);
    }
    return value.trim();
};
export const registerMonitoringRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/monitoring", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getMonitoringContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            latestReport: result.latestReport,
            reports: result.reports,
            clientRecord: result.clientRecord,
            proposal: result.proposal,
            snapshot: result.snapshot,
            contentPlan: result.contentPlan,
            latestSchedule: result.latestSchedule,
            schedules: result.schedules,
            contentPlanPayload: result.contentPlanPayload,
            schedulePayload: result.schedulePayload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/monitoring", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = monitoringReportCreateSchema.parse(request.body ?? {});
        const result = await createMonitoringReport({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            periodStart: payload.periodStart,
            periodEnd: payload.periodEnd,
        });
        return successEnvelope({
            client: result.client,
            report: result.report,
            reports: result.reports,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch("/api/v1/clients/:clientId/monitoring", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = monitoringReportUpdateSchema.parse(request.body ?? {});
        const result = await reviseMonitoringReport({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            periodStart: payload.periodStart,
            periodEnd: payload.periodEnd,
            note: payload.note,
        });
        return successEnvelope({
            client: result.client,
            report: result.report,
            reports: result.reports,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
};
