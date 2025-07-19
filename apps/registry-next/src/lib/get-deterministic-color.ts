const deterministicColors = [
  "green",
  "blue",
  "orange",
  "pink",
  "lime",
] as const;

export type DeterministicColors = typeof deterministicColors;
export type DeterministicColor = (typeof deterministicColors)[number];

function hashStr(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hash += charCode;
  }
  return hash;
}

function sampleFromHash(array: DeterministicColors, str: string) {
  return array[
    hashStr(str.trim().toLocaleLowerCase()) % array.length
  ] as DeterministicColor;
}

export function getDeterministicColor(
  str: string,
): (typeof deterministicColors)[number] {
  return sampleFromHash(deterministicColors, str) as DeterministicColor;
}
