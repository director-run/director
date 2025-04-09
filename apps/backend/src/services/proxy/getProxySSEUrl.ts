import { PORT } from "../../constants";

export function getProxySSEUrl(proxyName: string) {
  return `http://localhost:${PORT}/${proxyName}/sse`;
}
