import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { clientRecordCreateSchema, clientRecordUpdateSchema } from "./client-record.schemas.js";
import { createClientRecord, getClientRecord, reviseClientRecord } from "./client-record.service.js";
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
const registerClientRecordLikeRoutes = (app, basePath) => {
    app.get(basePath, async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const result = await getClientRecord({
            userId: authContext.userId,
            agencyId,
            clientId,
        });
        return successEnvelope({
            client: result.client,
            latestClientRecord: result.latestClientRecord,
            brandProfile: result.brandProfile,
            latestBrandProfile: result.latestBrandProfile,
            brandProfiles: result.brandProfiles,
            creativeProfile: result.creativeProfile,
            latestCreativeProfile: result.latestCreativeProfile,
            creativeProfiles: result.creativeProfiles,
            primaryProduct: result.primaryProduct,
            offerProfile: result.offerProfile,
            offerProfiles: result.offerProfiles,
            snapshot: result.snapshot,
            profiles: result.profiles,
        }, { requestId: context.requestId, agencyId });
    });
    app.post(basePath, async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = clientRecordCreateSchema.parse(request.body ?? {});
        const result = await createClientRecord({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            note: payload.note,
        });
        return successEnvelope({
            client: result.client,
            clientRecord: result.clientRecord,
            clientRecords: result.clientRecords,
            brandProfile: result.brandProfile,
            brandProfiles: result.brandProfiles,
            creativeProfile: result.creativeProfile,
            creativeProfiles: result.creativeProfiles,
            primaryProduct: result.primaryProduct,
            offerProfile: result.offerProfile,
            offerProfiles: result.offerProfiles,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
    app.patch(basePath, async (request) => {
        const context = buildRequestContext(request);
        const authContext = requireAuthContext(request);
        const agencyId = requireAgencyHeader(request);
        const { clientId } = request.params;
        const payload = clientRecordUpdateSchema.parse(request.body ?? {});
        const result = await reviseClientRecord({
            userId: authContext.userId,
            agencyId,
            clientId,
            status: payload.status,
            note: payload.note,
            summaryOverride: payload.summaryOverride,
        });
        return successEnvelope({
            client: result.client,
            clientRecord: result.clientRecord,
            clientRecords: result.clientRecords,
            brandProfile: result.brandProfile,
            brandProfiles: result.brandProfiles,
            creativeProfile: result.creativeProfile,
            creativeProfiles: result.creativeProfiles,
            primaryProduct: result.primaryProduct,
            offerProfile: result.offerProfile,
            offerProfiles: result.offerProfiles,
            payload: result.payload,
        }, { requestId: context.requestId, agencyId });
    });
};
export const registerClientRecordRoutes = (app) => {
    registerClientRecordLikeRoutes(app, "/api/v1/clients/:clientId/client-record");
};
