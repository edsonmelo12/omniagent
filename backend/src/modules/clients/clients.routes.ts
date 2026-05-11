import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { clientCreateSchema, clientQuerySchema, clientUpdateSchema } from "./clients.schemas.js";
import { createClientWorkspace, deleteClientWorkspace, getClient, listClients, reviseClientWorkspace } from "./clients.service.js";

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

export const registerClientsRoutes = (app: FastifyInstance) => {
  app.get("/api/v1/clients", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const query = clientQuerySchema.parse(request.query);
    const clients = await listClients({
      userId: authContext.userId,
      agencyId,
      search: query.search,
      limit: query.limit,
    });

    return successEnvelope(
      {
        clients,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.post("/api/v1/clients", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const payload = clientCreateSchema.parse(request.body);
    const client = await createClientWorkspace({
      userId: authContext.userId,
      agencyId,
      name: payload.name,
      slug: payload.slug,
      segment: payload.segment,
      websiteUrl: payload.websiteUrl,
      notes: payload.notes,
    });

    return successEnvelope(
      {
        client,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.get("/api/v1/clients/:clientId", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const client = await getClient({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.patch("/api/v1/clients/:clientId", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = clientUpdateSchema.parse(request.body ?? {});
    const client = await reviseClientWorkspace({
      userId: authContext.userId,
      agencyId,
      clientId,
      name: payload.name,
      slug: payload.slug,
      segment: payload.segment,
      websiteUrl: payload.websiteUrl,
      notes: payload.notes,
    });

    return successEnvelope(
      {
        client,
      },
      { requestId: context.requestId, agencyId },
    );
  });

  app.delete("/api/v1/clients/:clientId", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const client = await deleteClientWorkspace({
      userId: authContext.userId,
      agencyId,
      clientId,
    });

    return successEnvelope(
      {
        client,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
