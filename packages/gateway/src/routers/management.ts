import { getLogger } from "@director.run/utilities/logger";
import { generateRandomString, hashPassword } from "better-auth/crypto";
import type { NextFunction, Request, Response, Router } from "express";
import express from "express";
import type { Database } from "../db/database";
import { accountTable, userTable } from "../db/schema";
import { env } from "../env";
import type { PlaybookStore } from "../playbooks/playbook-store";
import { initializeTestDatabase } from "../test/db";

const logger = getLogger("management");

const SEED_USER_EMAIL = "user@director.run";

const HACKERNEWS_SERVER = {
  name: "hackernews",
  type: "stdio" as const,
  command: "uvx",
  args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
};

/**
 * Middleware to validate management API key
 */
function requireManagementApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!env.MANAGEMENT_API_KEY) {
    res.status(503).json({ error: "Management API not configured" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  if (token !== env.MANAGEMENT_API_KEY) {
    res.status(403).json({ error: "Invalid management API key" });
    return;
  }

  next();
}

/**
 * Creates a user with email/password credentials directly in the database.
 * This bypasses the better-auth HTTP API for seeding purposes.
 */
async function createSeedUser(
  database: Database,
  params: { email: string; password: string },
) {
  const userId = generateRandomString(32, "a-z", "A-Z", "0-9");
  const hashedPassword = await hashPassword(params.password);

  await database.drizzle.insert(userTable).values({
    id: userId,
    name: params.email,
    email: params.email,
    emailVerified: true,
    status: "ACTIVE",
  });

  await database.drizzle.insert(accountTable).values({
    id: generateRandomString(32, "a-z", "A-Z", "0-9"),
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashedPassword,
  });

  return { id: userId, email: params.email };
}

export function createManagementRouter(deps: {
  database: Database;
  playbookStore: PlaybookStore;
  baseCallbackUrl: string;
}): Router {
  const router = express.Router();

  router.use(express.json());
  router.use(requireManagementApiKey);

  router.post("/seed", async (req: Request, res: Response) => {
    const password = req.body.password || env.SEED_USER_PASSWORD;

    if (!password) {
      res.status(400).json({
        error:
          "Password required: provide in request body or SEED_USER_PASSWORD env",
      });
      return;
    }

    try {
      logger.info("Starting database seed...");

      // Reset the database completely
      logger.info("Resetting database...");
      await initializeTestDatabase({
        database: deps.database,
        keepUsers: false,
      });

      // Create user
      logger.info({ email: SEED_USER_EMAIL }, "Creating seed user");
      const user = await createSeedUser(deps.database, {
        email: SEED_USER_EMAIL,
        password,
      });
      logger.info({ userId: user.id }, "User created");

      // Create playbook
      logger.info("Creating playbook: test");
      const playbook = await deps.playbookStore.create({
        id: "test",
        name: "test",
        userId: user.id,
      });
      logger.info({ playbookId: playbook.id }, "Playbook created");

      // Add hackernews server
      logger.info("Adding hackernews server...");
      await playbook.addTarget(HACKERNEWS_SERVER, { throwOnError: false });
      logger.info("Hackernews server added");

      res.json({
        success: true,
        message: "Database seeded successfully",
        user: { email: user.email },
      });
    } catch (error) {
      logger.error({ error }, "Seed failed");
      res.status(500).json({
        error: "Seed failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
