import { getLogger } from "@director.run/utilities/logger";
import type { RegistryEntry } from "@director.run/utilities/schema";

import { execSync } from "child_process";
import gitUrlParse from "git-url-parse";
import { type EntryStore } from "../db/entries";

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
  const url = gitUrlParse(entry.homepage);
  if (url.resource === "github.com") {
    const contents = JSON.parse(
      execSync(
        `gh api -H "X-GitHub-Api-Version: 2022-11-28" \ /repos/${url.full_name}/contents/${url.filepath}?ref=${url.ref}`,
      ).toString(),
    );

    const readmeFile = contents.find(
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (it: any) => it.name.toLowerCase() === "readme.md",
    );

    if (readmeFile) {
      const fetched = await fetch(`${readmeFile.html_url}?raw=true`);
      const readme = await fetched.text();

      const branchRef = gitUrlParse(readmeFile.html_url).ref;

      // Replace relative links with absolute ones based on entry.homepage
      const updatedReadme = readme.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (match, text, urlToReplace) => {
          // Ignore absolute URLs and anchors
          if (/^(<http|http|https|#)/.test(urlToReplace)) {
            return match;
          }

          // If url starts with './', remove only the dot, otherwise remove the first character
          if (urlToReplace.startsWith("./")) {
            urlToReplace = urlToReplace.replace(/^\./, "");
          }

          // Ensure there's exactly one slash between homepage and url
          const separator =
            entry.homepage.endsWith("/") || urlToReplace.startsWith("/")
              ? ""
              : "/";

          const includeRaw =
            urlToReplace.endsWith(".png") ||
            urlToReplace.endsWith(".jpg") ||
            urlToReplace.endsWith(".jpeg") ||
            urlToReplace.endsWith(".gif") ||
            urlToReplace.endsWith(".svg") ||
            urlToReplace.endsWith(".webp");
          return `[${text}](${entry.homepage}/blob/${branchRef}${separator}${urlToReplace}${includeRaw ? "?raw=true" : ""})`;
        },
      );

      return {
        ...entry,
        readme: updatedReadme,
        isEnriched: true,
      };
    }

    return {
      ...entry,
      isEnriched: true,
    };
  } else {
    return entry;
  }
}
