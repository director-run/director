import type { PlaybookDbStore } from "../db/playbooks";
import { createStore } from "../db/store";
import { DATABASE_URL } from "../env";
import type { PlaybookStore } from "../playbooks/playbook-store";

export function makeTestDbStore() {
  return createStore({ connectionString: DATABASE_URL }).playbooks;
}

/**
 * Test utility for initializing database state between tests.
 * This is only intended for use in test environments.
 *
 * @param params.dbStore - The database store instance
 * @param params.playbookStore - Optional playbook store to close connections and clear cache
 * @param params.keepUsers - When true, only deletes playbooks. When false, resets entire database.
 */
export async function initializeTestDatabase(params: {
  dbStore: PlaybookDbStore;
  playbookStore?: PlaybookStore;
  keepUsers?: boolean;
}) {
  const { dbStore, playbookStore, keepUsers = false } = params;

  // Close all active playbook connections and clear cache if available
  if (playbookStore) {
    await playbookStore.closeAll();
    playbookStore.clearCache();
  }

  if (keepUsers) {
    // Delete only playbooks, keeping users intact
    await dbStore.deleteAllPlaybooks();
  } else {
    // Reset database (deletes all users, accounts, sessions, verification, playbooks)
    await dbStore.reset();
    // Create a dummy user for unauthenticated test requests
    await dbStore.createDummyUser();
  }
}
