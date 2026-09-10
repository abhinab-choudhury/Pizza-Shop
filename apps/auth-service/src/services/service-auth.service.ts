import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import { randomBytes } from "crypto";
import { db } from "../db";
import { serviceAccounts } from "../db/schema";
import { generateServiceToken } from "./token.service";
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "../utils/errors";

export interface ServiceRegistration {
  serviceId: string;
  allowedScopes: string[];
}

export interface ServiceCredentials {
  serviceId: string;
  clientId: string;
  clientSecret: string;
}

export async function registerService(
  serviceId: string,
  allowedScopes: string[],
): Promise<ServiceCredentials> {
  const clientId = `svc_${serviceId}_${randomBytes(8).toString("hex")}`;
  const clientSecret = randomBytes(32).toString("base64url");
  const clientSecretHash = await argon2.hash(clientSecret);

  await db.insert(serviceAccounts).values({
    serviceId,
    clientId,
    clientSecretHash,
    allowedScopes,
  });

  return { serviceId, clientId, clientSecret };
}

export async function authenticateService(
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string }> {
  const [service] = await db
    .select()
    .from(serviceAccounts)
    .where(eq(serviceAccounts.clientId, clientId))
    .limit(1);

  if (!service) {
    throw new UnauthorizedError("Invalid client credentials");
  }

  if (!service.isActive) {
    throw new ForbiddenError("Service account is disabled");
  }

  const valid = await argon2.verify(
    service.clientSecretHash,
    clientSecret,
  );
  if (!valid) {
    throw new UnauthorizedError("Invalid client credentials");
  }

  const accessToken = await generateServiceToken(
    service.serviceId,
    service.allowedScopes,
  );

  return { accessToken };
}
