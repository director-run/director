import { startServer } from "../src/http/startServer";
import { initConfigFile } from "../src/services/config";

await initConfigFile();

startServer();
