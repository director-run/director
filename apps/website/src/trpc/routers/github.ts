import { octokit } from "@/lib/github";
import { createTRPCRouter, t } from "../init";

export const githubRouter = createTRPCRouter({
  stars: t.procedure.query(async () => {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/stargazers",
      {
        owner: "theworkingcompany",
        repo: "director",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    return { stars: response.data.length };
  }),
  dmg: t.procedure.query(async () => {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/releases/latest",
      {
        owner: "theworkingcompany",
        repo: "director",
      },
    );

    const assets = response.data.assets;

    const dmg = assets.find((asset) => asset.name.endsWith(".dmg"));

    if (!dmg || !dmg.browser_download_url) {
      return { ok: false, error: "No DMG found" };
    }

    return { ok: true, dmg: dmg.browser_download_url };
  }),
});
