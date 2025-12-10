import { Database } from "../db/database";
import {
  accountTable,
  oauthCredentialsTable,
  playbooksTable,
  sessionTable,
  userTable,
  verificationTable,
} from "../db/schema";
import type { PlaybookStore } from "../playbooks/playbook-store";

/**
 * Resets the playbook store by closing all connections and clearing cache.
 */
export async function resetPlaybookStore(playbookStore: PlaybookStore) {
  await playbookStore.closeAll();
  playbookStore.clearCache();
}

/**
 * Creates a test user in the database and returns the user object.
 */
export async function createTestUser(database: Database) {
  const user = {
    id: "test-user-id",
    name: "testuser@example.com",
    email: "testuser@example.com",
    emailVerified: true,
    status: "ACTIVE" as const,
  };

  await database.drizzle.insert(userTable).values(user).onConflictDoNothing();

  return user;
}

/**
 * Test utility for initializing database state between tests.
 * This is only intended for use in test environments.
 *
 * @param params.database - The database instance to use
 * @param params.keepUsers - When true, only deletes playbooks. When false, resets entire database.
 */
export async function initializeTestDatabase(params: {
  database: Database;
  keepUsers: boolean;
}) {
  const { database, keepUsers } = params;
  const db = database.drizzle;

  if (keepUsers) {
    // Delete only playbooks and oauth credentials, keeping users intact
    await db.delete(oauthCredentialsTable);
    await db.delete(playbooksTable);
  } else {
    // Reset database (deletes all users, accounts, sessions, verification, playbooks, oauth credentials)
    // Delete in order to respect foreign key constraints
    await db.delete(verificationTable);
    await db.delete(sessionTable);
    await db.delete(accountTable);
    await db.delete(oauthCredentialsTable);
    await db.delete(playbooksTable);
    await db.delete(userTable);
  }
}
