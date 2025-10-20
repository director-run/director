import { usePlaybook } from "./use-playbook";

export function usePlaybookTarget(playbookId: string, targetId: string) {
  const { playbook, isPlaybookLoading, playbookError } =
    usePlaybook(playbookId);

  const playbookTarget = playbook?.servers.find(
    (server) => server.name === targetId,
  );

  if (isPlaybookLoading) {
    return {
      playbook: null,
      playbookTarget: null,
      isPlaybookTargetLoading: true,
      playbookTargetError: null,
    };
  } else {
    const targetNotFoundError = !playbookTarget
      ? `Playbook target '${targetId}' not found`
      : null;

    return {
      playbook,
      playbookTarget,
      isPlaybookTargetLoading: isPlaybookLoading,
      playbookTargetError: playbookError || targetNotFoundError,
    };
  }
}
