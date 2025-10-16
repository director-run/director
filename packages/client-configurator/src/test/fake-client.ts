import { AppError, ErrorCode } from "@director.run/utilities/error";
import {
  AbstractClient,
  type Installable,
  type InstallerResult,
} from "../types";

type InMemoryEntry = {
  name: string;
  sseURL: string;
  streamableURL: string;
};

export class FakeClient extends AbstractClient<Record<string, InMemoryEntry>> {
  private store: Map<string, InMemoryEntry> = new Map();

  public constructor(params: { name: string; installables?: Installable[] }) {
    super({ configPath: "in-memory://config", name: params.name });
    for (const entry of params.installables ?? []) {
      this.store.set(entry.name, {
        name: entry.name,
        sseURL: entry.sseURL,
        streamableURL: entry.streamableURL,
      });
    }
    this.isInitialized = true;
    this.config = {};
  }

  // Avoid filesystem access; treat as always present with an initialized config
  protected async initialize() {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    this.config = {};
    await Promise.resolve();
  }

  public isClientPresent(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public isClientConfigPresent(): Promise<boolean> {
    return Promise.resolve(true);
  }

  protected createConfig(): Promise<void> {
    return Promise.resolve();
  }

  public getCapabilities() {
    return {
      requiresRestartOnInstallOrUninstall: false,
      requiresRestartOnUpdate: false,
      programaticRestartSupported: false,
    };
  }

  public isInstalled(name: string): Promise<boolean> {
    return Promise.resolve(this.store.has(name));
  }

  public async install(
    attributes: Installable | Array<Installable>,
  ): Promise<InstallerResult> {
    if (Array.isArray(attributes)) {
      for (const entry of attributes) {
        await this.install(entry);
      }
      return { requiresRestart: false };
    }

    if (await this.isInstalled(attributes.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${attributes.name}' is already installed`,
      );
    }

    this.store.set(attributes.name, {
      name: attributes.name,
      sseURL: attributes.sseURL,
      streamableURL: attributes.streamableURL,
    });

    return { requiresRestart: false };
  }

  public async uninstall(
    name: string | Array<string>,
  ): Promise<InstallerResult> {
    if (Array.isArray(name)) {
      for (const n of name) {
        await this.uninstall(n);
      }
      return { requiresRestart: false };
    }

    if (!(await this.isInstalled(name))) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${name}' is not installed`,
      );
    }

    this.store.delete(name);
    return { requiresRestart: false };
  }

  public list(): Promise<Array<{ name: string; url: string }>> {
    return Promise.resolve(
      Array.from(this.store.values()).map((entry) => ({
        name: entry.name,
        url: entry.streamableURL,
      })),
    );
  }

  public openConfig(): Promise<void> {
    return Promise.resolve();
  }

  public restart(): Promise<void> {
    return Promise.resolve();
  }

  public reset(): Promise<InstallerResult> {
    const hadEntries = this.store.size > 0;
    this.store.clear();
    return Promise.resolve({ requiresRestart: false && hadEntries });
  }
}
