import { DatabaseConnection } from "./index";
import { PlaybookDbStore } from "./playbooks";

export function createStore(params: { connectionString: string }) {
  const db = DatabaseConnection.create(params.connectionString);
  const playbooks = new PlaybookDbStore(db);
  return {
    playbooks,
    close: () => db.close(),
  };
}

export type Store = ReturnType<typeof createStore>;
