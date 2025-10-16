import { ClientStore } from "@director.run/client-configurator/client-store";
import { FakeClient } from "@director.run/client-configurator/test/fake-client";
import type { AbstractClient } from "@director.run/client-configurator/types";
import { joinURL } from "@director.run/utilities/url";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getSSEPathForProxy, getStreamablePathForProxy } from "../../helpers";
import { makeTestConfig } from "../../test/config";
import { WorkspaceStore } from "../../workspaces/workspace-store";
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
  let workspaceStore: WorkspaceStore;
  let clientStore: TestClientStore;
  let app: ReturnType<typeof createAppRouter>;

  const BASE_URL = "http://local.test";

  beforeAll(async () => {
    const config = await makeTestConfig();
    workspaceStore = await WorkspaceStore.create({
      config,
      oauth: { storage: "memory", baseCallbackUrl: BASE_URL },
    });
  });

  beforeEach(() => {
    // fresh fake clients for each test
    clientStore = new TestClientStore([
      new FakeClient({ name: "claude", installables: [] }),
      new FakeClient({ name: "cursor", installables: [] }),
      new FakeClient({ name: "vscode", installables: [] }),
      new FakeClient({ name: "claude-code", installables: [] }),
    ]);

    app = createAppRouter({ workspaceStore, clientStore });
  });

  it("allClients returns statuses for all clients", async () => {
    const caller = app.createCaller({ cliVersion: null });

    const result = await caller.clients.allClients();
    expect(result).toHaveLength(4);
    for (const c of result) {
      expect(c).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          installed: true,
          configExists: true,
          configPath: expect.any(String),
          workspaces: expect.any(Array),
        }),
      );
    }
  });

  it("install installs workspace on selected client and restarts if required", async () => {
    const caller = app.createCaller({ cliVersion: null });
    const proxy = await workspaceStore.create({ name: "Test Proxy" });

    // Spy restart on one client and make install return requiresRestart
    const target = clientStore.get("claude");
    const restartSpy = vi.spyOn(target, "restart").mockResolvedValue();
    const installSpy = vi
      .spyOn(target, "install")
      .mockResolvedValue({ requiresRestart: true });

    await caller.clients.install({
      clientId: "claude",
      workspaceId: proxy.id,
      baseUrl: BASE_URL,
    });

    expect(installSpy).toHaveBeenCalledWith({
      name: proxy.id,
      sseURL: joinURL(BASE_URL, getSSEPathForProxy(proxy.id)),
      streamableURL: joinURL(BASE_URL, getStreamablePathForProxy(proxy.id)),
    });
    expect(restartSpy).toHaveBeenCalledTimes(1);
  });

  it("uninstall removes workspace from selected client and restarts if required", async () => {
    const caller = app.createCaller({ cliVersion: null });
    const proxy = await workspaceStore.create({ name: "Another Proxy" });

    const target = clientStore.get("cursor");
    const restartSpy = vi.spyOn(target, "restart").mockResolvedValue();
    const uninstallSpy = vi
      .spyOn(target, "uninstall")
      .mockResolvedValue({ requiresRestart: true });

    await caller.clients.uninstall({
      clientId: "cursor",
      workspaceId: proxy.id,
    });

    expect(uninstallSpy).toHaveBeenCalledWith(proxy.id);
    expect(restartSpy).toHaveBeenCalledTimes(1);
  });

  it("resetAll calls reset and restart per client as needed", async () => {
    const caller = app.createCaller({ cliVersion: null });

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
});
