import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { loginSchema, bootstrapSchema } from "./auth.schemas.js";
import { anonymousLogin, bootstrap, login, me } from "./auth.service.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
export const registerAuthRoutes = (app) => {
    app.post("/api/v1/auth/bootstrap", async (request, reply) => {
        const context = buildRequestContext(request);
        const payload = bootstrapSchema.parse(request.body);
        const result = await bootstrap({
            agency: payload.agency,
            user: payload.user,
        });
        reply.header("x-request-id", context.requestId);
        return successEnvelope(result, { requestId: context.requestId });
    });
    app.post("/api/v1/auth/login", async (request, reply) => {
        const context = buildRequestContext(request);
        const payload = loginSchema.parse(request.body);
        const result = await login(payload);
        reply.header("x-request-id", context.requestId);
        return successEnvelope(result, { requestId: context.requestId });
    });
    app.post("/api/v1/auth/anonymous", async (request, reply) => {
        const context = buildRequestContext(request);
        const result = await anonymousLogin();
        reply.header("x-request-id", context.requestId);
        return successEnvelope(result, { requestId: context.requestId });
    });
    app.post("/api/v1/auth/logout", async (request, reply) => {
        const context = buildRequestContext(request);
        reply.header("x-request-id", context.requestId);
        return successEnvelope({ status: "ok" }, { requestId: context.requestId });
    });
    app.get("/api/v1/me", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const result = await me(authContext.userId);
        return successEnvelope(result, {
            requestId: context.requestId,
            agencyId: context.agencyId ?? null,
        });
    });
};
