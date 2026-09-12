import type { NextFunction, Request, Response } from "express";
import { buildJwksUrl, verifyAccessToken } from "@repo/auth-middleware";
import logger from "./logger";

const JWKS_URL = buildJwksUrl(process.env.AUTH_SERVICE_INTERNAL_URL || "");

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header",
      },
    });
    return;
  }

  try {
    const payload = await verifyAccessToken({
      jwksUrl: JWKS_URL,
      token: authHeader.slice(7),
    });

    res.locals.userId = payload.sub;
    res.locals.role = payload.role === "admin" ? "admin" : "user";

    next();
  } catch (err) {
    logger.warn(`JWT verification failed: ${(err as Error).message}`);
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }
};

export const requireAdmin = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.locals.role !== "admin") {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      },
    });
    return;
  }
  next();
};