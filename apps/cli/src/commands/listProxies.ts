import type { Config } from "@director/core/src/config/types";
import Table from "cli-table3";

export const listProxies = ({ config }: { config: Config }) => {
  if (config.proxies.length === 0) {
    // biome-ignore lint/suspicious/noConsoleLog: This is a CLI command that needs to output to console
    console.log("no proxies configured yet.");
  } else {
    const table = new Table({
      head: ["name", "servers"],
      style: {
        head: ["green"],
      },
    });
    table.push(...config.proxies.map((proxy) => [proxy.name, proxy.servers.map((s) => s.name).join(",")]));

    // biome-ignore lint/suspicious/noConsoleLog: This is a CLI command that needs to output to console
    console.log(table.toString());
  }
};
