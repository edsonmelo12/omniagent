import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

export type RequestContext = {
  requestId: string;
  agencyId?: string;
};

export const buildRequestContext = (request: FastifyRequest): RequestContext => {
  const headerRequestId = request.headers["x-request-id"];
  const requestId = typeof headerRequestId === "string" && headerRequestId.length > 0 ? headerRequestId : randomUUID();
  const agencyIdHeader = request.headers["x-agency-id"];

  return {
    requestId,
    agencyId: typeof agencyIdHeader === "string" && agencyIdHeader.length > 0 ? agencyIdHeader : undefined,
  };
};

export const attachContextHeaders = (reply: FastifyReply, context: RequestContext) => {
  reply.header("x-request-id", context.requestId);
  if (context.agencyId) {
    reply.header("x-agency-id", context.agencyId);
  }
};
