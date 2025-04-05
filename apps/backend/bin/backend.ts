import { createStore, storeExistsSync } from "@director.run/store";
import { PROXY_DB_FILE_PATH } from "../src/config";
import { startServer } from "../src/http/startServer";

if (!storeExistsSync(PROXY_DB_FILE_PATH)) {
  await createStore(PROXY_DB_FILE_PATH);
}

startServer();
