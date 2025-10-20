export function getStreamablePathForProxy(playbookId: string) {
  return `/${playbookId}/mcp`;
}

export function getSSEPathForProxy(playbookId: string) {
  return `/${playbookId}/sse`;
}
