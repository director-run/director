import { gatewayClient } from "../contexts/backend-context";

export function useWorkspaces() {
  return gatewayClient.store.getAll.useQuery();
}
