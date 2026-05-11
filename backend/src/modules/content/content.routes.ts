import type { FastifyInstance } from "fastify";
import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { contentPlanCreateSchema, contentPlanUpdateSchema, scheduleCreateSchema, scheduleUpdateSchema } from "./content.schemas.js";
import { createContentPlan, createSchedule, getContentContext, reviseContentPlan, reviseSchedule } from "./content.service.js";
import { createPostArtGalleryRow } from "./post-art-gallery.repository.js";
import { buildPostArtGallery } from "./post-art-gallery.service.js";
import {
  findRenderedAssetById,
  getRenderedAssetFileInfo,
  hasRenderedAssetFile,
  hasRenderedAssetSoundtrack,
  hasRenderedAssetSubtitle,
  regenerateRenderedAssetForClient,
  refreshRenderedAssetsForClient,
} from "./rendered-assets.service.js";

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

export const registerContentRoutes = (app: FastifyInstance) => {
  const setAttachmentDownloadHeaders = (reply: { header: (name: string, value: string) => void }, filePath: string) => {
    reply.header("content-disposition", `attachment; filename="${basename(filePath)}"`);
  };

  app.get("/api/v1/clients/:clientId/content", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const result = await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: result.client,
        contentPlan: result.contentPlan,
        contentPackage: result.contentPackage,
        contentPlans: result.contentPlans,
        contentPackages: result.contentPackages,
        schedules: result.schedules,
        renderedAsset: result.renderedAsset,
        renderedAssets: result.renderedAssets,
        postArtGallery: result.postArtGallery,
        postArtGalleries: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
        clientRecord: result.clientRecord,
        brandProfile: result.brandProfile,
        primaryProduct: result.primaryProduct,
        offerProfile: result.offerProfile,
        offerProfiles: result.offerProfiles,
        marketResearch: result.marketResearch,
        editorialPautas: result.editorialPautas,
        proposal: result.proposal,
        snapshot: result.snapshot,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/content-plan", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = contentPlanCreateSchema.parse(request.body ?? {});
    const result = await createContentPlan({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      objective: payload.objective,
    });

    return successEnvelope(
      {
        client: result.client,
        contentPlan: result.contentPlan,
        contentPackage: result.contentPackage,
        contentPlans: result.contentPlans,
        contentPackages: result.contentPackages,
        renderedAsset: result.renderedAsset,
        renderedAssets: result.renderedAssets,
        postArtGallery: result.postArtGallery,
        postArtGalleries: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
        clientRecord: result.clientRecord,
        brandProfile: result.brandProfile,
        primaryProduct: result.primaryProduct,
        offerProfile: result.offerProfile,
        marketResearch: result.marketResearch,
        editorialPautas: result.editorialPautas,
        proposal: result.proposal,
        snapshot: result.snapshot,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId/content-plan", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = contentPlanUpdateSchema.parse(request.body ?? {});
    const result = await reviseContentPlan({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      objective: payload.objective,
      note: payload.note,
    });

    return successEnvelope(
      {
        client: result.client,
        contentPlan: result.contentPlan,
        contentPackage: result.contentPackage,
        contentPlans: result.contentPlans,
        contentPackages: result.contentPackages,
        renderedAsset: result.renderedAsset,
        renderedAssets: result.renderedAssets,
        postArtGallery: result.postArtGallery,
        postArtGalleries: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
        clientRecord: result.clientRecord,
        brandProfile: result.brandProfile,
        primaryProduct: result.primaryProduct,
        offerProfile: result.offerProfile,
        marketResearch: result.marketResearch,
        editorialPautas: result.editorialPautas,
        proposal: result.proposal,
        snapshot: result.snapshot,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/schedules", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = scheduleCreateSchema.parse(request.body ?? {});
    const result = await createSchedule({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate,
    });

    return successEnvelope(
      {
        client: result.client,
        contentPlan: result.contentPlan,
        schedule: result.schedule,
        schedules: result.schedules,
        payload: result.payload,
        renderedAsset: result.renderedAsset,
        renderedAssets: result.renderedAssets,
        postArtGallery: result.postArtGallery,
        postArtGalleries: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId/schedules", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = scheduleUpdateSchema.parse(request.body ?? {});
    const result = await reviseSchedule({
      userId: authContext.userId,
      agencyId,
      clientId,
      status: payload.status,
      startDate: payload.startDate,
      endDate: payload.endDate,
      note: payload.note,
    });

    return successEnvelope(
      {
        client: result.client,
        contentPlan: result.contentPlan,
        schedule: result.schedule,
        schedules: result.schedules,
        payload: result.payload,
        renderedAsset: result.renderedAsset,
        renderedAssets: result.renderedAssets,
        postArtGallery: result.postArtGallery,
        postArtGalleries: result.postArtGalleries,
        postArtGalleryComparison: result.postArtGalleryComparison,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/rendered-assets", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const content = await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: content.client,
        renderedAsset: content.renderedAsset,
        renderedAssets: content.renderedAssets,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/rendered-assets/refresh", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };

    await refreshRenderedAssetsForClient({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    const content = await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: content.client,
        contentPlan: content.contentPlan,
        contentPackage: content.contentPackage,
        contentPlans: content.contentPlans,
        contentPackages: content.contentPackages,
        schedules: content.schedules,
        renderedAsset: content.renderedAsset,
        renderedAssets: content.renderedAssets,
        postArtGallery: content.postArtGallery,
        postArtGalleries: content.postArtGalleries,
        postArtGalleryComparison: content.postArtGalleryComparison,
        clientRecord: content.clientRecord,
        marketResearch: content.marketResearch,
        editorialPautas: content.editorialPautas,
        proposal: content.proposal,
        snapshot: content.snapshot,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/rendered-assets/:renderedAssetId/regenerate", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, renderedAssetId } = request.params as { clientId: string; renderedAssetId: string };
    const payload =
      typeof request.body === "object" && request.body !== null
        ? (request.body as { mode?: "auto" | "alternate" | "revision"; revisionNote?: string | null })
        : {};

    await regenerateRenderedAssetForClient({
      userId: authContext.userId,
      agencyId,
      clientId,
      renderedAssetId,
      mode: payload.mode ?? "auto",
      revisionNote: payload.revisionNote ?? null,
    });

    const content = await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: content.client,
        contentPlan: content.contentPlan,
        contentPackage: content.contentPackage,
        contentPlans: content.contentPlans,
        contentPackages: content.contentPackages,
        schedules: content.schedules,
        renderedAsset: content.renderedAsset,
        renderedAssets: content.renderedAssets,
        postArtGallery: content.postArtGallery,
        postArtGalleries: content.postArtGalleries,
        postArtGalleryComparison: content.postArtGalleryComparison,
        clientRecord: content.clientRecord,
        marketResearch: content.marketResearch,
        editorialPautas: content.editorialPautas,
        proposal: content.proposal,
        snapshot: content.snapshot,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients/:clientId/post-art-gallery", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = typeof request.body === "object" && request.body !== null ? (request.body as { mode?: "feed_carousel" | "story" | "all" }) : {};

    const content = await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    const gallery = buildPostArtGallery({
      clientId: content.client.id,
      clientName: content.client.name,
      contentPackage: content.contentPackage,
      schedule: content.schedules[0] ?? null,
      mode: payload.mode,
    });

    await createPostArtGalleryRow({
      clientId: content.client.id,
      mode: gallery.mode,
      title: gallery.title,
      summary: gallery.summary,
      overallScore: gallery.overallScore,
      payload: gallery,
    });

    const refreshedContent = await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client: refreshedContent.client,
        postArtGallery: refreshedContent.postArtGallery,
        postArtGalleries: refreshedContent.postArtGalleries,
        postArtGalleryComparison: refreshedContent.postArtGalleryComparison,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId/rendered-assets/:renderedAssetId/file", async (request, reply) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, renderedAssetId } = request.params as { clientId: string; renderedAssetId: string };
    await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    const renderedAsset = await findRenderedAssetById(renderedAssetId);

    if (!renderedAsset || renderedAsset.client_id !== clientId) {
      throw createError("NOT_FOUND", "Rendered asset not found", 404);
    }

    const fileInfo = getRenderedAssetFileInfo(renderedAsset);

    if (fileInfo.assetPath && hasRenderedAssetFile(renderedAsset)) {
      reply.header("x-request-id", context.requestId);
      reply.type(fileInfo.assetMimeType);
      setAttachmentDownloadHeaders(reply, fileInfo.assetPath);
      return reply.send(createReadStream(fileInfo.assetPath));
    }

    if (typeof renderedAsset.html_content === "string" && renderedAsset.html_content.length > 0) {
      reply.header("x-request-id", context.requestId);
      reply.type("text/html; charset=utf-8");
      return reply.send(renderedAsset.html_content);
    }

    throw createError("NOT_FOUND", "Rendered asset file not available", 404);
  });

  app.get("/api/v1/clients/:clientId/rendered-assets/:renderedAssetId/subtitles", async (request, reply) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, renderedAssetId } = request.params as { clientId: string; renderedAssetId: string };
    await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    const renderedAsset = await findRenderedAssetById(renderedAssetId);

    if (!renderedAsset || renderedAsset.client_id !== clientId) {
      throw createError("NOT_FOUND", "Rendered asset not found", 404);
    }

    const fileInfo = getRenderedAssetFileInfo(renderedAsset);

    if (fileInfo.subtitlePath && hasRenderedAssetSubtitle(renderedAsset)) {
      reply.header("x-request-id", context.requestId);
      reply.type("text/plain; charset=utf-8");
      setAttachmentDownloadHeaders(reply, fileInfo.subtitlePath);
      return reply.send(createReadStream(fileInfo.subtitlePath));
    }

    throw createError("NOT_FOUND", "Rendered asset subtitles not available", 404);
  });

  app.get("/api/v1/clients/:clientId/rendered-assets/:renderedAssetId/audio", async (request, reply) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId, renderedAssetId } = request.params as { clientId: string; renderedAssetId: string };
    await getContentContext({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    const renderedAsset = await findRenderedAssetById(renderedAssetId);

    if (!renderedAsset || renderedAsset.client_id !== clientId) {
      throw createError("NOT_FOUND", "Rendered asset not found", 404);
    }

    const fileInfo = getRenderedAssetFileInfo(renderedAsset);

    if (fileInfo.soundtrackPath && hasRenderedAssetSoundtrack(renderedAsset)) {
      reply.header("x-request-id", context.requestId);
      reply.type("audio/wav");
      setAttachmentDownloadHeaders(reply, fileInfo.soundtrackPath);
      return reply.send(createReadStream(fileInfo.soundtrackPath));
    }

    throw createError("NOT_FOUND", "Rendered asset audio not available", 404);
  });
};
