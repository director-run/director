export async function getStarCount() {
  const response = await fetch(
    "https://api.github.com/repos/director-run/director",
  );
  const data = await response.json();
  return data.stargazers_count ?? 0;
}

export function formatStarCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }

  const thousands = count / 1000;
  return `${thousands.toFixed(1)}k`;
}
