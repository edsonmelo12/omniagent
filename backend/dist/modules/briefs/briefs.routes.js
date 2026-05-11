import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { briefCreateSchema, briefUpdateSchema } from "./briefs.schemas.js";
import { createBrief, getBrief, reviseBrief } from "./briefs.service.js";
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
export const registerBriefRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/brief", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getBrief({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            latestBrief: result.latestBrief,
            snapshot: result.snapshot,
            profiles: result.profiles,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/brief", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = briefCreateSchema.parse(request.body ?? {});
        const result = await createBrief({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            note: payload.note,
        });
        return successEnvelope({
            client: result.client,
            brief: result.brief,
            briefs: result.briefs,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch("/api/v1/clients/:clientId/brief", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = briefUpdateSchema.parse(request.body ?? {});
        const result = await reviseBrief({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            note: payload.note,
            summaryOverride: payload.summaryOverride,
        });
        return successEnvelope({
            client: result.client,
            brief: result.brief,
            briefs: result.briefs,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
};
