import { generateRandomString, hashPassword } from "better-auth/crypto";
import { Database } from "../src/db/database";
import { accountTable, userTable } from "../src/db/schema";
import { env } from "../src/env";
import { PlaybookStore } from "../src/playbooks/playbook-store";
import { initializeTestDatabase } from "../src/test/db";

if (!process.env.SEED_USER_PASSWORD) {
  throw new Error("SEED_USER_PASSWORD must be set");
}

const SEED_USER = {
  email: "user@director.run",
  password: process.env.SEED_USER_PASSWORD,
};

const HACKERNEWS_SERVER = {
  name: "hackernews",
  type: "stdio" as const,
  command: "uvx",
  args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
};

/**
 * Creates a user with email/password credentials directly in the database.
 * This bypasses the better-auth HTTP API for seeding purposes.
 */
async function createSeedUser(
  database: Database,
  params: { email: string; password: string },
) {
  const userId = generateRandomString(32, "a-z", "A-Z", "0-9");
  const hashedPassword = await hashPassword(params.password);

  await database.drizzle.insert(userTable).values({
    id: userId,
    name: params.email,
    email: params.email,
    emailVerified: true,
    status: "ACTIVE",
  });

  // better-auth stores passwords in the account table with providerId "credential"
  await database.drizzle.insert(accountTable).values({
    id: generateRandomString(32, "a-z", "A-Z", "0-9"),
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashedPassword,
  });

  return { id: userId, email: params.email };
}

async function seed() {
  console.log("Seeding database...");

  const database = Database.create(env.DATABASE_URL);

  try {
    // Reset the database completely
    console.log("Resetting database...");
    await initializeTestDatabase({ database, keepUsers: false });

    // Create user
    console.log(`Creating user: ${SEED_USER.email}`);
    const user = await createSeedUser(database, SEED_USER);
    console.log(`User created with id: ${user.id}`);

    // Create PlaybookStore
    console.log("Initializing PlaybookStore...");
    const playbookStore = await PlaybookStore.create({
      database,
      baseCallbackUrl: "http://localhost:3673",
    });

    // Create playbook
    console.log("Creating playbook: test");
    const playbook = await playbookStore.create({
      id: "test",
      name: "test",
      userId: user.id,
    });
    console.log(`Playbook created with id: ${playbook.id}`);

    // Add hackernews server
    console.log("Adding hackernews server...");
    await playbook.addTarget(HACKERNEWS_SERVER, { throwOnError: false });
    console.log("Hackernews server added.");

    // Close playbook connections
    await playbookStore.closeAll();

    console.log("\n✓ Seed complete!");
  } finally {
    await database.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
