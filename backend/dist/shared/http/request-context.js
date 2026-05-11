import { randomUUID } from "node:crypto";
export const buildRequestContext = (request) => {
    const headerRequestId = request.headers["x-request-id"];
    const requestId = typeof headerRequestId === "string" && headerRequestId.length > 0 ? headerRequestId : randomUUID();
    const agencyIdHeader = request.headers["x-agency-id"];
    return {
        requestId,
        agencyId: typeof agencyIdHeader === "string" && agencyIdHeader.length > 0 ? agencyIdHeader : undefined,
    };
};
export const attachContextHeaders = (reply, context) => {
    reply.header("x-request-id", context.requestId);
    if (context.agencyId) {
        reply.header("x-agency-id", context.agencyId);
    }
};
