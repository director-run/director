import { getLogger } from "@director.run/utilities/logger";
import type { RegistryEntry } from "@director.run/utilities/schema";

import { execSync } from "child_process";
import { type EntryStore } from "../db/entries";
import { isGithubRepo } from "./github";

const logger = getLogger("enrich");

export async function enrichEntries(store: EntryStore) {
  const entries = await store.getAllEntries();

  const enriched = await enrichEntry(entries[0]);
  console.log({ enriched });

  return;
  for (const entry of entries) {
    if (entry.isEnriched) {
      logger.info(`skipping ${entry.name}: already enriched`);
    } else {
      try {
        const enriched = await enrichEntry(entry);
        console.log({ enriched });
        // await store.updateEntry(entry.id, enriched);
      } catch (error) {
        logger.error(`error enriching ${entry.name}: ${error}`);
      }
    }
  }
}

async function enrichEntry(entry: RegistryEntry): Promise<RegistryEntry> {
  logger.info(`enriching ${entry.name}`);
  if (isGithubRepo(entry.homepage)) {
    const thing = execSync(`gh`);
    console.log(thing);
    // const response = await fetch(getGithubRawReadmeUrl(entry.homepage));
    // return {
    //   ...entry,
    //   readme: await response.text(),
    //   isEnriched: true,
    // };
  } else {
    return entry;
  }
}
