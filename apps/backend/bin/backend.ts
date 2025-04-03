import { initStore } from "../src/services/store";
import { startServer } from "../src/startServer";

await initStore();
startServer();
