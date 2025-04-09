import { initConfigFile } from "../src/services/db";
import { startService } from "../src/startService";

await initConfigFile();

startService();
