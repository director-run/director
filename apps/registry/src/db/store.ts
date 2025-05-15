import { env } from "../config";
import { EntryStore } from "./entries";
import { DatabaseConnection } from "./index";

export function makeStore(
  params: {
    connectionString: string;
  } = { connectionString: env.DATABASE_URL },
) {
  const db = DatabaseConnection.create(params.connectionString);
  const entries = new EntryStore(db);
  return {
    entries,
    close: () => db.close(),
    purge: () => entries.deleteAllEntries(),
  };
}

export type Store = ReturnType<typeof makeStore>;
