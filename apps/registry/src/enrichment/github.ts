import { getLogger } from "@director.run/utilities/logger";
import parseGitUrl from "git-url-parse";
import { Octokit } from "octokit";
import { env } from "../config";

const githubClient = new Octokit({
  auth: env.GITHUB_API_TOKEN,
});

export function isGithubRepo(url: string) {
  return parseGitUrl(url).resource === "github.com";
}

const logger = getLogger("github");

export async function getGithubReadme(url: string) {
  try {
    const parsedUrl = parseGitUrl(url);

    if (parsedUrl.filepath === "") {
      const readmeContent = await githubClient.rest.repos.getReadme({
        owner: parsedUrl.owner,
        repo: parsedUrl.name,
        mediaType: {
          format: "raw",
        },
        ...(parsedUrl.ref ? { ref: parsedUrl.ref } : {}),
      });

      return readmeContent.data as unknown as string;
    }

    if (
      parsedUrl.filepathtype === "blob" &&
      parsedUrl.filepath.toLowerCase().includes("readme")
    ) {
      const readmeContent = await githubClient.rest.repos.getContent({
        owner: parsedUrl.owner,
        repo: parsedUrl.name,
        mediaType: {
          format: "raw",
        },
        ...(parsedUrl.ref ? { ref: parsedUrl.ref } : {}),
        path: parsedUrl.filepath,
      });

      return readmeContent.data as unknown as string;
    }

    const repoContents = await githubClient.rest.repos.getContent({
      owner: parsedUrl.owner,
      repo: parsedUrl.name,
      ...(parsedUrl.ref ? { ref: parsedUrl.ref } : {}),
      path: parsedUrl.filepath
        .replace("README.md", "")
        .replace("readme.md", ""),
    });

    if (Array.isArray(repoContents.data)) {
      const readme = repoContents.data.find(
        (item) => item.name.toLowerCase() === "readme.md",
      );

      if (!readme) {
        return null;
      }

      const readmeContent = await githubClient.rest.repos.getContent({
        owner: parsedUrl.owner,
        repo: parsedUrl.name,
        mediaType: {
          format: "raw",
        },
        ...(parsedUrl.ref ? { ref: parsedUrl.ref } : {}),
        path: readme.path,
      });

      return readmeContent.data as unknown as string;
    }

    return null;
  } catch (error) {
    logger.error(`error getting github readme for ${url}`);
    return null;
  }
}

export function getGithubRawReadmeUrl(url: string) {
  const { owner, name, ref, filepath } = parseGitUrl(url);

  const branch = ref || "main";

  const readmePath = filepath.includes("README.md")
    ? filepath
    : filepath
      ? `${filepath}/README.md`
      : "README.md";

  return `https://raw.githubusercontent.com/${owner}/${name}/refs/heads/${branch}/${readmePath}`;
}
