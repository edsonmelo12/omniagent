import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { brandProfileCreateSchema, brandProfileUpdateSchema } from "./brand-profile.schemas.js";
import { createBrandProfile, getBrandProfileContext, listBrandProfiles, reviseBrandProfile } from "./brand-profile.service.js";

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

export const registerBrandProfileRoutes = (app: FastifyInstance) => {
  app.get("/api/v1/clients/:clientId/brand-profile", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getBrandProfileContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        brandProfile: result.brandProfile,
        latestBrandProfile: result.latestBrandProfile,
        brandProfiles: result.brandProfiles,
        payload: result.payload,
        sources: result.sources,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/brand-profile", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = brandProfileCreateSchema.parse(request.body ?? {});
    const result = await createBrandProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      note: payload.note,
    });

    return successEnvelope(
      {
        client: result.client,
        brandProfile: result.brandProfile,
        brandProfiles: result.brandProfiles,
        payload: result.payload,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId/brand-profile", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = brandProfileUpdateSchema.parse(request.body ?? {});
    const result = await reviseBrandProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      note: payload.note,
      summaryOverride: payload.summaryOverride,
    });

    return successEnvelope(
      {
        client: result.client,
        brandProfile: result.brandProfile,
        brandProfiles: result.brandProfiles,
        payload: result.payload,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/brand-profiles", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await listBrandProfiles({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        brandProfiles: result.brandProfiles,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
