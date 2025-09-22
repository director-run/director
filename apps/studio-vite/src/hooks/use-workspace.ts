import { gatewayClient } from "../contexts/backend-context";

export function useWorkspace(workspaceId: string) {
  const [workspace, clients] = gatewayClient.useQueries((t) => [
    t.store.get({ proxyId: workspaceId }),
    t.installer.byProxy.list({ proxyId: workspaceId }),
  ]);

  const isLoading =
    workspace.isLoading ||
    clients.isLoading ||
    workspace.error?.message === "Failed to fetch";

  return {
    workspace: workspace.data,
    isLoading,
    installers: clients.data ?? { claude: false, cursor: false, vscode: false },
  };
}
