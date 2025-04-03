import Table from "cli-table3";
import { BACKEND_PORT } from "../config";
import { getAllProxies } from "../services/store";

export const listProxies = async () => {
  const proxies = await getAllProxies();
  if (proxies.length === 0) {
    console.log("no proxies configured yet.");
  } else {
    const table = new Table({
      head: ["name", "servers", "url"],
      style: {
        head: ["green"],
      },
    });
    table.push(
      ...proxies.map((proxy) => [
        proxy.name,
        proxy.servers.map((s) => s.name).join(","),
        `http://localhost:${BACKEND_PORT}/${proxy.name}/sse`,
      ]),
    );

    console.log(table.toString());
  }
};
