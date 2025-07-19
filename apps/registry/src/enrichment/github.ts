import GitUrlParse from "git-url-parse";

export function isGithubRepo(url: string) {
  return GitUrlParse(url).resource === "github.com";
}

function parseGithubUrl(url: string) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const parts = path.split("/").filter(Boolean);

  // Extract team and repo from the first two parts
  const team = parts[0];
  const repo = parts[1];

  // Find the branch and subfolder
  let branch = "main";
  let subfolder = "";

  // Look for branch indicators (tree, blob, HEAD)
  const branchIndex = parts.findIndex((part) =>
    ["tree", "blob", "HEAD", "master"].includes(part),
  );
  if (branchIndex !== -1 && parts[branchIndex + 1]) {
    // Always use 'main' as the branch name, even if we see 'HEAD'
    branch = "main";
    // If we found a branch, everything after it is the subfolder
    if (parts.length > branchIndex + 2) {
      subfolder = parts.slice(branchIndex + 2).join("/");
    }
  }

  return { team, repo, branch, subfolder };
}

export function getGithubRawReadmeUrl(url: string) {
  const { owner, name, ref, filepath } = GitUrlParse(url);

  const branch = ref || "main";

  const readmePath = filepath.includes("README.md")
    ? filepath
    : filepath
      ? `${filepath}/README.md`
      : "README.md";

  return `https://raw.githubusercontent.com/${owner}/${name}/refs/heads/${branch}/${readmePath}`;
}
