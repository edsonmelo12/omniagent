import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { youtubeStrategyAnalyzeSchema } from "./youtube-strategy.schemas.js";
import { createYoutubeStrategyAnalysisForClient, getYoutubeStrategyContext } from "./youtube-strategy.service.js";
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
export const registerYoutubeStrategyRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/youtube-strategy-analyses", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getYoutubeStrategyContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            latestAnalysis: result.latestAnalysis,
            analyses: result.analyses,
            videoStates: result.videoStates,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/youtube-strategy-analyses", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = youtubeStrategyAnalyzeSchema.parse(request.body ?? {});
        const result = await createYoutubeStrategyAnalysisForClient({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: "draft",
            notes: payload.notes,
            funnelStage: payload.funnelStage,
            videoUrls: payload.videoUrls,
        });
        return successEnvelope({
            client: result.client,
            latestAnalysis: result.latestAnalysis,
            analyses: result.analyses,
            videoStates: result.videoStates,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
};
