import { getLogger } from "@director.run/utilities/logger";
import type { SourceEntry } from "@director.run/utilities/schema";
import { type Store } from "../db/store";
import { getGithubRawReadmeUrl, isGithubRepo } from "./github";

const logger = getLogger("enrich");

export async function enrichEntries(store: Store) {
  const entries = await store.entries.getAllEntries();
  for (const entry of entries) {
    if (entry.isEnriched) {
      logger.info(`skipping ${entry.name}: already enriched`);
    } else {
      try {
        const enriched = await enrichEntry(entry);
        await store.entries.updateEntry(entry.id, enriched);
      } catch (error) {
        logger.error(`error enriching ${entry.name}: ${error}`);
      }
    }
  }
}

async function enrichEntry(entry: SourceEntry): Promise<SourceEntry> {
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
