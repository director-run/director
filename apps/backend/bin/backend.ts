import { initDB } from "../src/services/db";
import { startService } from "../src/startService";

await initDB();

startService();
