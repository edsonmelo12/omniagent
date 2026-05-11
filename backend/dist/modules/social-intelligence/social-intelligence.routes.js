import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { socialIntelligenceCreateSchema } from "./social-intelligence.schemas.js";
import { buildSocialIntelligenceSnapshot, getLatestSocialIntelligence } from "./social-intelligence.service.js";
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
export const registerSocialIntelligenceRoutes = (app) => {
    app.post("/api/v1/clients/:clientId/social-intelligence", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = socialIntelligenceCreateSchema.parse(request.body ?? {});
        const result = await buildSocialIntelligenceSnapshot({
            userId: authContext.userId,
            agencyId,
            clientId,
            publicOnly: payload.publicOnly,
            confidence: payload.confidence,
            rawNotes: payload.rawNotes,
            sourceUrls: payload.sourceUrls,
        });
        return successEnvelope({
            client: result.client,
            profiles: result.profiles,
            snapshot: result.snapshot,
            sources: result.sources,
        }, { requestId: context.requestId, agencyId });
    });
    app.get("/api/v1/clients/:clientId/social-intelligence", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getLatestSocialIntelligence({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            profiles: result.profiles,
            snapshot: result.snapshot,
            sources: result.sources,
        }, { requestId: context.requestId, agencyId });
    });
};
