export function getStreamablePathForPlaybook(playbookId: string) {
  return `/playbooks/${playbookId}/mcp`;
}

export function getSSEPathForPlaybook(playbookId: string) {
  return `/playbooks/${playbookId}/sse`;
}
