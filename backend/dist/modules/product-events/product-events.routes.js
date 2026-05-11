import { env } from "../../app/env.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { logger } from "../../shared/logging/logger.js";
import { getOfferEventMetrics, recordOfferEvent } from "./product-events.repository.js";
import { productEventMetricsQuerySchema, productEventSchema } from "./product-events.schemas.js";
const requireAgencyHeader = (request) => {
    const value = request.headers["x-agency-id"];
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }
    if (env.NODE_ENV === "development") {
        const devSession = getDevSession();
        if (devSession) {
            return devSession.agencyId;
        }
    }
    return null;
};
const normalizeEventName = (eventName) => {
    if (eventName.startsWith("offer_")) {
        return `product_${eventName.slice("offer_".length)}`;
    }
    return eventName;
};
export const registerProductEventRoutes = (app) => {
    app.post("/api/v1/events", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const payload = productEventSchema.parse(request.body ?? {});
        const normalizedEventName = normalizeEventName(payload.eventName);
        try {
            await recordOfferEvent({
                agencyId,
                userId: authContext.userId,
                clientId: payload.clientId ?? null,
                eventName: normalizedEventName,
                source: payload.source ?? "dashboard",
                properties: payload.properties,
            });
        }
        catch (error) {
            logger.error("failed to persist product event", {
                requestId: context.requestId,
                userId: authContext.userId,
                agencyId,
                clientId: payload.clientId ?? null,
                eventName: normalizedEventName,
                source: payload.source ?? "dashboard",
                error,
            });
        }
        logger.info("product event", {
            requestId: context.requestId,
            userId: authContext.userId,
            agencyId,
            clientId: payload.clientId ?? null,
            eventName: normalizedEventName,
            source: payload.source ?? "dashboard",
            properties: payload.properties,
        });
        return successEnvelope({
            accepted: true,
        }, { requestId: context.requestId, agencyId });
    });
    app.get("/api/v1/events/metrics", async (request) => {
        const context = buildRequestContext(request);
        requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const query = productEventMetricsQuerySchema.parse(request.query ?? {});
        const metrics = await getOfferEventMetrics({
            agencyId: agencyId ?? null,
            clientId: query.clientId ?? null,
            windowDays: query.days,
        });
        return successEnvelope(metrics, { requestId: context.requestId, agencyId });
    });
};
