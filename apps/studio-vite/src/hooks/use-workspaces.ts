import { gatewayClient } from "../contexts/gateway-context";

export function useWorkspaces() {
  return gatewayClient.store.getAll.useQuery();
}
