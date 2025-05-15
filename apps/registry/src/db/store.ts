import { env } from "../config";
import { EntryStore } from "./entries";
import { DatabaseConnection } from "./index";

export function makeStore(
  params: {
    connectionString: string;
  } = { connectionString: env.DATABASE_URL },
) {
  const db = DatabaseConnection.create(params.connectionString);
  return {
    entries: new EntryStore(db),
    close: () => db.close(),
  };
}

export type Store = ReturnType<typeof makeStore>;
