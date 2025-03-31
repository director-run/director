import Table from "cli-table3";
import { getAllProxies } from "../services/store";

export const listProxies = async () => {
  const proxies = await getAllProxies();
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
