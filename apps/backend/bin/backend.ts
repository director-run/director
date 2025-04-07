import { createStore, storeExistsSync } from "../src/config";
import { PROXY_DB_FILE_PATH } from "../src/constants";
import { startServer } from "../src/http/startServer";

if (!storeExistsSync(PROXY_DB_FILE_PATH)) {
  await createStore(PROXY_DB_FILE_PATH);
}

startServer();
