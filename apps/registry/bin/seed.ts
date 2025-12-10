#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { getLogger } from "@director.run/utilities/logger";
import { env } from "../src/config";
import { createStore } from "../src/db/store";
import { enrichEntries } from "../src/enrichment/enrich";
import { enrichEntryToolsWithStore } from "../src/enrichment/enrich-tools";
import { entries } from "../src/seed/entries";

const logger = getLogger("seed");

async function seed() {
  const store = createStore({ connectionString: env.DATABASE_URL });
  logger.info("[1/3] seeding from file...");

  const populateResult = await store.entries.addEntries(entries, {
    state: "published",
    ignoreDuplicates: true,
  });
  logger.info({
    countInserted: populateResult.countInserted,
    message: "[1/3] seed complete",
  });

  logger.info("[2/3] enriching entries...");
  await enrichEntries(store);
  logger.info("[2/3] enrich complete");

  if (env.DANGEROUSLY_ENRICH_TOOLS_DURING_SEED) {
    logger.info("[3/3] enriching tools...");
    await enrichEntryToolsWithStore(store);
    logger.info("[3/3] tools enriched");
  } else {
    logger.info(
      "skipping tool enrichment as DANGEROUSLY_ENRICH_TOOLS_DURING_SEED is not set",
    );
  }

  logger.info("Registry seeded successfully");
  await store.close();
}

await seed();
