import { integrationEnum } from "@director/backend/src/services/db/schema";
import {
  createSerializer,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

const proxyQueryStateParams = {
  proxyId: parseAsString.withOptions({
    history: "push",
  }),
  integrationId: parseAsStringEnum([...integrationEnum.options, "manual"]),
  mcpId: parseAsString,
  add: parseAsStringEnum(["mcp"]),
};

export function useProxyQueryStates() {
  return useQueryStates(proxyQueryStateParams);
}

export const proxyQueryStatesSerializer = createSerializer(
  proxyQueryStateParams,
);
