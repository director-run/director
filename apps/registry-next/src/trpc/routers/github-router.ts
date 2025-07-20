import { z } from "zod";

import { createTRPCRouter, t } from "../init";

export const githubRouter = createTRPCRouter({
  getStarCount: t.procedure
    .input(z.object({ organization: z.string(), repo: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${input.organization}/${input.repo}`,
          { cache: "no-store" },
        );
        const data = await response.json();

        return {
          organization: input.organization,
          repo: input.repo,
          stargazers: data.stargazers_count ?? 0,
        };
      } catch (e) {
        console.error(e);
        return {
          organization: input.organization,
          repo: input.repo,
          stargazers: 0,
        };
      }
    }),
});
