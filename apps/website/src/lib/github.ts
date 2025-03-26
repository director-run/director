import { Octokit } from "octokit";

if (!process.env["GITHUB_TOKEN"]) {
  throw new Error("GITHUB_TOKEN is not set");
}

export const octokit = new Octokit({
  auth: process.env["GITHUB_TOKEN"] as string,
});
