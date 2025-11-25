import { generateRandomString, hashPassword } from "better-auth/crypto";
import { Database } from "../src/db/database";
import { accountTable, userTable } from "../src/db/schema";
import { DATABASE_URL } from "../src/env";
import { PlaybookStore } from "../src/playbooks/playbook-store";
import { initializeTestDatabase } from "../src/test/db";

const SEED_USER = {
  email: "user@example.com",
  password: "password",
};

const HACKERNEWS_SERVER = {
  name: "hackernews",
  type: "stdio" as const,
  command: "uvx",
  args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
};

async function seed() {
  console.log("Seeding database...");

  // Create database connection
  const database = Database.create(DATABASE_URL);

  try {
    // Reset the database completely
    console.log("Resetting database...");
    await initializeTestDatabase({ database, keepUsers: false });

    // Create user directly in database
    console.log(`Creating user: ${SEED_USER.email}`);
    const userId = generateRandomString(32, "a-z", "A-Z", "0-9");
    const hashedPassword = await hashPassword(SEED_USER.password);

    await database.drizzle.insert(userTable).values({
      id: userId,
      name: SEED_USER.email,
      email: SEED_USER.email,
      emailVerified: true,
      status: "ACTIVE",
    });

    // Create account with password (better-auth stores passwords in account table)
    const accountId = generateRandomString(32, "a-z", "A-Z", "0-9");
    await database.drizzle.insert(accountTable).values({
      id: accountId,
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    });

    console.log(`User created with id: ${userId}`);

    // Create PlaybookStore
    console.log("Initializing PlaybookStore...");
    const playbookStore = await PlaybookStore.create({
      database,
      oauth: {
        storage: "memory",
        baseCallbackUrl: "http://localhost:3673",
      },
    });

    // Create playbook
    console.log("Creating playbook: test");
    const playbook = await playbookStore.create({
      id: "test",
      name: "test",
      userId,
    });
    console.log(`Playbook created with id: ${playbook.id}`);

    // Add hackernews server
    console.log("Adding hackernews server...");
    await playbook.addTarget(HACKERNEWS_SERVER, { throwOnError: false });
    console.log("Hackernews server added.");

    // Close playbook connections
    await playbookStore.closeAll();

    console.log("\n✓ Seed complete!");
    console.log(`\nYou can now log in with:`);
    console.log(`  Email: ${SEED_USER.email}`);
    console.log(`  Password: ${SEED_USER.password}`);
  } finally {
    await database.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
