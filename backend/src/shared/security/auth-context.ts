import type { FastifyRequest } from "fastify";
import { env } from "../../app/env.js";
import { createError } from "../http/errors.js";
import { getDevSession } from "./dev-session.js";

export type AuthContext = {
  userId: string;
};

const parseDemoToken = (authorizationHeader: string | undefined): AuthContext | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token?.startsWith("demo:")) {
    return null;
  }

  const userId = token.slice("demo:".length).trim();

  return userId.length > 0 ? { userId } : null;
};

export const resolveAuthContext = (request: FastifyRequest): AuthContext | null => {
  const authorization = request.headers.authorization;
  return parseDemoToken(typeof authorization === "string" ? authorization : undefined);
};

export const requireAuthContext = (request: FastifyRequest): AuthContext => {
  const context = resolveAuthContext(request);

  if (!context) {
    if (env.NODE_ENV === "development") {
      const devSession = getDevSession();

      if (devSession) {
        return { userId: devSession.userId };
      }
    }

    throw createError("UNAUTHORIZED", "Authentication required", 401);
  }

  return context;
};
