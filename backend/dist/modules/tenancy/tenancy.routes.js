import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { agencyCreateSchema } from "./tenancy.schemas.js";
import { createAgencyWorkspace, listAgencies } from "./tenancy.service.js";
import { resolveAuthContext, requireAuthContext } from "../../shared/security/auth-context.js";
export const registerTenancyRoutes = (app) => {
    app.get("/api/v1/agencies", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencies = await listAgencies(authContext.userId);
        return successEnvelope({
            agencies,
        }, { requestId: context.requestId });
    });
    app.post("/api/v1/agencies", async (request) => {
        const context = buildRequestContext(request);
        const payload = agencyCreateSchema.parse(request.body);
        const authContext = resolveAuthContext(request);
        const agency = await createAgencyWorkspace({
            ...payload,
            userId: authContext?.userId,
        });
        return successEnvelope({
            agency,
        }, { requestId: context.requestId });
    });
};
