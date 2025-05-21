import { EntryStore } from "./entries";
import { DatabaseConnection } from "./index";

export function createStore(params: {
  connectionString: string;
}) {
  const db = DatabaseConnection.create(params.connectionString);
  const entries = new EntryStore(db);
  return {
    entries,
    close: () => db.close(),
    purge: () => entries.deleteAllEntries(),
  };
}

export type Store = ReturnType<typeof createStore>;
