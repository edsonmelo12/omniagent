import type { FastifyInstance } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../../shared/http/errors.js";
import { buildRequestContext } from "../../shared/http/request-context.js";
import { successEnvelope } from "../../shared/http/response-envelope.js";
import { requireAuthContext } from "../../shared/security/auth-context.js";
import { getDevSession } from "../../shared/security/dev-session.js";
import { assistantConsultSchema } from "./assistant.schemas.js";
import { consultClient } from "./assistant.service.js";

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

export const registerAssistantRoutes = (app: FastifyInstance) => {
  app.post("/api/v1/clients/:clientId/assistant", async (request) => {
    const context = buildRequestContext(request);
    const authContext = requireAuthContext(request);
    const agencyId = requireAgencyHeader(request);
    const { clientId } = request.params as { clientId: string };
    const payload = assistantConsultSchema.parse(request.body ?? {});
    const result = await consultClient({
      userId: authContext.userId,
      agencyId,
      clientId,
      question: payload.question,
      history: payload.history,
    });

    return successEnvelope(
      {
        client: result.client,
        question: result.question,
        answer: result.answer,
        summary: result.summary,
        recommendations: result.recommendations,
        risks: result.risks,
        nextQuestions: result.nextQuestions,
        sources: result.sources,
        context: result.context,
      },
      { requestId: context.requestId, agencyId },
    );
  });
};
