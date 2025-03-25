import { octokit } from "@/lib/github";
import { createTRPCRouter, t } from "@/trpc/init";

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
  latest: t.procedure.query(async ({ ctx }) => {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/releases/latest",
      {
        owner: "theworkingcompany",
        repo: "director",
      },
    );

    if (response.data.assets.length === 0) {
      return { ok: true, osx: null };
    }

    const dmg = response.data.assets.find((asset) =>
      asset.name.endsWith(".dmg"),
    );

    return {
      ok: true,
      osx: dmg?.browser_download_url ?? null,
    };
  }),
});
