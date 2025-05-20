export const deterministicBgClassNames = {
  yellow: "bg-accent-yellow",
  orange: "bg-accent-orange",
  tomato: "bg-accent-tomato",
  red: "bg-accent-red",
  ruby: "bg-accent-ruby",
  crimson: "bg-accent-crimson",
  pink: "bg-accent-pink",
  plum: "bg-accent-plum",
  purple: "bg-accent-purple",
  violet: "bg-accent-violet",
  iris: "bg-accent-iris",
  indigo: "bg-accent-indigo",
  blue: "bg-accent-blue",
  cyan: "bg-accent-cyan",
  teal: "bg-accent-teal",
  jade: "bg-accent-jade",
  green: "bg-accent-green",
  grass: "bg-accent-grass",
  lime: "bg-accent-lime",
  mint: "bg-accent-mint",
  sky: "bg-accent-sky",
};

export const deterministicFillClassNames = {
  yellow: "fill-accent-yellow",
  orange: "fill-accent-orange",
  tomato: "fill-accent-tomato",
  red: "fill-accent-red",
  ruby: "fill-accent-ruby",
  crimson: "fill-accent-crimson",
  pink: "fill-accent-pink",
  plum: "fill-accent-plum",
  purple: "fill-accent-purple",
  violet: "fill-accent-violet",
  iris: "fill-accent-iris",
  indigo: "fill-accent-indigo",
  blue: "fill-accent-blue",
  cyan: "fill-accent-cyan",
  teal: "fill-accent-teal",
  jade: "fill-accent-jade",
  green: "fill-accent-green",
  grass: "fill-accent-grass",
  lime: "fill-accent-lime",
  mint: "fill-accent-mint",
  sky: "fill-accent-sky",
};

export const deterministicColorName = [
  "yellow",
  "tomato",
  "red",
  "ruby",
  "crimson",
  "red",
  "orange",
  "lime",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "teal",
  "blue",
  "cyan",
  "pink",
  "jade",
  "green",
  "grass",
  "mint",
  "sky",
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

export function getDeterministicColor(str: string) {
  const hash = hashString(str);
  const index = Math.abs(hash) % deterministicColorName.length;

  return deterministicColorName[index];
}
