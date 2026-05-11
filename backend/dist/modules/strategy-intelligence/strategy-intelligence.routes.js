import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { strategyIntelligenceLoadSchema, strategyRecommendationSchema } from "./strategy-intelligence.schemas.js";
import { getStrategyIntelligenceByAssetId, listStrategyIntelligenceForClient, persistStrategyIntelligenceFromYoutubeAnalysis, recommendStrategyForClient, } from "./strategy-intelligence.service.js";
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
export const registerStrategyIntelligenceRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/strategy-intelligence", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await listStrategyIntelligenceForClient({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            title: result.title,
            assets: result.assets,
            evidence: result.evidence,
            latestVersion: result.latestVersion,
            recommendation: result.recommendation,
            activeProduct: result.activeProduct,
            source: result.source,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/strategy-intelligence", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = strategyIntelligenceLoadSchema.parse(request.body ?? {});
        if (!payload.sourceAnalysisId) {
            throw createError("BAD_REQUEST", "sourceAnalysisId is required", 400);
        }
        const result = await persistStrategyIntelligenceFromYoutubeAnalysis({
            userId: authContext.userId,
            agencyId,
            clientId,
            sourceAnalysisId: payload.sourceAnalysisId,
        });
        return successEnvelope({
            title: result.title,
            assets: result.assets,
            evidence: result.evidence,
            latestVersion: result.latestVersion,
            recommendation: result.recommendation,
            activeProduct: result.activeProduct,
            source: result.source,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/strategy-recommendations", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = strategyRecommendationSchema.parse(request.body ?? {});
        const result = await recommendStrategyForClient({
            userId: authContext.userId,
            agencyId,
            clientId,
            productId: payload.productId,
            campaignObjective: payload.campaignObjective,
            productContext: payload.productContext,
            serviceContext: payload.serviceContext,
            audienceContext: payload.audienceContext,
            funnelStage: payload.funnelStage,
        });
        return successEnvelope({
            title: result.title,
            assets: result.assets,
            evidence: result.evidence,
            latestVersion: result.latestVersion,
            recommendation: result.recommendation,
            activeProduct: result.activeProduct,
            source: result.source,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.get("/api/v1/strategy-intelligence/:assetId", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { assetId } = request.params;
        const result = await getStrategyIntelligenceByAssetId({
            userId: authContext.userId,
            agencyId,
            assetId,
        });
        return successEnvelope({
            title: result.title,
            asset: result.asset,
            source: result.source,
        }, { requestId: context.requestId, agencyId });
    });
};
