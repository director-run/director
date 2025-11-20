import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  OAuthProviderFactory,
  type OAuthProviderFactoryParams,
} from "@director.run/mcp/oauth/oauth-provider-factory";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { Telemetry } from "@director.run/utilities/telemetry";
import type { PlaybookDbStore } from "../db/playbooks";
import { Playbook, type PlaybookParams, type PlaybookTarget } from "./playbook";

const logger = getLogger("PlaybookStore");

export class PlaybookStore {
  private playbooks: Map<string, Playbook> = new Map();
  private dbStore: PlaybookDbStore;
  private telemetry: Telemetry;
  private _oauth?: OAuthProviderFactoryParams;

  private constructor(params: {
    dbStore: PlaybookDbStore;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
  }) {
    this.dbStore = params.dbStore;
    this.telemetry = params.telemetry || Telemetry.noTelemetry();
    this._oauth = params.oauth;
  }

  public static async create({
    dbStore,
    telemetry,
    oauth,
  }: {
    dbStore: PlaybookDbStore;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
  }): Promise<PlaybookStore> {
    logger.debug("initializing PlaybookStore");
    const store = new PlaybookStore({
      dbStore,
      telemetry,
      oauth,
    });
    await store.initialize();
    logger.debug("initialization complete");
    return store;
  }

  private async initialize(): Promise<void> {
    // Load from database
    const dbStore = this.dbStore;
    const dbPlaybooks = await dbStore.getAllPlaybooks("");
    const playbooks = await Promise.all(
      dbPlaybooks.map(async (dbPlaybook) => {
        const servers = await dbStore.getServers(dbPlaybook.id);
        const prompts = await dbStore.getPrompts(dbPlaybook.id);
        return {
          id: dbPlaybook.id,
          name: dbPlaybook.name,
          description: dbPlaybook.description ?? undefined,
          userId: dbPlaybook.userId,
          servers: servers.map((s) => dbStore.serverRowToTarget(s)),
          prompts: prompts.map((p) => ({
            name: p.name,
            title: p.title,
            description: p.description ?? undefined,
            body: p.body,
          })),
        };
      }),
    );

    for (const playbookConfig of playbooks) {
      const playbookId = playbookConfig.id;
      logger.debug({ message: `initializing ${playbookId}`, playbookId });

      await this.initializeAndAddPlaybook({
        id: playbookId,
        name: playbookConfig.name,
        description: playbookConfig.description ?? undefined,
        userId: playbookConfig.userId,
        servers: playbookConfig.servers,
        prompts: playbookConfig.prompts,
      });
    }
  }

  public get(playbookId: string, userId: string) {
    const server = this.playbooks.get(playbookId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `playbook '${playbookId}' not found or failed to initialize.`,
      );
    }

    // Verify user owns this playbook
    if (server.userId !== userId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        `You do not have permission to access this playbook.`,
      );
    }

    return server;
  }

  public getByIdOnly(playbookId: string) {
    const server = this.playbooks.get(playbookId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `playbook '${playbookId}' not found or failed to initialize.`,
      );
    }

    return server;
  }

  async delete(playbookId: string, userId: string) {
    this.telemetry.trackEvent("playbook_deleted");
    const playbook = this.get(playbookId, userId);
    for (const server of playbook.targets) {
      if (server instanceof HTTPClient && (await server.isAuthenticated())) {
        await server.logout();
      }
    }
    await playbook.close();
    await this.dbStore.deletePlaybook(playbookId, userId);
    this.playbooks.delete(playbookId);

    logger.info(`successfully deleted playbook configuration: ${playbookId}`);
  }

  async purge() {
    await this.closeAll();
    await this.dbStore.deleteAllPlaybooks();
    await this.dbStore.createDummyUser();
    this.playbooks.clear();
  }

  async purgeWithUsers() {
    await this.closeAll();
    await this.dbStore.deleteAllUsers();
    await this.dbStore.createDummyUser();
    this.playbooks.clear();
  }

  async closeAll() {
    logger.info("cleaning up all playbooks...");
    await Promise.all(
      Array.from(this.playbooks.values()).map((playbook) => playbook.close()),
    );
    logger.info("finished cleaning up all playbooks.");
  }

  public getAll(userId: string): Playbook[] {
    return Array.from(this.playbooks.values()).filter(
      (playbook) => playbook.userId === userId,
    );
  }

  public async onAuthorizationSuccess(
    factoryId: string,
    providerId: string,
    code: string,
    userId: string,
  ) {
    const playbook = await this.get(factoryId, userId);
    const target = await playbook.getTarget(providerId);

    if (target instanceof HTTPClient) {
      await target.completeAuthFlow(code);
    } else {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `target ${providerId} is not an HTTP client`,
      );
    }
  }

  public async create({
    id,
    name,
    description,
    servers,
    userId,
  }: {
    id?: string;
    name: string;
    description?: string;
    servers?: PlaybookTarget[];
    userId: string;
  }): Promise<Playbook> {
    this.telemetry.trackEvent("playbook_created");

    const dbPlaybook = await this.dbStore.createPlaybook({
      id,
      name,
      description,
      userId,
    });
    const playbookId = dbPlaybook.id;

    // Create servers
    for (const server of servers ?? []) {
      await this.dbStore.addServer(
        this.dbStore.targetToServerInsertParams(playbookId, server),
      );
    }

    const playbook = await this.initializeAndAddPlaybook({
      name,
      description,
      userId,
      servers: servers ?? [],
      id: playbookId,
    });
    logger.info({
      message: `Created new playbook`,
      playbookId,
      userId,
    });
    return playbook;
  }

  private async initializeAndAddPlaybook(playbookParams: PlaybookParams) {
    const playbook = await Playbook.fromConfig(playbookParams, {
      oAuthHandler: this._oauth
        ? new OAuthProviderFactory({
            ...this._oauth,
            id: playbookParams.id,
          })
        : undefined,
      dbStore: this.dbStore,
    });

    this.playbooks.set(playbook.id, playbook);

    return playbook;
  }
}
