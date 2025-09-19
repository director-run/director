import { trpc } from "../contexts/gateway-context";

export function useWorkspace(workspaceId: string) {
  const [workspace, clients] = trpc.useQueries((t) => [
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
