import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { 
  createAssetIntent, 
  getAssetIntent,
  createVerdict,
  getVerdicts,
  createPublishingAsset,
  getPublishingAsset,
  listAssets,
  getAssetEvidenceSummary
} from "./atos-analista.service.js";
import {
  buildAssetCard,
  buildWeeklyOperationalReview,
  buildMonthlyPortfolioMemo
} from "./atos-analista.deliverables.js";

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

export const registerAtosAnalistaRoutes = (app: FastifyInstance) => {
  // Assets
  app.post("/api/v1/atos-analista/assets", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const result = await createPublishingAsset(request.body);
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  app.get("/api/v1/atos-analista/clients/:clientId/assets", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await listAssets(clientId);
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  // Intents
  app.post("/api/v1/atos-analista/intents", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const result = await createAssetIntent(request.body);
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  app.get("/api/v1/atos-analista/intents/:assetId", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const { assetId } = request.params as { assetId: string };
    const result = await getAssetIntent(assetId);
    if (!result) throw createError("NOT_FOUND", "Intent not found", 404);
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  // Evidence Bridge
  app.get("/api/v1/atos-analista/clients/:clientId/assets/:assetId/evidence", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, assetId } = request.params as { clientId: string; assetId: string };
    const result = await getAssetEvidenceSummary({
      userId: authContext.userId,
      agencyId,
      clientId,
      assetId
    });
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  // Verdicts
  app.post("/api/v1/atos-analista/verdicts", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const result = await createVerdict(request.body);
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  app.get("/api/v1/atos-analista/verdicts/:targetType/:targetId", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const { targetType, targetId } = request.params as { targetType: string; targetId: string };
    const result = await getVerdicts(targetType, targetId);
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  // Deliverables
  app.get("/api/v1/atos-analista/clients/:clientId/assets/:assetId/card", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, assetId } = request.params as { clientId: string; assetId: string };
    const result = await buildAssetCard({
      userId: requireAuthContext(request).userId,
      agencyId,
      clientId,
      assetId
    });
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  app.get("/api/v1/atos-analista/clients/:clientId/weekly-review", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await buildWeeklyOperationalReview({
      userId: requireAuthContext(request).userId,
      agencyId,
      clientId
    });
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });

  app.get("/api/v1/atos-analista/clients/:clientId/monthly-memo", async (request) => {
    const context = buildRequestContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await buildMonthlyPortfolioMemo({
      userId: requireAuthContext(request).userId,
      agencyId,
      clientId
    });
    return successEnvelope(result, { requestId: context.requestId, agencyId });
  });
};
