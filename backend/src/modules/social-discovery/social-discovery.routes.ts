import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { discoveryRequestSchema } from "./social-discovery.schemas.js";
import { discoverSocialProfiles } from "./social-discovery.service.js";
import { listSocialProfilesByClientId } from "./social-discovery.repository.js";

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

export const registerSocialDiscoveryRoutes = (app: FastifyInstance) => {
  app.post("/api/v1/clients/:clientId/discovery", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = discoveryRequestSchema.parse(request.body ?? {});

    const result = await discoverSocialProfiles({
      userId: authContext.userId,
      agencyId,
      clientId,
      sourceUrls: payload.sourceUrls,
      discoveredProfiles: payload.discoveredProfiles,
    });

    return successEnvelope(
      {
        client: result.client,
        sourceUrls: result.sourceUrls,
        discoveredProfiles: result.discoveredProfiles,
        profiles: result.profiles,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/social-profiles", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const profiles = await listSocialProfilesByClientId(clientId);

    return successEnvelope(
      {
        profiles,
      },
      { requestId: context.requestId, agencyId, userId: authContext.userId },
    );
  });
};
