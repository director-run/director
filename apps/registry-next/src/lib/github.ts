import GitUrlParse from "git-url-parse";

export function isGithubRepo(url: string) {
  return GitUrlParse(url).resource === "github.com";
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
