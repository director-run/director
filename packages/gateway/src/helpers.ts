import { env } from "@director.run/config/env";

export function getProxyServerUrl(proxyId: string) {
  return `http://localhost:${env.SERVER_PORT}/${proxyId}/sse`;
}
