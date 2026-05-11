import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { socialPresenceCaptureSchema, socialPresenceListSchema } from "./social-presence.schemas.js";
import { captureSocialPresence, getSocialPresenceContext, listSocialPresenceHistory } from "./social-presence.service.js";

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

export const registerSocialPresenceRoutes = (app: FastifyInstance) => {
  app.post("/api/v1/clients/:clientId/social-presence", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = socialPresenceCaptureSchema.parse(request.body ?? {});

    const result = await captureSocialPresence({
      userId: authContext.userId,
      agencyId,
      clientId,
      sourceSnapshotId: payload.sourceSnapshotId,
      note: payload.note,
      mode: payload.mode,
    });

    return successEnvelope(
      {
        client: result.client,
        profiles: result.profiles,
        observations: result.observations,
        snapshots: result.snapshots,
        latestSnapshots: result.latestSnapshots,
        summary: result.summary,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/social-presence", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const query = socialPresenceListSchema.parse(request.query ?? {});

    const result = await listSocialPresenceHistory({
      userId: authContext.userId,
      agencyId,
      clientId,
      platform: query.platform,
      status: query.status,
      from: query.from,
      to: query.to,
      limit: query.limit,
    });

    return successEnvelope(
      {
        client: result.client,
        snapshots: result.snapshots,
        latestSnapshots: result.latestSnapshots,
        summary: result.summary,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/social-presence/latest", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getSocialPresenceContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        profiles: result.profiles,
        latestSnapshots: result.latestSnapshots,
        summary: result.summary,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
