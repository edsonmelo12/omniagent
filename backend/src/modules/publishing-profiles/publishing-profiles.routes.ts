import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { publishingProfileCreateSchema, publishingProfileUpdateSchema } from "./publishing-profiles.schemas.js";
import {
  createPublishingProfile,
  getPublishingProfilesContext,
  revisePublishingProfile,
  validatePublishingProfile,
} from "./publishing-profiles.service.js";

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

export const registerPublishingProfilesRoutes = (app: FastifyInstance) => {
  app.get("/api/v1/clients/:clientId/publishing-profiles", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getPublishingProfilesContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        publishingProfiles: result.profiles,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/publishing-profiles", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = publishingProfileCreateSchema.parse(request.body ?? {});
    const result = await createPublishingProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      channel: payload.channel,
      provider: payload.provider,
      accountLabel: payload.accountLabel,
      externalAccountId: payload.externalAccountId,
      secretRef: payload.secretRef,
      approvalMode: payload.approvalMode,
      publishMode: payload.publishMode,
      capabilities: payload.capabilities,
      constraints: payload.constraints,
    });

    return successEnvelope(
      {
        client: result.client,
        publishingProfile: result.profile,
        publishingProfiles: result.profiles,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId/publishing-profiles/:profileId", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, profileId } = request.params as { clientId: string; profileId: string };
    const payload = publishingProfileUpdateSchema.parse(request.body ?? {});
    const result = await revisePublishingProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      profileId,
      accountLabel: payload.accountLabel,
      externalAccountId: payload.externalAccountId,
      secretRef: payload.secretRef,
      connectionStatus: payload.connectionStatus,
      approvalMode: payload.approvalMode,
      publishMode: payload.publishMode,
      capabilities: payload.capabilities,
      constraints: payload.constraints,
      lastErrorCode: payload.lastErrorCode,
      lastErrorMessage: payload.lastErrorMessage,
    });

    return successEnvelope(
      {
        client: result.client,
        publishingProfile: result.profile,
        publishingProfiles: result.profiles,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/publishing-profiles/:profileId/validate", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, profileId } = request.params as { clientId: string; profileId: string };
    const result = await validatePublishingProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      profileId,
    });

    return successEnvelope(
      {
        client: result.client,
        publishingProfile: result.profile,
        validation: result.validation,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
