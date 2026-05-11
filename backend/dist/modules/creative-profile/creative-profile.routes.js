import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { creativeProfileCreateSchema, creativeProfileUpdateSchema } from "./creative-profile.schemas.js";
import { createCreativeProfile, getCreativeProfileContext, listCreativeProfiles, reviseCreativeProfile } from "./creative-profile.service.js";
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
export const registerCreativeProfileRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/creative-profile", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getCreativeProfileContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            creativeProfile: result.creativeProfile,
            latestCreativeProfile: result.latestCreativeProfile,
            creativeProfiles: result.creativeProfiles,
            payload: result.payload,
            sources: result.sources,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/creative-profile", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = creativeProfileCreateSchema.parse(request.body ?? {});
        const result = await createCreativeProfile({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            note: payload.note,
        });
        return successEnvelope({
            client: result.client,
            creativeProfile: result.creativeProfile,
            creativeProfiles: result.creativeProfiles,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch("/api/v1/clients/:clientId/creative-profile", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = creativeProfileUpdateSchema.parse(request.body ?? {});
        const result = await reviseCreativeProfile({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            note: payload.note,
            summaryOverride: payload.summaryOverride,
        });
        return successEnvelope({
            client: result.client,
            creativeProfile: result.creativeProfile,
            creativeProfiles: result.creativeProfiles,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.get("/api/v1/clients/:clientId/creative-profiles", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await listCreativeProfiles({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            creativeProfiles: result.creativeProfiles,
        }, { requestId: context.requestId, agencyId });
    });
};
