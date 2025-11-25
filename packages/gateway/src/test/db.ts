import { type Database, createDatabase } from "../db";
import { DATABASE_URL } from "../env";
import type { PlaybookStore } from "../playbooks/playbook-store";

export function makeTestDatabase() {
  return createDatabase(DATABASE_URL);
}

/**
 * Test utility for initializing database state between tests.
 * This is only intended for use in test environments.
 *
 * @param params.database - The database instance
 * @param params.playbookStore - Optional playbook store to close connections and clear cache
 * @param params.keepUsers - When true, only deletes playbooks. When false, resets entire database.
 */
export async function initializeTestDatabase(params: {
  database: Database;
  playbookStore?: PlaybookStore;
  keepUsers?: boolean;
}) {
  const { database, playbookStore, keepUsers = false } = params;

  // Close all active playbook connections and clear cache if available
  if (playbookStore) {
    await playbookStore.closeAll();
    playbookStore.clearCache();
  }

  if (keepUsers) {
    // Delete only playbooks, keeping users intact
    await database.deleteAllPlaybooks();
  } else {
    // Reset database (deletes all users, accounts, sessions, verification, playbooks)
    await database.reset();
    // Create a dummy user for unauthenticated test requests
    await database.createDummyUser();
  }
}
