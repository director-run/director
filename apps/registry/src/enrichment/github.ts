export function isGithubRepo(url: string) {
  return url.includes("github.com");
}

export function parseGithubUrl(url: string) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const [team, repo] = path.split("/").filter(Boolean);
  return { team, repo };
}

export async function getRepoReadme(team: string, repo: string) {
  const url = `https://raw.githubusercontent.com/${team}/${repo}/main/README.md`;
  const response = await fetch(url);
  const readme = await response.text();
  return readme;
}
