import { getLogger } from "@director.run/utilities/logger";
import type { RegistryEntry } from "@director.run/utilities/schema";

import { type EntryStore } from "../db/entries";
import { getGithubRawReadmeUrl, isGithubRepo } from "./github";

const logger = getLogger("enrich");

export async function enrichEntries(store: EntryStore) {
  const entries = await store.getAllEntries();
  for (const entry of entries) {
    if (entry.isEnriched) {
      logger.info(`skipping ${entry.name}: already enriched`);
    } else {
      try {
        const enriched = await enrichEntry(entry);
        await store.updateEntry(entry.id, enriched);
      } catch (error) {
        logger.error(`error enriching ${entry.name}: ${error}`);
      }
    }
  }
}

async function enrichEntry(entry: RegistryEntry): Promise<RegistryEntry> {
  logger.info(`enriching ${entry.name}`);
  if (isGithubRepo(entry.homepage)) {
    const response = await fetch(getGithubRawReadmeUrl(entry.homepage));
    return {
      ...entry,
      readme: await response.text(),
      isEnriched: true,
    };
  } else {
    return entry;
  }
}
