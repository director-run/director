import { PORT } from "../../config";

export function getProxySSEUrl(proxyId: string) {
  return `http://localhost:${PORT}/${proxyId}/sse`;
}
