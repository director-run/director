export function joinURL(baseURL: string, path: string) {
  return new URL(path, baseURL).toString();
}
