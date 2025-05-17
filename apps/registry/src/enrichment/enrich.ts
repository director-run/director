import { getLogger } from "@director.run/utilities/logger";
import { type EntryGetParams } from "../db/schema";
import { type Store } from "../db/store";
import { isGithubRepo } from "./github";
import { getRepoReadme } from "./github";
import { parseGithubUrl } from "./github";
import { parseParameters } from "./parseParameters";
const logger = getLogger("enrich");

export async function enrichEntries(store: Store) {
  const entries = await store.entries.getAllEntries();
  for (const entry of entries) {
    if (!isGithubRepo(entry.homepage)) {
      logger.info(`skipping ${entry.name}: not a github repo`);
    } else if (entry.isEnriched) {
      logger.info(`skipping ${entry.name}: already enriched`);
    } else {
      const enriched = await enrichEntry(entry);
      await store.entries.updateEntry(entry.id, enriched);
    }
  }
}

async function enrichEntry(entry: EntryGetParams): Promise<EntryGetParams> {
  logger.info(`enriching ${entry.name}`);

  const { team, repo } = parseGithubUrl(entry.homepage);
  const readme = await getRepoReadme(team, repo);
  const parameters = parseParameters(entry);

  return {
    ...entry,
    readme,
    isEnriched: true,
    parameters,
  };
}
