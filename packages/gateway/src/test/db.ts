import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Database } from "../db/database";
import {
  accountTable,
  playbooksTable,
  sessionTable,
  userTable,
  verificationTable,
} from "../db/schema";
import * as schema from "../db/schema";
import { DATABASE_URL } from "../env";
import type { PlaybookStore } from "../playbooks/playbook-store";

// Shared test database connection for direct drizzle operations
let testPool: Pool | null = null;
let testDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getTestDb() {
  if (!testPool || !testDb) {
    testPool = new Pool({ connectionString: DATABASE_URL });
    testDb = drizzle(testPool, { schema });
  }
  return testDb;
}

export function makeTestDatabase() {
  return Database.create(DATABASE_URL);
}

/**
 * Test utility for initializing database state between tests.
 * This is only intended for use in test environments.
 *
 * @param params.playbookStore - Optional playbook store to close connections and clear cache
 * @param params.keepUsers - When true, only deletes playbooks. When false, resets entire database and creates dummy user.
 */
export async function initializeTestDatabase(params: {
  playbookStore?: PlaybookStore;
  keepUsers?: boolean;
}) {
  const { playbookStore, keepUsers = false } = params;
  const db = getTestDb();

  // Close all active playbook connections and clear cache if available
  if (playbookStore) {
    await playbookStore.closeAll();
    playbookStore.clearCache();
  }

  if (keepUsers) {
    // Delete only playbooks, keeping users intact
    await db.delete(playbooksTable);
  } else {
    // Reset database (deletes all users, accounts, sessions, verification, playbooks)
    // Delete in order to respect foreign key constraints
    await db.delete(verificationTable);
    await db.delete(sessionTable);
    await db.delete(accountTable);
    await db.delete(playbooksTable);
    await db.delete(userTable);

    // Create a dummy user for unauthenticated test requests
    await db
      .insert(userTable)
      .values({
        id: "dummy-user-id",
        name: "dummy@example.com",
        email: "dummy@example.com",
        emailVerified: true,
        status: "ACTIVE",
      })
      .onConflictDoNothing();
  }
}
