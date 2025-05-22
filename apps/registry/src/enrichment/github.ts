export function isGithubRepo(url: string) {
  return url.includes("github.com");
}

function parseGithubUrl(url: string) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const [team, repo] = path.split("/").filter(Boolean);
  return { team, repo };
}

export function getGithubRawReadmeUrl(url: string) {
  const { team, repo } = parseGithubUrl(url);
  return `https://raw.githubusercontent.com/${team}/${repo}/main/README.md`;
}
