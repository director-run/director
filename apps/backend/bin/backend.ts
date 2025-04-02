import { startServer } from "../src/http/startServer";
import { initStore } from "../src/services/store";

await initStore();
startServer();
