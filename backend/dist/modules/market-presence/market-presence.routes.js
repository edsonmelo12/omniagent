import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { marketPresenceBaselineCreateSchema, marketPresenceCheckpointCreateSchema, marketPresenceCompareSchema, marketPresenceInterventionCreateSchema, } from "./market-presence.schemas.js";
import { compareMarketPresence, createMarketPresenceBaseline, createMarketPresenceCheckpoint, createMarketPresenceInterventionRecord, getMarketPresenceContext, } from "./market-presence.service.js";
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
export const registerMarketPresenceRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/market-presence", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getMarketPresenceContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            latestBaseline: result.latestBaseline,
            latestIntervention: result.latestIntervention,
            latestCheckpoint: result.latestCheckpoint,
            latestComparison: result.latestComparison,
            baselines: result.baselines,
            interventions: result.interventions,
            checkpoints: result.checkpoints,
            comparisons: result.comparisons,
            snapshot: result.snapshot,
            clientRecord: result.clientRecord,
            marketResearch: result.marketResearch,
            profiles: result.profiles,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/market-presence/baselines", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = marketPresenceBaselineCreateSchema.parse(request.body ?? {});
        const result = await createMarketPresenceBaseline({
            userId: authContext.userId,
            agencyId,
            clientId,
            scope: payload.scope,
            marketContext: payload.marketContext,
            sourceSnapshotId: payload.sourceSnapshotId,
            sourceClientRecordId: payload.sourceClientRecordId,
            sourceMarketResearchId: payload.sourceMarketResearchId,
            evidenceUrls: payload.evidenceUrls,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            baseline: result.baseline,
            baselines: result.baselines,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/market-presence/interventions", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = marketPresenceInterventionCreateSchema.parse(request.body ?? {});
        const result = await createMarketPresenceInterventionRecord({
            userId: authContext.userId,
            agencyId,
            clientId,
            baselineId: payload.baselineId,
            periodStart: payload.periodStart,
            periodEnd: payload.periodEnd,
            actionsTaken: payload.actionsTaken,
            channelsEdited: payload.channelsEdited,
            contentVolume: payload.contentVolume,
            ctaChanges: payload.ctaChanges,
            siteChanges: payload.siteChanges,
            proofChanges: payload.proofChanges,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            baseline: result.baseline,
            intervention: result.intervention,
            interventions: result.interventions,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/market-presence/checkpoints", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = marketPresenceCheckpointCreateSchema.parse(request.body ?? {});
        const result = await createMarketPresenceCheckpoint({
            userId: authContext.userId,
            agencyId,
            clientId,
            baselineId: payload.baselineId,
            interventionId: payload.interventionId,
            sourceSnapshotId: payload.sourceSnapshotId,
            sourceClientRecordId: payload.sourceClientRecordId,
            sourceMarketResearchId: payload.sourceMarketResearchId,
            collectedAt: payload.collectedAt,
            evidenceUrls: payload.evidenceUrls,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            baseline: result.baseline,
            intervention: result.intervention,
            checkpoint: result.checkpoint,
            comparison: result.comparison,
            checkpoints: result.checkpoints,
            comparisons: result.comparisons,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/market-presence/compare", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = marketPresenceCompareSchema.parse(request.body ?? {});
        const result = await compareMarketPresence({
            userId: authContext.userId,
            agencyId,
            clientId,
            baselineId: payload.baselineId,
            checkpointId: payload.checkpointId,
        });
        return successEnvelope({
            client: result.client,
            baseline: result.baseline,
            checkpoint: result.checkpoint,
            comparison: result.comparison,
            comparisons: result.comparisons,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
};
