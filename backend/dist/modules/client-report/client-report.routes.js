import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { getClientReportContext } from "./client-report.service.js";
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
export const registerClientReportRoutes = (app) => {
    app.get("/api/v1/clients/:clientId/report", async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getClientReportContext({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            clientRecord: result.clientRecord,
            marketResearch: result.marketResearch,
            marketPresence: result.marketPresence,
            socialPresence: result.socialPresence,
            brandProfile: result.brandProfile,
            primaryProduct: result.primaryProduct,
            offerProfile: result.offerProfile,
            offerProfiles: result.offerProfiles,
            creativeProfile: result.creativeProfile,
            creativeProfiles: result.creativeProfiles,
            proposal: result.proposal,
            monitoring: result.monitoring,
            report: result.report,
        }, { requestId: context.requestId, agencyId });
    });
};
