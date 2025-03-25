import { listProxies } from "@director/core/services/listProxies";
import { startServer } from "../src/http/server";

const proxies = await listProxies();

console.log(proxies);

startServer();
