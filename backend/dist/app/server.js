import Fastify from "fastify";
import { env } from "./env.js";
import { registerRoutes } from "./routes.js";
import { errorEnvelope } from "../shared/http/response-envelope.js";
import { createError } from "../shared/http/errors.js";
import { logger } from "../shared/logging/logger.js";
import { initializeDevSession } from "../shared/security/dev-session.js";
import { startRenderedAssetQueueWorker } from "../modules/content/rendered-assets.service.js";
const resolveAppError = (error) => {
    if (typeof error === "object" && error !== null) {
        if ("statusCode" in error && typeof error.statusCode === "number") {
            return createError("APPLICATION_ERROR", error.message ?? "Unexpected error", error.statusCode);
        }
        // Handle Zod validation errors
        if ("name" in error && error.name === "ZodError") {
            return createError("VALIDATION_ERROR", "Invalid request payload", 400, error.issues);
        }
    }
    return createError("INTERNAL_ERROR", error instanceof Error ? error.message : "Unexpected error", 500);
};
export const buildApp = () => {
    const app = Fastify({
        logger: false,
    });
    app.setErrorHandler((error, request, reply) => {
        const appError = resolveAppError(error);
        logger.error("request failed", {
            requestId: request.headers["x-request-id"],
            url: request.url,
            error: appError,
        });
        reply.status(appError.statusCode).send(errorEnvelope(appError.code, appError.message, appError.details ?? [], {
            requestId: request.headers["x-request-id"] ?? null,
        }));
    });
    registerRoutes(app);
    return app;
};
export const start = async () => {
    const app = buildApp();
    await initializeDevSession();
    await app.listen({
        port: env.PORT,
        host: "0.0.0.0",
    });
    startRenderedAssetQueueWorker();
    logger.info("backend started", {
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
    });
};
