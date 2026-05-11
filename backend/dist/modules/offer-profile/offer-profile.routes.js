import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { findClientById } from "../clients/clients.repository.js";
import { findProductById } from "../client-products/client-products.repository.js";
import { syncOfferProfileFromProduct, getOfferProfileForProduct, getOfferProfilesContext } from "./offer-profile.service.js";
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
export const registerOfferProfileRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/offer-profiles", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getOfferProfilesContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            offerProfile: result.offerProfile,
            offerProfiles: result.offerProfiles,
        }, { requestId: context.requestId, agencyId });
    });
    app.get("/api/v1/products/:productId/offer-profile", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { productId } = request.params;
        const result = await getOfferProfileForProduct({
            userId: authContext.userId,
            agencyId,
            productId,
        });
        return successEnvelope({
            client: result.client,
            product: result.product,
            offerProfile: result.offerProfile,
            offerProfiles: result.offerProfiles,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/products/:productId/offer-profile/refresh", async (request) => {
        const context = buildRequestContext(request);
        requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { productId } = request.params;
        const product = await findProductById(productId);
        if (!product) {
            throw createError("NOT_FOUND", "Product not found", 404);
        }
        const client = await findClientById(agencyId, product.client_id);
        if (!client) {
            throw createError("NOT_FOUND", "Client not found", 404);
        }
        const result = await syncOfferProfileFromProduct({
            client,
            product,
            brandProfile: null,
        });
        return successEnvelope({
            offerProfile: result,
        }, { requestId: context.requestId, agencyId });
    });
};
