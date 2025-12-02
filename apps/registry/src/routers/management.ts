import { getLogger } from "@director.run/utilities/logger";
import type { NextFunction, Request, Response, Router } from "express";
import express from "express";
import { env } from "../config";
import type { Store } from "../db/store";
import { enrichEntries } from "../enrichment/enrich";
import { enrichEntryToolsWithStore } from "../enrichment/enrich-tools";
import { entries } from "../seed/entries";

const logger = getLogger("management");

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

export function createManagementRouter(deps: { store: Store }): Router {
  const router = express.Router();

  router.use(express.json());
  router.use(requireManagementApiKey);

  router.post("/seed", async (_req: Request, res: Response) => {
    try {
      logger.info("Starting registry seed...");

      // Step 1: Populate - add entries from seed data
      logger.info("Step 1/3: Populating entries...");
      const populateResult = await deps.store.entries.addEntries(entries, {
        state: "published",
        ignoreDuplicates: true,
      });
      logger.info(
        { countInserted: populateResult.countInserted },
        "Populate complete",
      );

      // Step 2: Enrich - fetch readme content from GitHub
      logger.info("Step 2/3: Enriching entries...");
      await enrichEntries(deps.store);
      logger.info("Enrich complete");

      // Step 3: Enrich tools - connect to servers and fetch tool metadata
      logger.info("Step 3/3: Enriching tools...");
      await enrichEntryToolsWithStore(deps.store);
      logger.info("Enrich tools complete");

      res.json({
        success: true,
        message: "Registry seeded successfully",
        populate: populateResult,
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
