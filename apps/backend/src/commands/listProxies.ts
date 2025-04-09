import Table from "cli-table3";
import { PROXY_DB_FILE_PATH } from "../constants";
import { getProxyConfigEntries } from "../services/config";

export const listProxies = async () => {
  const proxies = await getProxyConfigEntries(PROXY_DB_FILE_PATH);

  if (proxies.length === 0) {
    console.log("no proxies configured yet.");
  } else {
    const table = new Table({
      head: ["name", "servers"],
      style: {
        head: ["green"],
      },
    });
    table.push(
      ...proxies.map((proxy) => [
        proxy.name,
        proxy.servers.map((s) => s.name).join(","),
      ]),
    );

    console.log(table.toString());
  }
};
