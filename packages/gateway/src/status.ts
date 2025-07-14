import { allClientStatuses } from "@director.run/client-configurator/index";
import { isCommandInPath } from "@director.run/utilities/os";
import type { ProxyServerStore } from "./proxy-server-store";

export async function getStatus(proxyStore?: ProxyServerStore) {
  const baseStatus = {
    platform: process.platform,
    dependencies: [
      {
        name: "npx",
        installed: isCommandInPath("npx"),
      },
      {
        name: "uvx",
        installed: isCommandInPath("uvx"),
      },
    ],
    clients: await allClientStatuses(),
  };

  if (!proxyStore) {
    return baseStatus;
  }

  const proxies = proxyStore.getAll();
  const servers = proxies.flatMap((proxy) =>
    proxy.getAllTargets().map((target) => ({
      proxyId: proxy.id,
      proxyName: proxy.attributes.name,
      serverName: target.name,
      ...target.getStatusInfo(),
    })),
  );

  return {
    ...baseStatus,
    servers,
  };
}
