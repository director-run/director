import { PROXY_DB_FILE_PATH } from "../src/constants";
import { startServer } from "../src/http/startServer";
import { createStore, storeExistsSync } from "../src/services/config";

if (!storeExistsSync(PROXY_DB_FILE_PATH)) {
  await createStore(PROXY_DB_FILE_PATH);
}

startServer();
