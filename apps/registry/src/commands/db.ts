import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { createStore } from "../db/store";
import { prettyPrint } from "../helpers/pretty-print";
import { fetchRaycastRegistry } from "../importers/raycast";

export function registerDbCommands(program: Command) {
  program
    .command("db:purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        const store = createStore();
        await store.entries.deleteAllEntries();
        await store.close();
      }),
    );

  program
    .command("db:seed")
    .description("Seed the database with entries from awesome-mcp-servers")
    .action(
      actionWithErrorHandler(async () => {
        const store = createStore();
        await store.entries.deleteAllEntries();
        await store.entries.addEntries(await fetchRaycastRegistry());
        await store.close();
      }),
    );

  program
    .command("db:get <name>")
    .description(
      "Pretty print (with colours unless it's super verbose) the json object of the entry behind the name",
    )
    .action(
      actionWithErrorHandler(async (name: string) => {
        const store = createStore();
        const entry = await store.entries.getEntryByName(name);
        console.log(prettyPrint(entry, { indentSize: 2, padding: 1 }));
        await store.close();
      }),
    );
}
