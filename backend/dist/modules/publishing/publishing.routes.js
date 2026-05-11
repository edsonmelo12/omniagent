import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { publishingExecutionCreateSchema } from "./publishing.schemas.js";
import { executePublishing, getPublishingContext } from "./publishing.service.js";
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
export const registerPublishingRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/publishing", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getPublishingContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            latestExecution: result.latestExecution,
            executions: result.executions,
            clientRecord: result.clientRecord,
            contentPlan: result.contentPlan,
            contentPackage: result.contentPackage,
            schedule: result.schedule,
            approvals: result.approvals,
            schedulePayload: result.schedulePayload,
            contentPackagePayload: result.contentPackagePayload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/publishing", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = publishingExecutionCreateSchema.parse(request.body ?? {});
        const result = await executePublishing({
            userId: authContext.userId,
            agencyId,
            clientId,
            mode: payload.mode,
            confirm: payload.confirm,
            platforms: payload.platforms,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            execution: result.execution,
            executions: result.executions,
            payload: result.payload,
            validation: result.validation,
            result: result.result,
        }, { requestId: context.requestId, agencyId });
    });
};
