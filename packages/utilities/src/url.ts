export function joinURL(baseURL: string, path: string) {
  return new URL(path, baseURL).toString();
}

export function encodeUrl(url: string) {
  return Buffer.from(url).toString("base64");
}

export function decodeUrl(url: string) {
  return Buffer.from(url, "base64").toString("utf-8");
}
