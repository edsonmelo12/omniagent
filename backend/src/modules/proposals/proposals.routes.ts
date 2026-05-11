import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { proposalCreateSchema, proposalUpdateSchema } from "./proposals.schemas.js";
import { createProposal, getProposalContext, reviseProposal } from "./proposals.service.js";

const requireAgencyHeader = (request: { headers: Record<string, unknown> }) => {
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

export const registerProposalRoutes = (app: FastifyInstance) => {
  app.get("/api/v1/clients/:clientId/proposals", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getProposalContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        clientRecord: result.clientRecord,
        snapshot: result.snapshot,
        marketResearch: result.marketResearch,
        creativeProfile: result.creativeProfile,
        brandProfile: result.brandProfile,
        primaryProduct: result.primaryProduct,
        offerProfile: result.offerProfile,
        proposalBrief: result.proposalBrief,
        proposals: result.proposals,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/proposals", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = proposalCreateSchema.parse(request.body ?? {});
    const result = await createProposal({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
    });

    return successEnvelope(
      {
        client: result.client,
        clientRecord: result.clientRecord,
        snapshot: result.snapshot,
        marketResearch: result.marketResearch,
        proposal: result.proposal,
        proposals: result.proposals,
        payload: result.payload,
        creativeProfile: result.creativeProfile,
        brandProfile: result.brandProfile,
        primaryProduct: result.primaryProduct,
        offerProfile: result.offerProfile,
        proposalBrief: result.payload.proposalBrief ?? null,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId/proposals", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = proposalUpdateSchema.parse(request.body ?? {});
    const result = await reviseProposal({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      thesisOverride: payload.thesisOverride,
      note: payload.note,
    });

    return successEnvelope(
      {
        client: result.client,
        clientRecord: result.clientRecord,
        snapshot: result.snapshot,
        marketResearch: result.marketResearch,
        proposal: result.proposal,
        proposals: result.proposals,
        payload: result.payload,
        creativeProfile: result.creativeProfile,
        brandProfile: result.brandProfile,
        primaryProduct: result.primaryProduct,
        offerProfile: result.offerProfile,
        proposalBrief: result.payload.proposalBrief ?? null,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
