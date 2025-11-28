import { FakeClient } from "@director.run/client-configurator/test/fake-client";
import type { AbstractClient } from "@director.run/client-configurator/types";
import { joinURL } from "@director.run/utilities/url";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ClientStore } from "../..//client-store";
import { Database } from "../../db/database";
import { env } from "../../env";
import {
  getSSEPathForPlaybook,
  getStreamablePathForPlaybook,
} from "../../helpers";
import { PlaybookStore } from "../../playbooks/playbook-store";
import { createTestUser, initializeTestDatabase } from "../../test/db";
import { createAppRouter } from "./index";

class TestClientStore extends ClientStore {
  private clients: AbstractClient<unknown>[];

  constructor(clients: AbstractClient<unknown>[]) {
    super();
    this.clients = clients;
  }

  public override all(): AbstractClient<unknown>[] {
    return this.clients;
  }

  public override get(name: string): AbstractClient<unknown> {
    const c = this.clients.find((x) => x.name === name);
    if (!c) {
      throw new Error(`Client ${name} is not supported`);
    }
    return c;
  }
}

describe("Client Router", () => {
  let database: Database;
  let playbookStore: PlaybookStore;
  let clientStore: TestClientStore;
  let app: ReturnType<typeof createAppRouter>;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  const BASE_URL = "http://local.test";

  beforeAll(async () => {
    database = Database.create(env.DATABASE_URL);
    await initializeTestDatabase({ database, keepUsers: false });
    testUser = await createTestUser(database);
    playbookStore = await PlaybookStore.create({
      database,
      baseCallbackUrl: BASE_URL,
    });
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(() => {
    clientStore = new TestClientStore([
      new FakeClient({ name: "claude", installables: [] }),
      new FakeClient({ name: "cursor", installables: [] }),
      new FakeClient({ name: "vscode", installables: [] }),
      new FakeClient({ name: "claude-code", installables: [] }),
    ]);

    app = createAppRouter();
  });

  it("allClients returns statuses for all clients", async () => {
    const caller = app.createCaller({
      cliVersion: null,
      playbookStore,
      clientStore,
      userId: testUser.id,
    });

    const result = await caller.clients.allClients();
    expect(result).toHaveLength(4);
    for (const c of result) {
      expect(c).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          installed: true,
          configExists: true,
          configPath: expect.any(String),
          playbooks: expect.any(Array),
        }),
      );
    }
  });

  it("install installs playbook on selected client and restarts if required", async () => {
    const caller = app.createCaller({
      cliVersion: null,
      playbookStore,
      clientStore,
      userId: testUser.id,
    });
    const playbook = await playbookStore.create({
      name: "Test Playbook",
      userId: testUser.id,
    });

    // Spy restart on one client and make install return requiresRestart
    const target = clientStore.get("claude");
    const restartSpy = vi.spyOn(target, "restart").mockResolvedValue();
    const installSpy = vi
      .spyOn(target, "install")
      .mockResolvedValue({ requiresRestart: true });

    await caller.clients.install({
      clientId: "claude",
      playbookId: playbook.id,
      baseUrl: BASE_URL,
    });

    expect(installSpy).toHaveBeenCalledWith({
      name: playbook.id,
      sseURL: joinURL(BASE_URL, getSSEPathForPlaybook(playbook.id)),
      streamableURL: joinURL(
        BASE_URL,
        getStreamablePathForPlaybook(playbook.id),
      ),
    });
    expect(restartSpy).toHaveBeenCalledTimes(1);
  });

  it("uninstall removes playbook from selected client and restarts if required", async () => {
    const caller = app.createCaller({
      cliVersion: null,
      playbookStore,
      clientStore,
      userId: testUser.id,
    });
    const playbook = await playbookStore.create({
      name: "Another Playbook",
      userId: testUser.id,
    });

    const target = clientStore.get("cursor");
    const restartSpy = vi.spyOn(target, "restart").mockResolvedValue();
    const uninstallSpy = vi
      .spyOn(target, "uninstall")
      .mockResolvedValue({ requiresRestart: true });

    await caller.clients.uninstall({
      clientId: "cursor",
      playbookId: playbook.id,
    });

    expect(uninstallSpy).toHaveBeenCalledWith(playbook.id);
    expect(restartSpy).toHaveBeenCalledTimes(1);
  });

  it("resetAll calls reset and restart per client as needed", async () => {
    const caller = app.createCaller({
      cliVersion: null,
      playbookStore,
      clientStore,
      userId: testUser.id,
    });

    const claude = clientStore.get("claude");
    const cursor = clientStore.get("cursor");

    const claudeReset = vi
      .spyOn(claude, "reset")
      .mockResolvedValue({ requiresRestart: true });
    const cursorReset = vi
      .spyOn(cursor, "reset")
      .mockResolvedValue({ requiresRestart: false });
    const claudeRestart = vi.spyOn(claude, "restart").mockResolvedValue();
    const cursorRestart = vi.spyOn(cursor, "restart").mockResolvedValue();

    await caller.clients.resetAll();

    expect(claudeReset).toHaveBeenCalled();
    expect(cursorReset).toHaveBeenCalled();
    expect(claudeRestart).toHaveBeenCalledTimes(1);
    expect(cursorRestart).not.toHaveBeenCalled();
  });

  it("should throw UNAUTHORIZED error when userId is not in context", async () => {
    const caller = app.createCaller({
      cliVersion: null,
      playbookStore,
      clientStore,
      userId: undefined,
    });

    await expect(caller.clients.allClients()).rejects.toThrow("UNAUTHORIZED");
  });
});
