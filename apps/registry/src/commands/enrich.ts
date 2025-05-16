import { getLogger } from "@director.run/utilities/logger";
import { type EntryGetParams } from "../db/schema";
import { type Store } from "../db/store";

const logger = getLogger("enrich");

export async function enrichEntries(store: Store) {
  const entries = await store.entries.getAllEntries();
  for (const entry of entries) {
    if (!isGithubRepo(entry.homepage)) {
      logger.info(`deleting ${entry.name}: not a github repo`);
      await store.entries.deleteEntry(entry.id);
    } else if (isEnriched(entry)) {
      logger.info(`skipping ${entry.name}: already enriched`);
    } else {
      await enrichEntry(entry, store);
    }
  }
}

export async function getStatistics(store: Store) {
  const entries = await store.entries.getAllEntries();
  const enriched = entries.filter(isEnriched);
  const notEnriched = entries.filter((e) => !isEnriched(e));
  const notGithub = entries.filter((e) => !isGithubRepo(e.homepage));

  return {
    total: entries.length,
    enriched: enriched.length,
    notEnriched: notEnriched.length,
    notGithub: notGithub.length,
  };
}

async function enrichEntry(entry: EntryGetParams, store: Store) {
  logger.info(`enriching ${entry.name}`);

  const { team, repo } = parseGithubUrl(entry.homepage);
  const readme = await getRepoReadme(team, repo);

  await store.entries.updateEntry(entry.id, {
    readme,
  });
}

function isEnriched(entry: EntryGetParams) {
  return !!entry.readme;
}

function isGithubRepo(url: string) {
  return url.includes("github.com");
}

function parseGithubUrl(url: string) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const [team, repo] = path.split("/").filter(Boolean);
  return { team, repo };
}

async function getRepoReadme(team: string, repo: string) {
  const url = `https://raw.githubusercontent.com/${team}/${repo}/main/README.md`;
  const response = await fetch(url);
  const readme = await response.text();
  return readme;
}
