import { listProxies } from "@director/core/services/listProxies";

const proxies = await listProxies();

console.log(proxies);

// startServer();
