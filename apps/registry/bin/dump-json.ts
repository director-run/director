import _ from "lodash";
import { env } from "../src/config";
import { createStore } from "../src/db/store";

const store = createStore({ connectionString: env.DATABASE_URL });

const entries = await store.entries.getAllEntries();

console.log(
  JSON.stringify(
    entries.map((e) =>
      _.pick(e, [
        "name",
        "title",
        "description",
        "isOfficial",
        "icon",
        "homepage",
        "transport",
        "parameters",
      ]),
    ),
    null,
    2,
  ),
);

await store.close();
