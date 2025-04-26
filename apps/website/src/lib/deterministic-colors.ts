import { assertUnreachable } from "./assert-unreachable";

export const deterministicBgClassNames = [
  "bg-accent-yellow",
  "bg-accent-orange",
  "bg-accent-tomato",
  "bg-accent-red",
  "bg-accent-ruby",
  "bg-accent-crimson",
  "bg-accent-pink",
  "bg-accent-plum",
  "bg-accent-purple",
  "bg-accent-violet",
  "bg-accent-iris",
  "bg-accent-indigo",
  "bg-accent-blue",
  "bg-accent-cyan",
  "bg-accent-teal",
  "bg-accent-jade",
  "bg-accent-green",
  "bg-accent-grass",
  "bg-accent-lime",
  "bg-accent-mint",
  "bg-accent-sky",
] as const;

export const deterministicFillClassNames = [
  "fill-accent-yellow",
  "fill-accent-orange",
  "fill-accent-tomato",
  "fill-accent-red",
  "fill-accent-ruby",
  "fill-accent-crimson",
  "fill-accent-pink",
  "fill-accent-plum",
  "fill-accent-purple",
  "fill-accent-violet",
  "fill-accent-iris",
  "fill-accent-indigo",
  "fill-accent-blue",
  "fill-accent-cyan",
  "fill-accent-teal",
  "fill-accent-jade",
  "fill-accent-green",
  "fill-accent-grass",
  "fill-accent-lime",
  "fill-accent-mint",
  "fill-accent-sky",
] as const;

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export function getDeterministicColor(str: string, type: "bg" | "fill") {
  const hash = hashString(str);
  const index = Math.abs(hash) % deterministicBgClassNames.length;

  switch (type) {
    case "bg":
      return deterministicBgClassNames[index];
    case "fill":
      return deterministicFillClassNames[index];
    default:
      assertUnreachable(type);
  }
}
