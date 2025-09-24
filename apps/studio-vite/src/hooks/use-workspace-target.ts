import { useWorkspace } from "./use-workspace";

export function useWorkspaceTarget(workspaceId: string, targetId: string) {
  const { workspace, isWorkspaceLoading, workspaceError } =
    useWorkspace(workspaceId);

  const workspaceTarget = workspace?.servers.find(
    (server) => server.name === targetId,
  );

  if (isWorkspaceLoading) {
    return {
      workspace: null,
      workspaceTarget: null,
      isWorkspaceTargetLoading: true,
      workspaceTargetError: null,
    };
  } else {
    const targetNotFoundError = !workspaceTarget
      ? `Workspace target '${targetId}' not found`
      : null;

    return {
      workspace,
      workspaceTarget,
      isWorkspaceTargetLoading: isWorkspaceLoading,
      workspaceTargetError: workspaceError || targetNotFoundError,
    };
  }
}
