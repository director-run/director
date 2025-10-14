export function getStreamablePathForProxy(proxyId: string) {
  return `/${proxyId}/mcp`;
}

export function getSSEPathForProxy(proxyId: string) {
  return `/${proxyId}/sse`;
}
