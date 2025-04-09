import { initConfigFile } from "../src/services/config";
import { startService } from "../src/startService";

await initConfigFile();

startService();
