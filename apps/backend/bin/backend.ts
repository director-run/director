import { startServer } from "../src/http/server";
import { listProxies } from "../src/services/listProxies";

const proxies = await listProxies();

console.log(proxies);

startServer();
