import { createGatewayClient, register } from "../src/client";
import { Database } from "../src/db/database";
import { BASE_URL, DATABASE_URL, SERVER_PORT } from "../src/env";
import { Gateway } from "../src/gateway";
import { initializeTestDatabase } from "../src/test/db";

const SEED_USER = {
  email: "user@example.com",
  password: "password",
};

const HACKERNEWS_SERVER = {
  name: "hackernews",
  transport: {
    type: "stdio" as const,
    command: "uvx",
    args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
  },
};

async function seed() {
  console.log("Seeding database...");

  const baseUrl = BASE_URL || `http://localhost:${SERVER_PORT}`;

  // Create database connection
  const database = Database.create(DATABASE_URL);

  // Reset the database completely
  console.log("Resetting database...");
  await initializeTestDatabase({ database, keepUsers: false });

  // Start the gateway server
  console.log("Starting gateway server...");
  const gateway = await Gateway.start({
    database,
    baseUrl,
    port: SERVER_PORT,
    oauth: {
      storage: "memory",
      baseCallbackUrl: baseUrl,
    },
  });

  try {
    // Register user via HTTP API
    console.log(`Registering user: ${SEED_USER.email}`);
    const { user, sessionCookie } = await register(baseUrl, SEED_USER);
    console.log(`User created with id: ${user.id}`);

    // Activate user so they can log in
    console.log("Activating user...");
    await database.activateUser(user.id);

    // Create authenticated client
    const client = createGatewayClient(baseUrl, {
      getAuthToken: () => sessionCookie,
    });

    // Create playbook
    console.log("Creating playbook: test");
    const playbook = await client.store.create.mutate({
      name: "test",
    });
    console.log(`Playbook created with id: ${playbook.id}`);

    // Add hackernews server
    console.log("Adding hackernews server...");
    await client.store.addServer.mutate({
      playbookId: playbook.id,
      server: HACKERNEWS_SERVER,
    });
    console.log("Hackernews server added.");

    console.log("\n✓ Seed complete!");
    console.log(`\nYou can now log in with:`);
    console.log(`  Email: ${SEED_USER.email}`);
    console.log(`  Password: ${SEED_USER.password}`);
  } finally {
    // Stop the gateway
    await gateway.stop();
    await database.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
