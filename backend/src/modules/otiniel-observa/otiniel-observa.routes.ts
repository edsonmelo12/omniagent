import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import {
  observationCollectionRunQuerySchema,
  manualObservationIntakeSchema,
  observationProfileCreateSchema,
  observationProfileUpdateSchema,
  observationProfileValidateSchema,
  observationCollectionTriggerSchema,
  observationSummaryGenerateSchema,
  observationSummaryQuerySchema,
} from "./otiniel-observa.schemas.js";
import {
  createObservationProfile,
  getCollectionRunDetails,
  generateObservationSummaries,
  getObservationCoverage,
  getObservationReadinessChecklist,
  backfillObservationSummaries,
  listObservationProfiles,
  listCollectionRuns,
  listObservationSummaries,
  submitManualObservationIntake,
  triggerCollectionRun,
  updateObservationProfile,
  validateObservationProfile,
} from "./otiniel-observa.service.js";

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

export const registerOtinielObservaRoutes = (app: FastifyInstance) => {
  app.get("/api/v1/clients/:clientId/observation-profiles", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await listObservationProfiles({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope({ client: result.client, profiles: result.profiles }, { requestId: context.requestId, agencyId });
  });

  app.post("/api/v1/clients/:clientId/observation-profiles", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = observationProfileCreateSchema.parse(request.body ?? {});
    const result = await createObservationProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      provider: payload.provider,
      channel: payload.channel,
      profileType: payload.profileType,
      accountRef: payload.accountRef,
      propertyRef: payload.propertyRef,
      organizationRef: payload.organizationRef,
      displayName: payload.displayName,
      secretRef: payload.secretRef,
      status: payload.status,
      scopes: payload.scopes,
      connectionMetadata: payload.connectionMetadata,
    });

    return successEnvelope({ client: result.client, profile: result.profile }, { requestId: context.requestId, agencyId });
  });

  app.patch("/api/v1/clients/:clientId/observation-profiles/:profileId", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, profileId } = request.params as { clientId: string; profileId: string };
    const payload = observationProfileUpdateSchema.parse(request.body ?? {});
    const result = await updateObservationProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      profileId,
      displayName: payload.displayName,
      status: payload.status,
      propertyRef: payload.propertyRef,
      organizationRef: payload.organizationRef,
      scopes: payload.scopes,
      connectionMetadata: payload.connectionMetadata,
      secretRef: payload.secretRef,
    });

    return successEnvelope({ client: result.client, profile: result.profile }, { requestId: context.requestId, agencyId });
  });

  app.post("/api/v1/clients/:clientId/observation-profiles/:profileId/validate", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, profileId } = request.params as { clientId: string; profileId: string };
    observationProfileValidateSchema.parse(request.body ?? {});
    const result = await validateObservationProfile({
      userId: authContext.userId,
      agencyId,
      clientId,
      profileId,
    });

    return successEnvelope(
      {
        client: result.client,
        profile: result.profile,
        validation: result.validation,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/observation-profiles/:profileId/collect", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, profileId } = request.params as { clientId: string; profileId: string };
    const payload = observationCollectionTriggerSchema.parse(request.body ?? {});
    const result = await triggerCollectionRun({
      userId: authContext.userId,
      agencyId,
      clientId,
      profileId,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      mode: payload.mode,
    });

    return successEnvelope(
      {
        client: result.client,
        profile: result.profile,
        run: result.run,
        secretResolved: result.secretResolved,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/observation-intake/manual", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = manualObservationIntakeSchema.parse(request.body ?? {});
    const result = await submitManualObservationIntake({
      userId: authContext.userId,
      agencyId,
      clientId,
      sourceType: payload.sourceType,
      providerName: payload.providerName,
      channel: payload.channel,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      observationProfileId: payload.observationProfileId,
      records: payload.records,
      notes: payload.notes,
    });

    return successEnvelope(
      {
        client: result.client,
        run: result.run,
        recordsReceived: result.recordsReceived,
        recordsNormalized: result.recordsNormalized,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/observation-summaries", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = observationSummaryQuerySchema.parse(request.query ?? {});
    const result = await listObservationSummaries({
      userId: authContext.userId,
      agencyId,
      clientId,
      windowType: payload.windowType,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      assetId: payload.assetId,
    });

    return successEnvelope(
      {
        client: result.client,
        summaries: result.summaries,
        requestedWindow: result.requestedWindow,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/observation-summaries/generate", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = observationSummaryGenerateSchema.parse(request.body ?? {});
    const result = await generateObservationSummaries({
      userId: authContext.userId,
      agencyId,
      clientId,
      windowType: payload.windowType,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      assetId: payload.assetId,
    });

    return successEnvelope(
      {
        client: result.client,
        summaries: result.summaries,
        requestedWindow: result.requestedWindow,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/observation-summaries/backfill", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = observationSummaryGenerateSchema.parse(request.body ?? {});
    const result = await backfillObservationSummaries({
      userId: authContext.userId,
      agencyId,
      clientId,
      windowType: payload.windowType,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      assetId: payload.assetId,
    });

    return successEnvelope(
      {
        client: result.client,
        summaries: result.summaries,
        backfillRun: result.backfillRun,
        requestedWindow: result.requestedWindow,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/observation-coverage", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getObservationCoverage({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        profiles: result.profiles,
        runs: result.runs,
        summaries: result.summaries,
        coverage: result.coverage,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/observation-readiness", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getObservationReadinessChecklist({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        checklist: result.checklist,
        ready: result.ready,
        summary: result.summary,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/collection-runs", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const query = observationCollectionRunQuerySchema.parse(request.query ?? {});
    const result = await listCollectionRuns({
      userId: authContext.userId,
      agencyId,
      clientId,
      profileId: query.profileId,
      status: query.status,
      limit: query.limit,
    });

    return successEnvelope(
      {
        client: result.client,
        runs: result.runs,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/collection-runs/:runId", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, runId } = request.params as { clientId: string; runId: string };
    const result = await getCollectionRunDetails({
      userId: authContext.userId,
      agencyId,
      clientId,
      runId,
    });

    return successEnvelope(
      {
        client: result.client,
        run: result.run,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
