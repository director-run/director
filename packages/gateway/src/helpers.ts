export function getStreamablePathForPlaybook(playbookId: string) {
  return `/${playbookId}/mcp`;
}

export function getSSEPathForPlaybook(playbookId: string) {
  return `/${playbookId}/sse`;
}
