import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { approvalCreateSchema } from "./approvals.schemas.js";
import { createApproval, getApprovals, setApprovalStatus } from "./approvals.service.js";
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
export const registerApprovalsRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/approvals", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getApprovals({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            approvals: result.approvals,
        }, { requestId: context.requestId, agencyId });
    });
    app.post("/api/v1/clients/:clientId/approvals", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = approvalCreateSchema.parse(request.body ?? {});
        const result = await createApproval({
            userId: authContext.userId,
            agencyId,
            clientId,
            artifactType: payload.artifactType,
            artifactId: payload.artifactId,
            status: payload.status,
            notes: payload.notes,
        });
        return successEnvelope({
            client: result.client,
            approval: result.approval,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch("/api/v1/approvals/:approvalId", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { approvalId } = request.params;
        const body = request.body;
        const result = await setApprovalStatus({
            userId: authContext.userId,
            agencyId,
            approvalId,
            status: body?.status ?? "pending",
            notes: body?.notes,
        });
        return successEnvelope({
            approval: result,
        }, { requestId: context.requestId, agencyId });
    });
};
