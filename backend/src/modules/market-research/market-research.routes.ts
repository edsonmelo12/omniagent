import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { marketResearchCreateSchema, marketResearchUpdateSchema } from "./market-research.schemas.js";
import { createMarketResearch, getMarketResearchContext, reviseMarketResearch } from "./market-research.service.js";

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

export const registerMarketResearchRoutes = (app: FastifyInstance) => {
  app.get("/api/v1/clients/:clientId/market-research", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getMarketResearchContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        latestMarketResearch: result.latestMarketResearch,
        marketResearches: result.marketResearches,
        clientRecord: result.clientRecord,
        snapshot: result.snapshot,
        profiles: result.profiles,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/market-research", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = marketResearchCreateSchema.parse(request.body ?? {});
    const result = await createMarketResearch({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      publicOnly: payload.publicOnly,
      confidence: payload.confidence,
      sourceUrls: payload.sourceUrls,
      competitorUrls: payload.competitorUrls,
      marketContext: payload.marketContext,
      note: payload.note,
    });

    return successEnvelope(
      {
        client: result.client,
        marketResearch: result.marketResearch,
        marketResearches: result.marketResearches,
        payload: result.payload,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId/market-research", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = marketResearchUpdateSchema.parse(request.body ?? {});
    const result = await reviseMarketResearch({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      publicOnly: payload.publicOnly,
      confidence: payload.confidence,
      sourceUrls: payload.sourceUrls,
      competitorUrls: payload.competitorUrls,
      marketContext: payload.marketContext,
      note: payload.note,
      summaryOverride: payload.summaryOverride,
    });

    return successEnvelope(
      {
        client: result.client,
        marketResearch: result.marketResearch,
        marketResearches: result.marketResearches,
        payload: result.payload,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
