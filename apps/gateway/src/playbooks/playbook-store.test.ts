import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { Database } from "../db/database";
import { env } from "../env";
import {
  createTestUser,
  initializeTestDatabase,
  resetPlaybookStore,
} from "../test/db";
import { makeHTTPTargetConfig } from "../test/fixtures";
import { PlaybookStore } from "./playbook-store";

describe("PlaybookStore", () => {
  let playbookStore: PlaybookStore;
  let database: Database;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    database = Database.create(env.DATABASE_URL);
    await initializeTestDatabase({ database, keepUsers: false });
    testUser = await createTestUser(database);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    await initializeTestDatabase({ database, keepUsers: true });

    playbookStore = await PlaybookStore.create({
      database,
      baseCallbackUrl: "http://localhost:3000/callback",
    });
    await playbookStore.create({
      id: "test-playbook",
      name: "test-playbook",
      userId: testUser.id,
      servers: [],
    });
  });

  describe("onAuthorizationSuccess", () => {
    it("should properly update the targets with the new oauth token", async () => {
      await resetPlaybookStore(playbookStore);
      await initializeTestDatabase({ database, keepUsers: true });
      const playbook = await playbookStore.create({
        id: "test-playbook",
        name: "test-playbook",
        userId: testUser.id,
        servers: [],
      });

      const serverUrl = "https://mcp.notion.com/mcp";
      const target = await playbook.addTarget(
        makeHTTPTargetConfig({ name: "http1", url: serverUrl }),
        { throwOnError: false },
      );

      const fetchedPlaybook = await playbookStore.get(
        "test-playbook",
        testUser.id,
      );
      const httpClient = (await fetchedPlaybook.getTarget(
        "http1",
      )) as HTTPClient;
      httpClient.completeAuthFlow = vi.fn();

      await playbookStore.onAuthorizationSuccess(
        playbook.id,
        target.name,
        "some-code",
        testUser.id,
      );

      expect(httpClient.completeAuthFlow).toHaveBeenCalledWith("some-code");
    });
  });
});
