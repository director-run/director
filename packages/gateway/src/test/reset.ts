import type { PlaybookDbStore } from "../db/playbooks";
import type { PlaybookStore } from "../playbooks/playbook-store";

/**
 * Test utility for resetting database state between tests.
 * This is only intended for use in test environments.
 */
export async function resetTestData(params: {
  dbStore: PlaybookDbStore;
  playbookStore?: PlaybookStore;
}) {
  const { dbStore, playbookStore } = params;

  // Close all active playbook connections and clear cache if available
  if (playbookStore) {
    await playbookStore.closeAll();
    playbookStore.clearCache();
  }

  // Reset database (deletes all users, accounts, sessions, verification, playbooks)
  await dbStore.reset();

  // Create a dummy user for unauthenticated test requests
  await dbStore.createDummyUser();
}

/**
 * Test utility for resetting only playbooks without affecting users.
 * Useful for tests that need to reset playbook state but keep user sessions.
 */
export async function resetTestPlaybooks(params: {
  dbStore: PlaybookDbStore;
  playbookStore?: PlaybookStore;
}) {
  const { dbStore, playbookStore } = params;

  // Close all active playbook connections if available
  if (playbookStore) {
    await playbookStore.closeAll();
    playbookStore.clearCache();
  }

  // Delete only playbooks, keeping users intact
  await dbStore.deleteAllPlaybooks();
}
