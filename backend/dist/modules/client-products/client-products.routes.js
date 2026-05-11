import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { productCreateSchema, productUpdateSchema } from "./client-products.schemas.js";
import { activateProduct, createProduct, deleteProduct, getProductsContext, reviseProduct } from "./client-products.service.js";
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
export const registerClientProductsRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/products", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getProductsContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        const offer = result.products.find((product) => product.is_active) ?? result.products[0] ?? null;
        return successEnvelope({
            client: result.client,
            offer,
            offers: result.products,
            products: result.products,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/products", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = productCreateSchema.parse(request.body ?? {});
        const result = await createProduct({
            userId: authContext.userId,
            agencyId,
            clientId,
            name: payload.name,
            slug: payload.slug,
            category: payload.category,
            offerType: payload.offerType,
            priceLabel: payload.priceLabel,
            promise: payload.promise,
            problemSolved: payload.problemSolved,
            audience: payload.audience,
            status: payload.status,
            priority: payload.priority,
            landingUrl: payload.landingUrl,
            proofPoints: payload.proofPoints,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            offer: result.product,
            offers: result.products,
            product: result.product,
            products: result.products,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch("/api/v1/products/:productId", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { productId } = request.params;
        const payload = productUpdateSchema.parse(request.body ?? {});
        const result = await reviseProduct({
            userId: authContext.userId,
            agencyId,
            productId,
            name: payload.name,
            slug: payload.slug,
            category: payload.category,
            offerType: payload.offerType,
            priceLabel: payload.priceLabel,
            promise: payload.promise,
            problemSolved: payload.problemSolved,
            audience: payload.audience,
            status: payload.status,
            priority: payload.priority,
            landingUrl: payload.landingUrl,
            proofPoints: payload.proofPoints,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            offer: result.product,
            offers: result.products,
            product: result.product,
            products: result.products,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch("/api/v1/products/:productId/focus", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { productId } = request.params;
        const result = await activateProduct({
            userId: authContext.userId,
            agencyId,
            productId,
        });
        return successEnvelope({
            client: result.client,
            offer: result.product,
            offers: result.products,
            product: result.product,
            products: result.products,
        }, { requestId: context.requestId, agencyId });
    });
    app.delete("/api/v1/products/:productId", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { productId } = request.params;
        const result = await deleteProduct({
            userId: authContext.userId,
            agencyId,
            productId,
        });
        return successEnvelope({
            client: result.client,
            product: result.product,
            products: result.products,
        }, { requestId: context.requestId, agencyId });
    });
};
