import { PORT } from "../../config";

export function getProxySSEUrl(proxyName: string) {
  return `http://localhost:${PORT}/${proxyName}/sse`;
}
