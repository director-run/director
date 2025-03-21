import type { Config } from "@director/core/config/types";
import Table from "cli-table3";

export const listProxies = ({ config }: { config: Config }) => {
  if (config.proxies.length === 0) {
    console.log("no proxies configured yet.");
  } else {
    const table = new Table({
      head: ["name", "servers"],
      style: {
        head: ["green"],
      },
    });
    table.push(...config.proxies.map((proxy) => [proxy.name, proxy.servers.map((s) => s.name).join(",")]));

    console.log(table.toString());
  }
};
