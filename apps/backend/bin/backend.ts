import { startServer } from "../src/http/server";
import { initStore } from "../src/services/store";

await initStore();
startServer();
