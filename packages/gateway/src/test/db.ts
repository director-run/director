import { createStore } from "../db/store";
import { DATABASE_URL } from "../env";

export function makeTestDbStore() {
  return createStore({ connectionString: DATABASE_URL }).playbooks;
}
