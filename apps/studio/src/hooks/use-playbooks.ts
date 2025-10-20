import { gatewayClient } from "../contexts/backend-context";

export function usePlaybooks() {
  return gatewayClient.store.getAll.useQuery();
}
